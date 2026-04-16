from datetime import datetime
from typing import List, Optional
from ..models import BreachEvent, TemperatureReading


class BreachService:
    def __init__(self):
        self.breaches: List[BreachEvent] = []
        self.in_breach = False
        self.severity_threshold = 2.0
    
    def check_breach(self, reading: TemperatureReading, temp_service) -> Optional[BreachEvent]:
        """Check if temperature reading indicates a breach"""
        deviation = temp_service.get_deviation(reading.temperature)
        
        if deviation > 0:
            # New breach detected
            if not self.in_breach:
                self.in_breach = True
                severity = "high" if deviation > self.severity_threshold else "low"
                message = self._generate_breach_message(reading.temperature, deviation, severity)
                
                breach = BreachEvent(
                    timestamp=reading.timestamp,
                    temperature=reading.temperature,
                    deviation=deviation,
                    severity=severity,
                    message=message
                )
                self.breaches.append(breach)
                return breach
        else:
            # Temperature returned to safe range
            if self.in_breach:
                self.in_breach = False
        
        return None
    
    def _generate_breach_message(self, temperature: float, deviation: float, severity: str) -> str:
        """Generate human-readable breach message"""
        direction = "above" if temperature > 8 else "below"
        range_desc = "safe range" if severity == "low" else "safe range by significant margin"
        
        return f"Temperature {temperature}°C is {deviation}°C {direction} {range_desc}"
    
    def get_breach_count(self) -> int:
        """Get total number of breaches"""
        return len(self.breaches)
    
    def get_recent_breaches(self, limit: int = 10) -> List[BreachEvent]:
        """Get most recent breaches"""
        return self.breaches[-limit:] if self.breaches else []
    
    def reset(self):
        """Reset breach history"""
        self.breaches = []
        self.in_breach = False
