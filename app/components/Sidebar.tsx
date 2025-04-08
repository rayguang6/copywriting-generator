"use client";

import { useState } from 'react';
import { FiMenu, FiPlusCircle, FiLogOut, FiLogIn } from 'react-icons/fi';
import { useAuthContext } from '@/providers/AuthProvider';
import Link from 'next/link';

// Sample copywriting frameworks
const frameworks = [
  { id: 1, name: 'AIDA (Attention, Interest, Desire, Action)' },
  { id: 2, name: 'PAS (Problem, Agitate, Solution)' },
  { id: 3, name: 'BAB (Before, After, Bridge)' },
  { id: 4, name: 'The 4 Ps (Promise, Picture, Proof, Push)' },
  { id: 5, name: 'ACCA (Awareness, Comprehension, Conviction, Action)' },
  { id: 6, name: 'FAB (Features, Advantages, Benefits)' }
];

export default function Sidebar({ onSelectFramework }: { onSelectFramework: (framework: string) => void }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuthContext();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <FiMenu size={24} />
      </button>

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-[#202123] text-white w-[260px] p-2 transition-transform duration-300 ease-in-out z-40
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* New chat button at top */}
          <div className="p-2">
            <button className="flex items-center gap-3 w-full bg-transparent hover:bg-gray-700 transition border border-gray-600 rounded-md py-3 px-3 text-sm text-left">
              <FiPlusCircle size={16} />
              <span>New chat</span>
            </button>
          </div>
          
          {/* Frameworks section */}
          <div className="mt-5 flex-1 overflow-y-auto">
            <h2 className="text-xs uppercase font-semibold text-gray-400 mb-2 px-3">Frameworks</h2>
            <div className="space-y-1">
              {frameworks.map((framework) => (
                <button
                  key={framework.id}
                  className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-700 transition"
                  onClick={() => onSelectFramework(framework.name)}
                >
                  {framework.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Auth section at bottom */}
          <div className="mt-auto border-t border-gray-700 pt-2 px-2">
            {user ? (
              <>
                <div className="flex items-center gap-2 p-2 text-sm">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                    {user.email ? user.email[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-sm truncate">{user.email}</span>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full rounded-md p-2 text-sm hover:bg-gray-700 transition"
                >
                  <FiLogOut size={16} />
                  <span>Sign out</span>
                </button>
              </>
            ) : (
              <Link href="/auth" className="flex items-center gap-2 w-full rounded-md p-2 text-sm hover:bg-gray-700 transition">
                <FiLogIn size={16} />
                <span>Sign in</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 