import random
import time
from datetime import datetime, timedelta
from typing import Dict, List, Any
import asyncio

class DemoDataSimulator:
    """
    Generates realistic fake sensor data for demo presentation.
    Simulates temperature fluctuations and occasional breaches.
    """
    
    def __init__(self):
        self.sensors = ['COLD_STORE_1', 'COLD_STORE_2', 'COLD_STORE_3', 'PORTABLE_1']
        self.sensor_states = {}
        self.readings_history = []
        self.active_breaches = []
        self.breach_counter = 0
        
        # Initialize sensor states
        for sensor_id in self.sensors:
            self.sensor_states[sensor_id] = {
                'current_temp': random.uniform(3.0, 6.0),
                'trend': random.choice([-0.5, 0, 0.5]),
                'breach_active': False,
                'breach_start': None
            }
    
    def generate_reading(self, sensor_id: str) -> Dict[str, Any]:
        """Generate a single sensor reading with realistic fluctuations"""
        state = self.sensor_states[sensor_id]
        
        # Simulate temperature changes
        noise = random.uniform(-0.8, 0.8)
        trend_change = random.uniform(-0.3, 0.3)
        state['trend'] += trend_change
        state['trend'] = max(-2, min(2, state['trend']))  # Limit trend
        
        new_temp = state['current_temp'] + state['trend'] * 0.1 + noise * 0.3
        
        # Keep within realistic bounds most of the time
        if not state['breach_active']:
            new_temp = max(1.5, min(9.0, new_temp))
        
        state['current_temp'] = new_temp
        
        return {
            'sensor_id': sensor_id,
            'temperature': round(new_temp, 2),
            'timestamp': datetime.now().isoformat(),
            'status': 'breach' if state['breach_active'] else 'normal'
        }
    
    def generate_all_readings(self) -> List[Dict[str, Any]]:
        """Generate readings for all sensors"""
        readings = []
        for sensor_id in self.sensors:
            reading = self.generate_reading(sensor_id)
            readings.append(reading)
        
        self.readings_history.extend(readings)
        # Keep only last 100 readings per sensor
        if len(self.readings_history) > 400:
            self.readings_history = self.readings_history[-400:]
        
        return readings
    
    def check_and_create_breaches(self) -> List[Dict[str, Any]]:
        """Check for temperature breaches and create breach events"""
        new_breaches = []
        
        for sensor_id in self.sensors:
            state = self.sensor_states[sensor_id]
            temp = state['current_temp']
            
            # Check if in breach (outside 2-8°C range)
            is_breach = temp < 2.0 or temp > 8.0
            
            if is_breach and not state['breach_active']:
                # New breach started
                self.breach_counter += 1
                state['breach_active'] = True
                state['breach_start'] = datetime.now()
                
                breach = {
                    'id': f'breach_{self.breach_counter}',
                    'sensor_id': sensor_id,
                    'start_time': datetime.now().isoformat(),
                    'peak_temp': temp,
                    'current_temp': temp,
                    'severity': 'critical' if temp > 10.0 or temp < 0.0 else 'high',
                    'status': 'active'
                }
                
                self.active_breaches.append(breach)
                new_breaches.append(breach)
                
            elif not is_breach and state['breach_active']:
                # Breach ended
                state['breach_active'] = False
                # Mark breach as resolved
                for breach in self.active_breaches:
                    if breach['sensor_id'] == sensor_id and breach['status'] == 'active':
                        breach['status'] = 'resolved'
                        breach['end_time'] = datetime.now().isoformat()
        
        # Update current temps in active breaches
        for breach in self.active_breaches:
            if breach['status'] == 'active':
                sensor_id = breach['sensor_id']
                breach['current_temp'] = self.sensor_states[sensor_id]['current_temp']
                breach['peak_temp'] = max(breach['peak_temp'], breach['current_temp'])
        
        return new_breaches
    
    def get_current_data(self) -> Dict[str, Any]:
        """Get all current sensor data and breaches"""
        readings = self.generate_all_readings()
        new_breaches = self.check_and_create_breaches()
        
        # Filter to only active breaches for the response
        active_breaches = [b for b in self.active_breaches if b['status'] == 'active']
        
        return {
            'readings': readings,
            'breaches': active_breaches,
            'all_breaches': self.active_breaches,
            'timestamp': datetime.now().isoformat()
        }
    
    def simulate_demo_scenario(self) -> None:
        """Trigger a demo breach scenario for presentation"""
        # Pick random sensor to go into breach
        sensor_id = random.choice(self.sensors)
        state = self.sensor_states[sensor_id]
        
        # Force temperature to breach level
        state['current_temp'] = random.uniform(10.0, 12.0)
        state['trend'] = 1.5  # Upward trend
        print(f"[SIMULATOR] Demo breach triggered on {sensor_id}: {state['current_temp']:.1f}°C")
    
    def get_metrics(self) -> Dict[str, Any]:
        """Generate system metrics"""
        return {
            'breach_detection_recall': 96.5,
            'false_alarm_rate': 1.8,
            'viability_loss_rmse': 2.8,
            'report_generation_time': 1.2
        }
    
    def get_compliance_report(self, days: int = 7) -> Dict[str, Any]:
        """Generate compliance report data"""
        return {
            'period': f'{days} days',
            'total_breaches': len(self.active_breaches),
            'total_viability_loss': random.uniform(5.0, 15.0),
            'inventory_summary': {
                'total_items': 24,
                'quarantined_items': len([b for b in self.active_breaches if b['severity'] == 'critical'])
            },
            'recommendations': [
                'Monitor COLD_STORE_3 closely - frequent temperature spikes detected',
                'Consider recalibrating PORTABLE_1 sensor',
                'Review cold chain protocols for high-value inventory'
            ]
        }

# Global simulator instance
simulator = DemoDataSimulator()

# For demo: trigger occasional breaches
def should_trigger_demo_breach() -> bool:
    """Randomly decide to trigger a demo breach (30% chance every 30 seconds)"""
    return random.random() < 0.3
