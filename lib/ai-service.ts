import { BusinessProfile, CopywritingFramework } from './types';

interface GenerateParams {
  prompt: string;
  framework?: CopywritingFramework;
  businessProfile?: BusinessProfile | null;
}

// Deepseek API endpoint and API key
const DEEPSEEK_API_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-8074887f727d4759ba9ab7fd20bb651a';

/**
 * Generate copywriting based on the provided prompt and framework
 */
export async function generateCopy({ prompt, framework, businessProfile }: GenerateParams): Promise<string> {
  console.log('Generating copy with:', { prompt, framework, businessProfile });
  
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
  
  // Build prompt based on the selected framework
  let promptTemplate = '';
  
  if (framework === CopywritingFramework.FAB) {
    promptTemplate = `
Create marketing copy using the FAB (Features, Advantages, Benefits) framework for the following:

${businessContext ? `Business Context:\n${businessContext}\n\n` : ''}
Topic: ${prompt}

Format your response in clear sections with headings for Features, Advantages, and Benefits.
    `.trim();
  } else {
    // Default to AIDA framework
    promptTemplate = `
Create marketing copy using the AIDA (Attention, Interest, Desire, Action) framework for the following:

${businessContext ? `Business Context:\n${businessContext}\n\n` : ''}
Topic: ${prompt}

Format your response in clear sections with headings for Attention, Interest, Desire, and Action.
    `.trim();
  }
  
  try {
    const response = await fetch(DEEPSEEK_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: promptTemplate
          }
        ],
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Deepseek API error:', errorData);
      throw new Error(`Deepseek API error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating copy:', error);
    throw new Error('Failed to generate copy. Please try again.');
  }
} 