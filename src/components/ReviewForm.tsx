// components/ReviewForm.tsx
import React, { useState } from 'react';

interface ReviewFormData {
  rating: number;
  comment: string;
  effects: string[];
  photos: string[];
}

interface EffectsTracking {
  onset_time: string;
  duration: string;
  intensity: number;
  notes: string;
}

interface ReviewFormProps {
  isAuthenticated: boolean;
  onSubmit: (review: ReviewFormData, tracking: EffectsTracking) => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ isAuthenticated, onSubmit }) => {
  const [newReview, setNewReview] = useState<ReviewFormData>({ 
    rating: 5, 
    comment: '', 
    effects: [],
    photos: []
  });
  
  const [effectsTracking, setEffectsTracking] = useState<EffectsTracking>({
    onset_time: '',
    duration: '',
    intensity: 5,
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const effectOptions = ['Relaxed', 'Happy', 'Euphoric', 'Sleepy', 'Creative', 'Focused', 'Pain Relief', 'Anxiety Relief'];

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      alert('Please log in to submit a review');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(newReview, effectsTracking);
      setNewReview({ rating: 5, comment: '', effects: [], photos: [] });
      setEffectsTracking({ onset_time: '', duration: '', intensity: 5, notes: '' });
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // In real app, upload to cloud storage and get URLs
      const newPhotos = Array.from(files).map(() => '/api/placeholder/200/200');
      setNewReview({...newReview, photos: [...newReview.photos, ...newPhotos]});
    }
  };

  const removePhoto = (index: number) => {
    const updatedPhotos = newReview.photos.filter((_, i) => i !== index);
    setNewReview({...newReview, photos: updatedPhotos});
  };

  if (!isAuthenticated) return null;

  return (
    <div className="bg-[#1B272C] rounded-lg p-6 mb-6 border border-[#7CC379]/10">
      <h4 className="text-lg font-semibold text-[#7CC379] mb-4">Write a Review</h4>
      
      {/* Rating */}
      <div className="mb-4">
        <label className="block text-gray-300 mb-2">Rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setNewReview({...newReview, rating: value})}
              className={`text-2xl ${
                value <= newReview.rating ? 'text-[#7CC379]' : 'text-gray-500'
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      {/* Photo Upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Upload Photos</label>
        <div className="border-2 border-dashed border-slate-600 rounded-lg p-4 text-center">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
            id="photo-upload"
          />
          <label 
            htmlFor="photo-upload" 
            className="cursor-pointer text-green-400 hover:text-green-300"
          >
            📷 Click to upload photos
          </label>
          <p className="text-xs text-slate-400 mt-1">JPG, PNG up to 5MB each</p>
        </div>
        
        {/* Photo Preview */}
        {newReview.photos.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {newReview.photos.map((photo, index) => (
              <div key={index} className="relative">
                <img 
                  src={photo} 
                  alt={`Upload ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Effects Experienced */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Effects Experienced</label>
        <div className="flex flex-wrap gap-2">
          {effectOptions.map((effect) => (
            <button
              key={effect}
              onClick={() => {
                const newEffects = newReview.effects.includes(effect)
                  ? newReview.effects.filter(e => e !== effect)
                  : [...newReview.effects, effect];
                setNewReview({...newReview, effects: newEffects});
              }}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                newReview.effects.includes(effect)
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
              }`}
            >
              {effect}
            </button>
          ))}
        </div>
      </div>

      {/* Effects Tracking */}
      <div className="mb-4 bg-slate-600/30 rounded-lg p-4">
        <h5 className="text-sm font-semibold mb-3 text-green-400">📊 Effects Tracking (Optional)</h5>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Onset Time</label>
            <select 
              value={effectsTracking.onset_time}
              onChange={(e) => setEffectsTracking({...effectsTracking, onset_time: e.target.value})}
              className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm"
            >
              <option value="">Select...</option>
              <option value="immediate">Immediate</option>
              <option value="5-15min">5-15 minutes</option>
              <option value="15-30min">15-30 minutes</option>
              <option value="30min+">30+ minutes</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Duration</label>
            <select 
              value={effectsTracking.duration}
              onChange={(e) => setEffectsTracking({...effectsTracking, duration: e.target.value})}
              className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm"
            >
              <option value="">Select...</option>
              <option value="1-2hrs">1-2 hours</option>
              <option value="2-4hrs">2-4 hours</option>
              <option value="4-6hrs">4-6 hours</option>
              <option value="6hrs+">6+ hours</option>
            </select>
          </div>
        </div>
        <div className="mt-3">
          <label className="block text-xs text-slate-400 mb-1">Intensity (1-10)</label>
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={effectsTracking.intensity}
            onChange={(e) => setEffectsTracking({...effectsTracking, intensity: parseInt(e.target.value)})}
            className="w-full"
          />
          <div className="text-center text-sm text-green-400">{effectsTracking.intensity}/10</div>
        </div>
      </div>
      
      {/* Review Text */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Your Review</label>
        <textarea
          value={newReview.comment}
          onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
          placeholder="Share your experience with this product..."
          rows={4}
          className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white placeholder-slate-400 resize-none"
        />
      </div>
      
      <button 
        onClick={handleSubmitReview}
        disabled={isSubmitting}
        className={`w-full bg-gradient-to-r from-[#7CC379] to-[#66A363] text-white font-medium py-2 px-4 rounded-lg 
          hover:shadow-lg hover:shadow-[#7CC379]/25 transition-all duration-300 transform hover:-translate-y-0.5
          ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </div>
  );
};

export default ReviewForm;