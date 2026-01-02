"""
JSON 파일의 100개 상품 데이터를 PostgreSQL에 삽입

실행 방법:
    cd /Users/jejeong-yun/freshmind-project/backend/database
    python3 load_products_to_db.py
"""

import psycopg2
import json
import sys
from datetime import datetime

print("=" * 60)
print("📦 FreshMind 상품 데이터 Import")
print("=" * 60)

# PostgreSQL 연결
try:
    conn = psycopg2.connect(
        dbname="freshmind_db",
        user="jejeong-yun",
        host="localhost",
        port="5432"
    )
    cur = conn.cursor()
    print("✅ PostgreSQL 연결 성공!")
except Exception as e:
    print(f"❌ 연결 실패: {e}")
    sys.exit(1)

# 기존 products 데이터 삭제 (재실행 대비)
try:
    cur.execute("DELETE FROM products")
    conn.commit()
    print("🗑️  기존 products 데이터 삭제 완료\n")
except Exception as e:
    print(f"⚠️  삭제 중 오류 (무시 가능): {e}\n")
    conn.rollback()

# JSON 파일 읽기
json_file_path = "/Users/jejeong-yun/freshmind-project/backend/database/products.json"
try:
    with open(json_file_path, 'r', encoding='utf-8') as f:
        products = json.load(f)
    print(f"📖 JSON 파일 로드 완료: {len(products)}개 상품")
except Exception as e:
    print(f"❌ JSON 파일 읽기 실패: {e}")
    sys.exit(1)

# 데이터 삽입
insert_query = """
INSERT INTO products (
    name, category, sub_category, price, original_price, description,
    target_age_groups, target_gender, used_in, review_count, rating,
    image_url, tags, stock, badge, is_kurly_only, purchase_count
) VALUES (
    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
)
"""

success_count = 0
error_count = 0

print("\n🚀 데이터 삽입 시작...\n")

for idx, product in enumerate(products, 1):
    try:
        # JSON 배열을 PostgreSQL TEXT로 변환
        target_age_groups = json.dumps(product.get('targetAge', []))
        used_in = json.dumps(product.get('usedIn', []))
        tags = json.dumps(product.get('tags', []))
        
        # purchase_count는 review_count 기반으로 추정 (없으면)
        purchase_count = product.get('reviews', 0) if 'reviews' in product else 0
        
        values = (
            product['name'],
            product['category'],
            product.get('subCategory'),  # 선택적
            product['price'],
            product.get('originalPrice'),  # 선택적
            product['description'],
            target_age_groups,  # JSON TEXT
            product['targetGender'],
            used_in,  # JSON TEXT
            product.get('reviews', 0),
            product.get('rating', 0),
            product.get('image', ''),
            tags,  # JSON TEXT
            product.get('stock', 0),
            product.get('badge'),  # 선택적
            product.get('isKurlyOnly', False),
            purchase_count
        )
        
        cur.execute(insert_query, values)
        success_count += 1
        
        # 진행 상황 표시
        if idx % 10 == 0:
            print(f"  ✓ {idx}/{len(products)} 처리 중...")
            
    except Exception as e:
        error_count += 1
        print(f"  ❌ [{idx}] {product.get('name', 'Unknown')} 삽입 실패: {e}")
        conn.rollback()
        continue

# 커밋
try:
    conn.commit()
    print(f"\n✅ 데이터 삽입 완료!")
except Exception as e:
    print(f"\n❌ 커밋 실패: {e}")
    conn.rollback()

# 결과 확인
print("\n" + "=" * 60)
print("📊 삽입 결과")
print("=" * 60)
print(f"  • 성공: {success_count}개")
print(f"  • 실패: {error_count}개")

# 데이터베이스 통계
cur.execute("SELECT COUNT(*) FROM products")
total = cur.fetchone()[0]
print(f"  • DB 총 상품 수: {total}개")

# 카테고리별 통계
cur.execute("""
    SELECT category, COUNT(*) as count 
    FROM products 
    GROUP BY category 
    ORDER BY count DESC
""")
categories = cur.fetchall()
print(f"\n📦 카테고리별 분포:")
for cat, count in categories:
    print(f"  • {cat}: {count}개")

# 가격 통계
cur.execute("""
    SELECT 
        MIN(price) as min_price,
        MAX(price) as max_price,
        ROUND(AVG(price), 0) as avg_price
    FROM products
""")
price_stats = cur.fetchone()
print(f"\n💰 가격 통계:")
print(f"  • 최저가: {int(price_stats[0]):,}원")
print(f"  • 최고가: {int(price_stats[1]):,}원")
print(f"  • 평균가: {int(price_stats[2]):,}원")

# 인기 상품 TOP 5
cur.execute("""
    SELECT name, review_count 
    FROM products 
    ORDER BY review_count DESC 
    LIMIT 5
""")
top_products = cur.fetchall()
print(f"\n⭐ 리뷰 많은 상품 TOP 5:")
for idx, (name, reviews) in enumerate(top_products, 1):
    print(f"  {idx}. {name} - {reviews:,}개")

print("\n" + "=" * 60)
print("🎉 Import 완료!")
print("=" * 60)

# 연결 종료
cur.close()
conn.close()

