from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class SeverityLevel(str, Enum):
    MILD = "mild"
    HIGH = "high"
    CRITICAL = "critical"


class SensorReading(BaseModel):
    sensor_id: str
    facility_id: str
    temperature: float
    humidity: Optional[float] = None
    timestamp: datetime
    location: str


class BreachEvent(BaseModel):
    id: Optional[int] = None
    sensor_id: str
    facility_id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    max_temperature: float
    min_temperature: float
    duration_minutes: float
    severity: SeverityLevel
    viability_loss: float = 0.0
    affected_inventory: List[str] = []
    ai_explanation: Optional[str] = None
    quarantine_recommended: bool = False


class InventoryItem(BaseModel):
    id: Optional[int] = None
    drug_name: str
    batch_number: str
    quantity: int
    storage_unit: str
    facility_id: str
    optimal_temp_min: float = 2.0
    optimal_temp_max: float = 8.0
    status: str = "active"  # active, quarantined, disposed
    expiry_date: Optional[datetime] = None
    current_viability: float = 100.0
    cumulative_temp_exposure: float = 0.0


class DrugViabilityCurve(BaseModel):
    drug_name: str
    temperature: float
    decay_rate: float  # % loss per hour at this temperature
    reference_curve: List[Dict[str, float]]  # time vs viability points


class ComplianceReport(BaseModel):
    period: str
    generated_at: datetime
    total_breaches: int
    breaches_by_severity: Dict[str, int]
    total_viability_loss: float
    inventory_summary: Dict[str, Any]
    recommendations: List[str]


class EvaluationMetrics(BaseModel):
    timestamp: datetime
    breach_detection_recall: float  # percentage
    false_alarm_rate: float  # per 1000 readings
    viability_loss_rmse: float
    report_generation_time: float  # seconds


class RegulatoryStandard(BaseModel):
    organization: str  # WHO, CDSCO, etc.
    drug_category: str
    min_temp: float
    max_temp: float
    max_exposure_time: Optional[int] = None  # minutes
    description: str


class AffectedInventory(BaseModel):
    item_id: int
    drug_name: str
    batch_number: str
    viability_loss: float
    recommended_action: str


class QuarantineRecommendation(BaseModel):
    breach_id: int
    affected_items: List[AffectedInventory]
    severity: SeverityLevel
    recommended_action: str
    estimated_financial_impact: Optional[float] = None
