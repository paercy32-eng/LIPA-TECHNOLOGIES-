"use client";

import { useState, useEffect, Suspense } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter, useSearchParams } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Icons
const PhoneIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
    <line x1="12" y1="18" x2="12.01" y2="18"></line>
  </svg>
);

const LockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
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
      
      {/* Translucent Bottom Card */}
      <div className="bg-white/95 backdrop-blur-xl w-full rounded-t-[40px] p-8 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] relative z-10 border-t border-white/50">
        
        {/* Toggle Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isLogin ? "Sign in to your LIPA account" : "Join LIPA Technologies today"}
          </p>
        </div>

        {message.text && (
          <div className={`text-center p-3 mb-5 rounded-xl text-sm font-medium border ${message.isError ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          {/* Phone Input */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1.5">Phone Number</label>
            <div className="flex items-center w-full bg-white border-2 border-gray-800 rounded-xl overflow-hidden focus-within:border-blue-600 transition-colors">
              <div className="pl-4 pr-3 py-3.5 border-r-2 border-gray-100 flex items-center gap-2">
                <PhoneIcon />
                <span className="font-bold text-gray-900 text-sm">+256</span>
              </div>
              <input 
                type="tel" 
                placeholder="Enter your phone number" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 px-4 py-3.5 bg-transparent focus:outline-none text-gray-900 text-sm placeholder-gray-400 font-medium"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1.5">Password</label>
            <div className="flex items-center w-full bg-white border-2 border-gray-800 rounded-xl overflow-hidden focus-within:border-blue-600 transition-colors">
              <div className="pl-4 pr-3 py-3.5">
                <LockIcon />
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 px-2 py-3.5 bg-transparent focus:outline-none text-gray-900 text-sm placeholder-gray-400 font-medium"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="pr-4 text-xs font-bold text-gray-400 hover:text-gray-800"
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          {/* Register Only Fields */}
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1.5">Confirm Password</label>
                <div className="flex items-center w-full bg-white border-2 border-gray-800 rounded-xl overflow-hidden focus-within:border-blue-600 transition-colors">
                  <div className="pl-4 pr-3 py-3.5">
                    <LockIcon />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Repeat your password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="flex-1 px-2 py-3.5 bg-transparent focus:outline-none text-gray-900 text-sm placeholder-gray-400 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1.5">Invite Code <span className="text-gray-400 font-normal">(Optional)</span></label>
                <div className="flex items-center w-full bg-white border-2 border-gray-800 rounded-xl overflow-hidden focus-within:border-blue-600 transition-colors">
                  <div className="pl-4 pr-3 py-3.5">
                    <UsersIcon />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Enter invite code" 
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    className="flex-1 px-2 py-3.5 bg-transparent focus:outline-none text-gray-900 text-sm placeholder-gray-400 font-medium uppercase"
                  />
                </div>
              </div>
            </>
          )}

          {/* Action Button */}
          <button 
            onClick={handleAuth}
            disabled={isLoading}
            className={`w-full font-black py-4 rounded-xl transition-all mt-4 text-white text-lg ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/30'}`}
          >
            {isLoading ? 'Processing...' : isLogin ? 'Login' : 'Create Account'}
          </button>
        </div>

        {/* Footer Toggle */}
        <div className="mt-8 text-center">
          <button 
            onClick={() => { setIsLogin(!isLogin); setMessage({ text: "", isError: false }); }}
            className="text-gray-800 font-bold hover:underline text-sm"
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
    <main className="min-h-screen relative flex flex-col bg-gray-900">
      
      {/* Top Hero Image (Technology Theme) */}
      <div className="absolute inset-0 z-0 h-[45vh]">
        <img 
          src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1200&auto=format&fit=crop" 
          alt="Technology" 
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay to make the LIPA logo visible */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/60 to-transparent"></div>
        
        {/* LIPA Logo Top Center */}
        <div className="absolute top-12 left-0 right-0 flex justify-center items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-lg font-black text-white">LP</span>
          </div>
          <span className="text-2xl font-black text-white tracking-widest uppercase drop-shadow-lg">LIPA</span>
        </div>
      </div>

      {/* Form Container (pushes to bottom) */}
      <div className="flex-1 flex flex-col justify-end relative z-10 mt-[35vh]">
        <Suspense fallback={<div className="text-white text-center p-8 bg-white/95 rounded-t-[40px]">Loading...</div>}>
          <AuthForm />
        </Suspense>
      </div>
    </main>
  );
          }
