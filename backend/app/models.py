from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


class TemperatureReading(BaseModel):
    timestamp: datetime
    temperature: float
    humidity: Optional[float] = None


class BreachEvent(BaseModel):
    timestamp: datetime
    temperature: float
    deviation: float
    severity: str  # "low" or "high"
    message: str


class MonitoringStatus(BaseModel):
    current_temp: Optional[float]
    status: str  # "SAFE" or "BREACH"
    breach_count: int
    recent_breaches: List[BreachEvent]
    mode: str  # "simulation" or "manual"
    last_update: Optional[datetime]


class TemperatureRange(BaseModel):
    min_temp: float = 2.0
    max_temp: float = 8.0


class ModeRequest(BaseModel):
    mode: str  # "simulation" or "manual"


class TemperatureRequest(BaseModel):
    temperature: float
    humidity: Optional[float] = None
