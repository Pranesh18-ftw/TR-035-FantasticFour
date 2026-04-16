import random
import time
from datetime import datetime
from typing import Optional
from ..models import TemperatureReading


class TemperatureService:
    def __init__(self):
        self.current_temp: Optional[float] = None
        self.min_temp = 2.0
        self.max_temp = 8.0
        self.simulation_running = False
    
    def generate_simulated_temperature(self) -> float:
        """Generate realistic temperature fluctuations around safe range"""
        base_temp = 5.0  # Middle of safe range
        fluctuation = random.uniform(-4.0, 4.0)
        
        # Occasionally create breach conditions
        if random.random() < 0.1:  # 10% chance of breach
            fluctuation = random.choice([-5.0, 5.0, -6.0, 6.0])
        
        return round(base_temp + fluctuation, 1)
    
    def get_current_temperature(self, mode: str = "simulation") -> TemperatureReading:
        """Get current temperature based on mode"""
        if mode == "simulation":
            temp = self.generate_simulated_temperature()
        else:
            temp = self.current_temp if self.current_temp else 5.0
        
        reading = TemperatureReading(
            timestamp=datetime.now(),
            temperature=temp,
            humidity=random.uniform(40.0, 70.0) if mode == "simulation" else None
        )
        
        self.current_temp = temp
        return reading
    
    def set_manual_temperature(self, temperature: float, humidity: Optional[float] = None) -> TemperatureReading:
        """Set temperature manually"""
        reading = TemperatureReading(
            timestamp=datetime.now(),
            temperature=temperature,
            humidity=humidity
        )
        self.current_temp = temperature
        return reading
    
    def is_in_safe_range(self, temperature: float) -> bool:
        """Check if temperature is within safe range"""
        return self.min_temp <= temperature <= self.max_temp
    
    def get_deviation(self, temperature: float) -> float:
        """Calculate deviation from safe range"""
        if temperature < self.min_temp:
            return self.min_temp - temperature
        elif temperature > self.max_temp:
            return temperature - self.max_temp
        return 0.0
