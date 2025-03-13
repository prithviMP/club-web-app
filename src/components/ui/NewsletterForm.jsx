import React, { useState } from 'react';

/**
 * A reusable newsletter subscription form component
 * 
 * @param {Object} props - Component props
 * @param {string} [props.buttonText='Subscribe'] - Text for the submit button
 * @param {string} [props.placeholder='Your email address'] - Placeholder text for the email input
 * @param {boolean} [props.showDisclaimer=true] - Whether to show the privacy disclaimer
 * @param {Function} [props.onSubmit] - Function to call when the form is submitted
 * @returns {JSX.Element} The newsletter form component
 */
const NewsletterForm = ({ 
  buttonText = 'Subscribe', 
  placeholder = 'Your email address',
  showDisclaimer = true,
  onSubmit
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic email validation
    if (!email || !email.includes('@') || !email.includes('.')) {
      setMessage({ text: 'Please enter a valid email address', type: 'error' });
      return;
    }
    
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });
    
    try {
      // If onSubmit prop is provided, call it with the email
      if (onSubmit) {
        await onSubmit(email);
      }
      
      // If no onSubmit or it doesn't throw, show success message
      setMessage({ text: 'Thank you for subscribing!', type: 'success' });
      setEmail('');
    } catch (error) {
      setMessage({ 
        text: error.message || 'Something went wrong. Please try again.', 
        type: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row justify-center max-w-md mx-auto">
        <input
          type="email"
          placeholder={placeholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-secondary text-light px-4 py-3 rounded-l-md w-full focus:outline-none focus:ring-1 focus:ring-primary mb-2 sm:mb-0"
          required
          disabled={isSubmitting}
        />
        <button
          type="submit"
          className="bg-primary text-black px-6 py-3 rounded-r-md font-medium hover:bg-opacity-90 transition-colors sm:w-auto w-full disabled:opacity-70"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : buttonText}
        </button>
      </form>
      
      {message.text && (
        <p className={`text-sm mt-2 text-center ${message.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
          {message.text}
        </p>
      )}
      
      {showDisclaimer && (
        <p className="text-gray-500 text-sm mt-4 text-center">
          By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
        </p>
      )}
    </div>
  );
};

export default NewsletterForm; 