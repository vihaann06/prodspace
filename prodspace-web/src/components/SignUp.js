import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const SignUp = ({ onSignUp }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
    } else if (step === 2) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('Attempting signup with:', { email: formData.email, firstName: formData.firstName, lastName: formData.lastName });
      
      const result = await authService.signUp({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName
      });
      
      console.log('Signup result:', result);
      
      if (result.success) {
        if (onSignUp) {
          onSignUp(result.data.user);
        }
        navigate('/dashboard');
      } else {
        console.error('Signup failed:', result.error);
        setErrors({ general: result.error || 'Failed to create account. Please try again.' });
      }
    } catch (err) {
      console.error('Signup error:', err);
      setErrors({ general: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => {
    return (
      <div className="flex justify-center mb-8">
        <div className="flex items-center">
          {[1, 2, 3].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === currentStep 
                  ? 'text-white' 
                  : step < currentStep 
                    ? 'text-white' 
                    : 'text-gray-400'
              }`}
              style={{
                backgroundColor: step === currentStep 
                  ? '#6ee7b7' 
                  : step < currentStep 
                    ? '#1f2937' 
                    : '#4b5563'
              }}>
                {step < currentStep ? '✓' : step}
              </div>
              {index < 2 && (
                <div className={`w-20 h-0.5 mx-8`}
                style={{
                  backgroundColor: step < currentStep ? '#10b981' : '#4b5563'
                }} />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-white mb-2">
                  First name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  className={`input-field ${errors.firstName ? 'border-warning focus:ring-warning' : ''}`}
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-warning">{errors.firstName}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-white mb-2">
                  Last name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  className={`input-field ${errors.lastName ? 'border-warning focus:ring-warning' : ''}`}
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-warning">{errors.lastName}</p>
                )}
              </div>
            </div>
            
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
                className={`input-field ${errors.email ? 'border-warning focus:ring-warning' : ''}`}
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-warning">{errors.email}</p>
              )}
            </div>
            
            <button
              type="button"
              onClick={nextStep}
              className="btn-primary w-full py-3"
            >
              Continue
            </button>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-2">Create your password</h3>
              <p className="text-gray-300">Choose a strong password to secure your account</p>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className={`input-field ${errors.password ? 'border-warning focus:ring-warning' : ''}`}
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-warning">{errors.password}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className={`input-field ${errors.confirmPassword ? 'border-warning focus:ring-warning' : ''}`}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-warning">{errors.confirmPassword}</p>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={prevStep}
                className="btn-secondary flex-1 py-3"
              >
                Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="btn-primary flex-1 py-3"
              >
                Continue
              </button>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-2">Almost done!</h3>
              <p className="text-gray-300">Review your information and accept our terms</p>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-300">Name:</span>
                <span className="text-white font-medium">{formData.firstName} {formData.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Email:</span>
                <span className="text-white font-medium">{formData.email}</span>
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 focus:ring-2 border-gray-600 rounded bg-gray-700"
                style={{ '--tw-ring-color': '#6ee7b7' }}
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-white">
                I agree to the{' '}
                <button
                  type="button"
                  className="underline"
                  style={{ color: '#6ee7b7' }}
                  onClick={() => window.open('/terms', '_blank')}
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  className="underline"
                  style={{ color: '#6ee7b7' }}
                  onClick={() => window.open('/privacy', '_blank')}
                >
                  Privacy Policy
                </button>
              </label>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={prevStep}
                className="btn-secondary flex-1 py-3"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary flex-1 py-3"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  'Create account'
                )}
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
      <div className="flex h-full relative">
        <div className="w-1/2 bg-gray-800 rounded-r-2xl shadow-2xl p-6 relative z-10 overflow-hidden">
          <div className="flex justify-between items-center mb-6 ml-4">
            <h1 className="text-3xl font-bold" style={{ color: '#6ee7b7' }}>ProdSpace</h1>
          </div>

          <div className="flex flex-col justify-start h-full pt-16">
            <div className="w-full max-w-md mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white">Create your account</h2>
              </div>
              
              <div className="card">
                {renderStepIndicator()}
                
                {errors.general && (
                  <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg">
                    <p className="text-sm text-warning">{errors.general}</p>
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  {renderStepContent()}
                </form>
                
                {currentStep === 1 && (
                  <div className="mt-6">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-600" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-gray-800 text-gray-300">Already have an account?</span>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <Link
                        to="/signin"
                        className="btn-secondary w-full flex justify-center py-3"
                      >
                        Sign in instead
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
                  
        <div className="flex-1 bg-gray-900 rounded-l-2xl shadow-xl p-8 -ml-8 relative z-0">
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <h1 className="text-2xl font-bold text-white mb-4">
                Welcome to ProdSpace!
              </h1>
              <p className="text-lg text-gray-300 mb-6">
                Join thousands of users who have transformed their productivity with our comprehensive suite of tools.
              </p>
              <button className="btn-primary px-6 py-3 text-base" onClick={() => window.open('/about', '_blank')}>
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp; 