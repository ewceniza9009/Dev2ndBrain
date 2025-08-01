using System.Text.Json;
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

        public async Task<(string? accessToken, GitHubUser? user)> ExchangeCodeForTokenAndUserAsync(string code)
        {
            var gitHubConfig = _configuration.GetSection("GitHub");
            var clientId = gitHubConfig["ClientId"];
            var clientSecret = gitHubConfig["ClientSecret"];

            if (string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(clientSecret))
            {
                throw new InvalidOperationException("GitHub ClientId or ClientSecret is not configured.");
            }

            var request = new OauthTokenRequest(clientId, clientSecret, code);
            var client = new GitHubClient(new ProductHeaderValue("Dev2ndBrain"));
            try
            {
                var token = await client.Oauth.CreateAccessToken(request);
                if (token?.AccessToken == null)
                {
                    return (null, null);
                }

                // Use the token to get user info
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
                // Log the exception
                Console.WriteLine($"Error exchanging code for token: {ex.Message}");
                return (null, null);
            }
        }
    }
}