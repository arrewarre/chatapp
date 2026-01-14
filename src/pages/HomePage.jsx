import React, { useState, useEffect } from 'react';
import { Plus, Search, Book } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import NotebookCard from '../components/NotebookCard';
import CreateNotebookModal from '../components/CreateNotebookModal';
import useLocalStorage from '../hooks/useLocalStorage';

const HomePage = ({ theme, toggleTheme }) => {
    const navigate = useNavigate();
    const [notebooks, setNotebooks] = useLocalStorage('notebooks', []);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleCreateNotebook = (title) => {
        const newNotebook = {
            id: uuidv4(),
            title,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            sourceCount: 0,
            colorIndex: Math.floor(Math.random() * 5) + 1 // random color 1-5
        };
        setNotebooks([newNotebook, ...notebooks]);
        setIsModalOpen(false);
        navigate(`/notebook/${newNotebook.id}`);
    };

    const handleDeleteNotebook = (e, id) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this notebook?')) {
            setNotebooks(notebooks.filter(n => n.id !== id));
        }
    };

    const filteredNotebooks = notebooks.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen-dynamic pb-10 safe-area-inset-x">
            <Header toggleTheme={toggleTheme} theme={theme} />

            <main className="max-w-6xl mx-auto px-4 xs:px-6 pt-8 xs:pt-12">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-8 sm:mb-12">
                    <div className="w-full sm:w-auto">
                        <h1 className="text-fluid-4xl font-normal mb-2 tracking-tight">Welcome to NotebookLM</h1>
                        <p className="text-muted-foreground text-fluid-lg">Your personalized AI research assistant</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 xs:px-6 py-3 rounded-2xl hover:bg-opacity-90 transition-all shadow-lg mouse:hover:shadow-xl mouse:hover:-translate-y-1 w-full sm:w-auto font-medium touch-target"
                    >
                        <div className="bg-white/20 p-1 rounded-full">
                            <Plus size={20} />
                        </div>
                        New Notebook
                    </button>
                </div>

                <div className="mb-6 sm:mb-8 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                    <input
                        type="text"
                        placeholder="Search your notebooks..."
                        className="w-full pl-12 pr-4 py-3 xs:py-4 rounded-2xl border border-border bg-card text-card-foreground focus:ring-2 focus:ring-primary focus:outline-none transition-shadow shadow-sm text-fluid-base"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {filteredNotebooks.length === 0 ? (
                    <div className="text-center py-12 xs:py-20 opacity-60">
                        <div className="w-20 h-20 xs:w-24 xs:h-24 bg-muted rounded-full mx-auto flex items-center justify-center mb-4">
                            <Book size={36} className="xs:w-10 xs:h-10" />
                        </div>
                        <h3 className="text-fluid-xl font-medium mb-2">No notebooks yet</h3>
                        <p className="text-fluid-base">Create your first notebook to get started</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
                        {filteredNotebooks.map(notebook => (
                            <NotebookCard
                                key={notebook.id}
                                notebook={notebook}
                                onDelete={(e) => handleDeleteNotebook(e, notebook.id)}
                                onClick={() => navigate(`/notebook/${notebook.id}`)}
                            />
                        ))}
                    </div>
                )}
            </main>

            <CreateNotebookModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateNotebook}
            />
        </div>
    );
};

export default HomePage;
