/**
 * 구매이력 기반 추천 로직
 * PostgreSQL 없이도 작동하는 클라이언트 사이드 추천 시스템
 */

import { Product } from '../types/product';
import { 
  getRecentPurchasedProductIds, 
  getFrequentlyPurchasedProductIds,
  hasPurchasedProduct 
} from '../data/mockPurchaseHistory';
import { products } from '../data/products';

/**
 * 구매이력 기반 추천 점수 계산
 */
export interface RecommendationScore {
  product: Product;
  score: number;
  reasons: string[];
}

/**
 * 유저의 구매이력을 기반으로 상품 추천 점수 계산
 */
export const calculatePurchaseBasedScore = (
  userId: number,
  product: Product
): RecommendationScore => {
  let score = 0;
  const reasons: string[] = [];

  // 1. 이미 구매한 상품은 제외 (또는 낮은 점수)
  if (hasPurchasedProduct(userId, product.id)) {
    return { product, score: -100, reasons: ['이미 구매한 상품'] };
  }

  // 2. 최근 구매한 상품과 같은 카테고리 (+30점)
  const recentProductIds = getRecentPurchasedProductIds(userId, 5);
  const recentProducts = products.filter(p => recentProductIds.includes(p.id));
  const recentCategories = [...new Set(recentProducts.map(p => p.category))];
  
  if (recentCategories.includes(product.category)) {
    score += 30;
    reasons.push(`최근 구매한 ${product.category} 카테고리`);
  }

  // 3. 자주 구매하는 상품과 같은 카테고리 (+40점)
  const frequentProductIds = getFrequentlyPurchasedProductIds(userId, 3);
  const frequentProducts = products.filter(p => frequentProductIds.includes(p.id));
  const frequentCategories = [...new Set(frequentProducts.map(p => p.category))];
  
  if (frequentCategories.includes(product.category)) {
    score += 40;
    reasons.push(`자주 구매하는 ${product.category} 카테고리`);
  }

  // 4. 자주 구매하는 상품과 같은 용도 (usedIn) (+25점)
  const frequentUsedIn = frequentProducts.flatMap(p => p.usedIn);
  const commonUsedIn = product.usedIn.filter(use => frequentUsedIn.includes(use));
  
  if (commonUsedIn.length > 0) {
    score += 25;
    reasons.push(`자주 하는 요리: ${commonUsedIn[0]}`);
  }

  // 5. 인기도 보너스 (리뷰 많은 상품)
  if (product.reviews > 2000) {
    score += 15;
    reasons.push('베스트셀러');
  } else if (product.reviews > 1000) {
    score += 10;
  }

  // 6. 높은 평점 보너스
  if (product.rating >= 4.7) {
    score += 10;
    reasons.push('높은 평점');
  }

  return { product, score, reasons };
};

/**
 * 구매이력 기반 추천 상품 목록 생성
 */
export const getRecommendedProducts = (
  userId: number,
  allProducts: Product[],
  limit: number = 20
): RecommendationScore[] => {
  // 모든 상품에 대해 점수 계산
  const scoredProducts = allProducts.map(product => 
    calculatePurchaseBasedScore(userId, product)
  );

  // 이미 구매한 상품 제외
  const notPurchased = scoredProducts.filter(sp => sp.score >= 0);

  // 점수 순으로 정렬
  return notPurchased
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

/**
 * "핫한 요리" 탭 - 구매하지 않은 트렌드 상품
 */
export const getTrendingUnpurchasedProducts = (
  userId: number,
  allProducts: Product[],
  limit: number = 20
): Product[] => {
  // 구매하지 않은 상품만
  const unpurchased = allProducts.filter(p => !hasPurchasedProduct(userId, p.id));

  // 리뷰 수 × 평점으로 인기도 계산
  const trending = unpurchased
    .map(p => ({
      product: p,
      popularity: p.reviews * p.rating
    }))
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);

  return trending.map(t => t.product);
};

/**
 * 프로필 & 구매이력 통합 점수 계산
 */
export const calculateIntegratedScore = (
  userId: number,
  product: Product,
  profileScore: number
): number => {
  const purchaseScore = calculatePurchaseBasedScore(userId, product);
  
  // 구매이력 점수 (60%) + 프로필 점수 (40%)
  return purchaseScore.score * 0.6 + profileScore * 0.4;
};

