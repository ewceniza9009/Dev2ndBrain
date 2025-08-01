using Microsoft.AspNetCore.Mvc;
using Dev2ndBrain.Models;
using Dev2ndBrain.Services;

namespace Dev2ndBrain.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GitHubController : ControllerBase
    {
        private readonly GitHubService _githubService;

        public GitHubController(GitHubService githubService)
        {
            _githubService = githubService;
        }

        [HttpPost("exchange-token")]
        public async Task<IActionResult> ExchangeToken([FromBody] GitHubTokenRequest tokenRequest)
        {
            if (tokenRequest == null || string.IsNullOrWhiteSpace(tokenRequest.Code))
            {
                return BadRequest("Authorization code is required.");
            }

            var (accessToken, user) = await _githubService.ExchangeCodeForTokenAndUserAsync(tokenRequest.Code);

            if (accessToken == null || user == null)
            {
                return Unauthorized("Failed to exchange code for an access token or fetch user info.");
            }

            return Ok(new { AccessToken = accessToken, User = user });
        }
    }
}