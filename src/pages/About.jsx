
import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen bg-black text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">About Us</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Welcome to Club Unplugged, your premier destination for exclusive streetwear and lifestyle products.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
            <p className="text-gray-400">
              Founded with a passion for unique fashion and self-expression, Club Unplugged has grown into a 
              community of fashion enthusiasts and trendsetters. We collaborate with emerging designers and 
              established brands to bring you exclusive collections that stand out.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-gray-400">
              We strive to provide unique, high-quality fashion pieces that help you express your individuality. 
              Our platform supports independent designers and brands, fostering creativity and innovation in 
              the fashion industry.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link 
            to="/contact" 
            className="inline-block bg-primary text-black px-8 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
          >
            Get in Touch
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
