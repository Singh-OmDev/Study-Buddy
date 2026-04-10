# AI Study Buddy 🧠📚
[Live Demo](https://ai-study-buddy-inky.vercel.app/)

<img width="1536" height="1024" alt="Dashboard Preview" src="https://github.com/user-attachments/assets/d0909d43-1c39-44af-9a3d-8e21d8e68a0c" />

# AI Study Buddy 🧠📚

[Live Demo](https://ai-study-buddy-inky.vercel.app/)

A full-stack, AI-powered study assistant designed to optimize learning retention through smart scheduling, personalized AI feedback, immersive focus tools, and real-time *peer-to-peer collaborative learning*.

![Project Status](https://img.shields.io/badge/Status-Production--Ready-green)
![Tech Stack](https://img.shields.io/badge/Stack-MERN-blue)
![License](https://img.shields.io/badge/License-MIT-purple)

<img width="1536" height="1024" alt="Dashboard Preview" src="https://github.com/user-attachments/assets/d0909d43-1c39-44af-9a3d-8e21d8e68a0c" />

---

## 🚀 Key Features

### 🤝 Peer-to-Peer Collaborative Learning

* **Live Study Rooms (WebRTC)**: Real-time video/audio collaboration
* **Viva Voce Mode**: Practice interviews & oral exams
* **Real-Time Sync**: Powered by Socket.io + PeerJS

### 🤖 Advanced AI Integration

* **AI Study Chat (RAG)**: Context-aware AI tutor
* **Content Extraction**: PDFs, Images (OCR), YouTube transcripts
* **Smart Quiz Generator**: Active recall-based questions
* **AI Revision**: Personalized learning insights

### ⚡ Performance & Scalability

* **Hybrid Redis Caching**

  * Local Redis (Docker) for development
  * Upstash Redis for production
* **Optimized APIs**: Reduced DB load with caching

### 📅 Smart Scheduling & Analytics

* **Git-style Calendar**: Track consistency
* **Spaced Repetition**: Confidence-based revision
* **Dashboard**: Visual learning analytics

### 🧘 Focus & Productivity

* **Zen Mode**: Distraction-free environment
* **Study Logger**: Easy session tracking

### 🎨 UI & Security

* **Modern UI**: React + Tailwind + Framer Motion
* **Authentication**: Clerk
* **Data Visualization**: Charts & insights

---

## 🛠️ Tech Stack

### Frontend

* React.js (Vite)
* Tailwind CSS
* Framer Motion
* Socket.io-client
* PeerJS
* Tesseract.js (OCR)
* React-Markdown
* Clerk Auth

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)
* Redis (Upstash / ioredis)
* Socket.io
* Groq API / OpenAI
* Clerk SDK
* Multer, PDF Parse

---

## 🏁 Getting Started

### Prerequisites

* Node.js (v18+)
* MongoDB (local or Atlas)
* Redis (optional)
* Groq/OpenAI API key
* Clerk account

---

### 1. Clone Repository

```bash
git clone https://github.com/Singh-OmDev/AI-Study-Buddy.git
cd ai-study-buddy
```

---

### 2. Backend Setup

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ai_study_buddy
GROQ_API_KEY=your_key
CLERK_SECRET_KEY=your_secret
CLERK_PUBLISHABLE_KEY=your_key

# Optional Redis
# UPSTASH_REDIS_REST_URL=
# UPSTASH_REDIS_REST_TOKEN=
# REDIS_URI=redis://localhost:6379
```

Run backend:

```bash
npm run dev
```

---

### 3. Frontend Setup

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_key
```

Run frontend:

```bash
npm run dev
```

👉 Open: http://localhost:5173

---

## 🧪 Testing

### Frontend

```bash
cd client
npm test
```

### Backend

```bash
cd server
npm test
```

---

## 🤝 Contributing

1. Fork the repo
2. Create branch → `git checkout -b feature/feature-name`
3. Commit → `git commit -m "Add feature"`
4. Push → `git push origin feature/feature-name`
5. Open Pull Request

---

## 📄 License

MIT License

---

## ❤️ Final Note

Built for students who want to **learn smarter, not harder**.
