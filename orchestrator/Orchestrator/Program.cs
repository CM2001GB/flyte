using Orchestrator.Services;

var builder = WebApplication.CreateBuilder(args);

// register HttpClient for calling downsteam services
builder.Services.AddHttpClient("NotamService", client =>
{
    client.BaseAddress = new Uri(
        builder.Configuration["NotamService:BaseUrl"] ?? "http://localhost:3000");
    client.Timeout = TimeSpan.FromSeconds(15);
});

builder.Services.AddHttpClient("WeatherService", client => {
    client.BaseAddress = new Uri(
        builder.Configuration["WeatherService:BaseUrl"] ?? "http://localhost:8001");
    client.Timeout = TimeSpan.FromSeconds(15);
});

builder.Services.AddHttpClient("FlightSessionService", client => {
    client.BaseAddress = new Uri(
        builder.Configuration["FlightSessionService:BaseUrl"] ??
        "http://localhost:8010");
        client.Timeout = TimeSpan.FromSeconds(15); 
});

builder.Services.AddHttpClient("AfterReportService", client => {
    client.BaseAddress = new Uri(
        builder.Configuration["AfterReportService:BaseUrl"] ?? "http://localhost:8011");
    client.Timeout = TimeSpan.FromSeconds(15);
});

builder.Services.AddHttpClient("SunriseSunsetService", client =>
{
    client.BaseAddress = new Uri(
        builder.Configuration["SunriseSunsetService:BaseUrl"] ?? "http://localhost:8005");
    client.Timeout = TimeSpan.FromSeconds(15);
});

// register typed service clients
builder.Services.AddTransient<NotamServiceClient>();
builder.Services.AddTransient<WeatherServiceClient>();
builder.Services.AddTransient<FlightSessionServiceClient>();
builder.Services.AddTransient<AfterReportServiceClient>();
builder.Services.AddTransient<SunriseSunsetServiceClient>();

builder.Services.AddControllers();

var app = builder.Build();

app.MapControllers();

var url = builder.Configuration["ASPNETCORE_URLS"] ?? "http://localhost:3002";
Console.WriteLine($"Orchestrator running on {url}.");
app.Run();