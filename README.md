# VICES - AI-Powered Wellness & Substance Use Tracking App

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Django](https://img.shields.io/badge/Django-4.2-green.svg)](https://www.djangoproject.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--3.5-orange.svg)](https://openai.com/)

## 🎯 Overview

**Vices** is a comprehensive wellness application designed to help users track, understand, and manage their substance use patterns through AI-powered insights and personalized goal setting. The app combines journaling, goal tracking, and artificial intelligence to provide users with actionable recommendations for improving their relationship with substances.

### ✨ Key Features

- 🤖 **AI-Powered Insights** - Personalized analysis and recommendations using OpenAI GPT-3.5
- 📊 **Substance Use Tracking** - Comprehensive journaling with mood and sleep quality logging
- 🎯 **Goal Setting & Challenges** - Pre-defined wellness challenges and custom goal creation
- 📈 **Progress Monitoring** - Visual tracking and trend analysis
- 🔐 **Secure & Private** - End-to-end encryption with 2FA authentication
- 📱 **Responsive Design** - Mobile-first approach with modern UI/UX

## 🚀 Live Demo

- **[Deployed on Vercel](https://vices-app.com)

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Context** for state management
- **Vite** for build tooling

### Backend
- **Django 4.2** with Django REST Framework
- **PostgreSQL** (production) / SQLite (development)
- **OpenAI API** integration
- **WhiteNoise** for static file serving
- **JWT Authentication**

### DevOps & Deployment
- **Docker** containerization
- **GitHub Actions** CI/CD
- **Vercel** (frontend)
- **Railway/Render** ready (backend)

## 🎯 Target Audience

- **Primary**: Adults (18+) seeking to understand their substance use patterns
- **Secondary**: Individuals in recovery or reducing consumption
- **Tertiary**: Healthcare providers and wellness coaches

## 📋 Current Features (June 2025)

### ✅ Implemented
- **User Authentication** - Registration, login, password reset with 2FA
- **Dashboard** - Wellness journey overview with key metrics
- **Daily Journal** - Substance tracking, mood/sleep logging
- **Goals & Challenges** - 7-Day T-Break, Dry January, custom goals
- **AI Insights** - Pattern recognition, trend analysis, recommendations
- **Data Export** - JSON format for user data portability
- **Profile Management** - User settings and preferences

### 🔄 In Development
- Mobile app (React Native)
- Advanced analytics dashboard
- Community features
- Payment processing (Stripe)
- Push notifications

## 🏗️ Architecture

```
vices-app/
├── src/                    # React frontend
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── contexts/          # React Context providers
│   ├── services/          # API services
│   └── types/             # TypeScript definitions
├── vices_db/              # Django backend
│   ├── users/             # User management
│   ├── tracking/          # Journal entries
│   ├── goals/             # Goals and challenges
│   └── products/          # AI insights
└── docker-compose.yml     # Development environment
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.9+
- PostgreSQL (for production)


4. **Visit the application**
   - vices-app.com

### Docker Setup (Alternative)

```bash
# Start the entire stack
docker-compose up --build

# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

## 📊 AI Capabilities

### Free Plan
- Weekly summary insights
- Basic pattern recognition
- Limited to last 5 journal entries
- Simple trend detection

### Premium Plan
- Advanced personalized analysis
- Unlimited journal data analysis
- Correlation analysis
- On-demand insights
- Multiple timeframe analysis
- Goal adherence tracking

## 🔐 Security Features

- **End-to-end encryption** for sensitive data
- **JWT authentication** with refresh tokens
- **2FA via email** for password changes
- **Input validation** and sanitization
- **CSRF protection**
- **SQL injection prevention**
- **XSS protection**

## 🗺️ Roadmap

### Phase 1 (Current - Q2 2025)
- ✅ Core functionality implementation
- ✅ AI insights integration
- ✅ Production deployment

### Phase 2 (Q3 2025)
- 📱 Mobile app development
- 🏥 Healthcare provider features
- 🔔 Push notifications
- 💳 Payment processing

### Phase 3 (Q4 2025)
- 👥 Community features
- 📈 Advanced analytics
- 🌍 International expansion
- 🤖 Enhanced AI capabilities


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support
- **Email**: support@vices-app.com

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for AI capabilities
- [React](https://reactjs.org/) and [Django](https://www.djangoproject.com/) communities
- All contributors and beta testers

---

**Vices** - Empowering informed decisions about substance use through data-driven insights and AI-powered recommendations.
=======
# Vices

<!-- Logo placeholder - Add your logo here -->
<div align="center">

![Your paragraph text](https://github.com/user-attachments/assets/2b2ae752-82d5-477c-a32b-ebb8cfde8641)

  
  <!-- Replace this comment with your logo image -->
  <!-- <img src="path/to/your/logo.png" alt="Vices Logo" width="200" height="200"> -->
</div>

**The smartest way to find dispensaries and liquor stores near you.**

Vices uses AI to help you discover the best deals and products at nearby dispensaries and liquor stores. No more guessing - get personalized recommendations that actually match what you want.

## What Makes Vices Different

🧬 **Smart Product Matching** - AI finds products that match your exact preferences and tolerance  
🎯 **Mood-Based Recommendations** - Tell us how you want to feel, we'll find the perfect product  
💡 **Tolerance Intelligence** - Tracks your usage to prevent tolerance buildup and optimize effects  
🛡️ **Safety First** - Checks for medication interactions and suggests safer alternatives  
👥 **Social Recommendations** - Perfect products for group hangouts and parties  
📅 **AI Party Planner** - Syncs with Google Calendar to plan your perfect party day for concerts, events, and nights out  
📍 **Best Local Deals** - AI-powered deal scoring across all nearby stores

## Features

- Find dispensaries and liquor stores near you
- Compare prices and deals instantly
- Get AI-powered product recommendations
- AI Party Planner that syncs with Google Calendar for events
- Read verified reviews and ratings
- Set deal alerts for your favorite products
- Navigate directly to stores

## Getting Started

1. Download the app
2. Allow location access
3. Set your preferences
4. Start discovering better deals and products

## For Developers

Built with Django REST Framework and Python. See our [API documentation](docs/api.md) for integration details.

```bash
# Quick setup
git clone https://github.com/yourusername/vices.git
cd vices
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Legal

This app is for users 21+ in areas where alcohol and cannabis are legal. Always follow local laws.

## Support

Questions? Email me at iheoma.richard@gmail.com

---

*Find what you want, when you want it.* 🍷🌿
