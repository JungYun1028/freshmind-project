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
  const [recommendedProductIds, setRecommendedProductIds] = useState<number[]>([]);

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

    // 1. 반복 구매 상품 (최고 우선순위) - 가중치: 100점 (강화)
    if (repeatPurchases.includes(product.id)) {
      const purchaseData = purchasedProducts.find(p => p.productId === product.id);
      if (purchaseData) {
        // 반복 구매 횟수에 따라 점수 증가 (더 강하게)
        score += 100 + (purchaseData.purchaseCount * 10); // 3회 구매면 100 + 30 = 130점
        // 최근 구매일수록 높은 점수
        if (purchaseData.lastPurchased <= 30) {
          score += 20; // 최근 1개월 내 반복 구매
        } else if (purchaseData.lastPurchased <= 60) {
          score += 10; // 최근 2개월 내 반복 구매
        }
      }
    }

    // 2. 최근 구매한 상품과 같은 카테고리 - 가중치: 60점 (강화)
    if (topCategories.includes(product.category)) {
      score += 60;
      
      // 최근 구매한 상품과 정확히 같은 카테고리면 추가 보너스
      const recentSameCategory = purchasedProducts.filter(
        p => p.category === product.category && p.lastPurchased <= 30
      );
      if (recentSameCategory.length > 0) {
        score += 30; // 같은 카테고리 최근 구매 보너스 (강화)
      }
    }

    // 3. 최근 구매한 상품과 유사한 상품 (같은 카테고리) - 가중치: 50점 (강화)
    const sameCategoryPurchases = purchasedProducts.filter(p => p.category === product.category);
    if (sameCategoryPurchases.length > 0 && !repeatPurchases.includes(product.id)) {
      score += 50;
      
      // 최근 구매일수록 높은 점수
      const mostRecent = Math.min(...sameCategoryPurchases.map(p => p.lastPurchased));
      if (mostRecent <= 30) {
        score += 25; // 최근 1개월 내 구매한 카테고리 (강화)
      } else if (mostRecent <= 60) {
        score += 15; // 최근 2개월 내 구매한 카테고리
      }
    }

    // 4. 미구매 상품 중 선호 카테고리 - 가중치: 30점 (강화)
    if (!purchasedProducts.some(p => p.productId === product.id) && topCategories.includes(product.category)) {
      score += 30;
    }

    return score;
  };

  // 프로필 기반 상품 점수 계산
  const calculatePersonalizedScore = (product: Product): number => {
    if (!isProfileSet || !profile) return 0;
    
    let score = 0;
    
    // 구매이력 데이터 조회
    const purchaseHistory = getPurchaseHistory(profile);
    
    // 1. 구매이력 기반 점수 (최우선, 가중치: 80%) - 강화
    const purchaseScore = calculatePurchaseHistoryScore(product, purchaseHistory);
    score += purchaseScore * 0.8; // 구매이력 점수를 80% 반영 (50% → 80%로 증가)
    
    // 구매이력이 있는 경우 구매이력 점수가 지배적이 되도록 함
    if (purchaseScore > 0) {
      // 구매이력 점수가 있으면 프로필/인기도 점수는 보조적으로만 사용
      // 2. 연령대 매칭 (가중치: 10점으로 감소)
      if (product.targetAge.includes(profile.ageGroup)) {
        score += 10;
      }
      
      // 3. 성별 매칭 (가중치: 8점으로 감소)
      if (product.targetGender === 'all') {
        score += 2; // 모든 성별 대상은 낮은 점수
      } else if (profile.gender === 'M') {
        if (product.targetGender === 'male-oriented') {
          score += 8;
        } else if (product.targetGender === 'male') {
          score += 6;
        }
      } else if (profile.gender === 'F') {
        if (product.targetGender === 'female-oriented') {
          score += 8;
        } else if (product.targetGender === 'female') {
          score += 6;
        }
      }
      
      // 4. 연령대와 성별 조합에 따른 카테고리 가중치 (가중치: 5점으로 감소)
      const categoryBonus = getCategoryBonus(profile.ageGroup, profile.gender, product.category);
      score += categoryBonus * 0.2; // 프로필 점수는 20% 반영 (50% → 20%로 감소)
      
      // 5. 인기도 보너스 (가중치: 5점으로 감소, 구매이력이 있을 때는 낮게)
      const reviewScore = Math.min((product.reviews / 2000) * 5, 5);
      score += reviewScore;
    } else {
      // 구매이력이 없는 경우 프로필 기반 점수를 더 강하게 적용
      // 2. 연령대 매칭 (가중치: 25점)
      if (product.targetAge.includes(profile.ageGroup)) {
        score += 25;
      }
      
      // 3. 성별 매칭 (가중치: 20점)
      if (product.targetGender === 'all') {
        score += 5;
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
      
      // 4. 연령대와 성별 조합에 따른 카테고리 가중치
      const categoryBonus = getCategoryBonus(profile.ageGroup, profile.gender, product.category);
      score += categoryBonus * 0.5;
      
      // 5. 인기도 보너스 (구매이력이 없을 때는 더 높게)
      const reviewScore = Math.min((product.reviews / 2000) * 15, 15);
      score += reviewScore;
    }
    
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
      const product = products.find(p => p.id === purchase.productId);
      if (!product) return; // 상품 정보가 없으면 스킵

      const purchaseDate = new Date(purchase.purchasedAt);
      const daysAgo = Math.floor((now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));

      if (productStats.has(purchase.productId)) {
        const existing = productStats.get(purchase.productId)!;
        existing.purchaseCount += 1;
        existing.totalQuantity += purchase.quantity;
        // 가장 최근 구매일로 업데이트
        if (daysAgo < existing.lastPurchased) {
          existing.lastPurchased = daysAgo;
        }
      } else {
        productStats.set(purchase.productId, {
          productId: purchase.productId,
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
    const productIds = new Set(recentPurchases.map(p => p.productId));
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

    // AI 추천 상품 필터 (최우선)
    if (recommendedProductIds.length > 0) {
      filtered = filtered.filter(p => recommendedProductIds.includes(p.id));
      return filtered; // 추천 상품만 표시하고 바로 리턴
    }

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
      
      // 4. 트렌드 점수 기준으로 기본 정렬 (나중에 사용자 정렬 옵션에 따라 재정렬됨)
      filtered.sort((a: any, b: any) => (b._trendScore || 0) - (a._trendScore || 0));
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
      // 구매이력 데이터 확인
      const purchaseHistory = getPurchaseHistory(profile);
      console.log('🔍 프로필 정보:', profile);
      console.log('📦 구매이력 통계:', {
        totalProducts: purchaseHistory.purchasedProducts.length,
        topCategories: purchaseHistory.topCategories,
        repeatPurchases: purchaseHistory.repeatPurchases,
        sampleProducts: purchaseHistory.purchasedProducts.slice(0, 5)
      });
      
      sorted.forEach((product: any) => {
        product._personalizedScore = calculatePersonalizedScore(product);
      });
      
      // 구매이력 점수 상세 확인 (정렬 전)
      const purchaseHistoryForDebug = getPurchaseHistory(profile);
      const topScoredProducts = sorted
        .slice(0, 10)
        .map((p: any) => {
          const purchaseScore = calculatePurchaseHistoryScore(p, purchaseHistoryForDebug);
          return {
            name: p.name,
            category: p.category,
            id: p.id,
            totalScore: (p as any)._personalizedScore,
            purchaseScore: purchaseScore,
            isRepeatPurchase: purchaseHistoryForDebug.repeatPurchases.includes(p.id),
            isTopCategory: purchaseHistoryForDebug.topCategories.includes(p.category)
          };
        });
      
      console.log('📊 상위 10개 상품 점수 상세:', topScoredProducts);
    }
    
    // "핫한 요리" 탭인 경우 정렬 옵션에 따라 정렬
    if (selectedCategory === "핫한 요리") {
      switch (sortBy) {
        case "personalized":
          // 개인화 추천순: 트렌드 점수 + 개인화 점수 조합
          if (isProfileSet) {
            sorted.sort((a: any, b: any) => {
              const scoreA = ((b._trendScore || 0) * 0.3) + ((b._personalizedScore || 0) * 0.7);
              const scoreB = ((a._trendScore || 0) * 0.3) + ((a._personalizedScore || 0) * 0.7);
              return scoreA - scoreB;
            });
          } else {
            // 프로필 없으면 트렌드 점수 기준
            sorted.sort((a: any, b: any) => (b._trendScore || 0) - (a._trendScore || 0));
          }
          break;
        case "price-low":
          // 가격 낮은순: 가격 기준 정렬, 동일 가격이면 트렌드 점수 높은 순
          sorted.sort((a: any, b: any) => {
            if (a.price !== b.price) return a.price - b.price;
            return (b._trendScore || 0) - (a._trendScore || 0);
          });
          break;
        case "price-high":
          // 가격 높은순: 가격 기준 정렬, 동일 가격이면 트렌드 점수 높은 순
          sorted.sort((a: any, b: any) => {
            if (a.price !== b.price) return b.price - a.price;
            return (b._trendScore || 0) - (a._trendScore || 0);
          });
          break;
        case "reviews":
          // 리뷰 많은순: 리뷰 수 기준 정렬, 동일 리뷰 수면 트렌드 점수 높은 순
          sorted.sort((a: any, b: any) => {
            if (a.reviews !== b.reviews) return b.reviews - a.reviews;
            return (b._trendScore || 0) - (a._trendScore || 0);
          });
          break;
        case "rating":
          // 평점 높은순: 평점 기준 정렬, 동일 평점이면 트렌드 점수 높은 순
          sorted.sort((a: any, b: any) => {
            if (a.rating !== b.rating) return b.rating - a.rating;
            return (b._trendScore || 0) - (a._trendScore || 0);
          });
          break;
        case "popular":
        default:
          // 인기순: 트렌드 점수 기준 (기본값)
          sorted.sort((a: any, b: any) => (b._trendScore || 0) - (a._trendScore || 0));
          break;
      }
    } else {
      // 일반 카테고리 정렬
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
    }

    return sorted;
  }, [searchQuery, selectedCategory, sortBy, isProfileSet, profile, recommendedProductIds]);

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
      
      {/* AI 추천 상품 표시 중일 때 배너 */}
      {recommendedProductIds.length > 0 && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 shadow-lg">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <span className="font-semibold">AI 추천 상품 {recommendedProductIds.length}개</span>
            </div>
            <button
              onClick={() => setRecommendedProductIds([])}
              className="flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-sm font-medium transition-colors"
            >
              <span>전체 상품 보기</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* AI 챗봇 부동 버튼 */}
      <ChatBotButton 
        onShowRecommendedProducts={(productIds) => {
          setRecommendedProductIds(productIds);
          setSelectedCategory("전체"); // 카테고리 필터 초기화
          setSortBy("popular"); // 정렬 초기화
          window.scrollTo({ top: 0, behavior: 'smooth' }); // 맨 위로 스크롤
        }}
      />
    </div>
  );
}
