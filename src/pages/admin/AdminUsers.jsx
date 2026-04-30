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
    if (search.name) temp = temp.filter(u => u.full_name?.toLowerCase().includes(search.name.toLowerCase()));
    if (search.phone) temp = temp.filter(u => (u.phone || u.whatsapp || '').includes(search.phone));
    if (search.uid) temp = temp.filter(u => u.id.includes(search.uid));
    if (search.ip) temp = temp.filter(u => u.ip_address?.includes(search.ip));

    if (sortBy === 'bal_high') temp.sort((a, b) => (b.balance || 0) - (a.balance || 0));
    if (sortBy === 'bal_low') temp.sort((a, b) => (a.balance || 0) - (b.balance || 0));
    return temp;
  }, [users, search, sortBy]);

  // --- FETCH USER DETAILS ---
  const fetchUserDetails = async (user) => {
    setViewDetailsUser(user);
    const [orders, deposits] = await Promise.all([
      supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('deposits').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
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

    setUserDetails({ transactions: combinedTransactions, stats });
    setActiveTab('info');
  };

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
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#fbbf24] flex items-center gap-2">
            <Users size={24} /> User Control
        </h1>
        <button onClick={() => setShowIpScanner(true)} className="bg-red-900/30 text-red-500 border border-red-900/50 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-red-600 hover:text-white transition">
            <Radar size={16} className="animate-pulse"/> IP Scanner
        </button>
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
             <div className="col-span-full flex justify-center py-10"><RefreshCcw className="animate-spin text-[#fbbf24]"/></div>
        ) : filteredUsers.map(user => (
            <div key={user.id} className="bg-[#1e293b] p-4 rounded-xl border border-gray-700 hover:border-blue-500 transition shadow-lg">
                <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-gray-700 p-2 rounded-full"><User size={20}/></div>
                    <div>
                        <h3 className="font-bold text-white cursor-pointer hover:text-blue-400" onClick={() => fetchUserDetails(user)}>
                            {user.full_name || 'No Name'}
                            {renderBanBadge(user.ban_type)}
                        </h3>
                        <p className="text-xs text-gray-400">{user.phone || user.whatsapp || 'No Contact'}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Balance</p>
                    <p className="text-lg font-black text-[#fbbf24]">৳{user.balance || 0}</p>
                </div>
                </div>
                
                <div className="flex gap-2 border-t border-gray-700 pt-3">
                <button onClick={() => { setSelectedUser(user); setAmount(user.balance); }} className="flex-1 bg-blue-600/10 text-blue-400 py-1.5 rounded text-xs font-bold hover:bg-blue-600 hover:text-white transition">Edit Balance</button>
                <button onClick={() => { setBanModalUser(user); setBanType(user.ban_type || 'none'); }} className="flex-1 bg-red-900/10 text-red-400 py-1.5 rounded text-xs font-bold hover:bg-red-600 hover:text-white transition">Manage Ban</button>
                </div>
            </div>
            ))
        }
      </div>

      {viewDetailsUser && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[70] p-4 backdrop-blur-md">
            <div className="bg-[#1e293b] w-full max-w-2xl h-[85vh] flex flex-col rounded-2xl border border-gray-600 shadow-2xl relative overflow-hidden text-sm">
                <div className="p-5 border-b border-gray-700 bg-[#0f172a] flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">{viewDetailsUser.full_name || 'User Info'}</h2>
                    <button onClick={() => setViewDetailsUser(null)} className="text-gray-400 hover:text-white"><X size={24}/></button>
                </div>
                <div className="flex bg-[#1e293b] border-b border-gray-700">
                    <button onClick={() => setActiveTab('info')} className={`flex-1 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'info' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400'}`}>Info</button>
                    <button onClick={() => setActiveTab('wallet')} className={`flex-1 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'wallet' ? 'border-green-500 text-green-400' : 'border-transparent text-gray-400'}`}>History</button>
                </div>
                <div className="flex-1 overflow-y-auto p-5">
                    {activeTab === 'info' ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-3 mb-6">
                                <div className="bg-gray-800 p-3 rounded text-center border border-gray-700">
                                    <p className="text-[10px] text-gray-400 uppercase">Spent</p>
                                    <p className="text-lg font-bold text-red-400">৳{userDetails.stats.totalSpent}</p>
                                </div>
                                <div className="bg-gray-800 p-3 rounded text-center border border-gray-700">
                                    <p className="text-[10px] text-gray-400 uppercase">Deposit</p>
                                    <p className="text-lg font-bold text-green-400">৳{userDetails.stats.totalDeposit}</p>
                                </div>
                                <div className="bg-gray-800 p-3 rounded text-center border border-gray-700">
                                    <p className="text-[10px] text-gray-400 uppercase">Orders</p>
                                    <p className="text-lg font-bold text-blue-400">{userDetails.stats.orderCount}</p>
                                </div>
                            </div>
                            <p><b>Email:</b> {viewDetailsUser.email || 'N/A'}</p>
                            <p><b>Location:</b> {viewDetailsUser.district || 'N/A'}, {viewDetailsUser.division || 'N/A'}</p>
                            <p><b>IP recorded:</b> {viewDetailsUser.ip_address || 'N/A'}</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {userDetails.transactions.map((tx, idx) => (
                                <div key={idx} className="bg-[#0f172a] p-3 rounded border border-gray-700 flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-gray-200">{tx.txType}: {tx.package_name || tx.method}</p>
                                        <p className="text-[10px] text-gray-500">{formatDate(tx.created_at)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold ${tx.txType === 'Deposit' ? 'text-green-500' : 'text-red-500'}`}>{tx.txType === 'Deposit' ? '+' : '-'}৳{tx.amount}</p>
                                        <p className="text-[9px] uppercase font-bold text-gray-400">{tx.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
      {/* ... Duplicate IP scanner and Balance modals go here ... */}
    </div>
  );
};

export default AdminUsers;