import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut, SignIn, SignUp } from '@clerk/clerk-react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import StudyLogger from './pages/StudyLogger';
import AIRevision from './pages/AIRevision';
import CalendarView from './pages/CalendarView';
import AIStudyChat from './pages/AIStudyChat';
import Landing from './pages/Landing';
import ZenMode from './pages/ZenMode';

import Features from './pages/Features';
import FocusMode from './pages/FocusMode';
import Footer from './components/Footer';

// Pages where the main layout wrapper and Footer should be modified/hidden
const NO_FOOTER_ROUTES = ['/zen', '/focus'];
const AUTH_ROUTES = ['/login', '/register', '/sign-in', '/sign-up'];

// Protected Route Wrapper
// If signed in, show children.
// If signed out, redirect to /login to show the Clerk SignIn component we put there.
const ProtectedRoute = ({ children }) => {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut><Navigate to="/login" /></SignedOut>
    </>
  );
};

function AppRoutes() {
  const location = useLocation();
  const isZenOrFocus = NO_FOOTER_ROUTES.includes(location.pathname);
  // Remove footer on auth pages too
  const isAuth = AUTH_ROUTES.some(route => location.pathname.startsWith(route));
  const PUBLIC_ROUTES = ['/', '/features', '/terms', '/privacy', '/cookies']; // Add other public routes if known
  const shouldShowFooter = PUBLIC_ROUTES.includes(location.pathname);

  return (
    <div className={`flex flex-col min-h-screen bg-[#0a0a0a] ${shouldShowFooter ? '' : 'pb-0'}`}>
      <Navbar />
      {/* Main content wrapper */}
      <div className={`flex-grow ${isZenOrFocus ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full'}`}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />

          <Route path="/features" element={<Features />} />

          {/* Auth Routes - Centered */}
          {/* We mount Clerk's components here so /login is a valid route */}
          <Route path="/login/*" element={<div className="flex justify-center items-center mt-20"><SignIn routing="path" path="/login" signUpUrl="/register" fallbackRedirectUrl="/dashboard" /></div>} />
          <Route path="/register/*" element={<div className="flex justify-center items-center mt-20"><SignUp routing="path" path="/register" signInUrl="/login" fallbackRedirectUrl="/dashboard" /></div>} />

          {/* Protected Routes */}
          <Route path="/zen" element={<ProtectedRoute><ZenMode /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><CalendarView /></ProtectedRoute>} />
          <Route path="/log" element={<ProtectedRoute><StudyLogger /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><AIStudyChat /></ProtectedRoute>} />
          <Route path="/focus" element={<ProtectedRoute><FocusMode /></ProtectedRoute>} />
          <Route path="/ai-revision" element={<ProtectedRoute><AIRevision /></ProtectedRoute>} />
        </Routes>
      </div>

      {shouldShowFooter && <Footer />}
    </div>
  )
}

function App() {
  console.log("Current Environment Variables:", import.meta.env);
  const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  if (!clerkPubKey) {
    return (
      <div className="min-h-screen bg-black text-red-500 flex items-center justify-center p-4">
        <div className="max-w-md bg-zinc-900 border border-red-900 p-6 rounded-lg">
          <h1 className="text-xl font-bold mb-4">Configuration Error</h1>
          <p>Missing <code>VITE_CLERK_PUBLISHABLE_KEY</code> in environment variables.</p>
          <p className="mt-2 text-sm text-zinc-400">Please check your .env file and restart the server.</p>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      signInUrl="/login"
      signUpUrl="/register"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </ClerkProvider>
  );
}

export default App;
