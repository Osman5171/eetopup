import React, { useState } from 'react';
import { User, Mail, Phone, Wallet, Clock, LogOut, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('orders');

  // Dummy User Data
  const userData = {
    name: "Md. Ashif",
    email: "ashif@example.com",
    phone: "017XXXXXXXX",
    balance: 7294.00
  };

  // Dummy Order History
  const orderHistory = [
    { id: '#ORD-9823', product: '115 Diamond', amount: '৳77', date: '30 Mar 2026', status: 'Completed' },
    { id: '#ORD-9822', product: 'Weekly Pass', amount: '৳153', date: '29 Mar 2026', status: 'Completed' },
    { id: '#ORD-9810', product: 'Monthly Pass', amount: '৳760', date: '25 Mar 2026', status: 'Cancelled' },
  ];

  return (
    <div className="w-full mt-6 mb-12">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Sidebar: User Info & Menu */}
        <div className="md:col-span-4 flex flex-col gap-6">
          
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#0052FF] to-blue-400 p-1 mb-4">
              <img 
                src="https://i.pravatar.cc/150?img=11" 
                alt="Profile" 
                className="w-full h-full rounded-full border-4 border-white object-cover"
              />
            </div>
            <h2 className="text-xl font-bold text-[#0a1930]">{userData.name}</h2>
            <p className="text-gray-500 text-sm flex items-center justify-center gap-1 mt-1">
              <Mail size={14} /> {userData.email}
            </p>
            <p className="text-gray-500 text-sm flex items-center justify-center gap-1 mt-1">
              <Phone size={14} /> {userData.phone}
            </p>
          </div>

          {/* Wallet Card */}
          <div className="bg-gradient-to-r from-[#0a1930] to-[#1e3a6e] rounded-xl shadow-md p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-blue-200 text-sm mb-1 flex items-center gap-2">
                <Wallet size={16} /> Current Balance
              </p>
              <h3 className="text-3xl font-black tracking-wider">৳ {userData.balance}</h3>
              <button className="mt-4 w-full bg-[#0052FF] hover:bg-blue-600 text-white py-2 rounded-lg font-bold transition shadow">
                Add Money
              </button>
            </div>
            {/* Background Decor */}
            <Wallet size={100} className="absolute -bottom-6 -right-6 text-white opacity-10" />
          </div>

          {/* Navigation Menu */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between p-4 transition ${activeTab === 'orders' ? 'bg-blue-50 text-[#0052FF] border-l-4 border-[#0052FF]' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-3 font-semibold"><Clock size={18} /> My Orders</div>
              <ChevronRight size={18} />
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center justify-between p-4 transition border-t border-gray-100 ${activeTab === 'settings' ? 'bg-blue-50 text-[#0052FF] border-l-4 border-[#0052FF]' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-3 font-semibold"><User size={18} /> Profile Settings</div>
              <ChevronRight size={18} />
            </button>
            <button className="w-full flex items-center justify-between p-4 text-red-500 hover:bg-red-50 transition border-t border-gray-100">
              <div className="flex items-center gap-3 font-semibold"><LogOut size={18} /> Logout</div>
            </button>
          </div>

        </div>

        {/* Right Content Area */}
        <div className="md:col-span-8">
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
            
            {activeTab === 'orders' && (
              <div>
                <h3 className="text-xl font-bold text-[#0a1930] mb-6 flex items-center gap-2">
                  <Clock size={20} className="text-[#0052FF]" /> Recent Orders
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-sm">
                        <th className="p-3 font-medium rounded-tl-lg">Order ID</th>
                        <th className="p-3 font-medium">Product</th>
                        <th className="p-3 font-medium">Date</th>
                        <th className="p-3 font-medium">Amount</th>
                        <th className="p-3 font-medium rounded-tr-lg text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderHistory.map((order, index) => (
                        <tr key={index} className="border-b border-gray-50 hover:bg-gray-50 transition">
                          <td className="p-3 text-sm font-semibold text-gray-700">{order.id}</td>
                          <td className="p-3 text-sm text-[#0a1930] font-bold">{order.product}</td>
                          <td className="p-3 text-sm text-gray-500">{order.date}</td>
                          <td className="p-3 text-sm text-[#0052FF] font-bold">{order.amount}</td>
                          <td className="p-3 text-sm text-right">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              order.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h3 className="text-xl font-bold text-[#0a1930] mb-6 flex items-center gap-2">
                  <User size={20} className="text-[#0052FF]" /> Edit Profile
                </h3>
                <form className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input type="text" defaultValue={userData.name} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#0052FF] outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input type="text" defaultValue={userData.phone} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#0052FF] outline-none transition" />
                  </div>
                  <button type="button" className="bg-[#0a1930] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-[#1e3a6e] transition shadow">
                    Save Changes
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;