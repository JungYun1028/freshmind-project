"""
구매이력 더미데이터 생성 및 PostgreSQL에 삽입

실행 방법:
    cd backend/database
    python3 load_purchase_history_to_db.py
"""

import psycopg2
import json
import sys
import random
from datetime import datetime, timedelta, date

print("=" * 60)
print("🛒 FreshMind 구매이력 더미데이터 생성")
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
    print("\n💡 해결 방법:")
    print("   1. PostgreSQL이 실행 중인지 확인하세요")
    print("   2. 데이터베이스 'freshmind_db'가 생성되어 있는지 확인하세요")
    print("   3. 사용자 'jejeong-yun'의 권한을 확인하세요")
    sys.exit(1)

# 기존 purchase_history 데이터 삭제 (재실행 대비)
try:
    cur.execute("DELETE FROM purchase_history")
    conn.commit()
    print("🗑️  기존 purchase_history 데이터 삭제 완료\n")
except Exception as e:
    print(f"⚠️  삭제 중 오류 (무시 가능): {e}\n")
    conn.rollback()

# 유저 정보 조회
try:
    cur.execute("SELECT user_id, name, age_group, gender FROM users ORDER BY user_id")
    users = cur.fetchall()
    if not users:
        print("❌ users 테이블에 데이터가 없습니다!")
        print("   먼저 schema.sql을 실행하여 유저 데이터를 생성하세요.")
        sys.exit(1)
    print(f"📖 유저 정보 로드 완료: {len(users)}명")
    for user_id, name, age_group, gender in users:
        print(f"   • [{user_id}] {name} ({age_group}, {gender})")
except Exception as e:
    print(f"❌ 유저 정보 조회 실패: {e}")
    sys.exit(1)

# 상품 정보 조회 (카테고리별)
try:
    cur.execute("""
        SELECT product_id, name, category, target_age_groups, target_gender
        FROM products
        ORDER BY product_id
    """)
    all_products = cur.fetchall()
    if not all_products:
        print("❌ products 테이블에 데이터가 없습니다!")
        print("   먼저 load_products_to_db.py를 실행하여 상품 데이터를 생성하세요.")
        sys.exit(1)
    print(f"📦 상품 정보 로드 완료: {len(all_products)}개\n")
except Exception as e:
    print(f"❌ 상품 정보 조회 실패: {e}")
    sys.exit(1)

# 유저별 구매 패턴 정의
user_purchase_patterns = {
    1: {  # 20대 여성 (김지은)
        "frequency_per_month": 1,  # 월 1회
        "preferred_categories": ["간편식/밀키트", "냉동식품", "즉석식품", "음료/차"],
        "category_weights": {"간편식/밀키트": 0.4, "냉동식품": 0.25, "즉석식품": 0.2, "음료/차": 0.15},
        "quantity_range": (1, 2),  # 1-2개
        "repeat_purchase_probability": 0.3,  # 30% 확률로 반복 구매
    },
    2: {  # 30대 남성 (박민수)
        "frequency_per_month": 2.5,  # 월 2-3회
        "preferred_categories": ["간편식/밀키트", "해산물", "육류/계란", "양념/오일", "채소"],
        "category_weights": {"간편식/밀키트": 0.35, "해산물": 0.2, "육류/계란": 0.15, "양념/오일": 0.15, "채소": 0.15},
        "quantity_range": (2, 3),  # 2-3개
        "repeat_purchase_probability": 0.25,  # 25% 확률로 반복 구매
    },
    3: {  # 40대 여성 (이영희)
        "frequency_per_month": 3,  # 월 2-4회
        "preferred_categories": ["간편식/밀키트", "냉동식품", "유제품", "과일", "채소"],
        "category_weights": {"간편식/밀키트": 0.3, "냉동식품": 0.2, "유제품": 0.15, "과일": 0.15, "채소": 0.2},
        "quantity_range": (3, 5),  # 3-5개
        "repeat_purchase_probability": 0.35,  # 35% 확률로 반복 구매
    }
}

def get_products_by_category(products, category):
    """카테고리별 상품 필터링"""
    return [p for p in products if p[2] == category]

def select_product_by_pattern(products, user_id, purchased_products):
    """유저 패턴에 맞는 상품 선택"""
    pattern = user_purchase_patterns[user_id]
    
    # 반복 구매 확률 체크
    if purchased_products and random.random() < pattern["repeat_purchase_probability"]:
        return random.choice(purchased_products)
    
    # 카테고리 가중치 기반 선택
    category = random.choices(
        list(pattern["category_weights"].keys()),
        weights=list(pattern["category_weights"].values())
    )[0]
    
    # 해당 카테고리의 상품 선택
    category_products = get_products_by_category(products, category)
    if not category_products:
        # 카테고리에 상품이 없으면 전체에서 랜덤 선택
        return random.choice(products)
    
    return random.choice(category_products)

# 데이터 생성
print("\n🚀 구매이력 데이터 생성 시작...\n")

end_date = datetime.now()
start_date = end_date - timedelta(days=180)  # 최근 6개월

insert_query = """
INSERT INTO purchase_history (user_id, product_id, quantity, purchased_at)
VALUES (%s, %s, %s, %s)
"""

total_inserted = 0
user_stats = {}

for user_id, name, age_group, gender in users:
    if user_id not in user_purchase_patterns:
        print(f"⚠️  [{user_id}] {name} - 구매 패턴이 정의되지 않음, 건너뜀")
        continue
    
    pattern = user_purchase_patterns[user_id]
    purchased_products = []  # 반복 구매를 위한 이력
    
    # 월 구매 빈도 계산
    months = 6
    total_purchases = int(pattern["frequency_per_month"] * months)
    # 유저당 50~200건 범위로 조정
    total_purchases = max(50, min(200, total_purchases))
    
    # 시간 분포 생성 (최근 6개월을 균등 분산)
    purchase_dates = []
    for i in range(total_purchases):
        days_offset = random.randint(0, 180)
        purchase_date = start_date + timedelta(days=days_offset)
        # 시간대 추가 (저녁 시간대 선호)
        hour = random.choices([18, 19, 20, 21], weights=[1, 2, 2, 1])[0]
        minute = random.randint(0, 59)
        purchase_date = purchase_date.replace(hour=hour, minute=minute)
        purchase_dates.append(purchase_date)
    
    purchase_dates.sort()  # 시간순 정렬
    
    # 구매 데이터 생성
    user_inserted = 0
    for purchase_date in purchase_dates:
        try:
            # 상품 선택
            product = select_product_by_pattern(all_products, user_id, purchased_products)
            product_id = product[0]
            
            # 수량 결정
            quantity = random.randint(*pattern["quantity_range"])
            
            # 데이터 삽입
            cur.execute(insert_query, (user_id, product_id, quantity, purchase_date))
            user_inserted += 1
            total_inserted += 1
            
            # 반복 구매를 위한 이력 추가 (최근 10개만 유지)
            purchased_products.append(product)
            if len(purchased_products) > 10:
                purchased_products.pop(0)
            
        except Exception as e:
            print(f"  ❌ 구매이력 삽입 실패: {e}")
            conn.rollback()
            continue
    
    user_stats[user_id] = {
        "name": name,
        "count": user_inserted
    }
    
    print(f"  ✅ [{user_id}] {name}: {user_inserted}건 생성 완료")

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
print(f"  • 총 구매이력: {total_inserted}건")

# 유저별 통계
print(f"\n👥 유저별 구매이력:")
for user_id in sorted(user_stats.keys()):
    stats = user_stats[user_id]
    print(f"  • [{user_id}] {stats['name']}: {stats['count']}건")

# 데이터베이스 통계
cur.execute("SELECT COUNT(*) FROM purchase_history")
total = cur.fetchone()[0]
print(f"\n  • DB 총 구매이력 수: {total}건")

# 기간별 통계
cur.execute("""
    SELECT 
        DATE_TRUNC('month', purchased_at) as month,
        COUNT(*) as count
    FROM purchase_history
    GROUP BY month
    ORDER BY month DESC
""")
monthly_stats = cur.fetchall()
print(f"\n📅 월별 구매 통계:")
for month, count in monthly_stats:
    print(f"  • {month.strftime('%Y-%m')}: {count:,}건")

# 카테고리별 통계
cur.execute("""
    SELECT 
        p.category,
        COUNT(*) as count
    FROM purchase_history ph
    JOIN products p ON ph.product_id = p.product_id
    GROUP BY p.category
    ORDER BY count DESC
""")
category_stats = cur.fetchall()
print(f"\n📦 카테고리별 구매 통계:")
for category, count in category_stats:
    print(f"  • {category}: {count:,}건")

# 유저별 최다 구매 상품
print(f"\n⭐ 유저별 최다 구매 상품:")
for user_id in sorted(user_stats.keys()):
    cur.execute("""
        SELECT 
            p.name,
            COUNT(*) as purchase_count,
            SUM(ph.quantity) as total_quantity
        FROM purchase_history ph
        JOIN products p ON ph.product_id = p.product_id
        WHERE ph.user_id = %s
        GROUP BY p.name
        ORDER BY purchase_count DESC
        LIMIT 3
    """, (user_id,))
    top_products = cur.fetchall()
    stats = user_stats[user_id]
    print(f"  • [{user_id}] {stats['name']}:")
    for idx, (name, purchase_count, total_quantity) in enumerate(top_products, 1):
        print(f"    {idx}. {name} - {purchase_count}회 구매, 총 {total_quantity}개")

print("\n" + "=" * 60)
print("🎉 구매이력 더미데이터 생성 완료!")
print("=" * 60)
print("\n💡 다음 단계:")
print("   백엔드 API 구현 및 프론트엔드 연동")
print()

# 연결 종료
cur.close()
conn.close()

