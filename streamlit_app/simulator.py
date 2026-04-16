import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random


def generate_sensor_data(hours=24, interval_minutes=5):
    """
    Generate simulated cold storage sensor data.
    
    Args:
        hours: Number of hours of data to generate
        interval_minutes: Time interval between readings
    
    Returns:
        pandas DataFrame with timestamp and temperature columns
    """
    # Generate time series
    end_time = datetime.now()
    start_time = end_time - timedelta(hours=hours)
    
    timestamps = pd.date_range(
        start=start_time,
        end=end_time,
        freq=f'{interval_minutes}min'
    )
    
    # Generate temperatures with normal distribution around 5°C (safe range: 2-8°C)
    temperatures = np.random.normal(5, 1.5, len(timestamps))
    
    # Inject random breaches (10% chance per reading)
    for i in range(len(temperatures)):
        if random.random() < 0.1:
            # Random breach type
            breach_type = random.choice(['spike', 'drop'])
            if breach_type == 'spike':
                # Spike: 10-15°C
                temperatures[i] = random.uniform(10, 15)
            else:
                # Drop: -2 to 0°C
                temperatures[i] = random.uniform(-2, 0)
    
    # Create DataFrame
    df = pd.DataFrame({
        'timestamp': timestamps,
        'temperature': temperatures
    })
    
    return df


if __name__ == "__main__":
    # Test the simulator
    df = generate_sensor_data(hours=24)
    print(f"Generated {len(df)} data points")
    print(df.head(10))
    print(f"\nTemperature statistics:")
    print(df['temperature'].describe())
