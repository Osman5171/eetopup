import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NoticeBar from '../components/NoticeBar';
import HeroSlider from '../components/HeroSlider';
import LatestOrders from '../components/LatestOrders';
import { supabase } from '../supabaseClient';
import { Loader2 } from 'lucide-react';

const Home = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    // ডাটাবেস থেকে শুধু Active ব্র্যান্ডগুলো আনা হচ্ছে
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('status', 'Active')
      .order('created_at', { ascending: true });
    
    if (data) setBrands(data);
    setLoading(false);
  };

  return (
    <div className="w-full animate-fade-in-up">
      <NoticeBar />
      <HeroSlider />

      {/* Dynamic Brands Section */}
      <div className="mt-10">
        <h2 className="text-center text-2xl font-bold text-[#0a1930] mb-8">Top Services</h2>
        
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-[#0052FF]" size={40} />
          </div>
        ) : brands.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {brands.map((item) => (
              // URL-এ ব্র্যান্ডের নাম পাঠানো হচ্ছে
              <Link to={`/topup?brand=${encodeURIComponent(item.name)}`} key={item.id} className="flex flex-col items-center cursor-pointer group">
                <div className="bg-gradient-to-b from-[#0052FF] to-[#002f99] p-[2px] rounded-2xl shadow-lg transition transform group-hover:-translate-y-1">
                  <img 
                    src={item.image_url || 'https://via.placeholder.com/150'} 
                    alt={item.name} 
                    className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-2xl bg-[#0a1930]" 
                  />
                </div>
                <p className="mt-3 text-sm md:text-base font-bold text-[#0a1930] text-center">
                  {item.name}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No active brands found.</p>
        )}
      </div>

      <LatestOrders />
    </div>
  );
};

export default Home;