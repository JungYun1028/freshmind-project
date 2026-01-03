"use client";

interface SortFilterProps {
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  isProfileSet: boolean;
}

export default function SortFilter({ sortBy, onSortChange, isProfileSet }: SortFilterProps) {
  const sortOptions = [
    ...(isProfileSet ? [{ value: "personalized", label: "🎯 맞춤 추천순" }] : []),
    { value: "popular", label: "인기순" },
    { value: "price-low", label: "낮은 가격순" },
    { value: "price-high", label: "높은 가격순" },
    { value: "reviews", label: "리뷰 많은순" },
    { value: "rating", label: "평점순" },
  ];

  return (
    <div className="px-4 py-2 flex items-center justify-between border-b border-gray-100">
      <p className="text-sm text-gray-600">
        총 <span className="font-semibold text-purple-600">상품</span>
      </p>
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="text-sm text-gray-700 bg-transparent border-none focus:outline-none cursor-pointer"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

