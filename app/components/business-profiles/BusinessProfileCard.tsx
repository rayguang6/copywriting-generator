"use client";

import { BusinessProfile } from '@/lib/types';
import { FiStar, FiEdit2, FiTrash2 } from 'react-icons/fi';

type BusinessProfileCardProps = {
  profile: BusinessProfile;
  onEdit: (profile: BusinessProfile) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
};

export default function BusinessProfileCard({ 
  profile, 
  onEdit, 
  onDelete,
  onSetDefault 
}: BusinessProfileCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center">
            <h2 className="text-xl font-semibold">{profile.name}</h2>
            {profile.is_default && (
              <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">Default</span>
            )}
          </div>
          {profile.industry && <p className="text-sm text-gray-400 mt-1">Industry: {profile.industry}</p>}
          {profile.target_audience && (
            <div className="mt-2">
              <p className="text-sm font-medium">Target Audience:</p>
              <p className="text-sm text-gray-300">{profile.target_audience}</p>
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          {!profile.is_default && (
            <button 
              onClick={() => onSetDefault(profile.id)}
              className="text-yellow-400 hover:text-yellow-300"
              title="Set as default"
            >
              <FiStar />
            </button>
          )}
          <button 
            onClick={() => onEdit(profile)}
            className="text-blue-400 hover:text-blue-300"
          >
            <FiEdit2 />
          </button>
          <button 
            onClick={() => onDelete(profile.id)}
            className="text-red-400 hover:text-red-300"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
    </div>
  );
} 