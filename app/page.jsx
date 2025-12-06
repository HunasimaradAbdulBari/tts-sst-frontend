'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SpeechToText from './components/SpeechToText';
import TextToSpeech from './components/TextToSpeech';
import Header from './components/Header';
import { useWhiteboard } from './context/WhiteboardContext';

export default function Home() {
  const [activeMode, setActiveMode] = useState('tts');
// import { useWhiteboard } from './context/WhiteboardContext';
const { openWhiteboard } = useWhiteboard();
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
             <button
      onClick={openWhiteboard}
      className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-xl hover:scale-110 transition-transform flex items-center justify-center z-50"
      title="Open AI Whiteboard"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      </svg>
    </button>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}