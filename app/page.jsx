'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SpeechToText from './components/SpeechToText';
import TextToSpeech from './components/TextToSpeech';
import LanguageSelector from './components/LanguageSelector';

// SVG Icons
const MicrophoneIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="8" y1="22" x2="16" y2="22"/>
  </svg>
);

const SpeakerIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
  </svg>
);

const SparklesIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2L14 8L20 10L14 12L12 18L10 12L4 10L10 8L12 2Z"/>
    <path d="M20 14L21 17L24 18L21 19L20 22L19 19L16 18L19 17L20 14Z"/>
  </svg>
);

export default function Home() {
  const [activeTab, setActiveTab] = useState('tts');

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center space-y-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full border border-indigo-200/50 dark:border-indigo-700/50"
          >
            <SparklesIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
              AI-Powered Speech Platform
            </span>
          </motion.div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Voice Intelligence
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
            Transform speech to text and text to speech with natural, human-like quality across multiple languages
          </p>
        </motion.div>

        {/* Language Selector */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex justify-center"
        >
          <LanguageSelector />
        </motion.div>

        {/* Tab Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex justify-center"
        >
          <div className="inline-flex glass rounded-2xl p-1.5 shadow-lg border border-gray-200/50 dark:border-slate-700/50">
            <button
              onClick={() => setActiveTab('tts')}
              className={`relative flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'tts'
                  ? 'text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {activeTab === 'tts' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <SpeakerIcon className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Text to Speech</span>
            </button>
            
            <button
              onClick={() => setActiveTab('stt')}
              className={`relative flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'stt'
                  ? 'text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {activeTab === 'stt' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <MicrophoneIcon className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Speech to Text</span>
            </button>
          </div>
        </motion.div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: activeTab === 'stt' ? 50 : -50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: activeTab === 'stt' ? -50 : 50, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            {activeTab === 'stt' ? <SpeechToText /> : <TextToSpeech />}
          </motion.div>
        </AnimatePresence>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3 pt-8"
        >
          {[
            { icon: '⚡', text: 'Lightning Fast' },
            { icon: '🌍', text: '4+ Languages' },
            { icon: '🎯', text: 'High Accuracy' },
            { icon: '🔒', text: 'Secure & Private' }
          ].map((feature, index) => (
            <motion.div
              key={feature.text}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + index * 0.1, type: "spring" }}
              className="flex items-center gap-2 px-4 py-2 glass rounded-full border border-gray-200/50 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all"
            >
              <span className="text-lg">{feature.icon}</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {feature.text}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}