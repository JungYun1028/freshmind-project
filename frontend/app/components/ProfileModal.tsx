"use client";

import { useState, useEffect } from 'react';
import { useProfile } from '../contexts/ProfileContext';
import { calculateAgeGroup, UserProfile } from '../types/profile';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { profile, setProfile } = useProfile();
  
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'M' | 'F' | 'U'>('U');

  // 기존 프로필 데이터 불러오기
  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setBirthDate(profile.birthDate);
      setGender(profile.gender);
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !birthDate || !gender) {
      alert('모든 항목을 입력해주세요.');
      return;
    }

    const ageGroup = calculateAgeGroup(birthDate);
    
    const newProfile: UserProfile = {
      name,
      birthDate,
      gender,
      ageGroup
    };

    setProfile(newProfile);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {profile ? '프로필 수정' : '프로필 입력'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 이름 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이름
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                required
              />
            </div>

            {/* 생년월일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                생년월일
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                required
              />
            </div>

            {/* 성별 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                성별
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setGender('M')}
                  className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                    gender === 'M'
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  남성
                </button>
                <button
                  type="button"
                  onClick={() => setGender('F')}
                  className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                    gender === 'F'
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  여성
                </button>
                <button
                  type="button"
                  onClick={() => setGender('U')}
                  className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                    gender === 'U'
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  선택안함
                </button>
              </div>
            </div>

            {/* 미리보기 */}
            {birthDate && (
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-700">
                  <span className="font-medium">예상 연령대:</span> {calculateAgeGroup(birthDate)}
                </p>
              </div>
            )}

            {/* 버튼 */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                {profile ? '수정하기' : '저장하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

