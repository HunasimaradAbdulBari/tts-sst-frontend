'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { textToSpeech } from '../lib/apiClient';
import AudioPlayer from './AudioPlayer';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

export default function TextToSpeech() {
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState(null);
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!text || text.trim().length === 0) {
      toast.error('Please enter text');
      return;
    }

    setIsGenerating(true);
    setAudioUrl(null);
    setDetectedLanguage(null);
    
    try {
      const result = await textToSpeech(text);
      
      const extractedAudioUrl = result?.data?.audio_url || 
                               result?.audio_url ||
                               result?.data?.audioUrl;
      
      const extractedLanguage = result?.data?.detected_language || 
                               result?.detected_language;
      
      if (!extractedAudioUrl) {
        throw new Error('No audio URL received');
      }
      
      setAudioUrl(extractedAudioUrl);
      setDetectedLanguage(extractedLanguage);
      
      toast.success(`Generated in ${extractedLanguage?.name || 'detected language'}`);
      
    } catch (error) {
      console.error('TTS Error:', error);
      toast.error(error.message || 'Failed to generate audio');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    setText('');
    setAudioUrl(null);
    setDetectedLanguage(null);
  };

  return (
    <div className="w-full space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Enter Text
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Auto language detection enabled
            </p>
          </div>
          {text && (
            <button
              onClick={handleClear}
              className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your text here..."
            className="w-full h-48 p-6 bg-gray-50 dark:bg-slate-900 rounded-xl border-2 border-gray-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20 outline-none resize-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all text-base leading-relaxed"
          />
          
          <div className="absolute bottom-4 right-4 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
              {text.length.toLocaleString()} chars
            </span>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !text.trim()}
          className="w-full mt-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
        >
          {isGenerating ? (
            <>
              <LoadingSpinner type="pulse" size="sm" color="#ffffff" />
              <span>Generating...</span>
            </>
          ) : (
            <span>Generate Speech</span>
          )}
        </button>
      </motion.div>

      <AnimatePresence>
        {detectedLanguage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex justify-center"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-emerald-200 dark:border-emerald-700">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Detected Language
                </p>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {detectedLanguage.name}
                </p>
              </div>
              <div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  {(detectedLanguage.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {audioUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex justify-center"
          >
            <AudioPlayer 
              audioUrl={audioUrl} 
              filename={`${detectedLanguage?.code || 'audio'}_speech.mp3`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}