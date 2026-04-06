import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // ডাটাবেস কানেকশন

const Header = () => {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState("0.00");

  useEffect(() => {
    // শুরুতেই চেক করবে কেউ লগিন করা আছে কিনা
    checkUser();

    // কেউ নতুন লগিন বা লগআউট করলে যেন সাথে সাথে হেডার আপডেট হয়
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchBalance(session.user.id);
      } else {
        setUser(null);
        setBalance("0.00");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ইউজার চেক করার ফাংশন
  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      fetchBalance(session.user.id);
    }
  };

  // ডাটাবেস থেকে ইউজারের আসল ব্যালেন্স আনার ফাংশন
  const fetchBalance = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', userId)
      .single();
      
    if (data) {
      setBalance(data.balance);
    }
  };

  return (
    <div className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <nav className="flex items-center justify-between">
          
          {/* Bam Dike: Logo */}
          <Link to="/" className="flex items-center cursor-pointer">
            <img 
              src="https://eagleeyetopup.com/logo.png" 
              alt="Eagle Eye" 
              className="h-10 md:h-12"
            />
          </Link>

          {/* Dan Dike: Menu & Auth/Profile */}
          <div className="flex items-center gap-4 md:gap-6">
            
            <div className="hidden md:flex items-center gap-6 font-bold text-[#0a1930] text-sm md:text-base">
              <Link to="/" className="hover:text-[#0052FF] transition">Topup</Link>
              <Link to="/contact" className="hover:text-[#0052FF] transition">Contact Us</Link>
            </div>
            
            {/* Supabase Magic: User থাকলে প্রোফাইল দেখাবে, না থাকলে Login বাটন */}
            {user ? (
              <>
                {/* Real Balance Button */}
                <button className="bg-[#0052FF] text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 text-sm hover:bg-blue-700 transition shadow-sm">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M4 10.781c.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27-.179 3.678-1.438 3.678-3.3 0-1.59-.947-2.51-2.956-3.028l-.722-.187V3.467c1.122.11 1.879.714 2.07 1.616h1.47c-.166-1.6-1.54-2.748-3.54-2.875V1H7.591v1.233c-1.939.23-3.27 1.472-3.27 3.156 0 1.454.966 2.483 2.661 2.917l.61.162v4.031c-1.149-.17-1.94-.8-2.131-1.718H4zm3.391-3.836c-1.043-.263-1.6-.825-1.6-1.616 0-.944.704-1.641 1.8-1.828v3.495l-.2-.05zm1.591 1.872c1.287.323 1.852.859 1.852 1.769 0 1.097-.826 1.828-2.2 1.939V8.73l.348.086z"/>
                  </svg>
                  {balance}৳
                </button>

                {/* Profile Link with User Initial */}
                <Link to="/profile" className="relative cursor-pointer flex items-center gap-2 group">
                   <div className="w-10 h-10 rounded-full bg-[#0a1930] text-white flex items-center justify-center font-bold text-lg border-2 border-gray-200 group-hover:border-[#0052FF] transition uppercase">
                      {user.email.charAt(0)}
                   </div>
                   <span className="hidden md:block text-sm font-bold text-[#0a1930] group-hover:text-[#0052FF] transition">Profile</span>
                </Link>
              </>
            ) : (
              /* Login/Register Button */
              <Link to="/auth" className="bg-[#0052FF] text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 text-sm hover:bg-blue-700 transition shadow-md">
                Login / Register
              </Link>
            )}
            
          </div>

        </nav>
      </div>
    </div>
  );
};

export default Header;