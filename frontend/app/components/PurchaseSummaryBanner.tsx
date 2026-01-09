"use client";

import { useEffect, useState } from 'react';
import { useProfile } from '../contexts/ProfileContext';
import { selectRandomTemplate, replaceTemplateVariables } from '../data/messageTemplates';
import { getRecentPurchaseHistory } from '../data/mockPurchaseHistory';
import { getUserIdByProfile } from '../data/mockUsers';
import { products } from '../data/products';

interface PurchaseSummaryBannerProps {
  userId?: number; // API 호출용 user_id
}

interface PurchaseSummaryData {
  user_id: number;
  user_name: string;
  total_purchases: number;
  insights: {
    top_products: Array<{
      product_id: number;
      product_name: string;
      purchase_count: number;
      weighted_score: number;
    }>;
    repeat_purchases: Array<{
      product_id: number;
      product_name: string;
      repeat_count: number;
    }>;
  };
  message_variables: {
    count: number;
    products: string;
    mostPurchased: string; // 템플릿 변수명과 일치
    repeatCount: number; // 템플릿 변수명과 일치
  };
}

export default function PurchaseSummaryBanner({
  userId
}: PurchaseSummaryBannerProps) {
  const { profile, isProfileSet } = useProfile();
  const [summaryData, setSummaryData] = useState<PurchaseSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ mainText: string; emoji: string } | null>(null);
  const [productChips, setProductChips] = useState<string[]>([]);

  // 가중치 계산 함수들 (백엔드 purchase_insights.py와 동일한 로직)
  const calculateTimeWeight = (purchasedAt: Date): number => {
    const now = new Date();
    const daysAgo = Math.floor((now.getTime() - purchasedAt.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysAgo <= 7) return 1.5;  // 최근 1주일
    if (daysAgo <= 30) return 1.2; // 최근 1개월
    if (daysAgo <= 90) return 1.0;  // 최근 3개월
    return 0.7; // 그 이전
  };

  const calculateRepeatBonus = (purchaseCount: number): number => {
    if (purchaseCount >= 6) return 2.0;
    if (purchaseCount >= 4) return 1.5;
    if (purchaseCount >= 2) return 1.3;
    return 1.0;
  };

  const calculateQuantityWeight = (quantity: number): number => {
    if (quantity >= 4) return 1.5;
    if (quantity >= 2) return 1.2;
    return 1.0;
  };

  // 실제 구매이력 데이터 기반으로 구매 요약 계산
  useEffect(() => {
    const fetchPurchaseSummary = async () => {
      // 프로필이 없으면 로딩만 종료
      if (!profile || !profile.name) {
        setLoading(false);
        return;
      }

      const profileUserId = getUserIdByProfile(profile);
      const mockUserId = userId || profileUserId;
      
      if (!mockUserId) {
        setLoading(false);
        return;
      }

      try {
        // 실제 API 호출 (현재는 실제 구매이력 데이터 사용)
        // const response = await fetch(`http://localhost:8001/api/users/${mockUserId}/purchase-summary`);
        // const data = await response.json();
        
        // 실제 구매이력 데이터 조회 (최근 30일)
        const recentPurchases = getRecentPurchaseHistory(mockUserId, 30);
        
        if (recentPurchases.length === 0) {
          // 구매이력이 없으면 기본 메시지
          setSummaryData({
            user_id: mockUserId,
            user_name: profile.name,
            total_purchases: 0,
            insights: {
              top_products: [],
              repeat_purchases: []
            },
            message_variables: {
              count: 0,
              products: '',
              mostPurchased: '',
              repeatCount: 0
            }
          });
          setLoading(false);
          return;
        }

        // 상품별 구매 통계 계산 (백엔드 로직과 동일하게)
        const productStats = new Map<number, {
          product_id: number;
          product_name: string;
          purchase_count: number;
          total_quantity: number;
          weighted_score: number;
          last_purchased: Date;
          purchases: Array<{ date: Date; quantity: number }>; // 각 구매 기록 저장
        }>();

        // 1단계: 모든 구매 기록을 수집
        recentPurchases.forEach(purchase => {
          const product = products.find(p => p.id === purchase.productId);
          if (!product) return;

          const purchaseDate = new Date(purchase.purchasedAt);
          
          if (productStats.has(purchase.productId)) {
            const existing = productStats.get(purchase.productId)!;
            existing.purchase_count += 1;
            existing.total_quantity += purchase.quantity;
            existing.purchases.push({ date: purchaseDate, quantity: purchase.quantity });
            
            // 마지막 구매일 업데이트
            if (purchaseDate > existing.last_purchased) {
              existing.last_purchased = purchaseDate;
            }
          } else {
            productStats.set(purchase.productId, {
              product_id: purchase.productId,
              product_name: product.name,
              purchase_count: 1,
              total_quantity: purchase.quantity,
              weighted_score: 0, // 나중에 계산
              last_purchased: purchaseDate,
              purchases: [{ date: purchaseDate, quantity: purchase.quantity }]
            });
          }
        });

        // 2단계: 각 상품에 대해 가중치 점수 계산
        // 점수 = 구매횟수 × 시간가중치 × 반복구매보너스 × 수량가중치
        productStats.forEach((stats, productId) => {
          // 반복 구매 보너스 (구매 횟수 기반)
          const repeatBonus = calculateRepeatBonus(stats.purchase_count);
          
          // 각 구매마다 가중치 계산 후 합산
          let totalScore = 0;
          stats.purchases.forEach(purchase => {
            const timeWeight = calculateTimeWeight(purchase.date);
            const quantityWeight = calculateQuantityWeight(purchase.quantity);
            // 각 구매의 점수 = 1 × 시간가중치 × 수량가중치
            totalScore += 1.0 * timeWeight * quantityWeight;
          });
          
          // 반복 구매 보너스 적용 (전체 점수에 곱하기)
          stats.weighted_score = totalScore * repeatBonus;
        });

        // 가중치 점수 기준으로 정렬
        const sortedProducts = Array.from(productStats.values())
          .sort((a, b) => b.weighted_score - a.weighted_score);

        // Top 3 상품
        const topProducts = sortedProducts.slice(0, 3).map(p => ({
          product_id: p.product_id,
          product_name: p.product_name,
          purchase_count: p.purchase_count,
          weighted_score: Math.round(p.weighted_score * 100) / 100
        }));

        // 반복 구매 상품 (2회 이상)
        const repeatPurchases = sortedProducts
          .filter(p => p.purchase_count >= 2)
          .slice(0, 3)
          .map(p => ({
            product_id: p.product_id,
            product_name: p.product_name,
            repeat_count: p.purchase_count
          }));

        // 메시지 변수 생성
        const topProductNames = topProducts.map(p => p.product_name);
        const mockData: PurchaseSummaryData = {
          user_id: mockUserId,
          user_name: profile.name,
          total_purchases: recentPurchases.length,
          insights: {
            top_products: topProducts,
            repeat_purchases: repeatPurchases
          },
          message_variables: {
            count: recentPurchases.length,
            products: topProductNames.join(', '),
            mostPurchased: topProducts[0]?.product_name || '', // 템플릿 변수명과 일치
            repeatCount: repeatPurchases[0]?.repeat_count || 0 // 템플릿 변수명과 일치
          }
        };

        setSummaryData(mockData);
        
        // 메시지 템플릿 선택 및 변수 치환
        // ageGroup과 gender가 확실히 있을 때만 실행
        if (profile.ageGroup && profile.gender) {
          const template = selectRandomTemplate(profile.ageGroup, profile.gender);
          if (template && mockData) {
            const variables = {
              userName: profile.name,
              ...mockData.message_variables
            };
            const messageText = replaceTemplateVariables(template.template, variables);
            
            // 이모지 결정
            const emoji = profile.name === '김지은' ? '🏠' : profile.name === '박민수' ? '👨‍🍳' : '💚';
            
            setMessage({
              mainText: messageText,
              emoji
            });
            
            // 상품 칩 설정
            setProductChips(mockData.insights.top_products.slice(0, 3).map(p => p.product_name));
          } else {
            // 템플릿을 찾지 못한 경우 기본 메시지
            console.warn('템플릿을 찾을 수 없습니다:', profile.ageGroup, profile.gender);
            setMessage({
              mainText: `${profile.name}님, 지난 한 달간 <strong>${mockData.message_variables.count}회</strong> 구매하셨네요!`,
              emoji: '🛒'
            });
            setProductChips(mockData.insights.top_products.slice(0, 3).map(p => p.product_name));
          }
        } else {
          // ageGroup이나 gender가 없는 경우 기본 메시지
          setMessage({
            mainText: `${profile.name}님, 지난 한 달간 <strong>${mockData.message_variables.count}회</strong> 구매하셨네요!`,
            emoji: '🛒'
          });
          setProductChips(mockData.insights.top_products.slice(0, 3).map(p => p.product_name));
        }
      } catch (error) {
        console.error('Failed to fetch purchase summary:', error);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseSummary();
  }, [profile, userId]);

  const insight = message;

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border-b border-purple-100">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full animate-pulse" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border-b border-purple-100">
      <div className="px-4 py-4">
        {profile && profile.name && insight ? (
          <div className="flex items-start gap-3">
            {/* 이모지 아이콘 */}
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full flex items-center justify-center text-2xl">
                {insight.emoji}
              </div>
            </div>
            
            {/* 텍스트 영역 */}
            <div className="flex-1 min-w-0">
              <p 
                className="text-sm font-semibold text-gray-900 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: insight.mainText.split('<br/>')[0] }}
              />
              {insight.mainText.includes('<br/>') && (
                <p 
                  className="text-sm text-gray-700 leading-relaxed mt-1.5"
                  dangerouslySetInnerHTML={{ __html: insight.mainText.split('<br/>').slice(1).join('<br/>') }}
                />
              )}
              
              {/* 구매 상품 칩 (구체적인 상품명) */}
              {productChips.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {productChips.map((product, idx) => (
                    <span 
                      key={idx}
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200"
                    >
                      {product}
                    </span>
                  ))}
                  {summaryData && summaryData.total_purchases > 0 && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-pink-200 text-pink-800 border border-pink-300">
                      {summaryData.total_purchases}회 구매
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                프로필을 설정하면 나만의 구매 패턴을 분석해드려요! ✨
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

