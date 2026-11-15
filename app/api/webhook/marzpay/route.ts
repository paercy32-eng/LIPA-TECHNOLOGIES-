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

    // --- MULTI-LEVEL REFERRAL COMMISSION (ONLY ON FIRST DEPOSIT) ---
    try {
      // Check if this was their first completed deposit
      const { count: depositCount } = await supabase
        .from("transactions")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", transaction.user_id)
        .eq("type", "DEPOSIT")
        .eq("status", "COMPLETED");

      if (depositCount === 1) {
        console.log(`🎉 First deposit for user ${transaction.user_id}. Processing commissions...`);
        
        // Get the profile of the user who just deposited
        const { data: buyerProfile } = await supabase.from("profiles").select("referred_by").eq("id", transaction.user_id).single();
        
        let currentReferrerId = buyerProfile?.referred_by;
        const commissionRates = [0.20, 0.02, 0.01]; // L1: 20%, L2: 2%, L3: 1%

        // Loop through Level 1, 2, and 3
        for (let level = 1; level <= 3; level++) {
          if (!currentReferrerId) break; // Stop if there is no higher level

          const commissionAmount = Number(amount) * commissionRates[level - 1];

          // Credit the referrer's balance
          const { data: refBal } = await supabase.from("balances").select("available, total_commission").eq("user_id", currentReferrerId).single();
          
          if (refBal) {
            await supabase.from("balances").update({ 
              available: Number(refBal.available) + commissionAmount,
              total_commission: Number(refBal.total_commission) + commissionAmount
            }).eq("user_id", currentReferrerId);

            // Log the transaction for the referrer
            await supabase.from("transactions").insert({
              user_id: currentReferrerId,
              type: "COMMISSION",
              amount: commissionAmount,
              status: "COMPLETED",
            });

            // Update the referrals table (if it doesn't exist, create it)
            await supabase.from("referrals").upsert({
              referrer_id: currentReferrerId,
              referee_id: transaction.user_id,
              level: level,
              commission_earned: commissionAmount
            }, { onConflict: 'referrer_id,referee_id' });

            console.log(`💸 Paid Level ${level} commission (${commissionAmount} UGX) to ${currentReferrerId}`);
          }

          // Move up the chain to find the Level 2 and Level 3 inviters
          const { data: nextProfile } = await supabase.from("profiles").select("referred_by").eq("id", currentReferrerId).single();
          currentReferrerId = nextProfile?.referred_by;
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
