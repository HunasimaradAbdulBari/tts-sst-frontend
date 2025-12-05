'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { SpeechEngine, isSpeechRecognitionSupported } from '../lib/speechEngine';
import toast from 'react-hot-toast';

// Available languages for selection
const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰' },
];

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

const MicIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
  </svg>
);

const StopIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="6" width="12" height="12" rx="2"/>
  </svg>
);

export default function LiveCaptionScreen() {
  const router = useRouter();
  
  // State management
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isListening, setIsListening] = useState(false);
  const [liveText, setLiveText] = useState('');
  const [finalText, setFinalText] = useState('');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Reference to the speech engine
  const speechEngineRef = useRef(null);
  const textContainerRef = useRef(null);

  // Check browser support on mount
  useEffect(() => {
    const supported = isSpeechRecognitionSupported();
    setIsSupported(supported);
    
    if (!supported) {
      toast.error('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
    }
  }, []);

  // Auto-scroll to bottom when text updates
  useEffect(() => {
    if (textContainerRef.current) {
      textContainerRef.current.scrollTop = textContainerRef.current.scrollHeight;
    }
  }, [liveText, finalText]);

  /**
   * Handle Start Button Click
   */
  const handleStart = () => {
    if (!isSupported) {
      toast.error('Speech recognition is not supported in this browser');
      return;
    }

    try {
      const engine = new SpeechEngine();
      
      engine.onPartialResult = (text) => {
        setLiveText(text);
      };
      
      engine.onFinalResult = (text) => {
        setLiveText(text);
      };
      
      engine.onEnd = (text) => {
        console.log('Recognition ended. Final text:', text);
        setIsListening(false);
        setFinalText(text);
        setLiveText('');
        
        if (text && text.length > 0) {
          saveTranscript(text, selectedLanguage);
        }
      };
      
      engine.onError = (error) => {
        console.error('Speech recognition error:', error);
        setIsListening(false);
        
        if (error === 'no-speech') {
          toast.error('No speech detected. Please try again.');
        } else if (error === 'not-allowed') {
          toast.error('Microphone permission denied. Please allow microphone access.');
        } else {
          toast.error(`Error: ${error}`);
        }
      };
      
      speechEngineRef.current = engine;
      
      setLiveText('');
      setFinalText('');
      
      engine.start(selectedLanguage);
      setIsListening(true);
      
      const langName = AVAILABLE_LANGUAGES.find(l => l.code === selectedLanguage)?.name || 'selected language';
      toast.success(`Started listening in ${langName}`);
      
    } catch (error) {
      console.error('Failed to start recognition:', error);
      toast.error(error.message || 'Failed to start recognition');
    }
  };

  /**
   * Handle Stop Button Click
   */
  const handleStop = () => {
    if (speechEngineRef.current) {
      speechEngineRef.current.stop();
      toast.success('Recognition stopped');
    }
  };

  /**
   * Save transcript to backend
   */
  const saveTranscript = async (text, language) => {
    if (!text || text.trim().length === 0) return;
    
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/transcripts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          language: language,
          timestamp: new Date().toISOString(),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save transcript');
      }
      
      const data = await response.json();
      console.log('Transcript saved:', data);
      
    } catch (error) {
      console.error('Error saving transcript:', error);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle Clear Button
   */
  const handleClear = () => {
    setLiveText('');
    setFinalText('');
    if (speechEngineRef.current) {
      speechEngineRef.current.clearTranscript();
    }
    toast.success('Cleared');
  };

  /**
   * Handle Copy Button
   */
  const handleCopy = () => {
    const textToCopy = finalText || liveText;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      toast.success('Copied to clipboard');
    }
  };

  /**
   * Handle Back Button
   */
  const handleBack = () => {
    if (isListening) {
      handleStop();
    }
    router.push('/');
  };

  // Show browser not supported message
  if (!isSupported) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🎤</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Browser Not Supported
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Speech recognition requires a modern browser. Please use:
          </p>
          <ul className="text-gray-600 dark:text-gray-400 space-y-2 mb-6">
            <li>• Google Chrome (Desktop/Mobile)</li>
            <li>• Microsoft Edge</li>
            <li>• Safari (macOS/iOS)</li>
          </ul>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Header Controls */}
      <div className="fixed top-0 left-0 right-0 bg-white dark:bg-slate-800 shadow-md z-50 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <BackIcon />
            <span className="font-medium">Back</span>
          </button>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              disabled={isListening}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg border border-gray-300 dark:border-slate-600 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-xl">
                {AVAILABLE_LANGUAGES.find(l => l.code === selectedLanguage)?.flag}
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {AVAILABLE_LANGUAGES.find(l => l.code === selectedLanguage)?.name}
              </span>
              <svg className={`w-4 h-4 transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {/* Language Dropdown */}
            <AnimatePresence>
              {showLanguageDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowLanguageDropdown(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden z-50 max-h-80 overflow-y-auto"
                  >
                    {AVAILABLE_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setSelectedLanguage(lang.code);
                          setShowLanguageDropdown(false);
                          toast.success(`Selected: ${lang.name}`);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors ${
                          selectedLanguage === lang.code ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''
                        }`}
                      >
                        <span className="text-2xl">{lang.flag}</span>
                        <span className={`text-sm font-semibold ${
                          selectedLanguage === lang.code ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'
                        }`}>
                          {lang.name}
                        </span>
                        {selectedLanguage === lang.code && (
                          <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400 ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-2">
            {!isListening ? (
              <button
                onClick={handleStart}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all shadow-lg"
              >
                <MicIcon />
                <span>Start</span>
              </button>
            ) : (
              <button
                onClick={handleStop}
                className="flex items-center gap-2 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all shadow-lg"
              >
                <StopIcon />
                <span>Stop</span>
              </button>
            )}

            {(finalText || liveText) && (
              <>
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={handleClear}
                  className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  Clear
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="pt-20 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Listening Indicator */}
          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-center gap-3 mb-6"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-3 h-3 bg-red-500 rounded-full"
                />
                <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Listening... (Say "stop" to end)
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Text Display Area */}
          <div
            ref={textContainerRef}
            className="min-h-[70vh] max-h-[70vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl p-8 border-2 border-gray-200 dark:border-slate-700"
          >
            {/* Live text while listening */}
            {isListening && liveText && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-3xl md:text-4xl lg:text-5xl font-medium text-gray-900 dark:text-white leading-relaxed"
                style={{ wordWrap: 'break-word' }}
              >
                {liveText}
              </motion.div>
            )}

            {/* Final text after stopping */}
            {!isListening && finalText && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-6 h-6 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                    Transcription Complete
                    {isSaving && ' • Saving...'}
                  </span>
                </div>
                <div
                  className="text-2xl md:text-3xl lg:text-4xl font-medium text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap"
                  style={{ wordWrap: 'break-word' }}
                >
                  {finalText}
                </div>
              </motion.div>
            )}

            {/* Placeholder when idle */}
            {!isListening && !finalText && !liveText && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-6xl mb-4">🎤</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Ready to Start
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                  Select your language and press "Start" to begin. Live captions will appear here as you speak.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}