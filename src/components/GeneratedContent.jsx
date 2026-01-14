import React from 'react';
import ReactMarkdown from 'react-markdown';
import { X, Copy, Check } from 'lucide-react';

const GeneratedContent = ({ content, type, isOpen, onClose }) => {
    const [copied, setCopied] = React.useState(false);

    if (!isOpen || !content) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const titles = {
        summary: 'Briefing Document',
        faq: 'Frequently Asked Questions',
        'study-guide': 'Study Guide',
        timeline: 'Key Events Timeline'
    };

    return (
        <div className="h-full flex flex-col bg-background animate-fade-in">
            <div className="p-4 border-b border-border/50 flex justify-between items-center bg-muted/20">
                <h2 className="font-semibold text-lg">{titles[type] || 'Generated Content'}</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCopy}
                        className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                        title="Copy to clipboard"
                    >
                        {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-background">
                <article className="prose dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-primary">
                    <ReactMarkdown>{content}</ReactMarkdown>
                </article>
            </div>
        </div>
    );
};

export default GeneratedContent;
