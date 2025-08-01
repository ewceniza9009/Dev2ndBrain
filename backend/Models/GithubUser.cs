namespace Dev2ndBrain.Models
{
    public class GitHubUser
    {
        public string Login { get; set; } = string.Empty;
        public long Id { get; set; }
        public string AvatarUrl { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }
}