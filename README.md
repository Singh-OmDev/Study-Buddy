#  Study Buddy 🧠📚
 live demo https://ai-study-buddy-inky.vercel.app/

A full-stack, AI-powered study assistant designed to optimize learning retention through smart scheduling, personalized AI feedback, and immersive focus tools.
<img width="1909" height="847" alt="image" src="https://github.com/user-attachments/assets/525adbc5-ade7-48b3-a431-7e25e7cc60af" />




## 🚀 Key Features

### 🤖 Advanced AI Integration
- **AI Study Chat (RAG)**: Context-aware chat that helps you answer questions based on your study history and notes.
- **Auto-Summarization**: Instantly generates concise summaries of your inputs and study materials.
- **Smart Quiz Generator**: Automatically creates revision questions to test your knowledge.
- **AI Revision**: Dedicated tools to review and reinforce concepts using AI-driven insights.

### 📅 Smart Scheduling & Analytics
- **Visual Calendar**: Track your study consistency with an interactive contribution graph.
- **Confidence-Based Revision**: Uses Spaced Repetition logic to suggest optimal revision times based on your confidence levels.
- **Pro Dashboard**: A data-rich "Bento Grid" style dashboard (Dark Mode) for tracking progress at a glance.

### 🧘 Focus & Productivity
- **Zen Mode**: A minimalist, full-screen clock with ambient backgrounds to help you stay in the flow.
- **Focus Mode**: A dedicated environment to minimize distractions while studying.
- **Study Logger**: A wizard-style logging flow to easily record your study sessions without friction.

### ⚡ User Experience & Security
- **Modern UI/UX**: Built with **React (Vite)**, **Tailwind CSS**, and **Framer Motion** for smooth animations and responsiveness.
- **Secure Authentication**: Robust user management powered by **Clerk**.
- **Data Visualization**: Beautiful charts and graphs using **Recharts**.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts
- **Calendar**: React-Calendar
- **Auth**: @clerk/clerk-react

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **AI Integration**: OpenAI SDK (configured for Groq API)
- **Auth**: @clerk/clerk-sdk-node
- **Utilities**: PDF Parse, Multer (File Uploads)

---

## 🏁 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB (Local or Atlas URI)
- Groq/OpenAI API Key
- Clerk Account (for Authentication)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/ai-study-buddy.git
cd ai-study-buddy
```

### 2. Backend Setup
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory with the following variables:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ai_study_buddy
GROQ_API_KEY=your_groq_api_key
CLERK_SECRET_KEY=your_clerk_secret_key
# Add any other required backend keys
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal, navigate to the client directory, and install dependencies:
```bash
cd client
npm install
```

Create a `.env` file in the `client/` directory with your Clerk key:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

Start the frontend development server:
```bash
npm run dev
```

Visit `http://localhost:5173` to view the application.

---

## 📸 Screenshots

*(Placeholder: Add screenshots of Dashboard, Chat, and Zen Mode here)*

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

*Built with ❤️ for lifelong learners.*
