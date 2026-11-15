import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""; 
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("🔔 WEBHOOK RECEIVED:", body.event_type);

    if (body.event_type !== "collection.completed") {
      return NextResponse.json({ received: true }); 
    }

    const reference = body.transaction?.reference;
    const amount = body.transaction?.amount?.raw;

    if (!reference || !amount) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

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

    // 3. Credit the user's balance
    const { data: balanceData } = await supabase.from("balances").select("available").eq("user_id", transaction.user_id).single();
    const newBalance = Number(balanceData?.available || 0) + Number(amount);
    await supabase.from("balances").update({ available: newBalance }).eq("user_id", transaction.user_id);

    console.log(`✅ Credited ${amount} UGX to user ${transaction.user_id}`);

    // --- NEW: REFERRAL COMMISSION LOGIC (ONLY ON FIRST DEPOSIT) ---
    try {
      // Check if this was their first completed deposit
      const { count: depositCount } = await supabase
        .from("transactions")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", transaction.user_id)
        .eq("type", "DEPOSIT")
        .eq("status", "COMPLETED");

      if (depositCount === 1) {
        // It's their first deposit! Find their referrer.
        const { data: profile } = await supabase.from("profiles").select("referred_by").eq("id", transaction.user_id).single();
        
        if (profile && profile.referred_by) {
          const referrerId = profile.referred_by;
          const commissionAmount = Number(amount) * 0.20; // 20% of their FIRST DEPOSIT

          // Credit Referrer
          const { data: refBal } = await supabase.from("balances").select("available, total_commission").eq("user_id", referrerId).single();
          if (refBal) {
            await supabase.from("balances").update({ 
              available: Number(refBal.available) + commissionAmount,
              total_commission: Number(refBal.total_commission) + commissionAmount
            }).eq("user_id", referrerId);

            // Log for referrer
            await supabase.from("transactions").insert({
              user_id: referrerId,
              type: "COMMISSION",
              amount: commissionAmount,
              status: "COMPLETED",
            });

            // Update referrals table
            await supabase.from("referrals").insert({
              referrer_id: referrerId,
              referee_id: transaction.user_id,
              level: 1,
              commission_earned: commissionAmount
            });
            console.log(`💸 Paid ${commissionAmount} referral commission to ${referrerId}`);
          }
        }
      }
    } catch (refError) {
      console.error("Referral logic failed:", refError);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error("Webhook error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
