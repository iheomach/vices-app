# views.py
import stripe
import json
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

stripe.api_key = settings.STRIPE_SECRET_KEY

@csrf_exempt
@require_http_methods(["POST"])
def create_payment_intent(request):
    try:
        data = json.loads(request.body)
        amount = data['amount']  # Amount in cents
        currency = data.get('currency', 'usd')
        
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency=currency,
            metadata={'user_id': data.get('user_id')}
        )
        
        return JsonResponse({
            'client_secret': intent.client_secret
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        return JsonResponse({'error': 'Invalid payload'}, status=400)
    except stripe.error.SignatureVerificationError:
        return JsonResponse({'error': 'Invalid signature'}, status=400)
    
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        # Handle successful payment
        handle_successful_payment(payment_intent)
    
    return JsonResponse({'status': 'success'})

def handle_successful_payment(payment_intent):
    # Update your database, send confirmation emails, etc.
    user_id = payment_intent['metadata'].get('user_id')
    amount = payment_intent['amount']
    # Your business logic here
    pass