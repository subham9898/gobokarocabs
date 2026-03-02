
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-24 h-24 bg-lime-100 rounded-3xl flex items-center justify-center text-[#A3E635] mx-auto mb-8 animate-bounce">
          <i className="fas fa-exclamation-triangle text-4xl"></i>
        </div>
        <h1 className="text-6xl md:text-8xl font-black text-gray-900 mb-4 tracking-tighter">404</h1>
        <h2 className="text-2xl md:text-3xl font-black text-gray-800 mb-6">Page Not Found</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-10 font-medium">
          Oops! The page you are looking for might have been moved, deleted, or never existed in the first place.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-3 bg-black text-[#A3E635] px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
        >
          <i className="fas fa-home"></i>
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
