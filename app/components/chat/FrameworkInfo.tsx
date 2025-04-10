"use client";

import { getFrameworkById, getFrameworkDisplayName } from '@/lib/framework-service';

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

  // Display framework information based on its ID
  if (framework.id === 'aida') {
    return (
      <ul className="list-disc list-inside text-sm text-gray-300 mb-4 space-y-1">
        <li><strong>Attention:</strong> Grab the audience's attention</li>
        <li><strong>Interest:</strong> Generate interest with compelling details</li>
        <li><strong>Desire:</strong> Create desire for the product/service</li>
        <li><strong>Action:</strong> Prompt the audience to take action</li>
      </ul>
    );
  } else if (framework.id === 'fab') {
    return (
      <ul className="list-disc list-inside text-sm text-gray-300 mb-4 space-y-1">
        <li><strong>Features:</strong> List the product's features</li>
        <li><strong>Advantages:</strong> Explain the advantages of these features</li>
        <li><strong>Benefits:</strong> Emphasize the benefits users will experience</li>
      </ul>
    );
  } else if (framework.id === 'pas') {
    return (
      <ul className="list-disc list-inside text-sm text-gray-300 mb-4 space-y-1">
        <li><strong>Problem:</strong> Identify your audience's pain point</li>
        <li><strong>Agitate:</strong> Emphasize why this problem needs solving</li>
        <li><strong>Solution:</strong> Present your product as the answer</li>
      </ul>
    );
  }

  // Fallback for any other framework
  return (
    <p className="text-sm text-gray-300 mb-4">
      Using the <strong>{getFrameworkDisplayName(framework.id)}</strong> framework. Type your message to begin.
    </p>
  );
} 