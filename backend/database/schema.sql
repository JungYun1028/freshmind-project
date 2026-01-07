-- FreshMind 데이터베이스 스키마
-- 기획서 기반으로 작성

-- ========== Users 테이블 ==========
CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  birth_date DATE NOT NULL,
  gender VARCHAR(10),  -- 'M', 'F', 'U'
  age_group VARCHAR(10),  -- '10s', '20s', '30s', '40s', '50s+'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gender_age ON users(gender, age_group);

-- ========== Users 더미 데이터 (가상 유저 계정 3개) ==========
-- 가상 유저 계정 삽입 (재실행 시 자동 업데이트)
INSERT INTO users (user_id, name, birth_date, gender, age_group) VALUES
  (1, '김지은', '2004-03-15', 'F', '20s'),  -- 20대 대학생 여성 (1인 가구, 자취생, 간편식 선호)
  (2, '박민수', '1989-07-22', 'M', '30s'),  -- 30대 중반 직장인 남성 (2인 가구, 기혼, 밀키트·요리 선호)
  (3, '이영희', '1979-11-08', 'F', '40s')   -- 40대 중반 직장인 여성 (3인 가구, 기혼, 건강식·아동 식품 선호)
ON CONFLICT (user_id) DO UPDATE SET
  name = EXCLUDED.name,
  birth_date = EXCLUDED.birth_date,
  gender = EXCLUDED.gender,
  age_group = EXCLUDED.age_group;

-- user_id 시퀀스 재설정 (다음 INSERT 시 4부터 시작)
SELECT setval('users_user_id_seq', GREATEST(3, (SELECT MAX(user_id) FROM users)));

-- ========== Products 테이블 ==========
CREATE TABLE IF NOT EXISTS products (
  product_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  sub_category VARCHAR(50),
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  image_url VARCHAR(500),
  
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  purchase_count INTEGER DEFAULT 0,
  
  target_gender VARCHAR(20),  -- 'all', 'male', 'female', 'male-oriented', 'female-oriented'
  target_age_groups TEXT,  -- JSON 배열 형태: '["20s", "30s"]'
  used_in TEXT,  -- JSON 배열 형태: '["찌개/국/탕", "볶음"]'
  tags TEXT,  -- JSON 배열 형태: '["유기농", "국내산"]'
  
  stock INTEGER DEFAULT 0,
  badge VARCHAR(50),
  is_kurly_only BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_rating ON products(rating DESC);
CREATE INDEX IF NOT EXISTS idx_purchase_count ON products(purchase_count DESC);
CREATE INDEX IF NOT EXISTS idx_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_target_gender ON products(target_gender);

-- ========== Chat_Messages 테이블 ==========
CREATE TABLE IF NOT EXISTS chat_messages (
  message_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  sender VARCHAR(20) NOT NULL,  -- 'user' or 'ai'
  message_text TEXT NOT NULL,
  
  sentiment VARCHAR(20),  -- 'positive', 'neutral', 'negative'
  sentiment_score FLOAT,
  
  recommended_products TEXT,  -- JSON 배열: '[1, 4, 5]'
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_sentiment ON chat_messages(sentiment);
CREATE INDEX IF NOT EXISTS idx_chat_created_at ON chat_messages(created_at DESC);

-- ========== Purchase_History 테이블 ==========
CREATE TABLE IF NOT EXISTS purchase_history (
  purchase_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  purchased_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_purchase_user_id ON purchase_history(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_product_id ON purchase_history(product_id);
CREATE INDEX IF NOT EXISTS idx_purchase_purchased_at ON purchase_history(purchased_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchase_user_date ON purchase_history(user_id, purchased_at DESC);

-- ========== 코멘트 ==========
COMMENT ON TABLE users IS '사용자 프로필 정보';
COMMENT ON TABLE products IS '상품 정보 및 타겟팅 데이터';
COMMENT ON TABLE chat_messages IS 'AI 챗봇 대화 내역 및 감정 분석 결과';
COMMENT ON TABLE purchase_history IS '사용자 구매이력';

COMMENT ON COLUMN products.target_age_groups IS 'JSON 배열: ["20s", "30s", "40s", "50s+"]';
COMMENT ON COLUMN products.used_in IS 'JSON 배열: ["찌개/국/탕", "볶음", "구이", "샐러드" 등]';
COMMENT ON COLUMN chat_messages.recommended_products IS 'JSON 배열: 추천한 상품 ID 목록';

