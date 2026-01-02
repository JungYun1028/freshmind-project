"use client";

import Image from "next/image";
import type { Product } from "../types/product";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return price.toLocaleString();
  };

  const formatReviews = (reviews: number) => {
    if (reviews >= 10000) {
      return "9,999+";
    }
    return reviews.toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-100">
      {/* 이미지 영역 */}
      <div className="relative aspect-square bg-gray-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 33vw"
        />
        
        {/* 배지 */}
        {product.badge && (
          <div className="absolute top-2 left-2 z-10">
            <span className="px-2 py-1 text-xs font-medium text-purple-600 bg-purple-50 rounded">
              {product.badge}
            </span>
          </div>
        )}
      </div>

      {/* 정보 영역 */}
      <div className="p-3">
        <p className="text-xs text-gray-500 mb-1">{product.isKurlyOnly ? "Kurly Only" : product.category}</p>
        <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 min-h-[40px]">
          {product.name}
        </h3>
        
        <div className="flex items-center gap-1 mb-2">
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.originalPrice)}원
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-base font-bold text-gray-900">
              {formatPrice(product.price)}원
            </span>
            {product.originalPrice && (
              <span className="ml-1 text-xs text-red-500 font-medium">
                ~
              </span>
            )}
          </div>
        </div>

        {product.reviews && (
          <p className="text-xs text-gray-400 mt-1">
            💬 {formatReviews(product.reviews)}
          </p>
        )}

        {/* 담기 버튼 */}
        <button className="w-full mt-3 py-2 border border-purple-600 text-purple-600 rounded-md text-sm font-medium hover:bg-purple-50 transition-colors flex items-center justify-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          담기
        </button>
      </div>
    </div>
  );
}

