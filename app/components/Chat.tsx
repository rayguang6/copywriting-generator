"use client";

import { useState } from 'react';
import { FiSend } from 'react-icons/fi';

type ChatProps = {
  selectedFramework: string | null;
};

export default function Chat({ selectedFramework }: ChatProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would send the prompt to an API
    console.log(`Submitting prompt: ${inputValue} with framework: ${selectedFramework || 'none'}`);
    setInputValue('');
  };

  return (
    <div className="flex flex-col h-screen w-full md:ml-[260px] bg-[#343541] text-gray-100">
      <div className="flex-1 overflow-y-auto">
        {/* Empty state / welcome screen */}
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              <div className="col-span-1 bg-[#3e3f4b] hover:bg-[#4a4b57] transition-colors p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Hi Sifu, I need help!</h3>
                <p className="text-sm text-gray-300">Get writing assistance using any copywriting framework.</p>
              </div>
              
              <div className="col-span-1 bg-[#3e3f4b] hover:bg-[#4a4b57] transition-colors p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Motivation</h3>
                <p className="text-sm text-gray-300">Get motivating copy that inspires your audience to take action.</p>
              </div>
              
              <div className="col-span-1 bg-[#3e3f4b] hover:bg-[#4a4b57] transition-colors p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Chill & Fun mood</h3>
                <p className="text-sm text-gray-300">Create casual and engaging copy for a relaxed audience.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 py-4 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-[#40414f] border border-gray-600 rounded-lg p-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Ask for copywriting help${selectedFramework ? ` using ${selectedFramework}` : ''}`}
              className="flex-1 bg-transparent border-0 outline-none p-2 text-sm"
            />
            <button
              type="submit"
              className={`p-1 rounded ${inputValue.trim() === '' ? 'text-gray-500' : 'text-white hover:bg-gray-600'}`}
              disabled={inputValue.trim() === ''}
            >
              <FiSend size={18} />
            </button>
          </form>
          <p className="text-xs text-center text-gray-400 mt-2">
            ChatGPT can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
} 