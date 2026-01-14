import React from 'react';
import { X, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const SourcePreview = ({ source, isOpen, onClose }) => {
    if (!isOpen || !source) return null;

    return (
        <div className="h-full flex flex-col bg-background animate-fade-in">
            <div className="p-4 border-b border-border/50 flex justify-between items-center bg-muted/20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg">
                        <FileText size={20} />
                    </div>
                    <div>
                        <h2 className="font-semibold text-lg">{source.title}</h2>
                        <p className="text-xs text-muted-foreground">{source.type.toUpperCase()} Content</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-background">
                <div className="prose dark:prose-invert max-w-none">
                    {source.type === 'pdf' ? (
                        <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{source.content}</div>
                    ) : source.type === 'text' && source.title.endsWith('.md') ? (
                        <ReactMarkdown>{source.content}</ReactMarkdown>
                    ) : (
                        <div className="whitespace-pre-wrap font-sans text-base leading-relaxed">{source.content}</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SourcePreview;
