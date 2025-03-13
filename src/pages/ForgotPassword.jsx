import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { forgotPassword, error } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!email.trim()) {
      setFormError('Email is required');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setFormError('Email is invalid');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setFormError('');
      
      await forgotPassword(email);
      setSuccess(true);
      
      // Clear form
      setEmail('');
    } catch (err) {
      console.error('Forgot password error:', err);
      setFormError(err.message || 'Failed to send reset email');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Club Unplugged" className="h-12 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Forgot Password</h1>
          <p className="text-gray-400">Enter your email to reset your password</p>
        </div>
        
        <div className="bg-gray-900 rounded-lg p-6">
          {success ? (
            <div className="bg-green-900/50 text-green-200 p-4 rounded-md mb-6">
              <p>Password reset email sent!</p>
              <p className="mt-2 text-sm">
                If an account exists with the email you entered, you'll receive instructions to reset your password.
              </p>
            </div>
          ) : (
            <>
              {(formError || error) && (
                <div className="bg-red-900/50 text-red-200 p-4 rounded-md mb-6">
                  {formError || error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-800 text-white rounded-md w-full p-2.5 border border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="your@email.com"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-black p-3 rounded-md font-medium hover:bg-opacity-90 transition-colors disabled:opacity-70 mt-2"
                >
                  {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
          
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-400">Remember your password?</span>{' '}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 