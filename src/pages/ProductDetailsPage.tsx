// pages/ProductDetailsPage.tsx
import React, { useState } from 'react';
import ProductHeader from '../components/ProductHeader';
import AIReviewAnalysis from '../components/AIReviewAnalysis';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';

interface Product {
  id: string;
  name: string;
  brand: string;
  category: 'cannabis' | 'alcohol';
  type: string;
  thc_content?: number;
  cbd_content?: number;
  price: number;
  image: string;
  description: string;
  effects: string[];
  terpenes?: string[];
  strain_type?: 'indica' | 'sativa' | 'hybrid';
  rating: number;
  review_count: number;
  lab_tested: boolean;
  organic: boolean;
  in_stock: boolean;
}

interface Review {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  date: string;
  verified_purchase: boolean;
  helpful_count: number;
  effects_experienced?: string[];
  photos?: string[];
  ai_analysis?: {
    sentiment: 'positive' | 'neutral' | 'negative';
    confidence: number;
    key_themes: string[];
    authenticity_score: number;
  };
}

interface Vendor {
  id: string;
  name: string;
  distance: string;
  price: number;
  in_stock: boolean;
  rating: number;
  address: string;
}

const ProductDetailsPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'details' | 'reviews' | 'vendors'>('details');
  const [sortReviews, setSortReviews] = useState<'newest' | 'highest' | 'lowest' | 'helpful'>('newest');
  const [isAuthenticated] = useState(true);

  // Mock data
  const product: Product = {
    id: '1',
    name: 'Lavender Kush',
    brand: 'Green Leaf Premium',
    category: 'cannabis',
    type: 'Flower',
    thc_content: 22.5,
    cbd_content: 0.8,
    price: 28.99,
    image: '/api/placeholder/400/400',
    description: 'A premium indica-dominant strain known for its relaxing effects and beautiful purple hues. Perfect for evening use and stress relief. Grown organically in controlled environments.',
    effects: ['Relaxed', 'Sleepy', 'Happy', 'Euphoric'],
    terpenes: ['Myrcene', 'Linalool', 'Caryophyllene'],
    strain_type: 'indica',
    rating: 4.8,
    review_count: 127,
    lab_tested: true,
    organic: true,
    in_stock: true
  };

  const reviews: Review[] = [
    {
      id: '1',
      user_name: 'Sarah M.',
      rating: 5,
      comment: 'Absolutely love this strain! Perfect for winding down after a long day.',
      date: '2025-06-15',
      verified_purchase: true,
      helpful_count: 12,
      effects_experienced: ['Relaxed', 'Happy', 'Sleepy'],
      photos: ['/api/placeholder/200/200'],
      ai_analysis: {
        sentiment: 'positive',
        confidence: 94,
        key_themes: ['relaxation', 'quality'],
        authenticity_score: 96
      }
    }
  ];

  const vendors: Vendor[] = [
    {
      id: '1',
      name: 'Green Leaf Dispensary',
      distance: '0.3 mi',
      price: 28.99,
      in_stock: true,
      rating: 4.8,
      address: '123 Main St, Calgary AB'
    }
  ];

  const handleReviewSubmit = (review: any, tracking: any) => {
    console.log('New review:', review);
    console.log('Effects tracking:', tracking);
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rating ? 'text-yellow-400' : 'text-gray-600'}>⭐</span>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1B272C] text-slate-50">
      {/* Header */}
      <header className="bg-[#1B272C]/95 backdrop-blur-md border-b border-[#7CC379]/20 sticky top-0 z-50">
        <nav className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-[#7CC379] flex items-center gap-2">
            🌿 VICES
          </div>
          <button className="bg-gradient-to-r from-[#7CC379] to-[#7CC379]/80 px-4 py-2 rounded-full text-white font-medium">
            Profile
          </button>
        </nav>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <ProductHeader product={product} />

        {/* Tabs */}
        <div className="bg-[#1B272C]/80 rounded-2xl border border-[#7CC379]/20 overflow-hidden">
          <div className="flex border-b border-slate-700">
            {[
              { id: 'details', label: 'Details' },
              { id: 'reviews', label: `Reviews (${product.review_count})` },
              { id: 'vendors', label: 'Where to Buy' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`px-6 py-4 font-medium transition-colors ${
                  selectedTab === tab.id
                    ? 'text-[#7CC379] border-b-2 border-[#7CC379]'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {selectedTab === 'details' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Product Description</h3>
                <p className="text-slate-300 leading-relaxed mb-6">{product.description}</p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-green-400">Lab Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Lab Tested:</span>
                        <span className="text-green-400">✓ Yes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'reviews' && (
              <div>
                <AIReviewAnalysis reviewCount={product.review_count} />
                <ReviewForm 
                  isAuthenticated={isAuthenticated} 
                  onSubmit={handleReviewSubmit} 
                />
                <ReviewList 
                  reviews={reviews}
                  sortBy={sortReviews}
                  onSortChange={setSortReviews}
                />
              </div>
            )}

            {selectedTab === 'vendors' && (
              <div>
                <h3 className="text-xl font-semibold mb-6">Available at These Locations</h3>
                <div className="space-y-4">
                  {vendors.map((vendor) => (
                    <div key={vendor.id} className="bg-slate-700/30 rounded-xl p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold">{vendor.name}</h4>
                            <span className="text-green-400 text-sm">{vendor.distance}</span>
                            {renderStars(vendor.rating)}
                          </div>
                          <p className="text-slate-400 text-sm mb-3">{vendor.address}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-400 mb-2">${vendor.price}</div>
                          <button className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-2 rounded-lg font-medium">
                            Visit Store
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;