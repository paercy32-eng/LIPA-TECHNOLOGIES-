"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);
  const [userId, setUserId] = useState("");
  const [balance, setBalance] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const tabs = [
    { id: "ALL", label: "All" },
    { id: "LOCK", label: "Lock Plans" },
    { id: "DAILY_PAYOUT", label: "Daily Payouts" },
    { id: "UNLOCK_24H", label: "24Hr Unlock" },
  ];

  // Added price and dailyRate to products for instant payout logic
  const products = [
    { id: "p1", name: "LipaVault", category: "LOCK", price: 10000, daily: "0", cycle: "3d", total: 25000, dailyRate: 0, img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop" },
    { id: "p2", name: "LipaCore", category: "LOCK", price: 5000, daily: "0", cycle: "3d", total: 13000, dailyRate: 0, img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=400&auto=format&fit=crop" },
    { id: "p3", name: "LipaShield", category: "LOCK", price: 50000, daily: "0", cycle: "2d", total: 75000, dailyRate: 0, img: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=400&auto=format&fit=crop" },
    { id: "p4", name: "LipaControl", category: "LOCK", price: 100000, daily: "0", cycle: "6d", total: 300000, dailyRate: 0, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" },
    { id: "p5", name: "LipaCredit", category: "LOCK", price: 150000, daily: "0", cycle: "5d", total: 450000, dailyRate: 0, img: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=400&auto=format&fit=crop" },
    { id: "p6", name: "LipaDirect", category: "LOCK", price: 200000, daily: "0", cycle: "2d", total: 300000, dailyRate: 0, img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=400&auto=format&fit=crop" },
    { id: "p7", name: "LipaOmni", category: "LOCK", price: 75000, daily: "0", cycle: "2d", total: 110000, dailyRate: 0, img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400&auto=format&fit=crop" },
    { id: "p8", name: "LipaAdmin", category: "LOCK", price: 20000, daily: "0", cycle: "5d", total: 50000, dailyRate: 0, img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=400&auto=format&fit=crop" },
    { id: "p9", name: "LipaLedger", category: "LOCK", price: 50000, daily: "0", cycle: "3d", total: 80000, dailyRate: 0, img: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=400&auto=format&fit=crop" },
    { id: "p10", name: "LipaBridge", category: "LOCK", price: 180000, daily: "0", cycle: "4d", total: 400000, dailyRate: 0, img: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=400&auto=format&fit=crop" },
    { id: "p11", name: "LipaConnect", category: "LOCK", price: 250000, daily: "0", cycle: "3d", total: 500000, dailyRate: 0, img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=400&auto=format&fit=crop" },
    { id: "p12", name: "LipaSDK", category: "LOCK", price: 500000, daily: "0", cycle: "2d", total: 100000, dailyRate: 0, img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=400&auto=format&fit=crop" },
    { id: "p13", name: "LipaGateway", category: "LOCK", price: 800000, daily: "0", cycle: "2d", total: 2000000, dailyRate: 0, img: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&auto=format&fit=crop" },
    { id: "p14", name: "LipaX", category: "LOCK", price: 1000000, daily: "0", cycle: "2d", total: 3000000, dailyRate: 0, img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop" },
    { id: "p15", name: "LipaDashboard", category: "LOCK", price: 2000000, daily: "0", cycle: "2d", total: 4500000, dailyRate: 0, img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=400&auto=format&fit=crop" },
    { id: "p16", name: "LipaFlow", category: "DAILY_PAYOUT", price: 5000, daily: "2,000", cycle: "5d", total: 10000, dailyRate: 2000, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" },
    { id: "p17", name: "LipaPulse", category: "DAILY_PAYOUT", price: 10000, daily: "5,000", cycle: "3d", total: 15000, dailyRate: 5000, img: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=400&auto=format&fit=crop" },
    { id: "p18", name: "LipaRewards", category: "DAILY_PAYOUT", price: 25000, daily: "5,000", cycle: "10d", total: 50000, dailyRate: 5000, img: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=400&auto=format&fit=crop" },
    { id: "p19", name: "LipaSub", category: "DAILY_PAYOUT", price: 50000, daily: "15,000", cycle: "8d", total: 120000, dailyRate: 15000, img: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=400&auto=format&fit=crop" },
    { id: "p20", name: "LipaSpend", category: "DAILY_PAYOUT", price: 100000, daily: "25,000", cycle: "9d", total: 225000, dailyRate: 25000, img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=400&auto=format&fit=crop" },
    { id: "p21", name: "LipaSplit", category: "DAILY_PAYOUT", price: 150000, daily: "40,000", cycle: "8d", total: 320000, dailyRate: 40000, img: "https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=400&auto=format&fit=crop" },
    { id: "p22", name: "LipaPaylink", category: "DAILY_PAYOUT", price: 250000, daily: "70,000", cycle: "9d", total: 630000, dailyRate: 70000, img: "https://images.unsplash.com/photo-1586880244386-8b3e34c8382c?q=80&w=400&auto=format&fit=crop" },
    { id: "p23", name: "LipaInvoice", category: "DAILY_PAYOUT", price: 500000, daily: "150,000", cycle: "13d", total: 1950000, dailyRate: 150000, img: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?q=80&w=400&auto=format&fit=crop" },
    { id: "p24", name: "LipaInsights", category: "DAILY_PAYOUT", price: 1000000, daily: "300,000", cycle: "10d", total: 3000000, dailyRate: 300000, img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop" },
    { id: "p25", name: "LipaVirtual", category: "DAILY_PAYOUT", price: 2000000, daily: "700,000", cycle: "8d", total: 5600000, dailyRate: 700000, img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=400&auto=format&fit=crop" },
    { id: "p26", name: "LipaTap", category: "UNLOCK_24H", price: 5000, daily: "2,500", cycle: "4d", total: 10000, dailyRate: 2500, img: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=400&auto=format&fit=crop" },
    { id: "p27", name: "LipaScan", category: "UNLOCK_24H", price: 10000, daily: "4,500", cycle: "4d", total: 18000, dailyRate: 4500, img: "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?q=80&w=400&auto=format&fit=crop" },
    { id: "p28", name: "LipaGo", category: "UNLOCK_24H", price: 25000, daily: "10,000", cycle: "4d", total: 40000, dailyRate: 10000, img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=400&auto=format&fit=crop" },
    { id: "p29", name: "LipaPocket", category: "UNLOCK_24H", price: 50000, daily: "20,000", cycle: "4d", total: 80000, dailyRate: 20000, img: "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?q=80&w=400&auto=format&fit=crop" },
    { id: "p30", name: "LipaWallet", category: "UNLOCK_24H", price: 75000, daily: "30,000", cycle: "4d", total: 120000, dailyRate: 30000, img: "https://images.unsplash.com/photo-1621504450181-5d356f61d307?q=80&w=400&auto=format&fit=crop" },
    { id: "p31", name: "LipaP2P", category: "UNLOCK_24H", price: 100000, daily: "40,000", cycle: "4d", total: 160000, dailyRate: 40000, img: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=400&auto=format&fit=crop" },
    { id: "p32", name: "LipaSoftPOS", category: "UNLOCK_24H", price: 150000, daily: "70,000", cycle: "4d", total: 280000, dailyRate: 70000, img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=400&auto=format&fit=crop" },
    { id: "p33", name: "LipaTerminal", category: "UNLOCK_24H", price: 250000, daily: "100,000", cycle: "4d", total: 400000, dailyRate: 100000, img: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&auto=format&fit=crop" },
    { id: "p34", name: "LipaCheckout", category: "UNLOCK_24H", price: 500000, daily: "250,000", cycle: "4d", total: 1000000, dailyRate: 250000, img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=400&auto=format&fit=crop" },
    { id: "p35", name: "LipaRegister", category: "UNLOCK_24H", price: 1000000, daily: "500,000", cycle: "4d", total: 2000000, dailyRate: 500000, img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=400&auto=format&fit=crop" },
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: bal } = await supabase.from("balances").select("available").eq("user_id", user.id).single();
      if (bal) setBalance(Number(bal.available));

      const { data: invs } = await supabase.from("investments").select("product_id").eq("user_id", user.id).eq("status", "ACTIVE");
      if (invs) setPurchasedIds(invs.map(i => i.product_id));
    };
    fetchUserData();
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
        const { data: deposits } = await supabase.from("transactions").select("amount").eq("user_id", userId).eq("type", "DEPOSIT").eq("status", "COMPLETED");
        const totalDeposited = deposits?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
        if (totalDeposited < product.price) {
          setIsProcessing(false);
          return alert(`First Purchase Rule: Your first purchase must be fully funded by approved deposits.`);
        }
      }

      // 1. Deduct Balance
      const newBalance = currentBalance - product.price;
      await supabase.from("balances").update({ available: newBalance }).eq("user_id", userId);

      // 2. Create Investment
      const { error: invError } = await supabase.from("investments").insert({
        user_id: userId,
        product_id: product.id,
        amount: product.price,
        expected_return: product.total,
        status: "ACTIVE",
        payouts_made: product.category === "DAILY_PAYOUT" ? 1 : 0 // Instant payout for daily
      });
      if (invError) throw invError;

      // 3. INSTANT PAYOUT FOR DAILY PAYOUT CATEGORY
      let finalBalance = newBalance;
      if (product.category === "DAILY_PAYOUT") {
        finalBalance = newBalance + product.dailyRate;
        
        // Credit user balance
        await supabase.from("balances").update({ available: finalBalance }).eq("user_id", userId);
        
        // Log transaction
        await supabase.from("transactions").insert({
          user_id: userId,
          type: "COMMISSION",
          amount: product.dailyRate,
          status: "COMPLETED"
        });
      }

      setBalance(finalBalance);
      setPurchasedIds([...purchasedIds, product.id]);
      
      if (product.category === "DAILY_PAYOUT") {
        alert(`Successfully purchased ${product.name}! Day 1 payout of UGX ${product.dailyRate.toLocaleString()} has been credited.`);
      } else if (product.category === "UNLOCK_24H") {
        alert(`Successfully locked ${product.name}! It will unlock and start paying after 24 hours.`);
      } else {
        alert(`Successfully purchased ${product.name}! Your returns will be credited after ${product.cycle}.`);
      }

    } catch (error: any) {
      alert("Purchase failed: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredProducts = activeTab === "ALL" ? products : products.filter(p => p.category === activeTab);

  return (
    <div className="min-h-screen bg-[#0B0C10] text-white pb-24">
      <div className="p-5 pt-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Explore</h1>
          <p className="text-xs text-gray-400 font-medium mt-1">Find your next investment</p>
        </div>
        <div className="bg-[#12141D] px-4 py-2 rounded-2xl border border-gray-800 text-right">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Balance</p>
          <p className="text-sm font-black text-[#00D2FF]">UGX {balance.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex space-x-2 px-5 py-4 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 whitespace-nowrap rounded-xl font-bold text-xs transition-all ${
              activeTab === tab.id 
                ? "bg-[#7B61FF] text-white shadow-[0_5px_15px_rgba(123,97,255,0.4)]" 
                : "bg-[#12141D] text-gray-400 border border-gray-800 hover:bg-gray-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-5 space-y-4">
        {filteredProducts.map((product) => {
          const isPurchased = purchasedIds.includes(product.id);

          let btnText = "";
          let btnClass = "bg-[#7B61FF] hover:bg-[#6a52df] text-white shadow-[0_0_15px_rgba(123,97,255,0.4)]";
          
          if (isPurchased) {
            btnClass = "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700";
            if (product.category === "LOCK") btnText = "Locked In";
            else if (product.category === "DAILY_PAYOUT") btnText = "Purchased";
            else if (product.category === "UNLOCK_24H") btnText = "Unlocked";
          } else {
            if (product.category === "LOCK") btnText = "Lock In";
            else if (product.category === "DAILY_PAYOUT") btnText = "Invest Now";
            else if (product.category === "UNLOCK_24H") btnText = "Locked";
          }

          return (
            <div key={product.id} className="bg-[#12141D] border border-gray-800 rounded-3xl overflow-hidden flex flex-row shadow-lg h-[150px]">
              <div className="w-[40%] relative h-full">
                <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#12141D]"></div>
                <div className="absolute top-3 left-3 bg-[#7B61FF] text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-lg">
                  {product.cycle} Days
                </div>
              </div>

              <div className="w-[60%] p-4 flex flex-col justify-between z-10">
                <div>
                  <h3 className="text-white font-extrabold text-[15px] leading-tight mb-1">{product.name}</h3>
                  <div className="space-y-1 mb-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Daily</span>
                      <span className="text-xs font-bold text-[#00D2FF]">UGX {product.daily}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Total</span>
                      <span className="text-xs font-bold text-white">UGX {product.total.toLocaleString()}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-base font-black text-white">UGX {product.price.toLocaleString()}</span>
                  </div>
                </div>

                <button 
                  onClick={() => handlePurchase(product)}
                  disabled={isPurchased || isProcessing}
                  className={`w-full font-bold py-2 rounded-xl text-xs transition-all ${btnClass}`}
                >
                  {isProcessing ? "Wait..." : btnText}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
