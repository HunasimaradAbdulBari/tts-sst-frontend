'use client';

import { useEffect, useRef } from 'react';
import { useWhiteboard } from '../context/WhiteboardContext';
import toast from 'react-hot-toast';

// Global flag to prevent multiple instances
let globalRecognitionActive = false;
let globalRecognitionInstance = null;

// Voice commands for opening whiteboard
const OPEN_COMMANDS = {
  en: ['open whiteboard', 'show whiteboard', 'whiteboard open', 'start whiteboard'],
  hi: ['व्हाइटबोर्ड खोलो', 'व्हाइटबोर्ड दिखाओ'],
};

const CLOSE_COMMANDS = {
  en: ['close whiteboard', 'hide whiteboard', 'whiteboard close'],
  hi: ['व्हाइटबोर्ड बंद करो'],
};

export default function GlobalVoiceListener({ enabled = true, currentLanguage = 'en' }) {
  const { openWhiteboard, closeWhiteboard, isOpen } = useWhiteboard();
  const lastCommandTimeRef = useRef(0);
  const mountedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple instances
    if (globalRecognitionActive || mountedRef.current) {
      console.log('🎤 Voice listener already active, skipping...');
      return;
    }

    if (!enabled || typeof window === 'undefined') return;

    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('🎤 Speech Recognition not supported');
      return;
    }

    console.log('🎤 Initializing Global Voice Listener (SINGLETON)...');

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false; // Changed to false to reduce noise
    recognition.lang = getLanguageCode(currentLanguage);

    recognition.onstart = () => {
      console.log('✅ Global voice listener STARTED');
      globalRecognitionActive = true;
      mountedRef.current = true;
    };

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const transcript = event.results[i][0].transcript;
          const lowerTranscript = transcript.toLowerCase().trim();
          
          console.log('🎤 Heard:', transcript);
          checkCommand(lowerTranscript);
        }
      }
    };

    recognition.onerror = (event) => {
      // Only log non-aborted errors
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        console.error('🎤 Voice error:', event.error);
      }
    };

    recognition.onend = () => {
      console.log('🎤 Voice listener ended');
      
      // Only auto-restart if still mounted and not aborted
      if (mountedRef.current && globalRecognitionActive) {
        setTimeout(() => {
          if (mountedRef.current) {
            try {
              recognition.start();
              console.log('🎤 Voice listener restarted');
            } catch (e) {
              // Ignore restart errors
            }
          }
        }, 1000);
      }
    };

    const checkCommand = (text) => {
      const now = Date.now();
      
      // Debounce - prevent duplicate triggers
      if (now - lastCommandTimeRef.current < 3000) {
        return;
      }

      // Check open commands
      const openCommands = OPEN_COMMANDS[currentLanguage] || OPEN_COMMANDS.en;
      for (const cmd of openCommands) {
        if (text.includes(cmd.toLowerCase())) {
          console.log('✅ OPEN command detected:', cmd);
          lastCommandTimeRef.current = now;
          openWhiteboard();
          toast.success('Opening Whiteboard...', {
            icon: '🎤',
            duration: 2000,
          });
          return;
        }
      }

      // Check close commands
      if (isOpen) {
        const closeCommands = CLOSE_COMMANDS[currentLanguage] || CLOSE_COMMANDS.en;
        for (const cmd of closeCommands) {
          if (text.includes(cmd.toLowerCase())) {
            console.log('✅ CLOSE command detected:', cmd);
            lastCommandTimeRef.current = now;
            closeWhiteboard();
            toast.success('Closing Whiteboard...', {
              icon: '✓',
              duration: 2000,
            });
            return;
          }
        }
      }
    };

    globalRecognitionInstance = recognition;

    // Start listening
    try {
      recognition.start();
      console.log('✅ Global voice listener activated');
    } catch (error) {
      console.error('❌ Failed to start:', error.message);
    }

    // Cleanup function
    return () => {
      console.log('🎤 Cleaning up voice listener');
      mountedRef.current = false;
      globalRecognitionActive = false;
      
      if (globalRecognitionInstance) {
        try {
          globalRecognitionInstance.stop();
          globalRecognitionInstance = null;
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, []); // Empty deps - only run once

  return null;
}

// Helper function to get language code
function getLanguageCode(lang) {
  const codes = {
    en: 'en-US',
    hi: 'hi-IN',
    kn: 'kn-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    ml: 'ml-IN',
    mr: 'mr-IN',
    gu: 'gu-IN',
    bn: 'bn-IN',
    pa: 'pa-IN',
    ur: 'ur-PK',
  };
  return codes[lang] || 'en-US';
}