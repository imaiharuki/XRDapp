from sqlalchemy import Column, Integer, String, ForeignKey, Float, ARRAY, DateTime
from sqlalchemy.dialects.postgresql import JSONB, TIMESTAMP
from datetime import datetime, timedelta

from api.db import Base


class XRD_data(Base):
    __tablename__ = "xrd_data"

    id = Column(Integer, primary_key=True)

    # UploadFormから送信されるユーザー情報
    username = Column(String(255), nullable=False)
    upload_date = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        default=lambda: datetime.now() + timedelta(hours=9),
    )

    # 材料情報
    material = Column(String(255), nullable=False)
    elements = Column(ARRAY(String), nullable=False)
    temperature = Column(Float, nullable=False)

    # XRDデータ
    x_value = Column(ARRAY(Float), nullable=False)
    y_value = Column(ARRAY(Float), nullable=False)
