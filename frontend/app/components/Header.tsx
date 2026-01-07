"use client";

import { useProfile } from '../contexts/ProfileContext';

interface HeaderProps {
  onProfileClick: () => void;
}

export default function Header({ onProfileClick }: HeaderProps) {
  const { profile } = useProfile();

  const getInitials = (name: string): string => {
    return name.charAt(0);
  };

  const getAvatarColor = (name: string): string => {
    if (name === '김지은') return 'bg-pink-500';
    if (name === '박민수') return 'bg-blue-500';
    if (name === '이영희') return 'bg-purple-500';
    return 'bg-gray-500';
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        <button className="p-2 invisible">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="flex flex-col items-center">
          <h1 className="text-xl font-bold text-purple-600">FreshMind</h1>
        </div>
        
        {/* 프로필 아바타 버튼 */}
        <button 
          onClick={onProfileClick}
          className="relative hover:opacity-80 transition-opacity"
          aria-label="계정 전환"
        >
          {profile ? (
            <div className={`w-10 h-10 rounded-full ${getAvatarColor(profile.name)} flex items-center justify-center text-white font-bold text-base shadow-md`}>
              {getInitials(profile.name)}
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
          {/* 로그인 상태 표시 (작은 초록색 점) */}
          {profile && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
          )}
        </button>
      </div>
    </header>
  );
}

