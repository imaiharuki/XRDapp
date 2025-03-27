from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import date

from api.db import get_db
from models.XRDDataModel import XRD_data
from schemas.XRDDataSchema import XRDDataCreate, XRDDataResponse
from cruds.XRDDataCRUD import create_data, read_data, get_data, update_data, delete_data

router = APIRouter()


@router.post("/upload", response_model=XRDDataResponse)
async def upload_xrd_data(data: XRDDataCreate, db: AsyncSession = Depends(get_db)):
    """
    XRDデータをアップロードし、データベースに保存するエンドポイント
    """
    return await create_data(db, data)


@router.get("/get", response_model=List[XRDDataResponse])
async def get_xrd_data(
    id: Optional[int] = Query(None, description="データID"),
    username: Optional[str] = Query(None, description="ユーザー名"),
    material: Optional[str] = Query(None, description="材料名"),
    elements: Optional[List[str]] = Query(None, description="含まれる元素のリスト"),
    db: AsyncSession = Depends(get_db),
):
    """
    XRDデータを検索して取得するエンドポイント。
    すべてのパラメータはオプショナルで、指定されたパラメータで絞り込みを行います。
    パラメータが指定されない場合は、全データを返します。
    """
    return await read_data(db, id, username, material, elements)


@router.put("/update", response_model=XRDDataResponse)
async def update_xrd_data(
    data: XRDDataCreate,
    id: int = Query(..., description="変更するデータのID"),
    db: AsyncSession = Depends(get_db),
):
    original = await get_data(db=db, id=id)
    if original is None:
        raise HTTPException(status_code=404, detail="変更するデータが見つかりません")
    return await update_data(db, new_data=data, existing_data=original)


@router.delete("/delete", response_model=None)
async def delete_xrd_data(
    id: int = Query(..., description="削除するデータのID"),
    db: AsyncSession = Depends(get_db),
):
    original = await get_data(db, id)
    if original is None:
        raise HTTPException(status_code=404, detail="削除するデータが見つかりません")

    return await delete_data(db, original)
