import { GoogleGenAI } from "@google/genai";


const ai = new GoogleGenAI({API_KEY: process.env.GEMINI_API_KEY});

async function main() {
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Explain how AI works in a few words",
    });
    console.log(response.text);
}

await main();