   using Dev2ndBrain.Services;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;

builder.Services.AddControllers();

builder.Services.AddHttpClient<GitHubService>();
builder.Services.AddSingleton<GitHubService>();

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
}

app.UseRouting();

app.UseCors("Dev2ndBrainFrontend");

app.UseAuthorization();

app.MapControllers();

app.Run();