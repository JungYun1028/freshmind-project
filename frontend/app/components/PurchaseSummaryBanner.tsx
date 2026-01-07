"use client";

import { useEffect, useState } from 'react';
import { useProfile } from '../contexts/ProfileContext';
import { selectRandomTemplate, replaceTemplateVariables } from '../data/messageTemplates';

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
    most_purchased: string;
    repeat_count: number;
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

  // API 호출 또는 더미데이터 사용
  useEffect(() => {
    const fetchPurchaseSummary = async () => {
      // 프로필이 없으면 로딩만 종료
      if (!profile || !profile.name) {
        setLoading(false);
        return;
      }

      // 더미데이터 사용 (실제 API 연동 전)
      const mockUserId = userId || (profile.name === '김지은' ? 1 : profile.name === '박민수' ? 2 : 3);
      
      try {
        // 실제 API 호출 (현재는 더미데이터)
        // const response = await fetch(`http://localhost:8001/api/users/${mockUserId}/purchase-summary`);
        // const data = await response.json();
        
        // 더미데이터
        const mockData: PurchaseSummaryData = {
          user_id: mockUserId,
          user_name: profile.name,
          total_purchases: profile.name === '김지은' ? 6 : profile.name === '박민수' ? 15 : 18,
          insights: {
            top_products: profile.name === '김지은' 
              ? [
                  { product_id: 65, product_name: '삼각김밥 모음', purchase_count: 3, weighted_score: 4.5 },
                  { product_id: 64, product_name: '냉동 만두', purchase_count: 2, weighted_score: 2.8 },
                  { product_id: 69, product_name: '즉석 카레', purchase_count: 1, weighted_score: 1.2 }
                ]
              : profile.name === '박민수'
              ? [
                  { product_id: 66, product_name: '제육볶음 밀키트', purchase_count: 4, weighted_score: 6.0 },
                  { product_id: 68, product_name: '연어', purchase_count: 3, weighted_score: 4.2 },
                  { product_id: 72, product_name: '새우살', purchase_count: 2, weighted_score: 2.8 }
                ]
              : [
                  { product_id: 72, product_name: '순두부찌개 밀키트', purchase_count: 5, weighted_score: 7.5 },
                  { product_id: 88, product_name: '그릭요거트', purchase_count: 4, weighted_score: 5.6 },
                  { product_id: 90, product_name: '치즈', purchase_count: 3, weighted_score: 4.2 }
                ],
            repeat_purchases: profile.name === '김지은'
              ? [{ product_id: 65, product_name: '삼각김밥 모음', repeat_count: 3 }]
              : profile.name === '박민수'
              ? [{ product_id: 66, product_name: '제육볶음 밀키트', repeat_count: 4 }]
              : [{ product_id: 72, product_name: '순두부찌개 밀키트', repeat_count: 5 }]
          },
          message_variables: {
            count: profile.name === '김지은' ? 6 : profile.name === '박민수' ? 15 : 18,
            products: profile.name === '김지은'
              ? '삼각김밥 모음, 냉동 만두, 즉석 카레'
              : profile.name === '박민수'
              ? '제육볶음 밀키트, 연어, 새우살'
              : '순두부찌개 밀키트, 그릭요거트, 치즈',
            most_purchased: profile.name === '김지은'
              ? '삼각김밥 모음'
              : profile.name === '박민수'
              ? '제육볶음 밀키트'
              : '순두부찌개 밀키트',
            repeat_count: profile.name === '김지은' ? 3 : profile.name === '박민수' ? 4 : 5
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

