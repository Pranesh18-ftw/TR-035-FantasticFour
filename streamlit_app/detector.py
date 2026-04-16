import pandas as pd
from datetime import datetime, timedelta


class BreachEvent:
    """Represents a single temperature breach event."""
    
    def __init__(self, start_time, end_time, max_temp, min_temp, severity):
        self.start_time = start_time
        self.end_time = end_time
        self.duration = end_time - start_time
        self.max_temp = max_temp
        self.min_temp = min_temp
        self.severity = severity
    
    def to_dict(self):
        """Convert breach event to dictionary for display."""
        return {
            'start_time': self.start_time,
            'end_time': self.end_time,
            'duration_minutes': self.duration.total_seconds() / 60,
            'max_temp': self.max_temp,
            'min_temp': self.min_temp,
            'severity': self.severity
        }


def detect_breaches(df, min_safe_temp=2.0, max_safe_temp=8.0):
    """
    Detect temperature breaches in sensor data.
    
    Args:
        df: DataFrame with 'timestamp' and 'temperature' columns
        min_safe_temp: Minimum safe temperature (default: 2°C)
        max_safe_temp: Maximum safe temperature (default: 8°C)
    
    Returns:
        List of BreachEvent objects
    """
    breaches = []
    in_breach = False
    breach_start = None
    breach_max_temp = float('-inf')
    breach_min_temp = float('inf')
    
    for idx, row in df.iterrows():
        temp = row['temperature']
        timestamp = row['timestamp']
        
        # Check if temperature is in breach
        is_breach = temp < min_safe_temp or temp > max_safe_temp
        
        if is_breach and not in_breach:
            # Start of a new breach
            in_breach = True
            breach_start = timestamp
            breach_max_temp = temp
            breach_min_temp = temp
        elif is_breach and in_breach:
            # Continue tracking breach
            breach_max_temp = max(breach_max_temp, temp)
            breach_min_temp = min(breach_min_temp, temp)
        elif not is_breach and in_breach:
            # End of breach
            in_breach = False
            breach_end = timestamp
            
            # Determine severity
            severity = calculate_severity(breach_max_temp)
            
            breach = BreachEvent(
                start_time=breach_start,
                end_time=breach_end,
                max_temp=breach_max_temp,
                min_temp=breach_min_temp,
                severity=severity
            )
            breaches.append(breach)
    
    # Handle case where data ends while still in breach
    if in_breach:
        breach_end = df.iloc[-1]['timestamp']
        severity = calculate_severity(breach_max_temp)
        breach = BreachEvent(
            start_time=breach_start,
            end_time=breach_end,
            max_temp=breach_max_temp,
            min_temp=breach_min_temp,
            severity=severity
        )
        breaches.append(breach)
    
    return breaches


def calculate_severity(max_temp):
    """
    Calculate breach severity based on maximum temperature.
    
    Args:
        max_temp: Maximum temperature during breach
    
    Returns:
        Severity level: 'mild', 'high', or 'critical'
    """
    if max_temp < 10:
        return 'mild'
    elif max_temp <= 15:
        return 'high'
    else:
        return 'critical'


if __name__ == "__main__":
    # Test the detector
    from simulator import generate_sensor_data
    
    df = generate_sensor_data(hours=24)
    breaches = detect_breaches(df)
    
    print(f"Detected {len(breaches)} breaches:")
    for breach in breaches:
        print(f"\nBreach: {breach.severity}")
        print(f"  Start: {breach.start_time}")
        print(f"  End: {breach.end_time}")
        print(f"  Duration: {breach.duration.total_seconds() / 60:.1f} minutes")
        print(f"  Max Temp: {breach.max_temp:.1f}°C")
        print(f"  Min Temp: {breach.min_temp:.1f}°C")
