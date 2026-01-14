import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Book, Moon, Sun, ArrowLeft, Settings } from 'lucide-react';

const Header = ({ toggleTheme, theme, title }) => {
    const location = useLocation();
    const isNotebookPage = location.pathname.includes('/notebook/');

    return (
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border px-4 xs:px-6 h-14 xs:h-16 flex items-center justify-between transition-colors duration-300 safe-area-inset-top safe-area-inset-x">
            <div className="flex items-center gap-2 xs:gap-4 min-w-0 flex-1">
                {isNotebookPage ? (
                    <Link to="/" className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground touch-target flex items-center justify-center flex-shrink-0">
                        <ArrowLeft size={20} />
                    </Link>
                ) : (
                    <div className="p-2 bg-gradient-to-br from-primary to-blue-400 rounded-xl text-white shadow-md flex-shrink-0">
                        <Book size={20} />
                    </div>
                )}

                {title ? (
                    <h1 className="font-semibold text-fluid-lg truncate max-w-[40vw] xs:max-w-md">{title}</h1>
                ) : (
                    <Link to="/" className="font-semibold text-fluid-xl tracking-tight hover:opacity-80 transition-opacity whitespace-nowrap">
                        NotebookLM Clone
                    </Link>
                )}
            </div>

            <div className="flex items-center gap-1 xs:gap-2 flex-shrink-0">
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors touch-target flex items-center justify-center"
                    aria-label="Toggle theme"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button
                    onClick={() => window.dispatchEvent(new CustomEvent('open-settings'))}
                    className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors touch-target flex items-center justify-center"
                    title="Settings & API Key"
                    aria-label="Settings"
                >
                    <Settings size={20} />
                </button>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 border-2 border-background ring-2 ring-muted cursor-pointer flex-shrink-0" role="button" aria-label="User profile"></div>
            </div>
        </header>
    );
};

export default Header;
