import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { 
    ArrowLeft, Search, User, Ban, CheckCircle, Edit3, 
    DollarSign, Save, X, Globe, Shield, Users, 
    Smartphone, Mail, Hash, Filter, ArrowUpDown, ShieldAlert, Clock,
    ArrowDownLeft, ArrowUpRight, ShoppingBag, History, RefreshCcw, AlertCircle, AlertTriangle, Radar
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

  // --- IP SCANNER LOGIC (একই আইপি ব্যবহারকারী শনাক্ত করা) ---
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
      supabase.from('orders').select('*').eq('user_id', user.id),
      supabase.from('deposits').select('*').eq('user_id', user.id)
    ]);

    const stats = {
      totalSpent: orders.data?.reduce((sum, o) => sum + (o.status === 'completed' ? o.amount : 0), 0) || 0,
      totalDeposit: deposits.data?.reduce((sum, d) => sum + (d.status === 'approved' ? d.amount : 0), 0) || 0,
      orderCount: orders.data?.length || 0
    };

    setUserDetails({ transactions: [...(orders.data || []), ...(deposits.data || [])], stats });
  };

  // --- UPDATE BALANCE ---
  const handleUpdateBalance = async () => {
    const { error } = await supabase.from('profiles').update({ balance: parseFloat(amount) }).eq('id', selectedUser.id);
    if (!error) {
      alert("Balance Updated! ✅");
      setSelectedUser(null);
      fetchUsers();
    }
  };

  // --- BAN LOGIC (ESP Style IP Auto-Ban) ---
  const handleBan = async () => {
    const { error } = await supabase.from('profiles').update({ ban_type: banType }).eq('id', banModalUser.id);
    if (!error) {
      alert(`User restricted to: ${banType} 🛑`);
      setBanModalUser(null);
      fetchUsers();
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 pb-20">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#fbbf24] flex items-center gap-2">
            <Users /> User Control Center
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
        {filteredUsers.map(user => (
          <div key={user.id} className="bg-[#1e293b] p-4 rounded-xl border border-gray-700 hover:border-blue-500 transition shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gray-700 p-2 rounded-full"><User size={20}/></div>
                <div>
                    <h3 className="font-bold text-white cursor-pointer hover:text-blue-400" onClick={() => fetchUserDetails(user)}>{user.full_name || 'No Name'}</h3>
                    <p className="text-xs text-gray-400">{user.phone || 'No Phone'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-500 uppercase font-bold">Balance</p>
                <p className="text-lg font-black text-[#fbbf24]">৳{user.balance}</p>
              </div>
            </div>
            
            <div className="flex gap-2 border-t border-gray-700 pt-3">
              <button onClick={() => setSelectedUser(user)} className="flex-1 bg-blue-600/10 text-blue-400 py-1.5 rounded text-xs font-bold hover:bg-blue-600 hover:text-white transition">Edit Balance</button>
              <button onClick={() => setBanModalUser(user)} className="flex-1 bg-red-900/10 text-red-400 py-1.5 rounded text-xs font-bold hover:bg-red-600 hover:text-white transition">Manage Ban</button>
            </div>
          </div>
        ))}
      </div>

      {/* IP Scanner Modal */}
      {showIpScanner && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4 backdrop-blur-md">
            <div className="bg-[#1e293b] w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl border border-gray-600 p-6">
                <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                    <h2 className="text-xl font-bold text-red-500 flex items-center gap-2"><Radar/> Security Scan: Multi-Accounts</h2>
                    <button onClick={() => setShowIpScanner(false)} className="text-gray-400 hover:text-white"><X/></button>
                </div>
                {duplicateIps.map(group => (
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
                ))}
            </div>
        </div>
      )}

      {/* Edit Balance Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
            <div className="bg-[#1e293b] w-full max-w-sm rounded-2xl p-6 border border-gray-600">
                <h3 className="text-xl font-bold mb-4">Set Balance: {selectedUser.full_name}</h3>
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
                <select className="w-full bg-[#0f172a] p-3 rounded-lg border border-gray-600 mb-6 outline-none" onChange={e => setBanType(e.target.value)} value={banType}>
                    <option value="none">No Ban (Active)</option>
                    <option value="deposit_ban">Deposit Ban</option>
                    <option value="withdraw_ban">Withdraw Ban</option>
                    <option value="full_ban">Full Account Ban</option>
                </select>
                <button onClick={handleBan} className="w-full bg-red-600 py-3 rounded-xl font-bold">Confirm Restriction</button>
            </div>
        </div>
      )}

    </div>
  );
};

export default AdminUsers;