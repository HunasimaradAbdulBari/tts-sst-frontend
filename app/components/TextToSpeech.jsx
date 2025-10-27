'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
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
    setAudioUrl(null);
    
    try {
      console.log('='.repeat(60));
      console.log('🔊 [TTS Component] Starting generation...');
      console.log('Text:', text.substring(0, 50) + '...');
      console.log('Language:', currentLanguage.code);
      console.log('='.repeat(60));
      
      const result = await textToSpeech(text, currentLanguage.code);
      
      console.log('✅ [TTS Component] Raw result received:');
      console.log(JSON.stringify(result, null, 2));
      
      // CRITICAL: Extract audio URL from ANY possible structure
      let extractedAudioUrl = null;
      
      // Try all possible paths
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
          console.log('✅ [TTS Component] Found audio URL at path');
          break;
        }
      }
      
      console.log('🎵 [TTS Component] Final extracted URL:', extractedAudioUrl);
      
      if (!extractedAudioUrl) {
        console.error('❌ [TTS Component] No audio URL found in response');
        console.error('Full response structure:', result);
        throw new Error('No audio URL received from server. Check backend logs.');
      }
      
      // Verify URL is valid
      if (!extractedAudioUrl.startsWith('http')) {
        console.error('❌ [TTS Component] Invalid URL format:', extractedAudioUrl);
        throw new Error('Invalid audio URL format');
      }
      
      console.log('✅ [TTS Component] Setting audio URL:', extractedAudioUrl);
      setAudioUrl(extractedAudioUrl);
      
      toast.success('🎵 Audio generated successfully!', { duration: 2000 });
      
      // Verify audio is accessible
      console.log('🔍 [TTS Component] Verifying audio accessibility...');
      fetch(extractedAudioUrl, { method: 'HEAD' })
        .then(response => {
          if (response.ok) {
            console.log('✅ [TTS Component] Audio file is accessible');
          } else {
            console.error('❌ [TTS Component] Audio file not accessible:', response.status);
            toast.error('Audio file may not be accessible');
          }
        })
        .catch(err => {
          console.error('❌ [TTS Component] Error checking audio:', err);
        });
      
    } catch (error) {
      console.error('='.repeat(60));
      console.error('❌ [TTS Component] ERROR OCCURRED');
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      
      console.error('='.repeat(60));
      
      toast.error(error.message || 'Failed to generate audio');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    setText('');
    setAudioUrl(null);
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
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            Enter Your Text
          </h2>
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
            placeholder={`Type or paste your text in ${currentLanguage.name}...`}
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
              <span>Generating audio...</span>
            </>
          ) : (
            <>
              <SpeakerIcon />
              <span>Generate Speech</span>
            </>
          )}
        </motion.button>
      </motion.div>

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
              filename={`${currentLanguage.name}_speech.mp3`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}