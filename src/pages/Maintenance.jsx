import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, RefreshCw, PhoneCall } from 'lucide-react';

const Maintenance = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = +new Date(endTime) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    } else {
      return null;
    }
    return timeLeft;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="max-w-md bg-white p-8 rounded-[2rem] shadow-2xl border border-blue-50 relative overflow-hidden">
        
        {/* Background Decor */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full opacity-50"></div>
        
        <div className="relative z-10">
          <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
            <AlertTriangle size={48} />
          </div>
          
          <h1 className="text-2xl font-black text-[#0a1930] mb-2 uppercase tracking-tight">System Maintenance</h1>
          <p className="text-gray-500 text-sm mb-8">
            আমাদের সার্ভার আপগ্রেড করা হচ্ছে। আমরা খুব শীঘ্রই ফিরে আসছি! নিচের টাইমারটি শেষ হওয়া পর্যন্ত অপেক্ষা করুন।
          </p>

          {/* Countdown Timer from Esports Logic */}
          {timeLeft ? (
            <div className="flex justify-center gap-3 mb-8">
              <div className="bg-[#0a1930] p-4 rounded-2xl w-20 shadow-lg shadow-blue-900/20">
                <span className="text-2xl font-black text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
                <p className="text-[10px] text-blue-300 font-bold uppercase mt-1">Hours</p>
              </div>
              <div className="bg-[#0a1930] p-4 rounded-2xl w-20 shadow-lg shadow-blue-900/20">
                <span className="text-2xl font-black text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <p className="text-[10px] text-blue-300 font-bold uppercase mt-1">Mins</p>
              </div>
              <div className="bg-[#0a1930] p-4 rounded-2xl w-20 shadow-lg shadow-blue-900/20">
                <span className="text-2xl font-black text-[#0052FF] animate-pulse">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <p className="text-[10px] text-blue-300 font-bold uppercase mt-1">Secs</p>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-100 text-green-600 p-4 rounded-2xl font-bold mb-8 flex items-center justify-center gap-2">
              <RefreshCw size={18} className="animate-spin" />
              System is coming back online!
            </div>
          )}
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => window.location.reload()} 
              className="w-full bg-[#0052FF] text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} /> Reload Page
            </button>
            <a 
              href="https://t.me/YOUR_CHANNEL" 
              className="text-[#0a1930] font-bold text-sm hover:underline flex items-center justify-center gap-2 mt-2"
            >
              <PhoneCall size={16} /> Need help? Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;