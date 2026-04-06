import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Users, CreditCard, Settings, LogOut, Menu, X, Package, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    // ১. চেক করবে কেউ লগিন করা আছে কিনা
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/auth'); // লগিন না থাকলে লগিন পেজে পাঠাবে
      return;
    }

    // ২. চেক করবে তার role 'admin' কিনা
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (data?.role === 'admin') {
      setIsAdmin(true);
    } else {
      alert('Access Denied! You are not an admin. ⛔');
      navigate('/'); // অ্যাডমিন না হলে হোমপেজে পাঠিয়ে দিবে
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    if(window.confirm('Are you sure you want to logout?')) {
      await supabase.auth.signOut();
      navigate('/');
    }
  };

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin' },
    { name: 'Orders', icon: <ShoppingCart size={20} />, path: '/admin/orders' },
    { name: 'Deposits', icon: <CreditCard size={20} />, path: '/admin/deposits' },
    { name: 'Packages', icon: <Package size={20} />, path: '/admin/packages' },
    { name: 'Slider', icon: <ImageIcon size={20} />, path: '/admin/slider' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-[#fbbf24]">
        <Loader2 className="animate-spin mb-4" size={48} />
        <h2 className="text-xl font-bold">Verifying Admin Access...</h2>
      </div>
    );
  }

  // যদি অ্যাডমিন না হয়, তবে নিচের কিছুই রেন্ডার হবে না (নিরাপদ)
  if (!isAdmin) return null;

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-0 md:w-20'} bg-[#0a1526] text-white transition-all duration-300 flex flex-col overflow-hidden z-20`}>
        <div className="h-16 flex items-center justify-center border-b border-gray-800">
          {isSidebarOpen ? (
            <img src="https://eagleeyetopup.com/logo.png" alt="Logo" className="h-10 bg-white p-1 rounded" />
          ) : (
            <span className="font-bold text-xl text-[#0052FF] hidden md:block">EE</span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link 
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition ${
                    location.pathname === item.path ? 'bg-[#0052FF] text-white shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span className={`${!isSidebarOpen && 'md:hidden'} whitespace-nowrap`}>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 border-t border-gray-800">
          <button onClick={handleLogout} className="flex items-center gap-3 text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-lg transition w-full px-3 py-2">
            <LogOut size={20} />
            <span className={`${!isSidebarOpen && 'md:hidden'}`}>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 lg:px-8 z-10">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="text-gray-600 hover:text-[#0052FF] transition p-2 bg-gray-100 rounded-lg"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-[#0a1930]">Super Admin</p>
              <p className="text-xs text-green-500 flex items-center justify-end gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
              </p>
            </div>
            <div className="h-10 w-10 rounded-full border-2 border-[#0052FF] bg-[#0a1930] flex items-center justify-center text-white font-bold">
              SA
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-[#f4f7fb]">
          <Outlet />
        </main>
      </div>
      
    </div>
  );
};

export default AdminLayout;