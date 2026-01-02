from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import products, users, recommendations, cart, orders
from app.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FreshMind API",
    description="AI-powered fresh grocery e-commerce platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["recommendations"])
app.include_router(cart.router, prefix="/api/cart", tags=["cart"])
app.include_router(orders.router, prefix="/api/orders", tags=["orders"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to FreshMind API",
        "description": "AI-powered fresh grocery e-commerce platform"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

