import React from 'react';
import { MoreVertical, FileText, Trash2 } from 'lucide-react';

const NotebookCard = ({ notebook, onDelete, onClick }) => {
    // Map index to CSS variables defined in index.css
    const colorVar = `var(--color-${notebook.colorIndex})`;
    const colorFgVar = `var(--color-${notebook.colorIndex}-fg)`;

    return (
        <div
            onClick={onClick}
            className="notebook-card bg-card border border-border rounded-3xl p-6 cursor-pointer relative group h-64 flex flex-col justify-between overflow-hidden"
        >
            {/* Background decoration */}
            <div
                className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-50 transition-transform group-hover:scale-110"
                style={{ backgroundColor: colorVar }}
            ></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-sm"
                        style={{ backgroundColor: colorVar, color: colorFgVar }}
                    >
                        {notebook.title.charAt(0).toUpperCase()}
                    </div>
                    <button
                        onClick={onDelete}
                        className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>

                <h3 className="font-bold text-xl mb-1 line-clamp-2">{notebook.title}</h3>
                <p className="text-muted-foreground text-sm">
                    Updated {new Date(notebook.updatedAt).toLocaleDateString()}
                </p>
            </div>

            <div className="relative z-10 flex items-center gap-2 text-sm text-muted-foreground mt-auto">
                <div className="flex items-center gap-1 bg-muted px-3 py-1.5 rounded-full">
                    <FileText size={14} />
                    <span>{notebook.sourceCount || 0} sources</span>
                </div>
            </div>
        </div>
    );
};

export default NotebookCard;
