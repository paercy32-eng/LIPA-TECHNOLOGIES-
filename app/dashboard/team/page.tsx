"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function TeamPage() {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [referralCode, setReferralCode] = useState("Loading...");
  const [totalTeam, setTotalTeam] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);

  useEffect(() => {
    const fetchTeamData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user's referral code
      const { data: profile } = await supabase.from("profiles").select("referral_code").eq("id", user.id).single();
      if (profile) setReferralCode(profile.referral_code);

      // Fetch team size
      const { count: teamCount } = await supabase.from("referrals").select("*", { count: 'exact', head: true }).eq("referrer_id", user.id);
      setTotalTeam(teamCount || 0);

      // Fetch total commission
      const { data: commissions } = await supabase.from("transactions").select("amount").eq("user_id", user.id).eq("type", "COMMISSION");
      const totalComm = commissions?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
      setTotalCommission(totalComm);
    };
    fetchTeamData();
  }, []);

  const referralLink = `https://lipa-technologies.vercel.app/auth?ref=${referralCode}`;

  const copyToClipboard = (text: string, type: 'code' | 'link') => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 p-5 pb-24">
      <div className="mb-8 pt-4">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Team</h1>
        <p className="text-gray-500 text-sm mt-1">Invite friends and earn passive commissions</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-gray-100 p-5 rounded-3xl shadow-sm flex flex-col items-center justify-center">
          <div className="text-blue-500 mb-2 bg-blue-50 p-2 rounded-xl">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Total Team</p>
          <h3 className="text-3xl font-black text-gray-900">{totalTeam}</h3>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-3xl shadow-sm flex flex-col items-center justify-center">
          <div className="text-green-500 mb-2 bg-green-50 p-2 rounded-xl">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
          </div>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Total Comm.</p>
          <h3 className="text-3xl font-black text-green-600">{totalCommission.toLocaleString()}</h3>
        </div>
      </div>

      {/* Referral Link Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-3xl mb-6 shadow-lg relative overflow-hidden text-white">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 blur-2xl rounded-full"></div>
        <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
          Your Invite Link
        </h2>
        <div className="flex items-center justify-between bg-black/20 backdrop-blur-sm p-3 rounded-xl mb-3">
          <span className="font-mono text-sm font-bold tracking-wider">{referralCode}</span>
          <button onClick={() => copyToClipboard(referralCode, 'code')} className="text-xs font-bold bg-white text-blue-700 px-3 py-1.5 rounded-lg shadow-sm">
            {copiedCode ? "Copied!" : "Copy Code"}
          </button>
        </div>
        <button onClick={() => copyToClipboard(referralLink, 'link')} className="w-full bg-white text-blue-700 font-bold py-3 rounded-xl text-sm shadow-md hover:bg-gray-50 transition">
          {copiedLink ? "Link Copied!" : "Copy Invite Link"}
        </button>
      </div>

      {/* Commission Structure */}
      <h3 className="text-sm font-bold text-gray-800 mb-3 ml-1">Commission Levels</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-500 font-bold">1</div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Level 1</p>
              <p className="text-[10px] text-gray-500">Direct Invites</p>
            </div>
          </div>
          <span className="font-black text-green-600 bg-green-50 px-3 py-1 rounded-lg">20%</span>
        </div>
        <div className="flex items-center justify-between bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 font-bold">2</div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Level 2</p>
              <p className="text-[10px] text-gray-500">Friends of Friends</p>
            </div>
          </div>
          <span className="font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">2%</span>
        </div>
        <div className="flex items-center justify-between bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500 font-bold">3</div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Level 3</p>
              <p className="text-[10px] text-gray-500">Extended Network</p>
            </div>
          </div>
          <span className="font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-lg">1%</span>
        </div>
      </div>
    </div>
  );
}
