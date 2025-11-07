import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const { transcript } = await request.json();

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Analyze the following patient transcript and identify any symptoms mentioned. Provide a structured list of symptoms found.

Transcript: ${transcript}

Please list all symptoms identified in the transcript.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = response.text();

    return NextResponse.json({
      success: true,
      symptoms: analysis,
    });

  } catch (error) {
    console.error('Error analyzing transcript:', error);
    return NextResponse.json(
      { error: 'Failed to analyze transcript' },
      { status: 500 }
    );
  }
}