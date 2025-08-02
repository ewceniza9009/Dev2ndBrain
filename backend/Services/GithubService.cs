using Dev2ndBrain.Models;
using Octokit;

namespace Dev2ndBrain.Services
{
    public class GitHubService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public GitHubService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        private GitHubClient GetClient(string accessToken)
        {
            return new GitHubClient(new ProductHeaderValue("Dev2ndBrain"))
            {
                Credentials = new Credentials(accessToken)
            };
        }

        public async Task<(string? accessToken, GitHubUser? user)> ExchangeCodeForTokenAndUserAsync(string code)
        {
            var gitHubConfig = _configuration.GetSection("GitHub");
            var clientId = gitHubConfig["ClientId"];
            var clientSecret = gitHubConfig["ClientSecret"];

            if (string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(clientSecret))
            {
                throw new InvalidOperationException("GitHub ClientId or ClientSecret is not configured.");
            }

            var redirectUri = new Uri("http://localhost:5173/oauth/callback");

            var request = new OauthTokenRequest(clientId, clientSecret, code)
            {
                RedirectUri = redirectUri
            };

            var client = new GitHubClient(new ProductHeaderValue("Dev2ndBrain"));
            try
            {
                var token = await client.Oauth.CreateAccessToken(request);
                if (token?.AccessToken == null)
                {
                    return (null, null);
                }

                var userClient = new GitHubClient(new ProductHeaderValue("Dev2ndBrain"))
                {
                    Credentials = new Credentials(token.AccessToken)
                };

                var user = await userClient.User.Current();
                var appUser = new GitHubUser
                {
                    Id = user.Id,
                    Login = user.Login,
                    AvatarUrl = user.AvatarUrl,
                    Name = user.Name ?? string.Empty
                };

                return (token.AccessToken, appUser);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error exchanging code for token: {ex.Message}");
                return (null, null);
            }
        }

        public async Task<Gist> CreateGistAsync(string accessToken, string description, string filename, string content, bool isPublic)
        {
            var client = GetClient(accessToken);
            var newGist = new NewGist
            {
                Description = description,
                Public = isPublic
            };
            newGist.Files.Add(filename, content);
            return await client.Gist.Create(newGist);
        }

        public async Task<Gist> UpdateGistAsync(string accessToken, string gistId, string description, string filename, string content)
        {
            var client = GetClient(accessToken);
            var gistUpdate = new GistUpdate
            {
                Description = description,
            };
            var originalGist = await client.Gist.Get(gistId);
            var originalFilename = originalGist.Files.Keys.FirstOrDefault();

            if (string.IsNullOrEmpty(originalFilename))
            {
                throw new ApiException("Cannot update a Gist with no files.", System.Net.HttpStatusCode.BadRequest);
            }

            gistUpdate.Files[originalFilename] = new GistFileUpdate
            {
                NewFileName = filename,
                Content = content
            };

            return await client.Gist.Edit(gistId, gistUpdate);
        }

        public async Task<IReadOnlyList<Gist>> GetUserGistsAsync(string accessToken)
        {
            var client = GetClient(accessToken);
            return await client.Gist.GetAll();
        }

        public async Task<Gist> GetGistByIdAsync(string accessToken, string gistId)
        {
            var client = GetClient(accessToken);
            return await client.Gist.Get(gistId);
        }
    }
}