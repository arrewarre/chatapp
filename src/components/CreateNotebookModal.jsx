import React, { useState } from 'react';
import { X } from 'lucide-react';

const CreateNotebookModal = ({ isOpen, onClose, onSubmit }) => {
    const [title, setTitle] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (title.trim()) {
            onSubmit(title);
            setTitle('');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div
                className="bg-card w-full max-w-md rounded-3xl shadow-2xl overflow-hidden transform transition-all scale-100"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Create New Notebook</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2 text-muted-foreground">Notebook Title</label>
                        <input
                            type="text"
                            autoFocus
                            className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 focus:bg-background focus:ring-2 focus:ring-primary focus:outline-none transition-colors text-lg"
                            placeholder="e.g., Biology 101, Project Alpha"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl hover:bg-muted font-medium transition-colors text-muted-foreground hover:text-foreground"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!title.trim()}
                            className="bg-primary text-primary-foreground px-8 py-2.5 rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
                        >
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateNotebookModal;
