
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { workflowId, botToken } = await req.json();

    if (!workflowId || !botToken) {
      return NextResponse.json({success:false, error:"Missing workflowId or botToken"}, { status: 400 });
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL; 
    
    if (!baseUrl) {
        return NextResponse.json({success:false, error:"Base URL not configured"}, { status: 500 });
    }

    // We append workflowId so we know WHICH workflow to run when a message comes in
    const webhookUrl = `${baseUrl}/api/webhooks/telegram?workflowId=${workflowId}`;

    // 3. Call Telegram API to register the webhook
    const telegramUrl = `https://api.telegram.org/bot${botToken}/setWebhook?url=${webhookUrl}`;
    
    const telegramResponse = await fetch(telegramUrl);
    const telegramData = await telegramResponse.json();

    if (!telegramData.ok) {
      console.error("Telegram Error:", telegramData);
      return NextResponse.json({success:false, error:`Telegram Error: ${telegramData.description}`}, { status: 400 });
    }


    return NextResponse.json({ success: true }, {status:200});

  } catch (error) {
    console.error("[TELEGRAM_CONNECT]", error);
    return NextResponse.json({success: false, error: "Internal Server Error"}, { status: 500 });
  }
}