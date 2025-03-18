import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-black text-white py-8 relative bottom-0 w-full z-10">
      <div className="container mx-auto text-center">
        <div className="flex space-x-4">
          <a href="https://facebook.com/clubunplugged" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary">
            <FaFacebook className="h-6 w-6" />
          </a>
          <a href="https://twitter.com/clubunplugged" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary">
            <FaTwitter className="h-6 w-6" />
          </a>
          <a href="https://instagram.com/clubunplugged" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary">
            <FaInstagram className="h-6 w-6" />
          </a>
        </div>
        <p className="mt-4 text-sm">© 2023 Club Unplugged. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;