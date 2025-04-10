"use client";

import { getFrameworkById } from '@/lib/framework-service';

type FrameworkInfoProps = {
  frameworkId: string | null;
};

export default function FrameworkInfo({ frameworkId }: FrameworkInfoProps) {
  if (!frameworkId) {
    return (
      <p className="text-sm text-gray-300 mb-4">
        Select a framework from the sidebar to get started.
      </p>
    );
  }

  // Get framework information
  const framework = getFrameworkById(frameworkId);
  
  if (!framework) {
    return (
      <p className="text-sm text-gray-300 mb-4">
        Unknown framework selected. Please select a valid framework.
      </p>
    );
  }

  // Dynamic framework description generator based on framework name/description
  const generateFrameworkDescription = () => {
    // Extract sections from framework name or description
    const parts = framework.description.split(', ');
    
    if (parts.length <= 1) {
      // If no commas in description, just return a generic message
      return (
        <p className="text-sm text-gray-300 mb-4">
          Using the <strong>{framework.name}</strong> framework. Type your message to begin.
        </p>
      );
    }
    
    // If we have parts, create a list of bullets
    return (
      <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {parts.map((part, index) => (
            <div key={index} className="bg-gray-800/50 rounded p-3 hover:bg-gray-800 transition">
              <h4 className="font-medium text-blue-300 mb-1">{part}</h4>
              <p className="text-sm text-gray-300">{getDescriptionForPart(framework.id, part)}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Helper function to get description for each part based on framework and section
  const getDescriptionForPart = (frameworkId: string, part: string) => {
    // Framework-specific descriptions
    const descriptions: Record<string, Record<string, string>> = {
      'aida': {
        'Attention': 'Grab the audience\'s attention',
        'Interest': 'Generate interest with compelling details',
        'Desire': 'Create desire for the product/service',
        'Action': 'Prompt the audience to take action'
      },
      'fab': {
        'Features': 'List the product\'s features',
        'Advantages': 'Explain the advantages of these features',
        'Benefits': 'Emphasize the benefits users will experience'
      },
      'pas': {
        'Problem': 'Identify your audience\'s pain point',
        'Agitate': 'Emphasize why this problem needs solving',
        'Solution': 'Present your product as the answer'
      },
      'spin': {
        'Situation': 'Establish the current situation',
        'Problem': 'Identify specific problems or challenges',
        'Implication': 'Explore implications if problems aren\'t solved',
        'Need-payoff': 'Demonstrate benefits of your solution'
      },
      'foursps': {
        'Product': 'What you\'re selling',
        'Price': 'How it\'s priced in the market',
        'Place': 'Where it\'s available',
        'Promotion': 'How you\'ll promote it'
      }
    };
    
    // Try to get the description from our mapping
    if (descriptions[frameworkId] && descriptions[frameworkId][part]) {
      return descriptions[frameworkId][part];
    }
    
    // Generic fallbacks based on common terms
    const genericDescriptions: Record<string, string> = {
      'Attention': 'Grab the audience\'s attention',
      'Interest': 'Generate interest in your offering',
      'Desire': 'Create desire for your product or service',
      'Action': 'Prompt the audience to take action',
      'Features': 'Describe what your product has or does',
      'Advantages': 'Explain what makes these features valuable',
      'Benefits': 'Show how customers will benefit',
      'Problem': 'Identify a pain point or challenge',
      'Agitate': 'Emphasize why this problem matters',
      'Solution': 'Present your offering as the answer',
      'Situation': 'Establish the current context',
      'Implication': 'Reveal consequences of inaction',
      'Need': 'Highlight the specific need',
      'Payoff': 'Demonstrate the value of your solution'
    };
    
    // Return generic description or a default message
    return genericDescriptions[part] || `Describe the ${part.toLowerCase()} aspect`;
  };

  return generateFrameworkDescription();
} 