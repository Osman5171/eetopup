import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Wallet, Clock, LogOut, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [userData, setUserData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    balance: 0
  });

  const [orderHistory, setOrderHistory] = useState([]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    // লগিন করা না থাকলে auth পেজে পাঠিয়ে দিবে
    if (!session) {
      navigate('/auth');
      return;
    }

    const user = session.user;

    // ১. ডাটাবেস থেকে প্রোফাইল ডাটা আনা
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile) {
      setUserData({
        id: user.id,
        name: profile.full_name || '',
        email: user.email,
        phone: profile.phone || profile.whatsapp || '', 
        balance: profile.balance || 0
      });
    }

    // ২. ডাটাবেস থেকে ইউজারের অর্ডার হিস্ট্রি আনা
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (orders) {
      setOrderHistory(orders);
    }

    setLoading(false);
  };

  // প্রোফাইল আপডেট করার ফাংশন
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: userData.name, phone: userData.phone })
      .eq('id', userData.id);

    if (error) {
      alert('Error updating profile: ' + error.message);
    } else {
      alert('Profile updated successfully! ✅');
    }
    setUpdating(false);
  };

  // লগআউট করার ফাংশন
  const handleLogout = async () => {
    if(window.confirm('Are you sure you want to logout?')) {
      await supabase.auth.signOut();
      navigate('/'); // লগআউট হলে হোম পেজে চলে যাবে
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-[#0052FF]">
        <Loader2 className="animate-spin mb-2" size={40} />
        <p className="font-bold">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="w-full mt-6 mb-12 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Sidebar: User Info & Menu */}
        <div className="md:col-span-4 flex flex-col gap-6">
          
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#0052FF] to-blue-400 p-1 mb-4 flex items-center justify-center text-white text-4xl font-black uppercase">
              {userData.email.charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-[#0a1930]">{userData.name || 'Set Your Name'}</h2>
            <p className="text-gray-500 text-sm flex items-center justify-center gap-1 mt-1">
              <Mail size={14} /> {userData.email}
            </p>
            {userData.phone && (
              <p className="text-gray-500 text-sm flex items-center justify-center gap-1 mt-1">
                <Phone size={14} /> {userData.phone}
              </p>
            )}
          </div>

          {/* Wallet Card */}
          <div className="bg-gradient-to-r from-[#0a1930] to-[#1e3a6e] rounded-xl shadow-md p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-blue-200 text-sm mb-1 flex items-center gap-2">
                <Wallet size={16} /> Current Balance
              </p>
              <h3 className="text-3xl font-black tracking-wider">৳ {userData.balance}</h3>
              <Link to="/contact" className="mt-4 w-full bg-[#0052FF] hover:bg-blue-600 text-white py-2 rounded-lg font-bold transition shadow flex justify-center block text-center">
                Add Money
              </Link>
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
            <button onClick={handleLogout} className="w-full flex items-center justify-between p-4 text-red-500 hover:bg-red-50 transition border-t border-gray-100">
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
                  <Clock size={20} className="text-[#0052FF]" /> Order History
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
                      {orderHistory.length > 0 ? (
                        orderHistory.map((order) => (
                          <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                            <td className="p-3 text-sm font-semibold text-gray-700">#ORD-{order.id}</td>
                            <td className="p-3 text-sm text-[#0a1930] font-bold">{order.package_name}</td>
                            <td className="p-3 text-sm text-gray-500">
                              {new Date(order.created_at).toLocaleDateString('en-GB')}
                            </td>
                            <td className="p-3 text-sm text-[#0052FF] font-bold">৳{order.amount}</td>
                            <td className="p-3 text-sm text-right">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                                order.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="p-6 text-center text-gray-400 font-medium">
                            You have no orders yet.
                          </td>
                        </tr>
                      )}
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
                <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={userData.name} 
                      onChange={(e) => setUserData({...userData, name: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#0052FF] outline-none transition" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone / WhatsApp Number</label>
                    <input 
                      type="text" 
                      value={userData.phone} 
                      onChange={(e) => setUserData({...userData, phone: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#0052FF] outline-none transition" 
                    />
                  </div>
                  <button disabled={updating} type="submit" className="bg-[#0a1930] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-[#1e3a6e] transition shadow flex items-center gap-2">
                    {updating ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
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