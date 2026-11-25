import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""; 
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("🔔 TAVUPAY WEBHOOK:", body);

    // TavuPay sends type: "deposit" and status: "successful" or "failed"
    if (body.type !== "deposit" || body.status !== "successful") {
      return NextResponse.json({ received: true });
    }

    const reference = body.reference; // This is the idempotencyKey we sent
    const amount = Number(body.amount);

    // 1. Find the transaction
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", reference)
      .single();

    if (txError || !transaction || transaction.status === "COMPLETED") {
      return NextResponse.json({ received: true });
    }

    // 2. Mark as COMPLETED
    await supabase.from("transactions").update({ status: "COMPLETED" }).eq("id", reference);

    // 3. Credit the user's balance (base amount, not the fee)
    const { data: balanceData } = await supabase.from("balances").select("available").eq("user_id", transaction.user_id).single();
    const newBalance = Number(balanceData?.available || 0) + Number(transaction.amount);
    
    await supabase.from("balances").update({ available: newBalance }).eq("user_id", transaction.user_id);

    // 4. Process First Deposit Referral Commissions
    const { count: depositCount } = await supabase
      .from("transactions")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", transaction.user_id)
      .eq("type", "DEPOSIT")
      .eq("status", "COMPLETED");

    if (depositCount === 1) {
      const { data: buyerProfile } = await supabase.from("profiles").select("referred_by").eq("id", transaction.user_id).single();
      let currentReferrerId = buyerProfile?.referred_by;
      const commissionRates = [0.20, 0.02, 0.01];

      for (let level = 1; level <= 3; level++) {
        if (!currentReferrerId) break;
        const commissionAmount = Number(transaction.amount) * commissionRates[level - 1];
        
        const { data: refBal } = await supabase.from("balances").select("available, total_commission").eq("user_id", currentReferrerId).single();
        if (refBal) {
          await supabase.from("balances").update({ 
            available: Number(refBal.available) + commissionAmount,
            total_commission: Number(refBal.total_commission) + commissionAmount
          }).eq("user_id", currentReferrerId);

          await supabase.from("transactions").insert({ user_id: currentReferrerId, type: "COMMISSION", amount: commissionAmount, status: "COMPLETED" });
          await supabase.from("referrals").upsert({ referrer_id: currentReferrerId, referee_id: transaction.user_id, level: level, commission_earned: commissionAmount }, { onConflict: 'referrer_id,referee_id' });
        }
        const { data: nextProfile } = await supabase.from("profiles").select("referred_by").eq("id", currentReferrerId).single();
        currentReferrerId = nextProfile?.referred_by;
      }
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error("Webhook error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
    }
