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
import { FiPlus, FiEdit2, FiTrash2, FiStar, FiInfo, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';

export default function BusinessProfilesPage() {
  const [profiles, setProfiles] = useState<BusinessProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<BusinessProfile>>({
    name: '',
    industry: '',
    target_audience: '',
    unique_value_proposition: '',
    pain_points: '',
    brand_voice: '',
    is_default: false
  });
  
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
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      industry: '',
      target_audience: '',
      unique_value_proposition: '',
      pain_points: '',
      brand_voice: '',
      is_default: false
    });
  };
  
  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      setError('Business name is required');
      return;
    }
    
    try {
      await createBusinessProfile(formData as Omit<BusinessProfile, 'id' | 'created_at' | 'updated_at' | 'user_id'>);
      setIsCreating(false);
      resetForm();
      await loadProfiles();
    } catch (err) {
      setError('Failed to create business profile');
      console.error(err);
    }
  };
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      setError('Business name is required');
      return;
    }
    
    if (!isEditing) return;
    
    try {
      await updateBusinessProfile(isEditing, formData);
      setIsEditing(null);
      resetForm();
      await loadProfiles();
    } catch (err) {
      setError('Failed to update business profile');
      console.error(err);
    }
  };
  
  const handleEditProfile = (profile: BusinessProfile) => {
    setIsEditing(profile.id);
    setFormData({
      name: profile.name,
      industry: profile.industry || '',
      target_audience: profile.target_audience || '',
      unique_value_proposition: profile.unique_value_proposition || '',
      pain_points: profile.pain_points || '',
      brand_voice: profile.brand_voice || '',
      is_default: profile.is_default
    });
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
            <div key={profile.id} className="bg-gray-800 rounded-lg p-4 shadow">
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
                      onClick={() => handleSetDefault(profile.id)}
                      className="text-yellow-400 hover:text-yellow-300"
                      title="Set as default"
                    >
                      <FiStar />
                    </button>
                  )}
                  <button 
                    onClick={() => handleEditProfile(profile)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <FiEdit2 />
                  </button>
                  <button 
                    onClick={() => handleDeleteProfile(profile.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-8 text-center mb-8">
          <div className="flex justify-center mb-4">
            <FiInfo className="text-4xl text-blue-400" />
          </div>
          <h3 className="text-xl font-medium mb-2">No business profiles yet</h3>
          <p className="text-gray-400 mb-4">Create your first business profile to get started with copywriting.</p>
        </div>
      )}
      
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
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Create Business Profile</h2>
          <form onSubmit={handleCreateProfile}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="name">
                  Business Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="industry">
                  Industry
                </label>
                <input
                  type="text"
                  id="industry"
                  name="industry"
                  value={formData.industry || ''}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="target_audience">
                  Target Audience
                </label>
                <textarea
                  id="target_audience"
                  name="target_audience"
                  value={formData.target_audience || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="unique_value_proposition">
                  Unique Value Proposition
                </label>
                <textarea
                  id="unique_value_proposition"
                  name="unique_value_proposition"
                  value={formData.unique_value_proposition || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="pain_points">
                  Customer Pain Points
                </label>
                <textarea
                  id="pain_points"
                  name="pain_points"
                  value={formData.pain_points || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="brand_voice">
                  Brand Voice
                </label>
                <textarea
                  id="brand_voice"
                  name="brand_voice"
                  value={formData.brand_voice || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2"
                  placeholder="E.g., Professional, Casual, Friendly, Authoritative"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_default"
                  name="is_default"
                  checked={formData.is_default || false}
                  onChange={handleCheckboxChange}
                  className="mr-2"
                />
                <label htmlFor="is_default">Set as default profile</label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md"
                >
                  Create Profile
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
      
      {/* Edit profile form */}
      {isEditing && (
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Edit Business Profile</h2>
          <form onSubmit={handleUpdateProfile}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="edit-name">
                  Business Name *
                </label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="edit-industry">
                  Industry
                </label>
                <input
                  type="text"
                  id="edit-industry"
                  name="industry"
                  value={formData.industry || ''}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="edit-target_audience">
                  Target Audience
                </label>
                <textarea
                  id="edit-target_audience"
                  name="target_audience"
                  value={formData.target_audience || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="edit-unique_value_proposition">
                  Unique Value Proposition
                </label>
                <textarea
                  id="edit-unique_value_proposition"
                  name="unique_value_proposition"
                  value={formData.unique_value_proposition || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="edit-pain_points">
                  Customer Pain Points
                </label>
                <textarea
                  id="edit-pain_points"
                  name="pain_points"
                  value={formData.pain_points || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="edit-brand_voice">
                  Brand Voice
                </label>
                <textarea
                  id="edit-brand_voice"
                  name="brand_voice"
                  value={formData.brand_voice || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2"
                  placeholder="E.g., Professional, Casual, Friendly, Authoritative"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit-is_default"
                  name="is_default"
                  checked={formData.is_default || false}
                  onChange={handleCheckboxChange}
                  className="mr-2"
                />
                <label htmlFor="edit-is_default">Set as default profile</label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(null);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md"
                >
                  Update Profile
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
      
      {/* Help text */}
      <div className="mt-8 bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-medium mb-2">What are Business Profiles?</h3>
        <p>
          Business profiles help customize your copywriting experience. Each profile can store 
          specific details about a business or product, which will be used to generate more 
          relevant and targeted copy through the AI copywriting tool.
        </p>
        <div className="mt-3">
          <h4 className="font-medium">Tips for effective profiles:</h4>
          <ul className="list-disc list-inside text-sm text-gray-300 space-y-1 mt-1">
            <li>Be specific about your target audience</li>
            <li>Include key pain points your product or service addresses</li>
            <li>Define your unique value proposition clearly</li>
            <li>Specify your preferred brand voice and tone</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 