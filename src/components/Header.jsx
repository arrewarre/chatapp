import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Book, Moon, Sun, ArrowLeft, Settings } from 'lucide-react';

const Header = ({ toggleTheme, theme, title }) => {
    const location = useLocation();
    const isNotebookPage = location.pathname.includes('/notebook/');

    return (
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border pl-6 pr-6 h-16 flex items-center justify-between transition-colors duration-300">
            <div className="flex items-center gap-4">
                {isNotebookPage ? (
                    <Link to="/" className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                        <ArrowLeft size={20} />
                    </Link>
                ) : (
                    <div className="p-2 bg-gradient-to-br from-primary to-blue-400 rounded-xl text-white shadow-md">
                        <Book size={20} />
                    </div>
                )}

                {title ? (
                    <h1 className="font-semibold text-lg truncate max-w-md">{title}</h1>
                ) : (
                    <Link to="/" className="font-semibold text-xl tracking-tight hover:opacity-80 transition-opacity">
                        NotebookLM Clone
                    </Link>
                )}
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Toggle theme"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button
                    onClick={() => window.dispatchEvent(new CustomEvent('open-settings'))}
                    className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Settings & API Key"
                >
                    <Settings size={20} />
                </button>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 border-2 border-background ring-2 ring-muted cursor-pointer"></div>
            </div>
        </header>
    );
};

export default Header;
