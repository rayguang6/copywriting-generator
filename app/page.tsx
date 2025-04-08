"use client";

import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';

export default function Home() {
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null);

  const handleSelectFramework = (framework: string) => {
    setSelectedFramework(framework);
  };

  return (
    <div className="flex h-screen bg-[#343541]">
      <Sidebar onSelectFramework={handleSelectFramework} />
      <Chat selectedFramework={selectedFramework} />
    </div>
  );
}
