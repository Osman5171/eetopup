import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { 
    Search, User, Ban, CheckCircle, XCircle, 
    Globe, ShieldAlert, Clock, RefreshCcw, Radar, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminUsers = () => {
  const navigate = useNavigate();
  
  // --- STATES ---
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({ name: '', phone: '', uid: '', ip: '' });
  const [sortBy, setSortBy] = useState('newest'); 
  const [showIpScanner, setShowIpScanner] = useState(false);

  // Modal States
  const [selectedUser, setSelectedUser] = useState(null); 
  const [viewDetailsUser, setViewDetailsUser] = useState(null); 
  const [userDetails, setUserDetails] = useState({ transactions: [], stats: {} });
  const [activeTab, setActiveTab] = useState('info'); 
  const [banModalUser, setBanModalUser] = useState(null);
  const [banType, setBanType] = useState('none');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setUsers(data);
    setLoading(false);
  };

  // --- IP SCANNER LOGIC (Find duplicate IPs) ---
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
    if (search.name) temp = temp.filter(u => u.full_name?.toLowerCase().includes(search.name.toLowerCase()));
    if (search.phone) temp = temp.filter(u => u.phone?.includes(search.phone));
    if (search.uid) temp = temp.filter(u => u.id.includes(search.uid));
    if (search.ip) temp = temp.filter(u => u.ip_address?.includes(search.ip));

    if (sortBy === 'bal_high') temp.sort((a, b) => b.balance - a.balance);
    if (sortBy === 'bal_low') temp.sort((a, b) => a.balance - b.balance);
    return temp;
  }, [users, search, sortBy]);

  // --- FETCH USER DETAILS (Orders & Deposits) ---
  const fetchUserDetails = async (user) => {
    setViewDetailsUser(user);
    const [orders, deposits] = await Promise.all([
      supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('deposits').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    ]);

    const stats = {
      totalSpent: orders.data?.reduce((sum, o) => sum + (o.status === 'completed' ? o.amount : 0), 0) || 0,
      totalDeposit: deposits.data?.reduce((sum, d) => sum + (d.status === 'approved' ? d.amount : 0), 0) || 0,
      orderCount: orders.data?.length || 0
    };

    const combinedTransactions = [
        ...(orders.data || []).map(o => ({ ...o, txType: 'Order' })),
        ...(deposits.data || []).map(d => ({ ...d, txType: 'Deposit' }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    setUserDetails({ transactions: combinedTransactions, stats });
    setActiveTab('info');
  };

  // --- UPDATE BALANCE ---
  const handleUpdateBalance = async () => {
    const { error } = await supabase.from('profiles').update({ balance: parseFloat(amount) }).eq('id', selectedUser.id);
    if (!error) {
      alert("Balance Updated! ✅");
      setSelectedUser(null);
      fetchUsers();
    } else {
        alert("Error updating balance: " + error.message);
    }
  };

  // --- BAN LOGIC ---
  const handleBan = async () => {
    const { error } = await supabase.from('profiles').update({ ban_type: banType }).eq('id', banModalUser.id);
    if (!error) {
      alert(`User restricted to: ${banType} 🛑`);
      setBanModalUser(null);
      fetchUsers();
    } else {
        alert("Error updating ban status: " + error.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try { 
        return new Date(dateString).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }); 
    } catch (e) { return 'Invalid Date'; }
  };

  const renderBanBadge = (type) => {
    if(!type || type === 'none') return null;
    const config = {
        'deposit_ban': { text: 'DEPOSIT BAN', classes: 'bg-yellow-600 text-black' },
        'withdraw_ban': { text: 'WITHDRAW BAN', classes: 'bg-purple-600 text-white' },
        'full_ban': { text: 'FULL BAN', classes: 'bg-red-600 text-white animate-pulse shadow-[0_0_10px_red]' }
    };
    const badge = config[type] || { text: 'BANNED', classes: 'bg-red-600 text-white' };
    return <span className={`text-[9px] ${badge.classes} px-1.5 py-0.5 rounded font-black tracking-wider ml-2`}>{badge.text}</span>;
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 pb-20">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#fbbf24] flex items-center gap-2">
            <Users /> User Control
        </h1>
        <button onClick={() => setShowIpScanner(true)} className="bg-red-900/30 text-red-500 border border-red-900/50 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-red-600 hover:text-white transition">
            <Radar size={16} className="animate-pulse"/> IP Scanner
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-700 mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input type="text" placeholder="Search Name..." className="bg-[#0f172a] p-2 rounded border border-gray-600 text-sm outline-none" onChange={e => setSearch({...search, name: e.target.value})} />
        <input type="text" placeholder="Phone..." className="bg-[#0f172a] p-2 rounded border border-gray-600 text-sm outline-none" onChange={e => setSearch({...search, phone: e.target.value})} />
        <select className="bg-[#0f172a] p-2 rounded border border-gray-600 text-sm outline-none" onChange={e => setSortBy(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="bal_high">Balance: High to Low</option>
            <option value="bal_low">Balance: Low to High</option>
        </select>
        <div className="text-right text-xs text-gray-500 self-center">Total: {filteredUsers.length}</div>
      </div>

      {/* User Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
             <div className="col-span-full flex justify-center py-10"><RefreshCcw className="animate-spin text-[#fbbf24]"/></div>
        ) : filteredUsers.length === 0 ? (
            <p className="col-span-full text-center text-gray-500">No users found.</p>
        ) : (
            filteredUsers.map(user => (
            <div key={user.id} className="bg-[#1e293b] p-4 rounded-xl border border-gray-700 hover:border-blue-500 transition shadow-lg">
                <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-gray-700 p-2 rounded-full"><User size={20}/></div>
                    <div>
                        <h3 className="font-bold text-white cursor-pointer hover:text-blue-400 flex items-center flex-wrap" onClick={() => fetchUserDetails(user)}>
                            {user.full_name || 'No Name'}
                            {renderBanBadge(user.ban_type)}
                        </h3>
                        <p className="text-xs text-gray-400">{user.phone || 'No Phone'}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Balance</p>
                    <p className="text-lg font-black text-[#fbbf24]">৳{user.balance}</p>
                </div>
                </div>
                
                <div className="flex gap-2 border-t border-gray-700 pt-3">
                <button onClick={() => { setSelectedUser(user); setAmount(user.balance); }} className="flex-1 bg-blue-600/10 text-blue-400 py-1.5 rounded text-xs font-bold hover:bg-blue-600 hover:text-white transition">Edit Balance</button>
                <button onClick={() => { setBanModalUser(user); setBanType(user.ban_type || 'none'); }} className="flex-1 bg-red-900/10 text-red-400 py-1.5 rounded text-xs font-bold hover:bg-red-600 hover:text-white transition">Manage Ban</button>
                </div>
            </div>
            ))
        )}
      </div>

      {/* --- FULL DETAILS MODAL --- */}
      {viewDetailsUser && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[70] p-4 backdrop-blur-md animate-in fade-in">
            <div className="bg-[#1e293b] w-full max-w-2xl h-[85vh] flex flex-col rounded-2xl border border-gray-600 shadow-2xl relative overflow-hidden">
                <div className="p-5 border-b border-gray-700 bg-[#0f172a] flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <User className="text-blue-500"/> {viewDetailsUser.full_name || 'Unknown'}
                            {renderBanBadge(viewDetailsUser.ban_type)}
                        </h2>
                        <div className="flex gap-3 text-xs text-gray-400 mt-1">
                             <p>ID: <span className="text-yellow-400 font-mono font-bold">{viewDetailsUser.id.slice(0,8)}</span></p>
                        </div>
                    </div>
                    <button onClick={() => setViewDetailsUser(null)} className="bg-gray-800 p-2 rounded-full hover:bg-red-600 hover:text-white transition"><X size={20}/></button>
                </div>

                <div className="flex bg-[#1e293b] border-b border-gray-700">
                    <button onClick={() => setActiveTab('info')} className={`flex-1 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'info' ? 'border-blue-500 text-blue-400 bg-blue-900/10' : 'border-transparent text-gray-400 hover:text-white'}`}>User Info</button>
                    <button onClick={() => setActiveTab('wallet')} className={`flex-1 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'wallet' ? 'border-green-500 text-green-400 bg-green-900/10' : 'border-transparent text-gray-400 hover:text-white'}`}>Transaction History</button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 bg-[#0f172a]/50">
                    {activeTab === 'info' && (
                        <div className="space-y-5">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <div className="bg-[#1e293b] p-3 rounded-lg border border-gray-700 text-center">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Total Spent</p>
                                    <p className="text-red-400 font-black text-lg">৳{userDetails.stats.totalSpent?.toFixed(2) || '0.00'}</p>
                                </div>
                                <div className="bg-[#1e293b] p-3 rounded-lg border border-gray-700 text-center">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Total Deposits</p>
                                    <p className="text-green-400 font-black text-lg">৳{userDetails.stats.totalDeposit?.toFixed(2) || '0.00'}</p>
                                </div>
                                <div className="bg-[#1e293b] p-3 rounded-lg border border-gray-700 text-center">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Orders Placed</p>
                                    <p className="text-blue-400 font-black text-lg">{userDetails.stats.orderCount || 0}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#1e293b] p-3 rounded-lg border border-gray-700">
                                    <p className="text-[10px] text-gray-400 uppercase">Email</p>
                                    <p className="text-white font-bold text-sm break-all">{viewDetailsUser.email || 'N/A'}</p>
                                </div>
                                <div className="bg-[#1e293b] p-3 rounded-lg border border-gray-700">
                                    <p className="text-[10px] text-gray-400 uppercase">Phone / WhatsApp</p>
                                    <p className="text-green-400 font-bold text-sm">{viewDetailsUser.phone || 'N/A'}</p>
                                </div>
                                <div className="bg-[#1e293b] p-3 rounded-lg border border-gray-700">
                                    <p className="text-[10px] text-gray-400 uppercase">Location</p>
                                    <p className="text-gray-300 font-bold text-sm">
                                        {viewDetailsUser.district || 'N/A'}, {viewDetailsUser.division || 'N/A'}
                                    </p>
                                </div>
                                <div className="bg-[#1e293b] p-3 rounded-lg border border-gray-700">
                                    <p className="text-[10px] text-gray-400 uppercase">Joined Date</p>
                                    <p className="text-white font-bold text-xs">
                                        <Clock size={12} className="inline mr-1"/> {formatDate(viewDetailsUser.created_at)}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-800">
                                <h4 className="text-blue-400 font-bold text-sm mb-2 flex items-center gap-2"><Globe size={16}/> IP History</h4>
                                <div className="flex flex-col gap-2 mt-3">
                                    <div className="flex flex-wrap gap-2">
                                        {viewDetailsUser.ip_address ? viewDetailsUser.ip_address.split(',').map((ip, i) => (
                                            <span key={i} className="text-white font-mono font-bold bg-gray-800 px-2 py-1 rounded text-xs border border-gray-600 shadow-sm">
                                                {ip.trim()}
                                            </span>
                                        )) : <span className="text-gray-500 text-xs italic">No IP Recorded</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'wallet' && (
                        <div className="space-y-3">
                            {(!userDetails.transactions || userDetails.transactions.length === 0) ? <p className="text-center text-gray-500 py-10">No transaction history found.</p> : 
                                userDetails.transactions.map((tx, index) => (
                                <div key={tx.id || index} className="bg-[#1e293b] p-4 rounded-xl flex justify-between items-center border border-gray-700 shadow-sm hover:border-gray-500 transition">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full h-10 w-10 flex items-center justify-center border border-gray-600/30 ${tx.txType === 'Deposit' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {tx.txType === 'Deposit' ? <ArrowDownLeft size={20}/> : <ShoppingCart size={20}/>}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-200">
                                                {tx.txType === 'Deposit' ? `Deposit (${tx.method})` : `Order: ${tx.package_name}`}
                                            </p>
                                            <p className="text-[10px] text-gray-500 font-medium">{formatDate(tx.created_at)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-extrabold text-base ${tx.txType === 'Deposit' ? 'text-green-500' : 'text-red-500'}`}>
                                            {tx.txType === 'Deposit' ? '+' : '-'}৳{tx.amount}
                                        </p>
                                        <span className={`text-[10px] uppercase font-bold tracking-wide px-2 py-0.5 rounded-full mt-1 inline-block ${
                                            (tx.status === 'completed' || tx.status === 'approved') ? 'bg-green-500/10 text-green-500' : 
                                            tx.status === 'pending' ? 'bg-orange-500/10 text-orange-500' : 'bg-red-500/10 text-red-500'
                                        }`}>{tx.status}</span>
                                    </div>
                                </div>
                                ))
                            }
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* IP Scanner Modal */}
      {showIpScanner && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4 backdrop-blur-md">
            <div className="bg-[#1e293b] w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl border border-gray-600 p-6">
                <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                    <h2 className="text-xl font-bold text-red-500 flex items-center gap-2"><Radar/> Security Scan: Multi-Accounts</h2>
                    <button onClick={() => setShowIpScanner(false)} className="text-gray-400 hover:text-white"><X/></button>
                </div>
                {duplicateIps.length === 0 ? (
                     <div className="text-center py-10">
                        <ShieldAlert size={48} className="mx-auto text-green-500 mb-3 opacity-50"/>
                        <p className="text-green-500 font-bold text-lg">System is Clean!</p>
                        <p className="text-gray-400 text-sm">No duplicate accounts found on any single IP.</p>
                    </div>
                ) : (
                    duplicateIps.map(group => (
                        <div key={group.ip} className="mb-4 bg-red-900/10 border border-red-900/30 p-4 rounded-lg">
                            <p className="text-sm font-bold text-red-400 mb-2 flex items-center gap-2"><Globe size={14}/> IP: {group.ip}</p>
                            <div className="space-y-2">
                                {group.users.map(u => (
                                    <div key={u.id} className="text-xs flex justify-between bg-[#0f172a] p-2 rounded">
                                        <span>{u.full_name}</span>
                                        <span className="text-gray-500">{u.id.slice(0,8)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      )}

      {/* Edit Balance Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
            <div className="bg-[#1e293b] w-full max-w-sm rounded-2xl p-6 border border-gray-600">
                <h3 className="text-xl font-bold mb-4">Set Balance: <span className="text-[#fbbf24]">{selectedUser.full_name}</span></h3>
                <input type="number" className="w-full bg-[#0f172a] p-3 rounded-lg border border-gray-600 mb-4" value={amount} onChange={e => setAmount(e.target.value)} />
                <div className="flex gap-3">
                    <button onClick={() => setSelectedUser(null)} className="flex-1 bg-gray-700 py-2 rounded-lg font-bold">Cancel</button>
                    <button onClick={handleUpdateBalance} className="flex-1 bg-blue-600 py-2 rounded-lg font-bold">Save</button>
                </div>
            </div>
        </div>
      )}

      {/* Ban Modal */}
      {banModalUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
            <div className="bg-[#1e293b] w-full max-w-sm rounded-2xl p-6 border border-red-500/50">
                <h3 className="text-xl font-bold text-red-500 mb-4 flex items-center gap-2"><Ban/> Restriction Level</h3>
                <p className="text-sm mb-4">User: {banModalUser.full_name}</p>
                <select className="w-full bg-[#0f172a] p-3 rounded-lg border border-gray-600 mb-6 outline-none" onChange={e => setBanType(e.target.value)} value={banType}>
                    <option value="none">No Ban (Active)</option>
                    <option value="deposit_ban">Deposit Ban</option>
                    <option value="withdraw_ban">Withdraw Ban</option>
                    <option value="full_ban">Full Account Ban</option>
                </select>
                <div className="flex gap-3">
                    <button onClick={() => setBanModalUser(null)} className="flex-1 bg-gray-700 py-3 rounded-xl font-bold">Cancel</button>
                    <button onClick={handleBan} className="flex-1 bg-red-600 py-3 rounded-xl font-bold">Confirm</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default AdminUsers;