import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import About from './components/About';
import { authService } from './services/authService';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      
      try {
        const result = await authService.getCurrentUser();
        
        if (result.success && result.user) {
          console.log('👤 User already authenticated:', result.user.id);
          setIsAuthenticated(true);
        } else {
          console.log('👤 No authenticated user found');
        }
      } catch (error) {
        console.log('⚠️ Auth check error (might be normal):', error.message);
      }
      
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const handleSignIn = async (user) => {
    console.log('Signing in user:', user.id);
    setIsAuthenticated(true);
    return true;
  };

  const handleSignUp = async (user) => {
    console.log('Signing up user:', user.id);
    setIsAuthenticated(true);
    return true;
  };

  const handleSignOut = async () => {
    console.log('Signing out...');
    const result = await authService.signOut();
    if (result.success) {
      setIsAuthenticated(false);
    } else {
      console.error('Signout failed:', result.error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600 mx-auto mb-4"></div>
          <p className="text-white">Loading ProdSpace...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/signin" 
            element={
              isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                <SignIn onSignIn={handleSignIn} />
            } 
          />
          <Route 
            path="/signup" 
            element={
              isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                <SignUp onSignUp={handleSignUp} />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? 
                <Dashboard onSignOut={handleSignOut} /> : 
                <Navigate to="/signin" replace />
            } 
          />
          <Route 
            path="/about"
            element={<About />}
          />
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                <Navigate to="/signin" replace />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
