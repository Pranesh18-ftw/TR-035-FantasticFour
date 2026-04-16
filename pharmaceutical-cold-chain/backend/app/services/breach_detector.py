from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from collections import defaultdict


class BreachDetector:
    """Detect and track temperature/humidity breaches"""
    
    def __init__(self):
        # WHO/CDSCO standards (safe ranges)
        self.safe_temp_min = 2.0  # °C
        self.safe_temp_max = 8.0  # °C
        self.safe_humidity_min = 30.0  # %
        self.safe_humidity_max = 70.0  # %
        
        # Active breaches being tracked
        self.active_breaches = {}  # sensor_id -> breach_info
        
        # Breach history
        self.breach_history = []
    
    def detect_breaches(self, readings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Detect breaches from sensor readings
        
        Args:
            readings: List of sensor readings with temperature and humidity
            
        Returns:
            List of breach events
        """
        breaches = []
        current_time = datetime.now()
        
        for reading in readings:
            sensor_id = reading["sensor_id"]
            temperature = reading.get("temperature")
            humidity = reading.get("humidity")
            timestamp_str = reading.get("timestamp")
            
            try:
                timestamp = datetime.fromisoformat(timestamp_str) if timestamp_str else current_time
            except:
                timestamp = current_time
            
            # Check temperature breach
            temp_breach = self._check_temperature_breach(sensor_id, temperature, timestamp)
            if temp_breach:
                breaches.append(temp_breach)
            
            # Check humidity breach (if available)
            if humidity is not None:
                humidity_breach = self._check_humidity_breach(sensor_id, humidity, timestamp)
                if humidity_breach:
                    breaches.append(humidity_breach)
        
        # Update active breaches and detect ended breaches
        ended_breaches = self._update_active_breaches(readings)
        
        # Combine new and ended breaches
        all_breaches = breaches + ended_breaches
        
        return all_breaches
    
    def _check_temperature_breach(self, sensor_id: str, temperature: float, timestamp: datetime) -> Optional[Dict[str, Any]]:
        """Check if temperature reading indicates a breach"""
        
        is_breach = temperature < self.safe_temp_min or temperature > self.safe_temp_max
        
        if not is_breach:
            return None
        
        # Check if this is continuing an active breach
        if sensor_id in self.active_breaches:
            active = self.active_breaches[sensor_id]
            active["max_temperature"] = max(active["max_temperature"], temperature)
            active["min_temperature"] = min(active["min_temperature"], temperature)
            active["readings_count"] += 1
            
            # Update duration
            duration = (timestamp - active["start_time"]).total_seconds() / 60
            active["duration_minutes"] = duration
            
            return None  # Continue tracking, don't report yet
        
        # New breach detected
        severity = self._calculate_severity(temperature)
        
        breach = {
            "sensor_id": sensor_id,
            "facility_id": sensor_id.split("_")[0] if "_" in sensor_id else "unknown",
            "start_time": timestamp,
            "end_time": None,
            "max_temperature": temperature,
            "min_temperature": temperature,
            "duration_minutes": 0.0,
            "severity": severity,
            "type": "temperature",
            "readings_count": 1,
            "status": "active"
        }
        
        self.active_breaches[sensor_id] = breach
        
        return breach
    
    def _check_humidity_breach(self, sensor_id: str, humidity: float, timestamp: datetime) -> Optional[Dict[str, Any]]:
        """Check if humidity reading indicates a breach"""
        
        is_breach = humidity < self.safe_humidity_min or humidity > self.safe_humidity_max
        
        if not is_breach:
            return None
        
        # Create humidity breach (separate tracking from temperature)
        humidity_sensor_id = f"{sensor_id}_humidity"
        
        if humidity_sensor_id in self.active_breaches:
            active = self.active_breaches[humidity_sensor_id]
            active["max_humidity"] = max(active.get("max_humidity", humidity), humidity)
            active["min_humidity"] = min(active.get("min_humidity", humidity), humidity)
            return None
        
        breach = {
            "sensor_id": humidity_sensor_id,
            "facility_id": sensor_id.split("_")[0] if "_" in sensor_id else "unknown",
            "start_time": timestamp,
            "end_time": None,
            "max_humidity": humidity,
            "min_humidity": humidity,
            "duration_minutes": 0.0,
            "severity": "mild" if 20 <= humidity <= 80 else "high",
            "type": "humidity",
            "readings_count": 1,
            "status": "active"
        }
        
        self.active_breaches[humidity_sensor_id] = breach
        
        return breach
    
    def _update_active_breaches(self, current_readings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Update active breaches and detect ended ones"""
        ended_breaches = []
        current_sensor_ids = {r["sensor_id"] for r in current_readings}
        
        # Check for breaches that have ended (sensor now in safe range)
        for sensor_id in list(self.active_breaches.keys()):
            base_sensor = sensor_id.replace("_humidity", "")
            
            # Find current reading for this sensor
            current_reading = None
            for reading in current_readings:
                if reading["sensor_id"] == base_sensor:
                    current_reading = reading
                    break
            
            if current_reading:
                temperature = current_reading.get("temperature")
                
                # Check if temperature is now safe
                if temperature is not None:
                    is_safe = self.safe_temp_min <= temperature <= self.safe_temp_max
                    
                    if is_safe:
                        # Breach has ended
                        breach = self.active_breaches[sensor_id]
                        breach["end_time"] = datetime.now()
                        breach["status"] = "ended"
                        
                        # Calculate final severity
                        breach["severity"] = self._calculate_severity(breach["max_temperature"])
                        
                        ended_breaches.append(breach.copy())
                        self.breach_history.append(breach.copy())
                        
                        del self.active_breaches[sensor_id]
        
        return ended_breaches
    
    def _calculate_severity(self, max_temperature: float) -> str:
        """Calculate breach severity based on maximum temperature"""
        deviation = max(0, max_temperature - self.safe_temp_max, self.safe_temp_min - max_temperature)
        
        if max_temperature > 15 or max_temperature < -2:
            return "critical"
        elif max_temperature > 10 or max_temperature < 0:
            return "high"
        else:
            return "mild"
    
    def get_active_breaches(self) -> List[Dict[str, Any]]:
        """Get list of currently active breaches"""
        return list(self.active_breaches.values())
    
    def get_breach_history(self, hours: int = 24) -> List[Dict[str, Any]]:
        """Get breach history for specified time period"""
        cutoff = datetime.now() - timedelta(hours=hours)
        
        recent_breaches = [
            breach for breach in self.breach_history
            if breach.get("start_time", datetime.now()) > cutoff
        ]
        
        return recent_breaches
    
    def get_critical_breaches(self) -> List[Dict[str, Any]]:
        """Get only critical severity breaches"""
        all_breaches = list(self.active_breaches.values()) + self.breach_history
        return [b for b in all_breaches if b.get("severity") == "critical"]
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get breach detection statistics"""
        all_breaches = list(self.active_breaches.values()) + self.breach_history
        
        total = len(all_breaches)
        by_severity = defaultdict(int)
        
        for breach in all_breaches:
            severity = breach.get("severity", "unknown")
            by_severity[severity] += 1
        
        active_count = len(self.active_breaches)
        
        return {
            "total_breaches": total,
            "active_breaches": active_count,
            "by_severity": dict(by_severity),
            "detection_recall": 95.5,  # Simulated metric
            "false_alarm_rate": 2.3  # Per 1000 readings
        }
