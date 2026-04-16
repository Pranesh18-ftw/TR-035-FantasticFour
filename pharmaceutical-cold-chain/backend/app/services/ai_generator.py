import os
import json
from typing import List, Dict, Any
from datetime import datetime, timedelta
import random
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

class AIGenerator:
    """Generate synthetic pharmaceutical data using NVIDIA AI API with reasoning capabilities"""
    
    def __init__(self):
        self.api_key = os.getenv("NVIDIA_API_KEY")
        self.base_url = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")
        self.model = os.getenv("NVIDIA_MODEL", "nvidia/nemotron-3-super-120b-a12b")
        
        if self.api_key:
            self.client = OpenAI(
                base_url=self.base_url,
                api_key=self.api_key
            )
        else:
            self.client = None
    
    def _call_nvidia_api(self, prompt: str, max_tokens: int = 16384, temperature: float = 1.0) -> str:
        """Call NVIDIA API with thinking enabled using OpenAI SDK"""
        if not self.client:
            print("NVIDIA_API_KEY not found, using fallback.")
            return self._get_fallback_response(prompt)
        
        try:
            # Using synchronous call for simplicity in current architecture
            # Thinking/Reasoning is enabled via extra_body
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=temperature,
                top_p=0.95,
                max_tokens=max_tokens,
                extra_body={
                    "chat_template_kwargs": {"enable_thinking": True},
                    "reasoning_budget": max_tokens // 2
                }
            )
            
            # Extract content (thinking/reasoning is usually in reasoning_content or part of the stream)
            # For non-streaming, we just get the message content
            return completion.choices[0].message.content
                
        except Exception as e:
            print(f"NVIDIA API Error: {e}")
            return self._get_fallback_response(prompt)
    
    def _get_fallback_response(self, prompt: str) -> str:
        """Provide fallback response when API fails"""
        prompt_lower = prompt.lower()
        if "viability curve" in prompt_lower:
            return self._generate_fallback_curves()
        elif "regulatory" in prompt_lower:
            return self._generate_fallback_standards()
        elif "inventory" in prompt_lower:
            return self._generate_fallback_inventory()
        elif "breach" in prompt_lower or "explain" in prompt_lower:
            return self._generate_fallback_explanation()
        elif "suggest" in prompt_lower and "drug" in prompt_lower:
             return self._generate_fallback_inventory() # Reusing for simplicity
        return "{}"
    
    def _generate_fallback_curves(self) -> str:
        """Generate fallback drug viability curves"""
        drugs = ["Insulin", "Vaccines", "Antibiotics", "Biologics", "Blood Products"]
        curves = []
        for drug in drugs:
            curves.append({
                "drug_name": drug,
                "temperature": random.choice([2, 8, 15, 25]),
                "decay_rate": round(random.uniform(0.5, 5.0), 2),
                "reference_curve": [
                    {"time": 0, "viability": 100},
                    {"time": 24, "viability": round(100 - random.uniform(5, 20), 1)},
                    {"time": 48, "viability": round(100 - random.uniform(15, 40), 1)},
                    {"time": 72, "viability": round(100 - random.uniform(30, 60), 1)}
                ]
            })
        return json.dumps(curves)
    
    def _generate_fallback_standards(self) -> str:
        """Generate fallback regulatory standards"""
        standards = [
            {
                "organization": "WHO",
                "drug_category": "Vaccines",
                "min_temp": 2.0,
                "max_temp": 8.0,
                "max_exposure_time": 60,
                "description": "Standard cold chain storage for vaccines"
            },
            {
                "organization": "CDSCO",
                "drug_category": "Insulin",
                "min_temp": 2.0,
                "max_temp": 8.0,
                "max_exposure_time": 30,
                "description": "Temperature-sensitive biologics storage"
            },
            {
                "organization": "WHO",
                "drug_category": "Blood Products",
                "min_temp": 1.0,
                "max_temp": 6.0,
                "max_exposure_time": 30,
                "description": "Critical temperature control for blood products"
            }
        ]
        return json.dumps(standards)
    
    def _generate_fallback_inventory(self) -> str:
        """Generate fallback inventory data"""
        drugs = [
            ("COVID-19 Vaccine", "VAC2024A", 500),
            ("Insulin Glargine", "INS5678", 200),
            ("Influenza Vaccine", "FLU2024", 300),
            ("Hepatitis B Vaccine", "HEP2024", 150),
            ("Rabies Immunoglobulin", "RAB2024", 50)
        ]
        inventory = []
        for i, (drug, batch, qty) in enumerate(drugs):
            inventory.append({
                "drug_name": drug,
                "batch_number": batch,
                "quantity": qty,
                "storage_unit": f"COLD_STORE_{i+1}",
                "facility_id": f"FAC_{random.randint(1, 3)}",
                "optimal_temp_min": 2.0,
                "optimal_temp_max": 8.0,
                "status": "active",
                "expiry_date": (datetime.now() + timedelta(days=random.randint(30, 365))).isoformat(),
                "current_viability": 100.0,
                "cumulative_temp_exposure": 0.0
            })
        return json.dumps(inventory)
    
    def _generate_fallback_explanation(self) -> str:
        """Generate fallback breach explanation"""
        explanations = [
            "Temperature breach detected. Likely cause: Refrigeration system malfunction or door left open. Risk: Moderate to High - product viability may be compromised. Recommended Action: Immediate inspection of storage unit, quarantine affected inventory, repair/replace cooling system.",
            "Critical temperature excursion identified. Likely cause: Power outage or equipment failure. Risk: High - pharmaceutical efficacy significantly reduced. Recommended Action: Emergency response protocol, immediate product quarantine, notify district health officer.",
            "Temperature out of range detected. Likely cause: Seasonal temperature fluctuation or HVAC issue. Risk: Low to Moderate. Recommended Action: Check door seals, verify thermostat settings, monitor for 24 hours."
        ]
        return random.choice(explanations)
    
    def generate_viability_curves(self) -> List[Dict[str, Any]]:
        """Generate drug viability decay curves using AI"""
        prompt = """Generate realistic pharmaceutical drug viability decay curves at different temperatures.
        
        For these drug categories: Insulin, Vaccines, Antibiotics, Biologics, Blood Products
        
        Create JSON format with:
        - drug_name: string
        - temperature: float (in Celsius)
        - decay_rate: float (% viability loss per hour)
        - reference_curve: array of {time: hours, viability: percentage}
        
        Base on real pharmaceutical degradation data. Temperatures should include 2°C, 8°C, 15°C, 25°C.
        Return only valid JSON array."""
        
        response = self._call_nvidia_api(prompt)
        try:
            return json.loads(response)
        except:
            return json.loads(self._generate_fallback_curves())
    
    def generate_regulatory_standards(self) -> List[Dict[str, Any]]:
        """Generate WHO/CDSCO regulatory standards using AI"""
        prompt = """Generate pharmaceutical cold chain regulatory standards based on WHO and CDSCO guidelines.
        
        Create standards for:
        - Vaccines
        - Insulin and biologics
        - Blood products
        - Antibiotics
        
        JSON format:
        - organization: "WHO" or "CDSCO"
        - drug_category: string
        - min_temp: float (°C)
        - max_temp: float (°C)
        - max_exposure_time: integer (minutes, optional)
        - description: string
        
        Return only valid JSON array."""
        
        response = self._call_nvidia_api(prompt)
        try:
            return json.loads(response)
        except:
            return json.loads(self._generate_fallback_standards())
    
    def generate_inventory_data(self) -> List[Dict[str, Any]]:
        """Generate realistic inventory data using AI"""
        prompt = """Generate realistic pharmaceutical inventory data for cold storage facilities.
        
        Create 5-8 inventory items with:
        - drug_name: common vaccine or biologic name
        - batch_number: realistic format
        - quantity: integer (50-1000)
        - storage_unit: string (e.g., COLD_STORE_1)
        - facility_id: FAC_1, FAC_2, or FAC_3
        - optimal_temp_min: 2.0
        - optimal_temp_max: 8.0
        - status: "active"
        - expiry_date: ISO format date (30-365 days from now)
        - current_viability: 100.0
        - cumulative_temp_exposure: 0.0
        
        Return only valid JSON array."""
        
        response = self._call_nvidia_api(prompt)
        try:
            return json.loads(response)
        except:
            return json.loads(self._generate_fallback_inventory())
    
    def get_breach_explanation(self, breach: Dict[str, Any]) -> str:
        """Get AI explanation for a breach event"""
        temp = breach.get('max_temperature', 0)
        duration = breach.get('duration_minutes', 0)
        severity = breach.get('severity', 'unknown')
        
        prompt = f"""Explain this pharmaceutical cold chain breach:
        
        - Maximum Temperature: {temp}°C (safe range: 2-8°C)
        - Duration: {duration:.1f} minutes
        - Severity: {severity}
        
        Provide:
        1. Likely cause
        2. Risk assessment
        3. Recommended immediate actions
        
        Keep under 150 words. Be professional and specific to pharmaceutical storage."""
        
        return self._call_nvidia_api(prompt, max_tokens=300)
    
    def generate_compliance_recommendations(self, breaches: List[Dict]) -> List[str]:
        """Generate compliance recommendations based on breach history"""
        breach_count = len(breaches)
        
        prompt = f"""Based on {breach_count} temperature breaches in the past week, generate 3-5 compliance recommendations for a district health officer.
        
        Focus on:
        - Infrastructure improvements
        - Staff training needs
        - Monitoring protocol enhancements
        
        Return as JSON array of strings."""
        
        response = self._call_nvidia_api(prompt, max_tokens=500)
        try:
            return json.loads(response)
        except:
            return [
                "Install additional temperature monitoring sensors for redundancy",
                "Conduct staff training on cold chain management protocols",
                "Schedule preventive maintenance for refrigeration units",
                "Review and update standard operating procedures"
            ]
