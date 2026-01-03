// 프로필 타입 정의
export interface UserProfile {
  name: string;
  birthDate: string; // YYYY-MM-DD
  gender: 'M' | 'F' | 'U';
  ageGroup: '10s' | '20s' | '30s' | '40s' | '50s+';
}

// 생년월일로 나이대 계산
export function calculateAgeGroup(birthDate: string): '10s' | '20s' | '30s' | '40s' | '50s+' {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  if (age < 20) return '10s';
  if (age < 30) return '20s';
  if (age < 40) return '30s';
  if (age < 50) return '40s';
  return '50s+';
}

// 프로필을 로컬 스토리지에 저장
export function saveProfile(profile: UserProfile) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('userProfile', JSON.stringify(profile));
  }
}

// 프로필을 로컬 스토리지에서 불러오기
export function loadProfile(): UserProfile | null {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : null;
  }
  return null;
}

// 프로필 삭제
export function clearProfile() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userProfile');
  }
}

