'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import SpeechToText from './components/SpeechToText';
import TextToSpeech from './components/TextToSpeech';
import LanguageSelector from './components/LanguageSelector';

export default function Home() {
  const [activeTab, setActiveTab] = useState('stt'); // 'stt' or 'tts'

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Multilingual Speech AI
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Transform your voice to text and text to speech in multiple languages with AI-powered precision
        </p>
      </motion.div>

      {/* Language Selector */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="flex justify-center"
      >
        <LanguageSelector />
      </motion.div>

      {/* Tab Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center"
      >
        <div className="inline-flex bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-lg">
          <button
            onClick={() => setActiveTab('stt')}
            className={`px-8 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'stt'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            🎙️ Speech to Text
          </button>
          <button
            onClick={() => setActiveTab('tts')}
            className={`px-8 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'tts'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            🔊 Text to Speech
          </button>
        </div>
      </motion.div>

      {/* Content Area */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: activeTab === 'stt' ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: activeTab === 'stt' ? 20 : -20 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'stt' ? <SpeechToText /> : <TextToSpeech />}
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
      >
        <FeatureCard
          icon="⚡"
          title="Fast & Accurate"
          description="Powered by Whisper AI and Edge-TTS for precise transcription and natural speech"
        />
        <FeatureCard
          icon="🌍"
          title="Multilingual"
          description="Support for English, Hindi, Kannada, and Urdu with native voice synthesis"
        />
        <FeatureCard
          icon="🎨"
          title="Beautiful UI"
          description="Modern, responsive design with smooth animations and dark mode support"
        />
      </motion.div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl backdrop-blur-lg"
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm">
        {description}
      </p>
    </motion.div>
  );
}