import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  return NextResponse.json({
    apiKeyStatus: apiKey ? 'Key is present' : 'Key is missing',
    apiKeyPreview: apiKey ? `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 4)}` : null
  });
} 