using Dev2ndBrain.Models;
using Dev2ndBrain.Repositories;
using System.Threading.Tasks;

namespace Dev2ndBrain.Services
{
    public class SyncService
    {
        private readonly SyncRepository _repository;

        public SyncService(SyncRepository repository)
        {
            _repository = repository;
        }

        public async Task Push(SyncPayload payload, long userId)
        {
            await _repository.SaveNotesAsync(payload.Notes);
            await _repository.SaveSnippetsAsync(payload.Snippets);
            await _repository.SaveDecksAsync(payload.Decks);
            await _repository.SaveFlashcardsAsync(payload.Flashcards);
            await _repository.SaveTemplatesAsync(payload.Templates);
            await _repository.SaveAiReviewsAsync(payload.AiReviews);
            await _repository.SaveAnnotationsAsync(payload.Annotations);
        }

        public async Task<SyncPayload> Pull(long userId)
        {
            var notes = await _repository.GetNotesAsync();
            var snippets = await _repository.GetSnippetsAsync();
            var decks = await _repository.GetDecksAsync();
            var flashcards = await _repository.GetFlashcardsAsync();
            var templates = await _repository.GetTemplatesAsync();
            var aiReviews = await _repository.GetAiReviewsAsync();
            var annotations = await _repository.GetAnnotationsAsync();

            return new SyncPayload
            {
                Notes = notes,
                Snippets = snippets,
                Decks = decks,
                Flashcards = flashcards,
                Templates = templates,
                AiReviews = aiReviews,
                Annotations = annotations
            };
        }
    }
}