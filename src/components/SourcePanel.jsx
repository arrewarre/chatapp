import React, { useRef } from 'react';
import { Plus, FileText, Trash2, Image as ImageIcon } from 'lucide-react';
import { processFile } from '../utils/fileProcessor';

const SourcePanel = ({ sources, setSources, onSourceClick }) => {
    const fileInputRef = useRef(null);

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);

        for (const file of files) {
            try {
                const processedFile = await processFile(file);
                setSources(prev => [...prev, {
                    id: Date.now() + Math.random(),
                    title: file.name,
                    type: processedFile.type,
                    content: processedFile.content,
                    pdfData: processedFile.pdfData, // Include PDF data if available
                    mimeType: processedFile.mimeType, // Include mime type for images
                    createdAt: new Date().toISOString()
                }]);
            } catch (error) {
                console.error("Error processing file:", error);
                alert(`Failed to process ${file.name}: ${error.message}`);
            }
        }
    };

    const handleDeleteSource = (e, id) => {
        e.stopPropagation();
        setSources(sources.filter(s => s.id !== id));
    };

    return (
        <div className="h-full flex flex-col bg-background border-r border-border/50">
            <div className="p-4 border-b border-border/50 flex justify-between items-center bg-muted/20">

                <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Sources</h2>
                <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-medium">{sources.length}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors group"
                >
                    <div className="bg-primary/10 text-primary p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
                        <Plus size={24} />
                    </div>
                    <p className="text-sm font-medium mb-1">Add Source</p>
                    <p className="text-xs text-muted-foreground">Docs or Images</p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        multiple
                        accept=".txt,.md,.pdf,.docx,.pptx,.png,.jpg,.jpeg,.webp,.heic"
                        className="hidden"
                    />
                </div>

                {sources.map(source => (
                    <div
                        key={source.id}
                        onClick={() => onSourceClick(source)}
                        className="group flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 cursor-pointer border border-transparent hover:border-border transition-all"
                    >
                        <div className="mt-1 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-primary">
                            {source.type === 'image' ? <ImageIcon size={18} /> : <FileText size={18} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate pr-2">{source.title}</h4>
                            <p className="text-xs text-muted-foreground truncate">
                                {source.type.toUpperCase()} • {source.content.length > 1000 ? Math.round(source.content.length / 1000) + 'k' : source.content.length} chars
                            </p>
                        </div>
                        <button
                            onClick={(e) => handleDeleteSource(e, source.id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SourcePanel;
