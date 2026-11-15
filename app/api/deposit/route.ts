import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const marzPublicKey = process.env.MARZPAY_PUBLIC_KEY;
    const marzSecretKey = process.env.MARZPAY_SECRET_KEY;

    // 1. Check Environment Variables
    if (!supabaseUrl || !supabaseServiceKey || !marzPublicKey || !marzSecretKey) {
      return NextResponse.json({ error: "Server Error: Missing Environment Variables in Vercel." }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { amount, phone, userId } = await req.json();

    if (!amount || amount < 500) {
      return NextResponse.json({ error: "Minimum deposit is 500 UGX" }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    // 2. Format Phone
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '256' + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('256')) {
      cleanPhone = '256' + cleanPhone;
    }
    const formattedPhone = `+${cleanPhone}`;

    // 3. Setup MarzPay
    const reference = randomUUID();
    const authString = Buffer.from(`${marzPublicKey}:${marzSecretKey}`).toString("base64");
    const requestUrl = new URL(req.url);
    const callbackUrl = `${requestUrl.origin}/api/webhook/marzpay`;

    const marzPayload = new FormData();
    marzPayload.append("amount", amount.toString());
    marzPayload.append("phone_number", formattedPhone);
    marzPayload.append("country", "UG");
    marzPayload.append("reference", reference);
    marzPayload.append("description", "LIPA Wallet Deposit");
    marzPayload.append("callback_url", callbackUrl);

    // 4. Send to MarzPay
    const response = await fetch("https://wallet.wearemarz.com/api/v1/collect-money", {
      method: "POST",
      headers: { "Authorization": `Basic ${authString}` },
      body: marzPayload,
    });

    // SAFELY READ THE RESPONSE (Prevents the crash)
    const responseText = await response.text();

    if (!responseText) {
      throw new Error("MarzPay returned an empty response. Check your API keys in Vercel.");
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      throw new Error("MarzPay returned a non-JSON response. They might be down.");
    }

    if (!response.ok) {
      return NextResponse.json({ error: data.message || "MarzPay rejected the request" }, { status: 400 });
    }

    // 5. Save to Database
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
    console.error("Server Crash Details:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
