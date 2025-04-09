import { NextRequest, NextResponse } from 'next/server';
import { CopywritingFramework, BusinessProfile, Message } from '@/lib/types';

// Deepseek API endpoint and API key
const DEEPSEEK_API_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// Mock response for development or when API fails
const getMockResponse = (framework: CopywritingFramework | undefined, prompt: string): string => {
  if (framework === CopywritingFramework.FAB) {
    return `
# Features
- Feature 1: This is a mock response for "${prompt}"
- Feature 2: The API call failed, so you're seeing this fallback content
- Feature 3: In production, this would be real AI-generated content

# Advantages
- Advantage 1: Even when the API fails, users still get a response
- Advantage 2: Developers can test the UI without making API calls
- Advantage 3: It's clear this is a mock response

# Benefits
- Benefit 1: Better user experience with graceful degradation
- Benefit 2: Reduced frustration during API outages
- Benefit 3: Clear indication when using fallback mode
`;
  } else {
    return `
# Attention
This is a mock response for "${prompt}" because the API call failed.

# Interest
In production, this section would contain compelling AI-generated content that builds interest in your product or service.

# Desire
The mock system ensures your application continues functioning even when API services are unavailable.

# Action
When you're ready to deploy to production, ensure your API keys are properly configured in your environment variables.
`;
  }
};

export async function POST(request: NextRequest) {
  console.log('DEEPSEEK_API_KEY in API route:', DEEPSEEK_API_KEY ? 'Key is present' : 'Key is missing');
  
  try {
    const requestData = await request.json();
    const { prompt, framework, businessProfile, previousMessages = [] } = requestData;
    
    if (!DEEPSEEK_API_KEY) {
      console.error('DeepSeek API key is missing. Please check your .env.local file.');
      return NextResponse.json({ content: getMockResponse(framework, prompt) });
    }
    
    // Prepare the business context if a profile is provided
    let businessContext = '';
    if (businessProfile) {
      businessContext = `
Business Name: ${businessProfile.name}
${businessProfile.industry ? `Industry: ${businessProfile.industry}` : ''}
${businessProfile.target_audience ? `Target Audience: ${businessProfile.target_audience}` : ''}
${businessProfile.unique_value_proposition ? `Unique Value Proposition: ${businessProfile.unique_value_proposition}` : ''}
${businessProfile.pain_points ? `Pain Points: ${businessProfile.pain_points}` : ''}
${businessProfile.brand_voice ? `Brand Voice: ${businessProfile.brand_voice}` : ''}
      `.trim();
    }
    
    // Create system message based on framework
    const systemMessage = framework === CopywritingFramework.FAB
      ? `You are a copywriting assistant that specializes in the FAB (Features, Advantages, Benefits) framework.
${businessContext ? `\nBusiness Context:\n${businessContext}` : ''}

When responding to user queries, structure your copy in clear sections with headings for Features, Advantages, and Benefits, unless the user asks for a different format.`
      : `You are a copywriting assistant that specializes in the AIDA (Attention, Interest, Desire, Action) framework.
${businessContext ? `\nBusiness Context:\n${businessContext}` : ''}

When responding to user queries, structure your copy in clear sections with headings for Attention, Interest, Desire, and Action, unless the user asks for a different format.`;
    
    // Prepare the conversation messages
    const messages = [
      { role: 'system', content: systemMessage },
      ...(previousMessages || []).map((msg: Message) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: prompt }
    ];
    
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
        return NextResponse.json({ content: getMockResponse(framework, prompt) });
      }
  
      const data = await response.json();
      return NextResponse.json({ content: data.choices[0].message.content });
    } catch (error) {
      console.error('Error generating copy:', error);
      return NextResponse.json({ content: getMockResponse(framework, prompt) });
    }
  } catch (error) {
    console.error('Error parsing request:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
} 