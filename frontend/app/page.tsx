"use client";

import { useState, useMemo, useEffect } from "react";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import ProductCard from "./components/ProductCard";
import CategoryFilter from "./components/CategoryFilter";
import SortFilter from "./components/SortFilter";
import ProfileModal from "./components/ProfileModal";
import ChatBotButton from "./components/ChatBotButton";
import { products } from "./data/products";
import type { Product } from "./types/product";
import { useProfile } from "./contexts/ProfileContext";

export default function Home() {
  const { profile, isProfileSet } = useProfile();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [sortBy, setSortBy] = useState("popular");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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
    if (selectedCategory !== "전체") {
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

  return (
    <div className="min-h-screen bg-white">
      <Header onProfileClick={() => setIsProfileModalOpen(true)} />
      <SearchBar onSearch={handleSearch} />
      <CategoryFilter 
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      
      <div className="bg-gray-50 py-3 px-4 mb-2">
        <p className="text-sm text-gray-600">
          {isProfileSet 
            ? `${profile?.name}님을 위한 맞춤 상품을 추천합니다 ✨`
            : '프로필을 설정하면 맞춤 상품을 추천받을 수 있어요!'
          }
        </p>
      </div>

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

      <ProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
      
      {/* AI 챗봇 부동 버튼 */}
      <ChatBotButton />
    </div>
  );
}
