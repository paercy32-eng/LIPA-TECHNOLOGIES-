"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

// THIS IS WHERE VERCEL WILL INJECT YOUR KEYS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function AuthPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ text: "", isError: false });

  const formatPhoneToEmail = (phoneNumber: string) => {
    return `${phoneNumber.trim()}@lipa.local`;
  };

  const handleRegister = async () => {
    if (!phone || !password) return setMessage({ text: "Please fill all fields", isError: true });
    
    setMessage({ text: "Creating account...", isError: false });
    const email = formatPhoneToEmail(phone);

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setMessage({ text: error.message, isError: true });
    } else {
      setMessage({ text: "Account created! You can now log in.", isError: false });
      setPassword("");
    }
  };

  const handleLogin = async () => {
    if (!phone || !password) return setMessage({ text: "Please fill all fields", isError: true });
    
    setMessage({ text: "Logging in...", isError: false });
    const email = formatPhoneToEmail(phone);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage({ text: error.message, isError: true });
    } else {
      setMessage({ text: "Login successful! Welcome to LIPA.", isError: false });
      // We will redirect to the Dashboard later
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-green-500 mb-2">LIPA Technologies</h1>
        <p className="text-center text-gray-400 mb-8">Welcome back</p>

        {message.text && (
          <div className={`text-center p-3 mb-4 rounded text-sm ${message.isError ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'}`}>
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input 
              type="tel" 
              placeholder="e.g. 0712345678" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-green-500"
            />
          </div>

          <div className="flex flex-col space-y-3 pt-4">
            <button 
              onClick={handleLogin}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition"
            >
              Log In
            </button>
            <button 
              onClick={handleRegister}
              className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 rounded-lg transition"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
