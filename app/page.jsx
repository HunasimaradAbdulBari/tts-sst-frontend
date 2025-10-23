'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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

const LightningIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const GlobeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const LayoutIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <line x1="3" y1="9" x2="21" y2="9"/>
    <line x1="9" y1="21" x2="9" y2="9"/>
  </svg>
);

export default function Home() {
  const [activeTab, setActiveTab] = useState('stt');

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white">
          Multilingual Speech AI
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Professional voice recognition and speech synthesis platform supporting multiple languages
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
        <div className="inline-flex bg-white dark:bg-slate-800 rounded-lg p-1.5 shadow-sm border border-gray-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('stt')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-md font-medium transition-all ${
              activeTab === 'stt'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            <MicrophoneIcon className="w-5 h-5" />
            Speech to Text
          </button>
          <button
            onClick={() => setActiveTab('tts')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-md font-medium transition-all ${
              activeTab === 'tts'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            <SpeakerIcon className="w-5 h-5" />
            Text to Speech
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
          icon={<LightningIcon className="w-8 h-8" />}
          title="Fast & Accurate"
          description="Powered by Whisper AI and Edge-TTS for precise transcription and natural speech synthesis"
        />
        <FeatureCard
          icon={<GlobeIcon className="w-8 h-8" />}
          title="Multilingual Support"
          description="Full support for English, Hindi, Kannada, and Urdu with native voice models"
        />
        <FeatureCard
          icon={<LayoutIcon className="w-8 h-8" />}
          title="Professional Interface"
          description="Clean, modern design with responsive layout and comprehensive accessibility features"
        />
      </motion.div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all"
    >
      <div className="text-blue-600 dark:text-blue-400 mb-3">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}