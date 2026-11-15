import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// We must use the SERVICE ROLE key here because this runs in the background without a logged-in user
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
// Note: For now, we use the anon key. If RLS blocks it, we will need the Service Role key later.
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""; 
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Check if the payment was successful
    if (body.event_type !== "collection.completed") {
      return NextResponse.json({ received: true }); // Ignore failed payments
    }

    const reference = body.transaction.reference;
    const amount = body.transaction.amount.raw;
    const status = body.transaction.status;

    // 2. Find the PENDING transaction in our database
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .select("*, balances(user_id)")
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
    const currentBalance = transaction.balances?.[0]?.available || 0;
    const newBalance = Number(currentBalance) + Number(amount);

    await supabase
      .from("balances")
      .update({ available: newBalance })
      .eq("user_id", transaction.user_id);

    console.log(`✅ Credited ${amount} UGX to user ${transaction.user_id}`);

    // 6. Return 200 OK to MarzPay
    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
