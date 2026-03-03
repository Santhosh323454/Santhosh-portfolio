import { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export default function ChatBot({ onClose }) {
    // Diagnostic Effect: Model names-ai print paṇṇa
    useEffect(() => {
        const checkModels = async () => {
            console.log("Checking available Gemini models...");
            try {
                // Intha method unga key-kku uḷḷa ella model names-aiyum tharum
                const models = await genAI.listModels();
                console.log("✅ Available Models List:", models);

                // Namma theduira gemini-1.5-flash irukkā-nu check paṇṇuṅga
                models.forEach((m) => {
                    console.log(`Model Name: ${m.name} | Display Name: ${m.displayName}`);
                });
            } catch (error) {
                console.error("❌ Error listing models:", error);
            }
        };
        checkModels();
    }, []);

    // ... unga UI code apḍiyē irukkattum ...
}