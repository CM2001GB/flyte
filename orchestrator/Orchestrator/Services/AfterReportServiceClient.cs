using System.Text;
using System.Text.Json;

namespace Orchestrator.Services;

public class AfterReportServiceClient
{
    private readonly HttpClient _client;
    private readonly ILogger<AfterReportServiceClient> _logger;

    public AfterReportServiceClient(IHttpClientFactory httpClientFactory,
        ILogger<AfterReportServiceClient> logger)
    {
        _client = httpClientFactory.CreateClient("AfterReportService");
        _logger = logger;
    }

    // calls POST /reports to create a report from flight data.
    public async Task<JsonElement> CreateReportAsync(JsonElement payload)
    {
        _logger.LogInformation("Calling AfterReportService: POST /reports");

        var content = new StringContent(
            payload.GetRawText(),
            Encoding.UTF8,
            "application/json"
        );

        var response = await _client.PostAsync("/reports", content);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<JsonElement>(json);
    }
}