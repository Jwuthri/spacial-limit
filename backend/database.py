from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Float, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# Database URL
DATABASE_URL = "sqlite:///./predictions.db"

# Create engine
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Create session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class
Base = declarative_base()

class Prediction(Base):
    __tablename__ = "predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    image_name = Column(String, index=True)
    image_data = Column(Text)  # Base64 encoded image
    detect_type = Column(String, index=True)
    target_prompt = Column(String)
    label_prompt = Column(String, nullable=True)
    segmentation_language = Column(String, default="English")
    temperature = Column(Float, default=0.4)
    model_used = Column(String)
    results = Column(JSON)  # Store the detection results
    created_at = Column(DateTime, default=datetime.utcnow)
    processing_time = Column(Float, nullable=True)  # Time in seconds

def create_tables():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 