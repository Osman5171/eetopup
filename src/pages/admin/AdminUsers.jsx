import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { 
    Search, User, Users, Ban, CheckCircle, XCircle, 
    Globe, ShieldAlert, Clock, RefreshCcw, Radar, X,
    ShoppingCart, ArrowDownLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminUsers = () => {
  const navigate = useNavigate();
  
  // --- STATES ---
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [search, setSearch] = useState({ name: '', phone: '', uid: '', ip: '' });
  const [sortBy, setSortBy] = useState('newest'); 
  const [showIpScanner, setShowIpScanner] = useState(false);

  // Modal States
  const [selectedUser, setSelectedUser] = useState(null); 
  const [viewDetailsUser, setViewDetailsUser] = useState(null); 
  const [userDetails, setUserDetails] = useState({ transactions: [], stats: {}, whatsappLogs: [] });
  const [activeTab, setActiveTab] = useState('info'); 
  const [banModalUser, setBanModalUser] = useState(null);
  const [banType, setBanType] = useState('none');
  const [amount, setAmount] = useState('');

  // --- ROLE MODAL STATES ---
  const [roleModalUser, setRoleModalUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('user');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setUsers(data);
    if (error) console.error("Error fetching users:", error.message);
    setLoading(false);
  };

  // --- FETCH USER DETAILS (Spent, Deposit, Orders, WhatsApp Logs) ---
  const fetchUserDetails = async (user) => {
    setViewDetailsUser(user);
    setDetailsLoading(true);
    try {
      const [orders, deposits, whatsappLogs] = await Promise.all([
        supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('deposits').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('whatsapp_change_logs').select('*').eq('user_id', user.id).order('changed_at', { ascending: false })
      ]);

      const stats = {
        totalSpent: orders.data?.reduce((sum, o) => sum + (o.status === 'completed' ? Number(o.amount) : 0), 0) || 0,
        totalDeposit: deposits.data?.reduce((sum, d) => sum + (d.status === 'approved' ? Number(d.amount) : 0), 0) || 0,
        orderCount: orders.data?.length || 0
      };

      const combinedTransactions = [
          ...(orders.data || []).map(o => ({ ...o, txType: 'Order' })),
          ...(deposits.data || []).map(d => ({ ...d, txType: 'Deposit' }))
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setUserDetails({ transactions: combinedTransactions, stats, whatsappLogs: whatsappLogs.data || [] });
    } catch (err) {
      console.error("Details Fetch Error:", err);
    } finally {
      setDetailsLoading(false);
      setActiveTab('info');
    }
  };

  // --- IP SCANNER LOGIC ---
  const duplicateIps = useMemo(() => {
    const ipMap = {};
    users.forEach(user => {
      if (user.ip_address) {
        const ips = user.ip_address.split(',').map(i => i.trim());
        ips.forEach(ip => {
          if (!ipMap[ip]) ipMap[ip] = [];
          if (!ipMap[ip].find(u => u.id === user.id)) ipMap[ip].push(user);
        });
      }
    });
    return Object.keys(ipMap).filter(ip => ipMap[ip].length > 1).map(ip => ({ ip, users: ipMap[ip] }));
  }, [users]);

  // --- FILTERING & SORTING ---
  const filteredUsers = useMemo(() => {
    let temp = [...users];
    if (search.name) temp = temp.filter(u => (u.full_name || '').toLowerCase().includes(search.name.toLowerCase()));
    if (search.phone) temp = temp.filter(u => (u.phone || u.whatsapp || '').includes(search.phone));
    if (search.uid) temp = temp.filter(u => u.id.includes(search.uid));
    if (search.ip) temp = temp.filter(u => (u.ip_address || '').includes(search.ip));

    if (sortBy === 'bal_high') temp.sort((a, b) => (b.balance || 0) - (a.balance || 0));
    if (sortBy === 'bal_low') temp.sort((a, b) => (a.balance || 0) - (b.balance || 0));
    return temp;
  }, [users, search, sortBy]);

  const handleUpdateBalance = async () => {
    const { error } = await supabase.from('profiles').update({ balance: parseFloat(amount) }).eq('id', selectedUser.id);
    if (!error) {
      alert("Balance Updated! ✅");
      setSelectedUser(null);
      fetchUsers();
    }
  };

  const handleBan = async () => {
    const { error } = await supabase.from('profiles').update({ ban_type: banType }).eq('id', banModalUser.id);
    if (!error) {
      alert(`User restricted to: ${banType} 🛑`);
      setBanModalUser(null);
      fetchUsers();
    }
  };

  const handleRoleUpdate = async () => {
    const { error } = await supabase.from('profiles').update({ role: selectedRole }).eq('id', roleModalUser.id);
    if (!error) {
        alert("Role Updated Successfully! ✅");
        setRoleModalUser(null);
        fetchUsers();
    } else {
        alert("Error updating role: " + error.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const renderBanBadge = (type) => {
    if(!type || type === 'none') return null;
    return <span className={`text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded font-black tracking-wider ml-2`}>{type.toUpperCase()}</span>;
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 pb-20">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#fbbf24] flex items-center gap-2">
            <Users size={24} /> User Management
        </h1>
        <button onClick={() => setShowIpScanner(true)} className="bg-red-900/30 text-red-500 border border-red-900/50 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-red-600 hover:text-white transition">
            <Radar size={16} className="animate-pulse"/> IP Scanner
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-700 mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input type="text" placeholder="Search Name..." className="bg-[#0f172a] p-2 rounded border border-gray-600 text-sm outline-none focus:border-[#fbbf24]" onChange={e => setSearch({...search, name: e.target.value})} />
        <input type="text" placeholder="Phone..." className="bg-[#0f172a] p-2 rounded border border-gray-600 text-sm outline-none focus:border-[#fbbf24]" onChange={e => setSearch({...search, phone: e.target.value})} />
        <select className="bg-[#0f172a] p-2 rounded border border-gray-600 text-sm outline-none cursor-pointer" onChange={e => setSortBy(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="bal_high">Balance: High to Low</option>
            <option value="bal_low">Balance: Low to High</option>
        </select>
        <div className="text-right text-xs text-gray-500 self-center font-bold">Total Users: {filteredUsers.length}</div>
      </div>

      {/* User Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
             <div className="col-span-full flex justify-center py-10"><RefreshCcw className="animate-spin text-[#fbbf24]"/></div>
        ) : filteredUsers.length === 0 ? (
            <p className="col-span-full text-center text-gray-500">No users found.</p>
        ) : (
            filteredUsers.map(user => (
            <div key={user.id} className="bg-[#1e293b] p-4 rounded-xl border border-gray-700 hover:border-[#fbbf24]/50 transition shadow-lg group">
                <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => fetchUserDetails(user)}>
                    <div className="bg-gray-700 p-2.5 rounded-full text-gray-300 group-hover:bg-[#fbbf24] group-hover:text-black transition">
                        <User size={24}/>
                    </div>
                    <div>
                        <h3 className="font-bold text-white group-hover:text-[#fbbf24] transition flex items-center flex-wrap gap-1">
                            {user.full_name || 'No Name'}
                            {user.role === 'admin' && <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded ml-1 font-bold">ADMIN</span>}
                            {renderBanBadge(user.ban_type)}
                        </h3>
                        <p className="text-xs text-gray-400">{user.phone || user.whatsapp || 'No Contact'}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Balance</p>
                    <p className="text-lg font-black text-[#fbbf24]">৳{user.balance || 0}</p>
                </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 border-t border-gray-700 pt-3">
                    <button onClick={() => { setSelectedUser(user); setAmount(user.balance); }} className="bg-blue-600/10 text-blue-400 py-1.5 rounded text-[11px] font-bold hover:bg-blue-600 hover:text-white transition">Edit Balance</button>
                    <button onClick={() => { setBanModalUser(user); setBanType(user.ban_type || 'none'); }} className="bg-red-900/10 text-red-400 py-1.5 rounded text-[11px] font-bold hover:bg-red-600 hover:text-white transition flex justify-center items-center gap-1"><Ban size={12}/> Manage Ban</button>
                    <button onClick={() => { setRoleModalUser(user); setSelectedRole(user.role || 'user'); }} className="bg-purple-500/10 text-purple-400 py-1.5 rounded text-[11px] font-bold hover:bg-purple-600 hover:text-white transition flex justify-center items-center gap-1"><ShieldAlert size={12}/> Role</button>
                </div>
            </div>
            ))
        }
      </div>

      {/* --- FULL DETAILS MODAL --- */}
      {viewDetailsUser && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[70] p-4 backdrop-blur-md animate-in fade-in">
            <div className="bg-[#1e293b] w-full max-w-2xl h-[85vh] flex flex-col rounded-2xl border border-gray-600 shadow-2xl relative overflow-hidden">
                
                <div className="p-5 border-b border-gray-700 bg-[#0f172a] flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#fbbf24] p-2 rounded-full text-black">
                            <User size={20}/>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                {viewDetailsUser.full_name || 'User Details'}
                                {renderBanBadge(viewDetailsUser.ban_type)}
                            </h2>
                            <p className="text-[10px] text-gray-400 font-mono">UID: {viewDetailsUser.id}</p>
                        </div>
                    </div>
                    <button onClick={() => setViewDetailsUser(null)} className="text-gray-400 hover:text-white bg-gray-800 p-1.5 rounded-full transition"><X size={20}/></button>
                </div>

                <div className="flex bg-[#1e293b] border-b border-gray-700">
                    <button onClick={() => setActiveTab('info')} className={`flex-1 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'info' ? 'border-[#fbbf24] text-[#fbbf24] bg-[#fbbf24]/5' : 'border-transparent text-gray-400 hover:text-white'}`}>Overview</button>
                    <button onClick={() => setActiveTab('wallet')} className={`flex-1 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'wallet' ? 'border-[#fbbf24] text-[#fbbf24] bg-[#fbbf24]/5' : 'border-transparent text-gray-400 hover:text-white'}`}>Transaction Logs</button>
                    <button onClick={() => setActiveTab('security')} className={`flex-1 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'security' ? 'border-[#fbbf24] text-[#fbbf24] bg-[#fbbf24]/5' : 'border-transparent text-gray-400 hover:text-white'}`}>Security & History</button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 bg-[#0f172a]/30">
                    {detailsLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <RefreshCcw className="animate-spin text-[#fbbf24]" size={32}/>
                            <p className="text-gray-400 text-sm animate-pulse">Fetching user records...</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'info' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-700 text-center shadow-inner">
                                            <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Spent</p>
                                            <p className="text-xl font-black text-red-400">৳{userDetails.stats.totalSpent?.toFixed(0)}</p>
                                        </div>
                                        <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-700 text-center shadow-inner">
                                            <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Deposit</p>
                                            <p className="text-xl font-black text-green-400">৳{userDetails.stats.totalDeposit?.toFixed(0)}</p>
                                        </div>
                                        <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-700 text-center shadow-inner">
                                            <p className="text-[10px] text-gray-400 uppercase font-black mb-1">Orders</p>
                                            <p className="text-xl font-black text-blue-400">{userDetails.stats.orderCount}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-[#1e293b]/50 p-4 rounded-xl border border-gray-700">
                                            <p className="text-[10px] text-gray-500 uppercase font-bold">Email Address</p>
                                            <p className="text-sm text-gray-200 break-all">{viewDetailsUser.email || 'N/A'}</p>
                                        </div>
                                        <div className="bg-[#1e293b]/50 p-4 rounded-xl border border-gray-700">
                                            <p className="text-[10px] text-gray-500 uppercase font-bold">Phone Number</p>
                                            <p className="text-sm text-green-400 font-bold">{viewDetailsUser.phone || 'N/A'}</p>
                                        </div>
                                        <div className="bg-[#1e293b]/50 p-4 rounded-xl border border-gray-700">
                                            <p className="text-[10px] text-gray-500 uppercase font-bold">Location</p>
                                            <p className="text-sm text-gray-200">{viewDetailsUser.district || 'N/A'}, {viewDetailsUser.division || 'N/A'}</p>
                                        </div>
                                        <div className="bg-[#1e293b]/50 p-4 rounded-xl border border-gray-700">
                                            <p className="text-[10px] text-gray-500 uppercase font-bold">Joined Date</p>
                                            <p className="text-sm text-gray-200">{formatDate(viewDetailsUser.created_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'wallet' && (
                                <div className="space-y-3 pb-5">
                                    {userDetails.transactions.length === 0 ? (
                                        <p className="text-center text-gray-500 py-10 italic">No transaction history found.</p>
                                    ) : (
                                        userDetails.transactions.map((tx, idx) => (
                                            <div key={idx} className={`p-4 rounded-xl flex justify-between items-center border border-gray-700/50 shadow-sm transition ${tx.txType === 'Deposit' ? 'bg-green-900/5 border-green-900/20' : 'bg-red-900/5 border-red-900/20'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-full border border-gray-700 ${tx.txType === 'Deposit' ? 'text-green-500' : 'text-red-500'}`}>
                                                        {tx.txType === 'Deposit' ? <ArrowDownLeft size={18}/> : <ShoppingCart size={18}/>}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-gray-200">
                                                            {tx.txType === 'Deposit' ? `Added Money (${tx.method})` : `Bought: ${tx.package_name}`}
                                                        </p>
                                                        <p className="text-[10px] text-gray-500 font-medium">{formatDate(tx.created_at)}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-black text-base ${tx.txType === 'Deposit' ? 'text-green-500' : 'text-red-500'}`}>
                                                        {tx.txType === 'Deposit' ? '+' : '-'}৳{tx.amount}
                                                    </p>
                                                    <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full mt-1 inline-block border ${
                                                        (tx.status === 'completed' || tx.status === 'approved') ? 'text-green-500 border-green-500/30 bg-green-500/10' : 
                                                        tx.status === 'pending' ? 'text-orange-500 border-orange-500/30 bg-orange-500/10' : 'text-red-500 border-red-500/30 bg-red-500/10'
                                                    }`}>{tx.status}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-6">
                                    <div className="bg-blue-900/10 p-5 rounded-xl border border-blue-800/30">
                                        <h4 className="text-blue-400 font-bold text-xs mb-3 flex items-center gap-2 uppercase tracking-widest"><Globe size={14}/> IP History Logs</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {viewDetailsUser.ip_address ? viewDetailsUser.ip_address.split(',').map((ip, i) => (
                                                <span key={i} className="text-blue-200 font-mono font-bold bg-blue-900/30 px-2.5 py-1 rounded text-[11px] border border-blue-700/30">
                                                    {ip.trim()}
                                                </span>
                                            )) : <p className="text-gray-500 text-xs italic">No IP address recorded for this user.</p>}
                                        </div>
                                    </div>

                                    <div className="bg-purple-900/10 p-5 rounded-xl border border-purple-800/30">
                                        <h4 className="text-purple-400 font-bold text-xs mb-4 flex items-center gap-2 uppercase tracking-widest"><Clock size={14}/> WhatsApp Change History</h4>
                                        <div className="space-y-3">
                                            {userDetails.whatsappLogs.length === 0 ? (
                                                <p className="text-gray-500 text-xs italic">No changes recorded.</p>
                                            ) : (
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
                                            )}
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

      {/* --- EDIT BALANCE MODAL --- */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 animate-in zoom-in duration-200">
            <div className="bg-[#1e293b] w-full max-w-sm rounded-2xl p-6 border border-gray-600 shadow-2xl">
                <h3 className="text-lg font-bold mb-1 text-white">Manual Balance Adjustment</h3>
                <p className="text-xs text-gray-400 mb-5">Updating balance for <span className="text-[#fbbf24] font-bold">{selectedUser.full_name}</span></p>
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] text-gray-500 uppercase font-black ml-1">Set New Amount (৳)</label>
                        <input type="number" className="w-full bg-[#0f172a] p-3 rounded-xl border border-gray-600 mt-1 font-black text-xl text-[#fbbf24] focus:border-blue-500 outline-none" value={amount} onChange={e => setAmount(e.target.value)} />
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setSelectedUser(null)} className="flex-1 bg-gray-700 py-3 rounded-xl font-bold text-sm">Cancel</button>
                        <button onClick={handleUpdateBalance} className="flex-1 bg-blue-600 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-900/20">Update Now</button>
                    </div>
                </div>
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

    </div>
  );
};

export default AdminUsers;