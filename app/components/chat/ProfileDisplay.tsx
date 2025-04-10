"use client";

import { BusinessProfile } from '@/lib/types';

type ProfileDisplayProps = {
  profile: BusinessProfile | null;
  onToggleSelector: () => void;
  showSelector: boolean;
};

export default function ProfileDisplay({ 
  profile, 
  onToggleSelector, 
  showSelector 
}: ProfileDisplayProps) {
  return (
    <div className="mb-3 relative">
      <button 
        onClick={onToggleSelector}
        className="text-sm text-gray-300 hover:text-white flex items-center gap-1 mb-2"
      >
        <span className="font-medium">Business Profile:</span>
        <span className="text-white">{profile ? profile.name : 'None'}</span>
        <span className="ml-1 text-xs">{showSelector ? '▲' : '▼'}</span>
      </button>
    </div>
  );
} 