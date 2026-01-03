"use client";

import { useState } from 'react';
import ChatBotModal from './ChatBotModal';

export default function ChatBotButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 부동 버튼 - 우측 하단 */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-40 group"
        aria-label="AI 챗봇 열기"
      >
        {/* 채팅 아이콘 */}
        <svg 
          className="w-8 h-8 text-white" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
          />
        </svg>
        
        {/* 툴팁 */}
        <span className="absolute right-20 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          AI 쇼핑 도우미 💬
        </span>
        
        {/* 펄스 애니메이션 */}
        <span className="absolute inset-0 rounded-full bg-purple-600 animate-ping opacity-75"></span>
      </button>

      {/* 챗봇 모달 */}
      <ChatBotModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

