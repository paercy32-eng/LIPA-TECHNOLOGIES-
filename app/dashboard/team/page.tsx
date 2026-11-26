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

  // View Team State
  const [isViewTeamOpen, setIsViewTeamOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);
  const [activeTeamTab, setActiveTeamTab] = useState(1); // 1, 2, or 3

  useEffect(() => {
    const fetchTeamData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from("profiles").select("referral_code").eq("id", user.id).single();
      if (profile) setReferralCode(profile.referral_code);

      // Count total team
      const { count: teamCount } = await supabase.from("referrals").select("*", { count: 'exact', head: true }).eq("referrer_id", user.id);
      setTotalTeam(teamCount || 0);

      // Calculate total commission
      const { data: commissions } = await supabase.from("transactions").select("amount").eq("user_id", user.id).eq("type", "COMMISSION");
      const totalComm = commissions?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
      setTotalCommission(totalComm);
    };
    fetchTeamData();
  }, []);

  const fetchTeamMembers = async () => {
    setIsLoadingTeam(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Fetch all referrals for this user
    const { data: referrals } = await supabase
      .from("referrals")
      .select("level, referee_id")
      .eq("referrer_id", user.id);

    if (!referrals || referrals.length === 0) {
      setTeamMembers([]);
      setIsLoadingTeam(false);
      return;
    }

    const refereeIds = referrals.map(r => r.referee_id);

    // 2. Fetch profiles for these referees
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, phone")
      .in("id", refereeIds);

    // 3. Fetch active investments for these referees to determine "Active" status
    const { data: activeInvs } = await supabase
      .from("investments")
      .select("user_id")
      .in("user_id", refereeIds)
      .eq("status", "ACTIVE");

    const activeUserIds = activeInvs?.map(inv => inv.user_id) || [];

    // 4. Merge data with fallback logic
    const mergedData = referrals.map(ref => {
      const profile = profiles?.find(p => p.id === ref.referee_id);
      
      const displayName = profile?.display_name || profile?.phone || "Unknown User";
      const phone = profile?.phone || "N/A";

      return {
        id: ref.referee_id,
        level: ref.level,
        name: displayName,
        phone: phone,
        isActive: activeUserIds.includes(ref.referee_id)
      };
    });

    setTeamMembers(mergedData);
    setIsLoadingTeam(false);
  };

  const handleOpenViewTeam = () => {
    setIsViewTeamOpen(true);
    fetchTeamMembers();
  };

  const referralLink = `https://aurua.shop/?ref=${referralCode}`;

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

  const filteredMembers = teamMembers.filter(m => m.level === activeTeamTab);

  return (
    <div className="min-h-screen bg-[#f0f9ff] text-gray-900 p-5 pb-24">
      <div className="mb-8 pt-4">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Team</h1>
        <p className="text-gray-500 text-sm mt-1">Invite friends and earn passive commissions</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white border border-gray-100 p-5 rounded-3xl shadow-sm flex flex-col items-center justify-center">
          <div className="text-blue-600 mb-2 bg-blue-50 p-2 rounded-xl">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Total Team</p>
          <h3 className="text-3xl font-black text-gray-900">{totalTeam}</h3>
        </div>
        <div className="bg-white border border-gray-100 p-5 rounded-3xl shadow-sm flex flex-col items-center justify-center">
          <div className="text-cyan-500 mb-2 bg-cyan-50 p-2 rounded-xl">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
          </div>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Total Comm.</p>
          <h3 className="text-3xl font-black text-cyan-600">{totalCommission.toLocaleString()}</h3>
        </div>
      </div>

      {/* View Team Button */}
      <button 
        onClick={handleOpenViewTeam}
        className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 font-bold py-3.5 rounded-2xl transition flex items-center justify-center gap-2 mb-6 shadow-sm"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        View My Referrals
      </button>

      {/* Referral Link Card */}
      <div className="bg-white border border-blue-100 p-6 rounded-3xl mb-6 shadow-sm relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 blur-2xl rounded-full"></div>
        <h2 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
          Your Invite Link
        </h2>
        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl mb-3 border border-gray-100">
          <span className="font-mono text-sm font-bold tracking-wider text-blue-700">{referralCode}</span>
          <button onClick={() => copyToClipboard(referralCode, 'code')} className="text-xs font-bold bg-blue-600 text-white px-3 py-1.5 rounded-lg shadow-md">
            {copiedCode ? "Copied!" : "Copy Code"}
          </button>
        </div>
        <button onClick={() => copyToClipboard(referralLink, 'link')} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl text-sm shadow-[0_5px_15px_rgba(37,99,235,0.2)] hover:bg-blue-700 transition">
          {copiedLink ? "Link Copied!" : "Copy Invite Link"}
        </button>
      </div>

      {/* Commission Structure */}
      <h3 className="text-sm font-bold text-gray-900 mb-3 ml-1">Commission Levels</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold">1</div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Level 1</p>
              <p className="text-[10px] text-gray-500">Direct Invites</p>
            </div>
          </div>
          <span className="font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">20%</span>
        </div>
        <div className="flex items-center justify-between bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center text-cyan-600 font-bold">2</div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Level 2</p>
              <p className="text-[10px] text-gray-500">Friends of Friends</p>
            </div>
          </div>
          <span className="font-black text-cyan-600 bg-cyan-50 px-3 py-1 rounded-lg">2%</span>
        </div>
        <div className="flex items-center justify-between bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 font-bold">3</div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Level 3</p>
              <p className="text-[10px] text-gray-500">Extended Network</p>
            </div>
          </div>
          <span className="font-black text-green-600 bg-green-50 px-3 py-1 rounded-lg">1%</span>
        </div>
      </div>

      {/* --- VIEW TEAM MODAL --- */}
      {isViewTeamOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl h-[80vh] flex flex-col">
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">My Referrals</h3>
              <button onClick={() => setIsViewTeamOpen(false)} className="text-gray-400 hover:text-gray-900">✕</button>
            </div>

            {/* Level Tabs */}
            <div className="flex space-x-2 mb-4">
              {[1, 2, 3].map((level) => (
                <button
                  key={level}
                  onClick={() => setActiveTeamTab(level)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTeamTab === level ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "bg-gray-50 text-gray-500 border border-gray-100"
                  }`}
                >
                  Level {level}
                </button>
              ))}
            </div>

            {/* Team List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {isLoadingTeam ? (
                <div className="text-center text-gray-500 mt-10">Loading referrals...</div>
              ) : filteredMembers.length === 0 ? (
                <div className="text-center text-gray-500 mt-10 text-sm">No referrals at Level {activeTeamTab} yet.</div>
              ) : (
                filteredMembers.map((member) => (
                  <div key={member.id} className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{member.name}</p>
                      {member.name !== member.phone && member.phone !== "N/A" && (
                        <p className="text-[10px] text-gray-500">{member.phone}</p>
                      )}
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider ${member.isActive ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-200 text-gray-500 border border-gray-300'}`}>
                      {member.isActive ? "Active" : "Inactive"}
                    </span>
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
