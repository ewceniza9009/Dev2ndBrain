using Dev2ndBrain.Data;
using Dev2ndBrain.Repositories;
using Dev2ndBrain.Services;
using Microsoft.EntityFrameworkCore;
using System;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;

builder.Services.AddControllers();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddHttpClient<GitHubService>();
builder.Services.AddSingleton<GitHubService>();
builder.Services.AddScoped<SyncRepository>();
builder.Services.AddScoped<SyncService>();

var frontendOrigin = configuration["FrontendOrigin"];
if (string.IsNullOrEmpty(frontendOrigin))
{
    throw new InvalidOperationException("FrontendOrigin is not configured in appsettings.json");
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("Dev2ndBrainFrontend", policy =>
    {
        policy.WithOrigins(frontendOrigin)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    using (var scope = app.Services.CreateScope())
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        dbContext.Database.Migrate();       
    }
}

app.UseRouting();
app.UseCors("Dev2ndBrainFrontend");
app.UseAuthorization();
app.MapControllers();
app.Run();