import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Wallet, Clock, Headphones, User } from 'lucide-react';
import { supabase } from '../supabaseClient';

const BottomNav = () => {
  const location = useLocation();
  const [session, setSession] = useState(null);

  useEffect(() => {
    // ইউজার লগিন করা আছে কিনা সেটা চেক করবে
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // বর্তমানে কোন পেজে আছে তা চেক করার ফাংশন
  const isActive = (path) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center p-1.5 pb-2 z-[90] shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
      
      {/* 1. Home */}
      <Link to="/" className={`flex flex-col items-center gap-1 p-2 transition-all duration-300 ${isActive('/') ? 'text-[#0052FF] -translate-y-1' : 'text-gray-400 hover:text-[#0052FF]'}`}>
        <Home size={22} className={isActive('/') ? "fill-blue-100" : ""} />
        <span className="text-[10px] font-bold">Home</span>
      </Link>

      {/* 2. Add Money */}
      <Link to="/contact" className={`flex flex-col items-center gap-1 p-2 transition-all duration-300 ${isActive('/contact') ? 'text-[#0052FF] -translate-y-1' : 'text-gray-400 hover:text-[#0052FF]'}`}>
        <Wallet size={22} className={isActive('/contact') ? "fill-blue-100" : ""} />
        <span className="text-[10px] font-bold">Add Money</span>
      </Link>

      {/* 3. My Order (লগিন না থাকলে Auth পেজে পাঠাবে) */}
      <Link to={session ? "/profile" : "/auth"} className={`flex flex-col items-center gap-1 p-2 transition-all duration-300 ${isActive('/profile') ? 'text-[#0052FF] -translate-y-1' : 'text-gray-400 hover:text-[#0052FF]'}`}>
        <Clock size={22} />
        <span className="text-[10px] font-bold">My Order</span>
      </Link>

      {/* 4. Support (এখানে আপনার WhatsApp বা Telegram লিংক দিন) */}
      <a href="https://wa.me/YOUR_NUMBER" target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 p-2 transition-all duration-300 text-gray-400 hover:text-[#0052FF]">
        <Headphones size={22} />
        <span className="text-[10px] font-bold">Support</span>
      </a>

      {/* 5. My Account (লগিন না থাকলে Auth পেজে পাঠাবে) */}
      <Link to={session ? "/profile" : "/auth"} className={`flex flex-col items-center gap-1 p-2 transition-all duration-300 ${isActive('/profile') ? 'text-[#0052FF] -translate-y-1' : 'text-gray-400 hover:text-[#0052FF]'}`}>
        <User size={22} className={isActive('/profile') ? "fill-blue-100" : ""} />
        <span className="text-[10px] font-bold">Account</span>
      </Link>

    </div>
  );
};

export default BottomNav;