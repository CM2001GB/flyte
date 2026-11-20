using System.Text;
using System.Text.Json;

namespace Orchestrator.Services;

public class FlightSessionServiceClient
{
    private readonly HttpClient _client;
    private readonly ILogger<FlightSessionServiceClient> _logger;

    public FlightSessionServiceClient(IHttpClientFactory httpClientFactory,
        ILogger<FlightSessionServiceClient> logger)
    {
        _client = httpClientFactory.CreateClient("FlightSessionService");
        _logger = logger;
    }

    // calls POST /flights to create a flight session record.
    public async Task<JsonElement> CreateFlightAsync(JsonElement payload)
    {
        _logger.LogInformation("Calling FlightSessionService: POST /flights");

        var content = new StringContent(
            payload.GetRawText(),
            Encoding.UTF8,
            "application/json"
        );

        var response = await _client.PostAsync("/flights", content);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<JsonElement>(json);
    }
}