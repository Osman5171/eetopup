import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Users, CreditCard, Settings, LogOut, Menu, X, Package, Layers } from 'lucide-react';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin' },
    { name: 'Orders', icon: <ShoppingCart size={20} />, path: '/admin/orders' },
    { name: 'Deposits', icon: <CreditCard size={20} />, path: '/admin/deposits' },
    { name: 'Packages', icon: <Package size={20} />, path: '/admin/packages' },
    { name: 'Categories', icon: <Layers size={20} />, path: '/admin/categories' },
    { name: 'Users', icon: <Users size={20} />, path: '/admin/users' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/admin/settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-0 md:w-20'} bg-[#0a1526] text-white transition-all duration-300 flex flex-col overflow-hidden`}>
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-center border-b border-gray-800">
          {isSidebarOpen ? (
            <img src="https://eagleeyetopup.com/logo.png" alt="Logo" className="h-10 bg-white p-1 rounded" />
          ) : (
            <span className="font-bold text-xl text-blue-500 hidden md:block">EE</span>
          )}
        </div>

        {/* Menu Links */}
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
                  <span className={`${!isSidebarOpen && 'md:hidden'}`}>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-800">
          <button className="flex items-center gap-3 text-red-400 hover:text-red-300 transition w-full px-3 py-2">
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
              <p className="text-sm font-bold text-[#0a1930]">Admin User</p>
              <p className="text-xs text-green-500">Online</p>
            </div>
            <img src="https://i.pravatar.cc/150?img=11" alt="Admin" className="h-10 w-10 rounded-full border-2 border-[#0052FF]" />
          </div>
        </header>

        {/* Page Content (Outlet e onnanno page load hobe) */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      
    </div>
  );
};

export default AdminLayout;