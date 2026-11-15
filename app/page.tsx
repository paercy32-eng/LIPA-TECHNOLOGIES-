"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function AuthPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ text: "", isError: false });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // We convert the phone number to a valid-looking email format secretly
  const formatPhoneToEmail = (phoneNumber: string) => {
    // Removes any spaces just in case
    const cleanPhone = phoneNumber.trim().replace(/\s+/g, '');
    return `${cleanPhone}@lipa.co`; 
  };

  const handleRegister = async () => {
    if (!phone || !password) {
      return setMessage({ text: "Please fill all fields", isError: true });
    }
    if (password.length < 6) {
      return setMessage({ text: "Password must be at least 6 characters", isError: true });
    }
    
    setIsLoading(true);
    setMessage({ text: "Creating account...", isError: false });
    const email = formatPhoneToEmail(phone);

    const { error } = await supabase.auth.signUp({ 
      email, 
      password 
    });

    setIsLoading(false);

    if (error) {
      setMessage({ text: error.message, isError: true });
    } else {
      setMessage({ text: "Account created! You can now Log In.", isError: false });
      setPassword(""); // Clear password for security
    }
  };

  const handleLogin = async () => {
    if (!phone || !password) {
      return setMessage({ text: "Please fill all fields", isError: true });
    }
    
    setIsLoading(true);
    setMessage({ text: "Logging in...", isError: false });
    const email = formatPhoneToEmail(phone);

    const { error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });

    setIsLoading(false);

    if (error) {
      setMessage({ text: "Invalid phone number or password", isError: true });
    } else {
      // Success! Redirect to the dashboard
      router.push("/dashboard/home"); 
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-700">
        
        <h1 className="text-3xl font-bold text-center text-green-500 mb-2">LIPA Technologies</h1>
        <p className="text-center text-gray-400 mb-8">Welcome back</p>

        {/* Display Error or Success Messages */}
        {message.text && (
          <div className={`text-center p-3 mb-4 rounded text-sm font-medium ${message.isError ? 'bg-red-900/50 text-red-200 border border-red-700' : 'bg-green-900/50 text-green-200 border border-green-700'}`}>
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Phone Number</label>
            <input 
              type="tel" 
              placeholder="e.g. 0706110798" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-green-500 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-green-500 text-white"
            />
          </div>

          <div className="flex flex-col space-y-3 pt-4">
            <button 
              onClick={handleLogin}
              disabled={isLoading}
              className={`w-full font-bold py-3 rounded-lg transition text-white ${isLoading ? 'bg-green-800 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {isLoading ? 'Processing...' : 'Log In'}
            </button>
            
            <button 
              onClick={handleRegister}
              disabled={isLoading}
              className={`w-full font-bold py-3 rounded-lg transition text-white ${isLoading ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-500'}`}
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </main>
  );
            }
