import pandas as pd
from datetime import datetime, timedelta
from typing import List, Optional
from ..models import TemperatureReading


class DataService:
    def __init__(self):
        self.csv_data: List[TemperatureReading] = []
        self.csv_index = 0
    
    def load_csv(self, file_path: str) -> List[TemperatureReading]:
        """Load temperature data from CSV file"""
        try:
            df = pd.read_csv(file_path)
            readings = []
            
            for _, row in df.iterrows():
                reading = TemperatureReading(
                    timestamp=datetime.fromisoformat(row['timestamp']) if 'timestamp' in row else datetime.now(),
                    temperature=float(row['temperature']),
                    humidity=float(row['humidity']) if 'humidity' in row else None
                )
                readings.append(reading)
            
            self.csv_data = readings
            self.csv_index = 0
            return readings
        except Exception as e:
            print(f"Error loading CSV: {e}")
            return []
    
    def get_next_csv_reading(self) -> Optional[TemperatureReading]:
        """Get next reading from loaded CSV data"""
        if self.csv_index < len(self.csv_data):
            reading = self.csv_data[self.csv_index]
            self.csv_index += 1
            return reading
        return None
    
    def generate_sample_csv_data(self, num_readings: int = 100) -> List[TemperatureReading]:
        """Generate sample temperature data for testing"""
        readings = []
        base_time = datetime.now() - timedelta(hours=num_readings * 5 / 3600)
        
        for i in range(num_readings):
            temp = 5.0 + (i % 20 - 10) * 0.3  # Vary between 2 and 8
            if i % 15 == 0:  # Add occasional breaches
                temp = 12.0 if i % 30 == 0 else -1.0
            
            reading = TemperatureReading(
                timestamp=base_time + timedelta(seconds=i * 5),
                temperature=round(temp, 1),
                humidity=50.0 + (i % 10) * 2
            )
            readings.append(reading)
        
        return readings
    
    def save_sample_csv(self, file_path: str, num_readings: int = 100):
        """Save sample data to CSV file"""
        readings = self.generate_sample_csv_data(num_readings)
        data = []
        
        for reading in readings:
            data.append({
                'timestamp': reading.timestamp.isoformat(),
                'temperature': reading.temperature,
                'humidity': reading.humidity
            })
        
        df = pd.DataFrame(data)
        df.to_csv(file_path, index=False)
