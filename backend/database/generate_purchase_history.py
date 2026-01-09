"""
FreshMind 구매이력 더미 데이터 생성 스크립트

유저별로 최근 6개월간의 구매이력을 생성합니다.
- 유저당 80~150건의 랜덤 구매이력
- 각 유저의 선호 상품 가중치 반영
- 실제 구매 패턴과 유사하게 생성
"""

import psycopg2
import random
from datetime import datetime, timedelta
import sys

# DB 연결 정보 (본인 환경에 맞게 수정)
DB_CONFIG = {
    'dbname': 'freshmind_db',
    'user': 'jejeong-yun',  # macOS 사용자명
    'host': 'localhost',
    'port': '5432'
}

# 유저별 선호 상품 및 구매 패턴
USER_PREFERENCES = {
    1: {  # 김지은 (20대 여성, 간편식 선호)
        'name': '김지은',
        'products': [23, 24, 41, 42, 85, 88, 90, 91],  # 컵밥, 떡볶이, 만두, 새우, 커피, 라면, 콜라
        'weights': [0.25, 0.20, 0.18, 0.12, 0.10, 0.08, 0.05, 0.02],
        'avg_quantity': 2,
        'purchase_frequency_days': 10,  # 평균 10일마다 구매
        'repurchase_rate': 0.30  # 30% 재구매율
    },
    2: {  # 박민수 (30대 남성, 밀키트·해산물 선호)
        'name': '박민수',
        'products': [25, 26, 11, 12, 42, 43, 61, 62],  # 떡볶이 밀키트, 비빔밥 밀키트, 삼겹살, 닭가슴살, 새우, 오징어
        'weights': [0.22, 0.22, 0.18, 0.15, 0.10, 0.08, 0.03, 0.02],
        'avg_quantity': 2,
        'purchase_frequency_days': 12,
        'repurchase_rate': 0.25
    },
    3: {  # 이영희 (40대 여성, 건강식·채소 선호)
        'name': '이영희',
        'products': [1, 2, 5, 9, 25, 26, 41, 51],  # 감자, 우유, 브로콜리, 바나나, 밀키트, 만두
        'weights': [0.20, 0.20, 0.15, 0.15, 0.12, 0.10, 0.05, 0.03],
        'avg_quantity': 3,
        'purchase_frequency_days': 8,
        'repurchase_rate': 0.35
    }
}

def generate_purchase_history(user_id, start_date, end_date, target_count=100):
    """
    특정 유저의 구매이력 생성
    
    Args:
        user_id: 유저 ID
        start_date: 시작 날짜
        end_date: 종료 날짜
        target_count: 목표 구매 건수
        
    Returns:
        list: (user_id, product_id, quantity, purchased_at) 튜플 리스트
    """
    purchases = []
    prefs = USER_PREFERENCES[user_id]
    recently_purchased = []  # 최근 구매한 상품 (재구매 추적용)
    
    current_date = start_date
    count = 0
    
    while current_date <= end_date and count < target_count:
        # 재구매 확률 적용
        if recently_purchased and random.random() < prefs['repurchase_rate']:
            # 최근 구매한 상품 중 하나를 재구매
            product_id = random.choice(recently_purchased)
        else:
            # 새로운 상품 선택 (가중치 적용)
            product_id = random.choices(prefs['products'], weights=prefs['weights'])[0]
            # 최근 구매 목록에 추가 (최대 5개 유지)
            if product_id not in recently_purchased:
                recently_purchased.append(product_id)
                if len(recently_purchased) > 5:
                    recently_purchased.pop(0)
        
        # 수량 (평균 ±1)
        quantity = max(1, prefs['avg_quantity'] + random.randint(-1, 1))
        
        # 구매 시간 (18:00~21:00 사이, 저녁 시간대)
        hour = random.randint(18, 21)
        minute = random.randint(0, 59)
        second = random.randint(0, 59)
        purchased_at = current_date.replace(hour=hour, minute=minute, second=second)
        
        purchases.append((user_id, product_id, quantity, purchased_at))
        
        # 다음 구매일 (평균 구매 주기 ±3일)
        days_gap = prefs['purchase_frequency_days'] + random.randint(-3, 3)
        current_date += timedelta(days=max(1, days_gap))
        count += 1
    
    return purchases

def check_products_exist(conn):
    """상품 데이터가 존재하는지 확인"""
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM products;")
    count = cur.fetchone()[0]
    cur.close()
    
    if count == 0:
        print("❌ 오류: products 테이블이 비어있습니다!")
        print("   먼저 상품 데이터를 생성해주세요:")
        print("   python3 load_products_to_db.py")
        return False
    
    print(f"✅ 상품 데이터 확인: {count}개")
    return True

def insert_purchase_history():
    """DB에 구매이력 삽입"""
    try:
        # DB 연결
        conn = psycopg2.connect(**DB_CONFIG)
        print("✅ PostgreSQL 연결 성공!")
        
        # 상품 데이터 확인
        if not check_products_exist(conn):
            conn.close()
            return
        
        cur = conn.cursor()
        
        # 기존 구매이력 삭제
        cur.execute("DELETE FROM purchase_history;")
        print("🗑️  기존 구매이력 삭제 완료")
        
        # 6개월 전 ~ 오늘
        end_date = datetime.now()
        start_date = end_date - timedelta(days=180)
        
        print(f"\n📅 구매이력 생성 기간: {start_date.date()} ~ {end_date.date()}")
        print("=" * 60)
        
        all_purchases = []
        
        # 각 유저별 구매이력 생성
        for user_id in [1, 2, 3]:
            prefs = USER_PREFERENCES[user_id]
            target_count = random.randint(80, 150)  # 유저당 80~150건
            purchases = generate_purchase_history(user_id, start_date, end_date, target_count)
            all_purchases.extend(purchases)
            
            print(f"📦 유저 {user_id} ({prefs['name']}): {len(purchases)}건 생성")
        
        print("=" * 60)
        
        # DB 삽입
        print("\n💾 데이터베이스에 삽입 중...")
        cur.executemany(
            "INSERT INTO purchase_history (user_id, product_id, quantity, purchased_at) VALUES (%s, %s, %s, %s)",
            all_purchases
        )
        
        conn.commit()
        print(f"🎉 총 {len(all_purchases)}건의 구매이력 생성 완료!")
        
        # 통계 확인
        print("\n📊 유저별 구매이력 통계:")
        cur.execute("""
            SELECT 
                u.name,
                COUNT(*) as purchase_count,
                SUM(ph.quantity) as total_quantity,
                MIN(ph.purchased_at) as first_purchase,
                MAX(ph.purchased_at) as last_purchase
            FROM purchase_history ph
            JOIN users u ON ph.user_id = u.user_id
            GROUP BY u.user_id, u.name
            ORDER BY u.user_id;
        """)
        
        for row in cur.fetchall():
            print(f"\n  🙋 {row[0]}")
            print(f"     - 구매 건수: {row[1]}건")
            print(f"     - 총 구매 수량: {row[2]}개")
            print(f"     - 첫 구매: {row[3].date()}")
            print(f"     - 최근 구매: {row[4].date()}")
        
        # 인기 상품 TOP 5
        print("\n🔥 구매 많은 상품 TOP 5:")
        cur.execute("""
            SELECT 
                p.name,
                COUNT(*) as purchase_count,
                SUM(ph.quantity) as total_quantity
            FROM purchase_history ph
            JOIN products p ON ph.product_id = p.product_id
            GROUP BY p.product_id, p.name
            ORDER BY purchase_count DESC
            LIMIT 5;
        """)
        
        for idx, row in enumerate(cur.fetchall(), 1):
            print(f"  {idx}. {row[0]}: {row[1]}건 ({row[2]}개)")
        
        print("\n" + "=" * 60)
        print("✅ 구매이력 생성 완료!")
        print("\n확인 명령어:")
        print('  psql freshmind_db -c "SELECT COUNT(*) FROM purchase_history;"')
        
        cur.close()
        conn.close()
        
    except psycopg2.Error as e:
        print(f"❌ 데이터베이스 오류: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        sys.exit(1)

if __name__ == "__main__":
    print("=" * 60)
    print("🛒 FreshMind 구매이력 더미 데이터 생성")
    print("=" * 60)
    insert_purchase_history()

