/**
 * 구매이력 더미데이터
 * 
 * 실제 데이터베이스에서 추출한 구매이력 데이터를 여기에 넣어주세요.
 * 데이터 구조:
 * - user_id: 사용자 ID (1, 2, 3)
 * - product_id: 상품 ID
 * - quantity: 구매 수량
 * - purchased_at: 구매일시 (ISO 8601 형식: "YYYY-MM-DDTHH:mm:ss.sssZ")
 */

export interface PurchaseHistoryItem {
  purchase_id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  purchased_at: string; // ISO 8601 형식
}

// 실제 구매이력 데이터를 여기에 넣어주세요
// 동료가 데이터베이스에서 추출한 데이터를 아래 배열에 추가하면 됩니다.
export const mockPurchaseHistory: PurchaseHistoryItem[] = [
  // 예시 데이터 구조:
  // {
  //   purchase_id: 1,
  //   user_id: 1,
  //   product_id: 65,
  //   quantity: 2,
  //   purchased_at: "2024-12-01T10:30:00.000Z"
  // },
  // ... 실제 데이터를 여기에 추가
];

/**
 * 구매이력을 사용자 ID로 필터링
 */
export function getPurchaseHistoryByUserId(userId: number): PurchaseHistoryItem[] {
  return mockPurchaseHistory.filter(item => item.user_id === userId);
}

/**
 * 구매이력을 상품 ID로 필터링
 */
export function getPurchaseHistoryByProductId(productId: number): PurchaseHistoryItem[] {
  return mockPurchaseHistory.filter(item => item.product_id === productId);
}

/**
 * 최근 N일 내 구매이력 조회
 */
export function getRecentPurchaseHistory(userId: number, days: number = 60): PurchaseHistoryItem[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return mockPurchaseHistory.filter(item => {
    if (item.user_id !== userId) return false;
    const purchaseDate = new Date(item.purchased_at);
    return purchaseDate >= cutoffDate;
  });
}

