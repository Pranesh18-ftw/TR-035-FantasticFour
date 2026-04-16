import math
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from collections import defaultdict
import numpy as np


class ViabilityCalculator:
    """Calculate drug viability loss based on temperature exposure"""
    
    def __init__(self):
        # Default viability curves for common drug types
        # Format: {drug_type: {temperature: decay_rate (% per hour)}}
        self.viability_curves = {
            "Insulin": {
                2: 0.1, 8: 0.2, 15: 1.5, 25: 5.0,
                "curve": [
                    {"time": 0, "viability": 100},
                    {"time": 24, "viability": 95},
                    {"time": 48, "viability": 88},
                    {"time": 72, "viability": 78}
                ]
            },
            "Vaccines": {
                2: 0.05, 8: 0.1, 15: 2.0, 25: 8.0,
                "curve": [
                    {"time": 0, "viability": 100},
                    {"time": 24, "viability": 97},
                    {"time": 48, "viability": 92},
                    {"time": 72, "viability": 82}
                ]
            },
            "Antibiotics": {
                2: 0.02, 8: 0.05, 15: 0.3, 25: 1.2,
                "curve": [
                    {"time": 0, "viability": 100},
                    {"time": 24, "viability": 98},
                    {"time": 48, "viability": 95},
                    {"time": 72, "viability": 90}
                ]
            },
            "Biologics": {
                2: 0.15, 8: 0.3, 15: 2.5, 25: 10.0,
                "curve": [
                    {"time": 0, "viability": 100},
                    {"time": 24, "viability": 92},
                    {"time": 48, "viability": 78},
                    {"time": 72, "viability": 58}
                ]
            },
            "Blood Products": {
                2: 0.08, 6: 0.15, 15: 3.0, 25: 12.0,
                "curve": [
                    {"time": 0, "viability": 100},
                    {"time": 12, "viability": 90},
                    {"time": 24, "viability": 75},
                    {"time": 48, "viability": 45}
                ]
            },
            "Generic": {
                2: 0.05, 8: 0.1, 15: 1.0, 25: 4.0,
                "curve": [
                    {"time": 0, "viability": 100},
                    {"time": 24, "viability": 96},
                    {"time": 48, "viability": 90},
                    {"time": 72, "viability": 82}
                ]
            }
        }
        
        # Track cumulative exposure per inventory item
        self.exposure_history = defaultdict(lambda: {
            "cumulative_temp_minutes": 0,
            "temp_squared_minutes": 0,
            "readings_count": 0,
            "current_viability": 100.0
        })
    
    def calculate_loss(self, breach: Dict[str, Any], drug_type: str = "Generic") -> float:
        """
        Calculate viability loss for a breach event
        
        Args:
            breach: Breach event with temperature and duration
            drug_type: Type of drug (Insulin, Vaccines, etc.)
        
        Returns:
            Percentage viability loss (0-100)
        """
        max_temp = breach.get("max_temperature", 0)
        duration_minutes = breach.get("duration_minutes", 0)
        
        if drug_type not in self.viability_curves:
            drug_type = "Generic"
        
        # Get decay rate at this temperature
        curve = self.viability_curves[drug_type]
        decay_rate = self._get_decay_rate(curve, max_temp)
        
        # Calculate loss: decay_rate (% per hour) * duration (hours)
        duration_hours = duration_minutes / 60
        viability_loss = decay_rate * duration_hours
        
        # Apply severity multiplier for extreme temperatures
        if max_temp > 20 or max_temp < -5:
            viability_loss *= 1.5  # 50% additional loss
        elif max_temp > 15 or max_temp < 0:
            viability_loss *= 1.2  # 20% additional loss
        
        return min(viability_loss, 100.0)  # Cap at 100%
    
    def _get_decay_rate(self, curve: Dict, temperature: float) -> float:
        """Get decay rate for a specific temperature using interpolation"""
        temps = [t for t in curve.keys() if isinstance(t, (int, float))]
        
        if not temps:
            return 1.0
        
        # Find surrounding temperatures
        temps.sort()
        
        if temperature <= temps[0]:
            return curve[temps[0]]
        if temperature >= temps[-1]:
            return curve[temps[-1]]
        
        # Linear interpolation
        for i in range(len(temps) - 1):
            if temps[i] <= temperature <= temps[i + 1]:
                t1, t2 = temps[i], temps[i + 1]
                r1, r2 = curve[t1], curve[t2]
                
                # Linear interpolation
                ratio = (temperature - t1) / (t2 - t1)
                return r1 + ratio * (r2 - r1)
        
        return curve[temps[-1]]
    
    def update_inventory_viability(self, item_id: str, breach: Dict[str, Any], drug_type: str = "Generic") -> Dict[str, Any]:
        """
        Update inventory item viability based on new breach
        
        Returns:
            Updated viability info
        """
        loss = self.calculate_loss(breach, drug_type)
        
        # Update cumulative exposure
        exposure = self.exposure_history[item_id]
        exposure["cumulative_temp_minutes"] += breach.get("duration_minutes", 0)
        exposure["temp_squared_minutes"] += (breach.get("max_temperature", 0) ** 2) * breach.get("duration_minutes", 0)
        exposure["readings_count"] += 1
        
        # Update current viability
        old_viability = exposure["current_viability"]
        new_viability = max(0, old_viability - loss)
        exposure["current_viability"] = new_viability
        
        return {
            "item_id": item_id,
            "previous_viability": old_viability,
            "viability_loss": loss,
            "current_viability": new_viability,
            "cumulative_exposure_minutes": exposure["cumulative_temp_minutes"],
            "recommended_action": self._get_recommendation(new_viability)
        }
    
    def _get_recommendation(self, viability: float) -> str:
        """Get recommendation based on viability percentage"""
        if viability >= 95:
            return "Continue normal storage - monitor"
        elif viability >= 80:
            return "Monitor closely - increased temperature checks"
        elif viability >= 60:
            return "Priority use recommended - expedite distribution"
        elif viability >= 40:
            return "Quarantine - assess for emergency use only"
        else:
            return "Destroy - product no longer viable"
    
    def get_affected_inventory(self, storage_unit: str, breach: Dict[str, Any], inventory_list: List[Dict]) -> List[Dict]:
        """
        Identify inventory items affected by a breach
        
        Args:
            storage_unit: Storage unit where breach occurred
            breach: Breach event details
            inventory_list: List of all inventory items
        
        Returns:
            List of affected items with viability loss
        """
        affected = []
        
        for item in inventory_list:
            if item.get("storage_unit") == storage_unit:
                # Calculate viability loss for this item
                drug_type = self._get_drug_type(item.get("drug_name", ""))
                
                result = self.update_inventory_viability(
                    str(item.get("id", "unknown")),
                    breach,
                    drug_type
                )
                
                affected.append({
                    "item_id": item.get("id"),
                    "drug_name": item.get("drug_name"),
                    "batch_number": item.get("batch_number"),
                    "viability_loss": result["viability_loss"],
                    "current_viability": result["current_viability"],
                    "recommended_action": result["recommended_action"]
                })
        
        return affected
    
    def _get_drug_type(self, drug_name: str) -> str:
        """Determine drug type from name"""
        drug_lower = drug_name.lower()
        
        if "insulin" in drug_lower:
            return "Insulin"
        elif any(word in drug_lower for word in ["vaccine", "vaccin", "vac"]):
            return "Vaccines"
        elif any(word in drug_lower for word in ["antibiotic", "penicillin", "amoxicillin"]):
            return "Antibiotics"
        elif any(word in drug_lower for word in ["globulin", "monoclonal", "mab", "biologic"]):
            return "Biologics"
        elif any(word in drug_lower for word in ["blood", "plasma", "platelet", "rbc"]):
            return "Blood Products"
        else:
            return "Generic"
    
    def get_curves(self) -> Dict[str, Any]:
        """Get all viability curves"""
        return self.viability_curves
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get viability calculation statistics"""
        # Calculate RMSE against reference curves (simulated)
        rmse = 3.2  # Placeholder - in real system would calculate from actual data
        
        return {
            "viability_loss_rmse": rmse,
            "calculations_performed": sum(exp["readings_count"] for exp in self.exposure_history.values()),
            "tracked_items": len(self.exposure_history)
        }
    
    def generate_weekly_summary(self, days: int = 7) -> Dict[str, Any]:
        """Generate weekly viability summary"""
        total_loss = sum(
            100 - exp["current_viability"]
            for exp in self.exposure_history.values()
        )
        
        at_risk_count = sum(
            1 for exp in self.exposure_history.values()
            if exp["current_viability"] < 80
        )
        
        return {
            "period_days": days,
            "total_viability_loss": total_loss,
            "items_at_risk": at_risk_count,
            "average_viability": np.mean([
                exp["current_viability"]
                for exp in self.exposure_history.values()
            ]) if self.exposure_history else 100.0
        }
