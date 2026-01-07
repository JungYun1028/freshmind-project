"""
SQLAlchemy ORM 모델
schema.sql과 일치하도록 작성됨
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    """사용자 프로필 정보"""
    __tablename__ = "users"
    
    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    birth_date = Column(DateTime, nullable=False)
    gender = Column(String(10))  # 'M', 'F', 'U'
    age_group = Column(String(10))  # '10s', '20s', '30s', '40s', '50s+'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    purchase_history = relationship("PurchaseHistory", back_populates="user")
    chat_messages = relationship("ChatMessage", back_populates="user")


class Product(Base):
    """상품 정보 및 타겟팅 데이터"""
    __tablename__ = "products"
    
    product_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(50))
    sub_category = Column(String(50))
    price = Column(Numeric(10, 2), nullable=False)
    original_price = Column(Numeric(10, 2))
    image_url = Column(String(500))
    
    rating = Column(Numeric(3, 2), default=0)
    review_count = Column(Integer, default=0)
    purchase_count = Column(Integer, default=0)
    
    target_gender = Column(String(20))  # 'all', 'male', 'female', 'male-oriented', 'female-oriented'
    target_age_groups = Column(Text)  # JSON 배열 형태: '["20s", "30s"]'
    used_in = Column(Text)  # JSON 배열 형태: '["찌개/국/탕", "볶음"]'
    tags = Column(Text)  # JSON 배열 형태: '["유기농", "국내산"]'
    
    stock = Column(Integer, default=0)
    badge = Column(String(50))
    is_kurly_only = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    purchase_history = relationship("PurchaseHistory", back_populates="product")


class PurchaseHistory(Base):
    """사용자 구매이력"""
    __tablename__ = "purchase_history"
    
    purchase_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.product_id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    purchased_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="purchase_history")
    product = relationship("Product", back_populates="purchase_history")


class ChatMessage(Base):
    """AI 챗봇 대화 내역 및 감정 분석 결과"""
    __tablename__ = "chat_messages"
    
    message_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    sender = Column(String(20), nullable=False)  # 'user' or 'ai'
    message_text = Column(Text, nullable=False)
    
    sentiment = Column(String(20))  # 'positive', 'neutral', 'negative'
    sentiment_score = Column(Float)
    
    recommended_products = Column(Text)  # JSON 배열: '[1, 4, 5]'
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="chat_messages")
