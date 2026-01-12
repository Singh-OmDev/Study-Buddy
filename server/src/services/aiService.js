import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

// Initialize OpenAI client configured for Groq
const groq = process.env.GROQ_API_KEY
    ? new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1'
    })
    : null;

export const generateAIContent = async (type, context, prompt = "") => {
    if (!groq) {
        throw new Error("AI Service not configured: Missing API Key");
    }

    let systemPrompt = "You are an AI Study Buddy.";
    let userPrompt = "";

    if (type === 'summary') {
        systemPrompt = "You are an expert summarizer. Create concise, high-yield summaries (2-3 lines).";
        userPrompt = `Summarize the following study notes:\n\n${context}`;
    } else if (type === 'questions') {
        systemPrompt = "You are a teacher creating a quiz. Generate 5 distinct revision questions.";
        userPrompt = `Generate 5 revision questions based on these notes:\n\n${context}`;
    } else if (type === 'key_points') {
        systemPrompt = "You are an expert note-taker. Extract the most critical key points/facts as a bulleted list.";
        userPrompt = `Extract key points from these notes:\n\n${context}`;
    } else if (type === 'flashcards') {
        systemPrompt = "You are a studying assistant. Create 5 Flashcards from the content. Format as 'Concept: Definition'.";
        userPrompt = `Generate 5 Flashcards (Term: Definition) based on:\n\n${context}`;
    } else if (type === 'explanation') {
        systemPrompt = "You are a tutor engaging with a student. Explain the following content simply (ELI5 style) with an analogy if possible.";
        userPrompt = `Explain this concept simply:\n\n${context}`;
    } else if (type === 'analysis') {
        systemPrompt = `You are an AI study assistant. Analyze the study notes and return a JSON object with:
         - summary (string, 2-3 lines)
         - tags (array of strings, max 3)
         - questions (array of strings, 5 questions)
         - difficulty (string: 'Easy', 'Medium', or 'Hard')
         
         Return ONLY valid JSON. no markdown.`;
        userPrompt = `Analyze this study session:\n\n${context}`;
    } else if (type === 'chat') {
        systemPrompt = `You are a personalized AI Study Tutor. 
        You have access to the student's study history. 
        Use this context to answer their questions about their progress, suggest revisions, or find gaps.
        
        IMPORTANT FORMATTING RULES:
        - Use strict Markdown.
        - Use **bold** for key terms and question titles.
        - Use lists (- or 1.) for multiple points.
        - Use newlines \n\n to separate paragraphs clearly.
        - If the user asks to "Quiz" or "Test" them:
            - Create 3 short conceptual questions based on their logs.
            - Format them clearly (e.g., Q1: ...).
            - Do not reveal answers immediately.

        Study Context:
        ${context}
        
        Be encouraging, concise, and helpful.`;
        userPrompt = prompt;
    } else {
        systemPrompt = "You are a helpful assistant.";
        userPrompt = prompt || context;
    }

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.5,
            max_tokens: 1024,
            response_format: type === 'analysis' ? { type: "json_object" } : { type: "text" }
        });

        const content = completion.choices[0]?.message?.content;

        if (type === 'analysis') {
            return JSON.parse(content);
        }

        return content;
    } catch (error) {
        console.error("AI Service Error:", error);
        throw error;
    }
};
