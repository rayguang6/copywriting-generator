import { BusinessProfile } from './types';

// Simplified framework interface focusing on prompts only
export interface Framework {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
}

// Collection of all available frameworks 
// To add a new framework, simply add a new object to this array
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
  },
  // Example of a marketing framework
  {
    id: 'foursps',
    name: '4Ps',
    description: 'Product, Price, Place, Promotion',
    systemPrompt: `You are a marketing assistant that specializes in the 4Ps (Product, Price, Place, Promotion) framework.
{{businessContext}}

When responding to user queries, structure your recommendations in clear sections with headings for Product, Price, Place, and Promotion, unless the user asks for a different format.`
  },
  // Example of a sales framework
  {
    id: 'spin',
    name: 'SPIN',
    description: 'Situation, Problem, Implication, Need-payoff',
    systemPrompt: `You are a sales assistant that specializes in the SPIN (Situation, Problem, Implication, Need-payoff) framework.
{{businessContext}}

When responding to user queries, structure your sales approach in clear sections with headings for Situation, Problem, Implication, and Need-payoff, unless the user asks for a different format.`
  },
  // Add more frameworks here as needed
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
 * Uses a template-based approach instead of conditional logic for extensibility
 */
export function generateMockResponse(frameworkId: string, prompt: string): string {
  const framework = getFrameworkById(frameworkId);
  
  if (!framework) {
    // Default to AIDA if framework not found
    console.warn(`Framework ID "${frameworkId}" not found, defaulting to AIDA for mock response`);
    return generateMockResponse('aida', prompt);
  }
  
  // Generic mock template system
  // Instead of using a big if/else chain, use a template system based on framework structure
  const mockTemplates: Record<string, (prompt: string) => string> = {
    // Default template that works for any framework
    default: (prompt: string) => {
      // Extract section headers from the framework's system prompt
      const sectionRegex = /headings for ([^,]+)(?:,\s+([^,]+))?(?:,\s+([^,]+))?(?:,\s+and\s+([^,]+))?/i;
      const match = framework?.systemPrompt.match(sectionRegex);
      
      if (match) {
        // Extract section headers from the regex match
        const sections = match.slice(1).filter(Boolean);
        
        // Generate mock content for each section
        return sections.map(section => 
          `# ${section}\nThis is a mock response for "${prompt}" using the ${framework?.name} framework. In production, this would contain AI-generated content.`
        ).join('\n\n');
      }
      
      // Fallback if no sections are found
      return `# Mock Response\nThis is a mock response for "${prompt}" using the ${framework?.name} framework.`;
    }
  };
  
  // Use specific template if available, otherwise use the default one
  const templateFn = mockTemplates[framework.id] || mockTemplates.default;
  return templateFn(prompt);
}

/**
 * Get framework display name from ID
 */
export function getFrameworkDisplayName(frameworkId: string): string {
  // If we pass undefined or null, default to unknown
  if (!frameworkId) return "Unknown Framework";
  
  // Try to get the framework by its ID
  const framework = getFrameworkById(frameworkId);
  
  // If found, return its formatted name
  if (framework) {
    return formatFrameworkName(framework);
  }
  
  // If no framework found for this ID, just return the ID as a fallback
  return frameworkId;
} 