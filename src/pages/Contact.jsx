import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone, faLocationDot } from '@fortawesome/free-solid-svg-icons';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [error, setError] = useState('');

  const validateName = (name) => {
    return /^[a-zA-Z\s]{2,30}$/.test(name);
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateName(formData.name)) {
      setError('Name should only contain letters and spaces (2-30 characters)');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Submit form
    setError('');
    // Add your form submission logic here
    console.log('Form submitted:', formData);
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                  required
                ></textarea>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                className="w-full bg-primary text-black py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>

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
};

export default Contact;