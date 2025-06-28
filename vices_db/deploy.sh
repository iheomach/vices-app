#!/bin/bash
# deploy.sh - Production deployment script

echo "🚀 Starting production deployment..."

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production file not found!"
    echo "📝 Please copy .env.production.template to .env.production and configure it"
    exit 1
fi

# Load production environment variables
export $(cat .env.production | xargs)

echo "🔍 Running system checks..."
python manage.py check --settings=vices_db.settings.production --deploy

if [ $? -ne 0 ]; then
    echo "❌ System checks failed!"
    exit 1
fi

echo "📦 Installing production dependencies..."
pip install -r ../requirements.txt

echo "🗄️ Running database migrations..."
python manage.py migrate --settings=vices_db.settings.production

echo "📁 Collecting static files..."
python manage.py collectstatic --noinput --settings=vices_db.settings.production

echo "🧹 Cleaning up..."
python manage.py clearsessions --settings=vices_db.settings.production

echo "✅ Production deployment completed!"
echo "🌐 To start the server, run:"
echo "gunicorn --bind 0.0.0.0:8000 vices_db.wsgi:application"
