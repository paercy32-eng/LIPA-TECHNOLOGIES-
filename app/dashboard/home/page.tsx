"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// 13 Novida soda cans drawn in code (one colour per flavor)
const FLAVORS: [string, string, string][] = [
  ["Orange", "#ff8a00", "#ffc266"],
  ["Pineapple", "#e6b800", "#fff08a"],
  ["Green Apple", "#2e9e3e", "#a8e6a1"],
  ["Mango", "#ff9f1c", "#ffd98a"],
  ["Lemon", "#d4c900", "#fff59d"],
  ["Cocktail", "#d81b60", "#ff9ec0"],
  ["Citrus", "#ff6f3c", "#ffcba4"],
  ["Tropical", "#00a8c6", "#9be7f2"],
  ["Berry", "#7b1fa2", "#d9a8e8"],
  ["Cola", "#4e342e", "#b99b8f"],
  ["Grape", "#512da8", "#c1aef0"],
  ["Cherry", "#c62828", "#f5a3a3"],
  ["Assorted", "#1565c0", "#90c4f5"],
];

const makeCan = (name: string, c1: string, c2: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c2}"/><stop offset="1" stop-color="${c1}"/></linearGradient>
<linearGradient id="can" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${c1}"/><stop offset="0.4" stop-color="${c2}"/><stop offset="1" stop-color="${c1}"/></linearGradient>
</defs>
<rect width="200" height="200" fill="url(#bg)"/>
<circle cx="30" cy="40" r="12" fill="#fff" opacity="0.35"/>
<circle cx="165" cy="60" r="8" fill="#fff" opacity="0.35"/>
<circle cx="150" cy="150" r="14" fill="#fff" opacity="0.25"/>
<ellipse cx="100" cy="186" rx="38" ry="6" fill="#000" opacity="0.15"/>
<rect x="70" y="30" width="60" height="150" rx="10" fill="url(#can)" stroke="#fff" stroke-width="2"/>
<rect x="76" y="22" width="48" height="10" rx="4" fill="#cfd8dc"/>
<rect x="70" y="85" width="60" height="50" fill="#fff" opacity="0.92"/>
<text x="100" y="107" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" font-size="13" fill="${c1}">NOVIDA</text>
<text x="100" y="124" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="9" fill="#333">${name}</text>
<rect x="78" y="40" width="6" height="130" rx="3" fill="#fff" opacity="0.25"/>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const NOVIDA_IMAGES = FLAVORS.map(([name, c1, c2]) => makeCan(name, c1, c2));

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