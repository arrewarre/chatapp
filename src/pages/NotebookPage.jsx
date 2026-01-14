import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import SourcePanel from '../components/SourcePanel';
import ChatPanel from '../components/ChatPanel';
import StudioPanel from '../components/StudioPanel';
import SourcePreview from '../components/SourcePreview';
import GeneratedContent from '../components/GeneratedContent';
import useLocalStorage from '../hooks/useLocalStorage';
import { initializeGemini, generateResponse, generateSummary, generateFAQ, generateStudyGuide } from '../utils/gemini';
import { Key } from 'lucide-react';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';

const NotebookPage = ({ theme, toggleTheme }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [notebooks, setNotebooks] = useLocalStorage('notebooks', []);
    const [apiKey, setApiKey] = useLocalStorage('gemini_api_key', '');
    const [showKeyModal, setShowKeyModal] = useState(!apiKey);

    const notebook = notebooks.find(n => n.id === id);

    // Local state for this session (sources could be persisted too)
    const [sources, setSources] = useLocalStorage(`sources_${id}`, []);
    const [messages, setMessages] = useLocalStorage(`messages_${id}`, []);
    const [isProcessing, setIsProcessing] = useState(false);
    const [suggestedQuestions, setSuggestedQuestions] = useState([]);
    const [previewSource, setPreviewSource] = useState(null);
    const [generatedContent, setGeneratedContent] = useState(null);
    const [generatedType, setGeneratedType] = useState(null);

    useEffect(() => {
        if (!notebook) {
            navigate('/');
        } else {
            // Initialize Gemini if key exists
            if (apiKey) initializeGemini(apiKey);
        }

        const handleOpenSettings = () => setShowKeyModal(true);
        window.addEventListener('open-settings', handleOpenSettings);
        return () => window.removeEventListener('open-settings', handleOpenSettings);
    }, [id, notebook, apiKey, navigate]);

    // Update source count and generate questions
    useEffect(() => {
        if (notebook && notebook.sourceCount !== sources.length) {
            const updatedNotebooks = notebooks.map(n =>
                n.id === id ? { ...n, sourceCount: sources.length, updatedAt: new Date().toISOString() } : n
            );
            setNotebooks(updatedNotebooks);
        }

        // Generate suggested questions if we have sources and no messages (or refresh them)
        if (sources.length > 0 && apiKey) {
            const generateQuestions = async () => {
                try {
                    const fullContent = sources.map(s => s.content).join('\n\n');
                    const questions = await import('../utils/gemini').then(m => m.generateSuggestedQuestions(fullContent));
                    setSuggestedQuestions(questions);
                } catch (error) {
                    console.error("Failed to generate questions:", error);
                }
            };
            generateQuestions();
        } else {
            setSuggestedQuestions([
                "Summarize the main points",
                "What are the key themes?",
                "Create a study guide",
            ]);
        }
    }, [sources.length, apiKey]);

    const handleSendMessage = async (text, attachedImage) => {
        if (!text.trim() && !attachedImage) return;

        if (!apiKey) {
            setShowKeyModal(true);
            return;
        }

        const newMessage = {
            role: 'user',
            content: text,
            images: attachedImage ? [attachedImage] : undefined
        };
        const newMessages = [...messages, newMessage];
        setMessages(newMessages);
        setIsProcessing(true);

        try {
            // Prepare context from sources
            const textSources = sources.filter(s => s.type !== 'image');
            let imageSources = sources.filter(s => s.type === 'image').map(s => ({
                mimeType: s.mimeType,
                data: s.content // Content in fileProcessor for images is the base64 string
            }));

            // Add attached image to context if present
            if (attachedImage) {
                // attachedImage.preview is a data URL: "data:image/png;base64,..."
                const match = attachedImage.preview.match(/^data:(.*);base64,(.*)$/);
                if (match) {
                    imageSources.push({
                        mimeType: match[1],
                        data: match[2]
                    });
                }
            }

            const context = textSources.map((s, index) => `[[Source ${index + 1}]] Title: ${s.title}\nContent: ${s.content}`).join('\n\n');

            const responseText = await generateResponse(messages, text, context, imageSources);

            setMessages([...newMessages, { role: 'model', content: responseText }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages([...newMessages, { role: 'model', content: "Sorry, I encountered an error. Please check your API key or try again." }]);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleGenerate = async (type) => {
        if (!apiKey) {
            setShowKeyModal(true);
            return;
        }

        if (sources.length === 0) {
            alert("Please add some sources first!");
            return;
        }

        setIsProcessing(true);
        try {
            // Combine all source content
            const fullContent = sources.map(s => s.content).join('\n\n');
            let result = '';

            switch (type) {
                case 'summary':
                    result = await generateSummary(fullContent);
                    break;
                case 'faq':
                    result = await generateFAQ(fullContent);
                    break;
                case 'study-guide':
                    result = await generateStudyGuide(fullContent);
                    break;
                case 'timeline':
                    result = await generateSummary(fullContent + "\n\nExtract a timeline of key events with dates.");
                    break;
                default:
                    break;
            }

            setGeneratedType(type);
            setGeneratedContent(result);
        } catch (error) {
            console.error("Generation error:", error);
            alert("Failed to generate content. Please check API key.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSaveKey = (e) => {
        e.preventDefault();
        const key = e.target.elements.key.value;
        if (key) {
            setApiKey(key);
            setShowKeyModal(false);
            initializeGemini(key);
        }
    };

    if (!notebook) return null;

    return (
        <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
            <Header
                theme={theme}
                toggleTheme={toggleTheme}
                title={notebook.title}
            />

            <div className="flex-1 flex min-h-0">
                <PanelGroup direction="horizontal" autoSaveId="notebook-panels-v3">
                    {/* Left Panel: Sources */}
                    <Panel defaultSize={33} minSize={20} collapsible={false}>
                        <div className="h-full">
                            {previewSource ? (
                                <SourcePreview
                                    source={previewSource}
                                    isOpen={!!previewSource}
                                    onClose={() => setPreviewSource(null)}
                                />
                            ) : (
                                <SourcePanel
                                    sources={sources}
                                    setSources={setSources}
                                    onSourceClick={setPreviewSource}
                                />
                            )}
                        </div>
                    </Panel>

                    <PanelResizeHandle className="w-px bg-border hover:bg-primary transition-colors data-[resize-handle-active]:bg-primary" />

                    {/* Center Panel: Chat */}
                    <Panel defaultSize={34} minSize={20} collapsible={false}>
                        <div className="h-full">
                            <ChatPanel
                                messages={messages}
                                onSendMessage={handleSendMessage}
                                isLoading={isProcessing}
                                suggestedQuestions={suggestedQuestions}
                            />
                        </div>
                    </Panel>

                    <PanelResizeHandle className="w-px bg-border hover:bg-primary transition-colors data-[resize-handle-active]:bg-primary" />

                    {/* Right Panel: Studio */}
                    <Panel defaultSize={33} minSize={20} collapsible={false}>
                        <div className="h-full">
                            {generatedContent ? (
                                <GeneratedContent
                                    content={generatedContent}
                                    type={generatedType}
                                    isOpen={!!generatedContent}
                                    onClose={() => setGeneratedContent(null)}
                                />
                            ) : (
                                <StudioPanel
                                    onGenerate={handleGenerate}
                                    isGenerating={isProcessing}
                                />
                            )}
                        </div>
                    </Panel>
                </PanelGroup>
            </div>

            {/* API Key Modal */}
            {showKeyModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-md rounded-3xl p-8 shadow-2xl border border-primary/20">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-primary/10 rounded-full text-primary">
                                <Key size={32} />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-center mb-2">Enter Gemini API Key</h2>
                        <p className="text-center text-muted-foreground mb-6">
                            To power the AI features, you need a Google Gemini API key. It's free to get started.
                        </p>
                        <form onSubmit={handleSaveKey}>
                            <input
                                name="key"
                                type="password"
                                placeholder="Paste your API key here..."
                                className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 mb-4 focus:ring-2 focus:ring-primary focus:outline-none"
                                autoFocus
                            />
                            <button
                                type="submit"
                                className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
                            >
                                Save & Continue
                            </button>
                            <div className="mt-4 text-center">
                                <a
                                    href="https://aistudio.google.com/app/apikey"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline"
                                >
                                    Get a free API key here
                                </a>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotebookPage;
