using System.Text.Json.Serialization;

namespace Orchestrator.Models;

public class ServiceVerdict
{
    [JsonPropertyName("verdict")]
    public string Verdict { get; set; } = "unknown";

    [JsonPropertyName("breached_conditions")]
    public List<string> BreachedConditions { get; set; } = new();

    [JsonPropertyName("uas_exemptions")]
    public List<string>? UasExemptions { get; set; }

    [JsonPropertyName("notams")]
    public List<NotamDetail>? Notams { get; set; }
}

public class NotamDetail
{
    [JsonPropertyName("notam_id")]
    public string? NotamId { get; set; }

    // may or may not activate this, it's really long but also informative
    // [JsonPropertyName("description")]
    // public string? Description { get; set; }

    [JsonPropertyName("label")]
    public string? Label { get; set; }

    [JsonPropertyName("level")]
    public string? Level { get; set; }

    [JsonPropertyName("distance_km")]
    public double? DistanceKm { get; set; }
}

public class WeatherDetail 
{

}

public class SunriseSunsetDetail 
{
    
}