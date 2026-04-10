import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: 'c:/Users/omsin/OneDrive/Desktop/projects/AI Study Buddy/server/.env' });

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1'
});

async function test() {
    try {
        const models = await groq.models.list();        
        console.log("All:", models.data.map(m => m.id));
    } catch(err) {
        console.error("Error", err);
    }
}
test();
