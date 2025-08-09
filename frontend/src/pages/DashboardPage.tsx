import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNoteStore } from '../stores/useNoteStore';
import { useSnippetStore } from '../stores/useSnippetStore';
import { useFlashcardStore } from '../stores/useFlashcardStore';
import { useProjectStore } from '../stores/useProjectStore';
import { PlusIcon, CodeBracketSquareIcon, RectangleStackIcon } from '@heroicons/react/20/solid';

// Dashboard components
import Tabs from '../components/dashboard/Tabs';
import FlashcardSummary from '../components/dashboard/FlashcardSummary';
import RecentNotes from '../components/dashboard/RecentNotes';
import PopularTags from '../components/dashboard/PopularTags';
import AiReviewsSummary from '../components/dashboard/AiReviewsSummary';
import ImpromptuCard from '../components/dashboard/ImpromptuCard';
import RecentProjects from '../components/dashboard/RecentProjects';

import ReactMarkdown from 'react-markdown';

// Placeholder for a chart component
const ChartPlaceholder = () => (
  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex items-center justify-center h-80">
    <p className="text-gray-500 dark:text-gray-400 text-lg">Data Visualization Coming Soon!</p>
  </div>
);

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { notes, fetchNotes, addNote } = useNoteStore();
  const { snippets, fetchSnippets } = useSnippetStore();
  const { allCards, fetchAllCards } = useFlashcardStore();
  const { projects, fetchProjects } = useProjectStore();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchNotes();
    fetchSnippets();
    fetchAllCards();
    fetchProjects();
  }, [fetchNotes, fetchSnippets, fetchAllCards, fetchProjects]);

  const recentlyEditedNotes = useMemo(() => {
    return [...notes]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }, [notes]);

  const recentlyEditedProjects = useMemo(() => {
    return [...projects]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }, [projects]);

  const dueFlashcardsCount = useMemo(() => {
    return allCards.filter(card => new Date(card.nextReview) <= new Date()).length;
  }, [allCards]);
  
  const isNotesEmpty = notes.length === 0;
  const isSnippetsEmpty = snippets.length === 0;
  const isFlashcardsEmpty = allCards.length === 0;

  const handleCreateNote = async () => {
    const newNote = await addNote({ title: 'New Note', content: '', tags: [] });
    if (newNote?.id) navigate(`/notes`, { state: { selectedId: newNote.id } });
  };

  const renderOnboardingMessage = () => {
  if (isNotesEmpty && isSnippetsEmpty && isFlashcardsEmpty) {
    const onboardingMarkdown = [
      '### 🧠 Welcome to Dev2ndBrain!',
      '#### ✅ Get Started with Notes',
      'Create your first note to capture ideas, document projects, or interlink concepts. Use the `New` button in the Notes section to begin. You can even use a template from the Settings page.',
      '#### 💻 Manage Code Snippets',
      'Have a handy code snippet you use often? Save it here! Click `New Snippet` in the Snippets section to add your first piece of code. You can also sync it with your GitHub Gists.',
      '#### 📚 Start Your Learning Journey',
      'Ready to master a new topic? Head over to **Flashcards**, create a new deck, and add some cards. The spaced repetition system will help you remember what matters.',
      '>_**Pro Tip:** Use the `Ctrl + K` (or `Cmd + K`) shortcut to open the **Command Palette** and quickly create new items or navigate the app. Happy brain building!_',
    ].join('\n');

    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-xl p-8 my-8 transition-all duration-300 transform hover:scale-101">
        <article className="prose dark:prose-invert prose-lg max-w-none text-left">
          <ReactMarkdown>{onboardingMarkdown}</ReactMarkdown>
        </article>
      </div>
    );
  }
  return null;
};

  const renderTabContent = () => {
    switch (activeTab) {
      case 'projects':
        return <RecentProjects projects={recentlyEditedProjects} />;
      case 'stats':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-xl p-6 h-full flex flex-col">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">At a Glance</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                  <span>Total Notes</span>
                  <span className="font-bold text-gray-900 dark:text-white">{notes.length}</span>
                </div>
                <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                  <span>Total Snippets</span>
                  <span className="font-bold text-gray-900 dark:text-white">{snippets.length}</span>
                </div>
                <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                  <span>Total Flashcards</span>
                  <span className="font-bold text-gray-900 dark:text-white">{allCards.length}</span>
                </div>
                 <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                  <span>Total Projects</span>
                  <span className="font-bold text-gray-900 dark:text-white">{projects.length}</span>
                </div>
              </div>
            </div>
            <ChartPlaceholder />
          </div>
        );
      case 'reviews':
        return <AiReviewsSummary />;
      case 'overview':
      default:
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <div className="md:col-span-1 flex flex-col space-y-6">
                <FlashcardSummary dueCount={dueFlashcardsCount} />
                <ImpromptuCard />
              </div>
              <div className="md:col-span-1 lg:col-span-2 xl:col-span-3">
                <RecentNotes notes={recentlyEditedNotes} />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                  Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button
                    onClick={handleCreateNote}
                    className="flex flex-col items-center justify-center p-6 bg-gray-200 dark:bg-gray-700 rounded-xl text-center hover:bg-gray-300 dark:hover:bg-gray-600 shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <PlusIcon className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                    <span className="mt-2 font-semibold text-gray-900 dark:text-white">New Note</span>
                  </button>
                  <button
                    onClick={() => navigate('/snippets')}
                    className="flex flex-col items-center justify-center p-6 bg-gray-200 dark:bg-gray-700 rounded-xl text-center hover:bg-gray-300 dark:hover:bg-gray-600 shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <CodeBracketSquareIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                    <span className="mt-2 font-semibold text-gray-900 dark:text-white">New Snippet</span>
                  </button>
                  <button
                    onClick={() => navigate('/flashcards')}
                    className="flex flex-col items-center justify-center p-6 bg-gray-200 dark:bg-gray-700 rounded-xl text-center hover:bg-gray-300 dark:hover:bg-gray-600 shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <RectangleStackIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                    <span className="mt-2 font-semibold text-gray-900 dark:text-white">New Deck</span>
                  </button>
                </div>
              </div>
              <PopularTags />
            </div>
          </>
        );
    }
  };

  return (
    <div className="p-5 md:p-5 lg:p-5">
      {renderOnboardingMessage()}

      <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="space-y-8">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default DashboardPage;