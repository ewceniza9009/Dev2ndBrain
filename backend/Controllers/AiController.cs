using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace Dev2ndBrain.Controllers
{
    public class AiRequest
    {
        public string Prompt { get; set; }
        public string Content { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class AiController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;

        public AiController(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
        }

        [HttpPost("prompt")]
        public async Task<IActionResult> GetCompletion([FromBody] AiRequest request)
        {
            var apiKey = _configuration["Gemini:ApiKey"];
            if (string.IsNullOrEmpty(apiKey))
            {
                return StatusCode(500, new { message = "AI service is not configured." });
            }

            var fullPrompt = $"{request.Prompt}:\n\n---\n{request.Content}\n---";
            var client = _httpClientFactory.CreateClient();
            var apiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={apiKey}";

            var payload = new
            {
                contents = new[]
                {
                    new { parts = new[] { new { text = fullPrompt } } }
                }
            };

            var jsonPayload = JsonSerializer.Serialize(payload);
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

            try
            {
                var response = await client.PostAsync(apiUrl, content);
                var responseBody = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    return StatusCode((int)response.StatusCode, new { message = $"Error from AI service: {responseBody}" });
                }

                // Parse the response to extract the text content
                var jsonResponse = JsonNode.Parse(responseBody);
                var textContent = jsonResponse?["candidates"]?[0]?["content"]?["parts"]?[0]?["text"]?.GetValue<string>();

                if (string.IsNullOrEmpty(textContent))
                {
                    return Ok(new { completion = "No response from AI." });
                }

                return Ok(new { completion = textContent });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"An internal error occurred: {ex.Message}" });
            }
        }
    }
}