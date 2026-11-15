"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// We need the product list here to map names and images to the investments
const productDB = [
  { id: "p1", name: "LipaVault", img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop" },
  { id: "p2", name: "LipaCore", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" },
  { id: "p3", name: "LipaShield", img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop" },
  { id: "p16", name: "LipaFlow", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" },
  { id: "p17", name: "LipaPulse", img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop" },
  { id: "p26", name: "LipaTap", img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop" },
  // Add the rest of the 35 products here for the Income page
];

export default function IncomePage() {
  const [investments, setInvestments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInvestments = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("investments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        const processedData = data.map(inv => {
          const start = new Date(inv.created_at);
          const now = new Date();
          const diffTime = Math.abs(now.getTime() - start.getTime());
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          // Find product details
          const productInfo = productDB.find(p => p.id === inv.product_id) || { name: "Unknown Product", img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400" };
          
          return { ...inv, daysEarned: diffDays, productName: productInfo.name, productImg: productInfo.img };
        });
        setInvestments(processedData);
      }
      setIsLoading(false);
    };
    fetchInvestments();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-5 pb-24">
      <div className="mb-8 pt-4">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">My Income</h1>
        <p className="text-gray-400 text-sm mt-1">Track your active investments</p>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-500 mt-10">Loading your portfolio...</div>
      ) : investments.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 text-center">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <p className="text-gray-400">No active investments yet.</p>
          <p className="text-gray-600 text-sm mt-1">Go to Home and buy a product to start earning.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {investments.map((inv) => (
            <div key={inv.id} className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-4 shadow-lg relative overflow-hidden flex flex-col">
              
              <div className="flex gap-4 mb-4">
                <img src={inv.productImg} alt={inv.productName} className="w-16 h-16 rounded-xl object-cover border border-gray-700" />
                <div>
                  <h3 className="text-lg font-bold text-white">{inv.productName}</h3>
                  <p className="text-[10px] text-green-400 font-bold tracking-widest uppercase mt-1">{inv.status}</p>
                  <p className="text-sm font-bold text-[#00d2ff] mt-1">{Number(inv.amount).toLocaleString()} UGX</p>
                </div>
              </div>

              <div className="bg-black/40 rounded-xl p-3 flex justify-between border border-gray-800">
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Days Active</p>
                  <p className="text-sm font-bold text-white">{inv.daysEarned} Days</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Expected Return</p>
                  <p className="text-sm font-bold text-green-400">{Number(inv.expected_return).toLocaleString()} UGX</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
