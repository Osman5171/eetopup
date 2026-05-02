import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Wallet, Clock, LogOut, ChevronRight, Loader2, ShieldCheck, MapPin, Map, AlertTriangle, Hash, ShoppingBag, CheckCircle2, Lock, Camera, Save, Activity, Code, Rocket, Copy } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Profile = () => {
  const navigate = useNavigate();
  const [locating, setLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState('prompt'); 
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [supportLinks, setSupportLinks] = useState({ whatsapp: '', telegram: '' });
  const [orderCount, setOrderCount] = useState(0);
  
  const [localProfile, setLocalProfile] = useState({
    id: '',
    support_id: '',
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    avatar_url: '',
    balance: 0,
    role: 'user',
    isAdmin: false,
    division: '',
    district: ''
  });

  const [userStats, setUserStats] = useState({
    totalAmount: 0,
    thisWeekAmount: 0,
    thisMonthAmount: 0
  });

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
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session || !session.user) {
        navigate('/auth');
        return;
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

      let currentSupportId = profile?.support_id;
      if (!currentSupportId) {
        // Generate sequential support ID starting from 1
        const { data: existingIds } = await supabase
          .from('profiles')
          .select('support_id')
          .not('support_id', 'is', null)
          .order('support_id', { ascending: false })
          .limit(1);
        
        let nextId = 1;
        if (existingIds && existingIds.length > 0) {
          const maxId = parseInt(existingIds[0].support_id) || 0;
          nextId = maxId + 1;
        }
        
        currentSupportId = nextId.toString();
        
        if (profile) {
          await supabase.from('profiles').update({ support_id: currentSupportId }).eq('id', user.id);
        }
      }

      if (!profile) {
         profile = {
            id: user.id,
            support_id: currentSupportId || '',
            full_name: user.user_metadata?.full_name || '',
            phone: '',
            balance: 0,
            role: 'user',
            division: '',
            district: ''
         };
      }

      setLocalProfile({
          id: user.id,
          support_id: currentSupportId || '',
          name: profile.full_name || '',
          email: user?.email || '', // <-- ফিক্স করা হয়েছে
          phone: profile.phone || profile.whatsapp || '', 
          balance: profile.balance || 0,
          role: profile.role || 'user',
          isAdmin: profile.role === 'admin' || profile.is_admin === true,
          division: profile.division || '',
          district: profile.district || ''
      });

      if (profile.division && profile.district) {
          setLocationStatus('granted');
      }

      const { data: orders } = await supabase
        .from('orders')
        .select('amount, created_at, status')
        .eq('user_id', user.id);

      if (orders) {
          const now = new Date();
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay()); 
          startOfWeek.setHours(0,0,0,0);
          
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

          let totalAmt = 0;
          let weekAmt = 0;
          let monthAmt = 0;

          orders.forEach(order => {
              if(order.status === 'completed'){
                  const amt = Number(order.amount || 0);
                  const orderDate = new Date(order.created_at);
                  
                  totalAmt += amt;
                  
                  if(orderDate >= startOfWeek) weekAmt += amt;
                  if(orderDate >= startOfMonth) monthAmt += amt;
              }
          });

          setUserStats({
              totalAmount: totalAmt,
              thisWeekAmount: weekAmt,
              thisMonthAmount: monthAmt
          });
          setOrderCount(orders.length);
      }

      const { data: settings } = await supabase
        .from('settings')
        .select('whatsapp_link, support_telegram')
        .eq('id', 1)
        .single();

      if (settings) {
        setSupportLinks({
          whatsapp: settings.whatsapp_link || '',
          telegram: settings.support_telegram || ''
        });
      } else {
        const { data: fallbackSettings } = await supabase
          .from('settings')
          .select('key_name, key_value')
          .in('key_name', ['support_whatsapp', 'support_telegram']);

        if (fallbackSettings) {
          const links = { whatsapp: '', telegram: '' };
          fallbackSettings.forEach(item => {
            if (item.key_name === 'support_whatsapp') links.whatsapp = item.key_value;
            if (item.key_name === 'support_telegram') links.telegram = item.key_value;
          });
          setSupportLinks(links);
        }
      }

    } catch (err) {
        console.error("Profile Fetch Error:", err);
        setErrorMsg(err.message);
    } finally {
        setLoading(false);
    }
  };

  const uploadAvatar = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      return alert('Max avatar size is 3MB.');
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64Image = reader.result;
        const { error } = await supabase.from('profiles').update({ avatar_url: base64Image }).eq('id', localProfile.id);
        if (error) throw error;
        setLocalProfile(prev => ({ ...prev, avatar_url: base64Image }));
        alert('Profile picture updated successfully!');
      } catch (err) {
        console.error(err);
        alert('Avatar upload failed: ' + err.message);
      } finally {
        setUploading(false);
        event.target.value = null;
      }
    };
    reader.onerror = () => {
      alert('Failed to read image file.');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
        const { error } = await supabase
        .from('profiles')
        .update({ 
            full_name: localProfile.name, 
            phone: localProfile.phone,
            whatsapp: localProfile.whatsapp,
            division: localProfile.division,
            district: localProfile.district
        })
        .eq('id', localProfile.id);

        if (error) throw error;
        alert('Profile updated successfully!');
        fetchProfileData();
    } catch (err) {
        alert('Error updating profile: ' + err.message);
    } finally {
        setUpdating(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) return alert('Please enter your current password.');
    if (newPassword.length < 6) return alert('New password must be at least 6 characters.');

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: localProfile.email,
        password: currentPassword
      });
      if (signInError) throw signInError;

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      alert('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      alert('Password update failed: ' + err.message);
    }
  };

  const handleLogout = async () => {
    if(window.confirm('Are you sure you want to logout?')) {
      await supabase.auth.signOut();
      navigate('/'); 
    }
  };

  const handleAutoLocate = () => {
    setLocating(true);
    if (!("geolocation" in navigator)) {
        alert("Geolocation is not supported by your browser!");
        setLocationStatus('denied');
        setLocating(false);
        return;
    }

    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
         alert("Geolocation requires HTTPS.");
         setLocationStatus('denied');
         setLocating(false);
         return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            try {
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
                    alert("Location detected successfully!");
                } else {
                    throw new Error("No data returned");
                }
            } catch (e) {
                console.error("Geocoding failed", e);
                alert("Failed to get location details. Please fill manually.");
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
        { timeout: 10000, enableHighAccuracy: true } 
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

  if (errorMsg) {
      return <div className="text-center text-red-500 mt-10">Error loading profile: {errorMsg}</div>
  }

  return (
    <div className="w-full mt-6 mb-12 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Sidebar */}
        <div className="md:col-span-4 flex flex-col gap-6">
          
          <div className="bg-[#1E293B] rounded-2xl shadow-lg border border-[#334155] p-6 flex flex-col items-center text-center relative overflow-hidden">
            <div className="relative w-28 h-28 mx-auto mb-3">
              <div className="w-28 h-28 rounded-full bg-[#0F172A] flex items-center justify-center border-4 border-[#8B5CF6] shadow-lg overflow-hidden">
                {localProfile.avatar_url ? (
                  <img src={localProfile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-4xl font-black uppercase">{localProfile.name ? localProfile.name.charAt(0) : 'U'}</span>
                )}
              </div>
              <label htmlFor="avatar_upload" className="absolute bottom-0 right-0 bg-[#fbbf24] text-black p-2 rounded-full border-2 border-[#0F172A] cursor-pointer hover:scale-110 transition shadow-md">
                {uploading ? <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full"></div> : <Camera size={16} />}
              </label>
              <input id="avatar_upload" type="file" accept="image/*" onChange={uploadAvatar} disabled={uploading} className="hidden" />
            </div>
            <h2 className="text-xl font-bold text-white relative z-10">{localProfile.name || 'Set Your Name'}</h2>
            <p className="text-gray-400 text-sm flex items-center justify-center gap-1 mt-1 relative z-10">
              <Mail size={14} /> {localProfile.email || 'No Email'}
            </p>
            {localProfile.phone && (
              <p className="text-gray-400 text-sm flex items-center justify-center gap-1 mt-1 relative z-10">
                <Phone size={14} /> {localProfile.phone}
              </p>
            )}
            {localProfile.whatsapp && localProfile.whatsapp !== localProfile.phone && (
              <p className="text-gray-400 text-sm flex items-center justify-center gap-1 mt-1 relative z-10">
                <Phone size={14} /> {localProfile.whatsapp}
              </p>
            )}

            <div className="mt-4 inline-flex items-center gap-2 bg-[#0F172A] border border-[#334155] rounded-lg px-4 py-2 shadow-sm relative z-10">
                <Hash size={14} className="text-[#8B5CF6]"/>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">UID:</span>
                <span className="text-[#A78BFA] font-mono font-bold text-sm tracking-widest">
                    {localProfile.support_id || localProfile.id?.slice(0,8) || ''}
                </span>
                <button onClick={() => { navigator.clipboard.writeText(localProfile.support_id || localProfile.id?.slice(0,8) || ''); alert('ID Copied!'); }} className="text-gray-400 hover:text-white transition"><Copy size={12} /></button>
            </div>

            <div className="mt-4 w-full text-left space-y-3 relative z-10">
              <Link to="/support" className="w-full inline-flex items-center justify-between gap-3 bg-[#0F172A] border border-[#334155] rounded-2xl px-4 py-3 text-sm text-gray-200 hover:bg-[#152033] transition">
                <span className="flex items-center gap-2"><Activity size={16} className="text-blue-400"/> Support</span>
                <ChevronRight size={16} />
              </Link>
              {supportLinks.whatsapp && (
                <a href={`https://wa.me/${supportLinks.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="w-full inline-flex items-center justify-between gap-3 bg-[#063f1d] border border-[#064c24] rounded-2xl px-4 py-3 text-sm text-green-200 hover:bg-[#0a5532] transition">
                  <span className="flex items-center gap-2"><Phone size={16} className="text-green-300"/> WhatsApp</span>
                  <ChevronRight size={16} />
                </a>
              )}
            </div>
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

          <div className="flex justify-between bg-[#1E293B] p-4 rounded-xl border border-[#334155] text-center shadow-lg">
            <div className="w-1/3 border-r border-[#334155]">
                <b className="text-lg block text-white">৳ {userStats.thisWeekAmount}</b>
                <span className="text-[10px] text-gray-400 font-bold uppercase">This Week</span>
            </div>
            <div className="w-1/3 border-r border-[#334155]">
                <b className="text-lg block text-yellow-500">৳ {userStats.thisMonthAmount}</b>
                <span className="text-[10px] text-gray-400 font-bold uppercase">This Month</span>
            </div>
            <div className="w-1/3">
                <b className="text-lg block text-green-400">৳ {userStats.totalAmount}</b>
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
              <span className="text-red-400 font-black group-hover:translate-x-1 transition-transform">➔</span>
            </Link>
          )}

          <div className="bg-[#1E293B] rounded-2xl shadow-lg border border-[#334155] overflow-hidden">
            <Link 
              to="/my-orders"
              className="w-full flex items-center justify-between p-4 text-gray-400 hover:bg-[#0F172A] transition"
            >
              <div className="flex items-center gap-3 font-semibold"><ShoppingBag size={18} /> My Orders / Vouchers</div>
              <ChevronRight size={18} />
            </Link>
            
            <div className="w-full flex items-center justify-between p-4 transition border-t border-[#334155] bg-[#8B5CF6]/10 text-[#A78BFA] border-l-4 border-[#8B5CF6]">
              <div className="flex items-center gap-3 font-semibold"><User size={18} /> Profile Settings</div>
              <ChevronRight size={18} />
            </div>

            <button onClick={handleLogout} className="w-full flex items-center justify-between p-4 text-red-400 hover:bg-red-900/20 transition border-t border-[#334155]">
              <div className="flex items-center gap-3 font-semibold"><LogOut size={18} /> Logout</div>
            </button>
          </div>

        </div>

        {/* Right Content Area */}
        <div className="md:col-span-8">
          <div className="bg-[#1E293B] rounded-2xl shadow-lg border border-[#334155] p-6 h-full">
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

                <div className="border border-indigo-500/30 bg-indigo-900/10 rounded-xl p-4 mt-6">
                   <h4 className="text-sm font-bold text-indigo-300 mb-2 flex items-center gap-2">
                      <MapPin size={18}/> Location Security
                   </h4>
                   <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                        To protect your account from unauthorized access, please provide your current division and district.
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
                              <AlertTriangle size={14}/> Please select manually
                           </p>
                           <div className="space-y-3">
                              <div>
                                  <select
                                       value={localProfile.division}
                                       onChange={(e) => setLocalProfile({...localProfile, division: e.target.value, district: ''})}
                                      className="w-full bg-[#0F172A] text-white border border-[#334155] rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none transition text-sm"
                                      required={locationStatus === 'denied'}
                                  >
                                      <option value="">Select Division</option>
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
                                      <option value="">Select District</option>
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

                <button disabled={updating} type="submit" className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white py-3 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all flex items-center justify-center gap-2 mt-6">
                  {updating ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save Profile Changes</>}
                </button>
              </form>

              <div className="bg-[#0F172A] border border-[#334155] rounded-2xl p-5 mt-6 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-white font-bold">Secure Password Change</h4>
                    <p className="text-xs text-gray-400">Update your account password safely.</p>
                  </div>
                  <Lock size={20} className="text-[#8B5CF6]" />
                </div>

                <div className="space-y-3">
                  <input
                    type="password"
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-3 bg-[#1E293B] rounded-xl border border-[#334155] text-white outline-none focus:border-blue-500 transition"
                  />
                  <input
                    type="password"
                    placeholder="New Password (min 6 chars)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-3 bg-[#1E293B] rounded-xl border border-[#334155] text-white outline-none focus:border-purple-500 transition"
                  />
                  <button
                    type="button"
                    onClick={handleChangePassword}
                    className="w-full bg-[#8B5CF6] hover:bg-purple-600 text-white py-3 rounded-xl font-bold transition"
                  >
                    Change Password
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <button onClick={() => navigate('/support')} className="w-full bg-[#1E293B] border border-[#334155] rounded-2xl p-4 flex items-center justify-between gap-3 text-left hover:border-[#8B5CF6] transition">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Need help?</p>
                    <h4 className="text-white font-bold">Support Center</h4>
                  </div>
                  <Activity size={22} className="text-[#8B5CF6]" />
                </button>
                <button onClick={() => window.open(supportLinks.whatsapp ? `https://wa.me/${supportLinks.whatsapp.replace(/[^0-9]/g, '')}` : '#', '_blank')} className="w-full bg-[#1E293B] border border-[#334155] rounded-2xl p-4 flex items-center justify-between gap-3 text-left hover:border-green-400 transition">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Chat directly</p>
                    <h4 className="text-white font-bold">WhatsApp Support</h4>
                  </div>
                  <Phone size={22} className="text-green-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;