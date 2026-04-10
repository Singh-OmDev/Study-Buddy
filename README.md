

<img width="1536" height="1024" alt="ChatGPT Image Feb 28, 2026, 09_32_43 PM" src="https://github.com/user-attachments/assets/d0909d43-1c39-44af-9a3d-8e21d8e68a0c" />

# AI Study Buddy 🧠📚
[Live Demo](https://ai-study-buddy-inky.vercel.app/)

A full-stack, AI-powered study assistant designed to optimize learning retention through smart scheduling, personalized AI feedback, immersive focus tools, and real-time *peer-to-peer collaborative learning*.

![Project Status](https://img.shields.io/badge/Status-Production--Ready-green)
![Tech Stack](https://img.shields.io/badge/Stack-MERN-blue)
![License](https://img.shields.io/badge/License-MIT-purple)

<img width="1536" height="1024" alt="Dashboard Preview" src="https://github.com/user-attachments/assets/d0909d43-1c39-44af-9a3d-8e21d8e68a0c" />

## 🚀 Key Features

### 🤝 Peer-to-Peer Collaborative Learning
- **Live Study Rooms (WebRTC)**: Connect with study partners in real-time using secure peer-to-peer video and audio channels.
- **Viva Voce Mode**: Engage in interactive, verbal flashcard sessions simulating real-world technical interviews and oral exams.
- **Real-Time Synergy**: Powered by Socket.io and PeerJS for blazing fast signaling and low-latency interactions.

### 🤖 Advanced AI Integration
- **AI Study Chat (RAG)**: Context-aware conversational AI that acts as your personal tutor, answering questions based on your notes and history.
- **Content Extraction & Summarization**: Seamlessly extract text from PDFs, images (via OCR), or YouTube Video Transcripts and summarize them using advanced LLMs (Groq).
- **Smart Quiz Generator**: Automatically generates targeted revision questions, transforming passive reading into active recall.
- **AI Revision**: Dedicated learning modules to review and reinforce concepts using artificial intelligence-driven insights.

### ⚡ Performance & Scalability
- **Hybrid Redis Caching**: Implements a robust caching strategy that seamlessly switches between **Local Redis (Docker)** for development and **Upstash Redis (Serverless)** for production.
- **Optimized API**: Reduces database load by caching heavy aggregations (User Stats, Streaks) with intelligent invalidation.

### 📅 Smart Scheduling & Analytics
- **Visual Calendar**: Track your study consistency with an interactive Git-style contribution graph.
- **Confidence-Based Revision**: Utilizes Spaced Repetition logic to map out optimal revision schedules based on self-assessed confidence levels.
- **Pro Dashboard**: A gorgeous "Bento Grid" style layout packed with actionable data for tracking your learning progress at a glance.

### 🧘 Focus & Productivity
- **Zen & Focus Modes**: Minimalist, full-screen digital environments featuring ambient backgrounds and timers, ensuring absolute concentration.
- **Study Logger**: An intuitive wizard-style flow designed to document study sessions without friction.

### 🎨 User Experience & Security
- **Modern UI/UX**: Built with **React (Vite)**, **Tailwind CSS**, and **Framer Motion** to deliver fluid and satisfying animations.
- **Secure Authentication**: Enterprise-grade identity management driven by **Clerk**.
- **Interactive Visuals**: Render visually stunning charts and insights mapping out your journey.

---

## 🛠️ Tech Stack

### Frontend Architecture
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Animations**: Framer Motion
- **WebRTC / Comms**: PeerJS, Socket.io-client
- **Utilities**: React-Calendar, Recharts, Tesseract.js (OCR), React-Markdown
- **Auth**: `@clerk/clerk-react`

### Backend Infrastructure
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Caching & WebSockets**: Redis (Upstash / ioredis), Socket.io
- **AI Integration**: Custom Groq integration + OpenAI SDK wrapper
- **Auth**: `@clerk/clerk-sdk-node`
- **Utilities**: PDF Parse, YouTube Transcript, Multer

---

## 🏁 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB (Local or Atlas URI)
- Redis (Optional, for caching - Local or Upstash)
- Groq/OpenAI API Key
- Clerk Account (for Authentication)

### 1. Clone the Repository
```bash
git clone https://github.com/Singh-OmDev/AI-Study-Buddy.git
cd ai-study-buddy
2. Backend Setup
Navigate to the server directory and install dependencies:

bash
cd server
npm install
Create a .env file in the server/ directory with the following variables:

env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ai_study_buddy
GROQ_API_KEY=your_groq_api_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
# Optional: Redis Configuration (Leave blank for generic fallback or Local Redis)
# UPSTASH_REDIS_REST_URL=...
# UPSTASH_REDIS_REST_TOKEN=...
# REDIS_URI=redis://localhost:6379
Start the backend server:

bash
npm run dev
3. Frontend Setup
Open a new terminal, navigate to the client directory, and install dependencies:

bash
cd client
npm install
Create a .env file in the client/ directory with your Clerk key:

env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
Start the frontend development server:

bash
npm run dev
Visit http://localhost:5173 to view the application in action.

🧪 Testing
We use Vitest for the frontend and Jest for the backend.

Frontend Tests
bash
cd client
npm test
Backend Tests
bash
cd server
npm test
🤝 Contributing
Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

Fork the Project
Create your Feature Branch (git checkout -b feature/AmazingFeature)
Commit your Changes (git commit -m 'Add some AmazingFeature')
Push to the Branch (git push origin feature/AmazingFeature)
Open a Pull Request
📄 License
This project is licensed under the MIT License.

Built with ❤️ for lifelong learners.
