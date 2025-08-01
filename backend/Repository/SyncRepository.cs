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
            await _context.Notes.AddRangeAsync(notes);
            await _context.SaveChangesAsync();
        }

        public async Task SaveSnippetsAsync(List<SnippetDto> snippets)
        {
            await _context.Snippets.AddRangeAsync(snippets);
            await _context.SaveChangesAsync();
        }

        public async Task SaveDecksAsync(List<DeckDto> decks)
        {
            await _context.Decks.AddRangeAsync(decks);
            await _context.SaveChangesAsync();
        }

        public async Task SaveFlashcardsAsync(List<FlashcardDto> flashcards)
        {
            await _context.Flashcards.AddRangeAsync(flashcards);
            await _context.SaveChangesAsync();
        }

        public async Task<List<NoteDto>> GetNotesAsync() => await _context.Notes.ToListAsync();
        public async Task<List<SnippetDto>> GetSnippetsAsync() => await _context.Snippets.ToListAsync();
        public async Task<List<DeckDto>> GetDecksAsync() => await _context.Decks.ToListAsync();
        public async Task<List<FlashcardDto>> GetFlashcardsAsync() => await _context.Flashcards.ToListAsync();
    }
}