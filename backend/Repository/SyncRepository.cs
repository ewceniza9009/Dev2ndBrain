using Dev2ndBrain.Data;
using Dev2ndBrain.Models;
using Microsoft.EntityFrameworkCore;

namespace Dev2ndBrain.Repositories
{
    public class SyncRepository
    {
        private readonly AppDbContext _context;

        public SyncRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task SaveNotesAsync(List<NoteDto> notes)
        {
            foreach (var note in notes)
            {
                // Check if the record already exists based on its Id
                var existingNote = await _context.Notes.FindAsync(note.Id);
                if (existingNote == null)
                {
                    // This is a new record, add it
                    _context.Notes.Add(note);
                }
                else
                {
                    // This is an existing record, update its values
                    _context.Entry(existingNote).CurrentValues.SetValues(note);
                }
            }
            await _context.SaveChangesAsync();
        }

        public async Task SaveSnippetsAsync(List<SnippetDto> snippets)
        {
            foreach (var snippet in snippets)
            {
                var existingSnippet = await _context.Snippets.FindAsync(snippet.Id);
                if (existingSnippet == null)
                {
                    _context.Snippets.Add(snippet);
                }
                else
                {
                    _context.Entry(existingSnippet).CurrentValues.SetValues(snippet);
                }
            }
            await _context.SaveChangesAsync();
        }

        public async Task SaveDecksAsync(List<DeckDto> decks)
        {
            foreach (var deck in decks)
            {
                var existingDeck = await _context.Decks.FindAsync(deck.Id);
                if (existingDeck == null)
                {
                    _context.Decks.Add(deck);
                }
                else
                {
                    _context.Entry(existingDeck).CurrentValues.SetValues(deck);
                }
            }
            await _context.SaveChangesAsync();
        }

        public async Task SaveFlashcardsAsync(List<FlashcardDto> flashcards)
        {
            foreach (var flashcard in flashcards)
            {
                var existingFlashcard = await _context.Flashcards.FindAsync(flashcard.Id);
                if (existingFlashcard == null)
                {
                    _context.Flashcards.Add(flashcard);
                }
                else
                {
                    _context.Entry(existingFlashcard).CurrentValues.SetValues(flashcard);
                }
            }
            await _context.SaveChangesAsync();
        }

        public async Task SaveTemplatesAsync(List<TemplateDto> templates)
        {
            foreach (var template in templates)
            {
                var existingTemplate = await _context.Templates.FindAsync(template.Id);
                if (existingTemplate == null)
                {
                    _context.Templates.Add(template);
                }
                else
                {
                    _context.Entry(existingTemplate).CurrentValues.SetValues(template);
                }
            }
            await _context.SaveChangesAsync();
        }

        public async Task SaveAiReviewsAsync(List<AiReviewDto> aiReviews)
        {
            foreach (var review in aiReviews)
            {
                var existingReview = await _context.AiReviews.FindAsync(review.Id);
                if (existingReview == null)
                {
                    _context.AiReviews.Add(review);
                }
                else
                {
                    _context.Entry(existingReview).CurrentValues.SetValues(review);
                }
            }
            await _context.SaveChangesAsync();
        }

        public async Task<List<NoteDto>> GetNotesAsync() => await _context.Notes.ToListAsync();
        public async Task<List<SnippetDto>> GetSnippetsAsync() => await _context.Snippets.ToListAsync();
        public async Task<List<DeckDto>> GetDecksAsync() => await _context.Decks.ToListAsync();
        public async Task<List<FlashcardDto>> GetFlashcardsAsync() => await _context.Flashcards.ToListAsync();
        public async Task<List<TemplateDto>> GetTemplatesAsync() => await _context.Templates.ToListAsync();
        public async Task<List<AiReviewDto>> GetAiReviewsAsync() => await _context.AiReviews.ToListAsync();
    }
}