using Dev2ndBrain.Models;
using Microsoft.EntityFrameworkCore;

namespace Dev2ndBrain.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<NoteDto> Notes { get; set; }
        public DbSet<SnippetDto> Snippets { get; set; }
        public DbSet<DeckDto> Decks { get; set; }
        public DbSet<FlashcardDto> Flashcards { get; set; }
        public DbSet<TemplateDto> Templates { get; set; }
        public DbSet<AiReviewDto> AiReviews { get; set; }      

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<NoteDto>().HasKey(n => n.Id);
            modelBuilder.Entity<SnippetDto>().HasKey(s => s.Id);
            modelBuilder.Entity<DeckDto>().HasKey(d => d.Id);
            modelBuilder.Entity<FlashcardDto>().HasKey(f => f.Id);
            modelBuilder.Entity<TemplateDto>().HasKey(t => t.Id);
            modelBuilder.Entity<AiReviewDto>().HasKey(a => a.Id);      

            modelBuilder.Entity<NoteDto>().Property(n => n.Tags).HasConversion(
                v => string.Join(',', v),
                v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
            );
            modelBuilder.Entity<SnippetDto>().Property(s => s.Tags).HasConversion(
                v => string.Join(',', v),
                v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
            );
        }
    }
}