import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const InstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      // ডিফল্ট ইনস্টল প্রম্পটটি আটকে দিচ্ছি
      e.preventDefault();
      // ইভেন্টটি সেভ করে রাখছি
      setDeferredPrompt(e);
      // আমাদের কাস্টম ব্যানারটি শো করাচ্ছি
      setShowBanner(true);
    });
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0a1930] text-white p-4 flex items-center justify-between z-[100] shadow-[0_-4px_10px_rgba(0,0,0,0.2)] md:hidden animate-fade-in-up">
      <div className="flex items-center gap-3">
        {/* লোগো */}
        <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-xl bg-white p-0.5" />
        <div>
          <p className="font-bold text-sm">Eagle Eye Topup</p>
          <p className="text-[10px] text-gray-400">Install app for faster top-up</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={handleInstall} 
          className="bg-[#0052FF] text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 hover:bg-blue-600 transition"
        >
          <Download size={14} /> Install
        </button>
        <button onClick={() => setShowBanner(false)} className="text-gray-400 hover:text-white p-1">
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default InstallBanner;