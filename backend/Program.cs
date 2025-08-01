using Dev2ndBrain.Services;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddHttpClient<GitHubService>();
builder.Services.AddSingleton<GitHubService>();

// CORS Configuration
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

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    // No Swagger as requested
}

app.UseHttpsRedirection();
app.UseRouting();

// Use CORS policy
app.UseCors("Dev2ndBrainFrontend");

app.UseAuthorization();

app.MapControllers();

app.Run();