import React, { useState, useEffect, useMemo } from 'react';
import { useFlashcardStore } from '../../stores/useFlashcardStore';
import type { Flashcard } from '../../types';
import { 
    SparklesIcon, 
    XMarkIcon, 
    ArrowUturnLeftIcon, 
    FaceFrownIcon, 
    FaceSmileIcon, 
    SunIcon, 
    CheckCircleIcon, 
    PlayIcon, 
    ChevronLeftIcon 
} from '@heroicons/react/20/solid';
import { db } from '../../services/db';
import ReactMarkdown from 'react-markdown'; 

const API_BASE_URL = window.electronAPI
    ? 'https://localhost:7150' // In Electron, talk directly to the backend
    : import.meta.env.VITE_API_BASE_URL; // For web/Docker, use the .env file

const AiReviewModal: React.FC<{ isOpen: boolean; onClose: () => void; feedback: string | null }> = ({ isOpen, onClose, feedback }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Review Feedback ✨</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="w-full p-4 max-h-96 overflow-y-auto bg-gray-100 dark:bg-gray-700 rounded-lg">
                    {feedback ? (
                        <article className="prose dark:prose-invert prose-sm max-w-none text-gray-900 dark:text-gray-200">
                            <ReactMarkdown>{feedback}</ReactMarkdown>
                        </article>
                    ) : (
                        <p className="text-gray-600 dark:text-gray-400">The AI is processing the feedback, please wait...</p>
                    )}
                </div>
                <button 
                    onClick={onClose} 
                    className="flex items-center justify-center space-x-1 mt-4 w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg px-4 py-2 hover:bg-gray-300 dark:hover:bg-gray-600 shadow-md hover:shadow-lg transition-all duration-200"
                >
                    <XMarkIcon className="h-5 w-5" />
                    <span>Close</span>
                </button>
            </div>
        </div>
    );
};

const SessionSummary: React.FC<{ stats: Record<string, number>, onFinish: () => void; sessionAnswers: { question: string; correctAnswer: string; userAnswer: string }[]; deckId: number }> = ({ stats, onFinish, sessionAnswers, deckId }) => {
    const [isAiReviewModalOpen, setIsAiReviewModalOpen] = useState(false);
    const [aiFeedback, setAiFeedback] = useState<string | null>(null);
    const [isLoadingAi, setIsLoadingAi] = useState(false);
    const { getDeckById } = useFlashcardStore();
    const deck = getDeckById(deckId);

    const handleAiReview = async () => {
        setIsLoadingAi(true);
        setIsAiReviewModalOpen(true);
        try {
            const prompt = `Review a user's performance on a flashcard session. For each question, compare the user's answer to the correct answer. Provide a rating from 1 (poor) to 5 (excellent) and constructive feedback on how to improve.
              Here are the questions, user answers, and correct answers:
              ${sessionAnswers.map(a => `Q: ${a.question}\nUser's Answer: ${a.userAnswer}\nCorrect Answer: ${a.correctAnswer}`).join('\n---\n')}
`;
            const res = await fetch(`${API_BASE_URL}/api/ai/prompt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, content: "" }),
            });
            const data = await res.json();
            if (res.ok) {
                setAiFeedback(data.completion);
                // Save the review to IndexedDB
                if (deck) {
                  await db.aiReviews.add({
                    deckId: deck.id!,
                    deckName: deck.name,
                    feedback: data.completion,
                    timestamp: new Date(),
                  });
                }
            } else {
                setAiFeedback('Failed to get AI feedback.');
            }
        } catch (error) {
            setAiFeedback('An error occurred while fetching AI feedback.');
        } finally {
            setIsLoadingAi(false);
        }
    };

    return (
        <div className="text-center">
            <h2 className="text-2xl text-gray-900 dark:text-white mb-2 flex items-center justify-center space-x-2">
                <CheckCircleIcon className="h-8 w-8 text-teal-500" />
                <span>Review Complete!</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">You've finished your review session. Here's how you did:</p>
            <ul className="list-none space-y-2 mb-6">
                {Object.entries(stats).map(([rating, count]) => (
                    <li key={rating} className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                        <span className="font-medium">{rating}</span>
                        <span className="text-teal-500 font-bold">{count}</span>
                    </li>
                ))}
            </ul>
            <div className="space-x-4 flex justify-center">
                <button
                    onClick={onFinish}
                    className="flex items-center space-x-1 mt-4 px-4 py-2 bg-teal-600 rounded-lg text-white font-semibold hover:bg-teal-700 shadow-md hover:shadow-lg transition-all duration-200"
                >
                    <ChevronLeftIcon className="h-5 w-5" />
                    <span>Back to Decks</span>
                </button>
                <button
                    onClick={handleAiReview}
                    className="flex items-center space-x-1 mt-4 px-4 py-2 bg-indigo-600 rounded-lg text-white font-semibold hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                    disabled={isLoadingAi}
                >
                    <SparklesIcon className="h-5 w-5" />
                    <span>{isLoadingAi ? 'Reviewing...' : 'Review with AI'}</span>
                </button>
            </div>
            <AiReviewModal isOpen={isAiReviewModalOpen} onClose={() => setIsAiReviewModalOpen(false)} feedback={aiFeedback} />
        </div>
    );
};

interface FlashcardPlayerProps {
    deckId: number;
    reviewMode: 'due' | 'all';
    onFinish: () => void;
}

const FlashcardPlayer: React.FC<FlashcardPlayerProps> = ({ deckId, reviewMode, onFinish }) => {
    const { cards, fetchCardsByDeck, reviewCard } = useFlashcardStore();
    const [queue, setQueue] = useState<Flashcard[]>([]);
    const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
    const [isFlipped, setIsFlipped] = useState(false);
    const [userAnswer, setUserAnswer] = useState('');
    const [sessionAnswers, setSessionAnswers] = useState<{ question: string; correctAnswer: string; userAnswer: string }[]>([]);
    const [sessionStats, setSessionStats] = useState<Record<string, number>>({});

    useEffect(() => {
        fetchCardsByDeck(deckId);
    }, [deckId, fetchCardsByDeck]);

    const reviewQueue = useMemo(() => {
        if (reviewMode === 'all') {
            return cards;
        }
        return cards.filter(c => new Date(c.nextReview) <= new Date());
    }, [cards, reviewMode]);

    useEffect(() => {
        setQueue(reviewQueue);
        setCurrentCard(reviewQueue[0] || null);
        setIsFlipped(false);
        setUserAnswer('');
        setSessionAnswers([]);
        setSessionStats({});
    }, [reviewQueue]);

    const handleNextCard = (quality: number, ratingLabel: string) => {
        if (!currentCard) return;

        reviewCard(currentCard.id!, quality);
        setIsFlipped(false);

        setSessionStats(prevStats => ({
            ...prevStats,
            [ratingLabel]: (prevStats[ratingLabel] || 0) + 1,
        }));
        
        setSessionAnswers(prev => [
            ...prev,
            { question: currentCard.question, correctAnswer: currentCard.answer, userAnswer: userAnswer }
        ]);

        const newQueue = queue.slice(1);
        setQueue(newQueue);
        setCurrentCard(newQueue[0] || null);
        setUserAnswer('');
    };

    if (queue.length === 0 && Object.keys(sessionStats).length > 0) {
        return <SessionSummary stats={sessionStats} onFinish={onFinish} sessionAnswers={sessionAnswers} deckId={deckId} />;
    }

    if (reviewQueue.length > 0 && queue.length === 0) {
        return (
            <div className="text-center">
                   <h2 className="text-2xl text-gray-900 dark:text-white flex items-center justify-center space-x-2">
                     <CheckCircleIcon className="h-8 w-8 text-teal-500" />
                     <span>All done for now!</span>
                </h2>
                <p className="text-gray-600 dark:text-gray-400">You've completed this review session.</p>
                <button onClick={onFinish} className="flex items-center justify-center mx-auto space-x-1 mt-4 px-4 py-2 bg-teal-600 rounded-lg text-white font-semibold hover:bg-teal-700 shadow-md hover:shadow-lg transition-all duration-200">
                    <ChevronLeftIcon className="h-5 w-5" />
                    <span>Back to Decks</span>
                </button>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col items-center">
            <div className="w-full max-w-2xl bg-gray-200 dark:bg-gray-700 rounded-lg p-8 text-center text-gray-900 dark:text-white text-2xl mb-6 transform transition-transform duration-500 hover:scale-102 h-[25rem]">
                <div className="h-full overflow-y-auto" style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>
                    {currentCard && (
                        <div>
                            {!isFlipped ? (
                                <p>{currentCard.question}</p>
                            ) : (
                                <div>
                                    <h3 className="text-lg font-bold mb-2">Your Answer:</h3>
                                    <p className="text-base text-gray-700 dark:text-gray-300 mb-4">{userAnswer || "No answer provided."}</p>
                                    <h3 className="text-lg font-bold mb-2">Correct Answer:</h3>
                                    <p className="text-base">{currentCard.answer}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="w-full max-w-2xl mt-4">
                <div className="bg-gray-300 dark:bg-gray-600 rounded-full h-2.5">
                    <div className="bg-teal-600 h-2.5 rounded-full" style={{ width: `${reviewQueue.length > 0 ? ((reviewQueue.length - queue.length) / reviewQueue.length) * 100 : 0}%` }}></div>
                </div>
                <p className="text-sm text-center mt-2 text-gray-500 dark:text-gray-400">
                    {reviewQueue.length - queue.length} / {reviewQueue.length} cards reviewed
                </p>
            </div>

            <div className="w-full max-w-2xl mt-6">
                {!isFlipped ? (
                    <textarea
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Type your answer here..."
                        className="w-full p-4 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        rows={3}
                    />
                ) : null}
            </div>

            <div className="mt-6">
                {!isFlipped ? (
                    <button onClick={() => setIsFlipped(true)} className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 rounded-lg text-white text-lg font-semibold hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200">
                        <PlayIcon className="h-6 w-6" />
                        <span>Show Answer</span>
                    </button>
                ) : (
                    <div className="flex flex-wrap justify-center gap-3">
                        <button onClick={() => handleNextCard(1, 'Again')} className="flex items-center space-x-2 px-4 py-2 bg-red-600 rounded-lg text-white font-semibold hover:bg-red-700 shadow-md hover:shadow-lg transition-all duration-200">
                            <ArrowUturnLeftIcon className="h-5 w-5" />
                            <span>Again</span>
                        </button>
                        <button onClick={() => handleNextCard(2, 'Typo')} className="px-4 py-2 bg-pink-600 rounded-lg text-white font-semibold hover:bg-pink-700 shadow-md hover:shadow-lg transition-all duration-200">Typo</button>
                        <button onClick={() => handleNextCard(3, 'Hard')} className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 rounded-lg text-white font-semibold hover:bg-yellow-700 shadow-md hover:shadow-lg transition-all duration-200">
                            <FaceFrownIcon className="h-5 w-5" />
                            <span>Hard</span>
                        </button>
                        <button onClick={() => handleNextCard(4, 'Good')} className="flex items-center space-x-2 px-4 py-2 bg-green-600 rounded-lg text-white font-semibold hover:bg-green-700 shadow-md hover:shadow-lg transition-all duration-200">
                            <FaceSmileIcon className="h-5 w-5" />
                            <span>Good</span>
                        </button>
                        <button onClick={() => handleNextCard(5, 'Easy')} className="flex items-center space-x-2 px-4 py-2 bg-teal-600 rounded-lg text-white font-semibold hover:bg-teal-700 shadow-md hover:shadow-lg transition-all duration-200">
                            <SunIcon className="h-5 w-5" />
                            <span>Easy</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FlashcardPlayer;