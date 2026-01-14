import { GoogleGenAI } from "@google/genai";

let ai = null;
const MODEL_NAME = "gemini-3-flash-preview";

export const initializeGemini = (apiKey) => {
    if (!apiKey) return false;
    try {
        ai = new GoogleGenAI({ apiKey });
        return true;
    } catch (error) {
        console.error("Failed to initialize Gemini:", error);
        return false;
    }
};

export const generateResponse = async (history, message, context = "", images = []) => {
    if (!ai) {
        throw new Error("Gemini API not initialized");
    }

    try {
        const contextPrompt = context
            ? `Use the following sources to answer the user's question. If the answer is not in the sources, mention that.

            Cite your sources by referring to [[Source X]] at the end of relevant sentences.
            Use Markdown for formatting: **bold** for important concepts, lists for enumerations, and tables if needed to compare data.
            Example: "This is a fact [[Source 1]]." or "According to [[Source 2]] this is true."

            Sources:
            ${context}\n\n`
            : "";

        // Build conversation for multi-turn
        // Note: @google/genai format might be slightly different for history, but typically 'contents' array works similarly.
        // We will construct the 'contents' array manually.
        const contents = [];

        // Add history
        for (const msg of history) {
            contents.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }],
            });
        }

        // Add current message with images if present
        const currentMessageParts = [{ text: contextPrompt + message }];

        if (images && images.length > 0) {
            for (const img of images) {
                // @google/genai typically expects base64 data for inline media
                currentMessageParts.push({
                    inlineData: {
                        mimeType: img.mimeType,
                        data: img.data
                    }
                });
            }
        }

        contents.push({
            role: 'user',
            parts: currentMessageParts
        });

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: contents,
        });

        return response.text;
    } catch (error) {
        console.error("Error generating response:", error);
        throw error;
    }
};

export const generateSuggestedQuestions = async (text) => {
    if (!ai) throw new Error("Gemini API not initialized");

    const prompt = `Based on the following content, generate 3-4 interesting and relevant questions that a user might want to ask to learn more about the topic. Return ONLY the questions, one per line:\n\n${text.substring(0, 30000)}`;

    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const textResponse = response.text;

    // Clean up response to get array of strings
    const questions = textResponse.split('\n').filter(q => q.trim().length > 0).map(q => q.replace(/^\d+\.\s*|-\s*/, '').trim());
    return questions;
};

export const generateSummary = async (text) => {
    if (!ai) throw new Error("Gemini API not initialized");

    const prompt = `Create a comprehensive Briefing Doc from the following source material.
    
    Structure it as follows:
    # Briefing Doc
    ## Executive Summary
    [Concise overview of the main topic]
    
    ## Key Themes
    [Bulleted list of major themes with brief explanations]
    
    ## Key Insights & Facts
    [Important details and data points]
    
    ## Conclusion
    [Final synthesis]

    Content:
    ${text.substring(0, 30000)}`;

    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    return response.text;
};

export const generateStudyGuide = async (text) => {
    if (!ai) throw new Error("Gemini API not initialized");

    const prompt = `Create a study guide from the following text. Include important terms, discussion questions, and a short quiz:\n\n${text.substring(0, 30000)}`;

    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    return response.text;
};

export const generateFAQ = async (text) => {
    if (!ai) throw new Error("Gemini API not initialized");

    const prompt = `Generate a list of Frequently Asked Questions (FAQ) based on the following text:\n\n${text.substring(0, 30000)}`;

    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    return response.text;
};
