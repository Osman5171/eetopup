import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <AlertCircle size={80} className="text-red-500 mb-4 animate-bounce" />
      <h1 className="text-4xl font-black text-[#0a1930] mb-2">404 - Page Not Found</h1>
      <p className="text-gray-500 mb-8 max-w-md">দুঃখিত! আপনি যে পেজটি খুঁজছেন তা খুঁজে পাওয়া যায়নি। সম্ভবত লিংকটি ভুল অথবা পেজটি সরিয়ে নেওয়া হয়েছে।</p>
      <Link to="/" className="bg-[#0052FF] text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg">
        <Home size={20} /> Back to Home
      </Link>
    </div>
  );
};

export default NotFound;