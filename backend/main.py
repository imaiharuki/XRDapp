from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import XRDData

app = FastAPI()

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


@app.get("/message")
async def read_root():
    return {"message": "Welcome to XRD Data Analysis API"}
