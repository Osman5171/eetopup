import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Wallet, Clock, LogOut, ChevronRight, Loader2, ShieldCheck, Copy, CheckCircle2, MapPin, Map, AlertTriangle } from 'lucide-react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const Profile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabQuery = searchParams.get('tab');
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState(tabQuery || 'orders');
  const [copiedId, setCopiedId] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState('prompt'); // 'prompt', 'granted', 'denied'

  const [localProfile, setLocalProfile] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    balance: 0,
    role: 'user',
    division: '',
    district: ''
  });

  const [orderHistory, setOrderHistory] = useState([]);

  // Bangladesh Divisions and Districts Data for Manual Fallback
  const locations = {
    "Dhaka": ["Dhaka", "Faridpur", "Gazipur", "Gopalganj", "Kishoreganj", "Madaripur", "Manikganj", "Munshiganj", "Narayanganj", "Narsingdi", "Rajbari", "Shariatpur", "Tangail"],
    "Chattogram": ["Chattogram", "Bandarban", "Brahmanbaria", "Chandpur", "Cox's Bazar", "Cumilla", "Feni", "Khagrachhari", "Lakshmipur", "Noakhali", "Rangamati"],
    "Rajshahi": ["Rajshahi", "Bogura", "Chapainawabganj", "Joypurhat", "Naogaon", "Natore", "Pabna", "Sirajganj"],
    "Khulna": ["Khulna", "Bagerhat", "Chuadanga", "Jashore", "Jhenaidah", "Kushtia", "Magura", "Meherpur", "Narail", "Satkhira"],
    "Barishal": ["Barishal", "Barguna", "Bhola", "Jhalokati", "Patuakhali", "Pirojpur"],
    "Sylhet": ["Sylhet", "Habiganj", "Moulvibazar", "Sunamganj"],
    "Rangpur": ["Rangpur", "Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat", "Nilphamari", "Panchagarh", "Thakurgaon"],
    "Mymensingh": ["Mymensingh", "Jamalpur", "Netrokona", "Sherpur"]
  };

  const divisions = Object.keys(locations);
  const availableDistricts = localProfile.division && locations[localProfile.division] ? locations[localProfile.division] : [];

  useEffect(() => {
    if (tabQuery) setActiveTab(tabQuery);
  }, [tabQuery]);

  const { data: serverData, isLoading: loading, error, isError } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session) {
        navigate('/auth');
        throw new Error("No active session");
      }

      const user = session.user;

      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (!profile) {
         profile = {
            id: user.id,
            full_name: user.user_metadata?.full_name || '',
            phone: '',
            balance: 0,
            role: 'user',
            division: '',
            district: ''
         }
      }

      const { data: orders } = await supabase
        .from('orders')
        .select('amount, created_at, status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Calculate Order Stats
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); 
      startOfWeek.setHours(0,0,0,0);
      
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      let totalAmount = 0;
      let thisWeekAmount = 0;
      let thisMonthAmount = 0;

      if (orders) {
          orders.forEach(order => {
              if(order.status === 'completed'){
                  const amt = Number(order.amount || 0);
                  const orderDate = new Date(order.created_at);
                  
                  totalAmount += amt;
                  
                  if(orderDate >= startOfWeek) {
                      thisWeekAmount += amt;
                  }
                  if(orderDate >= startOfMonth) {
                      thisMonthAmount += amt;
                  }
              }
          });
      }

      return {
        profile: {
          id: user.id,
          name: profile.full_name || '',
          email: user.email,
          phone: profile.phone || profile.whatsapp || '', 
          balance: profile.balance || 0,
          role: profile.role || 'user',
          isAdmin: profile.role === 'admin' || profile.is_admin === true,
          division: profile.division || '',
          district: profile.district || ''
        },
        orders: orders || [],
        stats: {
            totalAmount,
            thisWeekAmount,
            thisMonthAmount
        }
      };
    },
    staleTime: 1000 * 60 * 2,
  });

  useEffect(() => {
    if (serverData?.profile) {
      setLocalProfile(serverData.profile);
      // If already has location, set status to granted
      if(serverData.profile.division && serverData.profile.district) {
          setLocationStatus('granted');
      }
    }
    if (serverData?.orders) {
        setOrderHistory(serverData.orders);
    }
  }, [serverData]);

  const updateProfileMutation = useMutation({
    mutationFn: async (updatedData) => {
        const { error } = await supabase
        .from('profiles')
        .update({ 
            full_name: updatedData.name, 
            phone: updatedData.phone,
            division: updatedData.division,
            district: updatedData.district
        })
        .eq('id', localProfile.id);

        if (error) throw error;
    },
    onSuccess: () => {
        queryClient.invalidateQueries(['profile']);
        alert('Profile updated successfully! ✅');
    },
    onError: (err) => {
        alert('Error updating profile: ' + err.message);
    }
  });

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(localProfile);
  };

  const handleLogout = async () => {
    if(window.confirm('Are you sure you want to logout?')) {
      await supabase.auth.signOut();
      queryClient.clear();
      navigate('/'); 
    }
  };

  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 🔥 Improved Auto Location Detection Logic
  const handleAutoLocate = () => {
    setLocating(true);

    if (!("geolocation" in navigator)) {
        alert("আপনার ব্রাউজারে লোকেশন ট্র্যাকিং সাপোর্ট করে না!");
        setLocationStatus('denied');
        setLocating(false);
        return;
    }

    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
         alert("নিরাপত্তার কারণে শুধুমাত্র HTTPS কানেকশনে অটো লোকেশন কাজ করে। দয়া করে ম্যানুয়ালি সিলেক্ট করুন।");
         setLocationStatus('denied');
         setLocating(false);
         return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                // Reverse Geocoding using a free reliable API
                const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                
                if (!res.ok) throw new Error("API Response Error");
                
                const data = await res.json();
                
                if(data) {
                    setLocalProfile(prev => ({
                        ...prev,
                        division: data.principalSubdivision ? data.principalSubdivision.replace(' Division', '') : prev.division,
                        district: data.city || data.locality || prev.district
                    }));
                    setLocationStatus('granted');
                    alert("লোকেশন সফলভাবে ডিটেক্ট করা হয়েছে! ✅");
                } else {
                    throw new Error("No data returned");
                }
            } catch (e) {
                console.error("Geocoding failed", e);
                alert("আপনার লোকেশন খুঁজে পাওয়া যাচ্ছে না। দয়া করে ম্যানুয়ালি সিলেক্ট করুন।");
                setLocationStatus('denied');
            } finally {
                setLocating(false);
            }
        },
        (error) => {
            console.error("User denied location or error:", error);
            setLocationStatus('denied');
            setLocating(false);
        },
        { timeout: 10000, enableHighAccuracy: true } // Added high accuracy
    );
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-[#8B5CF6]">
        <Loader2 className="animate-spin mb-2" size={40} />
        <p className="font-bold text-gray-300">Loading Profile...</p>
      </div>
    );
  }

  if(isError) {
      return <div className="text-center text-red-500 mt-10">Error loading profile: {error?.message}</div>
  }

  return (
    <div className="w-full mt-6 mb-12 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Sidebar */}
        <div className="md:col-span-4 flex flex-col gap-6">
          
          <div className="bg-[#1E293B] rounded-2xl shadow-lg border border-[#334155] p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#6D28D9] p-[3px] mb-4 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
               <div className="w-full h-full bg-[#0F172A] rounded-full flex items-center justify-center text-white text-4xl font-black uppercase">
                 {localProfile.email.charAt(0)}
               </div>
            </div>
            <h2 className="text-xl font-bold text-white">{localProfile.name || 'Set Your Name'}</h2>
            <p className="text-gray-400 text-sm flex items-center justify-center gap-1 mt-1">
              <Mail size={14} /> {localProfile.email}
            </p>
            {localProfile.phone && (
              <p className="text-gray-400 text-sm flex items-center justify-center gap-1 mt-1">
                <Phone size={14} /> {localProfile.phone}
              </p>
            )}
            {localProfile.district && (
               <p className="text-green-400 font-bold text-xs flex items-center justify-center gap-1 mt-2 bg-green-900/20 px-3 py-1 rounded-full border border-green-500/30">
               <MapPin size={12} /> {localProfile.district}, {localProfile.division}
             </p>
            )}
          </div>

          <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl shadow-lg border border-[#334155] p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[#A78BFA] text-sm mb-1 flex items-center gap-2">
                <Wallet size={16} /> Current Balance
              </p>
              <h3 className="text-3xl font-black tracking-wider text-white">৳ {localProfile.balance}</h3>
              <Link to="/contact" className="mt-4 w-full bg-[#8B5CF6] hover:bg-purple-600 text-white py-2.5 rounded-xl font-bold transition shadow-[0_0_15px_rgba(139,92,246,0.3)] flex justify-center text-center">
                Add Money
              </Link>
            </div>
            <Wallet size={100} className="absolute -bottom-6 -right-6 text-[#8B5CF6] opacity-10" />
          </div>

          {/* New Stats Panel for Topup */}
          <div className="flex justify-between bg-[#1E293B] p-4 rounded-xl border border-[#334155] text-center shadow-lg">
            <div className="w-1/3 border-r border-[#334155]">
                <b className="text-lg block text-white">৳{serverData?.stats?.thisWeekAmount || 0}</b>
                <span className="text-[10px] text-gray-400 font-bold uppercase">This Week</span>
            </div>
            <div className="w-1/3 border-r border-[#334155]">
                <b className="text-lg block text-yellow-500">৳{serverData?.stats?.thisMonthAmount || 0}</b>
                <span className="text-[10px] text-gray-400 font-bold uppercase">This Month</span>
            </div>
            <div className="w-1/3">
                <b className="text-lg block text-green-400">৳{serverData?.stats?.totalAmount || 0}</b>
                <span className="text-[10px] text-gray-400 font-bold uppercase">Total Spent</span>
            </div>
          </div>

          {localProfile.isAdmin && (
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
                      value={localProfile.name} 
                      onChange={(e) => setLocalProfile({...localProfile, name: e.target.value})}
                      className="w-full bg-[#0F172A] text-white border border-[#334155] rounded-xl p-3 focus:ring-2 focus:ring-[#8B5CF6] outline-none transition" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Phone / WhatsApp Number</label>
                    <input 
                      type="text" 
                      value={localProfile.phone} 
                      onChange={(e) => setLocalProfile({...localProfile, phone: e.target.value})}
                      className="w-full bg-[#0F172A] text-white border border-[#334155] rounded-xl p-3 focus:ring-2 focus:ring-[#8B5CF6] outline-none transition" 
                    />
                  </div>

                  {/* 🔥 Location Security Panel */}
                  <div className="border border-indigo-500/30 bg-indigo-900/10 rounded-xl p-4 mt-6">
                     <h4 className="text-sm font-bold text-indigo-300 mb-2 flex items-center gap-2">
                        <MapPin size={18}/> Location Security
                     </h4>
                     <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                        অ্যাকাউন্টের নিরাপত্তা নিশ্চিত করতে এবং অবৈধ ট্রানজ্যাকশন (Fraud) ঠেকাতে আমরা আপনার লোকেশন ভেরিফাই করতে চাই।
                     </p>
                     
                     {locationStatus !== 'granted' && locationStatus !== 'denied' && (
                         <button 
                            type="button" 
                            onClick={handleAutoLocate} 
                            disabled={locating}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold py-2.5 rounded-lg flex justify-center items-center gap-2 transition"
                         >
                            {locating ? <Loader2 size={16} className="animate-spin" /> : <Map size={16} />}
                            {locating ? 'Locating...' : 'Auto Detect Location (Allow Permission)'}
                         </button>
                     )}

                     {locationStatus === 'denied' && (
                         <div className="bg-orange-500/10 border border-orange-500/30 p-3 rounded-lg mb-4">
                             <p className="text-xs font-bold text-orange-400 flex items-center gap-1 mb-2">
                                <AlertTriangle size={14}/> আপনি লোকেশন পারমিশন ব্লক করেছেন! 
                             </p>
                             <p className="text-[10px] text-gray-400 mb-3">
                                নিরাপত্তা ভেরিফিকেশনের জন্য দয়া করে নিচের ফর্ম থেকে আপনার বর্তমান লোকেশন ম্যানুয়ালি সিলেক্ট করুন।
                             </p>
                             <div className="space-y-3">
                                <div>
                                    <select 
                                        value={localProfile.division} 
                                        onChange={(e) => setLocalProfile({...localProfile, division: e.target.value, district: ''})}
                                        className="w-full bg-[#0F172A] text-white border border-[#334155] rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none transition text-sm"
                                        required={locationStatus === 'denied'}
                                    >
                                        <option value="">Select Division (বিভাগ)</option>
                                        {divisions.map(div => <option key={div} value={div}>{div}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <select 
                                        value={localProfile.district} 
                                        onChange={(e) => setLocalProfile({...localProfile, district: e.target.value})}
                                        disabled={!localProfile.division}
                                        className="w-full bg-[#0F172A] text-white border border-[#334155] rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none transition text-sm disabled:opacity-50"
                                        required={locationStatus === 'denied'}
                                    >
                                        <option value="">Select District (জেলা)</option>
                                        {availableDistricts.map(dist => <option key={dist} value={dist}>{dist}</option>)}
                                    </select>
                                </div>
                             </div>
                         </div>
                     )}

                     {locationStatus === 'granted' && (
                         <div className="bg-green-500/10 border border-green-500/30 p-3 rounded-lg flex items-center gap-2">
                             <CheckCircle2 size={18} className="text-green-400"/>
                             <div>
                                 <p className="text-xs font-bold text-green-400">Location Verified</p>
                                 <p className="text-[10px] text-gray-400">{localProfile.district}, {localProfile.division}</p>
                             </div>
                         </div>
                     )}
                  </div>

                  <button disabled={updateProfileMutation.isPending} type="submit" className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white py-3 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all flex items-center justify-center gap-2 mt-6">
                    {updateProfileMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : 'Save Profile Changes'}
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