import { NextResponse } from "next/server";
import { PesaJet } from "@pesajet/sdk";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const pesajet = new PesaJet({
  apiKey: process.env.PESAJET_API_KEY!,
  webhookSecret: process.env.PESAJET_WEBHOOK_SECRET,
});

export async function POST(req: Request) {
  try {
    const { amount, phone, userId } = await req.json();

    if (!amount || amount < 15000) {
      return NextResponse.json({ error: "Minimum deposit is 15,000 UGX" }, { status: 400 });
    }

    // Calculate 2% fee
    const fee = amount * 0.02;
    const totalToCharge = Math.floor(amount + fee);

    // Format phone
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '256' + cleanPhone.substring(1);
    else if (!cleanPhone.startsWith('256')) cleanPhone = '256' + cleanPhone;

    // Detect Provider (MTN/Airtel)
    let provider = pesajet.utils.detectProvider(cleanPhone);
    if (!provider) provider = "mtn"; 

    const reference = randomUUID(); 

    // 1. Create payment with PesaJet
    const payment = await pesajet.payments.create({
      amount: totalToCharge,
      currency: "UGX",
      phoneNumber: `+${cleanPhone}`,
      provider: provider,
      reference: reference,
      description: "Novida Wallet Deposit",
    });

    // 2. Save PENDING to Database
    const { error: dbError } = await supabase.from("transactions").insert({
      id: reference, 
      user_id: userId, 
      type: "DEPOSIT",
      amount: Number(amount), 
      status: "PENDING",
      tx_id: payment.transactionId, // Store PesaJet ID for verifier
      payment_phone: phone
    });

    if (dbError) throw new Error(dbError.message);

    return NextResponse.json({ success: true, reference });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}