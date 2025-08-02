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
        public bool IsMultiStep { get; set; } 
    }
    
    public class MultiStepAiRequest
    {
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
        
        [HttpPost("action-plan")]
        public async Task<IActionResult> GetActionPlan([FromBody] MultiStepAiRequest request)
        {
            var apiKey = _configuration["Gemini:ApiKey"];
            if (string.IsNullOrEmpty(apiKey))
            {
                return StatusCode(500, new { message = "AI service is not configured." });
            }

            var client = _httpClientFactory.CreateClient();
            var apiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key={apiKey}";

            var actionItemsPrompt = $"Please extract and list all potential action items or to-do tasks from the following note. Format the response as a simple markdown bulleted list.\n\n---\n{request.Content}\n---";
            var actionItemsPayload = new { contents = new[] { new { parts = new[] { new { text = actionItemsPrompt } } } } };
            var actionItemsResponse = await client.PostAsync(apiUrl, new StringContent(JsonSerializer.Serialize(actionItemsPayload), Encoding.UTF8, "application/json"));
            
            if (!actionItemsResponse.IsSuccessStatusCode)
            {
                return StatusCode((int)actionItemsResponse.StatusCode, new { message = "Error getting action items from AI." });
            }

            var actionItemsBody = await actionItemsResponse.Content.ReadAsStringAsync();
            var actionItemsJson = JsonNode.Parse(actionItemsBody);
            var actionItemsText = actionItemsJson?["candidates"]?[0]?["content"]?["parts"]?[0]?["text"]?.GetValue<string>();

            if (string.IsNullOrEmpty(actionItemsText))
            {
                return Ok(new { completion = "No action items found by AI." });
            }

            var actionItems = actionItemsText.Split('\n', StringSplitOptions.RemoveEmptyEntries)
                                             .Where(line => line.Trim().StartsWith("*"))
                                             .Select(line => line.Trim().Substring(1).Trim())
                                             .ToList();

            var combinedResponse = new StringBuilder();

            foreach (var item in actionItems)
            {
                var actionPrompt = $"Please elaborate on this action item to provide a clear, actionable plan: '{item}'. Provide a step-by-step guide.";
                var actionPayload = new { contents = new[] { new { parts = new[] { new { text = actionPrompt } } } } };
                var actionResponse = await client.PostAsync(apiUrl, new StringContent(JsonSerializer.Serialize(actionPayload), Encoding.UTF8, "application/json"));

                var actionBody = await actionResponse.Content.ReadAsStringAsync();
                var actionJson = JsonNode.Parse(actionBody);
                var actionText = actionJson?["candidates"]?[0]?["content"]?["parts"]?[0]?["text"]?.GetValue<string>()?.Trim();

                if (!string.IsNullOrEmpty(actionText))
                {
                    combinedResponse.AppendLine($"\n\n---");
                    combinedResponse.AppendLine($"**Action Item: {item}**");
                    combinedResponse.AppendLine(actionText);
                }
            }

            return Ok(new { completion = combinedResponse.ToString() });
        }
    }
}