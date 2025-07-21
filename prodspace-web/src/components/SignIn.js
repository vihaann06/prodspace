import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const SignIn = ({ onSignIn }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const result = await authService.signIn(formData);
      
      if (result.success) {
        if (onSignIn) {
          onSignIn(result.data.user);
        }
        navigate('/dashboard');
      } else {
        setError(result.error || 'Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await authService.signInAnonymously();
      
      if (result.success) {
        if (onSignIn) {
          onSignIn(result.data.user);
        }
        navigate('/dashboard');
      } else {
        setError(result.error || 'Failed to sign in as guest');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
      {/* Main Layout - Full height */}
      <div className="flex h-full relative">
        {/* Left Section - Sign In Form */}
        <div className="w-1/2 bg-gray-800 rounded-r-2xl shadow-2xl p-6 relative z-10 overflow-hidden">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-6 ml-4">
            <h1 className="text-3xl font-bold" style={{ color: '#6ee7b7' }}>ProdSpace</h1>
          </div>

          {/* Sign In Form */}
          <div className="flex flex-col justify-center h-full -mt-8">
            <div className="w-full max-w-md mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white">Sign in to your account</h2>
              </div>
              
              <div className="card">
                {error && (
                  <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg">
                    <p className="text-sm text-warning">{error}</p>
                  </div>
                )}
                
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                      Email address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="input-field"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      style={{ '--tw-ring-color': '#6ee7b7' }}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="input-field"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 focus:ring-2 border-gray-600 rounded bg-gray-700"
                        style={{ '--tw-ring-color': '#6ee7b7' }}
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-white">
                        Remember me
                      </label>
                    </div>
                    
                    <div className="text-sm">
                      <button
                        type="button"
                        className="font-medium underline"
                        style={{ color: '#6ee7b7', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                      >
                        Forgot your password?
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary w-full flex justify-center py-3"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Signing in...
                        </div>
                      ) : (
                        'Sign in'
                      )}
                    </button>
                  </div>
                </form>
                
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-gray-800 text-gray-300">or</span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={handleGuestSignIn}
                      disabled={isLoading}
                      className="w-full flex justify-center py-3 px-4 border border-gray-600 rounded-lg text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
                      style={{ '--tw-ring-color': '#6ee7b7' }}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Signing in as guest...
                        </div>
                      ) : (
                        'Continue as Guest'
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* New to ProdSpace section - outside the card */}
              <div className="mt-6 text-center">
                <span className="text-gray-300 text-sm">New to ProdSpace? </span>
                <Link
                  to="/signup"
                  className="text-sm font-medium underline"
                  style={{ color: '#6ee7b7' }}
                >
                  Create an account
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Informational Content */}
        <div className="flex-1 bg-gray-900 rounded-l-2xl shadow-xl p-8 -ml-8 relative z-0">
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <h1 className="text-2xl font-bold text-white mb-4">
                New here?
              </h1>
              <p className="text-lg text-gray-300 mb-6">
                Learn more about ProdSpace and discover how it can transform your productivity journey.
              </p>
              <button className="btn-primary px-6 py-3 text-base">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn; 