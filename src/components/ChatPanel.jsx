import React, { useRef, useEffect } from 'react';
import { Bot, User, Copy, Sparkles, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import MessageInput from './MessageInput';

const ChatPanel = ({ messages, onSendMessage, isLoading, suggestedQuestions }) => {
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    return (
        <div className="h-full flex flex-col bg-background relative">
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-80 mt-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-2xl flex items-center justify-center mb-6 text-primary">
                            <Sparkles size={32} />
                        </div>
                        <h2 className="text-2xl font-semibold mb-2">Welcome to your notebook</h2>
                        <p className="text-muted-foreground max-w-md mb-8">
                            Upload sources to the left to get started. Once you have sources, I can summarize them, answer questions, or generate study guides.
                        </p>

                        {suggestedQuestions && suggestedQuestions.length > 0 && (
                            <div className="w-full max-w-lg space-y-2">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Suggested actions</p>
                                {suggestedQuestions.map((q, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => onSendMessage(q)}
                                        className="w-full text-left p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors text-sm flex items-center gap-3 group"
                                    >
                                        <div className="p-1.5 bg-muted rounded-full group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            <MessageSquare size={14} />
                                        </div>
                                        {q}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground'
                                    }`}>
                                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                </div>

                                <div className={`max-w-[85%] space-y-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                    <div className={`prose dark:prose-invert prose-sm max-w-none leading-relaxed ${msg.role === 'user'
                                        ? 'bg-muted/50 rounded-2xl rounded-tr-sm px-5 py-3 inline-block text-left'
                                        : ''
                                        }`}>
                                        {msg.role === 'user' ? (
                                            <div>
                                                {msg.images && msg.images.map((img, i) => (
                                                    <img
                                                        key={i}
                                                        src={img.preview || img.data} // Handle both preview (if data URL) or just data
                                                        alt="Attached"
                                                        className="max-h-48 rounded-lg mb-2"
                                                    />
                                                ))}
                                                {msg.content}
                                            </div>
                                        ) : (
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                rehypePlugins={[rehypeHighlight]}
                                                components={{
                                                    a: ({ node, ...props }) => {
                                                        if (props.href && props.href.startsWith('#source-')) {
                                                            const sourceId = props.href.replace('#source-', '');
                                                            return (
                                                                <span className="inline-flex items-center justify-center px-1.5 py-0.5 mx-1 rounded-md bg-primary/10 text-primary text-xs font-medium border border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors transform translate-y-[-1px]">
                                                                    <span className="opacity-50 text-[10px] mr-1">#</span>{sourceId}
                                                                </span>
                                                            );
                                                        }
                                                        return <a {...props} className="text-primary hover:underline" />;
                                                    }
                                                }}
                                            >
                                                {msg.content.replace(/\[\[Source (\d+)\]\]/g, '[$1](#source-$1)')}
                                            </ReactMarkdown>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>

            <div className="p-4 bg-background/80 backdrop-blur-md border-t border-border flex flex-col gap-3">
                {/* Quick Actions */}
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {['Summarize', 'Explain', 'Key Points', 'Critique'].map((action) => (
                        <button
                            key={action}
                            onClick={() => {
                                const prompts = {
                                    'Summarize': "Summarize the conversation so far.",
                                    'Explain': "Explain the last point in more detail.",
                                    'Key Points': "What are the key takeaways?",
                                    'Critique': "Critique the arguments presented."
                                };
                                onSendMessage(prompts[action]);
                            }}
                            disabled={isLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 hover:bg-muted text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap border border-transparent hover:border-border/50"
                        >
                            <Sparkles size={12} className="opacity-70" />
                            {action}
                        </button>
                    ))}
                </div>

                <MessageInput onSend={onSendMessage} disabled={isLoading} />
            </div>
        </div>
    );
};

export default ChatPanel;
