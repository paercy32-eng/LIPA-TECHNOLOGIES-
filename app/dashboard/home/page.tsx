"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// 13 Vibrant Soda/Fruit Drink Images for Novida
const NOVIDA_IMAGES = [
  "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400&auto=format&fit=crop", // Orange Soda
  "https://images.unsplash.com/photo-1581006852262-e4307cf6283a?q=80&w=400&auto=format&fit=crop", // Pineapple
  "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=400&auto=format&fit=crop", // Green Apple
  "https://images.unsplash.com/photo-1546171753-97d7676e4602?q=80&w=400&auto=format&fit=crop", // Mango
  "https://images.unsplash.com/photo-1519925610903-381054cc2a1c?q=80&w=400&auto=format&fit=crop", // Lemon
  "https://images.unsplash.com/photo-1560508180-03f285f67ded?q=80&w=400&auto=format&fit=crop", // Cocktail
  "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?q=80&w=400&auto=format&fit=crop", // Citrus
  "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?q=80&w=400&auto=format&fit=crop", // Tropical
  "https://images.unsplash.com/photo-1543253687-c931c8e01820?q=80&w=400&auto=format&fit=crop", // Berry
  "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?q=80&w=400&auto=format&fit=crop", // Cola
  "https://images.unsplash.com/photo-1536935338788-846bb9981813?q=80&w=400&auto=format&fit=crop", // Grape
  "https://images.unsplash.com/photo-1584225064785-c62a8b43d148?q=80&w=400&auto=format&fit=crop", // Cherry
  "https://images.unsplash.com/photo-1574966739987-65e38db0f7ce?q=80&w=400&auto=format&fit=crop", // Assorted
];

export default function HomePage() {
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);
  const [userId, setUserId] = useState("");
  const [balance, setBalance] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProductsAndUser = async () => {
      const { data: prods } = await supabase.from("products").select("*").eq("is_active", true).order("min_amount", { ascending: true });
      
      if (prods) {
        const mapped = prods.map((p, index) => ({
          id: p.id,
          name: p.name,
          price: p.min_amount,
          daily: p.daily_payout.toLocaleString(),
          cycle: `${p.duration_days}d`,
          total: (p.daily_payout * p.duration_days),
          dailyRate: p.daily_payout,
          img: NOVIDA_IMAGES[index % NOVIDA_IMAGES.length]
        }));
        setProducts(mapped);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: bal } = await supabase.from("balances").select("available").eq("user_id", user.id).single();
        if (bal) setBalance(Number(bal.available));

        const { data: invs } = await supabase.from("investments").select("product_id").eq("user_id", user.id).eq("status", "ACTIVE");
        if (invs) setPurchasedIds(invs.map(i => i.product_id));
      }
      setIsLoading(false);
    };
    fetchProductsAndUser();
  }, []);

  const handlePurchase = async (product: any) => {
    if (isProcessing) return;
    if (purchasedIds.includes(product.id)) return;

    setIsProcessing(true);

    try {
      const { data: currentBalData } = await supabase.from("balances").select("available").eq("user_id", userId).single();
      const currentBalance = Number(currentBalData?.available || 0);

      if (currentBalance < product.price) {
        setIsProcessing(false);
        return alert(`Insufficient balance. You need UGX ${product.price.toLocaleString()}.`);
      }

      const { count: invCount } = await supabase.from("investments").select("*", { count: 'exact', head: true }).eq("user_id", userId);

      if (invCount === 0) {
        const { count: adminAdjCount } = await supabase.from("transactions").select("*", { count: 'exact', head: true }).eq("user_id", userId).eq("type", "ADMIN_ADJUSTMENT");
        
        if (adminAdjCount === 0) {
          const { data: deposits } = await supabase.from("transactions").select("amount").eq("user_id", userId).eq("type", "DEPOSIT").eq("status", "COMPLETED");
          const totalDeposited = deposits?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
          
          if (totalDeposited < product.price) {
            setIsProcessing(false);
            return alert(`First Purchase Rule: Your first purchase must be fully funded by approved deposits.`);
          }
        }
      }

      const newBalance = currentBalance - product.price;
      await supabase.from("balances").update({ available: newBalance }).eq("user_id", userId);

      const { error: invError } = await supabase.from("investments").insert({
        user_id: userId, product_id: product.id, amount: product.price, expected_return: product.total, status: "ACTIVE", payouts_made: 1
      });
      if (invError) throw invError;

      const finalBalance = newBalance + product.dailyRate;
      await supabase.from("balances").update({ available: finalBalance }).eq("user_id", userId);
      await supabase.from("transactions").insert({ user_id: userId, type: "DAILY_EARNING", amount: product.dailyRate, status: "COMPLETED" });

      setBalance(finalBalance);
      setPurchasedIds([...purchasedIds, product.id]);
      alert(`Successfully purchased ${product.name}!`);

    } catch (error: any) {
      alert("Purchase failed: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f9ff] text-gray-900 pb-24">
      <div className="bg-gradient-to-r from-blue-700 to-cyan-500 p-6 pt-10 rounded-b-[40px] shadow-lg flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Novida <span className="text-cyan-200 text-sm font-medium">VIPs</span>
          </h1>
          <p className="text-blue-100 text-xs font-medium mt-1">Invest in premium daily yields</p>
        </div>
        <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/30 text-right">
          <p className="text-[10px] text-cyan-100 font-bold uppercase tracking-wider">Balance</p>
          <p className="text-sm font-black text-white">UGX {balance.toLocaleString()}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center text-blue-500 mt-20 font-bold">Loading VIP plans...</div>
      ) : (
        <div className="px-5 space-y-4 mt-2">
          {products.map((product) => {
            const isPurchased = purchasedIds.includes(product.id);
            let btnText = isPurchased ? "Purchased" : "Invest Now";
            let btnClass = isPurchased ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30";

            return (
              <div key={product.id} className="bg-white border border-gray-100 rounded-3xl overflow-hidden flex flex-row shadow-[0_8px_30px_rgba(0,0,0,0.04)] h-[150px]">
                <div className="w-[40%] relative h-full bg-blue-50">
                  <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white"></div>
                  <div className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-lg">
                    {product.cycle}
                  </div>
                </div>

                <div className="w-[60%] p-4 flex flex-col justify-between z-10">
                  <div>
                    <h3 className="text-gray-900 font-black text-[16px] leading-tight mb-1">{product.name}</h3>
                    <div className="space-y-1 mb-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Daily</span>
                        <span className="text-xs font-bold text-cyan-600">UGX {product.daily}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Total</span>
                        <span className="text-xs font-bold text-gray-800">UGX {product.total.toLocaleString()}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-lg font-black text-gray-900">UGX {product.price.toLocaleString()}</span>
                    </div>
                  </div>

                  <button onClick={() => handlePurchase(product)} disabled={isPurchased || isProcessing} className={`w-full font-bold py-2.5 rounded-xl text-xs transition-all ${btnClass}`}>
                    {isProcessing ? "Wait..." : btnText}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}