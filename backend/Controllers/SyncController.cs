using Dev2ndBrain.Models;
using Dev2ndBrain.Services;
using Microsoft.AspNetCore.Mvc;
using Octokit;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System;

namespace Dev2ndBrain.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SyncController : ControllerBase
    {
        private readonly ILogger<SyncController> _logger;
        private readonly GitHubService _githubService;
        private readonly SyncService _syncService;

        public SyncController(ILogger<SyncController> logger, GitHubService githubService, SyncService syncService)
        {
            _logger = logger;
            _githubService = githubService;
            _syncService = syncService;
        }

        [HttpPost("push")]
        public async Task<IActionResult> PushData([FromBody] SyncPayload payload, [FromHeader(Name = "Authorization")] string authorizationHeader)
        {
            if (string.IsNullOrEmpty(authorizationHeader) || !authorizationHeader.StartsWith("Bearer "))
            {
                return Unauthorized("Authorization header is missing or invalid.");
            }

            var accessToken = authorizationHeader.Substring("Bearer ".Length).Trim();
            if (string.IsNullOrEmpty(accessToken))
            {
                return Unauthorized("Bearer token is missing.");
            }

            try
            {
                var client = new GitHubClient(new ProductHeaderValue("Dev2ndBrain"))
                {
                    Credentials = new Credentials(accessToken)
                };
                var user = await client.User.Current();

                _logger.LogInformation("Received sync payload from user: {UserLogin}", user.Login);

                await _syncService.Push(payload, user.Id);

                return Ok(new { Message = $"Sync data for user '{user.Login}' received and saved successfully." });
            }
            catch (AuthorizationException)
            {
                _logger.LogWarning("Invalid GitHub token received for sync attempt.");
                return Unauthorized("Invalid GitHub token.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred during data sync.");
                return StatusCode(500, "An internal server error occurred while processing the sync request.");
            }
        }

        [HttpGet("pull")]
        public async Task<IActionResult> PullData([FromHeader(Name = "Authorization")] string authorizationHeader)
        {
            if (string.IsNullOrEmpty(authorizationHeader) || !authorizationHeader.StartsWith("Bearer "))
            {
                return Unauthorized("Authorization header is missing or invalid.");
            }

            var accessToken = authorizationHeader.Substring("Bearer ".Length).Trim();
            if (string.IsNullOrEmpty(accessToken))
            {
                return Unauthorized("Bearer token is missing.");
            }

            try
            {
                var client = new GitHubClient(new ProductHeaderValue("Dev2ndBrain"))
                {
                    Credentials = new Credentials(accessToken)
                };
                var user = await client.User.Current();

                _logger.LogInformation("Attempting to pull data for user: {UserLogin}", user.Login);
                var payload = await _syncService.Pull(user.Id);

                return Ok(payload);
            }
            catch (AuthorizationException)
            {
                _logger.LogWarning("Invalid GitHub token received for pull attempt.");
                return Unauthorized("Invalid GitHub token.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred during data pull.");
                return StatusCode(500, "An internal server error occurred while processing the pull request.");
            }
        }
    }
}