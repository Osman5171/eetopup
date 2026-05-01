import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { 
    Search, User, Users, Ban, CheckCircle, XCircle, 
    Globe, ShieldAlert, Clock, RefreshCcw, Radar, X,
    ShoppingCart, ArrowDownLeft, Mail, MapPin, Phone
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; 

// Note: Ensure these two utility files exist (you added them earlier)
import { hasPermission } from '../../utils/permissions'; 
import { logActivity } from '../../utils/activityLogger'; 

const AdminUsers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  // --- SEARCH & SORT STATES ---
  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [searchUID, setSearchUID] = useState('');
  const [searchIP, setSearchIP] = useState('');
  const [sortBy, setSortBy] = useState('newest'); 

  // --- MODAL STATES ---
  const [selectedUser, setSelectedUser] = useState(null); 
  const [viewDetailsUser, setViewDetailsUser] = useState(null); 
  const [activeTab, setActiveTab] = useState('info'); 
  const [banModalUser, setBanModalUser] = useState(null);
  const [banType, setBanType] = useState('none');
  const [roleModalUser, setRoleModalUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('user');
  const [amount, setAmount] = useState('');
  const [remarks, setRemarks] = useState('Admin Manual Update');
  const [showIpScanner, setShowIpScanner] = useState(false);

  // --- 1. REACT QUERY: FETCH USERS & PENDING DEPOSITS ---
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminUsersData'],
    queryFn: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No User");

        const { data: profile } = await supabase.from('profiles').select('role, id').eq('id', user.id).single();
        if (profile?.role !== 'admin' && profile?.role !== 'sub_admin') {
            throw new Error("Access Denied");
        }

        const [usersRes, depositsRes] = await Promise.all([
            supabase.from('profiles').select('*').order('created_at', { ascending: false }),
            supabase.from('deposits').select('*').eq('status', 'pending')
        ]);

        return { 
            role: profile.role, 
            adminId: profile.id, 
            users: usersRes.data || [],
            pendingReqs: depositsRes.data || [] 
        };
    },
    staleTime: 1000 * 60 * 2 
  });

  const currentUserRole = data?.role;
  const currentAdminId = data?.adminId;
  const usersList = data?.users || [];
  const pendingRequestsList = data?.pendingReqs || [];

  // AUTO OPEN MODAL LOGIC (If navigated from Search)
  useEffect(() => {
      if (location.state?.search) {
          setSearchUID(String(location.state.search)); 
      }
      if (location.state?.openUserId && usersList.length > 0) {
          const targetUser = usersList.find(u => u.id === location.state.openUserId);
          if (targetUser) setViewDetailsUser(targetUser); 
      }
  }, [location.state, usersList]);

  // --- 2. MEMOIZED FILTERING & SORTING ---
  const filteredUsers = useMemo(() => {
      let temp = [...usersList];

      if (searchName) temp = temp.filter(u => (u.full_name || u.name || '').toLowerCase().includes(searchName.toLowerCase().trim()));
      if (searchEmail) temp = temp.filter(u => (u.email || '').toLowerCase().includes(searchEmail.toLowerCase().trim()));
      if (searchPhone) temp = temp.filter(u => (u.phone || u.whatsapp || '').includes(searchPhone.trim()));
      if (searchIP) temp = temp.filter(u => (u.ip_address || '').includes(searchIP.trim()));
      if (searchUID) {
        temp = temp.filter(u => {
           const searchTerm = searchUID.toLowerCase().trim();
           return (u.support_id && String(u.support_id).includes(searchTerm)) || (u.id && u.id.toLowerCase().includes(searchTerm));
        });
      }

      if (sortBy === 'newest') temp.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      else if (sortBy === 'oldest') temp.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
      else if (sortBy === 'bal_high') temp.sort((a, b) => (parseFloat(b.balance) || 0) - (parseFloat(a.balance) || 0));
      else if (sortBy === 'bal_low') temp.sort((a, b) => (parseFloat(a.balance) || 0) - (parseFloat(b.balance) || 0));

      return temp;
  }, [usersList, searchName, searchEmail, searchPhone, searchUID, searchIP, sortBy]);

  // --- 3. IP SCANNER LOGIC ---
  const duplicateIps = useMemo(() => {
      if (!usersList || usersList.length === 0) return [];
      const ipMap = {};
      usersList.forEach(user => {
          if (user.ip_address) {
              const ips = user.ip_address.split(',').map(i => i.trim()).filter(i => i);
              ips.forEach(ip => {
                  if (!ipMap[ip]) ipMap[ip] = [];
                  if (!ipMap[ip].find(u => u.id === user.id)) ipMap[ip].push(user);
              });
          }
      });
      return Object.keys(ipMap).filter(ip => ipMap[ip].length > 1).map(ip => ({ ip, users: ipMap[ip] })).sort((a, b) => b.users.length - a.users.length); 
  }, [usersList]);

  // --- 4. REACT QUERY: FETCH USER DETAILS ---
  const { data: userDetails, isLoading: detailsLoading } = useQuery({
      queryKey: ['userDetails', viewDetailsUser?.id],
      queryFn: async () => {
          if (!viewDetailsUser) return null;
          
          const [depositsRes, ordersRes, logRes] = await Promise.all([
              supabase.from('deposits').select('*').eq('user_id', viewDetailsUser.id),
              supabase.from('orders').select('*').eq('user_id', viewDetailsUser.id),
              // Catch silently if table doesn't exist
              supabase.from('whatsapp_change_logs').select('*').eq('user_id', viewDetailsUser.id).order('changed_at', { ascending: false }).catch(()=>({data:[]})) 
          ]);

          const formattedTx = [];
          let totalSpent = 0, totalDep = 0, orderCount = 0;

          depositsRes.data?.forEach(d => {
              if (d.status === 'approved' || d.status === 'Completed') totalDep += parseFloat(d.amount || 0);
              formattedTx.push({ id: `dep_${d.id}`, label: `Added Money (${d.method || 'Auto'})`, amount: d.amount, sign: '+', color: 'text-green-500', bg: 'bg-green-500/10', iconName: 'ArrowDownLeft', date: d.created_at, status: d.status || 'Completed' });
          });

          ordersRes.data?.forEach(o => {
              if (o.status === 'completed') totalSpent += parseFloat(o.amount || 0);
              orderCount++;
              formattedTx.push({ id: `ord_${o.id}`, label: `Bought: ${o.package_name}`, amount: o.amount, sign: '-', color: 'text-red-500', bg: 'bg-red-500/10', iconName: 'ShoppingCart', date: o.created_at, status: o.status });
          });

          formattedTx.sort((a, b) => new Date(b.date) - new Date(a.date));
          return { transactions: formattedTx, whatsappLogs: logRes.data || [], stats: { totalSpent, totalDep, orderCount } };
      },
      enabled: !!viewDetailsUser, 
  });

  // Convert UUID to a readable 8-digit number for old users
  const getNumericId = (uuid) => {
    if(!uuid) return "00000000";
    let hash = 0;
    for (let i = 0; i < uuid.length; i++) {
        hash = uuid.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash).toString().substring(0, 8).padStart(8, '0');
  };

  // --- 5. MUTATIONS ---
  const balanceMutation = useMutation({
      mutationFn: async () => {
          const val = parseFloat(amount);
          const type = val >= 0 ? 'Credit' : 'Debit';
          
          const { error } = await supabase.from('profiles').update({ balance: val }).eq('id', selectedUser.id);
          if (error) throw error;

          // Try to log activity if the table exists
          try { await logActivity('UPDATE_BALANCE', `Updated balance for ${selectedUser.full_name || 'User'} to ${val}. Remarks: ${remarks}`); } catch(e) {}
          
          return "Balance Updated Successfully! ✅";
      },
      onSuccess: (msg) => { alert(msg); setSelectedUser(null); setAmount(''); queryClient.invalidateQueries({ queryKey: ['adminUsersData'] }); },
      onError: (err) => alert("Update Failed: " + err.message)
  });

  const applyBanMutation = useMutation({
      mutationFn: async () => {
          const { error } = await supabase.from('profiles').update({ ban_type: banType }).eq('id', banModalUser.id);
          if (error) throw error;
          
          if (banModalUser.ip_address) {
              const ipList = banModalUser.ip_address.split(',').map(ip => ip.trim());
              for (let ip of ipList) {
                  if (ip.length > 5) await supabase.from('profiles').update({ ban_type: banType }).ilike('ip_address', `%${ip}%`); 
              }
          }
          try { await logActivity('BAN_USER', `Changed ban status to ${banType}`); } catch(e) {}
      },
      onSuccess: () => { alert(`Success! Ban status applied. 🛑`); setBanModalUser(null); queryClient.invalidateQueries({ queryKey: ['adminUsersData'] }); },
      onError: (err) => alert("Ban Failed: " + err.message)
  });

  const roleMutation = useMutation({
      mutationFn: async () => {
          const { error } = await supabase.from('profiles').update({ role: selectedRole }).eq('id', roleModalUser.id);
          if (error) throw error;
          try { await logActivity('CHANGE_ROLE', `Changed role to ${selectedRole}`); } catch(e) {}
      },
      onSuccess: () => { alert("User Role Updated Successfully! 👑"); setRoleModalUser(null); queryClient.invalidateQueries({ queryKey: ['adminUsersData'] }); },
      onError: (err) => alert(err.message)
  });

  // --- HANDLERS ---
  const handleBalanceUpdate = (e) => {
      e.preventDefault();
      if (!amount || isNaN(amount)) return alert("Please enter valid amount");
      balanceMutation.mutate();
  };

  const formatDate = (dateString, withTime = false) => {
      if (!dateString) return 'N/A';
      try { 
          const options = withTime ? { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true } : { year: 'numeric', month: 'numeric', day: 'numeric' };
          return new Date(dateString).toLocaleString('en-US', options); 
      } catch (e) { return 'Invalid Date'; }
  };

  const renderBanBadge = (type) => {
      if(!type || type === 'none') return null;
      const config = {
          'deposit_ban': { text: 'DEPOSIT BAN', classes: 'bg-yellow-600 text-black' },
          'withdraw_ban': { text: 'WITHDRAW BAN', classes: 'bg-purple-600 text-white' },
          'match_ban': { text: 'MATCH BAN', classes: 'bg-orange-600 text-white' },
          'ip_ban': { text: 'FULL/IP BAN', classes: 'bg-red-600 text-white animate-pulse shadow-[0_0_10px_red]' },
          'full_ban': { text: 'FULL BAN', classes: 'bg-red-600 text-white animate-pulse shadow-[0_0_10px_red]' }
      };
      const badge = config[type] || { text: 'BANNED', classes: 'bg-red-600 text-white' };
      return <span className={`text-[9px] ${badge.classes} px-1.5 py-0.5 rounded font-black tracking-wider ml-2`}>{badge.text}</span>;
  };

  const renderIcon = (name, colorClass) => {
      const props = { className: colorClass, size: 20 };
      switch(name) {
          case 'ArrowDownLeft': return <ArrowDownLeft {...props} />;
          case 'ArrowUpRight': return <ArrowUpRight {...props} />;
          case 'ShoppingCart': return <ShoppingCart {...props} />;
          case 'History': return <History {...props} />;
          case 'AlertCircle': return <AlertCircle {...props} />;
          case 'RefreshCcw': return <RefreshCcw {...props} />;
          default: return <ShoppingCart {...props} />;
      }
  };

  if (isLoading) return <div className="min-h-screen bg-[#0f172a] text-white flex justify-center items-center animate-pulse"><RefreshCcw className="animate-spin text-[#fbbf24] mr-2"/> Loading Users...</div>;
  if (error) { return <div className="text-center text-red-500 mt-20">Error loading users.</div>; }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 pb-24 font-sans">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin')} className="bg-[#1e293b] p-2 rounded-full shadow hover:bg-gray-700 text-gray-400 transition">
            <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-[#fbbf24]">User Management</h1>
      </div>

      {/* --- SEARCH & SORT CONTROLS --- */}
      <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-700 mb-6 shadow-lg space-y-4">
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2">
                <Filter size={14}/> Filters
            </h3>
            
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => setShowIpScanner(true)}
                    className="bg-red-900/30 text-red-500 border border-red-900/50 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition flex items-center gap-1 shadow-sm"
                >
                    <Radar size={14} className="animate-spin-slow"/> IP Scanner
                </button>

                <div className="flex items-center gap-2 border-l border-gray-700 pl-3">
                    <span className="text-xs text-gray-400">Sort By:</span>
                    <div className="relative">
                        <select 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value)} 
                            className="bg-[#0f172a] text-white text-xs py-1.5 pl-2 pr-8 rounded border border-gray-600 outline-none appearance-none font-bold cursor-pointer"
                        >
                            <option value="newest">Newest Joined</option>
                            <option value="oldest">Oldest Joined</option>
                            <option value="bal_high">Balance: High to Low</option>
                            <option value="bal_low">Balance: Low to High</option>
                        </select>
                        <ArrowUpDown size={12} className="absolute right-2 top-2 text-gray-400 pointer-events-none"/>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative">
                <User size={14} className="absolute left-3 top-3 text-gray-500"/>
                <input type="text" placeholder="Name..." className="w-full bg-[#0f172a] pl-9 p-2.5 rounded border border-gray-600 text-sm focus:border-blue-500 outline-none" value={searchName} onChange={e => setSearchName(e.target.value)} />
            </div>
            <div className="relative">
                <Mail size={14} className="absolute left-3 top-3 text-gray-500"/>
                <input type="text" placeholder="Email..." className="w-full bg-[#0f172a] pl-9 p-2.5 rounded border border-gray-600 text-sm focus:border-blue-500 outline-none" value={searchEmail} onChange={e => setSearchEmail(e.target.value)} />
            </div>
            <div className="relative">
                <Smartphone size={14} className="absolute left-3 top-3 text-gray-500"/>
                <input type="text" placeholder="Phone/WhatsApp..." className="w-full bg-[#0f172a] pl-9 p-2.5 rounded border border-gray-600 text-sm focus:border-blue-500 outline-none" value={searchPhone} onChange={e => setSearchPhone(e.target.value)} />
            </div>
            <div className="relative">
                <Hash size={14} className="absolute left-3 top-3 text-gray-500"/>
                <input type="text" placeholder="Support ID..." className="w-full bg-[#0f172a] pl-9 p-2.5 rounded border border-gray-600 text-sm focus:border-blue-500 outline-none" value={searchUID} onChange={e => setSearchUID(e.target.value)} />
            </div>
            <div className="relative">
                <Globe size={14} className="absolute left-3 top-3 text-gray-500"/>
                <input type="text" placeholder="IP Address..." className="w-full bg-[#0f172a] pl-9 p-2.5 rounded border border-gray-600 text-sm focus:border-red-500 outline-none" value={searchIP} onChange={e => setSearchIP(e.target.value)} />
            </div>
        </div>
        <div className="text-right text-xs text-gray-500">
            Found: <span className="text-white font-bold">{filteredUsers.length}</span> users
        </div>
      </div>

      {/* --- USERS LIST --- */}
      <div className="space-y-3">
        {filteredUsers.length === 0 ? <p className="text-center text-gray-500 py-10">No users found.</p> :
         filteredUsers.map(user => {
            const userPendingReqs = pendingRequestsList.filter(r => r.user_id === user.id);
            const hasPending = userPendingReqs.length > 0;
            const totalPendingAmount = userPendingReqs.reduce((sum, req) => sum + Number(req.amount), 0);
            
            const ipList = user.ip_address ? user.ip_address.split(',').map(ip => ip.trim()) : [];
            const latestIp = ipList.length > 0 ? ipList[ipList.length - 1] : null;

            return (
                <div key={user.id} className={`bg-[#1e293b] p-4 rounded-xl border ${hasPending ? 'border-orange-500/50' : 'border-gray-700'} hover:border-blue-500/50 transition shadow-lg relative group`}>
                    
                    <div onClick={() => fetchUserDetails(user)} className="cursor-pointer">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="bg-gray-700 p-2.5 rounded-full text-gray-300 group-hover:bg-[#fbbf24] group-hover:text-black transition">
                                    <User size={20}/>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-white flex items-center flex-wrap gap-1 group-hover:text-[#fbbf24] transition">
                                        {user.full_name || 'No Name'}

                                        {/* SHOW ROLES */}
                                        {user.role === 'admin' && <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded ml-2 font-bold flex items-center gap-1"><ShieldAlert size={10}/> ADMIN</span>}
                                        {user.role === 'sub_admin' && <span className="text-[10px] bg-orange-500 text-black px-1.5 py-0.5 rounded font-bold ml-2">SUB-ADMIN</span>}
                                        {user.role === 'collab' && <span className="text-[10px] bg-purple-600 text-white px-1.5 py-0.5 rounded font-bold ml-2 flex items-center gap-1"><Star size={10}/> COLLAB</span>}
                                        
                                        {renderBanBadge(user.ban_type)}
                                    </h3>

                                    <div className="text-xs text-gray-400 flex flex-col gap-0.5 mt-1">
                                        <span className="flex items-center gap-2">
                                            ID: <span className="text-blue-400 font-mono">{user.support_id || getNumericId(user.id)}</span>
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                        <span className="text-[10px] bg-green-900/30 text-green-400 px-1.5 py-0.5 rounded border border-green-800">{user.phone || user.whatsapp || 'No Contact'}</span>
                                        {latestIp && (
                                            <span className="text-[10px] bg-blue-900/30 text-blue-400 px-1.5 py-0.5 rounded border border-blue-800 flex items-center gap-1">
                                                <Globe size={10}/> {latestIp}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="text-right">
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Balance</p>
                                <p className={`text-xl font-bold ${parseFloat(user.balance) < 0 ? 'text-red-400' : 'text-[#fbbf24]'}`}>
                                    ৳{parseFloat(user.balance || 0).toFixed(2)}
                                </p>
                                {hasPending && (
                                    <p className="text-[10px] bg-orange-500/20 border border-orange-500/50 text-orange-400 font-bold px-1.5 py-0.5 rounded mt-1 animate-pulse flex items-center gap-1 justify-end">
                                        <Clock size={10}/> Pend: ৳{totalPendingAmount}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-700/50">
                        <button 
                            onClick={() => { setSelectedUser(user); setAmount(user.balance); }} 
                            className={`bg-blue-600/10 text-blue-400 py-1.5 rounded text-[11px] font-bold hover:bg-blue-600 hover:text-white transition`}
                        >
                            Edit Balance
                        </button>
                        
                        <button 
                            onClick={() => { setBanModalUser(user); setBanType(user.ban_type || 'none'); }} 
                            className={`bg-red-900/10 text-red-400 border border-red-900/30 py-1.5 rounded text-[11px] font-bold hover:bg-red-600 hover:text-white transition flex justify-center items-center gap-1`}
                        >
                            <Ban size={12}/> Manage Bans
                        </button>

                        <button 
                              onClick={() => { setRoleModalUser(user); setSelectedRole(user.role || 'user'); }}
                              className={`py-1.5 rounded text-[11px] font-bold transition flex items-center justify-center gap-1 ${user.role !== 'user' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' : 'bg-gray-700 text-gray-400 hover:bg-purple-900/20'}`}
                        >
                            <ShieldAlert size={12}/> Manage Role
                        </button>
                    </div>
                </div>
            );
         })
        }
      </div>

      {/* --- FULL DETAILS MODAL --- */}
      {viewDetailsUser && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[70] p-4 backdrop-blur-md animate-in fade-in">
            <div className="bg-[#1e293b] w-full max-w-2xl h-[85vh] flex flex-col rounded-2xl border border-gray-600 shadow-2xl relative overflow-hidden">
                <div className="p-5 border-b border-gray-700 bg-[#0f172a] flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#fbbf24] p-2 rounded-full text-black"><User size={20}/></div>
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                {viewDetailsUser.full_name || 'User Details'}
                                {renderBanBadge(viewDetailsUser.ban_type)}
                            </h2>
                            <p className="text-[10px] text-gray-400 font-mono">UID: {viewDetailsUser.support_id || getNumericId(viewDetailsUser.id)}</p>
                        </div>
                    </div>
                    <button onClick={() => setViewDetailsUser(null)} className="text-gray-400 hover:text-white bg-gray-800 p-1.5 rounded-full transition"><X size={20}/></button>
                </div>

                <div className="flex bg-[#1e293b] border-b border-gray-700">
                    <button onClick={() => setActiveTab('info')} className={`flex-1 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'info' ? 'border-[#fbbf24] text-[#fbbf24] bg-[#fbbf24]/5' : 'border-transparent text-gray-400 hover:text-white'}`}>Overview</button>
                    <button onClick={() => setActiveTab('wallet')} className={`flex-1 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'wallet' ? 'border-[#fbbf24] text-[#fbbf24] bg-[#fbbf24]/5' : 'border-transparent text-gray-400 hover:text-white'}`}>Transaction Logs</button>
                    <button onClick={() => setActiveTab('security')} className={`flex-1 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'security' ? 'border-[#fbbf24] text-[#fbbf24] bg-[#fbbf24]/5' : 'border-transparent text-gray-400 hover:text-white'}`}>Security History</button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 bg-[#0f172a]/30">
                    {detailsLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <RefreshCcw className="animate-spin text-[#fbbf24]" size={32}/>
                            <p className="text-gray-400 text-sm animate-pulse">Fetching records...</p>
                        </div>
                    ) : (
                        <>
                            {/* TAB: INFO */}
                            {activeTab === 'info' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-700 text-center shadow-inner">
                                            <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Spent</p>
                                            <p className="text-xl font-black text-red-400">৳{userDetails.stats.totalSpent?.toFixed(0) || 0}</p>
                                        </div>
                                        <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-700 text-center shadow-inner">
                                            <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Deposit</p>
                                            <p className="text-xl font-black text-green-400">৳{userDetails.stats.totalDeposit?.toFixed(0) || 0}</p>
                                        </div>
                                        <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-700 text-center shadow-inner">
                                            <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Orders</p>
                                            <p className="text-xl font-black text-blue-400">{userDetails.stats.orderCount || 0}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-[#1e293b]/50 p-4 rounded-xl border border-gray-700 flex items-center gap-4">
                                            <Mail className="text-gray-500" size={20}/>
                                            <div><p className="text-[10px] text-gray-500 uppercase font-bold">Email Address</p><p className="text-sm text-gray-200 break-all">{viewDetailsUser.email || 'N/A'}</p></div>
                                        </div>
                                        <div className="bg-[#1e293b]/50 p-4 rounded-xl border border-gray-700 flex items-center gap-4">
                                            <Phone className="text-green-500" size={20}/>
                                            <div><p className="text-[10px] text-gray-500 uppercase font-bold">Phone / WhatsApp</p><p className="text-sm text-green-400 font-bold">{viewDetailsUser.phone || viewDetailsUser.whatsapp || 'N/A'}</p></div>
                                        </div>
                                        <div className="bg-[#1e293b]/50 p-4 rounded-xl border border-gray-700 flex items-center gap-4">
                                            <MapPin className="text-gray-500" size={20}/>
                                            <div><p className="text-[10px] text-gray-500 uppercase font-bold">Location</p><p className="text-sm text-gray-200">{viewDetailsUser.district || 'N/A'}, {viewDetailsUser.division || 'N/A'}</p></div>
                                        </div>
                                        <div className="bg-[#1e293b]/50 p-4 rounded-xl border border-gray-700 flex items-center gap-4">
                                            <Clock className="text-gray-500" size={20}/>
                                            <div><p className="text-[10px] text-gray-500 uppercase font-bold">Joined Date</p><p className="text-sm text-gray-200">{formatDate(viewDetailsUser.created_at)}</p></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: WALLET */}
                            {activeTab === 'wallet' && (
                                <div className="space-y-3 pb-5">
                                    {(!userDetails?.transactions || userDetails.transactions.length === 0) ? <p className="text-center text-gray-500 py-10 italic">No transaction history found.</p> : 
                                        userDetails.transactions.map((tx, idx) => (
                                            <div key={idx} className={`p-4 rounded-xl flex justify-between items-center border border-gray-700/50 shadow-sm transition ${tx.txType === 'Deposit' ? 'bg-green-900/5 border-green-900/20' : 'bg-red-900/5 border-red-900/20'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-full border border-gray-700 ${tx.txType === 'Deposit' ? 'text-green-500' : 'text-red-500'}`}>
                                                        {tx.txType === 'Deposit' ? <ArrowDownLeft size={18}/> : <ShoppingCart size={18}/>}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-gray-200">{tx.txType === 'Deposit' ? `Added Money (${tx.method})` : `Bought: ${tx.package_name}`}</p>
                                                        <p className="text-[10px] text-gray-500 font-medium">{formatDate(tx.date)}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-black text-base ${tx.txType === 'Deposit' ? 'text-green-500' : 'text-red-500'}`}>{tx.txType === 'Deposit' ? '+' : '-'}৳{tx.amount}</p>
                                                    <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full mt-1 inline-block border ${(tx.status === 'completed' || tx.status === 'approved' || tx.status === 'Completed') ? 'text-green-500 border-green-500/30 bg-green-500/10' : tx.status === 'pending' ? 'text-orange-500 border-orange-500/30 bg-orange-500/10' : 'text-red-500 border-red-500/30 bg-red-500/10'}`}>{tx.status}</span>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            )}

                            {/* TAB: SECURITY */}
                            {activeTab === 'security' && (
                                <div className="space-y-6">
                                    <div className="bg-blue-900/10 p-5 rounded-xl border border-blue-800/30">
                                        <h4 className="text-blue-400 font-bold text-xs mb-3 flex items-center gap-2 uppercase tracking-widest"><Globe size={14}/> IP History Logs</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {viewDetailsUser.ip_address ? viewDetailsUser.ip_address.split(',').map((ip, i) => (
                                                <span key={i} className="text-blue-200 font-mono font-bold bg-blue-900/30 px-2.5 py-1 rounded text-[11px] border border-blue-700/30">{ip.trim()}</span>
                                            )) : <p className="text-gray-500 text-xs italic">No IP address recorded for this user.</p>}
                                        </div>
                                    </div>

                                    <div className="bg-purple-900/10 p-5 rounded-xl border border-purple-800/30">
                                        <h4 className="text-purple-400 font-bold text-xs mb-4 flex items-center gap-2 uppercase tracking-widest"><Clock size={14}/> Phone Change History</h4>
                                        <div className="space-y-3">
                                            {(!userDetails?.whatsappLogs || userDetails.whatsappLogs.length === 0) ? <p className="text-gray-500 text-xs italic">No changes recorded.</p> : 
                                                userDetails.whatsappLogs.map((log) => (
                                                    <div key={log.id} className="bg-[#0f172a] p-3 rounded-lg border border-gray-700 flex justify-between items-center text-xs">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-red-400 line-through">{log.old_number || 'N/A'}</span>
                                                            <span className="text-gray-500">➔</span>
                                                            <span className="text-green-400 font-bold">{log.new_number}</span>
                                                        </div>
                                                        <span className="text-gray-500 font-mono text-[10px]">{formatDate(log.changed_at)}</span>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* --- EDIT BALANCE MODAL --- */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 animate-in zoom-in duration-200">
            <div className="bg-[#1e293b] w-full max-w-sm rounded-2xl p-6 border border-gray-600 shadow-2xl">
                <h3 className="text-lg font-bold mb-1 text-white">Manual Balance Adjustment</h3>
                <p className="text-xs text-gray-400 mb-5">Updating balance for <span className="text-[#fbbf24] font-bold">{selectedUser.full_name}</span></p>
                <form onSubmit={handleUpdateBalance} className="space-y-4">
                    <div>
                        <label className="text-[10px] text-gray-500 uppercase font-black ml-1">Set New Amount (৳)</label>
                        <input type="number" required className="w-full bg-[#0f172a] p-3 rounded-xl border border-gray-600 mt-1 font-black text-xl text-[#fbbf24] focus:border-blue-500 outline-none" value={amount} onChange={e => setAmount(e.target.value)} />
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={() => setSelectedUser(null)} className="flex-1 bg-gray-700 py-3 rounded-xl font-bold text-sm">Cancel</button>
                        <button type="submit" className="flex-1 bg-blue-600 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-900/20">Update Now</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* --- BAN MODAL --- */}
      {banModalUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 animate-in zoom-in duration-200">
            <div className="bg-[#1e293b] w-full max-w-sm rounded-2xl p-6 border border-red-500/50 shadow-2xl">
                <h3 className="text-xl font-black text-red-500 mb-2 flex items-center gap-2 uppercase italic"><Ban size={24}/> Restriction</h3>
                <p className="text-xs text-gray-400 mb-6">Change access level for <span className="text-[#fbbf24] font-bold">{banModalUser.full_name}</span></p>
                
                <select className="w-full bg-[#0f172a] p-3.5 rounded-xl border border-gray-600 mb-6 outline-none font-bold text-sm" onChange={e => setBanType(e.target.value)} value={banType}>
                    <option value="none">No Ban (Active)</option>
                    <option value="deposit_ban">Deposit Ban</option>
                    <option value="withdraw_ban">Withdraw Ban</option>
                    <option value="full_ban">Full Account/IP Ban</option>
                </select>

                <div className="flex gap-3">
                    <button onClick={() => setBanModalUser(null)} className="flex-1 bg-gray-700 py-3 rounded-xl font-bold">Close</button>
                    <button onClick={handleBan} className="flex-1 bg-red-600 py-3 rounded-xl font-bold shadow-lg shadow-red-900/20">Apply Ban</button>
                </div>
            </div>
        </div>
      )}

      {/* --- ROLE MANAGEMENT MODAL --- */}
      {roleModalUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 animate-in zoom-in duration-200">
            <div className="bg-[#1e293b] w-full max-w-sm rounded-2xl border border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.2)] p-6 relative">
                <button onClick={() => setRoleModalUser(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20}/></button>
                
                <h3 className="text-xl font-bold text-purple-400 mb-2 flex items-center gap-2"><ShieldAlert size={24}/> Manage Role</h3>
                <p className="text-sm text-gray-300 mb-6">Select account role for <span className="font-bold text-white">{roleModalUser.full_name}</span></p>
                
                <div className="space-y-3 mb-6">
                    <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${selectedRole === 'user' ? 'bg-blue-900/30 border-blue-500' : 'bg-[#0f172a] border-gray-700'}`}>
                        <input type="radio" name="userRole" value="user" checked={selectedRole === 'user'} onChange={(e) => setSelectedRole(e.target.value)} className="mt-1 accent-blue-500"/>
                        <div><p className="font-bold text-blue-400 text-sm">Normal User</p></div>
                    </label>

                    <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${selectedRole === 'sub_admin' ? 'bg-orange-900/30 border-orange-500' : 'bg-[#0f172a] border-gray-700'}`}>
                        <input type="radio" name="userRole" value="sub_admin" checked={selectedRole === 'sub_admin'} onChange={(e) => setSelectedRole(e.target.value)} className="mt-1 accent-orange-500"/>
                        <div><p className="font-bold text-orange-400 text-sm">Sub Admin</p></div>
                    </label>

                    <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${selectedRole === 'admin' ? 'bg-red-900/30 border-red-500' : 'bg-[#0f172a] border-gray-700'}`}>
                        <input type="radio" name="userRole" value="admin" checked={selectedRole === 'admin'} onChange={(e) => setSelectedRole(e.target.value)} className="mt-1 accent-red-500"/>
                        <div><p className="font-bold text-red-500 text-sm">Super Admin</p></div>
                    </label>
                </div>

                <button onClick={handleRoleUpdate} className="w-full bg-purple-600 text-white font-bold py-3.5 rounded-xl hover:bg-purple-700 transition shadow-lg">
                    Save User Role
                </button>
            </div>
        </div>
      )}

      {/* --- IP SCANNER MODAL --- */}
      {showIpScanner && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4 backdrop-blur-md">
            <div className="bg-[#1e293b] w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl border border-gray-600 p-6 flex flex-col">
                <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                    <h2 className="text-xl font-bold text-red-500 flex items-center gap-2"><Radar className="animate-pulse"/> Security Scan: Duplicate IPs</h2>
                    <button onClick={() => setShowIpScanner(false)} className="text-gray-400 hover:text-white bg-gray-800 p-1 rounded-full"><X/></button>
                </div>
                <div className="flex-1 space-y-4">
                    {duplicateIps.length === 0 ? (
                        <div className="text-center py-10 opacity-50">
                            <CheckCircle size={48} className="mx-auto text-green-500 mb-2"/>
                            <p>No multi-account violations found.</p>
                        </div>
                    ) : duplicateIps.map(group => (
                        <div key={group.ip} className="mb-4 bg-[#0f172a] border border-red-900/30 p-4 rounded-xl">
                            <p className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2 border-b border-red-900/20 pb-2"><Globe size={14}/> IP Address: {group.ip}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {group.users.map(u => (
                                    <div key={u.id} className="text-xs flex justify-between bg-gray-800/50 p-2.5 rounded-lg border border-gray-700">
                                        <span className="font-bold">{u.full_name}</span>
                                        <span className="text-gray-500 font-mono">{u.id.slice(0,8)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;