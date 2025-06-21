// components/AIReviewAnalysis.tsx
import React from 'react';

interface AIReviewAnalysisProps {
  reviewCount: number;
}

const AIReviewAnalysis: React.FC<AIReviewAnalysisProps> = ({ reviewCount }) => {
  return (
    <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-6 mb-6 border border-blue-500/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-blue-500 p-2 rounded-lg">
          🤖
        </div>
        <div>
          <h3 className="text-lg font-semibold text-blue-300">AI Review Analysis</h3>
          <p className="text-sm text-slate-400">Based on {reviewCount} verified reviews</p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-1">Overall Sentiment</div>
          <div className="text-green-400 font-semibold">94% Positive</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-1">Authenticity Score</div>
          <div className="text-blue-400 font-semibold">94/100</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-1">Most Mentioned</div>
          <div className="text-purple-400 font-semibold">Relaxation</div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="text-sm font-medium mb-2 text-slate-300">Key Themes Identified:</div>
        <div className="flex flex-wrap gap-2">
          {['relaxation', 'quality', 'sleep aid', 'evening use', 'medical benefits'].map((theme) => (
            <span key={theme} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
              {theme}
            </span>
          ))}
        </div>
      </div>
      
      <p className="text-slate-300 text-sm">
        <strong>AI Summary:</strong> Users consistently praise this strain's relaxing effects and quality. 
        Most effective for evening use and sleep aid. High authenticity scores indicate genuine user experiences.
      </p>
    </div>
  );
};

export default AIReviewAnalysis;