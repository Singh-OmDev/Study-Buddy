import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

// Set Axios Base URL
// In development, this is undefined (requests use relative paths proxy via Vite).
// In production, set VITE_API_BASE_URL to your backend URL (e.g., https://my-app.onrender.com)
if (import.meta.env.VITE_API_BASE_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
