import { sendWorkflowExecution } from "@/inngest/utils";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try{
    const url = new URL(request.url);
    const workflowId = url.searchParams.get("workflowId");
    
    if(!workflowId){
      return NextResponse.json(
        { success: false, error: "Missing required query parameter: workflowId" },
        { status: 400 }
      );
    };
    
    const body = await request.json();
    const message = body.message
    // 1. Determine the content type and extract data
    let mediaType = "text";
    let content = message.text || "";
    let fileId = null;

    // A. Handle Photos (Telegram sends an array of sizes, we want the last/biggest one)
    if (message.photo) {
      mediaType = "image";
      const largestPhoto = message.photo[message.photo.length - 1];
      fileId = largestPhoto.file_id;
      content = message.caption || ""; // Images have captions, not text
    }
    
    // B. Handle Voice Notes
    else if (message.voice) {
      mediaType = "voice";
      fileId = message.voice.file_id;
    }

    // C. Handle Documents (PDFs, etc)
    else if (message.document) {
      mediaType = "document";
      fileId = message.document.file_id;
      content = message.caption || message.document.file_name;
    }
    
    const telegramData = {
      content: content,
      chatId: message.chat.id,
      username: message.from.username,
      fileId: fileId,
      mediaType: mediaType,
      raw: body,
    }
    
    await sendWorkflowExecution({
      workflowId,
      initialData: {
        telegram: telegramData,
      },
    });
    
    return NextResponse.json(
      { success: true },
      { status: 200 }
    )
    
  }catch (error){
    console.error("Telegram webhook error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process telegram event."},
      {status: 500},
    )
  }
}