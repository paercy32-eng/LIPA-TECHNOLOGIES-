"use client";

import { useState, useEffect, Suspense } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter, useSearchParams } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Uganda Flag SVG Component
const UgandaFlag = () => (
  <svg width="20" height="14" viewBox="0 0 20 14" className="rounded-sm overflow-hidden inline-block mr-2">
    <rect width="20" height="14" fill="#000" />
    <rect y="2" width="20" height="10" fill="#FCDC04" />
    <rect y="4" width="20" height="6" fill="#D90000" />
    <circle cx="10" cy="7" r="2.5" fill="#fff" stroke="#000" strokeWidth="0.5" />
    <path d="M10 5.5 L10 8.5 M8.5 7 L11.5 7" stroke="#000" strokeWidth="0.5" />
  </svg>
);

// Main Auth Form Component
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

  // Automatically pre-fill referral code if it exists in the URL (?ref=XXXX)
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      setReferralCode(ref);
      setIsLogin(false); // Automatically switch to Sign Up if they clicked a referral link
    }
  }, [searchParams]);

  const formatPhoneToEmail = (phoneNumber: string) => {
    // Remove spaces or special chars just in case, and append our hidden domain
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
        // Register: We pass the referral code into the user metadata
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              referred_by: referralCode || null, // Save the referral code to the user's profile
            }
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
    <div className="w-full max-w-md bg-[#0a0a0a]/90 backdrop-blur-xl border border-gray-800 p-8 rounded-3xl shadow-2xl relative z-10">
      
      {/* Header & Logo */}
      <div className="text-center mb-8 flex flex-col items-center">
        <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(34,197,94,0.4)]">
          <span className="text-2xl font-black text-white tracking-tighter">LP</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          {isLogin ? "Welcome Back" : "Join LIPA"}
        </h1>
        <p className="text-gray-400 mt-2 text-sm">
          {isLogin ? "Sign in to your LIPA account." : "Invest in high-yield digital assets."}
        </p>
      </div>

      {/* Error/Success Message */}
      {message.text && (
        <div className={`text-center p-3 mb-5 rounded-xl text-sm font-medium border ${message.isError ? 'bg-red-900/40 text-red-200 border-red-700/50' : 'bg-green-900/40 text-green-200 border-green-700/50'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-5">
        {/* Country (Fixed to Uganda) */}
        <div>
          <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5">Country</label>
          <div className="w-full px-4 py-3.5 bg-[#121212] border border-gray-700 rounded-xl text-white flex items-center">
            <UgandaFlag />
            <span className="font-medium text-sm">Uganda (UGX)</span>
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5">Phone Number</label>
          <div className="flex items-center w-full bg-[#121212] border border-gray-700 rounded-xl overflow-hidden focus-within:border-green-500 transition-colors">
            <div className="px-4 py-3.5 bg-black/40 border-r border-gray-700 text-gray-300 font-medium text-sm">
              +256
            </div>
            <input 
              type="tel" 
              placeholder="700123456" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 px-4 py-3.5 bg-transparent focus:outline-none text-white text-sm placeholder-gray-600"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5">Password</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder={isLogin ? "Enter your password" : "At least 6 characters"} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 bg-[#121212] border border-gray-700 rounded-xl focus:outline-none focus:border-green-500 text-white text-sm placeholder-gray-600 transition-colors pr-16"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-bold text-gray-400 hover:text-white"
            >
              {showPassword ? "HIDE" : "SHOW"}
            </button>
          </div>
        </div>

        {/* Register Only Fields */}
        {!isLogin && (
          <>
            <div>
              <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5">Confirm Password</label>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Repeat your password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-[#121212] border border-gray-700 rounded-xl focus:outline-none focus:border-green-500 text-white text-sm placeholder-gray-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1.5">
                Referral Code <span className="text-gray-600 normal-case font-normal">(optional)</span>
              </label>
              <input 
                type="text" 
                placeholder="LIPA-XXXXX" 
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="w-full px-4 py-3.5 bg-[#121212] border border-gray-700 rounded-xl focus:outline-none focus:border-green-500 text-white text-sm placeholder-gray-600 transition-colors uppercase"
              />
            </div>
          </>
        )}

        {/* Action Button */}
        <button 
          onClick={handleAuth}
          disabled={isLoading}
          className={`w-full font-bold py-4 rounded-xl transition-all mt-2 text-white ${isLoading ? 'bg-green-800 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 shadow-lg shadow-green-600/30'}`}
        >
          {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
        </button>
      </div>

      {/* Footer Toggle */}
      <div className="mt-8 text-center text-sm text-gray-400">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button 
          onClick={() => { setIsLogin(!isLogin); setMessage({ text: "", isError: false }); }}
          className="text-green-500 font-bold hover:underline"
        >
          {isLogin ? "Create one" : "Sign in"}
        </button>
      </div>
    </div>
  );
}

// Main Page Component with Background & Suspense Wrapper
export default function AuthPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative bg-black">
      {/* Background Image with Blur & Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop")',
        }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>
      </div>

      {/* Suspense is required by Next.js for useSearchParams */}
      <Suspense fallback={<div className="text-white z-10">Loading...</div>}>
        <AuthForm />
      </Suspense>
    </main>
  );
        }
