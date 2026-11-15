import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
// Use the SERVICE ROLE KEY here to bypass RLS for server-side inserts
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const { amount, phone, userId } = await req.json();

    if (!amount || amount < 500) {
      return NextResponse.json({ error: "Minimum deposit is 500 UGX" }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    // Format Phone
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '256' + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('256')) {
      cleanPhone = '256' + cleanPhone;
    }
    const formattedPhone = `+${cleanPhone}`;

    // Setup MarzPay Request
    const reference = randomUUID();
    const authString = Buffer.from(`${process.env.MARZPAY_PUBLIC_KEY}:${process.env.MARZPAY_SECRET_KEY}`).toString("base64");
    
    const requestUrl = new URL(req.url);
    const callbackUrl = `${requestUrl.origin}/api/webhook/marzpay`;

    const marzPayload = new FormData();
    marzPayload.append("amount", amount.toString());
    marzPayload.append("phone_number", formattedPhone);
    marzPayload.append("country", "UG");
    marzPayload.append("reference", reference);
    marzPayload.append("description", "LIPA Wallet Deposit");
    marzPayload.append("callback_url", callbackUrl);

    // Send Request to MarzPay
    const response = await fetch("https://wallet.wearemarz.com/api/v1/collect-money", {
      method: "POST",
      headers: { "Authorization": `Basic ${authString}` },
      body: marzPayload,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.message || "MarzPay error" }, { status: 400 });
    }

    // Save PENDING transaction in Supabase (Now using Service Role, bypassing RLS)
    const { error: dbError } = await supabase.from("transactions").insert({
      id: reference, 
      user_id: userId, 
      type: "DEPOSIT",
      amount: Number(amount),
      status: "PENDING",
    });

    if (dbError) {
       console.error("Database Error Details:", dbError);
       return NextResponse.json({ error: "Database error: " + dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "USSD Prompt sent!" });

  } catch (error: any) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
