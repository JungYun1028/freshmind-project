export interface Product {
  id: number;
  name: string;
  category: string; // 채소, 과일, 육류, 해산물, 유제품, 간편식, 양념/소스, 쌀/면/곡물 등
  subCategory?: string;
  price: number;
  originalPrice?: number;
  description: string;
  targetAge: string[]; // ['20s', '30s', '40s', '50s+']
  targetGender: 'all' | 'male' | 'female' | 'female-oriented' | 'male-oriented';
  usedIn: string[]; // ['찌개', '볶음', '구이', '샐러드', '파스타', '국', '밥' 등]
  reviews: number;
  rating: number;
  image: string;
  tags: string[];
  stock: number;
  badge?: string;
  isKurlyOnly?: boolean;
}

export type ProductCategory = 
  | '채소'
  | '과일'
  | '육류/계란'
  | '해산물'
  | '유제품'
  | '간편식/밀키트'
  | '양념/오일'
  | '쌀/면/곡물'
  | '음료/차'
  | '냉동식품';

export type CookingMethod = 
  | '찌개/국/탕'
  | '볶음'
  | '구이'
  | '샐러드'
  | '파스타/면'
  | '밥/죽'
  | '조림/무침'
  | '튀김'
  | '생식/간식'
  | '베이킹';

