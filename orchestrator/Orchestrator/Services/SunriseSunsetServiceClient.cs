using System.Text.Json;
using Orchestrator.Models;

namespace Orchestrator.Services;

public class SunriseSunsetServiceClient
{
    private readonly HttpClient _client;
    private readonly ILogger<SunriseSunsetServiceClient> _logger;

    public SunriseSunsetServiceClient(IHttpClientFactory httpClientFactory,
        ILogger<SunriseSunsetServiceClient> logger)
    {
        _client = httpClientFactory.CreateClient("SunriseSunsetService");
        _logger = logger;
    }

    /// calls GET /sunrise-sunset and returns the standardised verdict.
    public async Task<ServiceVerdict> EvaluateAsync(double lat, double lon, string flightDateTime)
    {
        var url = $"/sunrise-sunset?lat={lat}&lon={lon}&datetime={flightDateTime}";
        _logger.LogInformation("Calling SunriseSunsetService: {Url}", url);

        var response = await _client.GetAsync(url);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<ServiceVerdict>(json)
            ?? new ServiceVerdict { Verdict = "unknown" };
    }
}