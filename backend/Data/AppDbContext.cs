using Dev2ndBrain.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

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
        public DbSet<AnnotationRecordDto> Annotations { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<NoteDto>().HasKey(n => n.Id);
            modelBuilder.Entity<SnippetDto>().HasKey(s => s.Id);
            modelBuilder.Entity<DeckDto>().HasKey(d => d.Id);
            modelBuilder.Entity<FlashcardDto>().HasKey(f => f.Id);
            modelBuilder.Entity<TemplateDto>().HasKey(t => t.Id);
            modelBuilder.Entity<AiReviewDto>().HasKey(a => a.Id);
            modelBuilder.Entity<AnnotationRecordDto>().HasKey(a => a.FilterCriteria);

            // VITAL CHANGE: Configure the AnnotationRecordDto.State property to be stored as a JSON string
            modelBuilder.Entity<AnnotationRecordDto>()
                .Property(a => a.State)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => JsonSerializer.Deserialize<AnnotationStateDto>(v, (JsonSerializerOptions?)null)
                );

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