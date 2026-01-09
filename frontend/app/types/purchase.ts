// 구매이력 타입 정의

export interface PurchaseHistory {
  userId: number;
  productId: number;
  quantity: number;
  purchasedAt: string; // ISO 8601 형식: "2025-12-29T19:47:51"
}

// 유저별 구매 통계
export interface UserPurchaseStats {
  userId: number;
  totalPurchases: number;
  totalQuantity: number;
  favoriteCategories: string[];
  frequentProducts: number[]; // product_id 배열
  lastPurchaseDate: string;
}

// 상품별 구매 통계
export interface ProductPurchaseStats {
  productId: number;
  purchaseCount: number;
  totalQuantity: number;
  uniqueBuyers: number;
}

