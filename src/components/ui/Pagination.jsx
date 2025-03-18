
import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {[...Array(totalPages)].map((_, index) => (
        <button
          key={index}
          onClick={() => onPageChange(index + 1)}
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            currentPage === index + 1
              ? 'bg-primary scale-110'
              : 'bg-gray-400 hover:bg-primary/70'
          }`}
          aria-label={`Go to page ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default Pagination;
