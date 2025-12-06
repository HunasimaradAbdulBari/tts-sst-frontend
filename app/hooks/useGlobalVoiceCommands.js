'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useWhiteboard } from '../context/WhiteboardContext';

// Voice commands in 13 languages
const WHITEBOARD_COMMANDS = {
  open: {
    en: ['open whiteboard', 'show whiteboard', 'whiteboard open'],
    hi: ['व्हाइटबोर्ड खोलो', 'व्हाइटबोर्ड दिखाओ'],
    kn: ['ವೈಟ್‌ಬೋರ್ಡ್ ತೆರೆ', 'ವೈಟ್‌ಬೋರ್ಡ್ ತೋರಿಸು'],
    ta: ['வைட்போர்டை திற', 'வைட்போர்டை காட்டு'],
    te: ['వైట్‌బోర్డ్ తెరువు', 'వైట్‌బోర్డ్ చూపించు'],
    ml: ['വൈറ്റ്ബോർഡ് തുറക്കുക', 'വൈറ്റ്ബോർഡ് കാണിക്കുക'],
    mr: ['व्हाइटबोर्ड उघडा', 'व्हाइटबोर्ड दाखवा'],
    gu: ['વ્હાઇટબોર્ડ ખોલો', 'વ્હાઇટબોર્ડ બતાવો'],
    bn: ['হোয়াইটবোর্ড খুলুন', 'হোয়াইটবোর্ড দেখান'],
    pa: ['ਵ੍ਹਾਈਟਬੋਰਡ ਖੋਲ੍ਹੋ', 'ਵ੍ਹਾਈਟਬੋਰਡ ਵਿਖਾਓ'],
    ur: ['وائٹ بورڈ کھولیں', 'وائٹ بورڈ دکھائیں'],
    or: ['ହ୍ୱାଇଟବୋର୍ଡ ଖୋଲନ୍ତୁ'],
    as: ['হোৱাইটবোৰ্ড খোলক'],
  },
  close: {
    en: ['close whiteboard', 'hide whiteboard', 'whiteboard close'],
    hi: ['व्हाइटबोर्ड बंद करो'],
    kn: ['ವೈಟ್‌ಬೋರ್ಡ್ ಮುಚ್ಚು'],
    ta: ['வைட்போர்டை மூடு'],
    te: ['వైట్‌బోర్డ్ మూసివేయి'],
    ml: ['വൈറ്റ്ബോർഡ് അടയ്ക്കുക'],
    mr: ['व्हाइटबोर्ड बंद करा'],
    gu: ['વ્હાઇટબોર્ડ બંધ કરો'],
    bn: ['হোয়াইটবোর্ড বন্ধ করুন'],
    pa: ['ਵ੍ਹਾਈਟਬੋਰਡ ਬੰਦ ਕਰੋ'],
    ur: ['وائٹ بورڈ بند کریں'],
    or: ['ହ୍ୱାଇଟବୋର୍ଡ ବନ୍ଦ କରନ୍ତୁ'],
    as: ['হোৱাইটবোৰ্ড বন্ধ কৰক'],
  }
};

export function useGlobalVoiceCommands(currentLanguage = 'en', enabled = true) {
  const { openWhiteboard, closeWhiteboard, isOpen } = useWhiteboard();
  const recognitionRef = useRef(null);
  const lastCommandTimeRef = useRef(0);
  const isListeningRef = useRef(false);

  const checkCommand = useCallback((transcript) => {
    const lowerTranscript = transcript.toLowerCase().trim();
    
    // Debounce - prevent duplicate triggers within 2 seconds
    const now = Date.now();
    if (now - lastCommandTimeRef.current < 2000) {
      return false;
    }

    // Check open commands
    const openCommands = WHITEBOARD_COMMANDS.open[currentLanguage] || WHITEBOARD_COMMANDS.open.en;
    for (const cmd of openCommands) {
      if (lowerTranscript.includes(cmd.toLowerCase())) {
        lastCommandTimeRef.current = now;
        openWhiteboard();
        showFeedback('Whiteboard Opened', '✓');
        return true;
      }
    }

    // Check close commands
    const closeCommands = WHITEBOARD_COMMANDS.close[currentLanguage] || WHITEBOARD_COMMANDS.close.en;
    for (const cmd of closeCommands) {
      if (lowerTranscript.includes(cmd.toLowerCase())) {
        lastCommandTimeRef.current = now;
        closeWhiteboard();
        showFeedback('Whiteboard Closed', '✓');
        return true;
      }
    }

    return false;
  }, [currentLanguage, openWhiteboard, closeWhiteboard]);

  const showFeedback = (message, icon) => {
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
  };

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = getLanguageCode(currentLanguage);

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          checkCommand(transcript);
        }
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        // Ignore no-speech errors
        return;
      }
      console.error('Speech recognition error:', event.error);
      
      // Restart after error
      if (isListeningRef.current) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (e) {}
        }, 1000);
      }
    };

    recognition.onend = () => {
      // Auto-restart continuous listening
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch (e) {}
      }
    };

    recognitionRef.current = recognition;

    // Start listening
    try {
      recognition.start();
      isListeningRef.current = true;
    } catch (error) {
      console.error('Failed to start voice commands:', error);
    }

    // Cleanup
    return () => {
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [enabled, currentLanguage, checkCommand]);

  return {
    isListening: isListeningRef.current,
  };
}

// Helper: Get language code for Speech Recognition
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
    or: 'or-IN',
    as: 'as-IN',
  };
  return codes[lang] || 'en-US';
}

// Global Voice Command Listener Component
export default function GlobalVoiceCommandListener({ currentLanguage = 'en' }) {
  useGlobalVoiceCommands(currentLanguage, true);
  return null;
}