"use client";

import { FiInfo } from 'react-icons/fi';
import { BusinessProfile } from '@/lib/types';
import FrameworkInfo from './FrameworkInfo';
import { getFrameworkDisplayName } from '@/lib/framework-service';

type WelcomeMessageProps = {
  selectedProfile: BusinessProfile | null;
  businessProfiles: BusinessProfile[];
  onToggleProfileSelector: () => void;
  selectedFramework: string | null;
};

export default function WelcomeMessage({
  selectedProfile,
  businessProfiles,
  onToggleProfileSelector,
  selectedFramework
}: WelcomeMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-4xl mb-2">👋</div>
      <h1 className="text-2xl font-bold mb-6">How can I help you today?</h1>
      
      {!selectedProfile && businessProfiles.length > 0 && (
        <div className="bg-yellow-900/30 border border-yellow-700 p-4 rounded-md mb-6 max-w-lg">
          <div className="flex items-start gap-2">
            <FiInfo className="text-yellow-500 mt-1 flex-shrink-0" />
            <div>
              <p className="text-yellow-300 font-medium mb-1">No business profile selected</p>
              <p className="text-yellow-200/70 text-sm">
                Select a business profile to get better results tailored to your business.
              </p>
              <button 
                onClick={onToggleProfileSelector}
                className="mt-2 px-3 py-1 bg-yellow-800 hover:bg-yellow-700 rounded-md text-sm transition"
              >
                Select a profile
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-[#3e3f4b] p-6 rounded-lg w-full max-w-2xl">
        <h3 className="text-xl font-medium mb-4">Generate Copywriting</h3>
        <p className="text-gray-300 mb-4">
          Enter a topic or product description below to generate marketing copy
          {selectedFramework ? ` using the ${getFrameworkDisplayName(selectedFramework)} framework` : ''}:
        </p>
        <FrameworkInfo frameworkId={selectedFramework} />
      </div>
    </div>
  );
} 