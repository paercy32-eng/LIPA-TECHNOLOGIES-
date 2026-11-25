import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const { amount, phone, userId } = await req.json();

    // 1. Validation
    if (!amount || amount < 15000) {
      return NextResponse.json({ error: "Minimum deposit is 15,000 UGX" }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const tavuKey = process.env.TAVUPAY_API_KEY;
    const tavuSecret = process.env.TAVUPAY_API_SECRET;
    
    if (!tavuKey || !tavuSecret) {
       return NextResponse.json({ error: "TavuPay keys missing in Vercel." }, { status: 500 });
    }

    // 2. Calculate 2% Fee
    const fee = amount * 0.02;
    const totalToCharge = amount + fee; // e.g., 15,000 + 300 = 15,300

    // 3. Format Phone (TavuPay accepts 2567..., 07..., etc.)
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '256' + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('256')) {
      cleanPhone = '256' + cleanPhone;
    }

    const reference = randomUUID();

    // 4. Send Request to TavuPay
    const response = await fetch("https://api.tavupay.lat/v1/payments", {
      method: "POST",
      headers: {
        "X-API-Key": tavuKey,
        "X-API-Secret": tavuSecret,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        type: "collection",
        phone: cleanPhone,
        amount: Math.floor(totalToCharge), // Must be an integer
        idempotencyKey: reference,
        description: "Novida Wallet Deposit"
      })
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      return NextResponse.json({ error: data.message || data.error || "TavuPay error" }, { status: 400 });
    }

    // 5. Save to Database as PENDING (We credit the base amount, not the fee)
    const { error: dbError } = await supabase.from("transactions").insert({
      id: reference, 
      user_id: userId, 
      type: "DEPOSIT",
      amount: Number(amount), // User gets credited the base amount
      status: "PENDING",
      payment_phone: phone
    });

    if (dbError) {
       return NextResponse.json({ error: "Database error: " + dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "USSD Prompt sent!" });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
