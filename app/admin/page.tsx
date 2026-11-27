"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function AdminPanel() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("OVERVIEW");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState(""); // NEW: Search State
  
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalDeposited: 0, totalInvested: 0 });

  // Edit Product State
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editDaily, setEditDaily] = useState("");

  // View Referrals State
  const [viewingReferralsFor, setViewingReferralsFor] = useState<string | null>(null);
  const [userReferrals, setUserReferrals] = useState<any[]>([]);
  const [isFetchingRefs, setIsFetchingRefs] = useState(false);

  // Grant Product State
  const [grantingUser, setGrantingUser] = useState<any>(null);
  const [grantProductId, setGrantProductId] = useState("");
  const [grantedIds, setGrantedIds] = useState<string[]>([]);
  const [isGranting, setIsGranting] = useState(false);

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsLoading(false); return; }
      const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
      if (profile?.is_admin) {
        setIsAdmin(true);
        await fetchAllData();
      }
      setIsLoading(false);
    };
    checkAdminAndFetch();
  }, []);

  const fetchAllData = async () => {
    // FETCH USERS WITH BALANCES AND ACTIVE INVESTMENTS
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*, balances(available), investments(status)")
      .order("created_at", { ascending: false });
    if (profiles) setUsers(profiles);

    const { data: dep } = await supabase.from("transactions").select("*, profiles(phone)").eq("type", "DEPOSIT").eq("status", "PENDING").order("created_at", { ascending: false });
    if (dep) setDeposits(dep);

    const { data: txs } = await supabase.from("transactions").select("*, profiles(phone, full_name, bound_number)").eq("type", "WITHDRAWAL").eq("status", "PENDING").order("created_at", { ascending: false });
    if (txs) setWithdrawals(txs);

    const { data: prods } = await supabase.from("products").select("*").order("min_amount", { ascending: true });
    if (prods) setProducts(prods);

    const { count: userCount } = await supabase.from("profiles").select("*", { count: 'exact', head: true });
    const { data: deps } = await supabase.from("transactions").select("amount").eq("type", "DEPOSIT").eq("status", "COMPLETED");
    const { data: investments } = await supabase.from("investments").select("amount").eq("status", "ACTIVE");

    setStats({
      totalUsers: userCount || 0,
      totalDeposited: deps?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0,
      totalInvested: investments?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0
    });
  };

  const handleViewReferrals = async (userId: string) => {
    setViewingReferralsFor(userId);
    setIsFetchingRefs(true);
    setUserReferrals([]);

    const { data: refs } = await supabase.from("referrals").select("referee_id, level").eq("referrer_id", userId);

    if (refs && refs.length > 0) {
      const ids = refs.map(r => r.referee_id);
      const { data: profiles } = await supabase.from("profiles").select("id, phone, display_name").in("id", ids);
      
      // UPDATED: Check for COMPLETED DEPOSITS instead of just active products
      const { data: userDeposits } = await supabase
        .from("transactions")
        .select("user_id")
        .in("user_id", ids)
        .eq("type", "DEPOSIT")
        .eq("status", "COMPLETED");

      const activeUserIds = userDeposits?.map(d => d.user_id) || [];

      const merged = refs.map(r => {
        const p = profiles?.find(prof => prof.id === r.referee_id);
        return {
          id: r.referee_id,
          name: p?.display_name || p?.phone || "Unknown",
          phone: p?.phone || "N/A",
          level: r.level,
          isActive: activeUserIds.includes(r.referee_id) // Active means they deposited
        };
      }).sort((a, b) => a.level - b.level);

      setUserReferrals(merged);
    }
    setIsFetchingRefs(false);
  };

  const handleAdjustBalance = async (userId: string, currentBalance: number) => {
    const newBalanceStr = prompt("Enter new balance (UGX):", currentBalance.toString());
    if (newBalanceStr === null) return;

    const newBalance = Number(newBalanceStr);
    const difference = newBalance - currentBalance;

    await supabase.from("balances").update({ available: newBalance }).eq("user_id", userId);

    if (difference !== 0) {
      await supabase.from("transactions").insert({
        user_id: userId, type: "ADMIN_ADJUSTMENT", amount: Math.abs(difference), status: "COMPLETED"
      });
    }
    fetchAllData();
  };

  const handleBanUser = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "BANNED" ? "ACTIVE" : "BANNED";
    await supabase.from("profiles").update({ status: newStatus }).eq("id", userId);
    fetchAllData();
  };

  const openGrantProduct = async (user: any) => {
    setGrantingUser(user);
    setGrantProductId("");
    setGrantedIds([]);

    const { data: invs } = await supabase
      .from("investments")
      .select("product_id")
      .eq("user_id", user.id)
      .eq("status", "ACTIVE");
    setGrantedIds(invs?.map(i => i.product_id) || []);
  };

  const handleGrantProduct = async () => {
    if (!grantingUser || !grantProductId) {
      alert("Please select a product first.");
      return;
    }
    const product = products.find(p => p.id === grantProductId);
    if (!product) return;

    if (grantedIds.includes(product.id)) {
      alert("This user already has this product active.");
      return;
    }

    if (!confirm(`Grant ${product.name} to ${grantingUser.phone}? No money will be deducted from the user.`)) return;

    setIsGranting(true);
    try {
      const { error } = await supabase.from("investments").insert({
        user_id: grantingUser.id,
        product_id: product.id,
        amount: product.min_amount,
        expected_return: Number(product.daily_payout) * Number(product.duration_days),
        status: "ACTIVE",
        payouts_made: 0
      });

      if (error) throw error;

      alert(`${product.name} granted to ${grantingUser.phone}!`);
      setGrantingUser(null);
      setGrantProductId("");
      await fetchAllData();
    } catch (err: any) {
      console.error("Grant product error:", err);
      alert("Failed to grant product: " + err.message);
    } finally {
      setIsGranting(false);
    }
  };

  const handleApproveDeposit = async (txId: string, userId: string, amount: number) => {
    if (!confirm("Approve this deposit?")) return;
    try {
      await supabase.from("transactions").update({ status: "COMPLETED" }).eq("id", txId);
      const { data: bal } = await supabase.from("balances").select("available").eq("user_id", userId).single();
      if (bal) await supabase.from("balances").update({ available: Number(bal.available) + amount }).eq("user_id", userId);

      const { count: depositCount } = await supabase.from("transactions").select("*", { count: 'exact', head: true }).eq("user_id", userId).eq("type", "DEPOSIT").eq("status", "COMPLETED");
      if (depositCount === 1) {
        const { data: buyerProfile } = await supabase.from("profiles").select("referred_by").eq("id", userId).single();
        let currentReferrerId = buyerProfile?.referred_by;
        const commissionRates = [0.20, 0.02, 0.01];
        for (let level = 1; level <= 3; level++) {
          if (!currentReferrerId) break;
          const commissionAmount = amount * commissionRates[level - 1];
          const { data: refBal } = await supabase.from("balances").select("available, total_commission").eq("user_id", currentReferrerId).single();
          if (refBal) {
            await supabase.from("balances").update({ available: Number(refBal.available) + commissionAmount, total_commission: Number(refBal.total_commission) + commissionAmount }).eq("user_id", currentReferrerId);
            await supabase.from("transactions").insert({ user_id: currentReferrerId, type: "COMMISSION", amount: commissionAmount, status: "COMPLETED" });
          }
          const { data: nextProfile } = await supabase.from("profiles").select("referred_by").eq("id", currentReferrerId).single();
          currentReferrerId = nextProfile?.referred_by;
        }
      }
      alert("Approved!"); fetchAllData();
    } catch (err: any) { alert("Error: " + err.message); }
  };

  const handleRejectDeposit = async (txId: string) => {
    if (!confirm("Reject this deposit?")) return;
    await supabase.from("transactions").update({ status: "FAILED" }).eq("id", txId);
    fetchAllData();
  };

  const handleApproveWithdrawal = async (txId: string) => {
    if (!confirm("Approve this withdrawal?")) return;
    await supabase.from("transactions").update({ status: "COMPLETED" }).eq("id", txId);
    fetchAllData();
  };

  const handleRejectWithdrawal = async (txId: string, userId: string, amount: number) => {
    if (!confirm("Reject and refund?")) return;
    await supabase.from("transactions").update({ status: "REJECTED" }).eq("id", txId);
    const { data: bal } = await supabase.from("balances").select("available").eq("user_id", userId).single();
    if (bal) await supabase.from("balances").update({ available: Number(bal.available) + Number(amount) }).eq("user_id", userId);
    fetchAllData();
  };

  const openEditProduct = (prod: any) => {
    setEditingProduct(prod);
    setEditPrice(prod.min_amount.toString());
    setEditDaily(prod.daily_payout.toString());
  };

  const saveProductEdit = async () => {
    if (!editingProduct) return;

    const price = Number(editPrice);
    const daily = Number(editDaily);

    if (!Number.isFinite(price) || price <= 0 ||
        !Number.isFinite(daily) || daily <= 0) {
      alert("Please enter valid product values.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("products")
        .update({
          min_amount: price,
          max_amount: price,
          daily_payout: daily
        })
        .eq("id", editingProduct.id)
        .select()
        .single();

      if (error) throw error;

      if (!data) throw new Error("Product was not found or was not updated.");

      setProducts(prev => prev.map(p => p.id === data.id ? data : p));
      setEditingProduct(null);
      await fetchAllData();
      alert("Product successfully updated!");

    } catch (err: any) {
      console.error("Product update error:", err);
      alert("Failed to update product: " + err.message);
    }
  };

  // Filter Users based on search query
  const filteredUsers = users.filter(u => 
    u.phone.includes(searchQuery) || 
    (u.full_name && u.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Verifying Admin...</div>;
  if (!isAdmin) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Access Denied</div>;

  return (
    <div className="min-h-screen bg-[#f0f9ff] text-gray-900 pb-10">
      <div className="bg-white p-5 border-b border-gray-100 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <h1 className="text-xl font-extrabold text-red-600 tracking-tight">ADMIN PANEL</h1>
        <button onClick={() => router.push("/dashboard/home")} className="text-xs bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 font-bold">Exit</button>
      </div>

      <div className="flex space-x-2 p-4 overflow-x-auto">
        {["OVERVIEW", "USERS", "DEPOSITS", "WITHDRAWALS", "PRODUCTS"].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === tab ? "bg-blue-600 text-white" : "bg-white text-gray-500 border border-gray-200"}`}>{tab}</button>
        ))}
      </div>

      <div className="p-4 space-y-4">
        {activeTab === "OVERVIEW" && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm"><p className="text-gray-400 text-xs font-bold uppercase">Total Users</p><h2 className="text-3xl font-black">{stats.totalUsers}</h2></div>
            <div className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm"><p className="text-green-500 text-xs font-bold uppercase">Total Deposited</p><h2 className="text-3xl font-black">UGX {stats.totalDeposited.toLocaleString()}</h2></div>
            <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm"><p className="text-blue-500 text-xs font-bold uppercase">Total Invested</p><h2 className="text-3xl font-black">UGX {stats.totalInvested.toLocaleString()}</h2></div>
          </div>
        )}

        {activeTab === "USERS" && (
          <div className="space-y-3">
            {/* SEARCH BAR */}
            <div className="relative mb-2">
              <input 
                type="text" 
                placeholder="Search by phone or name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-10 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-blue-500 shadow-sm"
              />
              <svg className="absolute left-3 top-3.5 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>

            {filteredUsers.map((user) => {
              const userBalance = Number(user.balances?.available ?? user.balances?.[0]?.available ?? 0);
              // Check if they have ANY active investment
              const hasActiveProduct = user.investments?.some((inv: any) => inv.status === "ACTIVE");
              
              return (
                <div key={user.id} className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-gray-900">{user.phone}</p>
                      <p className="text-[10px] text-gray-500">Name: {user.full_name || "Not bound"}</p>
                    </div>
                    
                    {/* UPDATED BADGE LOGIC: Only show if hasActiveProduct, unless banned */}
                    {user.status === 'BANNED' ? (
                       <span className="text-[10px] px-2 py-1 rounded-md font-bold bg-red-50 text-red-600">BANNED</span>
                    ) : hasActiveProduct ? (
                       <span className="text-[10px] px-2 py-1 rounded-md font-bold bg-green-50 text-green-600">ACTIVE</span>
                    ) : null}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl mb-4 flex justify-between items-center">
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Balance</p>
                    <p className="text-sm font-black text-gray-900">UGX {userBalance.toLocaleString()}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => handleAdjustBalance(user.id, userBalance)} className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg border border-blue-100 font-bold">Adjust Balance</button>
                    <button onClick={() => openGrantProduct(user)} className="text-[10px] bg-green-50 text-green-600 px-3 py-1.5 rounded-lg border border-green-100 font-bold">Grant Product</button>
                    <button onClick={() => handleViewReferrals(user.id)} className="text-[10px] bg-cyan-50 text-cyan-600 px-3 py-1.5 rounded-lg border border-cyan-100 font-bold">View Referrals</button>
                    <button onClick={() => handleBanUser(user.id, user.status || 'ACTIVE')} className="text-[10px] bg-red-50 text-red-600 px-3 py-1.5 rounded-lg border border-red-100 font-bold">{user.status === 'BANNED' ? 'Unban User' : 'Ban User'}</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "DEPOSITS" && (
          <div className="space-y-3">
            {deposits.map((d) => (
              <div key={d.id} className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-bold text-gray-900">{d.profiles?.phone}</p>
                  <h3 className="text-lg font-black text-green-600">UGX {Number(d.amount).toLocaleString()}</h3>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl mb-4">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Paid from: <span className="text-gray-900 text-xs font-black">{d.payment_phone || "N/A"}</span></p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase">TxID: <span className="text-blue-600 text-xs font-black">{d.tx_id || "PesaJet Auto"}</span></p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApproveDeposit(d.id, d.user_id, d.amount)} className="flex-1 bg-green-600 text-white font-bold py-2 rounded-xl text-sm">Approve</button>
                  <button onClick={() => handleRejectDeposit(d.id)} className="flex-1 bg-red-50 text-red-600 font-bold py-2 rounded-xl text-sm border border-red-100">Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "WITHDRAWALS" && (
          <div className="space-y-3">
            {withdrawals.map((w) => (
              <div key={w.id} className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="font-bold text-gray-900">{w.profiles?.full_name || w.profiles?.phone}</p>
                    <p className="text-xs text-cyan-600">{w.profiles?.bound_number}</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-lg font-black text-red-500">UGX {Number(w.amount).toLocaleString()}</h3>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => handleApproveWithdrawal(w.id)} className="flex-1 bg-green-600 text-white font-bold py-2 rounded-xl text-sm">Mark Paid</button>
                  <button onClick={() => handleRejectWithdrawal(w.id, w.user_id, w.amount)} className="flex-1 bg-red-50 text-red-600 font-bold py-2 rounded-xl text-sm border border-red-100">Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "PRODUCTS" && (
          <div className="space-y-3">
            {products.map((p) => (
              <div key={p.id} className="bg-white border border-gray-100 p-4 rounded-2xl flex justify-between items-center shadow-sm">
                <div>
                  <p className="font-bold text-gray-900">{p.name}</p>
                  <p className="text-[10px] text-gray-500">Price: UGX {Number(p.min_amount).toLocaleString()} | Daily: UGX {Number(p.daily_payout).toLocaleString()}</p>
                </div>
                <button onClick={() => openEditProduct(p)} className="text-[10px] bg-blue-50 text-blue-600 px-3 py-2 rounded-lg border border-blue-100 font-bold">Edit</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Edit {editingProduct.name}</h3>
            <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1">Product Price (UGX)</label>
            <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-bold mb-4" />
            <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1">Daily Payout (UGX)</label>
            <input type="number" value={editDaily} onChange={(e) => setEditDaily(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-bold mb-6" />
            <button onClick={saveProductEdit} className="w-full font-bold py-4 rounded-xl text-white bg-blue-600">Save Changes</button>
          </div>
        </div>
      )}

      {/* GRANT PRODUCT MODAL */}
      {grantingUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-xl font-bold text-gray-900">Grant Product</h3>
              <button onClick={() => setGrantingUser(null)} className="text-gray-400 hover:text-gray-900 text-xl">✕</button>
            </div>
            <p className="text-xs text-gray-500 mb-4">To: <span className="font-bold text-gray-900">{grantingUser.phone}</span></p>

            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
              {products.map((p) => {
                const alreadyHas = grantedIds.includes(p.id);
                const selected = grantProductId === p.id;
                return (
                  <button
                    key={p.id}
                    disabled={alreadyHas}
                    onClick={() => setGrantProductId(p.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      alreadyHas
                        ? "bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed"
                        : selected
                        ? "bg-blue-50 border-blue-500"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-sm text-gray-900">{p.name}</p>
                      {alreadyHas && <span className="text-[9px] font-bold text-green-600 uppercase">Already active</span>}
                    </div>
                    <p className="text-[10px] text-gray-500">
                      Price: UGX {Number(p.min_amount).toLocaleString()} | Daily: UGX {Number(p.daily_payout).toLocaleString()}
                    </p>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleGrantProduct}
              disabled={isGranting || !grantProductId}
              className="w-full font-bold py-4 rounded-xl text-white bg-green-600 disabled:opacity-50"
            >
              {isGranting ? "Granting..." : "Grant Product"}
            </button>
          </div>
        </div>
      )}

      {/* VIEW REFERRALS MODAL */}
      {viewingReferralsFor && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl h-[70vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">User's Referrals</h3>
              <button onClick={() => setViewingReferralsFor(null)} className="text-gray-400 hover:text-gray-900 text-xl">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {isFetchingRefs ? (
                <div className="text-center text-gray-500 mt-10">Loading...</div>
              ) : userReferrals.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">This user has no referrals yet.</div>
              ) : (
                userReferrals.map((ref, idx) => (
                  <div key={idx} className="bg-gray-50 border border-gray-100 p-3 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{ref.name}</p>
                      <p className="text-[10px] text-gray-500">{ref.phone}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-blue-600 block mb-1">Level {ref.level}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${ref.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                        {ref.isActive ? "Active (Deposited)" : "Inactive"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}