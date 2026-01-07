"""
가상 유저 계정 3개를 PostgreSQL에 삽입

실행 방법:
    # 방법 1: 가상환경 활성화 후 실행
    cd backend
    source .venv/bin/activate
    cd database
    python3 load_users_to_db.py
    
    # 방법 2: 프로젝트 루트에서 실행
    cd backend/database
    ../.venv/bin/python3 load_users_to_db.py
"""

import psycopg2
import sys
from datetime import datetime, date

print("=" * 60)
print("👥 FreshMind 가상 유저 계정 생성")
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

# 기존 users 데이터 확인
try:
    cur.execute("SELECT COUNT(*) FROM users")
    existing_count = cur.fetchone()[0]
    if existing_count > 0:
        print(f"\n⚠️  기존 users 데이터 {existing_count}개 발견")
        response = input("기존 데이터를 삭제하고 새로 생성하시겠습니까? (y/N): ")
        if response.lower() == 'y':
            cur.execute("DELETE FROM users")
            conn.commit()
            print("🗑️  기존 users 데이터 삭제 완료\n")
        else:
            print("❌ 작업을 취소했습니다.")
            cur.close()
            conn.close()
            sys.exit(0)
except Exception as e:
    print(f"⚠️  테이블 확인 중 오류 (무시 가능): {e}\n")
    conn.rollback()

# 가상 유저 데이터 정의
users_data = [
    {
        "name": "김지은",
        "birth_date": date(2004, 3, 15),  # 20세
        "gender": "F",
        "age_group": "20s",
        "description": "20대 대학생 여성 (1인 가구, 자취생, 간편식 선호)"
    },
    {
        "name": "박민수",
        "birth_date": date(1989, 7, 22),  # 35세
        "gender": "M",
        "age_group": "30s",
        "description": "30대 중반 직장인 남성 (2인 가구, 기혼, 밀키트·요리 선호)"
    },
    {
        "name": "이영희",
        "birth_date": date(1979, 11, 8),  # 45세
        "gender": "F",
        "age_group": "40s",
        "description": "40대 중반 직장인 여성 (3인 가구, 기혼, 건강식·아동 식품 선호)"
    }
]

# 데이터 삽입 쿼리
insert_query = """
INSERT INTO users (name, birth_date, gender, age_group)
VALUES (%s, %s, %s, %s)
RETURNING user_id;
"""

print("\n🚀 유저 데이터 삽입 시작...\n")

success_count = 0
error_count = 0
inserted_user_ids = []

for idx, user in enumerate(users_data, 1):
    try:
        values = (
            user["name"],
            user["birth_date"],
            user["gender"],
            user["age_group"]
        )
        
        cur.execute(insert_query, values)
        user_id = cur.fetchone()[0]
        inserted_user_ids.append(user_id)
        
        print(f"  ✅ [{idx}] {user['name']} ({user['age_group']}, {user['gender']})")
        print(f"     → user_id: {user_id}")
        print(f"     → {user['description']}")
        print()
        
        success_count += 1
        
    except Exception as e:
        error_count += 1
        print(f"  ❌ [{idx}] {user.get('name', 'Unknown')} 삽입 실패: {e}")
        conn.rollback()
        continue

# 커밋
try:
    conn.commit()
    print(f"✅ 데이터 삽입 완료!")
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
cur.execute("SELECT COUNT(*) FROM users")
total = cur.fetchone()[0]
print(f"  • DB 총 유저 수: {total}개")

# 삽입된 유저 상세 정보
if inserted_user_ids:
    print(f"\n👥 삽입된 유저 목록:")
    cur.execute("""
        SELECT user_id, name, birth_date, gender, age_group, created_at
        FROM users
        WHERE user_id = ANY(%s)
        ORDER BY user_id
    """, (inserted_user_ids,))
    
    users = cur.fetchall()
    for user_id, name, birth_date, gender, age_group, created_at in users:
        age = (date.today() - birth_date).days // 365
        print(f"  • [{user_id}] {name} ({age}세, {gender}, {age_group})")
        print(f"    생년월일: {birth_date}")

print("\n" + "=" * 60)
print("🎉 유저 계정 생성 완료!")
print("=" * 60)
print("\n💡 다음 단계:")
print("   python3 load_purchase_history_to_db.py")
print()

# 연결 종료
cur.close()
conn.close()

