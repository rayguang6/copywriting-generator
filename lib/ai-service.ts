import { BusinessProfile, CopywritingFramework, Message } from './types';

interface GenerateParams {
  prompt: string;
  framework?: CopywritingFramework;
  businessProfile?: BusinessProfile | null;
  previousMessages?: Message[];
}

// Deepseek API endpoint and API key
const DEEPSEEK_API_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
console.log('DEEPSEEK_API_KEY in ai-service:', DEEPSEEK_API_KEY ? 'Key is present' : 'Key is missing');

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

/**
 * Generate copywriting based on the provided prompt and framework
 */
export async function generateCopy({ prompt, framework, businessProfile, previousMessages = [] }: GenerateParams): Promise<string> {
  try {
    // Call the server-side API route
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        framework,
        businessProfile,
        previousMessages
      })
    });

    if (!response.ok) {
      console.error('API error:', response.status, response.statusText);
      return getMockResponse(framework, prompt);
    }

    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error('Error generating copy:', error);
    return getMockResponse(framework, prompt);
  }
} 