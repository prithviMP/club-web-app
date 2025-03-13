import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-dark text-light px-4 pt-16 pb-20">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
      <p className="text-gray-400 text-center max-w-md mb-8">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link
        to="/"
        className="bg-primary text-black px-6 py-3 rounded-md font-medium hover:bg-opacity-90 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound; 