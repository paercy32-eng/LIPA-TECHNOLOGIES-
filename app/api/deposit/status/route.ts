import { NextResponse } from "next/server";
import { PesaJet } from "@pesajet/sdk";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const pesajet = new PesaJet({ apiKey: process.env.PESAJET_API_KEY! });

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");
    
    if (!reference) return NextResponse.json({ error: "Missing reference" }, { status: 400 });

    // 1. Check our database first
    const { data: tx } = await supabase.from("transactions").select("*").eq("id", reference).single();
    
    if (!tx) return NextResponse.json({ status: "NOT_FOUND" });
    if (tx.status === "COMPLETED") return NextResponse.json({ status: "COMPLETED" });

    // 2. Ask PesaJet for the live status
    const pesajetTx = await pesajet.payments.get(tx.tx_id);

    if (pesajetTx.status === "COMPLETED") {
      
      // --- THE LOCK ---
      const { data: updatedTx } = await supabase
        .from("transactions")
        .update({ status: "COMPLETED" })
        .eq("id", reference)
        .eq("status", "PENDING") // Only update if it is STILL pending
        .select();

      // If updatedTx is empty, the webhook already credited it! Abort to prevent double commission.
      if (!updatedTx || updatedTx.length === 0) {
        return NextResponse.json({ status: "COMPLETED" });
      }

      // 3. Credit balance
      const { data: bal } = await supabase.from("balances").select("available").eq("user_id", tx.user_id).single();
      if (bal) {
        await supabase.from("balances").update({ available: Number(bal.available) + Number(tx.amount) }).eq("user_id", tx.user_id);
      }

      // 4. Referral Commission
      const { count: depCount } = await supabase
        .from("transactions")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", tx.user_id)
        .eq("type", "DEPOSIT")
        .eq("status", "COMPLETED");

      if (depCount === 1) {
        const { data: buyerProfile } = await supabase.from("profiles").select("referred_by").eq("id", tx.user_id).single();
        let refId = buyerProfile?.referred_by;
        const rates = [0.20, 0.02, 0.01];

        for (let level = 1; level <= 3; level++) {
          if (!refId) break;
          const comm = Number(tx.amount) * rates[level - 1];
          const { data: refBal } = await supabase.from("balances").select("available, total_commission").eq("user_id", refId).single();
          
          if (refBal) {
            await supabase.from("balances").update({ 
              available: Number(refBal.available) + comm, 
              total_commission: Number(refBal.total_commission) + comm 
            }).eq("user_id", refId);
            
            await supabase.from("transactions").insert({ 
              user_id: refId, 
              type: "COMMISSION", 
              amount: comm, 
              status: "COMPLETED" 
            });
            
            await supabase.from("referrals").upsert({ 
              referrer_id: refId, 
              referee_id: tx.user_id, 
              level, 
              commission_earned: comm 
            }, { onConflict: 'referrer_id,referee_id' });
          }
          
          const { data: next } = await supabase.from("profiles").select("referred_by").eq("id", refId).single();
          refId = next?.referred_by;
        }
      }
      
      return NextResponse.json({ status: "COMPLETED" });
    }

    // Return PENDING, FAILED, etc. so the frontend keeps polling
    return NextResponse.json({ status: pesajetTx.status });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}