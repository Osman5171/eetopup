import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react'; 

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  
  // States
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false); 
  const [showManualForm, setShowManualForm] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    whatsapp: ''
  });

  useEffect(() => {
    const checkCurrentSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            handleSuccessfulAuth(); 
        } else {
            setSessionChecked(true);
        }
    };
    checkCurrentSession();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSuccessfulAuth = () => {
      const redirectUrl = localStorage.getItem('redirectAfterLogin');
      if (redirectUrl) {
          localStorage.removeItem('redirectAfterLogin'); 
          navigate(redirectUrl, { replace: true });
      } else {
          navigate('/', { replace: true }); 
      }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        
        handleSuccessfulAuth(); 
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
              data: { full_name: formData.fullName }
          }
        });
        if (error) throw error;
        
        if (data?.user) {
            await supabase.from('profiles').update({ whatsapp: formData.whatsapp }).eq('id', data.user.id);
        }
        
        alert('Registration Successful! You can now log in.');
        setIsLogin(true); 
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
        const redirectPath = localStorage.getItem('redirectAfterLogin') || '/';
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin + redirectPath } 
        });
        if (error) throw error;
    } catch (error) {
        alert("Google Login Error: " + error.message);
        setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!formData.email) return alert("Please enter your email address!");
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/profile`, 
      });
      if (error) throw error;
      
      alert("✅ A password reset link has been sent to your email!");
      setIsForgotPassword(false); 
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!sessionChecked) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center"><div className="animate-pulse text-[#fbbf24] font-bold">Checking Connection...</div></div>;

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden w-full">
      
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl"></div>

      <div className="bg-[#1e293b]/90 backdrop-blur p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700/50 z-10 transition-all duration-500">
        
        {/* Header Text */}
        <div className="text-center mb-8 relative">
            {showManualForm && !isForgotPassword && (
                <button onClick={() => setShowManualForm(false)} className="absolute -left-2 top-0 text-gray-400 hover:text-white transition">
                    <ArrowLeft size={24} />
                </button>
            )}
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[#fbbf24]">
                {isForgotPassword ? 'Reset Password' : isLogin ? 'Welcome Back!' : 'Create Account'}
            </h2>
            <p className="text-gray-400 text-sm mt-2">
                {isForgotPassword ? 'Enter your email to receive a reset link.' : 'Level up your gaming journey'}
            </p>
        </div>

        {/* 🔥 VIEW 1: ONLY GOOGLE & EMAIL BUTTON 🔥 */}
        {!showManualForm && !isForgotPassword ? (
            <div className="space-y-4 animate-fade-in">
                <button onClick={handleGoogleLogin} disabled={loading} className="w-full bg-white text-gray-900 font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 hover:scale-[1.02] transition shadow-lg disabled:opacity-70">
                    {loading ? <Loader2 size={24} className="animate-spin text-gray-500" /> : (
                        <>
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="G" />
                            Continue with Google
                        </>
                    )}
                </button>

                <div className="flex items-center gap-3 py-2">
                    <div className="h-[1px] bg-gray-700 flex-1"></div>
                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">OR</span>
                    <div className="h-[1px] bg-gray-700 flex-1"></div>
                </div>

                <button onClick={() => setShowManualForm(true)} className="w-full bg-transparent text-gray-300 font-bold py-3.5 rounded-xl border border-gray-600 hover:bg-gray-800 transition flex items-center justify-center gap-2">
                    <Mail size={18} /> Continue with Email
                </button>

                <div className="text-center mt-6 pt-4 border-t border-gray-700/50">
                    <p className="text-gray-400 text-sm">
                        {isLogin ? "New to Eagle Eye?" : "Already a member?"} 
                        <button onClick={() => setIsLogin(!isLogin)} className="text-[#fbbf24] font-bold ml-1 hover:underline outline-none">
                            {isLogin ? 'Register' : 'Login'}
                        </button>
                    </p>
                </div>
            </div>
        ) : (
            /* 🔥 VIEW 2: MANUAL EMAIL/PASSWORD FORM 🔥 */
            <div className="animate-slide-up">
                <form onSubmit={isForgotPassword ? handleForgotPassword : handleAuth} className="space-y-4">
                  
                  {!isLogin && !isForgotPassword && (
                    <>
                      <div className="relative">
                        <User size={18} className="absolute left-3 top-3.5 text-gray-500"/>
                        <input required name="fullName" type="text" onChange={handleChange} className="w-full bg-[#0f172a] text-white pl-10 p-3 rounded-xl border border-gray-600 focus:border-[#fbbf24] outline-none transition" placeholder="Full Name" />
                      </div>
                      <div className="relative">
                        <Phone size={18} className="absolute left-3 top-3.5 text-gray-500"/>
                        <input required name="whatsapp" type="text" onChange={handleChange} className="w-full bg-[#0f172a] text-white pl-10 p-3 rounded-xl border border-gray-600 focus:border-[#fbbf24] outline-none transition" placeholder="WhatsApp Number" />
                      </div>
                    </>
                  )}

                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-3.5 text-gray-500"/>
                    <input required name="email" type="email" onChange={handleChange} className="w-full bg-[#0f172a] text-white pl-10 p-3 rounded-xl border border-gray-600 focus:border-[#fbbf24] outline-none transition" placeholder="Email Address" />
                  </div>

                  {!isForgotPassword && (
                    <div>
                      <div className="relative">
                        <Lock size={18} className="absolute left-3 top-3.5 text-gray-500"/>
                        <input required name="password" type={showPassword ? "text" : "password"} onChange={handleChange} className="w-full bg-[#0f172a] text-white pl-10 pr-10 p-3 rounded-xl border border-gray-600 focus:border-[#fbbf24] outline-none transition" placeholder="Password" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-300">
                            {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                        </button>
                      </div>
                      
                      {isLogin && (
                        <div className="text-right mt-2">
                          <button type="button" onClick={() => setIsForgotPassword(true)} className="text-xs text-blue-400 hover:text-[#fbbf24] transition font-medium outline-none">
                            Forgot Password?
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <button disabled={loading} className="w-full bg-gradient-to-r from-[#fbbf24] to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-black py-3.5 rounded-xl transition shadow-lg mt-4 flex items-center justify-center gap-2 disabled:opacity-70">
                    {loading && <Loader2 size={18} className="animate-spin" />}
                    {loading ? 'Processing...' : isForgotPassword ? 'Send Reset Link' : isLogin ? 'Login Securely' : 'Create Account'}
                  </button>
                </form>

                <div className="text-center mt-6 border-t border-gray-700/50 pt-4">
                  {isForgotPassword ? (
                    <button onClick={() => setIsForgotPassword(false)} className="text-sm text-gray-400 hover:text-white transition font-medium">
                      ← Back to Login
                    </button>
                  ) : isLogin ? (
                    <p className="text-gray-400 text-sm">New to Eagle Eye? <button onClick={() => {setIsLogin(false); setShowManualForm(true);}} className="text-[#fbbf24] font-bold ml-1 hover:underline outline-none">Register Now</button></p>
                  ) : (
                    <p className="text-gray-400 text-sm">Already a member? <button onClick={() => {setIsLogin(true); setShowManualForm(true);}} className="text-[#fbbf24] font-bold ml-1 hover:underline outline-none">Login Here</button></p>
                  )}
                </div>
            </div>
        )}

      </div>
      
      {/* <style jsx> er poriborte standard <style> bebohar kora holo jate React e error na dey */}
      <style>{`
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default Auth;