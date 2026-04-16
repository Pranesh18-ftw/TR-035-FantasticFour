import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


def get_ai_explanation(temp, duration_minutes, severity):
    """
    Get AI-generated explanation for a temperature breach using NVIDIA API.
    
    Args:
        temp: Temperature value during breach
        duration_minutes: Duration of breach in minutes
        severity: Severity level (mild, high, critical)
    
    Returns:
        AI-generated explanation text
    """
    api_key = os.getenv('NVIDIA_API_KEY')
    
    if not api_key:
        return "⚠️ NVIDIA_API_KEY not found in .env file. Please add your API key."
    
    # Construct the prompt
    prompt = f"""Explain a pharmaceutical cold chain temperature breach:
- Temperature: {temp}°C (safe range: 2-8°C)
- Duration: {duration_minutes:.1f} minutes
- Severity: {severity}

Provide a brief explanation covering:
1. Likely cause
2. Risk level
3. Recommended action

Keep response under 200 tokens."""
    
    try:
        # NVIDIA API endpoint for Llama models
        url = "https://integrate.api.nvidia.com/v1/chat/completions"
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "google/gemma-4-31b-it",
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "max_tokens": 200,
            "temperature": 0.5,
            "stream": False
        }
        
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            explanation = result['choices'][0]['message']['content']
            return explanation.strip()
        else:
            return f"⚠️ API Error: {response.status_code} - {response.text}"
            
    except requests.exceptions.Timeout:
        return "⚠️ API request timed out. Please try again."
    except requests.exceptions.RequestException as e:
        return f"⚠️ Network Error: {str(e)}"
    except Exception as e:
        return f"⚠️ Unexpected Error: {str(e)}"


if __name__ == "__main__":
    # Test the AI explainer
    print("Testing AI Explainer...")
    
    # Test with real API
    explanation = get_ai_explanation(12.5, 30.5, 'high')
    print(f"\nAI Explanation:\n{explanation}")
