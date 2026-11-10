using System.Text.Json;
using Orchestrator.Models;

namespace Orchestrator.Services;

public class WeatherServiceClient
{
    private readonly HttpClient _client;
    private readonly ILogger<WeatherServiceClient> _logger;

    public WeatherServiceClient(IHttpClientFactory httpClientFactory,
        ILogger<WeatherServiceClient> logger)
    {
        _client = httpClientFactory.CreateClient("WeatherService");
        _logger = logger;
    }

    /// Calls GET /weather — returns the standardised verdict.
    public async Task<ServiceVerdict> EvaluateAsync(double lat, double lon, string datetime)
    {
        var url = $"/weather?lat={lat}&lon={lon}&datetime={datetime}";
        _logger.LogInformation("Calling WeatherService: {Url}", url);

        var response = await _client.GetAsync(url);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<ServiceVerdict>(json)
            ?? new ServiceVerdict { Verdict = "unknown" };
    }
}