from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class XRDDataBase(BaseModel):
    """基本的なXRDデータスキーマ"""

    username: str = Field(..., description="ユーザー名")
    material: str = Field(..., description="材料名")
    elements: List[str] = Field(..., description="含まれる元素のリスト")
    temperature: float = Field(..., ge=0, description="測定温度")
    x_value: List[float] = Field(..., description="X軸データ値")
    y_value: List[float] = Field(..., description="Y軸データ値")

    class Config:
        orm_mode = True


class XRDDataCreate(XRDDataBase):
    """XRDデータ作成用スキーマ"""

    pass


class XRDDataResponse(XRDDataBase):
    """XRDデータレスポンス用スキーマ"""

    id: int = Field(..., description="XRDデータのID")
    upload_date: datetime = Field(..., description="アップロード日")

    class Config:
        orm_mode = True
        from_attributes = True


class XRDDataUpdate(BaseModel):
    """XRDデータ更新用スキーマ"""

    username: Optional[str] = None
    material: Optional[str] = None
    elements: Optional[List[str]] = None
    temperature: Optional[float] = Field(None, ge=0)
    x_value: Optional[List[float]] = None
    y_value: Optional[List[float]] = None
