import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, Wallet, User } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();
  
  // Kon page a ache seta check kore color change korar function
  const isActive = (path) => location.pathname === path ? "text-[#0052FF]" : "text-gray-400";

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center p-2 z-[90] shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
      
      <Link to="/" className={`flex flex-col items-center gap-1 w-full py-2 hover:bg-gray-50 rounded-xl transition ${isActive('/')}`}>
        <Home size={22} className={isActive('/') === "text-[#0052FF]" ? "fill-blue-100" : ""} />
        <span className="text-[10px] font-bold">Home</span>
      </Link>
      
      <Link to="/topup" className={`flex flex-col items-center gap-1 w-full py-2 hover:bg-gray-50 rounded-xl transition ${isActive('/topup')}`}>
        <Grid size={22} className={isActive('/topup') === "text-[#0052FF]" ? "fill-blue-100" : ""} />
        <span className="text-[10px] font-bold">Shop</span>
      </Link>
      
      <Link to="/contact" className={`flex flex-col items-center gap-1 w-full py-2 hover:bg-gray-50 rounded-xl transition ${isActive('/contact')}`}>
        <Wallet size={22} className={isActive('/contact') === "text-[#0052FF]" ? "fill-blue-100" : ""} />
        <span className="text-[10px] font-bold">Wallet</span>
      </Link>
      
      <Link to="/profile" className={`flex flex-col items-center gap-1 w-full py-2 hover:bg-gray-50 rounded-xl transition ${isActive('/profile')}`}>
        <User size={22} className={isActive('/profile') === "text-[#0052FF]" ? "fill-blue-100" : ""} />
        <span className="text-[10px] font-bold">Profile</span>
      </Link>

    </div>
  );
};

export default BottomNav;