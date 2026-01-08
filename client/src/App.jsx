import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import StudyLogger from './pages/StudyLogger';
import AIRevision from './pages/AIRevision';
import CalendarView from './pages/CalendarView';
import AIStudyChat from './pages/AIStudyChat';
import Landing from './pages/Landing';
import ZenMode from './pages/ZenMode';
import Pricing from './pages/Pricing';
import Features from './pages/Features';
import FocusMode from './pages/FocusMode';


const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-zinc-500">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-10">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/zen" element={<ZenMode />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/features" element={<Features />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <PrivateRoute>
                <CalendarView />
              </PrivateRoute>
            }
          />
          <Route
            path="/log"
            element={
              <PrivateRoute>
                <StudyLogger />
              </PrivateRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <AIStudyChat />
              </PrivateRoute>
            }
          />
          <Route
            path="/focus"
            element={
              <PrivateRoute>
                <FocusMode />
              </PrivateRoute>
            }
          />

          <Route
            path="/ai-revision"
            element={
              <PrivateRoute>
                <AIRevision />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
