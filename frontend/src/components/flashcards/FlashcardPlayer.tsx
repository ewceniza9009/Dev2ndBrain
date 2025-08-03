import React, { useState, useEffect, useMemo } from 'react';
import { useFlashcardStore } from '../../stores/useFlashcardStore';
import type { Flashcard } from '../../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7150';

interface FlashcardPlayerProps {
  deckId: number;
  reviewMode: 'due' | 'all';
  onFinish: () => void;
}

// NEW: A new modal for AI review feedback
const AiReviewModal: React.FC<{ isOpen: boolean; onClose: () => void; feedback: string | null }> = ({ isOpen, onClose, feedback }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">AI Review Feedback ✨</h2>
                <div className="w-full p-4 max-h-96 overflow-y-auto bg-gray-100 dark:bg-gray-700 rounded-lg whitespace-pre-wrap">
                    {feedback || 'The AI could not provide feedback at this time.'}
                </div>
                <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg w-full">Close</button>
            </div>
        </div>
    );
};

const SessionSummary: React.FC<{ stats: Record<string, number>, onFinish: () => void; sessionAnswers: { question: string; correctAnswer: string; userAnswer: string }[] }> = ({ stats, onFinish, sessionAnswers }) => {
    const [isAiReviewModalOpen, setIsAiReviewModalOpen] = useState(false);
    const [aiFeedback, setAiFeedback] = useState<string | null>(null);
    const [isLoadingAi, setIsLoadingAi] = useState(false);

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
            <h2 className="text-2xl text-gray-900 dark:text-white mb-2">Review Complete! 🎉</h2>
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
                    className="mt-4 px-4 py-2 bg-teal-600 rounded text-white font-semibold"
                >
                    Back to Decks
                </button>
                <button
                    onClick={handleAiReview}
                    className="mt-4 px-4 py-2 bg-indigo-600 rounded text-white font-semibold disabled:opacity-50"
                    disabled={isLoadingAi}
                >
                    {isLoadingAi ? 'Reviewing...' : 'Review with AI ✨'}
                </button>
            </div>
            <AiReviewModal isOpen={isAiReviewModalOpen} onClose={() => setIsAiReviewModalOpen(false)} feedback={aiFeedback} />
        </div>
    );
};

const FlashcardPlayer: React.FC<FlashcardPlayerProps> = ({ deckId, reviewMode, onFinish }) => {
    const { cards, fetchCardsByDeck, reviewCard } = useFlashcardStore();
    const [queue, setQueue] = useState<Flashcard[]>([]);
    const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
    const [isFlipped, setIsFlipped] = useState(false);
    const [userAnswer, setUserAnswer] = useState(''); // NEW: State for user's input
    const [sessionAnswers, setSessionAnswers] = useState<{ question: string; correctAnswer: string; userAnswer: string }[]>([]); // NEW: State to store session answers
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

        // Update session stats
        setSessionStats(prevStats => ({
            ...prevStats,
            [ratingLabel]: (prevStats[ratingLabel] || 0) + 1,
        }));
        
        // NEW: Save the user's answer and the correct answer
        setSessionAnswers(prev => [
            ...prev,
            { question: currentCard.question, correctAnswer: currentCard.answer, userAnswer: userAnswer }
        ]);

        const newQueue = queue.slice(1);
        setQueue(newQueue);
        setCurrentCard(newQueue[0] || null);
        setUserAnswer(''); // Clear user input for the next card
    };

    if (queue.length === 0 && Object.keys(sessionStats).length > 0) {
        return <SessionSummary stats={sessionStats} onFinish={onFinish} sessionAnswers={sessionAnswers} />;
    }

    if (queue.length === 0) {
        return (
            <div className="text-center">
                <h2 className="text-2xl text-gray-900 dark:text-white">All done for now! 🎉</h2>
                <p className="text-gray-600 dark:text-gray-400">You've completed this review session.</p>
                <button onClick={onFinish} className="mt-4 px-4 py-2 bg-teal-600 rounded text-white">Back to Decks</button>
            </div>
        );
    }
    return (
        <div className="flex flex-col items-center">
            <div className="w-full max-w-2xl bg-gray-200 dark:bg-gray-700 rounded-lg p-8 text-center text-gray-900 dark:text-white text-2xl mb-6 transform transition-transform duration-500 hover:scale-102 h-[30rem]">
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
                    <div className="bg-teal-600 h-2.5 rounded-full" style={{ width: `${((reviewQueue.length - queue.length) / reviewQueue.length) * 100}%` }}></div>
                </div>
                <p className="text-sm text-center mt-2 text-gray-500 dark:text-gray-400">
                    {reviewQueue.length - queue.length} / {reviewQueue.length} cards reviewed
                </p>
            </div>

            {/* NEW: Input field for the user's answer */}
            <div className="w-full max-w-2xl mt-6">
                {!isFlipped && (
                    <textarea
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Type your answer here..."
                        className="w-full p-4 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                        rows={5}
                    />
                )}
            </div>

            <div className="mt-6">
                {!isFlipped ? (
                    <button onClick={() => setIsFlipped(true)} className="px-6 py-3 bg-blue-600 rounded-lg text-white text-lg">
                        Show Answer
                    </button>
                ) : (
                    <div className="flex space-x-4">
                        <button onClick={() => handleNextCard(1, 'Again')} className="px-4 py-2 bg-red-600 rounded text-white">Again</button>
                        <button onClick={() => handleNextCard(2, 'Typo')} className="px-4 py-2 bg-pink-600 rounded text-white">Typo</button>
                        <button onClick={() => handleNextCard(3, 'Hard')} className="px-4 py-2 bg-yellow-600 rounded text-white">Hard</button>
                        <button onClick={() => handleNextCard(4, 'Good')} className="px-4 py-2 bg-green-600 rounded text-white">Good</button>
                        <button onClick={() => handleNextCard(5, 'Easy')} className="px-4 py-2 bg-teal-600 rounded text-white">Easy</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FlashcardPlayer;