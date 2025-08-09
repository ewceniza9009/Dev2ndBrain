using Dev2ndBrain.Data;
using Dev2ndBrain.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

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
                if (note.IsDeleted == true && note.Id.HasValue)
                {
                    var noteToDelete = await _context.Notes.FindAsync(note.Id.Value);
                    if (noteToDelete != null) _context.Notes.Remove(noteToDelete);
                    continue;
                }

                var existingNote = await _context.Notes.FindAsync(note.Id);
                if (existingNote == null)
                {
                    _context.Notes.Add(note);
                }
                else if (note.UpdatedAt > existingNote.UpdatedAt)
                {
                    _context.Entry(existingNote).CurrentValues.SetValues(note);
                }
            }
            await _context.SaveChangesAsync();
        }

        public async Task SaveSnippetsAsync(List<SnippetDto> snippets)
        {
            foreach (var snippet in snippets)
            {
                if (snippet.IsDeleted == true && snippet.Id.HasValue)
                {
                    var snippetToDelete = await _context.Snippets.FindAsync(snippet.Id.Value);
                    if (snippetToDelete != null) _context.Snippets.Remove(snippetToDelete);
                    continue;
                }
                var existingSnippet = await _context.Snippets.FindAsync(snippet.Id);
                if (existingSnippet == null)
                {
                    _context.Snippets.Add(snippet);
                }
                else if (snippet.UpdatedAt > existingSnippet.UpdatedAt)
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
                if (deck.IsDeleted == true && deck.Id.HasValue)
                {
                    var deckToDelete = await _context.Decks.FindAsync(deck.Id.Value);
                    if (deckToDelete != null) _context.Decks.Remove(deckToDelete);
                    continue;
                }
                var existingDeck = await _context.Decks.FindAsync(deck.Id);
                if (existingDeck == null)
                {
                    _context.Decks.Add(deck);
                }
                else if (deck.UpdatedAt > existingDeck.UpdatedAt)
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
                if (flashcard.IsDeleted == true && flashcard.Id.HasValue)
                {
                    var flashcardToDelete = await _context.Flashcards.FindAsync(flashcard.Id.Value);
                    if (flashcardToDelete != null) _context.Flashcards.Remove(flashcardToDelete);
                    continue;
                }
                var existingFlashcard = await _context.Flashcards.FindAsync(flashcard.Id);
                if (existingFlashcard == null)
                {
                    _context.Flashcards.Add(flashcard);
                }
                else if (flashcard.UpdatedAt > existingFlashcard.UpdatedAt)
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
                if (template.IsDeleted == true && template.Id.HasValue)
                {
                    var templateToDelete = await _context.Templates.FindAsync(template.Id.Value);
                    if (templateToDelete != null) _context.Templates.Remove(templateToDelete);
                    continue;
                }
                var existingTemplate = await _context.Templates.FindAsync(template.Id);
                if (existingTemplate == null)
                {
                    _context.Templates.Add(template);
                }
                else if (template.UpdatedAt > existingTemplate.UpdatedAt)
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
                else if (review.Timestamp > existingReview.Timestamp)
                {
                    _context.Entry(existingReview).CurrentValues.SetValues(review);
                }
            }
            await _context.SaveChangesAsync();
        }

        public async Task SaveAnnotationsAsync(List<AnnotationRecordDto> annotations)
        {
            foreach (var annotation in annotations)
            {
                var existingAnnotation = await _context.Annotations.FindAsync(annotation.FilterCriteria);
                if (existingAnnotation == null)
                {
                    _context.Annotations.Add(annotation);
                }
                else
                {
                    _context.Entry(existingAnnotation).CurrentValues.SetValues(annotation);
                }
            }
            await _context.SaveChangesAsync();
        }

        public async Task SaveProjectsAsync(List<ProjectDto> projects)
        {
            foreach (var project in projects)
            {
                if (project.IsDeleted == true && project.Id.HasValue)
                {
                    var projectToDelete = await _context.Projects.FindAsync(project.Id.Value);
                    if (projectToDelete != null) _context.Projects.Remove(projectToDelete);
                    continue;
                }
                var existingProject = await _context.Projects.FindAsync(project.Id);
                if (existingProject == null)
                {
                    _context.Projects.Add(project);
                }
                else if (project.UpdatedAt > existingProject.UpdatedAt)
                {
                    _context.Entry(existingProject).CurrentValues.SetValues(project);
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
        public async Task<List<AnnotationRecordDto>> GetAnnotationsAsync() => await _context.Annotations.ToListAsync();
        public async Task<List<ProjectDto>> GetProjectsAsync() => await _context.Projects.ToListAsync();
    }
}