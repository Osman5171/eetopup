import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Upload, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const AdminSlider = () => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // আপনার দেওয়া ImgBB API Key
  const IMGBB_API_KEY = 'cb9a8a067b3507ae61429aa76e819483'; 

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('slider')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setImages(data);
    if (error) console.error("Error:", error);
    setLoading(false);
  };

  // ImgBB তে ছবি আপলোড করে Supabase এ লিংক সেভ করা
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return alert("File too large! Max 5MB.");

    setUploading(true);
    try {
      // ১. ImgBB তে আপলোড
      const formData = new FormData();
      formData.append('image', file);

      const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData
      });
      const imgData = await imgbbResponse.json();
      
      if (!imgData.success) throw new Error("ImgBB Upload Failed");
      
      const directImageUrl = imgData.data.url;

      // ২. Supabase ডাটাবেসে লিংক সেভ করা
      const { error: dbErr } = await supabase
        .from('slider')
        .insert({ image_url: directImageUrl });
        
      if (dbErr) throw dbErr;

      alert("Image Uploaded Successfully! 🎉");
      fetchImages(); 

    } catch (error) {
      alert('Upload Failed: ' + error.message);
    } finally {
      setUploading(false);
      e.target.value = null; // ইনপুট ক্লিয়ার
    }
  };

  // ডাটাবেস থেকে ডিলিট করা
  const handleDelete = async (id) => {
    if(!window.confirm('আপনি কি এই স্লাইডার ছবিটি ডিলিট করতে চান?')) return;
    try {
      const { error } = await supabase.from('slider').delete().eq('id', id);
      if (error) throw error;
      fetchImages();
    } catch (error) {
      alert('Delete Failed: ' + error.message);
    }
  };

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0a1930] flex items-center gap-2">
          <ImageIcon className="text-[#0052FF]" /> Manage Slider
        </h1>
        <p className="text-gray-500 text-sm mt-1">Upload banner images for home page</p>
      </div>

      {/* Upload Box */}
      <div className="bg-white p-8 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#0052FF] transition relative group shadow-sm mb-8 text-center">
        <input 
          type="file" 
          accept="image/*" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
          onChange={handleUpload} 
          disabled={uploading}
        />
        <div className="flex flex-col items-center gap-3">
          <div className={`p-4 rounded-full transition ${uploading ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-[#0052FF] group-hover:scale-110'}`}>
            {uploading ? <Loader2 className="animate-spin" size={32}/> : <Upload size={32}/>}
          </div>
          <div>
            <h3 className="font-bold text-lg text-[#0a1930]">
              {uploading ? 'Uploading to Server...' : 'Click or Drop Image to Upload'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">Auto-hosted on ImgBB. Zero Database Cost! (Max 5MB)</p>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <h3 className="font-bold text-[#0a1930] border-b pb-2 mb-4">Active Banners ({images.length})</h3>
      
      {loading ? (
        <div className="text-center py-10"><Loader2 className="animate-spin text-[#0052FF] mx-auto" size={32}/></div>
      ) : images.length === 0 ? (
        <div className="text-center text-gray-500 bg-white p-8 rounded-xl shadow-sm border border-gray-100">No slider images found. Please upload one!</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {images.map(img => (
            <div key={img.id} className="relative group bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <img 
                src={img.image_url} 
                alt="Slider" 
                className="w-full h-40 object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center backdrop-blur-sm">
                <button 
                  onClick={() => handleDelete(img.id)} 
                  className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transform hover:scale-110 transition shadow-xl"
                  title="Delete Image"
                >
                  <Trash2 size={20}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSlider;