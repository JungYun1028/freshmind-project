// 가상 유저 계정 데이터 (개발용)
import { UserProfile } from '../types/profile';

export const mockUsers: UserProfile[] = [
  {
    name: '김지은',
    birthDate: '2004-03-15',
    gender: 'F',
    ageGroup: '20s',
    occupation: '대학생',
    maritalStatus: '미혼',
    purchasePattern: '간편식 구매 선호'
  },
  {
    name: '박민수',
    birthDate: '1989-07-22',
    gender: 'M',
    ageGroup: '30s',
    occupation: '직장인',
    maritalStatus: '기혼',
    purchasePattern: '밀키트·해산물 선호'
  },
  {
    name: '이영희',
    birthDate: '1979-11-08',
    gender: 'F',
    ageGroup: '40s',
    occupation: '직장인',
    maritalStatus: '기혼',
    purchasePattern: '건강식·채소 선호'
  }
];

// 유저 ID를 키로 사용 (1, 2, 3)
export const getUserById = (userId: number): UserProfile | null => {
  if (userId >= 1 && userId <= mockUsers.length) {
    return mockUsers[userId - 1];
  }
  return null;
};

// 프로필로부터 유저 ID 찾기
export const getUserIdByProfile = (profile: UserProfile): number | null => {
  const index = mockUsers.findIndex(
    u => u.name === profile.name && 
         u.birthDate === profile.birthDate &&
         u.gender === profile.gender
  );
  return index >= 0 ? index + 1 : null;
};

