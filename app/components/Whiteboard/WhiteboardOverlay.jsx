'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWhiteboard } from '../../context/WhiteboardContext';
import toast from 'react-hot-toast';

// Prevent multiple recognition instances
let whiteboardRecognitionActive = false;

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', flag: '🇮🇳' },
];

const VOICE_COMMANDS = {
  search: {
    en: ['search', 'search this', 'google this'],
    hi: ['खोजो', 'सर्च करो'],
  },
  stop: {
    en: ['stop', 'stop recording'],
    hi: ['रुको', 'बंद करो'],
  }
};

function getLanguageCode(lang) {
  const codes = {
    en: 'en-US',
    hi: 'hi-IN',
    kn: 'kn-IN',
  };
  return codes[lang] || 'en-US';
}

export default function WhiteboardOverlay() {
  const { isOpen, closeWhiteboard } = useWhiteboard();
  const [isListening, setIsListening] = useState(false);
  const [liveText, setLiveText] = useState('');
  const [finalText, setFinalText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  
  const recognitionRef = useRef(null);
  const transcriptRef = useRef(null);
  const fullTranscriptRef = useRef('');
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [circlePath, setCirclePath] = useState([]);

  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognition);
    }
  }, []);

  useEffect(() => {
    if (!isOpen || !isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = getLanguageCode(selectedLanguage);

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          if (checkCommand(transcript, 'stop')) {
            stopListening();
            return;
          }
          
          if (checkCommand(transcript, 'search')) {
            const searchQuery = fullTranscriptRef.current.trim() || transcript.trim();
            if (searchQuery) {
              handleSearch(searchQuery);
            }
            return;
          }
          
          final += transcript + ' ';
          fullTranscriptRef.current += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      if (interim) {
        setLiveText(fullTranscriptRef.current + interim);
      }
      if (final) {
        setFinalText(fullTranscriptRef.current);
      }
    };

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.error('Whiteboard speech error:', event.error);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      whiteboardRecognitionActive = false;
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognition) {
        try {
          recognition.stop();
          whiteboardRecognitionActive = false;
        } catch (e) {}
      }
    };
  }, [isOpen, selectedLanguage, isSupported]);

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [isOpen]);

  const checkCommand = (text, commandType) => {
    const commands = VOICE_COMMANDS[commandType][selectedLanguage] || VOICE_COMMANDS[commandType].en;
    const lowerText = text.toLowerCase();
    return commands.some(cmd => lowerText.includes(cmd.toLowerCase()));
  };

  const startListening = () => {
    if (whiteboardRecognitionActive) {
      toast.error('Already listening');
      return;
    }

    if (recognitionRef.current && !isListening) {
      try {
        fullTranscriptRef.current = '';
        setLiveText('');
        setFinalText('');
        recognitionRef.current.start();
        setIsListening(true);
        whiteboardRecognitionActive = true;
        toast.success('Listening started');
      } catch (error) {
        console.error('Failed to start listening:', error);
        toast.error('Failed to start');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
        whiteboardRecognitionActive = false;
        setFinalText(fullTranscriptRef.current);
        setLiveText('');
        toast.success('Listening stopped');
      } catch (error) {
        console.error('Failed to stop listening:', error);
      }
    }
  };

  const clearAll = () => {
    setLiveText('');
    setFinalText('');
    fullTranscriptRef.current = '';
    setCirclePath([]);
    clearCanvas();
  };

  const handleSearch = (query) => {
    if (!query || !query.trim()) return;
    
    const lowerQuery = query.toLowerCase();
    let url = '';
    let platform = 'Google';
    
    if (lowerQuery.includes('chatgpt') || lowerQuery.includes('gpt')) {
      const cleanQuery = query.replace(/chatgpt|gpt|in|on|using|with/gi, '').trim();
      url = `https://chat.openai.com/?q=${encodeURIComponent(cleanQuery)}`;
      platform = 'ChatGPT';
    } else if (lowerQuery.includes('claude')) {
      const cleanQuery = query.replace(/claude|in|on|using|with/gi, '').trim();
      url = `https://claude.ai/new?q=${encodeURIComponent(cleanQuery)}`;
      platform = 'Claude';
    } else if (lowerQuery.includes('gemini')) {
      const cleanQuery = query.replace(/gemini|in|on|using|with/gi, '').trim();
      url = `https://gemini.google.com/?q=${encodeURIComponent(cleanQuery)}`;
      platform = 'Gemini';
    } else {
      url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }
    
    toast.success(`Searching on ${platform}...`);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCanvasMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsDrawing(true);
    setCirclePath([{ x, y }]);
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDrawing) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCirclePath(prev => [...prev, { x, y }]);
    drawPath();
  };

  const handleCanvasMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    if (circlePath.length > 10) {
      const text = finalText || liveText;
      if (text) {
        handleSearch(text);
      }
    }
    
    setTimeout(() => {
      setCirclePath([]);
      clearCanvas();
    }, 500);
  };

  const drawPath = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (circlePath.length < 2) return;
    
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, '#6366f1');
    gradient.addColorStop(1, '#a855f7');
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 12;
    ctx.shadowColor = 'rgba(99, 102, 241, 0.6)';
    
    ctx.beginPath();
    ctx.moveTo(circlePath[0].x, circlePath[0].y);
    
    for (let i = 1; i < circlePath.length; i++) {
      ctx.lineTo(circlePath[i].x, circlePath[i].y);
    }
    
    ctx.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleClose = () => {
    stopListening();
    clearAll();
    closeWhiteboard();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  if (!isSupported) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-xl flex items-center justify-center">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🎤</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Browser Not Supported
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please use Chrome, Edge, or Safari
          </p>
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-xl"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="absolute inset-4 md:inset-8 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden border-2 border-indigo-500/20"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                </svg>
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                  AI Whiteboard
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden md:block">
                  Say "search" or draw a circle
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!isListening ? (
                <button
                  onClick={startListening}
                  className="px-4 md:px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all shadow-lg flex items-center gap-2 text-sm md:text-base"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                  </svg>
                  <span className="hidden md:inline">Start</span>
                </button>
              ) : (
                <button
                  onClick={stopListening}
                  className="px-4 md:px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all shadow-lg flex items-center gap-2 animate-pulse text-sm md:text-base"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="6" width="12" height="12" rx="2"/>
                  </svg>
                  <span className="hidden md:inline">Stop</span>
                </button>
              )}
              
              <button
                onClick={handleClose}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 relative overflow-hidden">
            <div
              ref={transcriptRef}
              className="absolute inset-0 p-4 md:p-8 overflow-y-auto"
              style={{ userSelect: 'text', zIndex: 1 }}
            >
              {liveText || finalText ? (
                <div className="text-2xl md:text-3xl lg:text-4xl font-medium text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap">
                  {liveText || finalText}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-center text-gray-400">
                  <div>
                    <div className="text-6xl mb-4">🎤</div>
                    <p className="text-xl md:text-2xl mb-4">Ready to Listen</p>
                    <p className="text-sm md:text-base">Press Start and speak</p>
                  </div>
                </div>
              )}
            </div>

            <canvas
              ref={canvasRef}
              className="absolute inset-0 cursor-crosshair"
              style={{ pointerEvents: 'all', touchAction: 'none', zIndex: 2 }}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
            />
          </div>

          {(liveText || finalText) && (
            <div className="flex items-center justify-between px-4 md:px-6 py-3 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                {(liveText || finalText).length} characters
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(finalText || liveText);
                    toast.success('Copied!');
                  }}
                  className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={clearAll}
                  className="px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}