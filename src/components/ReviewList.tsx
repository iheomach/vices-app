// components/ReviewList.tsx
import React from 'react';

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

interface ReviewListProps {
  reviews: Review[];
  sortBy: 'newest' | 'highest' | 'lowest' | 'helpful';
  onSortChange: (sort: 'newest' | 'highest' | 'lowest' | 'helpful') => void;
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews, sortBy, onSortChange }) => {
  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-xl'
    };
    
    return (
      <div className={`flex items-center ${sizeClasses[size]}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= rating ? 'text-yellow-400' : 'text-gray-600'}
          >
            ⭐
          </span>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Customer Reviews</h3>
        <select 
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as any)}
          className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm"
        >
          <option value="newest">Newest First</option>
          <option value="highest">Highest Rated</option>
          <option value="lowest">Lowest Rated</option>
          <option value="helpful">Most Helpful</option>
        </select>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-slate-700/30 rounded-xl p-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-medium">{review.user_name}</span>
                  {review.verified_purchase && (
                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">
                      ✓ Verified Purchase
                    </span>
                  )}
                  {review.ai_analysis && (
                    <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">
                      🤖 AI Verified
                    </span>
                  )}
                </div>
                {renderStars(review.rating, 'sm')}
              </div>
              <span className="text-slate-400 text-sm">{review.date}</span>
            </div>

            {/* AI Analysis Badge */}
            {review.ai_analysis && (
              <div className="mb-3 p-3 bg-blue-900/20 border border-blue-500/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-400 font-medium">AI Analysis:</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      review.ai_analysis.sentiment === 'positive' ? 'bg-green-500/20 text-green-400' :
                      review.ai_analysis.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {review.ai_analysis.sentiment.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {review.ai_analysis.confidence}% confidence
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {review.ai_analysis.key_themes.map((theme, index) => (
                    <span key={index} className="text-xs bg-slate-600/50 text-slate-300 px-2 py-1 rounded">
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <p className="text-slate-300 mb-3">{review.comment}</p>

            {/* Photo Gallery */}
            {review.photos && review.photos.length > 0 && (
              <div className="mb-3">
                <div className="flex gap-2 overflow-x-auto">
                  {review.photos.map((photo, index) => (
                    <img 
                      key={index}
                      src={photo} 
                      alt={`Review photo ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Effects Experienced */}
            {review.effects_experienced && (
              <div className="mb-3">
                <div className="text-sm text-slate-400 mb-2">Effects experienced:</div>
                <div className="flex flex-wrap gap-2">
                  {review.effects_experienced.map((effect) => (
                    <span 
                      key={effect}
                      className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs"
                    >
                      {effect}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <button className="hover:text-green-400 transition-colors">
                👍 Helpful ({review.helpful_count})
              </button>
              <button className="hover:text-red-400 transition-colors">
                Report
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ReviewList;