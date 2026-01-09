// 구매이력 더미 데이터 (개발용 - PostgreSQL 대체)
import { PurchaseHistory } from '../types/purchase';

/**
 * 가상 유저 3명의 구매이력 (최근 6개월)
 * - 유저 1 (김지은): 20대 여성, 간편식 선호
 * - 유저 2 (박민수): 30대 남성, 밀키트·해산물 선호  
 * - 유저 3 (이영희): 40대 여성, 건강식·채소 선호
 */
export const mockPurchaseHistory: PurchaseHistory[] = [
  // 유저 1 (김지은) - 18건
  { userId: 1, productId: 23, quantity: 2, purchasedAt: '2025-12-29T19:47:51' },
  { userId: 1, productId: 24, quantity: 2, purchasedAt: '2025-12-07T21:35:30' },
  { userId: 1, productId: 41, quantity: 2, purchasedAt: '2025-11-29T20:17:24' },
  { userId: 1, productId: 90, quantity: 2, purchasedAt: '2025-11-18T21:06:58' },
  { userId: 1, productId: 42, quantity: 3, purchasedAt: '2025-11-08T21:43:33' },
  { userId: 1, productId: 90, quantity: 3, purchasedAt: '2025-10-26T19:59:44' },
  { userId: 1, productId: 23, quantity: 1, purchasedAt: '2025-10-15T19:07:29' },
  { userId: 1, productId: 42, quantity: 1, purchasedAt: '2025-10-04T21:38:48' },
  { userId: 1, productId: 42, quantity: 1, purchasedAt: '2025-09-25T19:51:10' },
  { userId: 1, productId: 41, quantity: 3, purchasedAt: '2025-09-17T19:17:13' },
  { userId: 1, productId: 41, quantity: 3, purchasedAt: '2025-09-07T19:16:13' },
  { userId: 1, productId: 24, quantity: 3, purchasedAt: '2025-08-28T18:59:56' },
  { userId: 1, productId: 24, quantity: 2, purchasedAt: '2025-08-17T21:08:21' },
  { userId: 1, productId: 42, quantity: 3, purchasedAt: '2025-08-08T18:48:49' },
  { userId: 1, productId: 23, quantity: 2, purchasedAt: '2025-07-29T19:13:35' },
  { userId: 1, productId: 42, quantity: 2, purchasedAt: '2025-07-20T20:44:15' },
  { userId: 1, productId: 23, quantity: 2, purchasedAt: '2025-07-11T21:57:13' },
  { userId: 1, productId: 23, quantity: 1, purchasedAt: '2025-12-17T18:10:13' },

  // 유저 2 (박민수) - 16건
  { userId: 2, productId: 11, quantity: 2, purchasedAt: '2026-01-06T19:36:54' },
  { userId: 2, productId: 25, quantity: 2, purchasedAt: '2025-12-28T18:26:31' },
  { userId: 2, productId: 62, quantity: 1, purchasedAt: '2025-12-15T20:25:09' },
  { userId: 2, productId: 25, quantity: 3, purchasedAt: '2025-12-02T21:23:18' },
  { userId: 2, productId: 11, quantity: 3, purchasedAt: '2025-11-17T19:53:13' },
  { userId: 2, productId: 25, quantity: 3, purchasedAt: '2025-11-02T21:22:34' },
  { userId: 2, productId: 62, quantity: 2, purchasedAt: '2025-10-21T20:15:44' },
  { userId: 2, productId: 42, quantity: 2, purchasedAt: '2025-10-06T21:31:01' },
  { userId: 2, productId: 12, quantity: 1, purchasedAt: '2025-09-23T19:49:15' },
  { userId: 2, productId: 25, quantity: 3, purchasedAt: '2025-09-13T20:12:23' },
  { userId: 2, productId: 12, quantity: 1, purchasedAt: '2025-09-02T20:07:26' },
  { userId: 2, productId: 25, quantity: 1, purchasedAt: '2025-08-23T19:24:10' },
  { userId: 2, productId: 25, quantity: 3, purchasedAt: '2025-08-14T20:28:00' },
  { userId: 2, productId: 12, quantity: 2, purchasedAt: '2025-08-05T20:35:55' },
  { userId: 2, productId: 25, quantity: 3, purchasedAt: '2025-07-26T19:33:08' },
  { userId: 2, productId: 11, quantity: 1, purchasedAt: '2025-07-11T21:28:38' },

  // 유저 3 (이영희) - 21건
  { userId: 3, productId: 25, quantity: 2, purchasedAt: '2025-12-31T19:49:51' },
  { userId: 3, productId: 25, quantity: 4, purchasedAt: '2025-12-23T20:44:20' },
  { userId: 3, productId: 2, quantity: 2, purchasedAt: '2025-12-18T21:27:19' },
  { userId: 3, productId: 41, quantity: 4, purchasedAt: '2025-12-10T19:56:03' },
  { userId: 3, productId: 25, quantity: 4, purchasedAt: '2025-11-30T20:40:19' },
  { userId: 3, productId: 5, quantity: 3, purchasedAt: '2025-11-19T18:02:25' },
  { userId: 3, productId: 41, quantity: 4, purchasedAt: '2025-11-12T20:33:10' },
  { userId: 3, productId: 5, quantity: 2, purchasedAt: '2025-11-02T19:28:59' },
  { userId: 3, productId: 1, quantity: 2, purchasedAt: '2025-10-26T18:41:09' },
  { userId: 3, productId: 25, quantity: 3, purchasedAt: '2025-10-21T21:45:04' },
  { userId: 3, productId: 1, quantity: 3, purchasedAt: '2025-10-16T20:20:09' },
  { userId: 3, productId: 25, quantity: 2, purchasedAt: '2025-10-07T21:30:04' },
  { userId: 3, productId: 25, quantity: 2, purchasedAt: '2025-09-27T20:03:07' },
  { userId: 3, productId: 25, quantity: 4, purchasedAt: '2025-09-16T18:42:05' },
  { userId: 3, productId: 5, quantity: 2, purchasedAt: '2025-09-07T20:21:56' },
  { userId: 3, productId: 1, quantity: 4, purchasedAt: '2025-08-28T19:53:15' },
  { userId: 3, productId: 1, quantity: 4, purchasedAt: '2025-08-18T18:50:52' },
  { userId: 3, productId: 2, quantity: 2, purchasedAt: '2025-08-07T19:44:53' },
  { userId: 3, productId: 1, quantity: 2, purchasedAt: '2025-07-29T18:52:23' },
  { userId: 3, productId: 25, quantity: 3, purchasedAt: '2025-07-19T20:58:34' },
  { userId: 3, productId: 25, quantity: 4, purchasedAt: '2025-07-11T21:23:41' },
];

/**
 * 특정 유저의 구매이력 조회
 */
export const getPurchaseHistoryByUserId = (userId: number): PurchaseHistory[] => {
  return mockPurchaseHistory.filter(p => p.userId === userId);
};

/**
 * 특정 상품의 구매이력 조회
 */
export const getPurchaseHistoryByProductId = (productId: number): PurchaseHistory[] => {
  return mockPurchaseHistory.filter(p => p.productId === productId);
};

/**
 * 최근 N일 내 구매이력 조회 (로컬 버전 호환성 유지)
 */
export const getRecentPurchaseHistory = (userId: number, days: number = 60): PurchaseHistory[] => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return mockPurchaseHistory.filter(item => {
    if (item.userId !== userId) return false;
    const purchaseDate = new Date(item.purchasedAt);
    return purchaseDate >= cutoffDate;
  });
};

/**
 * 유저가 최근 구매한 상품 ID 목록 (중복 제거)
 */
export const getRecentPurchasedProductIds = (userId: number, limit: number = 10): number[] => {
  const userPurchases = getPurchaseHistoryByUserId(userId)
    .sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime());
  
  const uniqueProductIds = [...new Set(userPurchases.map(p => p.productId))];
  return uniqueProductIds.slice(0, limit);
};

/**
 * 유저가 자주 구매하는 상품 ID 목록 (구매 횟수 순)
 */
export const getFrequentlyPurchasedProductIds = (userId: number, limit: number = 5): number[] => {
  const userPurchases = getPurchaseHistoryByUserId(userId);
  
  // 상품별 구매 횟수 계산
  const productCount = new Map<number, number>();
  userPurchases.forEach(p => {
    productCount.set(p.productId, (productCount.get(p.productId) || 0) + 1);
  });
  
  // 구매 횟수 순으로 정렬
  return Array.from(productCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([productId]) => productId);
};

/**
 * 유저의 총 구매 건수
 */
export const getTotalPurchaseCount = (userId: number): number => {
  return getPurchaseHistoryByUserId(userId).length;
};

/**
 * 유저의 마지막 구매 날짜
 */
export const getLastPurchaseDate = (userId: number): string | null => {
  const userPurchases = getPurchaseHistoryByUserId(userId);
  if (userPurchases.length === 0) return null;
  
  const sorted = userPurchases.sort((a, b) => 
    new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime()
  );
  
  return sorted[0].purchasedAt;
};

/**
 * 유저가 구매한 적 있는 상품인지 확인
 */
export const hasPurchasedProduct = (userId: number, productId: number): boolean => {
  return mockPurchaseHistory.some(p => p.userId === userId && p.productId === productId);
};

