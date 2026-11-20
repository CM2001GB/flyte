using System.Text.Json;
using Orchestrator.Models;

namespace Orchestrator.Services;

public class NotamServiceClient
{
    private readonly HttpClient _client;
    private readonly ILogger<NotamServiceClient> _logger;

    public NotamServiceClient(IHttpClientFactory httpClientFactory,
        ILogger<NotamServiceClient> logger)
    {
        _client = httpClientFactory.CreateClient("NotamService");
        _logger = logger;
    }

    // calls GET /notams and refreshes the DB with the most recent data
    public async Task RefreshNotamsAsync() 
    {
        _logger.LogInformation("Refreshing NOTAM database.");
        var response = await _client.GetAsync("/notams/refresh");
        response.EnsureSuccessStatusCode();
    }

    /// calls GET /notams/evaluate and returns the standardised verdict.
    public async Task<ServiceVerdict> EvaluateAsync(double lat, double lon, double radius)
    {
        var url = $"/notams/evaluate?lat={lat}&lon={lon}&radius={radius}";
        _logger.LogInformation("Calling NotamService: {Url}", url);

        var response = await _client.GetAsync(url);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<ServiceVerdict>(json)
            ?? new ServiceVerdict { Verdict = "unknown" };
    }
}