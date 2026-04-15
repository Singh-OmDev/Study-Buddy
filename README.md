# 🧠 AI Study Buddy

live demo -> https://ai-study-buddy-inky.vercel.app/

<img width="1536" height="1024" alt="image" src="https://github.com/user-attachments/assets/68960874-3ef7-48c9-9644-4fc7797618b1" />


> A full-stack, AI-powered study platform built for students — featuring intelligent chat, YouTube-to-study-material conversion, peer-to-peer matching, a collaborative whiteboard, spaced repetition, and a global lo-fi study hub.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Routes](#-api-routes)
- [Database Models](#-database-models)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**AI Study Buddy** is a comprehensive AI-powered learning platform designed to help students study smarter. It combines an intelligent AI tutor with real-time peer collaboration, gamified study tracking, and ambient focus tools — all in a premium dark-themed interface.

The project is structured as a monorepo with two main workspaces:
- **`/client`** — React 18 + Vite frontend
- **`/server`** — Node.js + Express backend with Socket.IO

---

## ✨ Features

### 🤖 AI-Powered Tools (`/ai-revision`)
- **YouTube → Study Material**: Paste any YouTube URL and get instant summaries, key points, quizzes, flashcards, or explanations. Uses a multi-phase "Fusion Engine" that handles YouTube's bot detection via Android InnerTube API, embed page extraction, and session handshakes.
- **Text/Notes → AI Analysis**: Paste any text from textbooks or lecture notes to generate the same range of study materials.
- **5 Generation Modes**: Summary, Key Points, Quiz Questions, Flashcards (interactive flip cards), and ELI5 Explanation.
- **AI History Panel**: Slide-over history drawer to re-visit all previously generated content.

### 💬 AI Study Chat (`/chat`)
- **Persistent Multi-Session Chat**: Create and manage multiple named chat sessions (auto-titled by AI).
- **Vector-Based Memory**: Uses Google Gemini `text-embedding-004` to generate 768-dimensional embeddings of your study logs. When you chat, the system performs cosine similarity search to retrieve your most relevant study history and inject it as context.
- **Smart Context Recall**: The AI knows what you've been studying and can quiz you on it, identify gaps, or suggest revision topics.
- **Markdown Rendering**: All AI responses rendered with full Markdown support including GFM tables and syntax highlighting.
- **PDF/Text Upload**: Upload PDF or `.txt` files to add their content as chat context.

### 📝 Study Logger (`/log`)
- **4-Step Guided Flow**: Subject → Topic & Duration → Notes → Confidence Level.
- **OCR Handwriting Scanner**: Upload or take a photo of handwritten notes using Tesseract.js to extract text via in-browser OCR with a live progress bar.
- **Background AI Enrichment**: After saving, AI asynchronously generates a summary, tags, practice questions, difficulty level, and a semantic embedding vector — all without blocking the user.
- **Spaced Repetition Engine**: Auto-calculates the next revision date based on confidence level (Low=1 day, Medium=3 days, High=7 days).

### 📊 Dashboard (`/dashboard`)
- **Bento Grid Layout**: Premium card-based layout with animated entrance transitions.
- **Study Statistics**: Total logs, total hours, active subjects, and all-time study streak (day-by-day chain).
- **Time Distribution Chart**: Interactive bar chart (Recharts) with timeframe filters: This Week, Previous Week, This Month, Previous Month, All Time.
- **Spaced Repetition Queue**: "Up Next for Revision" panel showing overdue topics.
- **Knowledge Gap Analyzer**: Scores every topic by likelihood of forgetting using `weaknessScore = ageInDays × (6 - confidenceLevel)`. Displays top 5 at-risk topics with color-coded danger bars (🔥 Critical / ⚠️ At Risk / 📘 Monitor).
- **Instant Flashcard Decks**: Click "Quiz" on any log to generate and open an interactive Anki-style flip card deck.
- **Study Buddy Finder**: Real-time peer matching — finds online users who are strong in your struggling subjects and sends them a mentor ping via Socket.IO. Falls back to AI if no mentors respond in 15 seconds.
- **Notification Center**: Bell icon with real-time incoming mentor request notifications.
- **Report Card Modal**: Generate a printable/saveable study report card.

### 🏫 Study Room (`/study-room`)
- **Real-time Collaborative Chat**: Socket.IO-powered messaging between matched study partners.
- **Live Shared Whiteboard**: Collaborative drawing canvas (react-sketch-canvas) synced in real-time between users. Supports brush colors, eraser mode, undo, and clear-all.
- **WebRTC Video Calling**: Peer-to-peer video calls using PeerJS. Camera activates only when a call is initiated (privacy-first design). State machine: idle → calling → ringing → connected.
- **AI Fallback Mode**: If no human buddy is found, "Agent Stark" AI takes over as the study partner in the same chat interface.

### 🌐 Global Lofi Hub (`/hub`)
- **Synchronized Global Pomodoro Timer**: A server-side Pomodoro timer (25min focus / 5min break) broadcast to all users in the hub via Socket.IO. Everyone is synced to the same session.
- **4 Ambient Themes**: Lofi Beats, Rainy Cafe, Deep Forest, Neon City — each with a matching YouTube lo-fi stream and background image.
- **Avatar Grid**: See everyone currently studying in real-time with hover tooltips showing their study goal.
- **Emote System**: Send floating emoji reactions (🔥 ☕ ✨ 🧠 💪) to other users' avatars.
- **Invite Link System**: One-click copy invite link with confirmation toast.
- **Volume Control**: Mute/unmute and volume slider for the background music.

### 📅 Calendar View (`/calendar`)
- **Interactive Monthly Calendar**: Click any date to see study logs recorded on that day.
- **Activity Dots**: Calendar tiles show a dot indicator on days with sessions.
- **Log Detail Cards**: Shows AI-generated summaries, difficulty level, confidence, and duration for each session.

### 🧘 Zen Mode (`/zen`)
- **Distraction-Free Clock**: Full-screen, massive clock display with an aurora animated background.
- **Grain Texture Overlay**: Film grain effect for a premium aesthetic.
- **Auto-hide Controls**: Controls fade in on mouse hover and disappear otherwise.
- **Fullscreen Toggle**: One-click fullscreen for total focus.

### 🔐 Authentication
- **Clerk-powered Auth**: Sign In / Sign Up via Clerk with social login support.
- **Auto User Provisioning**: First login automatically creates a MongoDB user document synced with the Clerk profile.
- **Redis-cached Sessions**: Auth middleware checks Redis before hitting MongoDB to minimize DB calls on every request.

---

## 🛠 Tech Stack

### Frontend (`/client`)
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite 5 | Build tool & dev server |
| Tailwind CSS 3 | Utility-first styling |
| Framer Motion | Animations & transitions |
| React Router DOM 6 | Client-side routing |
| Clerk (React) | Authentication UI |
| Socket.IO Client | Real-time communication |
| PeerJS | WebRTC peer-to-peer video |
| Recharts | Data visualization charts |
| React Sketch Canvas | Collaborative whiteboard |
| Tesseract.js | In-browser OCR (handwriting scanner) |
| React Markdown + KaTeX | Markdown & math rendering |
| React YouTube | Embedded YouTube player |
| Axios | HTTP client |
| Lucide React | Icon library |
| Vitest | Unit testing |

### Backend (`/server`)
| Technology | Purpose |
|---|---|
| Node.js + Express 4 | REST API server |
| Socket.IO 4 | Real-time events (chat, canvas, hub, matching) |
| MongoDB + Mongoose 8 | Primary database |
| Redis (ioredis / Upstash) | Caching layer (user sessions, stats) |
| Clerk SDK (Node) | Server-side JWT verification |
| Groq API (via OpenAI SDK) | LLM inference — `llama-3.1-8b-instant` |
| Google Gemini AI | `text-embedding-004` for semantic vector embeddings |
| Multer | File upload handling (PDF, TXT) |
| pdf-parse | PDF text extraction |
| Helmet + Morgan | Security headers & HTTP logging |
| Jest + Supertest | Backend testing |

---

## 📁 Project Structure

```
AI Study Buddy/
├── client/                         # React Frontend
│   ├── public/                     # Static assets
│   ├── src/
│   │   ├── assets/                 # Images, fonts
│   │   ├── components/             # Reusable UI components
│   │   │   ├── Navbar.jsx          # Top navigation bar
│   │   │   ├── Footer.jsx          # Public page footer
│   │   │   ├── Footer.test.jsx     # Footer unit tests
│   │   │   ├── InteractiveDeckModal.jsx  # Anki-style flashcard modal
│   │   │   └── ReportCardModal.jsx # Study report card modal
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Clerk auth context provider
│   │   ├── pages/                  # Route-level page components
│   │   │   ├── Landing.jsx         # Public landing/home page
│   │   │   ├── Features.jsx        # Features showcase page
│   │   │   ├── Login.jsx           # Clerk sign-in page
│   │   │   ├── Register.jsx        # Clerk sign-up page
│   │   │   ├── Dashboard.jsx       # Main stats & analytics hub
│   │   │   ├── StudyLogger.jsx     # 4-step study session logger + OCR
│   │   │   ├── AIRevision.jsx      # YouTube/text → AI study material
│   │   │   ├── AIStudyChat.jsx     # Persistent AI chat with memory
│   │   │   ├── CalendarView.jsx    # Study history calendar
│   │   │   ├── StudyRoom.jsx       # P2P chat + whiteboard + video call
│   │   │   ├── LofiHub.jsx         # Global synchronized study hub
│   │   │   ├── ZenMode.jsx         # Minimalist fullscreen clock
│   │   │   └── Profile.jsx         # User profile page
│   │   ├── App.jsx                 # Root router with auth protection
│   │   ├── main.jsx                # App entry point
│   │   ├── App.css                 # Global component styles
│   │   └── index.css               # Tailwind base + design tokens
│   ├── index.html                  # HTML entry point
│   ├── vite.config.js              # Vite configuration + API proxy
│   ├── tailwind.config.js          # Tailwind theme customization
│   ├── vercel.json                 # Vercel SPA routing config
│   └── package.json
│
├── server/                         # Node.js Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js               # MongoDB connection via Mongoose
│   │   │   └── redis.js            # Redis client (ioredis/Upstash)
│   │   ├── controllers/
│   │   │   ├── aiController.js     # AI generation, YouTube transcript, chat sessions
│   │   │   ├── studyController.js  # CRUD for study logs, stats, knowledge gaps
│   │   │   ├── matchController.js  # Peer matching algorithm + AI bot endpoint
│   │   │   └── uploadController.js # PDF/TXT file upload & text extraction
│   │   ├── middleware/
│   │   │   └── authMiddleware.js   # Clerk JWT verification + Redis user cache
│   │   ├── models/
│   │   │   ├── User.js             # User schema (clerkId, name, email, plan)
│   │   │   ├── StudyLog.js         # Study session schema + AI fields + embedding
│   │   │   ├── AIHistory.js        # History of AI-generated content
│   │   │   └── ChatSession.js      # Persistent multi-session chat messages
│   │   ├── routes/
│   │   │   ├── aiRoutes.js         # /api/ai/* endpoints
│   │   │   ├── studyRoutes.js      # /api/study/* endpoints
│   │   │   ├── matchRoutes.js      # /api/match/* endpoints
│   │   │   └── uploadRoutes.js     # /api/upload endpoint
│   │   ├── services/
│   │   │   └── aiService.js        # Groq LLM + Gemini embedding service
│   │   └── app.js                  # Express app setup + CORS + routes mount
│   ├── index.js                    # Server entry: HTTP server + Socket.IO + Pomodoro timer
│   ├── jest.config.js              # Jest test configuration
│   ├── .env.example                # Environment variable template
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ and **npm** v9+
- **MongoDB** instance (Atlas or local)
- **Clerk** account → create an application to get keys
- **Groq** API key (free at [console.groq.com](https://console.groq.com))
- **Google Gemini** API key (free at [aistudio.google.com](https://aistudio.google.com)) — optional, enables semantic search
- **Redis** instance — optional (Upstash is free)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ai-study-buddy.git
cd ai-study-buddy
```

### 2. Setup the Server

```bash
cd server
npm install
cp .env.example .env
# Fill in your .env values (see Environment Variables section below)
npm run dev
```

The server starts on **`http://localhost:5000`**

### 3. Setup the Client

```bash
cd client
npm install
```

Create a `client/.env` file:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
VITE_API_BASE_URL=http://localhost:5000
```

```bash
npm run dev
```

The client starts on **`http://localhost:5173`**

---

## 🔑 Environment Variables

### Server (`server/.env`)

```env
PORT=5000

# MongoDB — Atlas or local
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ai-study-buddy?retryWrites=true&w=majority

# Groq — Free LLM API (llama-3.1-8b-instant)
GROQ_API_KEY=gsk_your_groq_api_key

# Google Gemini — For semantic vector embeddings (optional)
GEMINI_API_KEY=AIza_your_gemini_api_key

# Clerk — For server-side JWT verification
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key

# Redis — Optional caching layer (Upstash or local)
# REDIS_URI=redis://localhost:6379
# UPSTASH_REDIS_REST_URL=https://your-url.upstash.io
# UPSTASH_REDIS_REST_TOKEN=your_token
```

### Client (`client/.env`)

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
VITE_API_BASE_URL=http://localhost:5000
```

---

## 📡 API Routes

All protected routes require an `Authorization: Bearer <clerk_token>` header.

### Study Logs — `/api/study`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/study` | ✅ | Create a new study log (triggers background AI enrichment) |
| `GET` | `/api/study` | ✅ | Get all study logs for the authenticated user |
| `GET` | `/api/study/stats` | ✅ | Get dashboard stats (supports `?timeframe=this_week\|prev_week\|this_month\|all_time`) |
| `GET` | `/api/study/gaps` | ✅ | Get top 5 knowledge gaps (scored by forgetting likelihood) |
| `DELETE` | `/api/study/:id` | ✅ | Delete a specific study log |

### AI Tools — `/api/ai`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/ai/generate` | ✅ | Generate content (`type`: summary, questions, key_points, flashcards, explanation, analysis, chat, viva) |
| `GET` | `/api/ai/history` | ✅ | Get AI generation history |
| `POST` | `/api/ai/youtube` | ✅ | Fetch YouTube transcript + generate study material |
| `POST` | `/api/ai/sessions` | ✅ | Create a new chat session |
| `GET` | `/api/ai/sessions` | ✅ | Get all chat sessions |
| `GET` | `/api/ai/sessions/:id` | ✅ | Get a specific chat session with messages |
| `DELETE` | `/api/ai/sessions/:id` | ✅ | Delete a chat session |

### Peer Matching — `/api/match`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/match/find` | ✅ | Find a study buddy (optionally `?subject=Physics`) |
| `POST` | `/api/match/bot` | ✅ | Chat with AI fallback bot |

### File Upload — `/api/upload`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/upload` | ✅ | Upload PDF or TXT file, returns extracted text |

---

## 🗃 Database Models

### `User`
| Field | Type | Description |
|-------|------|-------------|
| `clerkId` | String | Unique Clerk user ID |
| `name` | String | Display name |
| `email` | String | Email address |
| `credits` | Number | Available AI credits |
| `plan` | String | `free` \| `pro` |

### `StudyLog`
| Field | Type | Description |
|-------|------|-------------|
| `user` | ObjectId | Reference to User |
| `subject` | String | E.g. "Physics", "Chemistry" |
| `topic` | String | E.g. "Newton's Laws" |
| `durationMinutes` | Number | Session length |
| `notes` | String | Raw study text / OCR output |
| `confidenceLevel` | Number | 1–5 self-rating |
| `difficultyLevel` | String | AI-assessed: Easy / Medium / Hard |
| `revisionDueDate` | Date | Auto-calculated spaced repetition date |
| `aiSummary` | String | AI-generated summary |
| `aiTags` | [String] | AI-generated topic tags |
| `aiQuestions` | [String] | AI-generated practice questions |
| `embedding` | [Number] | 768-dim Gemini semantic embedding vector |

### `ChatSession`
| Field | Type | Description |
|-------|------|-------------|
| `user` | ObjectId | Reference to User |
| `title` | String | Auto-generated smart title |
| `messages` | [{role, content, createdAt}] | Full conversation history |
| `lastActive` | Date | Last message timestamp |

### `AIHistory`
| Field | Type | Description |
|-------|------|-------------|
| `user` | ObjectId | Reference to User |
| `type` | String | Generation mode (summary, flashcards, etc.) |
| `inputContext` | String | Truncated source context |
| `result` | String | Generated AI output |

---

## 🔌 Real-Time Socket.IO Events

### Study Room Events
| Event | Direction | Description |
|-------|-----------|-------------|
| `join-room` | Client → Server | Enter a study room |
| `send-message` | Client → Server | Send a chat message |
| `receive-message` | Server → Client | Receive a chat message |
| `draw-stroke` | Client → Server | Emit whiteboard strokes |
| `receive-stroke` | Server → Client | Receive remote strokes |
| `clear-canvas` | Client → Server | Clear the whiteboard |
| `share-peer-id` | Client → Server | Share PeerJS ID for video call setup |
| `receive-peer-id` | Server → Client | Receive buddy's PeerJS ID |
| `hang-up` / `call-rejected` | Client → Server | End/reject a call |

### Peer Matching Events
| Event | Direction | Description |
|-------|-----------|-------------|
| `register-user` | Client → Server | Map Clerk ID to socket ID |
| `mentor-ping` | Server → Client | Notify a mentor of a help request |
| `mentor-accepts` | Client → Server | Mentor accepts the request |
| `mentor-found` | Server → Client | Notify requester that mentor was found |

### Global Hub Events
| Event | Direction | Description |
|-------|-----------|-------------|
| `join-hub` | Client → Server | Enter the global study room |
| `leave-hub` | Client → Server | Leave the hub |
| `hub-users-update` | Server → Client | Broadcast updated user list |
| `hub-timer-sync` | Server → Client | Broadcast global Pomodoro timer tick |
| `send-hub-emote` | Client → Server | Send an emoji reaction |
| `receive-hub-emote` | Server → Client | Receive a floating emoji animation |

---

## 🧪 Testing

### Run Client Tests
```bash
cd client
npm test
```
Uses **Vitest** + **React Testing Library**.

### Run Server Tests
```bash
cd server
npm test
```
Uses **Jest** + **Supertest** with `--experimental-vm-modules`.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">
  Built with ❤️ by Om Singh
</div>
