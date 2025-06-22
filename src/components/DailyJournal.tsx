import React, { useState } from 'react';
import { Calendar, Save } from 'lucide-react';

interface JournalEntry {
  date: string;
  mood: number;
  substance: string;
  amount: string;
  effects: string;
  sleepQuality: number;
  sleep?: number;
  notes: string;
  tags: string[];
}

interface DailyJournalProps {
  journalEntries: JournalEntry[];
  onSaveEntry: (entryData: JournalEntry & { timestamp: string }) => Promise<void>;
}

const DailyJournal: React.FC<DailyJournalProps> = ({ journalEntries, onSaveEntry }) => {
  const [newEntry, setNewEntry] = useState({
    substance: '',
    amount: '',
    mood: 5,
    sleepQuality: 5,
    effects: '',
    notes: '',
    tags: [] as string[]
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveEntry = async () => {
    if (!newEntry.substance && !newEntry.notes) {
      alert('Please fill in at least substance or notes');
      return;
    }

    setIsSaving(true);
    
    const entryData = {
      ...newEntry,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString()
    };

    try {
      await onSaveEntry(entryData);
      
      // Reset form
      setNewEntry({
        substance: '',
        amount: '',
        mood: 5,
        sleepQuality: 5,
        effects: '',
        notes: '',
        tags: []
      });
    } catch (error) {
      console.error('Error saving entry:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addTag = (tag: string) => {
    if (tag && !newEntry.tags.includes(tag)) {
      setNewEntry(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewEntry(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const suggestedTags = [
    'relaxed', 'social', 'creative', 'focused', 'sleepy', 'energetic',
    'anxious', 'happy', 'calm', 'productive', 'weekend', 'evening'
  ];

  return (
    <div className="space-y-6">
      {/* Quick Entry Form */}
      <div className="bg-black/20 backdrop-blur-lg border border-green-400/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-green-100">
          <Calendar className="w-5 h-5 text-green-400" />
          <span>Today's Entry</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-green-100">Substance Used</label>
            <select 
              value={newEntry.substance}
              onChange={(e) => setNewEntry(prev => ({ ...prev, substance: e.target.value }))}
              className="w-full bg-[#1B272C]/60 border border-[#7CC379]/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#7CC379] focus:ring-1 focus:ring-[#7CC379]"
            >
              <option value="">Select...</option>
              <option value="cannabis">Cannabis</option>
              <option value="alcohol">Alcohol</option>
              <option value="both">Both</option>
              <option value="none">None</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-green-100">Amount/Dosage</label>
            <input 
              type="text" 
              value={newEntry.amount}
              onChange={(e) => setNewEntry(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="e.g., 5mg edible, 2 glasses wine"
              className="w-full bg-black/30 border border-green-400/30 rounded-lg px-3 py-2 text-white placeholder-green-200/50 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-green-100">Mood: {newEntry.mood}/10</label>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={newEntry.mood}
              onChange={(e) => setNewEntry(prev => ({ ...prev, mood: parseInt(e.target.value) }))}
              className="w-full h-2 bg-slate-700/50 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-green-200/60 mt-1">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-green-100">Sleep Quality: {newEntry.sleepQuality}/10</label>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={newEntry.sleepQuality}
              onChange={(e) => setNewEntry(prev => ({ ...prev, sleepQuality: parseInt(e.target.value) }))}
              className="w-full h-2 bg-slate-700/50 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-green-200/60 mt-1">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-green-100">Effects Experienced</label>
          <input 
            type="text" 
            value={newEntry.effects}
            onChange={(e) => setNewEntry(prev => ({ ...prev, effects: e.target.value }))}
            placeholder="e.g., Relaxed, creative, talkative"
            className="w-full bg-black/30 border border-green-400/30 rounded-lg px-3 py-2 text-white placeholder-green-200/50 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-green-100">Notes & Observations</label>
          <textarea 
            rows={3}
            value={newEntry.notes}
            onChange={(e) => setNewEntry(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="How did you feel? Any notable effects or observations?"
            className="w-full bg-black/30 border border-green-400/30 rounded-lg px-3 py-2 text-white placeholder-green-200/50 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 resize-none"
          />
        </div>

        {/* Tags */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-green-100">Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {newEntry.tags.map((tag, index) => (
              <span 
                key={index}
                onClick={() => removeTag(tag)}
                className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded-full cursor-pointer hover:bg-green-500/30 border border-green-400/30"
              >
                {tag} ×
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {suggestedTags.filter(tag => !newEntry.tags.includes(tag)).map((tag, index) => (
              <button
                key={index}
                onClick={() => addTag(tag)}
                className="bg-black/30 hover:bg-black/40 text-green-200 text-xs px-2 py-1 rounded-full transition-all border border-green-500/20 hover:border-green-400/40"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>
        
        <button 
          onClick={handleSaveEntry}
          disabled={isSaving}
          className="bg-gradient-to-r from-[#7CC379] to-[#7CC379]/80 hover:from-[#7CC379]/90 hover:to-[#7CC379]/70 disabled:opacity-50 px-6 py-2 rounded-lg font-semibold transition-all flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Entry'}</span>
        </button>
      </div>

      {/* Recent Entries */}
      <div className="bg-black/20 backdrop-blur-lg border border-green-400/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 text-green-100">Recent Entries</h3>
        <div className="space-y-4">
          {journalEntries.length === 0 ? (
            <div className="text-center py-8 text-green-200/60">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No journal entries yet</p>
              <p className="text-sm">Start by adding your first entry above</p>
            </div>
          ) : (
            journalEntries.map((entry, index) => (
              <div key={index} className="bg-black/30 rounded-lg p-4 border border-green-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">{entry.date}</span>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-green-200">Mood: {entry.mood}/10</span>
                    <span className="text-green-200">Sleep: {entry.sleepQuality || entry.sleep}/10</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                  <div>
                    <span className="text-green-100/70">Substance: </span>
                    <span className="text-white">{entry.substance || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-green-100/70">Amount: </span>
                    <span className="text-white">{entry.amount || 'Not specified'}</span>
                  </div>
                </div>
                
                {entry.effects && (
                  <div className="text-sm mb-2">
                    <span className="text-green-100/70">Effects: </span>
                    <span className="text-white">{entry.effects}</span>
                  </div>
                )}
                
                {entry.notes && (
                  <p className="text-green-100/70 text-sm mb-2">{entry.notes}</p>
                )}
                
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {entry.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded-full border border-green-400/30">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyJournal;