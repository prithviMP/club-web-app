import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/error/ErrorBoundary';
import Header from './components/layout/Header';
import Home from './pages/Home';

const App = () => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            {/* Add other routes here */}
          </Routes>
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default App;