import { NextRequest, NextResponse } from 'next/server';
import { BusinessProfile, Message } from '@/lib/types';
import { generateSystemPrompt, generateMockResponse, getFrameworkById } from '@/lib/framework-service';

// Deepseek API endpoint and API key
const DEEPSEEK_API_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// API route for generating copy
export async function POST(request: NextRequest) {
  
  try {
    const requestData = await request.json();
    const { prompt, framework, businessProfile, previousMessages = [] } = requestData;
    
    // Enhanced logging
    console.log("API received framework:", framework);
    console.log("Framework type:", typeof framework);
    
    // Use the framework ID directly or default to 'aida' if it's invalid
    const frameworkId = typeof framework === 'string' && framework.trim() !== '' 
      ? framework.toLowerCase() 
      : 'aida';
    
    // Validate that the framework exists
    const frameworkExists = getFrameworkById(frameworkId);
    const finalFrameworkId = frameworkExists ? frameworkId : 'aida'; // Fallback to aida if not found
    
    console.log("Using frameworkId:", finalFrameworkId);
    
    if (!DEEPSEEK_API_KEY) {
      console.error('DeepSeek API key is missing. Please check your .env.local file.');
      return NextResponse.json({ content: generateMockResponse(finalFrameworkId, prompt) });
    }
    
    // Generate system prompt based on framework and business profile
    const systemMessage = generateSystemPrompt(finalFrameworkId, businessProfile);
    
    // Prepare the conversation messages
    const messages = [
      { role: 'system', content: systemMessage },
      ...(previousMessages || []).map((msg: Message) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: prompt }
    ];
    
    console.log("System message:", systemMessage.substring(0, 100) + "...");
    
    try {
      const response = await fetch(DEEPSEEK_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          temperature: 0.7
        })
      });
  
      if (!response.ok) {
        console.error('DeepSeek API error:', response.status, response.statusText);
        return NextResponse.json({ content: generateMockResponse(finalFrameworkId, prompt) });
      }
  
      const data = await response.json();
      return NextResponse.json({ content: data.choices[0].message.content });
    } catch (error) {
      console.error('Error generating copy:', error);
      return NextResponse.json({ content: generateMockResponse(finalFrameworkId, prompt) });
    }
  } catch (error) {
    console.error('Error parsing request:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
} 