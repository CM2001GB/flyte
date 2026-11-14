using System.Text;
// we will reactivate this later for user auth when we have User System
 // using ApiGateway.Services; 
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Ocelot.DependencyInjection;
using Ocelot.Middleware;

var builder = WebApplication.CreateBuilder(args);

// load ocelot routing configuration
builder.Configuration.AddJsonFile(
    "ocelot.json",
    optional: false,
    reloadOnChange: true
);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS - allow browser client
builder.Services.AddCors(options => 
{
    options.AddPolicy("AllowClient", policy => 
    {
        policy.WithOrigins(
            "http://localhost:5500",
            "http://127.0.0.1:5500",
            "http://localhost:8080",
            "http://127.0.0.1:8080"          
        )
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

// register ocelot
builder.Services.AddOcelot(builder.Configuration);

var app = builder.Build();

app.UseCors("AllowClient");

app.UseSwagger();
app.UseSwaggerUI();

app.MapControllers();

await app.UseOcelot();
await app.RunAsync();