import React, { useRef, useEffect } from 'react';
import { Send, CornerDownLeft, Paperclip } from 'lucide-react';

const MessageInput = ({ onSend, disabled, placeholder }) => {
    const [input, setInput] = React.useState('');
    const [selectedImage, setSelectedImage] = React.useState(null);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSend = () => {
        if ((input.trim() || selectedImage) && !disabled) {
            onSend(input, selectedImage);
            setInput('');
            setSelectedImage(null);
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleChange = (e) => {
        setInput(e.target.value);
        // Auto-resize
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setSelectedImage({
                    file,
                    preview: e.target.result
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Trigger file input click
    const handleAttachClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="relative">
            {selectedImage && (
                <div className="mb-2 relative inline-block">
                    <img
                        src={selectedImage.preview}
                        alt="Preview"
                        className="h-20 rounded-lg border border-border"
                    />
                    <button
                        onClick={removeImage}
                        className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 shadow-sm hover:opacity-90 transition-opacity"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            )}

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
            />

            <div className="bg-muted/50 border border-border rounded-3xl p-2 flex items-end gap-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                <button
                    onClick={handleAttachClick}
                    disabled={disabled}
                    className="p-2.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-all mb-0.5"
                    title="Attach image"
                >
                    <Paperclip size={18} />
                </button>

                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onPaste={(e) => {
                        const items = e.clipboardData?.items;
                        if (items) {
                            for (let i = 0; i < items.length; i++) {
                                if (items[i].type.indexOf('image') !== -1) {
                                    e.preventDefault();
                                    const file = items[i].getAsFile();
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (e) => {
                                            setSelectedImage({
                                                file,
                                                preview: e.target.result
                                            });
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                    return;
                                }
                            }
                        }
                    }}
                    placeholder={placeholder || (selectedImage ? "Describe the image..." : "Ask questions about your sources...")}
                    disabled={disabled}
                    className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px] py-2.5 px-0 text-sm md:text-base custom-scrollbar"
                    rows={1}
                />
                <button
                    onClick={handleSend}
                    disabled={(!input.trim() && !selectedImage) || disabled}
                    className="p-2.5 bg-primary text-primary-foreground rounded-full hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all mb-0.5"
                >
                    <Send size={18} />
                </button>
            </div>
            <div className="text-[10px] text-muted-foreground text-center mt-2 opacity-60">
                NotebookLM may display inaccurate info, including about people, so double-check its responses.
            </div>
        </div>
    );
};

export default MessageInput;
