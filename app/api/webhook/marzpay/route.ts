import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""; 
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("🔔 WEBHOOK RECEIVED:", JSON.stringify(body, null, 2));

    // 1. Check event type
    if (body.event_type !== "collection.completed") {
      console.log(`⚠️ Ignored event: ${body.event_type}`);
      return NextResponse.json({ received: true }); 
    }

    const reference = body.transaction?.reference;
    const amount = body.transaction?.amount?.raw;

    if (!reference || !amount) {
      console.error("❌ Missing reference or amount in payload");
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    console.log(`🔍 Searching for transaction: ${reference}`);

    // 2. Find the PENDING transaction
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", reference)
      .single();

    if (txError || !transaction) {
      console.error("❌ Transaction not found in DB:", txError);
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    if (transaction.status === "COMPLETED") {
      console.log("✅ Transaction already completed. Ignoring duplicate.");
      return NextResponse.json({ received: true });
    }

    console.log(`💰 Updating transaction ${reference} to COMPLETED`);

    // 3. Update Transaction to COMPLETED
    const { error: updateError } = await supabase
      .from("transactions")
      .update({ status: "COMPLETED" })
      .eq("id", reference);

    if (updateError) throw updateError;

    // 4. Fetch current balance
    const { data: balanceData, error: balFetchError } = await supabase
      .from("balances")
      .select("available")
      .eq("user_id", transaction.user_id)
      .single();

    if (balFetchError) throw balFetchError;

    const currentBalance = balanceData?.available || 0;
    const newBalance = Number(currentBalance) + Number(amount);

    console.log(`📈 Updating balance for user ${transaction.user_id} from ${currentBalance} to ${newBalance}`);

    // 5. Credit the user's balance
    const { error: balError } = await supabase
      .from("balances")
      .update({ available: newBalance })
      .eq("user_id", transaction.user_id);

    if (balError) throw balError;

    console.log(`✅ Successfully credited ${amount} UGX!`);
    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error("❌ WEBHOOK ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
