from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import XRDData

app = FastAPI(
    title="XRD Data Analysis API",
    version="1.0.0",
    description="XRDデータ格納、解析のためのRESTfulAPI",
)

# CORSミドルウェアの設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # フロントエンドのオリジン
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# XRDデータルーターの登録
app.include_router(XRDData.router, prefix="/api/v1", tags=["XRD Data"])


@app.get("/health")
async def health_check():
    "ヘルスチェック用のエンドポイント"
    return {"status": "healthy", "version": "1.0.0"}
