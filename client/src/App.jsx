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


import { useLocation } from 'react-router-dom';
import Footer from './components/Footer';

// Pages where the main layout wrapper and Footer should be modified/hidden
const NO_FOOTER_ROUTES = ['/zen', '/focus'];
const AUTH_ROUTES = ['/login', '/register'];

function AppRoutes() {
  const location = useLocation();
  const isZenOrFocus = NO_FOOTER_ROUTES.includes(location.pathname);
  const isAuth = AUTH_ROUTES.includes(location.pathname);
  const showFooter = !isZenOrFocus && !isAuth && !location.pathname.startsWith('/dashboard') && !location.pathname.startsWith('/calendar') && !location.pathname.startsWith('/log') && !location.pathname.startsWith('/chat') && !location.pathname.startsWith('/ai-revision');

  // For app pages (Dashboard, etc), we might want a different layout or no large footer.
  // The user requested to hide the large marketing footer on "App" pages.
  // So showFooter is true only for public pages: /, /pricing, /features. 

  // Wait, simpler logic based on user request:
  // "Hide this large marketing footer on "App" pages like Dashboard, Calendar, and Chat, as well as immersive modes like Zen Mode."
  // "It will appear on public pages (Landing, Pricing, Features)."

  const PUBLIC_ROUTES = ['/', '/pricing', '/features', '/terms', '/privacy', '/cookies']; // Add other public routes if known
  const shouldShowFooter = PUBLIC_ROUTES.includes(location.pathname);

  return (
    <div className={`flex flex-col min-h-screen bg-[#0a0a0a] ${shouldShowFooter ? '' : 'pb-0'}`}>
      <Navbar />
      {/* Main content wrapper */}
      <div className={`flex-grow ${isZenOrFocus ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full'}`}>
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

      {shouldShowFooter && <Footer />}
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
