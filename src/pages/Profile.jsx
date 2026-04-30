import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Wallet, Clock, LogOut, ChevronRight, Loader2, ShieldCheck, Copy, CheckCircle2 } from 'lucide-react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Profile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabQuery = searchParams.get('tab');
  
  const [activeTab, setActiveTab] = useState(tabQuery || 'orders');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const [userData, setUserData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    balance: 0,
    isAdmin: false 
  });

  const [orderHistory, setOrderHistory] = useState([]);

  useEffect(() => {
    if (tabQuery) setActiveTab(tabQuery);
  }, [tabQuery]);

  useEffect(() => {
    fetchUserData();
  }, [activeTab]);

  const fetchUserData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/auth');
      return;
    }

    const user = session.user;

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
        balance: profile.balance || 0,
        isAdmin: profile.role === 'admin' || profile.is_admin === true 
      });
    }

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

  const handleLogout = async () => {
    if(window.confirm('Are you sure you want to logout?')) {
      await supabase.auth.signOut();
      navigate('/'); 
    }
  };

  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-[#8B5CF6]">
        <Loader2 className="animate-spin mb-2" size={40} />
        <p className="font-bold text-gray-300">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="w-full mt-6 mb-12 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Sidebar */}
        <div className="md:col-span-4 flex flex-col gap-6">
          
          <div className="bg-[#1E293B] rounded-2xl shadow-lg border border-[#334155] p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#6D28D9] p-[3px] mb-4 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
               <div className="w-full h-full bg-[#0F172A] rounded-full flex items-center justify-center text-white text-4xl font-black uppercase">
                 {userData.email.charAt(0)}
               </div>
            </div>
            <h2 className="text-xl font-bold text-white">{userData.name || 'Set Your Name'}</h2>
            <p className="text-gray-400 text-sm flex items-center justify-center gap-1 mt-1">
              <Mail size={14} /> {userData.email}
            </p>
            {userData.phone && (
              <p className="text-gray-400 text-sm flex items-center justify-center gap-1 mt-1">
                <Phone size={14} /> {userData.phone}
              </p>
            )}
          </div>

          <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl shadow-lg border border-[#334155] p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[#A78BFA] text-sm mb-1 flex items-center gap-2">
                <Wallet size={16} /> Current Balance
              </p>
              <h3 className="text-3xl font-black tracking-wider text-white">৳ {userData.balance}</h3>
              <Link to="/contact" className="mt-4 w-full bg-[#8B5CF6] hover:bg-purple-600 text-white py-2.5 rounded-xl font-bold transition shadow-[0_0_15px_rgba(139,92,246,0.3)] flex justify-center text-center">
                Add Money
              </Link>
            </div>
            <Wallet size={100} className="absolute -bottom-6 -right-6 text-[#8B5CF6] opacity-10" />
          </div>

          {userData.isAdmin && (
            <Link to="/admin" className="w-full bg-gradient-to-r from-red-900/40 to-[#0F172A] text-white p-4 rounded-xl flex items-center justify-between shadow-lg hover:border-red-500/50 transition-all group border border-red-900/50">
              <div className="flex items-center gap-3">
                <div className="bg-red-500/20 p-2.5 rounded-lg group-hover:scale-110 transition-transform">
                  <ShieldCheck className="text-red-400" size={24} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-red-400">Admin Dashboard</h3>
                  <p className="text-[10px] text-gray-400">Manage packages & users</p>
                </div>
              </div>
              <span className="text-red-400 font-black group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          )}

          <div className="bg-[#1E293B] rounded-2xl shadow-lg border border-[#334155] overflow-hidden">
            <button 
              onClick={() => { setActiveTab('orders'); navigate('/profile?tab=orders'); }}
              className={`w-full flex items-center justify-between p-4 transition ${activeTab === 'orders' ? 'bg-[#8B5CF6]/10 text-[#A78BFA] border-l-4 border-[#8B5CF6]' : 'text-gray-400 hover:bg-[#0F172A]'}`}
            >
              <div className="flex items-center gap-3 font-semibold"><Clock size={18} /> My Orders / Vouchers</div>
              <ChevronRight size={18} />
            </button>
            <button 
              onClick={() => { setActiveTab('settings'); navigate('/profile?tab=settings'); }}
              className={`w-full flex items-center justify-between p-4 transition border-t border-[#334155] ${activeTab === 'settings' ? 'bg-[#8B5CF6]/10 text-[#A78BFA] border-l-4 border-[#8B5CF6]' : 'text-gray-400 hover:bg-[#0F172A]'}`}
            >
              <div className="flex items-center gap-3 font-semibold"><User size={18} /> Profile Settings</div>
              <ChevronRight size={18} />
            </button>
            <button onClick={handleLogout} className="w-full flex items-center justify-between p-4 text-red-400 hover:bg-red-900/20 transition border-t border-[#334155]">
              <div className="flex items-center gap-3 font-semibold"><LogOut size={18} /> Logout</div>
            </button>
          </div>

        </div>

        {/* Right Content Area */}
        <div className="md:col-span-8">
          
          <div className="bg-[#1E293B] rounded-2xl shadow-lg border border-[#334155] p-6 h-full">
            
            {activeTab === 'orders' && (
              <div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Clock size={20} className="text-[#8B5CF6]" /> Order History
                </h3>
                
                <div className="space-y-4">
                  {orderHistory.length > 0 ? (
                    orderHistory.map((order, index) => (
                      <div key={order.id} className="bg-[#0F172A] border border-[#334155] rounded-xl p-4 md:p-5 hover:border-[#8B5CF6]/50 transition-all shadow-md">
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                          <div className="space-y-2.5">
                            {/* 👈 Updated: Serial No is 1, 2, 3... and removed EE- */}
                            <p className="text-sm text-gray-400 font-bold flex justify-between sm:justify-start gap-2">
                              Serial NO: <span className="text-white">{index + 1} <span className="text-gray-600 text-xs ml-1">(#{order.id})</span></span>
                            </p>
                            <p className="text-sm text-gray-400 font-bold flex justify-between sm:justify-start gap-2">
                              Date: <span className="text-white">{new Date(order.created_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}</span>
                            </p>
                            <p className="text-sm text-gray-400 font-bold flex justify-between sm:justify-start gap-2">
                              Package: <span className="text-white">{order.package_name}</span>
                            </p>
                          </div>
                          
                          <div className="space-y-2.5">
                            <p className="text-sm text-gray-400 font-bold flex justify-between sm:justify-start gap-2">
                              Info/ID: <span className="text-white">{order.player_id}</span>
                            </p>
                            <p className="text-sm text-gray-400 font-bold flex justify-between sm:justify-start gap-2">
                              Price: <span className="text-[#00E5FF]">৳{order.amount}</span>
                            </p>
                            <p className="text-sm text-gray-400 font-bold flex justify-between sm:justify-start gap-2 items-center">
                              Status: 
                              <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-black ${
                                order.status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                                order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                              }`}>
                                {order.status}
                              </span>
                            </p>
                          </div>
                        </div>

                        {order.voucher_code && order.voucher_code.trim() !== '' && (
                          <div className="mt-4 pt-4 border-t border-[#334155]">
                            <p className="text-xs font-bold text-[#A78BFA] mb-2 uppercase tracking-wider flex items-center gap-1">
                              🎟️ Your Delivered Voucher Code(s):
                            </p>
                            <div className="bg-[#1E293B] p-3 rounded-lg border border-[#8B5CF6]/30">
                              {order.voucher_code.split('\n\n').filter(c => c.trim()).map((code, idx) => (
                                <div key={idx} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 ${idx > 0 ? 'mt-3 pt-3 border-t border-[#334155]' : ''}`}>
                                  <div className="font-mono text-sm text-[#00E5FF] font-bold break-all">
                                    {idx > 0 && <span className="text-gray-500 text-xs mr-1">#{idx + 1}</span>}
                                    {code.trim()}
                                  </div>
                                  <button
                                    onClick={() => handleCopyCode(code.trim(), `${order.id}-${idx}`)}
                                    className="shrink-0 bg-[#8B5CF6] hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1"
                                  >
                                    {copiedId === `${order.id}-${idx}` ? (
                                      <><CheckCircle2 size={14} /> Copied!</>
                                    ) : (
                                      <><Copy size={12} /> Copy</>
                                    )}
                                  </button>
                                </div>
                              ))}
                              {order.voucher_code.split('\n\n').filter(c => c.trim()).length > 1 && (
                                <button
                                  onClick={() => handleCopyCode(order.voucher_code.split('\n\n').filter(c => c.trim()).join('\n'), `${order.id}-all`)}
                                  className="mt-3 w-full bg-[#0F172A] hover:bg-[#334155] text-gray-300 border border-[#334155] px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1"
                                >
                                  {copiedId === `${order.id}-all` ? (
                                    <><CheckCircle2 size={14} className="text-green-400" /> All Codes Copied!</>
                                  ) : (
                                    <><Copy size={12} /> Copy All Codes</>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {order.status === 'pending' && 
                         order.package_name && 
                         (order.package_name.toLowerCase().includes('voucher') || order.package_name.toLowerCase().includes('unipin')) &&
                         (!order.voucher_code || order.voucher_code.trim() === '') && (
                          <div className="mt-4 pt-4 border-t border-[#334155]">
                            <p className="text-xs text-orange-400 font-bold bg-orange-500/10 p-3 rounded-lg border border-orange-500/20">
                              ⏳ আপনার ভাউচার কোড প্রসেস হচ্ছে। কিছুক্ষণের মধ্যে এখানে দেখা যাবে।
                            </p>
                          </div>
                        )}

                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-gray-500 font-medium">
                      You have no orders yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <User size={20} className="text-[#8B5CF6]" /> Edit Profile
                </h3>
                <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={userData.name} 
                      onChange={(e) => setUserData({...userData, name: e.target.value})}
                      className="w-full bg-[#0F172A] text-white border border-[#334155] rounded-xl p-3 focus:ring-2 focus:ring-[#8B5CF6] outline-none transition" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Phone / WhatsApp Number</label>
                    <input 
                      type="text" 
                      value={userData.phone} 
                      onChange={(e) => setUserData({...userData, phone: e.target.value})}
                      className="w-full bg-[#0F172A] text-white border border-[#334155] rounded-xl p-3 focus:ring-2 focus:ring-[#8B5CF6] outline-none transition" 
                    />
                  </div>
                  <button disabled={updating} type="submit" className="bg-[#8B5CF6] text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-600 transition shadow-[0_0_15px_rgba(139,92,246,0.3)] flex items-center gap-2 mt-4">
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