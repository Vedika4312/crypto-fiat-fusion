
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Send from './pages/Send';
import Receive from './pages/Receive';
import Convert from './pages/Convert';
import VirtualCard from './pages/VirtualCard';
import ProtectedRoute from './components/ProtectedRoute';

// Simple loading component for suspense fallback
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/send" element={
              <ProtectedRoute>
                <Send />
              </ProtectedRoute>
            } />
            <Route path="/receive" element={
              <ProtectedRoute>
                <Receive />
              </ProtectedRoute>
            } />
            <Route path="/convert" element={
              <ProtectedRoute>
                <Convert />
              </ProtectedRoute>
            } />
            <Route path="/virtual-card" element={
              <ProtectedRoute>
                <VirtualCard />
              </ProtectedRoute>
            } />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;
