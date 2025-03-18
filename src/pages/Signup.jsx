import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
const PASSWORD_REQUIREMENTS = [
  { regex: /[A-Z]/, message: 'one uppercase letter' },
  { regex: /[a-z]/, message: 'one lowercase letter' },
  { regex: /[0-9]/, message: 'one number' },
  { regex: /[@$!%*?&#]/, message: 'one special character' },
  { regex: /.{8,}/, message: 'minimum 8 characters' }
];

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({}); // Added errors state

  const { signup, error } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Clear errors on submit

    // Username validation
    if (!username.trim()) {
      setErrors({...errors, username: 'Username is required'});
      return;
    }
    if (!/^[a-zA-Z][a-zA-Z0-9]{2,29}$/.test(username)) { // Enhanced username regex
      setErrors({...errors, username: 'Username must start with a letter and contain only letters and numbers (3-30 characters)'});
      return;
    }


    if (!email) {
      setErrors({...errors, email: 'Email is required'});
      return;
    }

    const normalizedEmail = email.toLowerCase();
    if (normalizedEmail !== email) {
      setErrors({...errors, email: 'Email must be in lowercase'});
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({...errors, email: 'Please enter a valid email address'});
      return;
    }

    if (!password) {
      setErrors({...errors, password: 'Password is required'});
      return;
    }

    
    if (!passwordRegex.test(password)) {
      let missingRequirements = PASSWORD_REQUIREMENTS.filter(req => !req.regex.test(password)).map(req => req.message);
      setErrors({...errors, password: `Password must include: ${missingRequirements.join(', ')}`});
      return;
    }

    if (!confirmPassword) {
      setErrors({...errors, confirmPassword: 'Please confirm your password'});
      return;
    }

    if (password !== confirmPassword) {
      setErrors({...errors, confirmPassword: 'Passwords do not match'});
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError('');

      await signup(username, email, password);
      navigate('/');
    } catch (err) {
      console.error('Signup error:', err);
      setFormError(err.response?.data?.error?.message || 'Error creating account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Club Unplugged" className="h-12 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Create an Account</h1>
          <p className="text-gray-400">Join Club Unplugged today</p>
        </div>

        <div className="bg-gray-900 rounded-lg p-6">
          {(formError || error) && (
            <div className="bg-red-900/50 text-red-200 p-4 rounded-md mb-6">
              {formError || error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative"> {/* Added relative div for error message */}
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''));
                  if (!/^[a-zA-Z][a-zA-Z0-9]{2,29}$/.test(e.target.value)) { //Enhanced username validation
                    setErrors({...errors, username: 'Username must start with a letter and contain only letters and numbers (3-30 characters)'});
                  } else {
                    setErrors({...errors, username: undefined});
                  }
                }}
                className={`bg-gray-800 text-white rounded-md w-full p-2.5 border border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary ${errors.username ? 'border-red-500' : ''}`}
                placeholder="johndoe"
              />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value.toLowerCase());
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)) {
                    setErrors({...errors, email: 'Please enter a valid email address'});
                  } else {
                    setErrors({...errors, email: undefined});
                  }
                }}
                className={`bg-gray-800 text-white rounded-md w-full p-2.5 border border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary ${errors.email ? 'border-red-500' : ''}`}
                placeholder="your@email.com"
              />
            </div>

            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (!passwordRegex.test(e.target.value)) {
                      let missingRequirements = PASSWORD_REQUIREMENTS.filter(req => !req.regex.test(e.target.value)).map(req => req.message);
                      setErrors({...errors, password: `Password must include: ${missingRequirements.join(', ')}`});
                    } else {
                      setErrors({...errors, password: undefined});
                    }
                  }}
                  className={`bg-gray-800 text-white rounded-md w-full p-2.5 border border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
            </div>

            <div className="relative"> {/* Added relative div for error message */}
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (password !== e.target.value) {
                    setErrors({...errors, confirmPassword: 'Passwords do not match'});
                  } else {
                    setErrors({...errors, confirmPassword: undefined});
                  }
                }}
                className={`bg-gray-800 text-white rounded-md w-full p-2.5 border border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary ${errors.confirmPassword ? 'border-red-500' : ''}`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-black p-3 rounded-md font-medium hover:bg-opacity-90 transition-colors disabled:opacity-70 mt-2"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-400">Already have an account?</span>{' '}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;