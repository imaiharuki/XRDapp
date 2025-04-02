from sqlalchemy.ext.asyncio import AsyncSession
from models.XRDDataModel import XRD_data
from schemas.XRDDataSchema import XRDDataCreate, XRDDataBase
from fastapi import HTTPException
from datetime import datetime, timedelta
from typing import List, Tuple, Optional
from sqlalchemy.engine import Result
from sqlalchemy import select, and_


# CRUDのC
async def create_data(db: AsyncSession, data: XRDDataCreate) -> XRD_data:
    try:
        # データベースに保存するモデルインスタンスを作成
        db_xrd_data = XRD_data(
            username=data.username,
            material=data.material,
            elements=data.elements,
            temperature=data.temperature,
            x_value=data.x_value,
            y_value=data.y_value,
            # upload_dateはデフォルト値が使用される
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


# CRUDのR
async def read_data(
    db: AsyncSession,
    id: Optional[int] = None,
    username: Optional[str] = None,
    material: Optional[str] = None,
    elements: Optional[List[str]] = None,
) -> List[XRD_data]:
    try:
        # 検索条件を構築
        query = select(XRD_data)
        conditions = []

        if id is not None:
            conditions.append(XRD_data.id == id)
        if username is not None:
            conditions.append(XRD_data.username == username)
        if material is not None:
            conditions.append(XRD_data.material == material)
        if elements is not None and len(elements) > 0:
            # elementsは配列なので、含まれているかどうかをチェック
            conditions.append(XRD_data.elements.contains(elements))

        # 条件があれば追加
        if conditions:
            query = query.where(and_(*conditions))

        result: Result = await db.execute(query)
        return result.scalars().all()

    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500, detail=f"データの読み込みに失敗しました：{str(e)}"
        )


from datetime import datetime


# CRUDのU
async def get_data(db: AsyncSession, id: int) -> Optional[XRD_data]:
    try:
        result: Result = await db.execute(select(XRD_data).filter(XRD_data.id == id))
        data = result.scalar_one_or_none()
        return data
    except Exception as e:
        print(f"Error in get_data: {str(e)}")
        return None


async def update_data(
    db: AsyncSession, new_data: XRDDataCreate, existing_data: XRD_data
) -> XRD_data:
    existing_data.username = new_data.username
    existing_data.elements = new_data.elements
    existing_data.material = new_data.material
    existing_data.temperature = new_data.temperature
    existing_data.x_value = new_data.x_value
    existing_data.y_value = new_data.y_value
    existing_data.upload_date = datetime.now() + timedelta(hours=9)

    db.add(existing_data)
    await db.commit()
    await db.refresh(existing_data)
    return existing_data


async def delete_data(db: AsyncSession, original: XRD_data) -> None:
    await db.delete(original)
    await db.commit()
