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

// we will implement other services here like the notam service above
// e.g. builder.Services.AddHttpClient("WeatherService", client => {...});
// e.g. builder.Services.AddHttpClient("SunriseSunsetService", client => {...});

// register typed service clients
builder.Services.AddTransient<NotamServiceClient>();
builder.Services.AddTransient<WeatherServiceClient>();

builder.Services.AddControllers();

var app = builder.Build();

app.MapControllers();

Console.WriteLine("Orchestrator running on http://localhost:3002.");
app.Run("http://localhost:3002");