import os
import sys
import logging
from pathlib import Path
from contextlib import asynccontextmanager

# Ensure backend root is on sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.database import connect_to_mongo, close_mongo_connection, is_connected
from app.services.store import seed_mongo_if_empty, ensure_db

from app.routes.auth import router as auth_router
from app.routes.companies import router as companies_router
from app.routes.purchase_orders import router as po_router
from app.routes.deliveries import router as deliveries_router
from app.routes.invoices import router as invoices_router
from app.routes.disputes import router as disputes_router
from app.routes.payments import router as payments_router
from app.routes.connections import router as connections_router
from app.routes.members import router as members_router
from app.routes.audit import router as audit_router
from app.routes.tickets import router as tickets_router
from app.routes.notifications import router as notifications_router

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("tradeproof.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB and seed if empty
    logger.info("Initializing TradeProof Backend Services...")
    await connect_to_mongo()
    await seed_mongo_if_empty()
    yield
    # Shutdown: Close DB connections
    logger.info("Shutting down TradeProof Backend Services...")
    await close_mongo_connection()

app = FastAPI(
    title="TradeProof API",
    description="FastAPI Backend for TradeProof B2B Settlement Platform connected to MongoDB",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
origins_str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,https://frontendkkk.vercel.app")
origins = [o.strip() for o in origins_str.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router)
app.include_router(companies_router)
app.include_router(po_router)
app.include_router(deliveries_router)
app.include_router(invoices_router)
app.include_router(disputes_router)
app.include_router(payments_router)
app.include_router(connections_router)
app.include_router(members_router)
app.include_router(audit_router)
app.include_router(tickets_router)
app.include_router(notifications_router)

@app.middleware("http")
async def normalize_api_prefix(request: Request, call_next):
    path = request.url.path

    # Check for Vercel matched path or forwarded uri
    matched_path = request.headers.get("x-matched-path") or request.headers.get("x-forwarded-uri")
    if matched_path and not matched_path.startswith("/api/index.py"):
        path = matched_path

    # If Vercel rewrote the path to /api/index.py or similar
    if path.startswith("/api/index.py"):
        path = path[len("/api/index.py"):]
        if not path:
            path = "/"

    request.scope["path"] = path

    # Pass documentation and root paths as-is
    if (
        path == "/"
        or path.startswith("/docs")
        or path.startswith("/openapi")
        or path.startswith("/redoc")
    ):
        return await call_next(request)

    # If incoming path does not start with /api, normalize to /api for internal routing
    if not path.startswith("/api"):
        request.scope["path"] = "/api" + path

    return await call_next(request)

@app.get("/", tags=["Root"])
@app.get("/api/index.py", tags=["Root"])
async def root():
    return {
        "service": "TradeProof Settlement Intelligence API",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs",
        "health_check": "/api/health",
        "database": {
            "connected": is_connected(),
            "engine": "MongoDB (Motor AsyncIO)",
            "database_name": os.getenv("MONGODB_DB_NAME", "tradeproof_prod"),
        }
    }

@app.get("/api/health", tags=["Health"])
@app.get("/health", tags=["Health"])
async def health_check():
    await ensure_db()
    return {
        "status": "healthy",
        "service": "TradeProof FastAPI Service",
        "version": "1.0.0",
        "database": {
            "connected": is_connected(),
            "engine": "MongoDB (Motor AsyncIO)",
            "database_name": os.getenv("MONGODB_DB_NAME", "tradeproof_prod"),
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
