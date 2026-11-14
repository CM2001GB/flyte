using Microsoft.AspNetCore.Mvc;
using Orchestrator.Services;

namespace Orchestrator.Controllers;

[ApiController]
[Route("orchestrator/flight")]
public class FlightController : ControllerBase
{
    private readonly NotamServiceClient _notamClient;
    private readonly WeatherServiceClient _weatherClient;

    public FlightController(NotamServiceClient notamClient,
        WeatherServiceClient weatherClient)
    {
        _notamClient = notamClient;
        _weatherClient = weatherClient;
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

        await Task.WhenAll(notamTask, weatherTask);

        var notamVerdict = await notamTask;
        var weatherVerdict = await weatherTask;

        // overall: if ANY service says fail, do not fly
        var canFly = notamVerdict.Verdict == "pass"
                  && weatherVerdict.Verdict == "pass";

        return Ok(new
        {
            can_fly = canFly,
            summary = canFly
                ? "All checks passed. Safe to fly."
                : "One or more checks failed. Do not fly.",
            services = new
            {
                notam = notamVerdict,
                weather = weatherVerdict
                // add sunrise_sunset here later
            },
            assessed_at = DateTime.UtcNow.ToString("o")
        });
    }
}