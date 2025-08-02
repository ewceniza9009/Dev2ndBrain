using Microsoft.AspNetCore.Mvc;
using Dev2ndBrain.Services;
using Octokit;
using System.Threading.Tasks;

// Models no longer need the AccessToken property
public class CreateGistRequest
{
    public string Description { get; set; }
    public string Filename { get; set; }
    public string Content { get; set; }
    public bool IsPublic { get; set; }
}

public class UpdateGistRequest
{
    public string GistId { get; set; }
    public string Description { get; set; }
    public string Filename { get; set; }
    public string Content { get; set; }
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

    // This method is now updated to get the token from the header
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateGistRequest request, [FromHeader(Name = "Authorization")] string authorizationHeader)
    {
        if (string.IsNullOrEmpty(authorizationHeader) || !authorizationHeader.StartsWith("Bearer "))
        {
            return Unauthorized("Authorization header is missing or invalid.");
        }
        var accessToken = authorizationHeader.Substring("Bearer ".Length).Trim();

        var newGist = await _githubService.CreateGistAsync(
            accessToken,
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

        var result = gists.Select(g => new
        {
            g.Id,
            g.Description,
            Files = g.Files.ToDictionary(f => f.Key, f => new { f.Value.Filename, f.Value.Language, f.Value.Content })
        }).ToList();

        return Ok(result);
    }

    [HttpGet("{gistId}")]
    public async Task<IActionResult> GetById(string gistId, [FromHeader(Name = "Authorization")] string authorizationHeader)
    {
        if (string.IsNullOrEmpty(authorizationHeader) || !authorizationHeader.StartsWith("Bearer "))
        {
            return Unauthorized();
        }
        var accessToken = authorizationHeader.Substring("Bearer ".Length).Trim();

        try
        {
            var gist = await _githubService.GetGistByIdAsync(accessToken, gistId);
            return Ok(gist);
        }
        catch (NotFoundException)
        {
            return NotFound();
        }
    }
    // This method is now updated to get the token from the header
    [HttpPatch]
    public async Task<IActionResult> Update([FromBody] UpdateGistRequest request, [FromHeader(Name = "Authorization")] string authorizationHeader)
    {
        if (string.IsNullOrEmpty(authorizationHeader) || !authorizationHeader.StartsWith("Bearer "))
        {
            return Unauthorized("Authorization header is missing or invalid.");
        }
        var accessToken = authorizationHeader.Substring("Bearer ".Length).Trim();

        try
        {
            var updatedGist = await _githubService.UpdateGistAsync(
                accessToken,
                request.GistId,
                request.Description,
                request.Filename,
                request.Content);
            return Ok(updatedGist);
        }
        catch (NotFoundException)
        {
            return NotFound();
        }
    }
}