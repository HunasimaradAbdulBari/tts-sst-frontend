'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSpeakerWave } from 'react-icons/hi2';
import { FiTrash2 } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import { textToSpeech } from '../lib/apiClient';
import { validateText } from '../lib/validators';
import AudioPlayer from './AudioPlayer';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

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
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 backdrop-blur-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            🔊 Text to Speech
          </h2>
          {text && (
            <motion.button
              onClick={handleClear}
              className="p-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiTrash2 className="w-5 h-5" />
            </motion.button>
          )}
        </div>

        {/* Text Area */}
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Type your text in ${currentLanguage.name}...`}
            className="w-full h-48 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 outline-none resize-none text-gray-800 dark:text-gray-200 placeholder-gray-400"
            maxLength={5000}
          />
          <div className="absolute bottom-3 right-3 text-xs text-gray-500 dark:text-gray-400">
            {remainingChars} characters remaining
          </div>
        </div>

        {/* Generate Button */}
        <motion.button
          onClick={handleGenerate}
          disabled={isGenerating || !text.trim()}
          className="w-full mt-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          whileHover={{ scale: text.trim() ? 1.02 : 1 }}
          whileTap={{ scale: text.trim() ? 0.98 : 1 }}
        >
          {isGenerating ? (
            <LoadingSpinner type="pulse" size="sm" color="#ffffff" text="Generating..." />
          ) : (
            <>
              <HiSpeakerWave className="w-6 h-6" />
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