"use client";

import { useState, useEffect } from 'react';
import { BusinessProfile } from '@/lib/types';

type ProfileFormProps = {
  initialData?: Partial<BusinessProfile>;
  onSubmit: (data: Partial<BusinessProfile>) => Promise<void>;
  onCancel: () => void;
  isEditing: boolean;
};

export default function ProfileForm({ 
  initialData, 
  onSubmit, 
  onCancel,
  isEditing
}: ProfileFormProps) {
  const [formData, setFormData] = useState<Partial<BusinessProfile>>({
    name: '',
    industry: '',
    target_audience: '',
    unique_value_proposition: '',
    pain_points: '',
    brand_voice: '',
    is_default: false,
    ...initialData
  });
  
  const [error, setError] = useState<string | null>(null);
  
  // Update form when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        industry: initialData.industry || '',
        target_audience: initialData.target_audience || '',
        unique_value_proposition: initialData.unique_value_proposition || '',
        pain_points: initialData.pain_points || '',
        brand_voice: initialData.brand_voice || '',
        is_default: initialData.is_default || false
      });
    }
  }, [initialData]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      setError('Business name is required');
      return;
    }
    
    setError(null);
    await onSubmit(formData);
  };

  // Generate id prefix to ensure unique IDs between create/edit forms
  const idPrefix = isEditing ? 'edit-' : '';
  
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-semibold mb-4">
        {isEditing ? 'Edit Business Profile' : 'Create Business Profile'}
      </h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor={`${idPrefix}name`}>
              Business Name *
            </label>
            <input
              type="text"
              id={`${idPrefix}name`}
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor={`${idPrefix}industry`}>
              Industry
            </label>
            <input
              type="text"
              id={`${idPrefix}industry`}
              name="industry"
              value={formData.industry || ''}
              onChange={handleInputChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor={`${idPrefix}target_audience`}>
              Target Audience
            </label>
            <textarea
              id={`${idPrefix}target_audience`}
              name="target_audience"
              value={formData.target_audience || ''}
              onChange={handleInputChange}
              rows={3}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor={`${idPrefix}unique_value_proposition`}>
              Unique Value Proposition
            </label>
            <textarea
              id={`${idPrefix}unique_value_proposition`}
              name="unique_value_proposition"
              value={formData.unique_value_proposition || ''}
              onChange={handleInputChange}
              rows={3}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor={`${idPrefix}pain_points`}>
              Customer Pain Points
            </label>
            <textarea
              id={`${idPrefix}pain_points`}
              name="pain_points"
              value={formData.pain_points || ''}
              onChange={handleInputChange}
              rows={3}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor={`${idPrefix}brand_voice`}>
              Brand Voice
            </label>
            <textarea
              id={`${idPrefix}brand_voice`}
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
              id={`${idPrefix}is_default`}
              name="is_default"
              checked={formData.is_default || false}
              onChange={handleCheckboxChange}
              className="mr-2"
            />
            <label htmlFor={`${idPrefix}is_default`}>Set as default profile</label>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md"
            >
              {isEditing ? 'Update Profile' : 'Create Profile'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 