import React from 'react';
import { Link } from 'react-router-dom';

/**
 * A reusable section header component with optional link
 * 
 * @param {Object} props - Component props
 * @param {string} props.subtitle - The subtitle text displayed above the title
 * @param {string} props.title - The main title text
 * @param {string} [props.linkText] - Optional text for the link
 * @param {string} [props.linkUrl] - Optional URL for the link
 * @param {string} [props.alignment='between'] - Alignment of the title and link ('between', 'center')
 * @param {React.ReactNode} [props.icon] - Optional icon to display after link text
 * @returns {JSX.Element} The section header component
 */
const SectionHeader = ({ 
  subtitle, 
  title, 
  linkText, 
  linkUrl, 
  alignment = 'between',
  icon
}) => {
  const hasLink = linkText && linkUrl;
  
  // Determine the container class based on alignment
  const containerClass = alignment === 'center' 
    ? "text-center mb-12" 
    : "flex flex-col md:flex-row justify-between items-center mb-10";
  
  // If centered, both title and link are in the same div
  if (alignment === 'center') {
    return (
      <div className={containerClass}>
        <h4 className="text-primary uppercase tracking-widest text-sm mb-2">{subtitle}</h4>
        <h2 className="text-3xl md:text-4xl font-bold text-light mb-4">{title}</h2>
        {hasLink && (
          <Link 
            to={linkUrl} 
            className="mt-4 group inline-flex items-center text-primary hover:text-primary/80 transition-colors"
          >
            <span className="mr-2 font-medium">{linkText}</span>
            {icon || (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                  clipRule="evenodd" 
                />
              </svg>
            )}
          </Link>
        )}
      </div>
    );
  }
  
  // Default layout with title and link on opposite sides
  return (
    <div className={containerClass}>
      <div>
        <h4 className="text-primary uppercase tracking-widest text-sm mb-2">{subtitle}</h4>
        <h2 className="text-3xl md:text-4xl font-bold text-light">{title}</h2>
      </div>
      {hasLink && (
        <Link 
          to={linkUrl} 
          className="mt-4 md:mt-0 group flex items-center text-primary hover:text-primary/80 transition-colors"
        >
          <span className="mr-2 font-medium">{linkText}</span>
          {icon || (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                clipRule="evenodd" 
              />
            </svg>
          )}
        </Link>
      )}
    </div>
  );
};

export default SectionHeader; 