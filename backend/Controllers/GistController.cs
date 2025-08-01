using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Dev2ndBrain.Services;
using Octokit; // You might need to add this using statement

// Define a simple model for the request body
public class CreateGistRequest
{
    public string Description { get; set; }
    public string Filename { get; set; }
    public string Content { get; set; }
    public bool IsPublic { get; set; }
    public string AccessToken { get; set; } // The frontend will send the token
}

[ApiController]
[Route("api/[controller]")]
public class GistController : ControllerBase
{
    private readonly GitHubService _githubService;

    public GistController(GitHubService githubService)
    {
        _githubService = githubService;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateGistRequest request)
    {
        if (request == null || string.IsNullOrEmpty(request.AccessToken))
        {
            return BadRequest("Access token is required.");
        }

        var newGist = await _githubService.CreateGistAsync(
            request.AccessToken,
            request.Description,
            request.Filename,
            request.Content,
            request.IsPublic);

        return Ok(new { GistId = newGist.Id, GistUrl = newGist.HtmlUrl });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromHeader(Name = "Authorization")] string authorizationHeader)
    {
        if (string.IsNullOrEmpty(authorizationHeader) || !authorizationHeader.StartsWith("Bearer "))
        {
            return Unauthorized();
        }

        var accessToken = authorizationHeader.Substring("Bearer ".Length).Trim();
        var gists = await _githubService.GetUserGistsAsync(accessToken);

        // We only return the fields our frontend needs
        var result = gists.Select(g => new
        {
            Id = g.Id,
            Description = g.Description,
            Files = g.Files.ToDictionary(f => f.Key, f => new { f.Value.Filename, f.Value.Language, f.Value.Content })
        }).ToList();

        return Ok(result);
    }
}