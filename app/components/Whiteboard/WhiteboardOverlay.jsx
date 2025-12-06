'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWhiteboard } from '../context/WhiteboardContext';

// Voice commands for whiteboard control
const VOICE_COMMANDS = {
  search: {
    en: ['search', 'search this', 'search now', 'google this'],
    hi: ['खोजो', 'सर्च करो'],
    // ... other languages
  },
  stop: {
    en: ['stop', 'stop recording', 'end'],
    hi: ['रुको', 'बंद करो'],
  },
  clear: {
    en: ['clear all', 'delete all', 'erase all'],
    hi: ['सब मिटाओ', 'सब हटाओ'],
  },
  newParagraph: {
    en: ['new paragraph', 'new line'],
    hi: ['नया पैराग्राफ'],
  }
};

export default function WhiteboardOverlay() {
  const { isOpen, closeWhiteboard } = useWhiteboard();
  const [isListening, setIsListening] = useState(false);
  const [liveText, setLiveText] = useState('');
  const [finalText, setFinalText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isDrawing, setIsDrawing] = useState(false);
  const [circlePath, setCirclePath] = useState([]);
  
  const recognitionRef = useRef(null);
  const canvasRef = useRef(null);
  const transcriptRef = useRef(null);
  const gestureDetectorRef = useRef(null);
  const textExtractorRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if (!isOpen) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported');
      return;
    }

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
          // Check for commands
          if (checkCommand(transcript, 'stop')) {
            stopListening();
            return;
          }
          if (checkCommand(transcript, 'search')) {
            handleSearch(finalText + ' ' + transcript);
            return;
          }
          if (checkCommand(transcript, 'clear')) {
            clearAll();
            return;
          }
          
          final += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      if (interim) {
        setLiveText(finalText + final + interim);
      }
      if (final) {
        setFinalText(prev => prev + final);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech error:', event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognition) {
        try {
          recognition.stop();
        } catch (e) {}
      }
    };
  }, [isOpen, selectedLanguage, finalText]);

  // Initialize gesture detector
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;

    // Dynamically import gesture detector
    const initGestureDetector = async () => {
      try {
        // Inline minimal gesture detector
        gestureDetectorRef.current = {
          points: [],
          startGesture: (x, y) => {
            gestureDetectorRef.current.points = [{ x, y }];
          },
          addPoint: (x, y) => {
            gestureDetectorRef.current.points.push({ x, y });
          },
          endGesture: () => {
            const points = gestureDetectorRef.current.points;
            if (points.length < 10) return null;
            
            // Simple bounding box
            let minX = Infinity, minY = Infinity;
            let maxX = -Infinity, maxY = -Infinity;
            
            points.forEach(p => {
              minX = Math.min(minX, p.x);
              minY = Math.min(minY, p.y);
              maxX = Math.max(maxX, p.x);
              maxY = Math.max(maxY, p.y);
            });
            
            return {
              boundingBox: {
                left: minX,
                top: minY,
                right: maxX,
                bottom: maxY,
                width: maxX - minX,
                height: maxY - minY
              },
              points: [...points]
            };
          }
        };
        
        // Simple text extractor
        textExtractorRef.current = {
          extractTextFromBounds: (box, container) => {
            // Simple selection - just get all text for now
            return container.textContent.trim();
          }
        };
      } catch (error) {
        console.error('Failed to initialize gesture detector:', error);
      }
    };

    initGestureDetector();
  }, [isOpen]);

  const checkCommand = (text, commandType) => {
    const commands = VOICE_COMMANDS[commandType][selectedLanguage] || VOICE_COMMANDS[commandType].en;
    const lowerText = text.toLowerCase();
    return commands.some(cmd => lowerText.includes(cmd.toLowerCase()));
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Failed to start listening:', error);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (error) {
        console.error('Failed to stop listening:', error);
      }
    }
  };

  const clearAll = () => {
    setLiveText('');
    setFinalText('');
    setCirclePath([]);
  };

  const handleSearch = (query) => {
    if (!query || !query.trim()) return;
    
    // Detect search platform
    const lowerQuery = query.toLowerCase();
    let url = '';
    
    if (lowerQuery.includes('chatgpt')) {
      url = `https://chat.openai.com/?q=${encodeURIComponent(query)}`;
    } else if (lowerQuery.includes('claude')) {
      url = `https://claude.ai/new?q=${encodeURIComponent(query)}`;
    } else if (lowerQuery.includes('gemini')) {
      url = `https://gemini.google.com/?q=${encodeURIComponent(query)}`;
    } else {
      url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }
    
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCanvasMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setCirclePath([{ x, y }]);
    
    if (gestureDetectorRef.current) {
      gestureDetectorRef.current.startGesture(x, y);
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDrawing) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCirclePath(prev => [...prev, { x, y }]);
    
    if (gestureDetectorRef.current) {
      gestureDetectorRef.current.addPoint(x, y);
    }
    
    // Draw on canvas
    drawPath();
  };

  const handleCanvasMouseUp = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    
    if (gestureDetectorRef.current) {
      const gesture = gestureDetectorRef.current.endGesture();
      
      if (gesture && transcriptRef.current && textExtractorRef.current) {
        const extractedText = textExtractorRef.current.extractTextFromBounds(
          gesture.boundingBox,
          transcriptRef.current
        );
        
        if (extractedText) {
          // Show search modal with extracted text
          handleSearch(extractedText);
        }
      }
    }
    
    // Clear canvas after short delay
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
    
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 10;
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

  // Keyboard shortcut (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

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
          className="absolute inset-4 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden border-2 border-indigo-500/20"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  AI Whiteboard
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Say "search" or draw a circle
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!isListening ? (
                <button
                  onClick={startListening}
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all shadow-lg flex items-center gap-2"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                  </svg>
                  Start
                </button>
              ) : (
                <button
                  onClick={stopListening}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all shadow-lg flex items-center gap-2 animate-pulse"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="6" width="12" height="12" rx="2"/>
                  </svg>
                  Stop
                </button>
              )}
              
              <button
                onClick={handleClose}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close whiteboard"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 relative overflow-hidden">
            {/* Transcript Display */}
            <div
              ref={transcriptRef}
              className="absolute inset-0 p-8 overflow-y-auto text-3xl md:text-4xl lg:text-5xl font-medium text-gray-900 dark:text-white leading-relaxed"
              style={{ userSelect: 'text' }}
            >
              {liveText || finalText || (
                <div className="flex items-center justify-center h-full text-center text-gray-400">
                  <div>
                    <p className="text-2xl mb-4">👋 Say "open whiteboard" to start</p>
                    <p className="text-lg">Or press the Start button and begin speaking</p>
                  </div>
                </div>
              )}
            </div>

            {/* Canvas Overlay for Drawing */}
            <canvas
              ref={canvasRef}
              width={window.innerWidth}
              height={window.innerHeight}
              className="absolute inset-0 cursor-crosshair"
              style={{ pointerEvents: 'all', touchAction: 'none' }}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
            />
          </div>

          {/* Footer with Actions */}
          {(liveText || finalText) && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {liveText.length || finalText.length} characters
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(finalText || liveText)}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={clearAll}
                  className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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