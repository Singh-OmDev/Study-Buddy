# AI Study Buddy 🧠📚

A full-stack, AI-powered study assistant designed to optimize learning retention through smart scheduling and personalized AI feedback.

![Project Status](https://img.shields.io/badge/Status-Production--Ready-green)
![Tech Stack](https://img.shields.io/badge/Stack-MERN-blue)

## 🚀 Key Features

### 🤖 Advanced AI Integration (RAG & Analysis)
- **Auto-Summarization**: Instantly generates concise summaries of your raw study notes using Groq/Llama3.
- **Context-Aware Chat (RAG)**: Chat with your study history! The AI retrieves your past logs to answer questions like *"What did I study last week?"* or *"Test me on Biology."*
- **Smart Quiz Generator**: Automatically creates revision questions based on your daily inputs.

### 📅 Smart Scheduling & Analytics
- **Visual Calendar**: Track consistency with a GitHub-style interactive calendar beat map.
- **Confidence-Based Revision**: Automatically calculates optimal revision dates based on your self-reported confidence (Spaced Repetition logic).
- **Pro Dashboard**: Beautiful, data-rich analytics using Recharts and Glassmorphism UI.

### ⚡ User Experience
- **Wizard-Style Logger**: Frictionless, step-by-step logging flow to reduce cognitive load.
- **Modern UI/UX**: Built with Tailwind CSS, Framer Motion animations, and responsive layouts.
- **Secure**: JWT Authentication and protected routes.

---

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite), Tailwind CSS, Framer Motion, Recharts, React Calendar.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose).
- **AI Engine**: Groq API (Llama-3.1-8b-instant model) via OpenAI SDK.
- **Authentication**: JWT (JSON Web Tokens) & Bcrypt.

---

## 🏁 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (Running locally or Atlas URI)
- Groq API Key (Get one for free at [console.groq.com](https://console.groq.com))

### 1. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in `server/` with:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ai_study_buddy
JWT_SECRET=super_secret_key_change_me
GROQ_API_KEY=your_groq_api_key_here
```
Start the server:
```bash
npm run dev
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📸 Screenshots
*(Add screenshots of your Dashboard, Calendar, and Chat interface here)*

## 🔮 Future Roadmap
- [ ] Email Notifications for Revision Due Dates
- [ ] Export Study Data to PDF
- [ ] Mobile App (React Native)

---
*Built with ❤️ for lifelong learners.*
