'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SpeechToText from './components/SpeechToText';
import TextToSpeech from './components/TextToSpeech';
import Header from './components/Header';

export default function Home() {
  const [activeMode, setActiveMode] = useState('tts');

  return (
    <>
      <Header activeMode={activeMode} onModeChange={setActiveMode} />
      
      <div className="min-h-screen pt-24 pb-12 px-4 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeMode === 'tts' ? <TextToSpeech /> : <SpeechToText />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}