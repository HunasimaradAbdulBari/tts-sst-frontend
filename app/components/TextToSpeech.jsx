'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { textToSpeech } from '../lib/apiClient';
import { validateText } from '../lib/validators';
import AudioPlayer from './AudioPlayer';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

// SVG Icons
const SpeakerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

export default function TextToSpeech() {
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { currentLanguage } = useLanguage();

  const handleGenerate = async () => {
    const validation = validateText(text);
    if (!validation.valid) {
      toast.error(validation.errors[0]);
      return;
    }

    setIsGenerating(true);
    try {
      const result = await textToSpeech(text, currentLanguage.code);
      setAudioUrl(result.audio_url || result.audioUrl || result.url);
      toast.success('Audio generated successfully!');
    } catch (error) {
      console.error('TTS error:', error);
      toast.error(error.message || 'Failed to generate audio');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    setText('');
    setAudioUrl(null);
    toast.success('Cleared');
  };

  const remainingChars = 5000 - text.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="w-full max-w-3xl mx-auto space-y-6"
    >
      {/* Input Card */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Text to Speech
          </h2>
          {text && (
            <motion.button
              onClick={handleClear}
              className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Clear"
            >
              <TrashIcon />
            </motion.button>
          )}
        </div>

        {/* Text Area */}
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Enter your text in ${currentLanguage.name}...`}
            className="w-full h-48 p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none text-gray-800 dark:text-gray-200 placeholder-gray-400"
            maxLength={5000}
          />
          <div className="absolute bottom-3 right-3 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-900 px-2 py-1 rounded">
            {remainingChars} characters remaining
          </div>
        </div>

        {/* Generate Button */}
        <motion.button
          onClick={handleGenerate}
          disabled={isGenerating || !text.trim()}
          className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
          whileHover={{ scale: text.trim() ? 1.01 : 1 }}
          whileTap={{ scale: text.trim() ? 0.99 : 1 }}
        >
          {isGenerating ? (
            <LoadingSpinner type="pulse" size="sm" color="#ffffff" text="Generating..." />
          ) : (
            <>
              <SpeakerIcon />
              <span>Generate Speech</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Audio Player */}
      <AnimatePresence>
        {audioUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <AudioPlayer 
              audioUrl={audioUrl} 
              filename={`${currentLanguage.name}_speech.mp3`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}