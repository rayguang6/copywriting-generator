"use client";

import { useState, useEffect, useRef } from 'react';
import { FiSend, FiInfo, FiCopy, FiCheck } from 'react-icons/fi';
import { BusinessProfile, CopywritingFramework } from '@/lib/types';
import { getDefaultBusinessProfile, getUserBusinessProfiles } from '@/lib/business-profile-service';
import { generateCopy } from '@/lib/ai-service';
import Link from 'next/link';
import { useAuthContext } from '@/providers/AuthProvider';
import ReactMarkdown from 'react-markdown';

type ChatProps = {
  selectedFramework: string | null;
};

export default function Chat({ selectedFramework }: ChatProps) {
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCopy, setGeneratedCopy] = useState<string | null>(null);
  const [businessProfiles, setBusinessProfiles] = useState<BusinessProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<BusinessProfile | null>(null);
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthContext();

  // Load business profiles
  useEffect(() => {
    if (!user) return;
    
    const loadProfiles = async () => {
      try {
        setLoading(true);
        // Get all profiles
        const profiles = await getUserBusinessProfiles();
        setBusinessProfiles(profiles);
        
        // Try to get default profile
        const defaultProfile = await getDefaultBusinessProfile();
        if (defaultProfile) {
          setSelectedProfile(defaultProfile);
        } else if (profiles.length > 0) {
          // If no default, use first profile
          setSelectedProfile(profiles[0]);
        }
      } catch (error) {
        console.error('Error loading business profiles:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProfiles();
  }, [user]);

  // Scroll to bottom when new content is generated
  useEffect(() => {
    if (generatedCopy && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [generatedCopy]);

  // Reset copy to clipboard status after 2 seconds
  useEffect(() => {
    if (copiedToClipboard) {
      const timeout = setTimeout(() => {
        setCopiedToClipboard(false);
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [copiedToClipboard]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;
    
    try {
      setIsGenerating(true);
      setError(null);
      
      // Get selected framework from the enum if available
      const framework = selectedFramework ? 
        Object.values(CopywritingFramework).find(f => f === selectedFramework) : 
        undefined;
      
      // Generate copy with the AI service
      const generatedText = await generateCopy({
        prompt: inputValue,
        framework: framework as CopywritingFramework | undefined,
        businessProfile: selectedProfile
      });
      
      setGeneratedCopy(generatedText);
      setInputValue('');
    } catch (err) {
      console.error('Error generating copy:', err);
      setError('Failed to generate copy. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleProfileSelector = () => {
    setShowProfileSelector(!showProfileSelector);
  };

  const selectProfile = (profile: BusinessProfile) => {
    setSelectedProfile(profile);
    setShowProfileSelector(false);
  };

  const handleCopyToClipboard = async () => {
    if (!generatedCopy) return;
    
    try {
      await navigator.clipboard.writeText(generatedCopy);
      setCopiedToClipboard(true);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleNewChat = () => {
    setGeneratedCopy(null);
    setError(null);
    setInputValue('');
  };

  return (
    <div className="flex flex-col h-screen w-full md:ml-[260px] bg-[#343541] text-gray-100">
      <div className="flex-1 overflow-y-auto" ref={chatContainerRef}>
        {generatedCopy ? (
          // Display generated copy
          <div className="py-8 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-semibold">
                  {selectedFramework || 'AIDA Framework'} Copy
                </h2>
                <div className="flex gap-2">
                  <button 
                    onClick={handleCopyToClipboard}
                    className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 py-1 px-3 rounded text-sm"
                  >
                    {copiedToClipboard ? (
                      <>
                        <FiCheck size={14} />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <FiCopy size={14} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                  <button 
                    onClick={handleNewChat}
                    className="bg-blue-600 hover:bg-blue-500 py-1 px-3 rounded text-sm"
                  >
                    New Chat
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6 prose prose-invert max-w-none">
                <ReactMarkdown>
                  {generatedCopy}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ) : (
          // Empty state / welcome screen
          <div className="h-full flex flex-col items-center justify-center text-center pb-32">
            <div className="w-full max-w-[800px] flex flex-col items-center px-4">
              <div className="w-12 h-12 rounded-full bg-[#10a37f] text-white flex items-center justify-center mb-8">
                <svg width="41" height="41" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg" strokeWidth="1.5" className="h-6 w-6">
                  <path d="M37.5324 16.8707C37.9808 15.5241 38.1363 14.0974 37.9886 12.6859C37.8409 11.2744 37.3934 9.91076 36.676 8.68622C35.6126 6.83404 33.9882 5.3676 32.0373 4.4985C30.0864 3.62941 27.9098 3.40259 25.8215 3.85078C24.8796 2.7893 23.7219 1.94125 22.4257 1.36341C21.1295 0.785575 19.7249 0.491269 18.3058 0.500197C16.1708 0.495044 14.0893 1.16803 12.3614 2.42214C10.6335 3.67624 9.34853 5.44666 8.6917 7.47815C7.30085 7.76286 5.98686 8.3414 4.8377 9.17505C3.68854 10.0087 2.73073 11.0782 2.02839 12.312C0.956464 14.1591 0.498905 16.2988 0.721698 18.4228C0.944492 20.5467 1.83612 22.5449 3.268 24.1293C2.81966 25.4759 2.66413 26.9026 2.81182 28.3141C2.95951 29.7256 3.40701 31.0892 4.12437 32.3138C5.18791 34.1659 6.8123 35.6322 8.76321 36.5013C10.7141 37.3704 12.8907 37.5973 14.9789 37.1492C15.9208 38.2107 17.0786 39.0587 18.3747 39.6366C19.6709 40.2144 21.0755 40.5087 22.4946 40.4998C24.6307 40.5054 26.7133 39.8321 28.4418 38.5772C30.1704 37.3223 31.4556 35.5506 32.1119 33.5179C33.5027 33.2332 34.8167 32.6547 35.9659 31.821C37.115 30.9874 38.0728 29.9178 38.7752 28.684C39.8458 26.8371 40.3023 24.6979 40.0789 22.5748C39.8556 20.4517 38.9639 18.4544 37.5324 16.8707ZM22.4978 37.8849C20.7443 37.8874 19.0459 37.2733 17.6994 36.1501C17.7601 36.117 17.8666 36.0586 17.936 36.0161L25.9004 31.4156C26.1003 31.3019 26.2663 31.137 26.3813 30.9378C26.4964 30.7386 26.5563 30.5124 26.5549 30.2825V19.0542L29.9213 20.998C29.9389 21.0068 29.9541 21.0198 29.9656 21.0359C29.977 21.052 29.9842 21.0707 29.9867 21.0902V30.3889C29.9842 32.375 29.1946 34.2791 27.7909 35.6841C26.3872 37.0892 24.4838 37.8806 22.4978 37.8849ZM6.39227 31.0064C5.51397 29.5047 5.19742 27.7951 5.49804 26.1404C5.55718 26.1772 5.66048 26.2249 5.73461 26.2561L13.699 30.8567C13.8975 30.9632 14.1233 31.0178 14.3532 31.0178C14.583 31.0178 14.8088 30.9632 15.0073 30.8567L24.731 25.1313V28.9979C24.7321 29.0177 24.7283 29.0376 24.7199 29.0556C24.7115 29.0736 24.6988 29.0893 24.6829 29.1012L16.6317 33.7497C14.9096 34.7416 12.8643 35.0097 10.9447 34.4954C9.02506 33.9811 7.38785 32.7263 6.39227 31.0064ZM4.29707 13.6194C5.17156 12.0998 6.55279 10.9364 8.19885 10.3327C8.19885 10.4013 8.19491 10.5228 8.19491 10.6071V19.808C8.19351 20.0378 8.25334 20.2638 8.36823 20.4629C8.48312 20.6619 8.64893 20.8267 8.84863 20.9404L18.5723 26.6659L15.206 28.6095C15.1894 28.6183 15.1703 28.6234 15.1505 28.6243C15.1307 28.6253 15.111 28.6222 15.0924 28.6154L7.04046 23.9694C5.32135 22.9754 4.06716 21.4277 3.48284 19.6138C2.89852 17.7999 3.01766 15.8358 3.82707 14.1121C3.98001 13.7878 4.16061 13.4767 4.36876 13.1818C4.34711 13.1664 4.32572 13.1506 4.30484 13.1345C4.27038 13.0923 4.29707 13.6194 4.29707 13.6194ZM19.0205 9.80873L9.27892 15.5341L5.91258 13.5905C5.89365 13.58 5.87799 13.5653 5.86724 13.5472C5.8565 13.5291 5.85113 13.5085 5.85178 13.4877V8.96572C5.85382 7.38087 6.4377 5.86772 7.47528 4.74648C8.51286 3.62524 9.92663 2.97631 11.4146 2.93778C12.9026 2.89926 14.3474 3.47941 15.4372 4.5517C16.527 5.62399 17.1647 7.09906 17.1711 8.6429L17.1724 9.80873H19.0205ZM20.9173 23.6075L27.2261 19.8498V14.3159C27.2261 14.2791 27.2199 14.1693 27.2137 14.1187C27.1616 13.625 26.9798 13.1543 26.6881 12.7559C26.3964 12.3574 26.0052 12.0435 25.5548 11.8482L20.9173 9.30426V23.6075ZM22.2591 7.42386L27.4145 10.2242C27.4244 10.2307 27.4337 10.2384 27.4425 10.2473C27.4513 10.2561 27.459 10.2661 27.4655 10.277V13.316L22.2591 16.2161V7.42386ZM14.835 27.1755L11.6233 25.1114V19.8985L14.835 21.9324L17.7533 23.6075V28.8402L14.835 27.1755Z" fill="currentColor"></path>
                </svg>
              </div>
              
              {selectedFramework && (
                <h1 className="text-3xl font-semibold mb-8">{selectedFramework}</h1>
              )}
              
              {error && (
                <div className="mb-6 bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-md w-full max-w-2xl">
                  <p>{error}</p>
                </div>
              )}
              
              <div className="bg-[#3e3f4b] p-6 rounded-lg w-full max-w-2xl">
                <h3 className="text-xl font-medium mb-4">Generate Copywriting</h3>
                <p className="text-gray-300 mb-4">
                  Enter a topic or product description below to generate marketing copy{selectedFramework ? ` using the ${selectedFramework} framework` : ''}:
                </p>
                {selectedFramework === CopywritingFramework.AIDA ? (
                  <ul className="list-disc list-inside text-sm text-gray-300 mb-4 space-y-1">
                    <li><strong>Attention:</strong> Grab the audience's attention</li>
                    <li><strong>Interest:</strong> Generate interest with compelling details</li>
                    <li><strong>Desire:</strong> Create desire for the product/service</li>
                    <li><strong>Action:</strong> Prompt the audience to take action</li>
                  </ul>
                ) : selectedFramework === CopywritingFramework.FAB ? (
                  <ul className="list-disc list-inside text-sm text-gray-300 mb-4 space-y-1">
                    <li><strong>Features:</strong> List the product's features</li>
                    <li><strong>Advantages:</strong> Explain the advantages of these features</li>
                    <li><strong>Benefits:</strong> Emphasize the benefits users will experience</li>
                  </ul>
                ) : (
                  <p className="text-sm text-gray-300 mb-4">
                    Select a framework from the sidebar to get started.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-700 py-4 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Business Profile Selector */}
          {user && (
            <div className="mb-2 relative">
              <button 
                onClick={toggleProfileSelector}
                className="text-sm text-gray-300 hover:text-white flex items-center gap-1"
              >
                <span className="font-medium">Business Profile:</span>
                <span className="text-white">{selectedProfile ? selectedProfile.name : 'None'}</span>
                <span className="ml-1 text-xs">{showProfileSelector ? '▲' : '▼'}</span>
              </button>
              
              {showProfileSelector && (
                <div className="absolute left-0 bottom-full mb-1 bg-gray-800 border border-gray-700 rounded-md w-64 shadow-lg z-10">
                  {businessProfiles.length > 0 ? (
                    <div className="py-1">
                      {businessProfiles.map(profile => (
                        <button
                          key={profile.id}
                          className={`block w-full text-left px-4 py-2 text-sm ${selectedProfile?.id === profile.id ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                          onClick={() => selectProfile(profile)}
                        >
                          {profile.name}
                          {profile.is_default && (
                            <span className="ml-2 text-xs text-blue-400">(Default)</span>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 text-sm text-gray-400">
                      <div className="flex items-center gap-2 mb-1">
                        <FiInfo className="text-blue-400" />
                        <span>No business profiles yet</span>
                      </div>
                      <Link href="/business-profiles" className="text-blue-400 hover:underline text-xs">
                        Create a profile
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Message Input */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-[#40414f] border border-gray-600 rounded-lg p-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Enter a topic or product description${selectedFramework ? ` for ${selectedFramework}` : ''}`}
              className="flex-1 bg-transparent border-0 outline-none p-2 text-sm"
              disabled={isGenerating}
            />
            <button
              type="submit"
              className={`p-1 rounded ${inputValue.trim() === '' || isGenerating ? 'text-gray-500' : 'text-white hover:bg-gray-600'}`}
              disabled={inputValue.trim() === '' || isGenerating}
            >
              <FiSend size={18} />
            </button>
          </form>
          
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-400 mt-2">
              {isGenerating ? "Generating..." : "Powered by Deepseek AI"}
            </p>
            
            {!user && (
              <Link href="/auth" className="text-xs text-blue-400 hover:underline mt-2">
                Sign in to use business profiles
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 