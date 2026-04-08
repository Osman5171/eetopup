import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NoticeBar from '../components/NoticeBar';
import HeroSlider from '../components/HeroSlider';
import LatestOrders from '../components/LatestOrders';
import { supabase } from '../supabaseClient';
import { Loader2 } from 'lucide-react';

const Home = () => {
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    setLoading(true);
    // ১. ডাটাবেস থেকে Active ব্র্যান্ডগুলো আনা
    const { data: bData } = await supabase.from('brands').select('*').eq('status', 'Active').order('created_at', { ascending: true });
    
    // ২. ডাটাবেস থেকে Active প্রোডাক্টগুলো আনা
    const { data: pData } = await supabase.from('products').select('*').eq('status', 'Active').order('created_at', { ascending: true });

    if (bData) setBrands(bData);
    if (pData) setProducts(pData);
    setLoading(false);
  };

  return (
    <div className="w-full animate-fade-in-up">
      <NoticeBar />
      <HeroSlider />

      <div className="mt-12">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-[#0052FF]" size={40} />
          </div>
        ) : brands.length > 0 ? (
          brands.map((brand) => {
            // এই ব্র্যান্ডের আন্ডারে থাকা প্রোডাক্টগুলো ফিল্টার করা
            const brandProducts = products.filter(p => p.brand_name === brand.name);
            
            // যদি এই ব্র্যান্ডের কোনো প্রোডাক্ট না থাকে, তবে ব্র্যান্ডের হেডিংটি দেখাবে না
            if (brandProducts.length === 0) return null;

            return (
              <div key={brand.id} className="mb-12">
                
                {/* 👈 Brand Heading (যেমন: Free Fire) */}
                <div className="flex items-center justify-center gap-3 mb-8">
                  {brand.image_url && <img src={brand.image_url} alt={brand.name} className="w-8 h-8 rounded-md bg-[#0a1930] object-cover" />}
                  <h2 className="text-center text-2xl font-black text-[#0a1930] uppercase tracking-wider">{brand.name}</h2>
                </div>
                
                {/* 👈 Products Grid (যেমন: Diamond Top Up, Weekly) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {brandProducts.map((product) => (
                    <Link 
                      to={`/topup?product=${encodeURIComponent(product.name)}&brand=${encodeURIComponent(brand.name)}`} 
                      key={product.id} 
                      className="flex flex-col items-center cursor-pointer group"
                    >
                      <div className="bg-gradient-to-b from-[#0052FF] to-[#002f99] p-[2px] rounded-2xl shadow-lg transition transform group-hover:-translate-y-1">
                        <img 
                          src={product.image_url || brand.image_url} 
                          alt={product.name} 
                          className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-2xl bg-[#0a1930]" 
                        />
                      </div>
                      <p className="mt-3 text-sm md:text-base font-bold text-[#0a1930] text-center px-1">
                        {product.name}
                      </p>
                    </Link>
                  ))}
                </div>

              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-500 font-bold bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            No services available right now.
          </p>
        )}
      </div>

      <LatestOrders />
    </div>
  );
};

export default Home;