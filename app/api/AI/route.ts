import { NextResponse } from "next/server";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { audio, mimeType } = await request.json();

    if (!audio || !mimeType) {
      return NextResponse.json(
        { error: "Missing audio or mimeType in request body" },
        { status: 400 }
      );
    }

    // 1️⃣ Save base64 audio to temporary file
    const buffer = Buffer.from(audio, "base64");
    const ext = mimeType.split("/")[1] || "webm";
    const tempPath = path.join("/tmp", `audio_${Date.now()}.${ext}`);
    fs.writeFileSync(tempPath, buffer);

    // 2️⃣ Create SDK instances with API key
    const apiKey = process.env.GEMINI_API_KEY!;
    const fileManager = new GoogleAIFileManager(apiKey);
    
    // 3️⃣ Upload audio file to Gemini
    const uploadResponse = await fileManager.uploadFile(tempPath, {
      mimeType,
      displayName: "patient_audio",
    });
    console.log("✅ File uploaded to Gemini:", uploadResponse.file.uri);

    // 4️⃣ Wait for file to be processed
    let file = await fileManager.getFile(uploadResponse.file.name);
    while (file.state === "PROCESSING") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      file = await fileManager.getFile(uploadResponse.file.name);
    }

    if (file.state === "FAILED") {
      throw new Error("File processing failed");
    }

    // 5️⃣ Initialize Gemini model
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    // 6️⃣ Ask Gemini to transcribe + analyze
    const prompt = `
You are a clinical AI assistant.
Transcribe this patient audio recording.
Identify key symptoms, possible conditions, and give medical recommendations.
Return your findings in a clean, structured summary.
`;

    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResponse.file.mimeType,
          fileUri: uploadResponse.file.uri,
        },
      },
      { text: prompt },
    ]);

    const text = result.response.text();

    // 7️⃣ Clean up temporary file
    fs.unlinkSync(tempPath);

    return NextResponse.json({ success: true, analysis: text });
  } catch (error: any) {
    console.error("❌ Gemini Audio Analysis Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze audio" },
      { status: 500 }
    );
  }
}