// using Dev2ndBrain.Data;
// using Dev2ndBrain.Repositories;
// using Dev2ndBrain.Services;
// using Microsoft.AspNetCore.Builder;
// using Microsoft.EntityFrameworkCore;
// using Microsoft.Extensions.FileProviders;
// using System.IO;

// var builder = WebApplication.CreateBuilder(args);
// var configuration = builder.Configuration;

// builder.Services.AddControllers();
// builder.Services.AddHttpClient();
// builder.Services.AddDbContext<AppDbContext>(options =>
//     options.UseSqlite(configuration.GetConnectionString("DefaultConnection")));
// builder.Services.AddHttpClient<GitHubService>();
// builder.Services.AddSingleton<GitHubService>();
// builder.Services.AddScoped<SyncRepository>();
// builder.Services.AddScoped<SyncService>();

// var frontendOrigin = configuration["FrontendOrigin"];
// if (string.IsNullOrEmpty(frontendOrigin))
// {
//     throw new InvalidOperationException("FrontendOrigin is not configured in appsettings.json");
// }
// builder.Services.AddCors(options =>
// {
//     options.AddPolicy("Dev2ndBrainFrontend", policy =>
//     {
//         policy.WithOrigins(frontendOrigin).AllowAnyHeader().AllowAnyMethod();
//     });
// });

// var app = builder.Build();

// if (app.Environment.IsDevelopment())
// {
//     using (var scope = app.Services.CreateScope())
//     {
//         var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
//         dbContext.Database.Migrate();
//     }
// }

// app.UseHttpsRedirection();

// app.UseStaticFiles(new StaticFileOptions
// {
//     FileProvider = new PhysicalFileProvider(
//         Path.Combine(builder.Environment.ContentRootPath, "../frontend/dist")
//     )
// });

// app.UseRouting();
// app.UseCors("Dev2ndBrainFrontend");
// app.UseAuthorization();
// app.MapControllers();

// app.MapFallbackToFile("index.html", new StaticFileOptions
// {
//     FileProvider = new PhysicalFileProvider(
//         Path.Combine(builder.Environment.ContentRootPath, "../frontend/dist")
//     )
// });

// app.Run();

using Dev2ndBrain.Data;
using Dev2ndBrain.Repositories;
using Dev2ndBrain.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using System.IO;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;

// --- Services Configuration ---
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
});
builder.Services.AddHttpClient();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddHttpClient<GitHubService>();
builder.Services.AddSingleton<GitHubService>();
builder.Services.AddScoped<SyncRepository>();
builder.Services.AddScoped<SyncService>();

// --- CORS Configuration (Required for your Docker setup) ---
var frontendOrigin = configuration["FrontendOrigin"];
if (string.IsNullOrEmpty(frontendOrigin))
{
    throw new InvalidOperationException("FrontendOrigin is not configured in appsettings.json. For Docker, it should be set in docker-compose.yaml.");
}
builder.Services.AddCors(options =>
{
    options.AddPolicy("Dev2ndBrainFrontend", policy =>
    {
        policy.WithOrigins(frontendOrigin).AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();

// --- Middleware Pipeline ---
if (app.Environment.IsDevelopment())
{
    //Do nothing for now
}

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbContext.Database.Migrate();
}

app.UseHttpsRedirection();

// This variable will be set by the Electron process
var isSelfHosted = builder.Configuration.GetValue<bool>("IsSelfHosted");

// Only serve static files if running in self-hosted (Electron) mode
if (isSelfHosted)
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(
            Path.Combine(builder.Environment.ContentRootPath, "../frontend")
        )
    });
}

app.UseRouting();
app.UseCors("Dev2ndBrainFrontend");
app.UseAuthorization();
app.MapControllers();

// Only add the SPA fallback if running in self-hosted (Electron) mode
if (isSelfHosted)
{
    app.MapFallbackToFile("index.html", new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(
            Path.Combine(builder.Environment.ContentRootPath, "../frontend")
        )
    });
}

app.Run();