import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { amount, phone } = await req.json();

    // 1. Validation (Minimum 5000 UGX)
    if (!amount || amount < 5000) {
      return NextResponse.json({ error: "Minimum deposit is 5000 UGX" }, { status: 400 });
    }

    // 2. Format Phone Number (+256...)
    const formattedPhone = phone.startsWith("+") ? phone : `+256${phone.replace(/^0/, "")}`;

    // 3. Generate a unique reference UUID for MarzPay
    const reference = randomUUID();

    // 4. Prepare MarzPay Basic Auth (PublicKey:SecretKey)
    const authString = Buffer.from(`${process.env.MARZPAY_PUBLIC_KEY}:${process.env.MARZPAY_SECRET_KEY}`).toString("base64");

    // 5. Send Request to MarzPay
    const marzPayload = new FormData();
    marzPayload.append("amount", amount.toString());
    marzPayload.append("phone_number", formattedPhone);
    marzPayload.append("country", "UG");
    marzPayload.append("reference", reference);
    marzPayload.append("description", "LIPA Wallet Deposit");
    marzPayload.append("callback_url", `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhook/marzpay`);

    const response = await fetch("https://wallet.wearemarz.com/api/v1/collect-money", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${authString}`,
      },
      body: marzPayload,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.message || "MarzPay error" }, { status: 400 });
    }

    // 6. Save PENDING transaction to Supabase using the reference as the ID
    const { error: dbError } = await supabase.from("transactions").insert({
      id: reference, // We use the UUID as the transaction ID so the webhook can find it
      user_id: (await supabase.auth.getUser()).data.user?.id,
      type: "DEPOSIT",
      amount: Number(amount),
      status: "PENDING",
    });

    if (dbError) {
       return NextResponse.json({ error: "Database error: " + dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "USSD Prompt sent!" });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
