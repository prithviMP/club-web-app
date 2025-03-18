import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone, faLocationDot } from '@fortawesome/free-solid-svg-icons';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateName = (name) => {
    if (!name.trim()) return 'Name is required';
    if (!/^[a-zA-Z\s]{2,30}$/.test(name)) {
      return 'Name should only contain letters and spaces (2-30 characters)';
    }
    return '';
  };

  const validateEmail = (email) => {
    if (!email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase())) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const messageError = !formData.message.trim() ? 'Message is required' : '';

    const newErrors = {
      name: nameError,
      email: emailError,
      message: messageError
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(error => error)) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Add API call here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Message sent successfully!');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-black text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Contact Us</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md bg-gray-800 border ${
                  errors.name ? 'border-red-500' : 'border-gray-600'
                } px-3 py-2 text-white focus:border-primary focus:ring-1 focus:ring-primary`}
                placeholder="John Doe"
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md bg-gray-800 border ${
                  errors.email ? 'border-red-500' : 'border-gray-600'
                } px-3 py-2 text-white focus:border-primary focus:ring-1 focus:ring-primary`}
                placeholder="john@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-300">Message</label>
              <textarea
                id="message"
                name="message"
                rows="4"
                value={formData.message}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md bg-gray-800 border ${
                  errors.message ? 'border-red-500' : 'border-gray-600'
                } px-3 py-2 text-white focus:border-primary focus:ring-1 focus:ring-primary`}
                placeholder="Your message here..."
              />
              {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-black font-medium py-2 px-4 rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-70"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>

          <div className="space-y-8">
            <a href="mailto:support@clubunplugged.com" className="flex items-start gap-4 hover:text-primary">
              <FontAwesomeIcon icon={faEnvelope} className="text-primary text-xl mt-1" />
              <div>
                <h3 className="font-medium mb-2">Email Us</h3>
                <p className="text-gray-400">support@clubunplugged.com</p>
              </div>
            </a>
            <a href="tel:+919611717711" className="flex items-start gap-4 hover:text-primary">
              <FontAwesomeIcon icon={faPhone} className="text-primary text-xl mt-1" />
              <div>
                <h3 className="font-medium mb-2">Call Us</h3>
                <p className="text-gray-400">+91 96117 17711</p>
              </div>
            </a>
            <a href="https://maps.google.com/?q=123+Fashion+Street,+Design+District,+Bangalore,+560001" target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 hover:text-primary">
              <FontAwesomeIcon icon={faLocationDot} className="text-primary text-xl mt-1" />
              <div>
                <h3 className="font-medium mb-2">Our Location</h3>
                <p className="text-gray-400">123 Fashion Street, Design District, Bangalore, 560001</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );

export default Contact;