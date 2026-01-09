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
import { mockPurchaseHistory, getPurchaseHistoryByUserId, getRecentPurchaseHistory } from "./data/mockPurchaseHistory";
import { getUserIdByProfile } from "./data/mockUsers";

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

  // 구매이력 기반 점수 계산
  const calculatePurchaseHistoryScore = (product: Product, purchaseHistory: ReturnType<typeof getPurchaseHistory>): number => {
    if (!purchaseHistory || purchaseHistory.purchasedProducts.length === 0) {
      return 0;
    }

    let score = 0;
    const { purchasedProducts, topCategories, repeatPurchases } = purchaseHistory;

    // 1. 반복 구매 상품 (최고 우선순위) - 가중치: 60점
    if (repeatPurchases.includes(product.id)) {
      const purchaseData = purchasedProducts.find(p => p.productId === product.id);
      if (purchaseData) {
        // 반복 구매 횟수에 따라 점수 증가
        score += 60 + (purchaseData.purchaseCount * 5); // 3회 구매면 60 + 15 = 75점
      }
    }

    // 2. 최근 구매한 상품과 같은 카테고리 - 가중치: 40점
    if (topCategories.includes(product.category)) {
      score += 40;
      
      // 최근 구매한 상품과 정확히 같은 카테고리면 추가 보너스
      const recentSameCategory = purchasedProducts.filter(
        p => p.category === product.category && p.lastPurchased <= 30
      );
      if (recentSameCategory.length > 0) {
        score += 20; // 같은 카테고리 최근 구매 보너스
      }
    }

    // 3. 최근 구매한 상품과 유사한 상품 (같은 카테고리) - 가중치: 30점
    const sameCategoryPurchases = purchasedProducts.filter(p => p.category === product.category);
    if (sameCategoryPurchases.length > 0 && !repeatPurchases.includes(product.id)) {
      score += 30;
      
      // 최근 구매일수록 높은 점수
      const mostRecent = Math.min(...sameCategoryPurchases.map(p => p.lastPurchased));
      if (mostRecent <= 30) {
        score += 15; // 최근 1개월 내 구매한 카테고리
      } else if (mostRecent <= 60) {
        score += 10; // 최근 2개월 내 구매한 카테고리
      }
    }

    // 4. 미구매 상품 중 선호 카테고리 - 가중치: 20점
    if (!purchasedProducts.some(p => p.productId === product.id) && topCategories.includes(product.category)) {
      score += 20;
    }

    return score;
  };

  // 프로필 기반 상품 점수 계산
  const calculatePersonalizedScore = (product: Product): number => {
    if (!isProfileSet || !profile) return 0;
    
    let score = 0;
    
    // 구매이력 데이터 조회
    const purchaseHistory = getPurchaseHistory(profile);
    
    // 1. 구매이력 기반 점수 (최우선, 가중치: 50점)
    const purchaseScore = calculatePurchaseHistoryScore(product, purchaseHistory);
    score += purchaseScore * 0.5; // 구매이력 점수를 50% 반영
    
    // 2. 연령대 매칭 (가중치: 30점)
    if (product.targetAge.includes(profile.ageGroup)) {
      score += 30;
    }
    
    // 3. 성별 매칭 (가중치: 20점)
    if (product.targetGender === 'all') {
      score += 5; // 모든 성별 대상은 낮은 점수
    } else if (profile.gender === 'M') {
      if (product.targetGender === 'male-oriented') {
        score += 20;
      } else if (product.targetGender === 'male') {
        score += 15;
      }
    } else if (profile.gender === 'F') {
      if (product.targetGender === 'female-oriented') {
        score += 20;
      } else if (product.targetGender === 'female') {
        score += 15;
      }
    }
    
    // 4. 연령대와 성별 조합에 따른 카테고리 가중치 (가중치: 15점)
    const categoryBonus = getCategoryBonus(profile.ageGroup, profile.gender, product.category);
    score += categoryBonus * 0.5; // 프로필 점수는 50% 반영
    
    // 5. 인기도 보너스 (가중치: 10점)
    const reviewScore = Math.min((product.reviews / 2000) * 10, 10);
    score += reviewScore;
    
    return score;
  };

  // 구매이력 데이터 조회 (실제 데이터베이스 데이터 사용)
  // mockPurchaseHistory.ts에서 실제 구매이력 데이터를 가져와서 처리
  const getPurchaseHistory = (profile: any): {
    purchasedProducts: Array<{ productId: number; category: string; purchaseCount: number; lastPurchased: number }>;
    topCategories: string[];
    repeatPurchases: number[];
  } => {
    if (!profile) {
      return { purchasedProducts: [], topCategories: [], repeatPurchases: [] };
    }

    // 프로필에서 user_id 가져오기
    const userId = getUserIdByProfile(profile);
    if (!userId) {
      return { purchasedProducts: [], topCategories: [], repeatPurchases: [] };
    }

    // 실제 구매이력 데이터 조회 (최근 6개월)
    const userPurchaseHistory = getPurchaseHistoryByUserId(userId);
    
    if (userPurchaseHistory.length === 0) {
      return { purchasedProducts: [], topCategories: [], repeatPurchases: [] };
    }

    // 상품별 구매 통계 계산
    const productStats = new Map<number, {
      productId: number;
      category: string;
      purchaseCount: number;
      lastPurchased: number; // days ago
      totalQuantity: number;
    }>();

    const now = new Date();

    userPurchaseHistory.forEach(purchase => {
      const product = products.find(p => p.id === purchase.product_id);
      if (!product) return; // 상품 정보가 없으면 스킵

      const purchaseDate = new Date(purchase.purchased_at);
      const daysAgo = Math.floor((now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));

      if (productStats.has(purchase.product_id)) {
        const existing = productStats.get(purchase.product_id)!;
        existing.purchaseCount += 1;
        existing.totalQuantity += purchase.quantity;
        // 가장 최근 구매일로 업데이트
        if (daysAgo < existing.lastPurchased) {
          existing.lastPurchased = daysAgo;
        }
      } else {
        productStats.set(purchase.product_id, {
          productId: purchase.product_id,
          category: product.category,
          purchaseCount: 1,
          lastPurchased: daysAgo,
          totalQuantity: purchase.quantity
        });
      }
    });

    // 카테고리별 구매 횟수 계산
    const categoryCounts = new Map<string, number>();
    productStats.forEach(stat => {
      categoryCounts.set(stat.category, (categoryCounts.get(stat.category) || 0) + stat.purchaseCount);
    });

    // Top 카테고리 선정 (구매 횟수 기준 상위 3개)
    const topCategories = Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);

    // 반복 구매 상품 선정 (2회 이상 구매한 상품)
    const repeatPurchases = Array.from(productStats.values())
      .filter(stat => stat.purchaseCount >= 2)
      .map(stat => stat.productId);

    // purchasedProducts 배열 생성
    const purchasedProducts = Array.from(productStats.values()).map(stat => ({
      productId: stat.productId,
      category: stat.category,
      purchaseCount: stat.purchaseCount,
      lastPurchased: stat.lastPurchased
    }));

    return {
      purchasedProducts,
      topCategories,
      repeatPurchases
    };
  };

  // 최근 1~2개월 내 구매한 상품 ID 목록 조회 (실제 데이터 사용)
  const getRecentPurchasedProductIds = (profile: any): number[] => {
    if (!profile) return [];
    
    const userId = getUserIdByProfile(profile);
    if (!userId) return [];
    
    // 최근 60일(2개월) 내 구매이력 조회
    const recentPurchases = getRecentPurchaseHistory(userId, 60);
    
    // 중복 제거하여 상품 ID 목록 반환
    const productIds = new Set(recentPurchases.map(p => p.product_id));
    return Array.from(productIds);
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
      <ChatBotButton 
        onShowRecommendedProducts={(productIds) => {
          // 추천 상품 표시 로직 (향후 구현)
          console.log('추천 상품 ID:', productIds);
        }}
      />
    </div>
  );
}
