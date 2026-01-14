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
            ? `Gebruik de volgende bronnen om de vraag van de gebruiker te beantwoorden. Als het antwoord niet in de bronnen staat, vermeld dat dan.
            
            Citeer je bronnen door te verwijzen naar [[Source X]] aan het einde van relevante zinnen.
            Gebruik Markdown voor opmaak: **vetgedrukt** voor belangrijke concepten, lijsten voor opsommingen, en tabellen indien nodig om data te vergelijken.
            Bijvoorbeeld: "Dit is een feit [[Source 1]]." of "Volgens [[Source 2]] is dit waar."

            Bronnen:
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

    const prompt = `Maak een studiegids van de volgende tekst. Voeg belangrijke termen, discussievragen en een korte quiz toe:\n\n${text.substring(0, 30000)}`;

    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    return response.text;
};

export const generateFAQ = async (text) => {
    if (!ai) throw new Error("Gemini API not initialized");

    const prompt = `Genereer een lijst met Veelgestelde Vragen (FAQ) op basis van de volgende tekst:\n\n${text.substring(0, 30000)}`;

    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    return response.text;
};
