"use client";

import { useState, useEffect, Suspense } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter, useSearchParams } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Icons with Neon Purple Color
const PhoneIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7B61FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-90">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
    <line x1="12" y1="18" x2="12.01" y2="18"></line>
  </svg>
);

const LockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7B61FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-90">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7B61FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-90">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ text: "", isError: false });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setReferralCode(ref);
      setIsLogin(false); 
    }
  }, [searchParams]);

  const formatPhoneToEmail = (phoneNumber: string) => {
    const cleanPhone = phoneNumber.trim().replace(/\s+/g, '');
    return `256${cleanPhone}@lipa.co`; 
  };

  const handleAuth = async () => {
    if (!phone || !password) {
      return setMessage({ text: "Please fill all required fields", isError: true });
    }
    if (!isLogin && password !== confirmPassword) {
      return setMessage({ text: "Passwords do not match", isError: true });
    }
    if (password.length < 6) {
      return setMessage({ text: "Password must be at least 6 characters", isError: true });
    }

    setIsLoading(true);
    setMessage({ text: isLogin ? "Signing in..." : "Creating account...", isError: false });
    
    const email = formatPhoneToEmail(phone);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard/home");
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { referred_by: referralCode || null }
          }
        });
        if (error) throw error;
        
        setMessage({ text: "Account created! You can now log in.", isError: false });
        setIsLogin(true);
        setPassword("");
        setConfirmPassword("");
      }
    } catch (error: any) {
      setMessage({ text: error.message || "Authentication failed", isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto h-full flex flex-col justify-end">
      
      {/* Dark Neon Bottom Card */}
      <div className="bg-[#12141D]/95 backdrop-blur-xl w-full rounded-t-[40px] p-8 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] relative z-10 border-t border-gray-800">
        
        {/* Toggle Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-white tracking-tight">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {isLogin ? "Sign in to your LIPA account" : "Join LIPA Technologies today"}
          </p>
        </div>

        {message.text && (
          <div className={`text-center p-3 mb-5 rounded-xl text-sm font-medium border ${message.isError ? 'bg-red-900/30 text-red-400 border-red-900/50' : 'bg-green-900/30 text-green-400 border-green-900/50'}`}>
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          {/* Phone Input */}
          <div>
            <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase mb-1.5">Phone Number</label>
            <div className="flex items-center w-full bg-[#0B0C10] border border-gray-700 rounded-xl overflow-hidden focus-within:border-[#7B61FF] transition-colors">
              <div className="pl-4 pr-3 py-3.5 border-r border-gray-800 flex items-center gap-2">
                <PhoneIcon />
                <span className="font-bold text-white text-sm">+256</span>
              </div>
              <input 
                type="tel" 
                placeholder="Enter your phone number" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 px-4 py-3.5 bg-transparent focus:outline-none text-white text-sm placeholder-gray-600 font-medium"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase mb-1.5">Password</label>
            <div className="flex items-center w-full bg-[#0B0C10] border border-gray-700 rounded-xl overflow-hidden focus-within:border-[#7B61FF] transition-colors">
              <div className="pl-4 pr-3 py-3.5">
                <LockIcon />
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 px-2 py-3.5 bg-transparent focus:outline-none text-white text-sm placeholder-gray-600 font-medium"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="pr-4 text-[10px] font-bold text-gray-500 hover:text-gray-300"
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          {/* Register Only Fields */}
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase mb-1.5">Confirm Password</label>
                <div className="flex items-center w-full bg-[#0B0C10] border border-gray-700 rounded-xl overflow-hidden focus-within:border-[#7B61FF] transition-colors">
                  <div className="pl-4 pr-3 py-3.5">
                    <LockIcon />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Repeat your password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="flex-1 px-2 py-3.5 bg-transparent focus:outline-none text-white text-sm placeholder-gray-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-wider text-gray-400 uppercase mb-1.5">Invite Code <span className="text-gray-600 font-normal">(Optional)</span></label>
                <div className="flex items-center w-full bg-[#0B0C10] border border-gray-700 rounded-xl overflow-hidden focus-within:border-[#7B61FF] transition-colors">
                  <div className="pl-4 pr-3 py-3.5">
                    <UsersIcon />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Enter invite code" 
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    className="flex-1 px-2 py-3.5 bg-transparent focus:outline-none text-white text-sm placeholder-gray-600 font-medium uppercase"
                  />
                </div>
              </div>
            </>
          )}

          {/* Action Button */}
          <button 
            onClick={handleAuth}
            disabled={isLoading}
            className={`w-full font-black py-4 rounded-xl transition-all mt-4 text-white text-lg ${isLoading ? 'bg-[#7B61FF]/50 cursor-not-allowed' : 'bg-[#7B61FF] hover:bg-[#6a52df] shadow-[0_5px_20px_rgba(123,97,255,0.4)]'}`}
          >
            {isLoading ? 'Processing...' : isLogin ? 'Login' : 'Create Account'}
          </button>
        </div>

        {/* Footer Toggle */}
        <div className="mt-8 text-center">
          <button 
            onClick={() => { setIsLogin(!isLogin); setMessage({ text: "", isError: false }); }}
            className="text-[#00D2FF] font-bold hover:underline text-sm"
          >
            {isLogin ? "Create Account" : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <main className="min-h-screen relative flex flex-col bg-[#0B0C10]">
      
      {/* Top Hero Image with Dark Purple Overlay */}
      <div className="absolute inset-0 z-0 h-[45vh]">
        <img 
          src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200&auto=format&fit=crop" 
          alt="Technology" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0C10]/40 to-[#0B0C10]"></div>
        
        {/* LIPA Logo Top Center */}
        <div className="absolute top-12 left-0 right-0 flex justify-center items-center gap-3">
          <div className="w-10 h-10 bg-[#7B61FF] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(123,97,255,0.6)]">
            <span className="text-lg font-black text-white">LP</span>
          </div>
          <span className="text-2xl font-black text-white tracking-widest uppercase drop-shadow-lg">LIPA</span>
        </div>
      </div>

      {/* Form Container */}
      <div className="flex-1 flex flex-col justify-end relative z-10 mt-[35vh]">
        <Suspense fallback={<div className="text-white text-center p-8 bg-[#12141D] rounded-t-[40px]">Loading...</div>}>
          <AuthForm />
        </Suspense>
      </div>
    </main>
  );
    }
