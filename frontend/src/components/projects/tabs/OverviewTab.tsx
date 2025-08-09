import React, { useState, useEffect, useRef } from 'react';
import { useProjectStore } from '../../../stores/useProjectStore';
import type { Project } from '../../../types';
import { PlusIcon, FlagIcon, ArrowRightCircleIcon, PencilSquareIcon, CheckIcon } from '@heroicons/react/20/solid';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

// --- Re-integrated Toolbar Components ---
const ToolbarButton = ({ onClick, title, children }: { onClick: (e: React.MouseEvent) => void; title: string; children: React.ReactNode }) => (
    <button
        type="button"
        onClick={onClick}
        title={title}
        className="flex items-center justify-center px-2.5 py-1 text-xs font-semibold rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 transition-colors"
    >
        {children}
    </button>
);

const OverviewTab: React.FC<{ project: Project }> = ({ project }) => {
    const { updateProject } = useProjectStore();
    const [title, setTitle] = useState(project.title);
    const [description, setDescription] = useState(project.description);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    
    const [newGoal, setNewGoal] = useState('');
    const [newNextStep, setNewNextStep] = useState('');
    const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setTitle(project.title);
        setDescription(project.description);
    }, [project]);

    const handleUpdate = (field: 'title' | 'description', value: any, oldValue: any) => {
        const historyEntry = {
            timestamp: new Date(),
            actionType: 'Updated' as const,
            field: field,
            oldValue: JSON.stringify(oldValue),
            newValue: JSON.stringify(value),
        };
        updateProject(project.id!, { [field]: value }, historyEntry);
    };

    const handleTitleBlur = () => {
        if (title !== project.title) {
            handleUpdate('title', title, project.title);
        }
    };

    const handleSaveDescription = () => {
        if (description !== project.description) {
            handleUpdate('description', description, project.description);
        }
        setIsEditingDescription(false);
    };

    const handleAddItem = (type: 'goals' | 'nextSteps', value: string) => {
        if (!value.trim()) return;
        const newItem = { text: value.trim() };
        const oldList = project[type] || [];
        const newList = [...oldList, newItem];
        const historyEntry = {
            timestamp: new Date(),
            actionType: 'Added' as const,
            field: type,
            newValue: JSON.stringify(newItem),
        };
        updateProject(project.id!, { [type]: newList }, historyEntry);
        if (type === 'goals') setNewGoal('');
        else setNewNextStep('');
    };
    
    // --- Toolbar Action Handlers for Textarea ---
    const handleWrapSelection = (prefix: string, suffix?: string) => {
        const textarea = descriptionTextareaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        const newText = `${prefix}${selectedText}${suffix ?? prefix}`;
        const updatedValue = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
        
        setDescription(updatedValue);
        textarea.focus();
        setTimeout(() => {
            textarea.selectionStart = start + prefix.length;
            textarea.selectionEnd = end + prefix.length;
        }, 0);
    };

    const currentGoal = project.goals.length > 0 ? project.goals[project.goals.length - 1] : null;
    const currentNextStep = project.nextSteps.length > 0 ? project.nextSteps[project.nextSteps.length - 1] : null;

    return (
        <div className="flex flex-col h-full space-y-4 p-2">
            {/* Project Title and Description */}
            <div className="flex-shrink-0">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleTitleBlur}
                    placeholder="Project Title..."
                    className="w-full text-3xl font-bold bg-transparent border-0 border-b-2 border-transparent focus:border-teal-500 focus:ring-0 p-1 -ml-1 transition"
                />
            </div>
            
            <div className="group relative flex-grow min-h-0">
                {isEditingDescription ? (
                    <div className="h-full flex flex-col border border-gray-300 dark:border-gray-600 rounded-lg focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition">
                        <div className="flex-shrink-0 flex flex-wrap items-center gap-1.5 p-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600">
                            <ToolbarButton onClick={() => handleWrapSelection('# ')} title="Heading"><b>H1</b></ToolbarButton>
                            <ToolbarButton onClick={() => handleWrapSelection('## ')} title="Heading 2"><b>H2</b></ToolbarButton>
                            <ToolbarButton onClick={() => handleWrapSelection('**')} title="Bold"><b>B</b></ToolbarButton>
                            <ToolbarButton onClick={() => handleWrapSelection('*')} title="Italic"><i>I</i></ToolbarButton>
                            <ToolbarButton onClick={() => handleWrapSelection('`')} title="Inline Code">{`</>`}</ToolbarButton>
                            <ToolbarButton onClick={() => handleWrapSelection('\n- ')} title="List">- List</ToolbarButton>
                        </div>
                        <textarea
                            ref={descriptionTextareaRef}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Project Description (Markdown enabled)..."
                            className="flex-grow w-full resize-none bg-transparent dark:bg-gray-900 border-0 focus:ring-0 p-2"
                        />
                         <div className="flex-shrink-0 p-2 border-t border-gray-300 dark:border-gray-600 flex justify-end">
                            <button onClick={handleSaveDescription} className="flex items-center space-x-1 px-3 py-1 bg-teal-600 text-white rounded-md text-sm font-semibold hover:bg-teal-700">
                                <CheckIcon className="h-4 w-4"/>
                                <span>Done</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div
                            className="h-full max-h-[40vh] overflow-y-auto prose dark:prose-invert max-w-none p-4 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-text"
                            onClick={() => setIsEditingDescription(true)}
                        >
                            {description ? (
                                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                    {description}
                                </ReactMarkdown>
                            ) : (
                                <p className="text-gray-400">Click to add a description...</p>
                            )}
                        </div>
                        <button onClick={() => setIsEditingDescription(true)} className="absolute top-2 right-2 p-1.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                            <PencilSquareIcon className="h-5 w-5"/>
                        </button>
                    </>
                )}
            </div>

            {/* Current Goal and Next Step Cards */}
            <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Goal */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3 mb-4">
                        <FlagIcon className="h-8 w-8 text-red-500" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Current Goal</h3>
                    </div>
                    <div className="min-h-[60px] p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            {currentGoal ? (
                                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{currentGoal.text}</ReactMarkdown>
                            ) : (
                                <p className="text-gray-400">No goals set yet.</p>
                            )}
                        </div>
                    </div>
                     <div className="mt-4 flex">
                        <textarea
                            rows={2}
                            value={newGoal}
                            onChange={(e) => setNewGoal(e.target.value)}
                            placeholder="Set a new current goal..."
                            className="flex-grow rounded-l-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-y"
                        />
                        <button onClick={() => handleAddItem('goals', newGoal)} className="p-2 bg-red-600 text-white rounded-r-md hover:bg-red-700 self-stretch flex items-center">
                            <PlusIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Current Next Step */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3 mb-4">
                        <ArrowRightCircleIcon className="h-8 w-8 text-blue-500" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Next Step</h3>
                    </div>
                    <div className="min-h-[60px] p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                         <div className="prose prose-sm dark:prose-invert max-w-none">
                            {currentNextStep ? (
                                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{currentNextStep.text}</ReactMarkdown>
                            ) : (
                                <p className="text-gray-400">No next steps defined.</p>
                            )}
                        </div>
                    </div>
                    <div className="mt-4 flex">
                        <textarea
                            rows={2}
                            value={newNextStep}
                            onChange={(e) => setNewNextStep(e.target.value)}
                            placeholder="Define the next step..."
                            className="flex-grow rounded-l-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-y"
                        />
                        <button onClick={() => handleAddItem('nextSteps', newNextStep)} className="p-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 self-stretch flex items-center">
                            <PlusIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;