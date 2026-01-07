from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import chatbot, users

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
app.include_router(chatbot.router, prefix="/api/chatbot", tags=["chatbot"])
app.include_router(users.router, prefix="/api/users", tags=["users"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to FreshMind API",
        "description": "AI-powered fresh grocery e-commerce platform"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

