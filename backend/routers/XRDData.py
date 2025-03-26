from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from datetime import date

from api.db import get_db
from models.XRDDataModel import XRD_data
from schemas.XRDDataSchema import XRDDataCreate, XRDDataResponse
from cruds.XRDDataCRUD import create_data, read_data

router = APIRouter()


@router.post("/upload", response_model=XRDDataResponse)
async def upload_xrd_data(data: XRDDataCreate, db: AsyncSession = Depends(get_db)):
    """
    XRDデータをアップロードし、データベースに保存するエンドポイント
    """
    return await create_data(data, db)


@router.get("/", response_model=List[XRDDataResponse])
async def get_all_xrd_data(db: AsyncSession = Depends(get_db)):

    return await read_data(db)
