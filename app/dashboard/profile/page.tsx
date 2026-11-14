"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function ProfilePage() {
  const router = useRouter();

  // We will connect these to your database later
  const balance = "0.00"; 

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/"); // Sends user back to login page
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-green-500">My Profile</h1>
        <p className="text-gray-400 text-sm">Manage your account</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center shadow-lg">
        <p className="text-gray-400 text-sm mb-1">Available Balance</p>
        <h2 className="text-4xl font-bold text-white">${balance}</h2>
        
        <div className="flex justify-center gap-4 mt-6">
          <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg w-1/2 transition">
            Deposit
          </button>
          <button className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg w-1/2 transition">
            Withdraw
          </button>
        </div>
      </div>

      {/* Menu Options */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        
        {/* Join Group */}
        <a 
          href="https://t.me/+oj-FvpQ1jhozODA8" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-between p-4 border-b border-gray-700 hover:bg-gray-700 transition"
        >
          <span className="font-medium flex items-center gap-3">
            <span className="text-xl">✈️</span> Join Telegram Group
          </span>
          <span className="text-gray-500">→</span>
        </a>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-between p-4 hover:bg-red-900/30 transition text-red-400"
        >
          <span className="font-medium flex items-center gap-3">
            <span className="text-xl">🚪</span> Log Out
          </span>
        </button>
      </div>
    </div>
  );
}
