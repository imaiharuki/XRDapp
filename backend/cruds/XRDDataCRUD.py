from sqlalchemy.ext.asyncio import AsyncSession
from models.XRDDataModel import XRD_data
from schemas.XRDDataSchema import XRDDataCreate, XRDDataBase
from fastapi import HTTPException


# CRUDのC
async def create_data(db: AsyncSession, data: XRDDataCreate) -> XRD_data:
    try:
        # データベースに保存するモデルインスタンスを作成
        db_xrd_data = XRD_data(
            username=data.username,
            upload_date=data.upload_date,
            material=data.material,
            elements=data.elements,
            temperature=data.temperature,
            x_value=data.x_value,
            y_value=data.y_value,
        )

        # データベースに追加
        db.add(db_xrd_data)
        await db.commit()
        await db.refresh(db_xrd_data)

        return db_xrd_data

    except Exception as e:
        # エラーが発生した場合はロールバック
        await db.rollback()
        raise HTTPException(
            status_code=500, detail=f"データの保存中にエラーが発生しました: {str(e)}"
        )


from typing import List, Tuple
from sqlalchemy.engine import Result
from sqlalchemy import select


# CRUDのR
async def read_data(db: AsyncSession) -> List[Tuple[int, str]]:
    result: Result = await db.execute(select(XRD_data.id, XRD_data.username))
    return result.all()
