'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { textToSpeech } from '../lib/apiClient';
import { validateText } from '../lib/validators';
import AudioPlayer from './AudioPlayer';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

const SpeakerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

const GlobeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

export default function TextToSpeech() {
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState(null);
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    const validation = validateText(text);
    if (!validation.valid) {
      toast.error(validation.errors[0]);
      return;
    }

    setIsGenerating(true);
    setAudioUrl(null);
    setDetectedLanguage(null);
    
    try {
      console.log('='.repeat(60));
      console.log('🔊 [TTS Component] Starting generation with AUTO-DETECTION...');
      console.log('Text:', text.substring(0, 50) + '...');
      console.log('='.repeat(60));
      
      const result = await textToSpeech(text); // NO language parameter
      
      console.log('✅ [TTS Component] Response received:');
      console.log(JSON.stringify(result, null, 2));
      
      // Extract audio URL and detected language
      let extractedAudioUrl = null;
      let extractedLanguage = null;
      
      const possiblePaths = [
        result?.data?.audio_url,
        result?.data?.audioUrl,
        result?.data?.url,
        result?.audio_url,
        result?.audioUrl,
        result?.url,
      ];
      
      for (const path of possiblePaths) {
        if (path && typeof path === 'string') {
          extractedAudioUrl = path;
          break;
        }
      }
      
      // Extract detected language info
      extractedLanguage = result?.data?.detected_language || 
                         result?.detected_language;
      
      console.log('🎵 Extracted URL:', extractedAudioUrl);
      console.log('🌐 Detected Language:', extractedLanguage);
      
      if (!extractedAudioUrl) {
        throw new Error('No audio URL received from server');
      }
      
      if (!extractedAudioUrl.startsWith('http')) {
        throw new Error('Invalid audio URL format');
      }
      
      setAudioUrl(extractedAudioUrl);
      setDetectedLanguage(extractedLanguage);
      
      toast.success(
        `🎵 Audio generated in ${extractedLanguage?.name || 'detected language'}!`,
        { duration: 3000 }
      );
      
    } catch (error) {
      console.error('❌ [TTS Component] Error:', error);
      toast.error(error.message || 'Failed to generate audio');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    setText('');
    setAudioUrl(null);
    setDetectedLanguage(null);
    toast.success('🗑️ Cleared', { duration: 2000 });
  };

  const remainingChars = 5000 - text.length;
  const charPercentage = (text.length / 5000) * 100;

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Input Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-200/50 dark:border-slate-700/50"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              Enter Your Text
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Type in any language - we'll detect it automatically
            </p>
          </div>
          <AnimatePresence>
            {text && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleClear}
                className="p-2.5 bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 text-red-600 dark:text-red-400 rounded-xl hover:shadow-lg transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Clear"
              >
                <TrashIcon />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Text Area */}
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text in any Indian language..."
            className="w-full h-48 p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl border-2 border-gray-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20 outline-none resize-none text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300 text-lg font-light leading-relaxed"
            maxLength={5000}
          />
          
          {/* Character Count */}
          <div className="absolute bottom-4 right-4">
            <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
              <div className="relative w-8 h-8">
                <svg className="transform -rotate-90 w-8 h-8">
                  <circle
                    cx="16"
                    cy="16"
                    r="14"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    className="text-gray-200 dark:text-slate-700"
                  />
                  <circle
                    cx="16"
                    cy="16"
                    r="14"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 14}`}
                    strokeDashoffset={`${2 * Math.PI * 14 * (1 - charPercentage / 100)}`}
                    className={`transition-all duration-300 ${
                      charPercentage > 90 ? 'text-red-500' : charPercentage > 70 ? 'text-yellow-500' : 'text-indigo-500'
                    }`}
                  />
                </svg>
              </div>
              <span className={`text-xs font-semibold ${
                charPercentage > 90 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
              }`}>
                {remainingChars}
              </span>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <motion.button
          onClick={handleGenerate}
          disabled={isGenerating || !text.trim()}
          className="w-full mt-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
          whileHover={{ scale: text.trim() ? 1.01 : 1 }}
          whileTap={{ scale: text.trim() ? 0.99 : 1 }}
        >
          {isGenerating ? (
            <>
              <LoadingSpinner type="pulse" size="sm" color="#ffffff" />
              <span>Detecting language & generating...</span>
            </>
          ) : (
            <>
              <SpeakerIcon />
              <span>Generate Speech (Auto-Detect Language)</span>
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Detected Language Badge */}
      <AnimatePresence>
        {detectedLanguage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 flex justify-center"
          >
            <div className="inline-flex items-center gap-3 px-5 py-3 glass rounded-2xl shadow-lg border border-emerald-200/50 dark:border-emerald-700/50">
              <GlobeIcon />
              <div className="text-left">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Detected Language
                </p>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {detectedLanguage.name} ({detectedLanguage.native_name})
                </p>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  {(detectedLanguage.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio Player */}
      <AnimatePresence mode="wait">
        {audioUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mt-6"
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