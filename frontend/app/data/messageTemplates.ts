/**
 * 구매 요약 배너 메시지 템플릿
 * 유저별로 여러 템플릿을 준비하여 랜덤하게 선택
 */

export interface MessageTemplate {
  id: number;
  template: string;
  weight: number; // 선택 가중치 (높을수록 자주 선택됨)
}

export interface MessageTemplates {
  [key: string]: MessageTemplate[];
}

export const messageTemplates: MessageTemplates = {
  // 20대 여성 (김지은)
  '20s_female': [
    {
      id: 1,
      template: '{userName}님, 지난 한 달간 <strong>{count}회</strong> 구매하셨네요!<br/>{products} 같은 간편식을 자주 주문하시는 걸 보니 바쁜 일상 속에서도 꼼꼼하게 끼니를 챙기시는군요! 오늘도 간단하게 해결할 수 있는 상품을 준비했어요 🍱',
      weight: 1.0
    },
    {
      id: 2,
      template: '{userName}님, 지난 한 달간 <strong>{count}회</strong> 구매하셨네요!<br/>{products}를 즐겨 주문하시는 걸 보니 가성비 좋은 상품을 잘 찾으시는군요! 오늘도 합리적인 가격의 상품을 추천해드릴게요 💰',
      weight: 0.8
    },
    {
      id: 3,
      template: '{userName}님, 지난 한 달간 <strong>{count}회</strong> 구매하셨네요!<br/>{products} 같은 즉석식품을 자주 주문하시는 걸 보니 시간 절약을 중시하시는군요! 오늘도 빠르게 준비할 수 있는 상품을 골라봤어요 ⚡',
      weight: 0.9
    },
    {
      id: 4,
      template: '{userName}님, 지난 한 달간 <strong>{count}회</strong> 구매하셨네요!<br/>{products}를 꾸준히 주문하시는 걸 보니 혼자서도 건강한 식단을 챙기시는군요! 오늘도 영양 밸런스 좋은 상품을 추천해드릴게요 💚',
      weight: 0.7
    },
    {
      id: 5,
      template: '{userName}님, 지난 한 달간 <strong>{count}회</strong> 구매하셨네요!<br/>{mostPurchased}를 <strong>{repeatCount}번</strong>이나 주문하시는 걸 보니 정말 좋아하시는군요! 비슷한 맛의 상품도 추천해드릴게요 🎯',
      weight: 1.0
    }
  ],

  // 30대 남성 (박민수)
  '30s_male': [
    {
      id: 1,
      template: '{userName}님, 지난 한 달간 <strong>{count}회</strong> 구매하셨네요!<br/>{products} 같은 프리미엄 밀키트와 해산물을 즐겨 주문하시는 요리 고수시군요! 오늘 저녁도 와이프와 함께 맛있게 즐길 수 있는 상품을 추천해드릴게요 🍽️',
      weight: 1.0
    },
    {
      id: 2,
      template: '{userName}님, 지난 한 달간 <strong>{count}회</strong> 구매하셨네요!<br/>{products}를 번갈아 주문하시는 걸 보니 요리 실력이 대단하시군요! 오늘도 특별한 저녁 메뉴를 준비해드릴게요 👨‍🍳',
      weight: 0.9
    },
    {
      id: 3,
      template: '{userName}님, 지난 한 달간 <strong>{count}회</strong> 구매하셨네요!<br/>{products} 같은 고급 식재료를 자주 주문하시는 걸 보니 퀄리티를 중시하시는군요! 오늘도 프리미엄 상품을 골라봤어요 ⭐',
      weight: 0.8
    },
    {
      id: 4,
      template: '{userName}님, 지난 한 달간 <strong>{count}회</strong> 구매하셨네요!<br/>{mostPurchased}를 <strong>{repeatCount}번</strong>이나 주문하시는 걸 보니 정말 맛있게 드시는군요! 오늘도 비슷한 맛의 상품을 추천해드릴게요 🎯',
      weight: 1.0
    },
    {
      id: 5,
      template: '{userName}님, 지난 한 달간 <strong>{count}회</strong> 구매하셨네요!<br/>{products}를 즐겨 주문하시는 걸 보니 2인 가구에 딱 맞는 상품을 잘 선택하시는군요! 오늘도 든든한 식사 준비해드릴게요 🍖',
      weight: 0.9
    }
  ],

  // 40대 여성 (이영희)
  '40s_female': [
    {
      id: 1,
      template: '{userName}님, 지난 한 달간 <strong>{count}회</strong> 구매하셨네요!<br/>가족을 위한 {products} 같은 건강식품을 자주 주문하시는 걸 보니 아이와 가족 건강을 최우선으로 생각하시는군요! 주말 가족 식사 준비해드릴게요 👨‍👩‍👧',
      weight: 1.0
    },
    {
      id: 2,
      template: '{userName}님, 지난 한 달간 <strong>{count}회</strong> 구매하셨네요!<br/>{products}를 꾸준히 주문하시는 걸 보니 가족 식단 관리에 정말 신경 쓰시는군요! 오늘도 건강하고 맛있는 상품을 추천해드릴게요 💚',
      weight: 0.9
    },
    {
      id: 3,
      template: '{userName}님, 지난 한 달간 <strong>{count}회</strong> 구매하셨네요!<br/>{mostPurchased}를 <strong>{repeatCount}번</strong>이나 주문하시는 걸 보니 가족들이 정말 좋아하시는군요! 비슷한 상품도 추천해드릴게요 🎯',
      weight: 1.0
    },
    {
      id: 4,
      template: '{userName}님, 지난 한 달간 <strong>{count}회</strong> 구매하셨네요!<br/>{products} 같은 밀키트와 유제품을 자주 주문하시는 걸 보니 주말 가족 시간을 소중히 여기시는군요! 오늘도 특별한 식사 준비해드릴게요 🍽️',
      weight: 0.8
    },
    {
      id: 5,
      template: '{userName}님, 지난 한 달간 <strong>{count}회</strong> 구매하셨네요!<br/>{products}를 즐겨 주문하시는 걸 보니 3인 가구에 딱 맞는 상품을 잘 선택하시는군요! 오늘도 가족 모두가 좋아할 상품을 골라봤어요 👨‍👩‍👧',
      weight: 0.9
    }
  ]
};

/**
 * 메시지 템플릿 선택 (가중치 기반 랜덤 선택)
 */
export function selectRandomTemplate(
  ageGroup: string,
  gender: string
): MessageTemplate | null {
  // gender를 템플릿 키 형식으로 변환 (M -> male, F -> female)
  const genderKey = gender === 'M' ? 'male' : gender === 'F' ? 'female' : gender.toLowerCase();
  const key = `${ageGroup}_${genderKey}`;
  
  console.log('🔍 템플릿 키 찾기:', { ageGroup, gender, genderKey, key });
  
  const templates = messageTemplates[key];

  if (!templates || templates.length === 0) {
    console.warn('⚠️ 템플릿을 찾을 수 없습니다:', key);
    return null;
  }

  // 가중치 기반 랜덤 선택
  const totalWeight = templates.reduce((sum, t) => sum + t.weight, 0);
  let random = Math.random() * totalWeight;

  for (const template of templates) {
    random -= template.weight;
    if (random <= 0) {
      console.log('✅ 선택된 템플릿:', template.id);
      return template;
    }
  }

  // fallback
  return templates[0];
}

/**
 * 메시지 템플릿 변수 치환
 */
export function replaceTemplateVariables(
  template: string,
  variables: Record<string, string | number>
): string {
  let result = template;
  
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(regex, String(value));
  }
  
  return result;
}

