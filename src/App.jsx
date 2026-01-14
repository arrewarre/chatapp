import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import NotebookPage from './pages/NotebookPage';

function App() {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        // Check system preference on load
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
        }
    }, []);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <Routes>
                <Route path="/" element={<HomePage theme={theme} toggleTheme={toggleTheme} />} />
                <Route path="/notebook/:id" element={<NotebookPage theme={theme} toggleTheme={toggleTheme} />} />
            </Routes>
        </div>
    );
}

export default App;
