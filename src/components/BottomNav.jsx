import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Wallet, Clock, Headphones, User } from 'lucide-react';
import { supabase } from '../supabaseClient';

const BottomNav = () => {
  const location = useLocation();
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isActive = (path, tab = null) => {
    if (tab) return location.pathname === path && location.search.includes(`tab=${tab}`);
    return location.pathname === path && !location.search.includes('tab=');
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1E293B] border-t border-[#334155] flex justify-around items-center p-1.5 pb-2 z-[90] shadow-[0_-5px_25px_rgba(0,0,0,0.3)]">
      
      <Link to="/" className={`flex flex-col items-center gap-1 p-2 transition-all duration-300 ${isActive('/') ? 'text-[#8B5CF6] -translate-y-1' : 'text-gray-400 hover:text-[#A78BFA]'}`}>
        <Home size={22} className={isActive('/') ? "fill-purple-500/20" : ""} />
        <span className="text-[10px] font-bold">Home</span>
      </Link>

      <Link to="/contact" className={`flex flex-col items-center gap-1 p-2 transition-all duration-300 ${isActive('/contact') ? 'text-[#8B5CF6] -translate-y-1' : 'text-gray-400 hover:text-[#A78BFA]'}`}>
        <Wallet size={22} className={isActive('/contact') ? "fill-purple-500/20" : ""} />
        <span className="text-[10px] font-bold">Add Money</span>
      </Link>

      {/* UNIQUE HALF-FLOATING SUPPORT BUTTON */}
      <div className="relative flex-1 flex justify-center">
        <Link to="/support" className="group absolute -top-7 flex flex-col items-center">
          <div className={`
              h-16 w-16 rounded-full flex items-center justify-center
              border-4 border-[#1E293B] shadow-lg shadow-blue-500/40
              transition-all duration-300 transform ${isActive('/support') ? 'scale-110' : 'group-hover:scale-110'}
              ${isActive('/support') ? 'bg-gradient-to-tr from-[#8B5CF6] to-purple-500 text-white' : 'bg-gradient-to-tr from-blue-600 to-cyan-500 text-white'}
            `}>
            <Headphones size={28} className={isActive('/support') ? 'animate-none' : 'group-hover:rotate-12 transition duration-300'} />
          </div>
          <span className={`text-[10px] font-bold mt-1 ${isActive('/support') ? 'text-[#8B5CF6]' : 'text-gray-400'}`}>
            Support
          </span>
        </Link>
      </div>

      <Link to={session ? "/my-orders" : "/auth"} className={`flex flex-col items-center gap-1 p-2 transition-all duration-300 ${isActive('/my-orders') ? 'text-[#8B5CF6] -translate-y-1' : 'text-gray-400 hover:text-[#A78BFA]'}`}>
        <Clock size={22} className={isActive('/my-orders') ? "fill-purple-500/20" : ""} />
        <span className="text-[10px] font-bold">My Order</span>
      </Link>


      <Link to={session ? "/profile" : "/auth"} className={`flex flex-col items-center gap-1 p-2 transition-all duration-300 ${isActive('/profile') ? 'text-[#8B5CF6] -translate-y-1' : 'text-gray-400 hover:text-[#A78BFA]'}`}>
        <User size={22} className={isActive('/profile') ? "fill-purple-500/20" : ""} />
        <span className="text-[10px] font-bold">Account</span>
      </Link>

    </div>
  );
};

export default BottomNav;