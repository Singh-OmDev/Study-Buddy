import { generateAIContent } from './src/services/aiService.js';

async function run() {
  try {
    const res = await generateAIContent("chat", "None", "Test", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==");
    console.log("Success:", res);
  } catch (err) {
    console.log("Error directly:", err.response?.data || err.message);
  }
}
run();
