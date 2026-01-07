"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, loadProfile, saveProfile as saveProfileToStorage, clearProfile as clearProfileFromStorage } from '../types/profile';
import { mockUsers } from '../data/mockUsers';

interface ProfileContextType {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  clearProfile: () => void;
  isProfileSet: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// 기본 유저 (1번: 김지은)
const DEFAULT_USER = mockUsers[0];

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // 클라이언트에서만 로컬 스토리지 로드
  useEffect(() => {
    setIsMounted(true);
    const savedProfile = loadProfile();
    // 저장된 프로필이 없으면 기본 유저(1번)로 설정
    if (savedProfile) {
      setProfileState(savedProfile);
    } else {
      setProfileState(DEFAULT_USER);
      saveProfileToStorage(DEFAULT_USER);
    }
  }, []);

  const setProfile = (newProfile: UserProfile) => {
    setProfileState(newProfile);
    saveProfileToStorage(newProfile);
  };

  const clearProfile = () => {
    setProfileState(null);
    clearProfileFromStorage();
  };

  // 서버 사이드에서도 children을 렌더링하도록 변경
  return (
    <ProfileContext.Provider value={{
      profile,
      setProfile,
      clearProfile,
      isProfileSet: profile !== null
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}

