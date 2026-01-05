import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

console.log("Testing Groq Integration...");
console.log("Key present:", !!process.env.GROQ_API_KEY);
if (process.env.GROQ_API_KEY) {
    console.log("Key length:", process.env.GROQ_API_KEY.length);
    console.log("Key prefix:", process.env.GROQ_API_KEY.substring(0, 4));
}

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1'
});

async function test() {
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "user", content: "Say hello" }
            ],
            model: "llama-3.1-8b-instant",
        });
        console.log("Success:", completion.choices[0].message.content);
    } catch (error) {
        console.error("Error:", error);
    }
}

test();
