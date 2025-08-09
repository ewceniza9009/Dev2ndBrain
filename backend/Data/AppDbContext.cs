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
        public DbSet<ProjectDto> Projects { get; set; }

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
            modelBuilder.Entity<ProjectDto>().HasKey(p => p.Id);

            var jsonSerializerOptions = new JsonSerializerOptions();

            modelBuilder.Entity<AnnotationRecordDto>()
                .Property(a => a.State)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, jsonSerializerOptions),
                    v => JsonSerializer.Deserialize<AnnotationStateDto>(v, jsonSerializerOptions) ?? new AnnotationStateDto()
                );

            modelBuilder.Entity<NoteDto>().Property(n => n.Tags).HasConversion(
                v => string.Join(',', v),
                v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
            );
            modelBuilder.Entity<SnippetDto>().Property(s => s.Tags).HasConversion(
                v => string.Join(',', v),
                v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
            );

            modelBuilder.Entity<ProjectDto>().Property(p => p.Goals).HasConversion(
                v => JsonSerializer.Serialize(v, jsonSerializerOptions),
                v => JsonSerializer.Deserialize<List<GoalDto>>(v, jsonSerializerOptions) ?? new List<GoalDto>()
            );
            modelBuilder.Entity<ProjectDto>().Property(p => p.NextSteps).HasConversion(
                v => JsonSerializer.Serialize(v, jsonSerializerOptions),
                v => JsonSerializer.Deserialize<List<NextStepDto>>(v, jsonSerializerOptions) ?? new List<NextStepDto>()
            );
            modelBuilder.Entity<ProjectDto>().Property(p => p.Features).HasConversion(
                v => JsonSerializer.Serialize(v, jsonSerializerOptions),
                v => JsonSerializer.Deserialize<List<ProjectFeatureDto>>(v, jsonSerializerOptions) ?? new List<ProjectFeatureDto>()
            );
            modelBuilder.Entity<ProjectDto>().Property(p => p.Resources).HasConversion(
                v => JsonSerializer.Serialize(v, jsonSerializerOptions),
                v => JsonSerializer.Deserialize<List<ProjectResourceDto>>(v, jsonSerializerOptions) ?? new List<ProjectResourceDto>()
            );
            modelBuilder.Entity<ProjectDto>().Property(p => p.History).HasConversion(
                v => JsonSerializer.Serialize(v, jsonSerializerOptions),
                v => JsonSerializer.Deserialize<List<HistoryEntryDto>>(v, jsonSerializerOptions) ?? new List<HistoryEntryDto>()
            );
        }
    }
}