from typing import List, Dict, Optional
from datetime import datetime, timedelta
import json
from ..models.database import InventoryItemDB, DrugCurveDB, SessionLocal
from .ai_generator import AIGenerator

class InventoryService:
    def __init__(self):
        self.ai_generator = AIGenerator()
        self.common_drugs = self._load_common_drugs()
    
    def _load_common_drugs(self) -> List[Dict]:
        """Common pharmaceutical drugs with their storage requirements"""
        return [
            {
                "name": "Insulin (Human)",
                "category": "Hormone",
                "temp_min": 2.0,
                "temp_max": 8.0,
                "description": "Rapid-acting insulin for diabetes management",
                "storage_notes": "Never freeze. Protect from light."
            },
            {
                "name": "Vaccines - mRNA",
                "category": "Vaccine",
                "temp_min": -70.0,
                "temp_max": -60.0,
                "description": "COVID-19 mRNA vaccines (Pfizer, Moderna)",
                "storage_notes": "Ultra-cold storage required. Thaw before use."
            },
            {
                "name": "Vaccines - Traditional",
                "category": "Vaccine", 
                "temp_min": 2.0,
                "temp_max": 8.0,
                "description": "Traditional vaccines (Influenza, Hepatitis)",
                "storage_notes": "Standard refrigeration. Avoid freezing."
            },
            {
                "name": "Antibiotics - Penicillin",
                "category": "Antibiotic",
                "temp_min": 2.0,
                "temp_max": 8.0,
                "description": "Penicillin-based antibiotics",
                "storage_notes": "Protect from moisture and light."
            },
            {
                "name": "Chemotherapy - Doxorubicin",
                "category": "Chemotherapy",
                "temp_min": 2.0,
                "temp_max": 8.0,
                "description": "Anthracycline chemotherapy agent",
                "storage_notes": "Handle with protective equipment. Light sensitive."
            },
            {
                "name": "Blood Products - RBC",
                "category": "Blood Product",
                "temp_min": 1.0,
                "temp_max": 6.0,
                "description": "Red blood cells for transfusion",
                "storage_notes": "Special blood bank refrigerator required."
            },
            {
                "name": "Blood Products - Plasma",
                "category": "Blood Product",
                "temp_min": -30.0,
                "temp_max": -20.0,
                "description": "Fresh frozen plasma",
                "storage_notes": "Frozen storage. Thaw in controlled conditions."
            },
            {
                "name": "Monoclonal Antibodies",
                "category": "Biologic",
                "temp_min": 2.0,
                "temp_max": 8.0,
                "description": "Targeted therapy antibodies",
                "storage_notes": "Do not shake. Protect from light."
            },
            {
                "name": "Enzymes - Asparaginase",
                "category": "Enzyme",
                "temp_min": 2.0,
                "temp_max": 8.0,
                "description": "Enzyme therapy for leukemia",
                "storage_notes": "Refrigerate. Avoid agitation."
            },
            {
                "name": "Growth Hormones",
                "category": "Hormone",
                "temp_min": 2.0,
                "temp_max": 8.0,
                "description": "Human growth hormone therapy",
                "storage_notes": "Protect from light. Do not freeze."
            },
            {
                "name": "Vitamin K1",
                "category": "Vitamin",
                "temp_min": 2.0,
                "temp_max": 8.0,
                "description": "Vitamin K for coagulation disorders",
                "storage_notes": "Protect from light."
            },
            {
                "name": "Epinephrine",
                "category": "Emergency Drug",
                "temp_min": 2.0,
                "temp_max": 8.0,
                "description": "Emergency medication for anaphylaxis",
                "storage_notes": "Protect from light. Check expiration regularly."
            }
        ]
    
    def get_drug_suggestions(self, query: str = "") -> List[Dict]:
        """Get AI-powered drug suggestions based on query"""
        if not query:
            return self.common_drugs[:6]  # Return first 6 drugs
        
        # Simple text matching for now
        query_lower = query.lower()
        suggestions = []
        
        for drug in self.common_drugs:
            if (query_lower in drug["name"].lower() or 
                query_lower in drug["category"].lower() or
                query_lower in drug["description"].lower()):
                suggestions.append(drug)
        
        # If no matches, use AI to get suggestions
        if not suggestions and len(query) > 2:
            try:
                ai_suggestions = self._get_ai_drug_suggestions(query)
                suggestions.extend(ai_suggestions)
            except:
                pass
        
        return suggestions[:6]  # Limit to 6 suggestions
    
    def _get_ai_drug_suggestions(self, query: str) -> List[Dict]:
        """Use AI to get drug suggestions"""
        prompt = f"""
        Based on the query "{query}", suggest 3-5 pharmaceutical drugs that are commonly stored in cold chain facilities.
        For each drug, provide:
        - Name
        - Category
        - Storage temperature range (min/max in Celsius)
        - Brief description
        - Storage notes
        
        Format as JSON array.
        """
        
        try:
            response = self.ai_generator.client.chat.completions.create(
                model="meta/llama-3.1-405b-instruct",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3
            )
            
            # Parse AI response
            ai_response = response.choices[0].message.content
            # Simple JSON parsing - in production, add better error handling
            return json.loads(ai_response)
        except Exception as e:
            print(f"AI suggestion error: {e}")
            return []
    
    def add_inventory_item(self, item_data: Dict) -> Dict:
        """Add new inventory item with AI validation"""
        db = SessionLocal()
        try:
            # Validate with AI
            validation_result = self._validate_with_ai(item_data)
            
            # Create inventory item
            db_item = InventoryItemDB(
                drug_name=item_data["drug_name"],
                batch_number=item_data["batch_number"],
                quantity=item_data["quantity"],
                storage_unit=item_data["storage_unit"],
                facility_id=item_data["facility_id"],
                optimal_temp_min=item_data.get("optimal_temp_min", 2.0),
                optimal_temp_max=item_data.get("optimal_temp_max", 8.0),
                expiry_date=datetime.fromisoformat(item_data["expiry_date"]) if item_data.get("expiry_date") else None,
                status="active"
            )
            
            db.add(db_item)
            db.commit()
            db.refresh(db_item)
            
            return {
                "success": True,
                "item": db_item.to_dict(),
                "ai_validation": validation_result
            }
            
        except Exception as e:
            db.rollback()
            return {"success": False, "error": str(e)}
        finally:
            db.close()
    
    def _validate_with_ai(self, item_data: Dict) -> Dict:
        """Use AI to validate inventory item"""
        prompt = f"""
        Validate this pharmaceutical inventory item:
        - Drug: {item_data.get('drug_name', 'Unknown')}
        - Batch: {item_data.get('batch_number', 'Unknown')}
        - Quantity: {item_data.get('quantity', 0)}
        - Storage Unit: {item_data.get('storage_unit', 'Unknown')}
        - Temp Range: {item_data.get('optimal_temp_min', 2.0)}°C to {item_data.get('optimal_temp_max', 8.0)}°C
        
        Check for:
        1. Is this a real pharmaceutical drug?
        2. Are the storage requirements appropriate?
        3. Any warnings or recommendations?
        
        Return JSON with: valid (boolean), warnings (array), recommendations (array)
        """
        
        try:
            response = self.ai_generator.client.chat.completions.create(
                model="meta/llama-3.1-405b-instruct",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2
            )
            
            ai_response = response.choices[0].message.content
            return json.loads(ai_response)
        except:
            return {"valid": True, "warnings": [], "recommendations": []}
    
    def get_all_inventory(self, facility_id: Optional[str] = None) -> List[Dict]:
        """Get all inventory items"""
        db = SessionLocal()
        try:
            query = db.query(InventoryItemDB)
            if facility_id:
                query = query.filter(InventoryItemDB.facility_id == facility_id)
            
            items = query.all()
            return [item.to_dict() for item in items]
        finally:
            db.close()
    
    def analyze_temperature_breach(self, breach_data: Dict) -> Dict:
        """Analyze temperature breach with AI context awareness"""
        prompt = f"""
        Analyze this temperature breach event:
        - Temperature: {breach_data.get('max_temperature', 'Unknown')}°C (max)
        - Duration: {breach_data.get('duration_minutes', 0)} minutes
        - Sensor: {breach_data.get('sensor_id', 'Unknown')}
        - Facility: {breach_data.get('facility_id', 'Unknown')}
        
        Consider common scenarios:
        1. Door opening for 5-10 minutes (normal operations)
        2. Equipment malfunction
        3. Power outage
        4. Human error
        5. Sensor malfunction
        
        Provide:
        1. Most likely cause
        2. Severity assessment (mild/moderate/critical)
        3. Recommended actions
        4. Impact on drug viability
        5. Preventive measures
        
        Format as JSON with keys: cause, severity, actions, impact, prevention
        """
        
        try:
            response = self.ai_generator.client.chat.completions.create(
                model="meta/llama-3.1-405b-instruct",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3
            )
            
            ai_response = response.choices[0].message.content
            return json.loads(ai_response)
        except Exception as e:
            print(f"Breach analysis error: {e}")
            return {
                "cause": "Unknown",
                "severity": "moderate",
                "actions": ["Investigate immediately", "Check sensor accuracy"],
                "impact": "Potential viability loss",
                "prevention": ["Regular maintenance", "Staff training"]
            }
