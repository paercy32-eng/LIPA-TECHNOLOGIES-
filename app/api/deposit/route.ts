import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    // We now accept userId from the frontend
    const { amount, phone, userId } = await req.json();

    if (!amount || amount < 5000) {
      return NextResponse.json({ error: "Minimum deposit is 5000 UGX" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const formattedPhone = phone.startsWith("+") ? phone : `+256${phone.replace(/^0/, "")}`;
    const reference = randomUUID();
    const authString = Buffer.from(`${process.env.MARZPAY_PUBLIC_KEY}:${process.env.MARZPAY_SECRET_KEY}`).toString("base64");

    const marzPayload = new FormData();
    marzPayload.append("amount", amount.toString());
    marzPayload.append("phone_number", formattedPhone);
    marzPayload.append("country", "UG");
    marzPayload.append("reference", reference);
    marzPayload.append("description", "LIPA Wallet Deposit");
    marzPayload.append("callback_url", `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhook/marzpay`);

    const response = await fetch("https://wallet.wearemarz.com/api/v1/collect-money", {
      method: "POST",
      headers: { "Authorization": `Basic ${authString}` },
      body: marzPayload,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.message || "MarzPay error" }, { status: 400 });
    }

    // Save PENDING transaction using the userId passed from frontend
    const { error: dbError } = await supabase.from("transactions").insert({
      id: reference, 
      user_id: userId, 
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
