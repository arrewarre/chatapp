import React from 'react';
import { Headphones, FileText, HelpCircle, Calendar, FileOutput, Play } from 'lucide-react';

const StudioPanel = ({ onGenerate, isGenerating }) => {
    const tools = [
        { id: 'summary', icon: FileOutput, label: 'Briefing Doc', desc: 'Get a concise summary and key takeaways' },
        { id: 'faq', icon: HelpCircle, label: 'FAQ', desc: 'Generate frequently asked questions' },
        { id: 'study-guide', icon: FileText, label: 'Study Guide', desc: 'Create a study guide with quizzes' },
        { id: 'timeline', icon: Calendar, label: 'Timeline', desc: 'Extract key dates and events' },
    ];

    return (
        <div className="h-full flex flex-col bg-background border-l border-border/50 p-6 gap-6 overflow-y-auto custom-scrollbar">
            <div>
                <h2 className="font-semibold text-lg mb-4">Notebook Guide</h2>
                <div className="p-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl border border-blue-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary text-primary-foreground rounded-full">
                            <Headphones size={20} />
                        </div>
                        <h3 className="font-medium">Audio Overview</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                        Generate a conversational podcast about your specific sources.
                    </p>
                    <button
                        disabled={true}
                        className="w-full flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-border py-2 rounded-xl text-sm font-medium hover:bg-muted transition-colors opacity-70 cursor-not-allowed"
                    >
                        <Play size={16} /> Generating... (Coming Soon)
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Create</h3>
                <div className="grid grid-cols-1 gap-3">
                    {tools.map(tool => (
                        <button
                            key={tool.id}
                            onClick={() => onGenerate(tool.id)}
                            disabled={isGenerating}
                            className="flex items-start gap-4 p-4 rounded-xl border border-border hover:bg-muted/50 text-left transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                        >
                            <div className="p-2 bg-muted rounded-lg text-foreground">
                                <tool.icon size={20} />
                            </div>
                            <div>
                                <div className="font-medium text-sm">{tool.label}</div>
                                <div className="text-xs text-muted-foreground mt-0.5">{tool.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StudioPanel;
