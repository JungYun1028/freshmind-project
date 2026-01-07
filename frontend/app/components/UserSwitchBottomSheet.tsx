"use client";

import { useEffect } from "react";
import { UserProfile } from "../types/profile";
import { mockUsers } from "../data/mockUsers";

interface UserSwitchBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile | null;
  onSelectUser: (profile: UserProfile) => void;
}

export default function UserSwitchBottomSheet({
  isOpen,
  onClose,
  currentProfile,
  onSelectUser
}: UserSwitchBottomSheetProps) {
  // ESC 키로 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getUserDescription = (user: UserProfile): string => {
    if (user.name === '김지은') {
      return '20대 대학생 여성 · 자취생 · 간편식 선호';
    } else if (user.name === '박민수') {
      return '30대 중반 직장인 남성 · 기혼 · 밀키트·요리 선호';
    } else if (user.name === '이영희') {
      return '40대 중반 직장인 여성 · 기혼 · 건강식·아동 식품 선호';
    }
    return '';
  };

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
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl transform transition-transform duration-300 ease-out">
        <div className="px-4 pt-4 pb-6">
          {/* Handle */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">계정 전환</h2>
            <p className="text-sm text-gray-500 mt-1">다른 유저 계정으로 전환하세요</p>
          </div>

          {/* User List */}
          <div className="space-y-2">
            {mockUsers.map((user, index) => {
              const isSelected = currentProfile?.name === user.name;
              const userId = index + 1;
              
              return (
                <button
                  key={userId}
                  onClick={() => {
                    onSelectUser(user);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                    isSelected
                      ? 'bg-purple-50 border-2 border-purple-500'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  {/* Avatar */}
                  <div className={`w-12 h-12 rounded-full ${getAvatarColor(user.name)} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                    {getInitials(user.name)}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{user.name}</span>
                      {isSelected && (
                        <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
                          현재
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {getUserDescription(user)}
                    </p>
                  </div>

                  {/* Arrow */}
                  <svg
                    className={`w-5 h-5 ${isSelected ? 'text-purple-600' : 'text-gray-400'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              );
            })}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full mt-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </>
  );
}

