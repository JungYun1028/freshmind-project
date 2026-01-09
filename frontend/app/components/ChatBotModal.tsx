"use client";

import { useState, useRef, useEffect } from 'react';
import { useProfile } from '../contexts/ProfileContext';
import { products } from '../data/products';
import { mockPurchaseHistory, getPurchaseHistoryByUserId } from '../data/mockPurchaseHistory';
import { getUserIdByProfile } from '../data/mockUsers';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  recommendations?: RecommendedProduct[];
}

interface RecommendedProduct {
  id: number;
  name: string;
  reason: string;
  relevance_score: number;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  category: string;
}

interface ChatBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowRecommendedProducts: (productIds: number[]) => void;
}

export default function ChatBotModal({ isOpen, onClose, onShowRecommendedProducts }: ChatBotModalProps) {
  const { profile } = useProfile();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: '안녕하세요! 🌱 FreshMind AI 쇼핑 도우미입니다.\n원하시는 식재료나 요리에 대해 물어보세요!',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 메시지 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // 구매이력 데이터 준비
      let purchaseHistory = [];
      if (profile) {
        const userId = getUserIdByProfile(profile);
        if (userId) {
          purchaseHistory = getPurchaseHistoryByUserId(userId);
        }
      }

      // Backend API 호출
      const response = await fetch('http://localhost:8001/api/chatbot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          user_profile: profile ? {
            gender: profile.gender,
            ageGroup: profile.ageGroup,
            name: profile.name,
          } : null,
          products: products,
          purchase_history: purchaseHistory,  // 구매이력 추가
        }),
      });

      if (!response.ok) {
        throw new Error('챗봇 API 오류');
      }

      const data = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: data.message,
        timestamp: new Date(),
        recommendations: data.recommended_products,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('챗봇 오류:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: '죄송합니다. 일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl sm:max-h-[80vh] h-[90vh] sm:h-auto flex flex-col shadow-2xl">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-t-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">AI 쇼핑 도우미</h2>
              <p className="text-purple-100 text-xs">
                {profile ? `${profile.name}님 전용 추천` : '맞춤 상품 추천'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${message.role === 'user' ? 'bg-purple-600 text-white' : 'bg-white text-gray-900'} rounded-2xl p-4 shadow-sm`}>
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                
                {/* 추천 상품 카드들 */}
                {message.recommendations && message.recommendations.length > 0 && (
                  <>
                    <div className="mt-4 space-y-3">
                      {message.recommendations.map((product) => (
                        <div key={product.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="flex gap-3">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-sm text-gray-900">{product.name}</h4>
                              <p className="text-xs text-gray-600 mt-1">{product.reason}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-sm font-bold text-purple-600">
                                  {product.price.toLocaleString()}원
                                </span>
                                <span className="text-xs text-gray-500">
                                  ⭐ {product.rating} ({product.reviews.toLocaleString()})
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* 추천 상품 모두 보기 버튼 */}
                    <button
                      onClick={() => {
                        const productIds = message.recommendations?.map(p => p.id) || [];
                        onShowRecommendedProducts(productIds);
                        onClose();
                      }}
                      className="mt-3 w-full py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      추천 상품 자세히 보기
                    </button>
                  </>
                )}
                
                <p className="text-xs opacity-60 mt-2">
                  {message.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* 입력 영역 */}
        <div className="p-4 bg-white border-t border-gray-200 rounded-b-3xl">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="예: 아이 간식 추천해줄래?"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-purple-600 text-white px-6 py-3 rounded-full hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              전송
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

