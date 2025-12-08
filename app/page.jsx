'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SpeechToText from './components/SpeechToText';
import TextToSpeech from './components/TextToSpeech';
import Header from './components/Header';
import { useWhiteboard } from './context/WhiteboardContext';
import toast from 'react-hot-toast';

// Global Voice Command Listener
function GlobalVoiceCommandListener() {
  const { openWhiteboard, closeWhiteboard, isOpen } = useWhiteboard();
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let lastCommandTime = 0;

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const transcript = event.results[i][0].transcript.toLowerCase().trim();
          const now = Date.now();
          
          // Debounce - prevent duplicate triggers within 2 seconds
          if (now - lastCommandTime < 2000) continue;
          
          // Check for "open whiteboard" command
          if (transcript.includes('open whiteboard') || 
              transcript.includes('show whiteboard') || 
              transcript.includes('whiteboard open')) {
            lastCommandTime = now;
            openWhiteboard();
            showFeedback('Whiteboard Opened', '✓');
          }
          
          // Check for "close whiteboard" command
          if (transcript.includes('close whiteboard') || 
              transcript.includes('hide whiteboard') || 
              transcript.includes('whiteboard close')) {
            lastCommandTime = now;
            closeWhiteboard();
            showFeedback('Whiteboard Closed', '✓');
          }
        }
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') return;
      console.error('Speech recognition error:', event.error);
      
      // Restart after error
      setTimeout(() => {
        try {
          recognition.start();
        } catch (e) {}
      }, 1000);
    };

    recognition.onend = () => {
      // Auto-restart continuous listening
      try {
        recognition.start();
      } catch (e) {}
    };

    // Start listening
    try {
      recognition.start();
      console.log('🎤 Global voice commands activated');
    } catch (error) {
      console.error('Failed to start voice commands:', error);
    }

    // Cleanup
    return () => {
      try {
        recognition.stop();
      } catch (e) {}
    };
  }, [openWhiteboard, closeWhiteboard]);

  return null;
}

function showFeedback(message, icon) {
  // Visual feedback
  const feedback = document.createElement('div');
  feedback.className = 'fixed top-20 left-1/2 -translate-x-1/2 z-[10000] bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-bounce-in';
  feedback.innerHTML = `
    <span class="text-2xl">${icon}</span>
    <span class="font-semibold">${message}</span>
  `;
  document.body.appendChild(feedback);
  
  // Audio feedback
  try {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiU2/LNfSYGKH3K8N+OOggYZrjq6p1QDAo9nN7yvmMdBjiS2/LNfScGKHzL8N2PPAcXZLfq6aFUIg0=');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  } catch (e) {}
  
  setTimeout(() => {
    feedback.style.opacity = '0';
    feedback.style.transform = 'translateX(-50%) translateY(-20px)';
    feedback.style.transition = 'all 0.3s ease-out';
    setTimeout(() => feedback.remove(), 300);
  }, 2000);
}

export default function Home() {
  const [activeMode, setActiveMode] = useState('tts');
  const { openWhiteboard } = useWhiteboard();

  return (
    <>
      {/* Global Voice Command Listener - Always Active */}
      <GlobalVoiceCommandListener />
      
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

      {/* Floating AI Whiteboard Button */}
      <motion.button
        onClick={openWhiteboard}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-2xl hover:shadow-indigo-500/50 transition-all flex items-center justify-center z-50 group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Open AI Whiteboard (or say 'open whiteboard')"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
      >
        <svg 
          width="28" 
          height="28" 
          viewBox="0 0 24 24" 
          fill="white"
          className="group-hover:scale-110 transition-transform"
        >
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="22"/>
          <line x1="8" y1="22" x2="16" y2="22"/>
        </svg>
        
        {/* Pulse animation */}
        <span className="absolute inset-0 rounded-full bg-indigo-600 animate-ping opacity-20"></span>
        
        {/* Tooltip */}
        <span className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          AI Whiteboard 🎤
        </span>
      </motion.button>

      {/* Voice Command Hint (shows on first visit) */}
      <VoiceCommandHint />
    </>
  );
}

// Voice command hint component
function VoiceCommandHint() {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    // Show hint only on first visit
    const hasSeenHint = localStorage.getItem('whiteboard-hint-seen');
    if (!hasSeenHint) {
      setTimeout(() => setShowHint(true), 2000);
      localStorage.setItem('whiteboard-hint-seen', 'true');
    }
  }, []);

  if (!showHint) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-28 right-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-2xl shadow-2xl max-w-xs z-50"
    >
      <button
        onClick={() => setShowHint(false)}
        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      
      <div className="flex items-start gap-3">
        <div className="text-3xl">💡</div>
        <div>
          <p className="font-bold text-sm mb-1">Voice Command Tip</p>
          <p className="text-xs opacity-90">
            Say <strong>"open whiteboard"</strong> to activate AI Whiteboard from anywhere!
          </p>
        </div>
      </div>
      
      <div className="absolute -bottom-2 right-8 w-4 h-4 bg-purple-600 transform rotate-45"></div>
    </motion.div>
  );
}