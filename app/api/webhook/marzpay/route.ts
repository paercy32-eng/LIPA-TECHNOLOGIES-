import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// We MUST use the Service Role Key here to bypass Row Level Security
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""; 
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("🔔 WEBHOOK RECEIVED:", body.event_type);

    // 1. Only process successful payments
    if (body.event_type !== "collection.completed") {
      console.log("⚠️ Ignored: Not a completed collection.");
      return NextResponse.json({ received: true }); 
    }

    const reference = body.transaction?.reference;
    const amount = Number(body.transaction?.amount?.raw);

    if (!reference || !amount) {
      console.error("❌ Invalid payload: Missing reference or amount.");
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // 2. Find the PENDING transaction
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", reference)
      .single();

    if (txError || !transaction) {
      console.error("❌ Transaction not found in DB:", reference);
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Idempotency check: if already completed, don't double-credit
    if (transaction.status === "COMPLETED") {
      console.log("✅ Transaction already completed. Ignoring duplicate webhook.");
      return NextResponse.json({ received: true });
    }

    // 3. Mark Transaction as COMPLETED
    await supabase
      .from("transactions")
      .update({ status: "COMPLETED" })
      .eq("id", reference);

    // 4. Fetch current balance and credit the depositor
    const { data: balanceData } = await supabase
      .from("balances")
      .select("available")
      .eq("user_id", transaction.user_id)
      .single();

    const currentBalance = Number(balanceData?.available || 0);
    const newBalance = currentBalance + amount;

    await supabase
      .from("balances")
      .update({ available: newBalance })
      .eq("user_id", transaction.user_id);

    console.log(`✅ Credited UGX ${amount} to user ${transaction.user_id}. New balance: ${newBalance}`);

    // --- 5. REFERRAL COMMISSION LOGIC (ONLY ON FIRST DEPOSIT) ---
    try {
      // Check if this was their very first completed deposit
      const { count: depositCount } = await supabase
        .from("transactions")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", transaction.user_id)
        .eq("type", "DEPOSIT")
        .eq("status", "COMPLETED");

      // If depositCount is 1, it means the transaction we just completed is their first!
      if (depositCount === 1) {
        console.log(`🎉 First deposit for user ${transaction.user_id}. Processing L1, L2, L3 commissions...`);
        
        const { data: buyerProfile } = await supabase.from("profiles").select("referred_by").eq("id", transaction.user_id).single();
        
        let currentReferrerId = buyerProfile?.referred_by;
        const commissionRates = [0.20, 0.02, 0.01]; // L1: 20%, L2: 2%, L3: 1%

        // Loop through Level 1, 2, and 3
        for (let level = 1; level <= 3; level++) {
          if (!currentReferrerId) break; // Stop if there is no higher level inviter

          const commissionAmount = amount * commissionRates[level - 1];

          // Fetch referrer's current balance
          const { data: refBal } = await supabase.from("balances").select("available, total_commission").eq("user_id", currentReferrerId).single();
          
          if (refBal) {
            // Credit the referrer
            await supabase.from("balances").update({ 
              available: Number(refBal.available) + commissionAmount,
              total_commission: Number(refBal.total_commission) + commissionAmount
            }).eq("user_id", currentReferrerId);

            // Log the commission transaction for the referrer
            await supabase.from("transactions").insert({
              user_id: currentReferrerId,
              type: "COMMISSION",
              amount: commissionAmount,
              status: "COMPLETED",
            });

            // Update the referrals table for tracking
            await supabase.from("referrals").upsert({
              referrer_id: currentReferrerId,
              referee_id: transaction.user_id,
              level: level,
              commission_earned: commissionAmount
            }, { onConflict: 'referrer_id,referee_id' });

            console.log(`💸 Paid Level ${level} commission (UGX ${commissionAmount}) to ${currentReferrerId}`);
          }

          // Move up the chain to find the next inviter
          const { data: nextProfile } = await supabase.from("profiles").select("referred_by").eq("id", currentReferrerId).single();
          currentReferrerId = nextProfile?.referred_by;
        }
      } else {
         console.log(`ℹ️ User has ${depositCount} deposits. Commissions only paid on first deposit.`);
      }
    } catch (refError) {
      console.error("❌ Referral logic failed:", refError);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error("❌ WEBHOOK CRASH ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
