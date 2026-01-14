import * as pdfjsLib from 'pdfjs-dist';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export const processFile = async (file) => {
    const fileType = file.type;

    if (fileType === 'application/pdf') {
        return await readPdfFile(file);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        return await readDocxFile(file);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
        return await readPptxFile(file);
    } else if (fileType === 'text/plain' || fileType === 'text/markdown' || file.name.endsWith('.md')) {
        return await readTextFile(file);
    } else if (fileType.startsWith('image/')) {
        return await readImageFile(file);
    } else {
        // Fallback checks for extensions if mime type fails or differs
        if (file.name.endsWith('.docx')) return await readDocxFile(file);
        if (file.name.endsWith('.pptx')) return await readPptxFile(file);

        throw new Error('Unsupported file type');
    }
};

const readTextFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve({
            name: file.name,
            content: e.target.result,
            type: 'text'
        });
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
    });
};

const readPdfFile = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += `[Page ${i}] ${pageText}\n\n`;
    }

    return {
        name: file.name,
        content: fullText,
        type: 'pdf'
    };
};

const readImageFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
            const base64Data = e.target.result.split(',')[1];
            resolve({
                name: file.name,
                content: base64Data, // Store base64 data as content
                type: 'image',
                mimeType: file.type
            });
        };
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
    });
};

const readDocxFile = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ arrayBuffer });

    return {
        name: file.name,
        content: result.value,
        type: 'docx'
    };
};

const readPptxFile = async (file) => {
    const JSZip = (await import('jszip')).default;
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    let fullText = '';
    const slideFiles = Object.keys(zip.files).filter(name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml'));

    // Sort slides numerically to ensure correct order
    slideFiles.sort((a, b) => {
        const numA = parseInt(a.match(/slide(\d+)\.xml/)[1]);
        const numB = parseInt(b.match(/slide(\d+)\.xml/)[1]);
        return numA - numB;
    });

    for (let i = 0; i < slideFiles.length; i++) {
        const fileName = slideFiles[i];
        const content = await zip.files[fileName].async('text');

        // Simple XML parsing to extract text from <a:t> tags
        // This regex finds content inside <a:t>...</a:t> tags
        const slideText = content.match(/<a:t>([^<]*)<\/a:t>/g);

        if (slideText) {
            const extractedText = slideText.map(t => t.replace(/<\/?a:t>/g, '')).join(' ');
            fullText += `[Slide ${i + 1}] ${extractedText}\n\n`;
        }
    }

    return {
        name: file.name,
        content: fullText || "No text content found in presentation.",
        type: 'pptx'
    };
};
