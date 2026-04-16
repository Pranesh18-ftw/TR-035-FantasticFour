import numpy as np
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any
from collections import deque


class SensorSimulator:
    """Simulate IoT sensor data from cold storage units"""
    
    def __init__(self):
        # Storage unit configurations
        self.facilities = [
            {"id": "FAC_1", "name": "District Hospital Cold Storage", "units": ["COLD_STORE_1", "COLD_STORE_2"]},
            {"id": "FAC_2", "name": "PHC Primary Storage", "units": ["COLD_STORE_3"]},
            {"id": "FAC_3", "name": "Mobile Vaccine Unit", "units": ["PORTABLE_1"]}
        ]
        
        # Historical data storage (keep last 24 hours)
        self.history = deque(maxlen=10000)
        
        # Current sensor states
        self.sensor_states = {}
        self._init_sensors()
    
    def _init_sensors(self):
        """Initialize sensor states"""
        for facility in self.facilities:
            for unit in facility["units"]:
                sensor_id = f"{facility['id']}_{unit}"
                self.sensor_states[sensor_id] = {
                    "facility_id": facility["id"],
                    "location": unit,
                    "base_temp": random.uniform(4.0, 6.0),  # Normal operating temp
                    "trend": 0,  # Temperature trend
                    "breach_probability": 0.05  # 5% chance of breach per reading
                }
    
    def generate_readings(self) -> List[Dict[str, Any]]:
        """Generate new sensor readings for all units"""
        readings = []
        timestamp = datetime.now()
        
        for sensor_id, state in self.sensor_states.items():
            # Determine if this reading should be a breach
            is_breach = random.random() < state["breach_probability"]
            
            if is_breach:
                # Generate breach temperature
                breach_type = random.choice(["high", "low"])
                if breach_type == "high":
                    temperature = random.uniform(10.0, 18.0)  # Above safe range
                else:
                    temperature = random.uniform(-3.0, 1.0)  # Below safe range
            else:
                # Generate normal temperature with slight variation
                base = state["base_temp"]
                noise = np.random.normal(0, 0.5)
                trend_factor = state["trend"] * 0.1
                temperature = base + noise + trend_factor
                
                # Update trend (random walk)
                state["trend"] += np.random.normal(0, 0.1)
                state["trend"] = max(-2, min(2, state["trend"]))  # Clamp trend
            
            # Generate humidity (if applicable)
            humidity = random.uniform(45.0, 65.0) if "COLD" in state["location"] else None
            
            reading = {
                "sensor_id": sensor_id,
                "facility_id": state["facility_id"],
                "temperature": round(temperature, 2),
                "humidity": round(humidity, 1) if humidity else None,
                "timestamp": timestamp.isoformat(),
                "location": state["location"]
            }
            
            readings.append(reading)
            self.history.append(reading)
        
        return readings
    
    def get_latest_readings(self) -> List[Dict[str, Any]]:
        """Get the most recent readings for all sensors"""
        # Group by sensor and get latest
        latest = {}
        for reading in reversed(self.history):
            sensor_id = reading["sensor_id"]
            if sensor_id not in latest:
                latest[sensor_id] = reading
        
        return list(latest.values())
    
    def get_history(self, hours: int = 24) -> List[Dict[str, Any]]:
        """Get historical readings for specified time period"""
        cutoff_time = datetime.now() - timedelta(hours=hours)
        
        filtered_history = [
            reading for reading in self.history
            if datetime.fromisoformat(reading["timestamp"]) > cutoff_time
        ]
        
        return filtered_history
    
    def inject_breach(self, sensor_id: str, breach_type: str = "high", duration_minutes: int = 30):
        """Manually inject a breach for testing"""
        if sensor_id not in self.sensor_states:
            return False
        
        # Temporarily increase breach probability
        original_prob = self.sensor_states[sensor_id]["breach_probability"]
        self.sensor_states[sensor_id]["breach_probability"] = 1.0
        
        # Store original base temp
        original_base = self.sensor_states[sensor_id]["base_temp"]
        
        # Set extreme temperature
        if breach_type == "high":
            self.sensor_states[sensor_id]["base_temp"] = random.uniform(12.0, 20.0)
        else:
            self.sensor_states[sensor_id]["base_temp"] = random.uniform(-5.0, 0.0)
        
        # Schedule restoration
        def restore():
            self.sensor_states[sensor_id]["breach_probability"] = original_prob
            self.sensor_states[sensor_id]["base_temp"] = random.uniform(4.0, 6.0)
        
        # In real implementation, use a timer or scheduled task
        import threading
        timer = threading.Timer(duration_minutes * 60, restore)
        timer.start()
        
        return True
