from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./pharmaceutical_cold_chain.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class BreachEventDB(Base):
    __tablename__ = "breach_events"
    
    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String, index=True)
    facility_id = Column(String, index=True)
    start_time = Column(DateTime)
    end_time = Column(DateTime, nullable=True)
    max_temperature = Column(Float)
    min_temperature = Column(Float)
    duration_minutes = Column(Float)
    severity = Column(String)
    viability_loss = Column(Float, default=0.0)
    ai_explanation = Column(Text, nullable=True)
    quarantine_recommended = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id,
            "sensor_id": self.sensor_id,
            "facility_id": self.facility_id,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "max_temperature": self.max_temperature,
            "min_temperature": self.min_temperature,
            "duration_minutes": self.duration_minutes,
            "severity": self.severity,
            "viability_loss": self.viability_loss,
            "ai_explanation": self.ai_explanation,
            "quarantine_recommended": self.quarantine_recommended,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }


class InventoryItemDB(Base):
    __tablename__ = "inventory_items"
    
    id = Column(Integer, primary_key=True, index=True)
    drug_name = Column(String, index=True)
    batch_number = Column(String, index=True)
    quantity = Column(Integer)
    storage_unit = Column(String)
    facility_id = Column(String, index=True)
    optimal_temp_min = Column(Float, default=2.0)
    optimal_temp_max = Column(Float, default=8.0)
    status = Column(String, default="active")
    expiry_date = Column(DateTime, nullable=True)
    current_viability = Column(Float, default=100.0)
    cumulative_temp_exposure = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id,
            "drug_name": self.drug_name,
            "batch_number": self.batch_number,
            "quantity": self.quantity,
            "storage_unit": self.storage_unit,
            "facility_id": self.facility_id,
            "optimal_temp_min": self.optimal_temp_min,
            "optimal_temp_max": self.optimal_temp_max,
            "status": self.status,
            "expiry_date": self.expiry_date.isoformat() if self.expiry_date else None,
            "current_viability": self.current_viability,
            "cumulative_temp_exposure": self.cumulative_temp_exposure,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class DrugCurveDB(Base):
    __tablename__ = "drug_viability_curves"
    
    id = Column(Integer, primary_key=True, index=True)
    drug_name = Column(String, index=True)
    temperature = Column(Float)
    decay_rate = Column(Float)
    reference_curve = Column(Text)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)


class RegulatoryStandardDB(Base):
    __tablename__ = "regulatory_standards"
    
    id = Column(Integer, primary_key=True, index=True)
    organization = Column(String)
    drug_category = Column(String)
    min_temp = Column(Float)
    max_temp = Column(Float)
    max_exposure_time = Column(Integer, nullable=True)
    description = Column(Text)


class MetricsDB(Base):
    __tablename__ = "evaluation_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    breach_detection_recall = Column(Float)
    false_alarm_rate = Column(Float)
    viability_loss_rmse = Column(Float)
    report_generation_time = Column(Float)
    
    def to_dict(self):
        return {
            "id": self.id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "breach_detection_recall": self.breach_detection_recall,
            "false_alarm_rate": self.false_alarm_rate,
            "viability_loss_rmse": self.viability_loss_rmse,
            "report_generation_time": self.report_generation_time
        }


class SensorReadingDB(Base):
    __tablename__ = "sensor_readings"
    
    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String, index=True)
    facility_id = Column(String, index=True)
    temperature = Column(Float)
    humidity = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    location = Column(String)
    
    def to_dict(self):
        return {
            "id": self.id,
            "sensor_id": self.sensor_id,
            "facility_id": self.facility_id,
            "temperature": self.temperature,
            "humidity": self.humidity,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "location": self.location
        }


def init_db():
    """Initialize the database with tables"""
    Base.metadata.create_all(bind=engine)


def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
