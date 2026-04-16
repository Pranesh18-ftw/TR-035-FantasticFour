"""
Cold Chain Breach Detector - Demo Script
This script runs both the backend API and demonstrates the system functionality.
"""

import asyncio
import aiohttp
import time
from datetime import datetime


async def demo():
    """Run a demo of the cold chain detector system"""
    base_url = "http://localhost:8001"
    
    print("=" * 60)
    print("🌡️  Cold Chain Breach Detector - Demo")
    print("=" * 60)
    print()
    
    async with aiohttp.ClientSession() as session:
        # Check API status
        print("📡 Checking API status...")
        async with session.get(f"{base_url}/") as resp:
            status = await resp.json()
            print(f"✅ API Status: {status['status']}")
            print(f"   Service: {status['service']}")
            print(f"   Version: {status['version']}")
        print()
        
        # Get configuration
        print("⚙️  Getting configuration...")
        async with session.get(f"{base_url}/config") as resp:
            config = await resp.json()
            print(f"   Safe Range: {config['min_temp']}°C - {config['max_temp']}°C")
        print()
        
        # Start monitoring
        print("🚀 Starting monitoring...")
        async with session.post(f"{base_url}/start") as resp:
            result = await resp.json()
            print(f"   {result['message']}")
        print()
        
        # Simulate some temperature readings
        print("📊 Simulating temperature readings...")
        test_temperatures = [5.0, 5.5, 12.0, 15.0, 5.2, -1.0, 5.3]
        
        for temp in test_temperatures:
            print(f"   Submitting temperature: {temp}°C")
            async with session.post(
                f"{base_url}/temperature",
                json={"temperature": temp}
            ) as resp:
                result = await resp.json()
                if result['breach_detected']:
                    print(f"   ⚠️  BREACH DETECTED!")
                else:
                    print(f"   ✅ Temperature in safe range")
            
            # Get current status
            async with session.get(f"{base_url}/status") as resp:
                status_data = await resp.json()
                print(f"   Current Status: {status_data['status']}")
                print(f"   Breach Count: {status_data['breach_count']}")
            
            print()
            await asyncio.sleep(1)
        
        # Get breach history
        print("📋 Getting breach history...")
        async with session.get(f"{base_url}/breaches") as resp:
            breaches = await resp.json()
            print(f"   Total breaches: {breaches['total_breaches']}")
            for breach in breaches['breaches'][-3:]:
                print(f"   - {breach['message']} ({breach['severity']})")
        print()
        
        # Get logs
        print("📝 Getting system logs...")
        async with session.get(f"{base_url}/logs") as resp:
            logs = await resp.json()
            print(f"   Recent logs (last 5):")
            for log in logs['logs'][-5:]:
                print(f"   {log}")
        print()
        
        # Switch to simulation mode
        print("🔄 Switching to simulation mode...")
        async with session.post(
            f"{base_url}/mode",
            json={"mode": "simulation"}
        ) as resp:
            result = await resp.json()
            print(f"   {result['message']}")
        print()
        
        # Let simulation run for a few seconds
        print("⏱️  Running simulation for 10 seconds...")
        for i in range(2):
            await asyncio.sleep(5)
            async with session.get(f"{base_url}/status") as resp:
                status_data = await resp.json()
                print(f"   Status: {status_data['status']}, Temp: {status_data['current_temp']}°C")
        print()
        
        # Stop monitoring
        print("🛑 Stopping monitoring...")
        async with session.post(f"{base_url}/stop") as resp:
            result = await resp.json()
            print(f"   {result['message']}")
        print()
        
        # Reset
        print("🔄 Resetting system...")
        async with session.post(f"{base_url}/reset") as resp:
            result = await resp.json()
            print(f"   {result['message']}")
        print()
        
        print("=" * 60)
        print("✅ Demo completed successfully!")
        print("=" * 60)
        print()
        print("🌐 Dashboard available at: http://localhost:8001/dashboard")
        print("📚 API docs available at: http://localhost:8001/docs")


if __name__ == "__main__":
    print("⚠️  Make sure the backend is running on http://localhost:8001")
    print("   Start it with: cd backend && python run.py")
    print()
    
    try:
        asyncio.run(demo())
    except aiohttp.ClientError as e:
        print(f"❌ Error: Could not connect to API. Make sure the backend is running.")
        print(f"   Error details: {e}")
