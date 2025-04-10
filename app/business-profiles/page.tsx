'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BusinessProfile } from '@/lib/types';
import { 
  getUserBusinessProfiles, 
  createBusinessProfile, 
  updateBusinessProfile, 
  deleteBusinessProfile, 
  setDefaultBusinessProfile 
} from '@/lib/business-profile-service';
import { useAuthContext } from '@/providers/AuthProvider';
import { FiPlus, FiArrowLeft, FiInfo } from 'react-icons/fi';
import Link from 'next/link';

// Import components
import ProfileForm from '@/app/components/business-profiles/ProfileForm';
import BusinessProfileCard from '@/app/components/business-profiles/BusinessProfileCard';

export default function BusinessProfilesPage() {
  const [profiles, setProfiles] = useState<BusinessProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState<Partial<BusinessProfile> | null>(null);
  
  const router = useRouter();
  const { user } = useAuthContext();
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user && !loading) {
      router.push('/auth');
      return;
    }
    
    loadProfiles();
  }, [user, router]);
  
  const loadProfiles = async () => {
    try {
      setLoading(true);
      const data = await getUserBusinessProfiles();
      setProfiles(data);
      setError(null);
    } catch (err) {
      setError('Failed to load business profiles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateProfile = async (formData: Partial<BusinessProfile>) => {
    try {
      await createBusinessProfile(formData as Omit<BusinessProfile, 'id' | 'created_at' | 'updated_at' | 'user_id'>);
      setIsCreating(false);
      await loadProfiles();
    } catch (err) {
      setError('Failed to create business profile');
      console.error(err);
    }
  };
  
  const handleUpdateProfile = async (formData: Partial<BusinessProfile>) => {
    if (!isEditing) return;
    
    try {
      await updateBusinessProfile(isEditing, formData);
      setIsEditing(null);
      setEditingProfile(null);
      await loadProfiles();
    } catch (err) {
      setError('Failed to update business profile');
      console.error(err);
    }
  };
  
  const handleEditProfile = (profile: BusinessProfile) => {
    setIsEditing(profile.id);
    setEditingProfile(profile);
  };
  
  const handleDeleteProfile = async (id: string) => {
    if (!confirm('Are you sure you want to delete this profile?')) return;
    
    try {
      await deleteBusinessProfile(id);
      await loadProfiles();
    } catch (err) {
      setError('Failed to delete business profile');
      console.error(err);
    }
  };
  
  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultBusinessProfile(id);
      await loadProfiles();
    } catch (err) {
      setError('Failed to set default business profile');
      console.error(err);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/" className="mr-4">
              <button className="flex items-center text-white">
                <FiArrowLeft className="mr-1" />
              </button>
            </Link>
            <h1 className="text-2xl font-bold">Business Profiles</h1>
          </div>
        </div>
        <div className="text-center py-12">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/" className="mr-4">
            <button className="flex items-center text-white">
              <FiArrowLeft className="mr-1" />
            </button>
          </Link>
          <h1 className="text-2xl font-bold">Business Profiles</h1>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Profile listing */}
      {profiles.length > 0 ? (
        <div className="space-y-4 mb-8">
          {profiles.map(profile => (
            <BusinessProfileCard
              key={profile.id}
              profile={profile}
              onEdit={handleEditProfile}
              onDelete={handleDeleteProfile}
              onSetDefault={handleSetDefault}
            />
          ))}
        </div>
      ) : 
        <div className="bg-gray-800 rounded-lg p-8 text-center mb-8">
      <div className="flex justify-center mb-4">
        <FiInfo className="text-4xl text-blue-400" />
      </div>
      <h3 className="text-xl font-medium mb-2">No business profiles yet</h3>
      <p className="text-gray-400 mb-4">Create your first business profile to get started with copywriting.</p>
    </div>
      }
      
      {/* Create new profile button */}
      {!isCreating && !isEditing && (
        <button
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center"
        >
          <FiPlus className="mr-2" /> Create Business Profile
        </button>
      )}
      
      {/* Create profile form */}
      {isCreating && (
        <ProfileForm
          onSubmit={handleCreateProfile}
          onCancel={() => setIsCreating(false)}
          isEditing={false}
        />
      )}
      
      {/* Edit profile form */}
      {isEditing && editingProfile && (
        <ProfileForm
          initialData={editingProfile}
          onSubmit={handleUpdateProfile}
          onCancel={() => {
            setIsEditing(null);
            setEditingProfile(null);
          }}
          isEditing={true}
        />
      )}
      
    </div>
  );
} 