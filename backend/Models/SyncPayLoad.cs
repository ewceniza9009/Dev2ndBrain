using Dev2ndBrain.Models;

using System;
using System.Collections.Generic;

namespace Dev2ndBrain.Models
{
    public class NoteDto
    {
        public int? Id { get; set; }
        public Guid Uuid { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public List<string> Tags { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
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
    }

    public class DeckDto
    {
        public int? Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
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
    }

    public class SyncPayload
    {
        public List<NoteDto> Notes { get; set; } = new();
        public List<SnippetDto> Snippets { get; set; } = new();
        public List<DeckDto> Decks { get; set; } = new();
        public List<FlashcardDto> Flashcards { get; set; } = new();
    }
}