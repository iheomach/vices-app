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
  onSortChange: (sortBy: 'newest' | 'highest' | 'lowest' | 'helpful') => void;
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews, sortBy, onSortChange }) => {
  if (reviews.length === 0) {
    return (
      <div className="bg-[#1B272C] rounded-lg p-6 mt-4">
        <p className="text-gray-300 text-center">No reviews yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-[#7CC379]">Customer Reviews</h3>
        <select 
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as any)}
          className="bg-[#1B272C] border border-[#7CC379]/20 rounded-lg px-3 py-2 text-sm text-gray-300"
        >
          <option value="newest">Newest First</option>
          <option value="highest">Highest Rated</option>
          <option value="lowest">Lowest Rated</option>
          <option value="helpful">Most Helpful</option>
        </select>
      </div>

      {reviews.map((review) => (
        <div 
          key={review.id}
          className="bg-[#1B272C] rounded-lg p-6 border border-[#7CC379]/10"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-[#7CC379] flex items-center justify-center text-[#1B272C] font-bold">
                  {review.user_name.charAt(0).toUpperCase()}
                </div>
                <span className="text-[#7CC379] font-medium">{review.user_name}</span>
                {review.verified_purchase && (
                  <span className="text-xs bg-[#7CC379]/20 text-[#7CC379] px-2 py-1 rounded-full">
                    Verified Purchase
                  </span>
                )}
              </div>
              <div className="flex items-center">
                <span className="text-[#7CC379] mr-1">★</span>
                <span className="text-gray-300">{review.rating.toFixed(1)}</span>
              </div>
            </div>
            <span className="text-gray-400 text-sm">{review.date}</span>
          </div>

          {review.ai_analysis && (
            <div className="mb-3 p-3 bg-[#1B272C]/60 border border-[#7CC379]/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[#7CC379]">🤖</span>
                  <span className="text-sm text-[#7CC379]">AI Analysis</span>
                </div>
                <span className="text-xs text-gray-400">
                  {review.ai_analysis.confidence}% confidence
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {review.ai_analysis.key_themes.map((theme, index) => (
                  <span 
                    key={index}
                    className="text-xs bg-[#7CC379]/20 text-[#7CC379] px-2 py-1 rounded-full"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="text-gray-300 mb-4">{review.comment}</p>

          {review.photos && review.photos.length > 0 && (
            <div className="mb-4">
              <div className="flex gap-2 overflow-x-auto">
                {review.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Review photo ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {review.effects_experienced && review.effects_experienced.length > 0 && (
            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-2">Effects experienced:</div>
              <div className="flex flex-wrap gap-2">
                {review.effects_experienced.map((effect, index) => (
                  <span
                    key={index}
                    className="text-xs bg-[#7CC379]/20 text-[#7CC379] px-2 py-1 rounded-full"
                  >
                    {effect}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-400">
            <button className="hover:text-[#7CC379] transition-colors flex items-center gap-1">
              <span>👍</span> Helpful ({review.helpful_count})
            </button>
            <button className="hover:text-red-400 transition-colors">
              Report
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;