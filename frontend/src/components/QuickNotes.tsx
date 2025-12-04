import React from 'react';
import { FiEdit3, FiSave, FiTrash2 } from 'react-icons/fi';

const QuickNotes: React.FC = () => {
    const [notes, setNotes] = React.useState('');
    const [lastSaved, setLastSaved] = React.useState<Date | null>(null);
    const [isSaving, setIsSaving] = React.useState(false);
    const saveTimeoutRef = React.useRef<number | undefined>(undefined);

    // Load notes from localStorage on mount
    React.useEffect(() => {
        const savedNotes = localStorage.getItem('dashboard-notes');
        const savedTime = localStorage.getItem('dashboard-notes-timestamp');
        if (savedNotes) {
            setNotes(savedNotes);
            if (savedTime) {
                setLastSaved(new Date(savedTime));
            }
        }
    }, []);

    // Auto-save notes after 2 seconds of inactivity
    React.useEffect(() => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = window.setTimeout(() => {
            saveNotes(notes);
        }, 2000);

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [notes]);

    const saveNotes = (content: string) => {
        setIsSaving(true);
        try {
            localStorage.setItem('dashboard-notes', content);
            localStorage.setItem('dashboard-notes-timestamp', new Date().toISOString());
            setLastSaved(new Date());
        } catch (error) {
            console.error('Error saving notes:', error);
        } finally {
            setTimeout(() => setIsSaving(false), 500);
        }
    };

    const handleClearNotes = () => {
        if (notes.trim() && !window.confirm('Are you sure you want to clear all notes?')) {
            return;
        }
        setNotes('');
        localStorage.removeItem('dashboard-notes');
        localStorage.removeItem('dashboard-notes-timestamp');
        setLastSaved(null);
    };

    const formatLastSaved = () => {
        if (!lastSaved) return 'Not saved yet';

        const now = new Date();
        const diffMs = now.getTime() - lastSaved.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins === 1) return '1 minute ago';
        if (diffMins < 60) return `${diffMins} minutes ago`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours === 1) return '1 hour ago';
        if (diffHours < 24) return `${diffHours} hours ago`;

        return lastSaved.toLocaleDateString();
    };

    return (
        <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <FiEdit3 className="w-4 h-4 text-gray-400" />
                    <h3 className="text-sm font-semibold">Quick Notes</h3>
                </div>
                {notes.trim() && (
                    <button
                        onClick={handleClearNotes}
                        className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                        title="Clear notes"
                    >
                        <FiTrash2 className="w-3 h-3" />
                    </button>
                )}
            </div>

            <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Jot down quick notes here... (Auto-saves)"
                className="w-full h-32 p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />

            <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                    {isSaving ? (
                        <>
                            <FiSave className="w-3 h-3 animate-pulse" />
                            <span>Saving...</span>
                        </>
                    ) : (
                        <>
                            <FiSave className="w-3 h-3" />
                            <span>{formatLastSaved()}</span>
                        </>
                    )}
                </div>
                <span>{notes.length} characters</span>
            </div>
        </div>
    );
};

export default QuickNotes;
