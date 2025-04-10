"use client";

import { FiInfo } from 'react-icons/fi';
import { BusinessProfile } from '@/lib/types';
import FrameworkInfo from './FrameworkInfo';
import { getFrameworkDisplayName, getFrameworkById } from '@/lib/framework-service';

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
  // Get framework details if one is selected
  const framework = selectedFramework ? getFrameworkById(selectedFramework) : null;
  const frameworkName = selectedFramework ? getFrameworkDisplayName(selectedFramework) : null;

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="flex flex-col items-center mb-6">
        {selectedFramework && framework ? (
          <>
            <div className="text-4xl mb-2">✏️</div>
            <h1 className="text-3xl font-bold text-center">
              <span className="text-blue-400">{framework.name}</span> Copywriting
            </h1>
            <p className="text-gray-400 text-center mt-2 max-w-lg">
              {framework.description}
            </p>
          </>
        ) : (
          <>
            <div className="text-4xl mb-2">👋</div>
            <h1 className="text-3xl font-bold text-center">
              Copywriting Generator
            </h1>
            <p className="text-gray-400 text-center mt-2">
              Select a framework from the sidebar to get started
            </p>
          </>
        )}
      </div>
      
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

        {/* Framework info with visual prominence */}
        <div className="mb-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400 uppercase tracking-wide mb-2">Selected Framework</div>
          </div>
          
          {selectedFramework ? (
            <div className="flex flex-col">
              <div className="bg-blue-900/30 border-l-4 border-blue-500 p-3 rounded">
                <div className="font-medium text-blue-300">{frameworkName}</div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-900/30 border-l-4 border-yellow-500 p-3 rounded">
              <div className="text-yellow-300 font-medium">No framework selected</div>
              <div className="text-yellow-200/70 text-sm mt-1">
                Select a framework from the sidebar to optimize your copywriting results.
              </div>
            </div>
          )}
        </div>

        <p className="text-gray-300 mb-4">
          Enter a topic or product description below to generate marketing copy
          {selectedFramework ? ` using the ${frameworkName} framework` : ''}:
        </p>
        <FrameworkInfo frameworkId={selectedFramework} />
      </div>
    </div>
  );
} 