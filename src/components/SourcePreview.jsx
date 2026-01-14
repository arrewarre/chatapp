import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    X, FileText, ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
    Search, Download, RotateCw, Maximize2, Grid3X3,
    ChevronDown, ChevronUp, Loader2, Copy, Check,
    Highlighter, MousePointer2, Hand
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const PDFViewer = ({ pdfData }) => {
    const [pdf, setPdf] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [numPages, setNumPages] = useState(0);
    const [scale, setScale] = useState(1.2);
    const [rotation, setRotation] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [showThumbnails, setShowThumbnails] = useState(false);
    const [thumbnails, setThumbnails] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
    const [showSearch, setShowSearch] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [textContent, setTextContent] = useState({});
    const [selectedText, setSelectedText] = useState('');
    const [copied, setCopied] = useState(false);
    const [viewMode, setViewMode] = useState('select'); // 'select', 'pan', 'highlight'
    const [highlights, setHighlights] = useState([]);
    const [pageInputValue, setPageInputValue] = useState('1');

    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const textLayerRef = useRef(null);
    const searchInputRef = useRef(null);

    // Load PDF
    useEffect(() => {
        const loadPdf = async () => {
            setIsLoading(true);
            try {
                const binaryString = atob(pdfData);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }

                const loadedPdf = await pdfjsLib.getDocument({ data: bytes }).promise;
                setPdf(loadedPdf);
                setNumPages(loadedPdf.numPages);
                setPageInputValue('1');
            } catch (error) {
                console.error('Error loading PDF:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (pdfData) {
            loadPdf();
        }
    }, [pdfData]);

    // Generate thumbnails
    useEffect(() => {
        const generateThumbnails = async () => {
            if (!pdf || !showThumbnails) return;

            const thumbs = [];
            for (let i = 1; i <= Math.min(numPages, 50); i++) {
                try {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 0.2 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    await page.render({ canvasContext: context, viewport }).promise;
                    thumbs.push({ pageNum: i, dataUrl: canvas.toDataURL() });
                } catch (e) {
                    console.error('Error generating thumbnail:', e);
                }
            }
            setThumbnails(thumbs);
        };

        generateThumbnails();
    }, [pdf, numPages, showThumbnails]);

    // Render current page with text layer
    useEffect(() => {
        const renderPage = async () => {
            if (!pdf || !canvasRef.current) return;
            setIsLoading(true);

            try {
                const page = await pdf.getPage(currentPage);
                const viewport = page.getViewport({ scale, rotation });
                const canvas = canvasRef.current;
                const context = canvas.getContext('2d');

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context, viewport }).promise;

                // Render text layer for selection
                if (textLayerRef.current) {
                    textLayerRef.current.innerHTML = '';
                    textLayerRef.current.style.width = `${viewport.width}px`;
                    textLayerRef.current.style.height = `${viewport.height}px`;

                    const textContentData = await page.getTextContent();
                    setTextContent(prev => ({ ...prev, [currentPage]: textContentData }));

                    const textItems = textContentData.items;
                    textItems.forEach((item) => {
                        const tx = pdfjsLib.Util.transform(
                            viewport.transform,
                            item.transform
                        );

                        const span = document.createElement('span');
                        span.textContent = item.str;
                        span.style.position = 'absolute';
                        span.style.left = `${tx[4]}px`;
                        span.style.top = `${tx[5] - item.height * scale}px`;
                        span.style.fontSize = `${item.height * scale}px`;
                        span.style.fontFamily = item.fontName || 'sans-serif';
                        span.style.transformOrigin = 'left bottom';
                        span.style.color = 'transparent';
                        span.style.whiteSpace = 'pre';
                        span.style.cursor = viewMode === 'select' ? 'text' : viewMode === 'pan' ? 'grab' : 'crosshair';
                        span.className = 'pdf-text-span';

                        // Highlight search matches
                        if (searchQuery && item.str.toLowerCase().includes(searchQuery.toLowerCase())) {
                            span.style.backgroundColor = 'rgba(255, 255, 0, 0.4)';
                        }

                        textLayerRef.current.appendChild(span);
                    });
                }
            } catch (error) {
                console.error('Error rendering page:', error);
            } finally {
                setIsLoading(false);
            }
        };

        renderPage();
    }, [pdf, currentPage, scale, rotation, searchQuery, viewMode]);

    // Search functionality
    const handleSearch = useCallback(async () => {
        if (!pdf || !searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        const results = [];
        const query = searchQuery.toLowerCase();

        for (let i = 1; i <= numPages; i++) {
            try {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                const pageText = content.items.map(item => item.str).join(' ').toLowerCase();

                if (pageText.includes(query)) {
                    let startIndex = 0;
                    while ((startIndex = pageText.indexOf(query, startIndex)) !== -1) {
                        results.push({ page: i, index: startIndex });
                        startIndex += query.length;
                    }
                }
            } catch (e) {
                console.error('Error searching page:', e);
            }
        }

        setSearchResults(results);
        setCurrentSearchIndex(0);
        if (results.length > 0) {
            setCurrentPage(results[0].page);
        }
        setIsSearching(false);
    }, [pdf, searchQuery, numPages]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                setShowSearch(true);
                setTimeout(() => searchInputRef.current?.focus(), 100);
            }
            if (e.key === 'Escape') {
                setShowSearch(false);
            }
            if (e.key === 'Enter' && showSearch) {
                if (e.shiftKey) {
                    navigateSearch('prev');
                } else {
                    handleSearch();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleSearch, showSearch]);

    // Navigation handlers
    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            setPageInputValue(String(currentPage - 1));
        }
    };

    const handleNextPage = () => {
        if (currentPage < numPages) {
            setCurrentPage(currentPage + 1);
            setPageInputValue(String(currentPage + 1));
        }
    };

    const handlePageInputChange = (e) => {
        setPageInputValue(e.target.value);
    };

    const handlePageInputSubmit = (e) => {
        if (e.key === 'Enter') {
            const pageNum = parseInt(pageInputValue);
            if (pageNum >= 1 && pageNum <= numPages) {
                setCurrentPage(pageNum);
            } else {
                setPageInputValue(String(currentPage));
            }
        }
    };

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 4.0));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.25));
    const handleRotate = () => setRotation(prev => (prev + 90) % 360);
    const handleFitWidth = () => {
        if (containerRef.current && canvasRef.current) {
            const containerWidth = containerRef.current.clientWidth - 48;
            setScale(containerWidth / (canvasRef.current.width / scale));
        }
    };

    const navigateSearch = (direction) => {
        if (searchResults.length === 0) return;

        let newIndex;
        if (direction === 'next') {
            newIndex = (currentSearchIndex + 1) % searchResults.length;
        } else {
            newIndex = (currentSearchIndex - 1 + searchResults.length) % searchResults.length;
        }
        setCurrentSearchIndex(newIndex);
        setCurrentPage(searchResults[newIndex].page);
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = `data:application/pdf;base64,${pdfData}`;
        link.download = 'document.pdf';
        link.click();
    };

    const handleCopySelection = async () => {
        const selection = window.getSelection();
        const text = selection.toString();
        if (text) {
            await navigator.clipboard.writeText(text);
            setSelectedText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleTextSelection = () => {
        const selection = window.getSelection();
        const text = selection.toString();
        if (text) {
            setSelectedText(text);
        }
    };

    return (
        <div className="flex h-full bg-background">
            {/* Thumbnails sidebar */}
            {showThumbnails && (
                <div className="w-40 border-r border-border/50 overflow-y-auto bg-muted/20 p-2 flex flex-col gap-2">
                    {thumbnails.map((thumb) => (
                        <div
                            key={thumb.pageNum}
                            onClick={() => {
                                setCurrentPage(thumb.pageNum);
                                setPageInputValue(String(thumb.pageNum));
                            }}
                            className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:border-primary/50 ${
                                currentPage === thumb.pageNum ? 'border-primary shadow-lg' : 'border-transparent'
                            }`}
                        >
                            <img src={thumb.dataUrl} alt={`Page ${thumb.pageNum}`} className="w-full" />
                            <div className="text-xs text-center py-1 bg-muted/50">{thumb.pageNum}</div>
                        </div>
                    ))}
                    {numPages > 50 && (
                        <div className="text-xs text-muted-foreground text-center py-2">
                            Showing first 50 pages
                        </div>
                    )}
                </div>
            )}

            <div className="flex-1 flex flex-col">
                {/* Toolbar */}
                <div className="flex items-center justify-between p-3 border-b border-border/50 bg-gradient-to-r from-muted/30 to-muted/10 backdrop-blur-sm">
                    {/* Left section: Navigation */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setShowThumbnails(!showThumbnails)}
                            className={`p-2 rounded-lg transition-all ${showThumbnails ? 'bg-primary/20 text-primary' : 'hover:bg-muted'}`}
                            title="Toggle Thumbnails"
                        >
                            <Grid3X3 size={18} />
                        </button>
                        <div className="w-px h-6 bg-border/50 mx-1" />
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage <= 1}
                            className="p-2 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            title="Previous Page"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <div className="flex items-center gap-1 bg-muted/50 rounded-lg px-2 py-1">
                            <input
                                type="text"
                                value={pageInputValue}
                                onChange={handlePageInputChange}
                                onKeyDown={handlePageInputSubmit}
                                className="w-10 text-center bg-transparent text-sm font-medium focus:outline-none"
                            />
                            <span className="text-muted-foreground text-sm">/ {numPages}</span>
                        </div>
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage >= numPages}
                            className="p-2 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            title="Next Page"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    {/* Center section: View mode & Zoom */}
                    <div className="flex items-center gap-1">
                        <div className="flex items-center bg-muted/50 rounded-lg p-1 gap-0.5">
                            <button
                                onClick={() => setViewMode('select')}
                                className={`p-1.5 rounded transition-all ${viewMode === 'select' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                                title="Select Text (S)"
                            >
                                <MousePointer2 size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode('pan')}
                                className={`p-1.5 rounded transition-all ${viewMode === 'pan' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                                title="Pan Mode (H)"
                            >
                                <Hand size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode('highlight')}
                                className={`p-1.5 rounded transition-all ${viewMode === 'highlight' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                                title="Highlight Mode"
                            >
                                <Highlighter size={16} />
                            </button>
                        </div>
                        <div className="w-px h-6 bg-border/50 mx-1" />
                        <button
                            onClick={handleZoomOut}
                            disabled={scale <= 0.25}
                            className="p-2 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            title="Zoom Out"
                        >
                            <ZoomOut size={18} />
                        </button>
                        <span className="text-sm font-medium min-w-[50px] text-center bg-muted/50 rounded px-2 py-1">
                            {Math.round(scale * 100)}%
                        </span>
                        <button
                            onClick={handleZoomIn}
                            disabled={scale >= 4.0}
                            className="p-2 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            title="Zoom In"
                        >
                            <ZoomIn size={18} />
                        </button>
                        <button
                            onClick={handleFitWidth}
                            className="p-2 rounded-lg hover:bg-muted transition-all"
                            title="Fit Width"
                        >
                            <Maximize2 size={18} />
                        </button>
                    </div>

                    {/* Right section: Tools */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => {
                                setShowSearch(!showSearch);
                                if (!showSearch) setTimeout(() => searchInputRef.current?.focus(), 100);
                            }}
                            className={`p-2 rounded-lg transition-all ${showSearch ? 'bg-primary/20 text-primary' : 'hover:bg-muted'}`}
                            title="Search (Ctrl+F)"
                        >
                            <Search size={18} />
                        </button>
                        <button
                            onClick={handleRotate}
                            className="p-2 rounded-lg hover:bg-muted transition-all"
                            title="Rotate"
                        >
                            <RotateCw size={18} />
                        </button>
                        <button
                            onClick={handleCopySelection}
                            className="p-2 rounded-lg hover:bg-muted transition-all"
                            title="Copy Selection"
                        >
                            {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                        </button>
                        <button
                            onClick={handleDownload}
                            className="p-2 rounded-lg hover:bg-muted transition-all"
                            title="Download PDF"
                        >
                            <Download size={18} />
                        </button>
                    </div>
                </div>

                {/* Search bar */}
                {showSearch && (
                    <div className="flex items-center gap-2 p-3 border-b border-border/50 bg-muted/20 animate-fade-in">
                        <div className="relative flex-1 max-w-md">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Search in document..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={isSearching || !searchQuery.trim()}
                            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 text-sm font-medium transition-all flex items-center gap-2"
                        >
                            {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                            Search
                        </button>
                        {searchResults.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                    {currentSearchIndex + 1} of {searchResults.length}
                                </span>
                                <button
                                    onClick={() => navigateSearch('prev')}
                                    className="p-1.5 rounded hover:bg-muted transition-all"
                                >
                                    <ChevronUp size={16} />
                                </button>
                                <button
                                    onClick={() => navigateSearch('next')}
                                    className="p-1.5 rounded hover:bg-muted transition-all"
                                >
                                    <ChevronDown size={16} />
                                </button>
                            </div>
                        )}
                        <button
                            onClick={() => {
                                setShowSearch(false);
                                setSearchQuery('');
                                setSearchResults([]);
                            }}
                            className="p-2 rounded-lg hover:bg-muted transition-all"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* PDF Content */}
                <div
                    ref={containerRef}
                    className={`flex-1 overflow-auto p-6 bg-gradient-to-b from-muted/10 to-muted/5 ${viewMode === 'pan' ? 'cursor-grab active:cursor-grabbing' : ''}`}
                    onMouseUp={handleTextSelection}
                >
                    {isLoading && !pdf ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 size={32} className="animate-spin text-primary" />
                                <span className="text-muted-foreground">Loading PDF...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <div className="relative shadow-2xl rounded-lg overflow-hidden bg-white">
                                <canvas ref={canvasRef} />
                                <div
                                    ref={textLayerRef}
                                    className="absolute top-0 left-0 overflow-hidden"
                                    style={{
                                        mixBlendMode: 'multiply',
                                        userSelect: viewMode === 'select' ? 'text' : 'none'
                                    }}
                                />
                                {isLoading && (
                                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                                        <Loader2 size={24} className="animate-spin text-primary" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Selected text tooltip */}
                {selectedText && (
                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-background border border-border rounded-lg shadow-lg p-3 max-w-md animate-fade-in">
                        <div className="flex items-center justify-between gap-4 mb-2">
                            <span className="text-xs text-muted-foreground font-medium">Selected Text</span>
                            <button
                                onClick={async () => {
                                    await navigator.clipboard.writeText(selectedText);
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 2000);
                                }}
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                                {copied ? <Check size={12} /> : <Copy size={12} />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                        <p className="text-sm line-clamp-3">{selectedText}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

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

            {source.type === 'pdf' && source.pdfData ? (
                <PDFViewer pdfData={source.pdfData} />
            ) : source.type === 'image' ? (
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-muted/5 flex items-center justify-center">
                    <img
                        src={`data:${source.mimeType};base64,${source.content}`}
                        alt={source.title}
                        className="max-w-full h-auto rounded-lg shadow-lg"
                    />
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-background">
                    <div className="prose dark:prose-invert max-w-none">
                        {source.type === 'text' && source.title.endsWith('.md') ? (
                            <ReactMarkdown>{source.content}</ReactMarkdown>
                        ) : (
                            <div className="whitespace-pre-wrap font-sans text-base leading-relaxed">{source.content}</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SourcePreview;
