using System.Text.Json.Serialization;

namespace Orchestrator.Models;

public class ServiceVerdict
{
    [JsonPropertyName("verdict")]
    public string Verdict { get; set; } = "unknown";

    [JsonPropertyName("breached_conditions")]
    public List<string> BreachedConditions { get; set; } = new();
}