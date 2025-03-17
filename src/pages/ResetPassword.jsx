import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { resetPassword, error } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the reset code from the URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const code = queryParams.get('code');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if code exists
    if (!code) {
      setFormError('Invalid or missing reset code. Please check your email link.');
      return;
    }
    
    // Form validation
    if (!password) {
      setFormError('Password is required');
      return;
    }
    
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setFormError('');
      
      await resetPassword(code, password);
      setSuccess(true);
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Reset password error:', err);
      setFormError(err.message || 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="text-gray-400">Create a new password for your account</p>
        </div>
        
        <div className="bg-gray-900 rounded-lg p-6">
          {!code && (
            <div className="bg-red-900/50 text-red-200 p-4 rounded-md mb-6">
              Invalid or missing reset code. Please check your email link.
            </div>
          )}
          
          {success && (
            <div className="bg-green-900/50 text-green-200 p-4 rounded-md mb-6">
              Password reset successfully! Redirecting to login...
            </div>
          )}
          
          {(formError || error) && !success && (
            <div className="bg-red-900/50 text-red-200 p-4 rounded-md mb-6">
              {formError || error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                New Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-800 text-white rounded-md w-full p-2.5 border border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="••••••••"
                disabled={isSubmitting || success || !code}
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-gray-800 text-white rounded-md w-full p-2.5 border border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="••••••••"
                disabled={isSubmitting || success || !code}
              />
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting || success || !code}
              className="w-full bg-primary text-black p-3 rounded-md font-medium hover:bg-opacity-90 transition-colors disabled:opacity-70 mt-2"
            >
              {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-400">Remember your password?</span>{' '}
            <a href="/login" className="text-primary hover:underline">
              Sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 