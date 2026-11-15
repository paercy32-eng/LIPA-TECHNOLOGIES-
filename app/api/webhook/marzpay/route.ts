import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
// We MUST use the Service Role key here to bypass Row Level Security
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""; 
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Webhook received:", body.event_type);

    // 1. Check if the payment was successful
    if (body.event_type !== "collection.completed") {
      return NextResponse.json({ received: true }); // Ignore failed/pending
    }

    const reference = body.transaction.reference;
    const amount = body.transaction.amount.raw;

    // 2. Find the PENDING transaction in our database
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", reference)
      .single();

    if (txError || !transaction) {
      console.error("Transaction not found:", reference);
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // 3. Idempotency Check (Prevent double crediting if webhook is sent twice)
    if (transaction.status === "COMPLETED") {
      return NextResponse.json({ received: true });
    }

    // 4. Update Transaction to COMPLETED
    await supabase
      .from("transactions")
      .update({ status: "COMPLETED" })
      .eq("id", reference);

    // 5. Fetch current balance and add the deposit
    const { data: balanceData } = await supabase
      .from("balances")
      .select("available")
      .eq("user_id", transaction.user_id)
      .single();

    const currentBalance = balanceData?.available || 0;
    const newBalance = Number(currentBalance) + Number(amount);

    // 6. Credit the user's balance
    const { error: balError } = await supabase
      .from("balances")
      .update({ available: newBalance })
      .eq("user_id", transaction.user_id);

    if (balError) {
      console.error("Failed to update balance:", balError);
      return NextResponse.json({ error: "Balance update failed" }, { status: 500 });
    }

    console.log(`✅ Credited ${amount} UGX to user ${transaction.user_id}. New balance: ${newBalance}`);
    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
