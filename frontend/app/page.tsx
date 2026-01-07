"use client";

import { useState, useMemo, useEffect } from "react";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import ProductCard from "./components/ProductCard";
import CategoryFilter from "./components/CategoryFilter";
import SortFilter from "./components/SortFilter";
import ChatBotButton from "./components/ChatBotButton";
import PurchaseSummaryBanner from "./components/PurchaseSummaryBanner";
import UserSwitchBottomSheet from "./components/UserSwitchBottomSheet";
import { products } from "./data/products";
import type { Product } from "./types/product";
import { useProfile } from "./contexts/ProfileContext";

export default function Home() {
  const { profile, isProfileSet, setProfile } = useProfile();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [sortBy, setSortBy] = useState("popular");
  const [isUserSwitchOpen, setIsUserSwitchOpen] = useState(false);

  // 프로필이 설정되면 자동으로 개인화 추천순으로 변경
  useEffect(() => {
    if (isProfileSet) {
      setSortBy("personalized");
    }
  }, [isProfileSet]);

  // 카테고리 목록 추출
  const categories = useMemo(() => {
    const uniqueCategories = new Set(products.map(p => p.category));
    return Array.from(uniqueCategories);
  }, []);

  // 프로필 기반 상품 점수 계산
  const calculatePersonalizedScore = (product: Product): number => {
    if (!isProfileSet || !profile) return 0;
    
    let score = 0;
    
    // 1. 연령대 매칭 (가중치: 50점)
    if (product.targetAge.includes(profile.ageGroup)) {
      score += 50;
    }
    
    // 2. 성별 매칭 (가중치: 40점)
    if (product.targetGender === 'all') {
      score += 10; // 모든 성별 대상은 낮은 점수
    } else if (profile.gender === 'M') {
      if (product.targetGender === 'male-oriented') {
        score += 40;
      } else if (product.targetGender === 'male') {
        score += 35;
      }
    } else if (profile.gender === 'F') {
      if (product.targetGender === 'female-oriented') {
        score += 40;
      } else if (product.targetGender === 'female') {
        score += 35;
      }
    }
    
    // 3. 연령대와 성별 조합에 따른 카테고리 가중치 (가중치: 30점)
    const categoryBonus = getCategoryBonus(profile.ageGroup, profile.gender, product.category);
    score += categoryBonus;
    
    // 4. 인기도 보너스 (가중치: 10점)
    const reviewScore = Math.min((product.reviews / 2000) * 10, 10);
    score += reviewScore;
    
    return score;
  };

  // 최근 1~2개월 내 구매한 상품 ID 목록 조회 (더미데이터)
  const getRecentPurchasedProductIds = (profile: any): number[] => {
    if (!profile) return [];
    
    // 유저별 최근 1~2개월 내 구매한 상품 ID (더미데이터)
    // 실제로는 API에서 최근 1~2개월 구매 이력 조회
    // 3개월 전에 구매한 상품은 포함하지 않음 (핫한 요리에 표시 가능)
    const recentPurchaseHistory: Record<string, number[]> = {
      '김지은': [65, 64], // 최근 1~2개월: 삼각김밥, 냉동만두 (즉석카레, 냉동볶음밥은 3개월 전 구매)
      '박민수': [66, 68], // 최근 1~2개월: 제육볶음, 짬뽕 (순두부찌개, 스테이크는 3개월 전 구매)
      '이영희': [72, 88]  // 최근 1~2개월: 순두부찌개, 그릭요거트 (치즈, 김치찌개는 3개월 전 구매)
    };
    
    return recentPurchaseHistory[profile.name] || [];
  };

  // 트렌드 점수 계산 (핫한 요리용)
  const calculateTrendScore = (product: Product): number => {
    let score = 0;
    
    // 1. 카테고리 우선순위 (밀키트/간편식 우선)
    if (product.category === '간편식/밀키트') {
      score += 100; // 최고 우선순위
      
      // subCategory별 추가 점수
      if (product.subCategory === '밀키트') {
        score += 30; // 밀키트가 가장 핫함
      } else if (product.subCategory === '즉석식품') {
        score += 20; // 즉석식품도 인기
      } else if (product.subCategory === '냉동식품') {
        score += 15; // 냉동식품도 좋음
      }
    } else if (product.category === '냉동식품') {
      score += 50; // 냉동식품도 간편식으로 분류
    } else if (['해산물', '육류/계란'].includes(product.category)) {
      score += 30; // 요리 재료도 인기
    } else {
      score += 10; // 기타 상품
    }
    
    // 2. 인기도 점수 (리뷰 수 × 평점)
    const popularityScore = (product.reviews * product.rating) / 1000;
    score += popularityScore;
    
    // 3. 최근 인기 상품 보너스 (리뷰가 많은 상품)
    if (product.reviews > 5000) {
      score += 20; // 리뷰 5000개 이상
    } else if (product.reviews > 3000) {
      score += 10; // 리뷰 3000개 이상
    }
    
    // 4. 평점 보너스
    if (product.rating >= 4.7) {
      score += 15; // 평점 4.7 이상
    } else if (product.rating >= 4.5) {
      score += 10; // 평점 4.5 이상
    }
    
    // 5. 상품명에 "밀키트", "간편식", "레토르트" 포함 시 보너스
    const nameLower = product.name.toLowerCase();
    if (nameLower.includes('밀키트') || nameLower.includes('meal kit')) {
      score += 25;
    }
    if (nameLower.includes('간편식') || nameLower.includes('즉석')) {
      score += 20;
    }
    if (nameLower.includes('레토르트') || nameLower.includes('retort')) {
      score += 25;
    }
    
    return score;
  };

  // 연령대와 성별에 따른 카테고리 보너스
  const getCategoryBonus = (ageGroup: string, gender: string, category: string): number => {
    // 20대 남성
    if (ageGroup === '20s' && gender === 'M') {
      if (['음료', '간식/과자', '냉동식품', '육류'].includes(category)) return 30;
      if (['즉석식품', '해산물'].includes(category)) return 20;
      return 5;
    }
    
    // 20대 여성
    if (ageGroup === '20s' && gender === 'F') {
      if (['과일', '샐러드', '간식/과자', '음료', '빵/베이커리'].includes(category)) return 30;
      if (['유제품', '양념/오일'].includes(category)) return 20;
      return 5;
    }
    
    // 30대 남성
    if (ageGroup === '30s' && gender === 'M') {
      if (['육류', '해산물', '음료', '즉석식품'].includes(category)) return 30;
      if (['채소', '냉동식품'].includes(category)) return 20;
      return 5;
    }
    
    // 30대 여성
    if (ageGroup === '30s' && gender === 'F') {
      if (['채소', '과일', '유제품', '곡물/견과'].includes(category)) return 30;
      if (['해산물', '육류', '빵/베이커리'].includes(category)) return 20;
      return 5;
    }
    
    // 40대 이상
    if (['40s', '50s+'].includes(ageGroup)) {
      if (['채소', '과일', '해산물', '곡물/견과'].includes(category)) return 30;
      if (['유제품', '육류', '양념/오일'].includes(category)) return 20;
      return 5;
    }
    
    return 5;
  };

  // 필터링 및 정렬된 상품
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // 카테고리 필터
    if (selectedCategory === "핫한 요리") {
      // 핫한 요리: 트렌드 상품 표시
      // 1. 최근 1~2개월 내 구매한 상품만 제외
      //    (3개월 전에 구매한 상품은 포함 가능 - 다시 추천해도 됨)
      const recentPurchasedProductIds = getRecentPurchasedProductIds(profile);
      
      // 2. 최근 1~2개월 내 구매한 상품만 필터링 제외
      //    나머지 상품(미구매 + 3개월 전 구매)은 모두 표시 가능
      filtered = filtered.filter(p => !recentPurchasedProductIds.includes(p.id));
      
      // 3. 트렌드 점수 계산 (밀키트/간편식 우선순위 + 인기도)
      filtered = filtered.map(p => {
        const trendScore = calculateTrendScore(p);
        return { ...p, _trendScore: trendScore };
      });
      
      // 4. 트렌드 점수 기준으로 정렬
      filtered.sort((a: any, b: any) => (b._trendScore || 0) - (a._trendScore || 0));
      
      // 5. 상위 30개만 표시
      filtered = filtered.slice(0, 30);
    } else if (selectedCategory !== "전체") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // 검색 필터
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.usedIn.some(use => use.toLowerCase().includes(searchQuery.toLowerCase())) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // 정렬
    const sorted = [...filtered];
    
    // 프로필이 설정된 경우 개인화 점수 추가
    if (isProfileSet && profile) {
      console.log('🔍 프로필 정보:', profile);
      sorted.forEach((product: any) => {
        product._personalizedScore = calculatePersonalizedScore(product);
      });
      console.log('📊 상위 5개 상품 점수:', sorted.slice(0, 5).map(p => ({
        name: p.name,
        category: p.category,
        score: (p as any)._personalizedScore
      })));
    }
    
    switch (sortBy) {
      case "personalized":
        // 개인화 추천순 (프로필 기반)
        if (isProfileSet) {
          console.log('✅ 개인화 추천순 정렬 실행');
          sorted.sort((a: any, b: any) => 
            (b._personalizedScore || 0) - (a._personalizedScore || 0)
          );
          console.log('🏆 정렬 후 상위 5개:', sorted.slice(0, 5).map(p => p.name));
        } else {
          // 프로필 없으면 인기순
          sorted.sort((a, b) => (b.reviews * b.rating) - (a.reviews * a.rating));
        }
        break;
      case "price-low":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "reviews":
        sorted.sort((a, b) => b.reviews - a.reviews);
        break;
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "popular":
      default:
        sorted.sort((a, b) => (b.reviews * b.rating) - (a.reviews * a.rating));
        break;
    }

    return sorted;
  }, [searchQuery, selectedCategory, sortBy, isProfileSet, profile]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleUserSelect = (selectedProfile: { name: string; birthDate: string; gender: 'M' | 'F' | 'U'; ageGroup: '10s' | '20s' | '30s' | '40s' | '50s+' }) => {
    setProfile(selectedProfile);
  };

  // user_id 계산 (더미데이터용)
  const getUserId = () => {
    if (!profile) return undefined;
    return profile.name === '김지은' ? 1 : profile.name === '박민수' ? 2 : 3;
  };

  return (
    <div className="min-h-screen bg-white">
      <Header onProfileClick={() => setIsUserSwitchOpen(true)} />
      <SearchBar onSearch={handleSearch} />
      
      {/* 구매 요약 배너 (검색창 하단, 카테고리 필터 위) */}
      <PurchaseSummaryBanner userId={getUserId()} />
      
      <CategoryFilter 
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        showHotDishes={true}
      />

      <SortFilter sortBy={sortBy} onSortChange={setSortBy} isProfileSet={isProfileSet} />
      
      <div className="px-4 py-4 pb-8">
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-medium mb-1">검색 결과가 없습니다</p>
            <p className="text-sm">다른 검색어를 입력해보세요</p>
          </div>
        )}
      </div>

      {/* 계정 전환 바텀시트 */}
      <UserSwitchBottomSheet
        isOpen={isUserSwitchOpen}
        onClose={() => setIsUserSwitchOpen(false)}
        currentProfile={profile}
        onSelectUser={handleUserSelect}
      />
      
      {/* AI 챗봇 부동 버튼 */}
      <ChatBotButton />
    </div>
  );
}
