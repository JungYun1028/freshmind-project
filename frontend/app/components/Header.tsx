"use client";

import { useProfile } from '../contexts/ProfileContext';

interface HeaderProps {
  onProfileClick: () => void;
}

export default function Header({ onProfileClick }: HeaderProps) {
  const { profile, isProfileSet } = useProfile();

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
          {isProfileSet && profile && (
            <p className="text-xs text-gray-500 mt-0.5">
              {profile.name}님 ({profile.ageGroup} {profile.gender === 'M' ? '남성' : profile.gender === 'F' ? '여성' : ''})
            </p>
          )}
        </div>
        
        <button 
          onClick={onProfileClick}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {!isProfileSet && (
            <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </button>
      </div>
    </header>
  );
}

