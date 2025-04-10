"use client";

import Link from 'next/link';
import { BusinessProfile } from '@/lib/types';

type ProfileSelectorProps = {
  isOpen: boolean;
  onClose: () => void;
  profiles: BusinessProfile[];
  onSelectProfile: (profile: BusinessProfile) => void;
};

export default function ProfileSelector({ 
  isOpen, 
  onClose, 
  profiles, 
  onSelectProfile 
}: ProfileSelectorProps) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Select a Business Profile</h2>
        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
          {profiles.map(profile => (
            <button
              key={profile.id}
              onClick={() => onSelectProfile(profile)}
              className="w-full text-left p-3 rounded-md hover:bg-gray-700 transition"
            >
              <div className="font-medium">{profile.name}</div>
              <div className="text-sm text-gray-400">{profile.industry}</div>
            </button>
          ))}
        </div>
        <div className="mt-6 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white transition"
          >
            Cancel
          </button>
          <Link
            href="/business-profiles"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition"
          >
            Manage Profiles
          </Link>
        </div>
      </div>
    </div>
  );
} 