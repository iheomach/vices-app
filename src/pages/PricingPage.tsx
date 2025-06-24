import React from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';

const PricingPage: React.FC = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        'Basic journal tracking (5 entries/month)',
        'Simple mood & sleep logging',
        'Basic dashboard overview',
        'One active goal at a time',
        'Weekly AI insights',
        'Community access'
      ],
      cta: 'Start Free',
      ctaAction: () => navigate('/usersignup')
    },
    {
      name: 'Premium',
      price: '$9.99',
      period: 'per month',
      description: 'For optimized wellness',
      features: [
        'Unlimited journal entries',
        'Advanced tracking & analytics',
        'Multiple goals & challenges',
        'Detailed AI insights & recommendations',
        'Data export (CSV/PDF)',
        'Priority support',
        'Ad-free experience'
      ],
      highlighted: true,
      cta: 'Begin Wellness Journey',
      ctaAction: () => navigate('/usersignup')
    }
  ];

  return (
    <div className="min-h-screen bg-[#1B272C] text-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#7CC379]">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Choose the plan that best fits your journey. All plans include our core features with additional perks as you grow.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white/5 backdrop-blur-lg rounded-xl p-8 border transition-all duration-300 hover:transform hover:-translate-y-2 ${
                plan.highlighted
                  ? 'border-[#7CC379] shadow-lg shadow-[#7CC379]/20'
                  : 'border-white/10'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#7CC379] text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2 text-[#7CC379]">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-400">/{plan.period}</span>
                </div>
                <p className="text-gray-400">{plan.description}</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-300">
                    <span className="text-[#7CC379] mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button
                onClick={plan.ctaAction}
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                  plan.highlighted
                    ? 'bg-gradient-to-r from-[#7CC379] to-[#66A363] text-white hover:shadow-lg hover:shadow-[#7CC379]/25'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
        

      </main>
    </div>
  );
};

export default PricingPage;
