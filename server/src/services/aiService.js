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

export const generateAIContent = async (type, context, prompt = "", image = null) => {
    if (!groq) {
        throw new Error("AI Service not configured: Missing API Key");
    }

    let systemPrompt = "You are an AI Study Buddy.";
    let userPrompt = "";
    
    let requestedModel = "llama-3.1-8b-instant";

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
        systemPrompt = `You are a studying assistant. Create 5 Flashcards from the content.
        Return a JSON object with a "flashcards" key containing an array of objects.
        Each object must have "front" and "back" keys.
        Example: { "flashcards": [{ "front": "Term", "back": "Definition" }] }`;
        userPrompt = `Generate 5 Flashcards based on:\n\n${context}`;
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
        - Use **bold** for key terms.
        - For Lists/Questions, leave a blank line between each item (e.g., Q1...\n\nQ2...).
        - Use newlines \n\n to separate paragraphs clearly.
        - If the user asks to "Quiz" or "Test" them:
            - Create 3 short conceptual questions based on their logs.
            - Format each question as a separate block with a blank line in between.
            - Do not reveal answers immediately.

        Study Context:
        ${context}
        
        Be encouraging, concise, and helpful.`;
        userPrompt = prompt;
    } else if (type === 'viva') {
        systemPrompt = `You are a strict but encouraging college professor conducting a Viva Voce oral exam.
        The student will give you a spoken answer to a question on a topic.
        Your task is to evaluate their answer and return ONLY a JSON object (no markdown) with:
        - score: a number from 1 to 10
        - grade: "Excellent" (9-10), "Good" (7-8), "Average" (5-6), or "Needs Work" (1-4)
        - feedback: a 2-3 sentence encouraging but honest critique of what they said well and what key concepts they missed
        - missed_keywords: an array of up to 4 important keywords or concepts they forgot to mention
        
        Return ONLY valid JSON. No markdown formatting.`;
        userPrompt = `The student answered the Viva question on topic "${context}". Their spoken answer was:\n\n"${prompt}"\n\nEvaluate their answer.`;
    } else {
        systemPrompt = "You are a helpful assistant.";
        userPrompt = prompt || context;
    }

    let messages = [
        { role: "system", content: systemPrompt }
    ];

    let client = groq;

    messages.push({ role: "user", content: userPrompt });

    try {
        const completion = await groq.chat.completions.create({
            messages: messages,
            model: "llama-3.1-8b-instant",
            temperature: 0.5,
            max_tokens: 1024,
            ...((type === 'analysis' || type === 'flashcards' || type === 'viva') && { response_format: { type: "json_object" } })
        });

        const content = completion.choices[0]?.message?.content;

        if (type === 'analysis' || type === 'flashcards' || type === 'viva') {
            return JSON.parse(content);
        }

        return content;
    } catch (error) {
        console.error("AI Service Error:", error);
        throw error;
    }
};
