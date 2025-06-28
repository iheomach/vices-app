# vices_db/products/openai_views.py
import json
import os
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from openai import OpenAI
import logging

logger = logging.getLogger(__name__)

# Initialize OpenAI client
openai_api_key = os.getenv('OPENAI_API_KEY')
client = None
if openai_api_key:
    client = OpenAI(api_key=openai_api_key)

@csrf_exempt
@require_http_methods(["POST"])
def generate_recommendations(request):
    try:
        if not client:
            return JsonResponse({'error': 'OpenAI API key not configured'}, status=500)
            
        # Parse request body
        data = json.loads(request.body)
        prompt = data.get('prompt')
        goals = data.get('goals', [])
        journal = data.get('journal', [])
        
        if not prompt:
            return JsonResponse({'error': 'Prompt is required'}, status=400)
        
        # Format goals and journal as a summary string
        goals_summary = f"User Goals: {json.dumps(goals, indent=2)}" if goals else ""
        journal_summary = f"User Journal Entries: {json.dumps(journal, indent=2)}" if journal else ""
        
        # Append the summaries to the prompt
        full_prompt = f"{prompt}\n\n{goals_summary}\n\n{journal_summary}"
        
        # Call OpenAI API
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "user",
                    "content": full_prompt
                }
            ],
            temperature=0.7,
            max_tokens=1000,
        )
        
        result = completion.choices[0].message.content
        
        return JsonResponse({'result': result})
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        logger.error(f'OpenAI API error: {str(e)}')
        return JsonResponse({'error': 'Failed to generate recommendations'}, status=500)