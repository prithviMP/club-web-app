import React from 'react';

/**
 * A reusable section component with consistent styling
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The content of the section
 * @param {string} [props.background='bg-dark'] - Background color class
 * @param {string} [props.padding='py-16'] - Padding class
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {string} [props.id] - Optional ID for the section
 * @returns {JSX.Element} The section component
 */
const Section = ({ 
  children, 
  background = 'bg-dark', 
  padding = 'py-16', 
  className = '',
  id
}) => {
  return (
    <section 
      id={id}
      className={`${background} ${padding} ${className}`}
    >
      <div className="container mx-auto px-4">
        {children}
      </div>
    </section>
  );
};

export default Section; 