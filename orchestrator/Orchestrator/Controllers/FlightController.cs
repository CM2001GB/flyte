using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Orchestrator.Services;

namespace Orchestrator.Controllers;

[ApiController]
[Route("orchestrator/flight")]
public class FlightController : ControllerBase
{
    private readonly NotamServiceClient _notamClient;
    private readonly WeatherServiceClient _weatherClient;
    private readonly FlightSessionServiceClient _flightClient;
    private readonly AfterReportServiceClient _reportClient;
    private readonly SunriseSunsetServiceClient _sunClient;

    public FlightController(NotamServiceClient notamClient,
        WeatherServiceClient weatherClient,
        FlightSessionServiceClient flightClient,
        AfterReportServiceClient reportClient,
        SunriseSunsetServiceClient sunClient)
    {
        _notamClient = notamClient;
        _weatherClient = weatherClient;
        _flightClient = flightClient;
        _reportClient = reportClient;
        _sunClient = sunClient;
    }

    // GET /orchestrator/flight/assess?lat=...&lon=...&radius=...&datetime=...
    [HttpGet("assess")]
    public async Task<IActionResult> Assess(
        [FromQuery] double lat,
        [FromQuery] double lon,
        [FromQuery] double radius = 5,
        [FromQuery] string? datetime = null)
    {
        var flightDatetime = datetime ?? DateTime.UtcNow.ToString("o");

        // refresh notams, repopulates DB.
        await _notamClient.RefreshNotamsAsync();
        // calls services in parallel
        var notamTask = _notamClient.EvaluateAsync(lat, lon, radius);
        var weatherTask = _weatherClient.EvaluateAsync(lat, lon, flightDatetime);
        var sunTask = _sunClient.EvaluateAsync(lat, lon, flightDatetime);

        await Task.WhenAll(notamTask, weatherTask, sunTask);

        var notamVerdict = await notamTask;
        var weatherVerdict = await weatherTask;
        var sunVerdict = await sunTask;

        // overall: if ANY service says fail, do not fly
        var canFly = notamVerdict.Verdict == "pass"
                  && weatherVerdict.Verdict == "pass"
                  && sunVerdict.Verdict == "pass";

        return Ok(new
        {
            can_fly = canFly,
            summary = canFly
                ? "All checks passed. Safe to fly."
                : "One or more checks failed. Do not fly.",
            services = new
            {
                notam = notamVerdict,
                weather = weatherVerdict,
                sunrise_sunset = sunVerdict
            },
            assessed_at = DateTime.UtcNow.ToString("o")
        });
    }

    // POST /orchestrator/flight/submit
    // orchestrates: creates flight in flight-session service,
    // then creates a report in the after-report service.
    [HttpPost("submit")]
    public async Task<IActionResult> Submit([FromBody] JsonElement body)
    {
        // create the flight in the flight session service
        JsonElement flightData;
        try
        {
            flightData = await _flightClient.CreateFlightAsync(body);
        }
        catch (HttpRequestException ex)
        {
            return StatusCode(502, new { error = "Flight service error: " + ex.Message });
        }

        // build the report payload using the returned flight_id
        var flightId = flightData.GetProperty("flight_id").GetString();

        var reportPayload = JsonSerializer.SerializeToElement(new
        {
            flightId = flightId,
            flyerId = body.GetProperty("flyerId").GetString(),
            location = body.GetProperty("location").GetString(),
            date = body.GetProperty("date").GetString(),
            startTime = body.TryGetProperty("startTime", out var st) ? st.GetString() : null,
            endTime = body.TryGetProperty("endTime", out var et) ? et.GetString() : null,
            droneModel = body.TryGetProperty("droneModel", out var dm) ? dm.GetString() : null,
            flightNotes = body.TryGetProperty("flightNotes", out var fn) ? fn.GetString() : null,
            status = body.TryGetProperty("status", out var s) ? s.GetString() : "pending"
        });

        // create the report in the after-report service
        try
        {
            await _reportClient.CreateReportAsync(reportPayload);
        }
        catch (HttpRequestException ex)
        {
            // flight was created but report failed - log it, don't fail the whole request
            Console.WriteLine("[Orchestrator] Report creation failed: " + ex.Message);
        }

        return StatusCode(201, flightData);
    }
}