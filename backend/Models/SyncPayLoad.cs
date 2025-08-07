using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Dev2ndBrain.Models
{

    public class NoteDto
    {
        public int? Id { get; set; }
        public Guid Uuid { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public List<string> Tags { get; set; } = new();
        public List<string> LinkedNoteIds { get; set; } = new();
        public string? IconType { get; set; }
        public string? IconColor { get; set; }
        public bool? IsCollapsed { get; set; }
        public double? X { get; set; }
        public double? Y { get; set; }
        public double? Fx { get; set; }
        public double? Fy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool? IsDeleted { get; set; }
    }

    public class SnippetDto
    {
        public int? Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Language { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public List<string> Tags { get; set; } = new();
        public string? GistId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool? IsDeleted { get; set; }
    }

    public class DeckDto
    {
        public int? Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool? IsDeleted { get; set; }
    }

    public class FlashcardDto
    {
        public int? Id { get; set; }
        public int DeckId { get; set; }
        public string Question { get; set; } = string.Empty;
        public string Answer { get; set; } = string.Empty;
        public DateTime NextReview { get; set; }
        public double EaseFactor { get; set; }
        public int Repetitions { get; set; }
        public int Interval { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool? IsDeleted { get; set; }
    }

    public class AiReviewDto
    {
        public int? Id { get; set; }
        public int DeckId { get; set; }
        public string DeckName { get; set; } = string.Empty;
        public string Feedback { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
    }

    public class TemplateDto
    {
        public int? Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool? IsDeleted { get; set; }
    }

    public class AnnotationRecordDto
    {
        public string FilterCriteria { get; set; } = string.Empty;
        public AnnotationStateDto State { get; set; } = new();
    }

    // DTOs to match the frontend AnnotationState structure
    public class AnnotationStateDto
    {
        public List<CanvasItemDto> Items { get; set; } = new();
        public List<EdgeDto> Edges { get; set; } = new();
    }

    public class CanvasItemDto
    {
        public string Id { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public double X { get; set; }
        public double Y { get; set; }
        public double? Width { get; set; }
        public double? Height { get; set; }
        public string? Text { get; set; }
        public string? Shape { get; set; }
        public string? Icon { get; set; }
        public string? Color { get; set; }
        public List<List<string>>? Content { get; set; }
        public string Tag { get; set; } = string.Empty;
        public int? ZIndex { get; set; }
    }

    public class EdgeDto
    {
        public string Start { get; set; } = string.Empty;
        public string End { get; set; } = string.Empty;
    }

    public class SyncPayload
    {
        public List<NoteDto> Notes { get; set; } = new();
        public List<SnippetDto> Snippets { get; set; } = new();
        public List<DeckDto> Decks { get; set; } = new();
        public List<FlashcardDto> Flashcards { get; set; } = new();
        public List<AiReviewDto> AiReviews { get; set; } = new();
        public List<TemplateDto> Templates { get; set; } = new();

        [JsonPropertyName("annotations")]
        public List<AnnotationRecordDto> Annotations { get; set; } = new();
    }
}