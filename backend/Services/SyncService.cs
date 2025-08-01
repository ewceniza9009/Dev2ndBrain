using Dev2ndBrain.Models;
using Dev2ndBrain.Repositories;
using Octokit;

namespace Dev2ndBrain.Services
{
    public class SyncService
    {
        private readonly SyncRepository _repository;

        public SyncService(SyncRepository repository)
        {
            _repository = repository;
        }

        // Simulating the push logic (for simplicity, we just add the data)
        public async Task Push(SyncPayload payload, long userId)
        {
            // Here you would implement your conflict resolution logic.
            // For now, we assume the frontend is always authoritative.
            // In a real app, you would compare timestamps and merge data.
            await _repository.SaveNotesAsync(payload.Notes);
            await _repository.SaveSnippetsAsync(payload.Snippets);
            await _repository.SaveDecksAsync(payload.Decks);
            await _repository.SaveFlashcardsAsync(payload.Flashcards);
        }

        public async Task<SyncPayload> Pull(long userId)
        {
            // Here we fetch all the data for the user from the database
            var notes = await _repository.GetNotesAsync();
            var snippets = await _repository.GetSnippetsAsync();
            var decks = await _repository.GetDecksAsync();
            var flashcards = await _repository.GetFlashcardsAsync();

            return new SyncPayload
            {
                Notes = notes,
                Snippets = snippets,
                Decks = decks,
                Flashcards = flashcards,
            };
        }
    }
}