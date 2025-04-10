import { BusinessProfile } from './types';

// Simplified framework interface focusing on prompts only
export interface Framework {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
}

// Collection of all available frameworks
const frameworks: Framework[] = [
  {
    id: 'aida',
    name: 'AIDA',
    description: 'Attention, Interest, Desire, Action',
    systemPrompt: `You are a copywriting assistant that specializes in the AIDA (Attention, Interest, Desire, Action) framework.
{{businessContext}}

When responding to user queries, structure your copy in clear sections with headings for Attention, Interest, Desire, and Action, unless the user asks for a different format.`
  },
  {
    id: 'fab',
    name: 'FAB',
    description: 'Features, Advantages, Benefits',
    systemPrompt: `You are a copywriting assistant that specializes in the FAB (Features, Advantages, Benefits) framework.
{{businessContext}}

When responding to user queries, structure your copy in clear sections with headings for Features, Advantages, and Benefits, unless the user asks for a different format.`
  },
  {
    id: 'pas',
    name: 'PAS',
    description: 'Problem, Agitate, Solution',
    systemPrompt: `You are a copywriting assistant that specializes in the PAS (Problem, Agitate, Solution) framework.
{{businessContext}}

When responding to user queries, structure your copy in clear sections with headings for Problem, Agitate, and Solution, unless the user asks for a different format.`
  }
];

/**
 * Get all available frameworks
 */
export function getAllFrameworks(): Framework[] {
  return frameworks;
}

/**
 * Get a specific framework by ID
 */
export function getFrameworkById(id: string): Framework | undefined {
  // Make sure we're using lowercase IDs for consistency
  const normalizedId = id?.toLowerCase();
  return frameworks.find(framework => framework.id === normalizedId);
}

/**
 * Get a specific framework by name
 */
export function getFrameworkByName(name: string): Framework | undefined {
  // If the name contains the full name like "AIDA (Attention, Interest, Desire, Action)"
  // extract just the framework name part
  const shortName = name.split(' (')[0];
  
  return frameworks.find(framework => 
    framework.name.toLowerCase() === name.toLowerCase() || 
    framework.name.toLowerCase() === shortName.toLowerCase() || 
    `${framework.name} (${framework.description})`.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Format a framework's display name
 */
export function formatFrameworkName(framework: Framework): string {
  return `${framework.name} (${framework.description})`;
}

/**
 * Generate system prompt for a given framework and business profile
 */
export function generateSystemPrompt(frameworkId: string, businessProfile?: BusinessProfile | null): string {
  // Check if frameworkId is already a valid framework ID
  const framework = getFrameworkById(frameworkId);
  
  if (framework) {
    // Prepare the business context if a profile is provided
    let businessContext = '';
    if (businessProfile) {
      businessContext = `
Business Context:
Business Name: ${businessProfile.name}
${businessProfile.industry ? `Industry: ${businessProfile.industry}` : ''}
${businessProfile.target_audience ? `Target Audience: ${businessProfile.target_audience}` : ''}
${businessProfile.unique_value_proposition ? `Unique Value Proposition: ${businessProfile.unique_value_proposition}` : ''}
${businessProfile.pain_points ? `Pain Points: ${businessProfile.pain_points}` : ''}
${businessProfile.brand_voice ? `Brand Voice: ${businessProfile.brand_voice}` : ''}
      `.trim();
    }
    
    // Replace the businessContext placeholder with actual content or empty string
    return framework.systemPrompt.replace('{{businessContext}}', 
      businessContext ? `\n${businessContext}` : '');
  }
  
  // Default to AIDA if framework not found
  console.warn(`Framework ID "${frameworkId}" not found, defaulting to AIDA`);
  return generateSystemPrompt('aida', businessProfile);
}

/**
 * Generate a mock response for a framework (for testing or when API fails)
 */
export function generateMockResponse(frameworkId: string, prompt: string): string {
  const framework = getFrameworkById(frameworkId);
  
  if (!framework) {
    // Default to AIDA if framework not found
    console.warn(`Framework ID "${frameworkId}" not found, defaulting to AIDA for mock response`);
    return generateMockResponse('aida', prompt);
  }
  
  if (framework.id === 'aida') {
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
  } else if (framework.id === 'fab') {
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
  } else if (framework.id === 'pas') {
    return `
# Problem
This is a mock response for "${prompt}" because the API call failed.

# Agitate
When your AI service is down, it can be frustrating for users who need to create marketing copy quickly.

# Solution
Our graceful fallback system ensures you can still see a preview of how your content would be structured, even when the AI service is unavailable.
`;
  } else {
    // Generic fallback that shouldn't be reached if we have proper framework IDs
    return `# Mock Response\nThis is a mock response for "${prompt}" using an unknown framework.`;
  }
}

/**
 * Convert legacy framework value to framework ID
 */
export function convertLegacyFramework(value: string): string {
  // If value is already a valid framework ID, return it directly
  if (!value) return 'aida'; // Default
  
  // Normalize to lowercase
  const lowercaseValue = value.toLowerCase();
  
  // Check if it's already a valid ID
  if (frameworks.some(f => f.id === lowercaseValue)) {
    return lowercaseValue;
  }
  
  // Check if it matches our specific framework names
  if (lowercaseValue.includes('aida')) return 'aida';
  if (lowercaseValue.includes('fab')) return 'fab';
  if (lowercaseValue.includes('pas')) return 'pas';
  
  // Try to match by name
  const framework = getFrameworkByName(value);
  if (framework) return framework.id;
  
  // Default to AIDA if no match found
  console.warn(`Could not convert framework value "${value}" to a valid ID, defaulting to AIDA`);
  return 'aida';
}

/**
 * Get framework display name from ID
 */
export function getFrameworkDisplayName(frameworkId: string): string {
  // If we pass undefined or null, default to unknown
  if (!frameworkId) return "Unknown Framework";
  
  // First, try to get the framework by its ID
  const framework = getFrameworkById(frameworkId);
  
  // If found, return its formatted name
  if (framework) {
    return formatFrameworkName(framework);
  }
  
  // If not found, try to convert it as a legacy framework and get the display name
  const convertedId = convertLegacyFramework(frameworkId);
  const convertedFramework = getFrameworkById(convertedId);
  
  // Return the formatted name if found after conversion, or the original value
  return convertedFramework 
    ? formatFrameworkName(convertedFramework) 
    : frameworkId; // Fall back to the original value
} 