'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

// Voice command trigger words in different languages
const VOICE_COMMANDS = {
  search: {
    en: ['search', 'search this', 'search now', 'search this now', 'google this', 'google search', 'search it'],
    hi: ['खोजो', 'सर्च करो', 'गूगल पे खोजो', 'ढूंढो', 'सर्च'],
    kn: ['ಹುಡುಕು', 'ಸರ್ಚ್ ಮಾಡು', 'ಗೂಗಲ್ ಮಾಡು', 'ಸರ್ಚ್'],
    ta: ['தேடு', 'தேடவும்', 'கூகுள் செய்', 'சர்ச்'],
    te: ['వెతకండి', 'శోధించండి', 'గూగుల్ చేయండి', 'సెర్చ్'],
    ml: ['തിരയുക', 'സെർച്ച് ചെയ്യുക', 'സെർച്ച്'],
    mr: ['शोधा', 'सर्च करा', 'सर्च'],
    gu: ['શોધો', 'સર્ચ કરો', 'સર્ચ'],
    bn: ['খোঁজ', 'সার্চ কর', 'সার্চ'],
    pa: ['ਖੋਜੋ', 'ਸਰਚ ਕਰੋ', 'ਸਰਚ'],
    ur: ['تلاش کریں', 'سرچ کریں', 'سرچ'],
  },
  stop: {
    en: ['stop', 'stop recording', 'stop listening', 'end', 'finish'],
    hi: ['रुको', 'रोको', 'बंद करो', 'समाप्त', 'खत्म'],
    kn: ['ನಿಲ್ಲಿ', 'ನಿಲ್ಲು', 'ಬಿಡು', 'ಮುಗಿಸು'],
    ta: ['நில்', 'நிறுத்து', 'நிறுத்தவும்', 'முடி'],
    te: ['ఆపు', 'ఆగు', 'నిలిపివేయి', 'ముగించు'],
    ml: ['നിർത്തുക', 'നിർത്താൻ', 'അവസാനിപ്പിക്കുക'],
    mr: ['थांबा', 'बंद', 'बंद करा', 'संपवा'],
    gu: ['બંધ', 'રોકો', 'બંધ કરો', 'સમાપ્ત'],
    bn: ['থামো', 'বন্ধ', 'থামাও', 'শেষ'],
    pa: ['ਰੁਕੋ', 'ਬੰਦ', 'ਬੰਦ ਕਰੋ', 'ਖਤਮ'],
    ur: ['رکو', 'بند کریں', 'ختم کریں', 'بند'],
  }
};

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

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

// Speech Recognition Engine
class SpeechEngine {
  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      throw new Error('Speech Recognition is not supported in this browser');
    }
    
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;
    
    this.isListening = false;
    this.currentLanguage = 'en';
    this.fullTranscript = '';
    
    this.onPartialResult = null;
    this.onFinalResult = null;
    this.onEnd = null;
    this.onError = null;
    this.onSearchTrigger = null;
    this.onStopCommand = null;
    
    // Track if we've already processed a command to prevent duplicates
    this.commandProcessed = false;
  }

  start(language = 'en') {
    if (this.isListening) return;

    this.currentLanguage = language;
    this.recognition.lang = this.getLanguageCode(language);
    this.fullTranscript = '';
    this.commandProcessed = false;
    
    this.recognition.onresult = (event) => {
      // If command already processed, ignore further results
      if (this.commandProcessed) return;
      
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
          
          // Check for STOP command first (highest priority)
          if (this.checkStopCommand(transcript)) {
            this.commandProcessed = true;
            return; // Exit immediately
          }
          
          // Then check for SEARCH command
          if (this.checkSearchTrigger(transcript)) {
            this.commandProcessed = true;
            return; // Exit immediately
          }
          
          // If no command, add to transcript
          this.fullTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
          
          // Check commands in interim results too (for faster response)
          if (this.checkStopCommand(interimTranscript)) {
            this.commandProcessed = true;
            return;
          }
          
          if (this.checkSearchTrigger(interimTranscript)) {
            this.commandProcessed = true;
            return;
          }
        }
      }

      if (this.onPartialResult && interimTranscript) {
        this.onPartialResult(this.fullTranscript + interimTranscript);
      }
      
      if (this.onFinalResult && finalTranscript) {
        this.onFinalResult(this.fullTranscript.trim());
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      
      if (this.onEnd) {
        this.onEnd(this.fullTranscript.trim());
      }
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      
      if (this.onError) {
        this.onError(event.error);
      }
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (error) {
      if (this.onError) {
        this.onError(error.message);
      }
    }
  }

  stop() {
    if (!this.isListening) return;
    
    try {
      this.recognition.stop();
      this.isListening = false;
    } catch (error) {
      console.error('Error stopping recognition:', error);
    }
  }

  checkStopCommand(text) {
    const lowerText = text.toLowerCase().trim();
    const stopCommands = VOICE_COMMANDS.stop[this.currentLanguage] || VOICE_COMMANDS.stop.en;
    
    // Check if text contains or ends with stop command
    for (const command of stopCommands) {
      const commandLower = command.toLowerCase();
      
      // Exact match or ends with command
      if (lowerText === commandLower || lowerText.endsWith(commandLower)) {
        console.log('🛑 STOP command detected:', command);
        
        // Extract text before stop command
        let textBeforeStop = text;
        if (lowerText.endsWith(commandLower)) {
          textBeforeStop = text.substring(0, text.length - command.length).trim();
        } else if (lowerText === commandLower) {
          textBeforeStop = this.fullTranscript.trim();
        }
        
        // Update transcript without stop command
        this.fullTranscript = textBeforeStop;
        
        // Trigger stop callback
        if (this.onStopCommand) {
          this.onStopCommand(textBeforeStop);
        }
        
        // Stop recognition immediately
        this.stop();
        return true;
      }
      
      // Also check if stop word appears anywhere (with word boundaries)
      const wordPattern = new RegExp(`\\b${commandLower}\\b`, 'i');
      if (wordPattern.test(lowerText)) {
        console.log('🛑 STOP command detected (within text):', command);
        
        // Extract text before stop command
        const stopIndex = lowerText.search(wordPattern);
        const textBeforeStop = text.substring(0, stopIndex).trim();
        
        this.fullTranscript = textBeforeStop;
        
        if (this.onStopCommand) {
          this.onStopCommand(textBeforeStop);
        }
        
        this.stop();
        return true;
      }
    }
    
    return false;
  }

  checkSearchTrigger(text) {
    const lowerText = text.toLowerCase().trim();
    const searchCommands = VOICE_COMMANDS.search[this.currentLanguage] || VOICE_COMMANDS.search.en;
    
    for (const command of searchCommands) {
      const commandLower = command.toLowerCase();
      
      // Check if search command appears in text
      if (lowerText.includes(commandLower)) {
        console.log('🔍 SEARCH command detected:', command);
        
        // Extract text before the search command
        const commandIndex = lowerText.indexOf(commandLower);
        let searchText = text.substring(0, commandIndex).trim();
        
        // If search text is empty, use full transcript
        if (!searchText) {
          searchText = this.fullTranscript.trim();
        }
        
        if (searchText && this.onSearchTrigger) {
          this.onSearchTrigger(searchText);
          this.stop(); // Stop after search
          return true;
        }
      }
      
      // Also check if text ends with search command
      if (lowerText.endsWith(commandLower)) {
        console.log('🔍 SEARCH command detected (at end):', command);
        
        const searchText = text.substring(0, text.length - command.length).trim();
        
        if (searchText && this.onSearchTrigger) {
          this.onSearchTrigger(searchText);
          this.stop(); // Stop after search
          return true;
        }
      }
    }
    
    return false;
  }

  getLanguageCode(simpleLang) {
    const LANGUAGE_MAP = {
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
    return LANGUAGE_MAP[simpleLang] || 'en-US';
  }

  getTranscript() {
    return this.fullTranscript.trim();
  }

  clearTranscript() {
    this.fullTranscript = '';
  }
}

// Check browser support
const isSpeechRecognitionSupported = () => {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
};

export default function LiveCaptionWithSearch() {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isListening, setIsListening] = useState(false);
  const [liveText, setLiveText] = useState('');
  const [finalText, setFinalText] = useState('');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [searchNotification, setSearchNotification] = useState('');
  
  const speechEngineRef = useRef(null);
  const textContainerRef = useRef(null);

  // Check browser support on mount
  useEffect(() => {
    const supported = isSpeechRecognitionSupported();
    setIsSupported(supported);
  }, []);

  // Auto-scroll to bottom when text updates
  useEffect(() => {
    if (textContainerRef.current) {
      textContainerRef.current.scrollTop = textContainerRef.current.scrollHeight;
    }
  }, [liveText, finalText]);

  const handleSearch = (searchText) => {
    if (!searchText || searchText.trim().length === 0) return;
    
    console.log('🔍 Processing search/AI request:', searchText);
    
    // The backend will handle AI detection, but we can also detect here for faster UX
    const lowerText = searchText.toLowerCase();
    
    let redirectUrl = null;
    let notificationText = '';
    
    // Check for AI platforms
    if (lowerText.includes('chatgpt') || lowerText.includes('chat gpt') || lowerText.includes('openai')) {
      // Extract query without "chatgpt"
      const query = searchText.replace(/chatgpt|chat gpt|openai|write|code|in|the|on/gi, '').trim();
      redirectUrl = `https://chat.openai.com/?q=${encodeURIComponent(query)}`;
      notificationText = `Opening ChatGPT: "${query}"`;
    } 
    else if (lowerText.includes('claude') || lowerText.includes('anthropic')) {
      const query = searchText.replace(/claude|claude ai|anthropic|write|code|in|the|on/gi, '').trim();
      redirectUrl = `https://claude.ai/new?q=${encodeURIComponent(query)}`;
      notificationText = `Opening Claude AI: "${query}"`;
    }
    else if (lowerText.includes('gemini') || lowerText.includes('bard') || lowerText.includes('google gemini')) {
      const query = searchText.replace(/gemini|google gemini|bard|write|code|in|the|on/gi, '').trim();
      redirectUrl = `https://gemini.google.com/?q=${encodeURIComponent(query)}`;
      notificationText = `Opening Gemini: "${query}"`;
    }
    else {
      // Regular Google search
      redirectUrl = `https://www.google.com/search?q=${encodeURIComponent(searchText.trim())}`;
      notificationText = `Searching Google: "${searchText}"`;
    }
    
    // Show notification
    setSearchNotification(notificationText);
    
    // Set final text
    setFinalText(searchText);
    setLiveText('');
    setIsListening(false);
    
    // Open in new tab
    window.open(redirectUrl, '_blank', 'noopener,noreferrer');
    
    // Clear notification after 4 seconds
    setTimeout(() => {
      setSearchNotification('');
    }, 4000);
  };

  const handleStopCommand = (textBeforeStop) => {
    console.log('🛑 Stop command triggered. Text:', textBeforeStop);
    
    setIsListening(false);
    setFinalText(textBeforeStop);
    setLiveText('');
    
    // Show notification
    setSearchNotification('Recording stopped by voice');
    setTimeout(() => {
      setSearchNotification('');
    }, 2000);
  };

  const handleStart = () => {
    if (!isSupported) {
      alert('Speech recognition is not supported in this browser');
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
        setIsListening(false);
        setFinalText(text);
        setLiveText('');
      };
      
      engine.onError = (error) => {
        setIsListening(false);
        console.error('Speech recognition error:', error);
      };
      
      // Handle search trigger
      engine.onSearchTrigger = (searchText) => {
        handleSearch(searchText);
      };
      
      // Handle stop command
      engine.onStopCommand = (textBeforeStop) => {
        handleStopCommand(textBeforeStop);
      };
      
      speechEngineRef.current = engine;
      
      setLiveText('');
      setFinalText('');
      
      engine.start(selectedLanguage);
      setIsListening(true);
      
    } catch (error) {
      console.error('Failed to start recognition:', error);
      alert(error.message || 'Failed to start recognition');
    }
  };

  const handleStop = () => {
    if (speechEngineRef.current) {
      speechEngineRef.current.stop();
    }
  };

  const handleClear = () => {
    setLiveText('');
    setFinalText('');
    if (speechEngineRef.current) {
      speechEngineRef.current.clearTranscript();
    }
  };

  const handleCopy = () => {
    const textToCopy = finalText || liveText;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      alert('Copied to clipboard');
    }
  };

  const handleManualSearch = () => {
    const textToSearch = finalText || liveText;
    if (textToSearch) {
      handleSearch(textToSearch);
    }
  };

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-slate-700">
          <div className="text-6xl mb-4">🎤</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Browser Not Supported
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Speech recognition requires a modern browser. Please use:
          </p>
          <ul className="text-gray-600 dark:text-gray-400 space-y-2 mb-6 text-left">
            <li>• Google Chrome (Desktop/Mobile)</li>
            <li>• Microsoft Edge</li>
            <li>• Safari (macOS/iOS)</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header Controls */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-md z-50 p-4 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <MicIcon />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                Live Captions
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Say "search" or "stop"
              </p>
            </div>
          </div>

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
                    className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden z-50 max-h-80 overflow-y-auto"
                  >
                    {AVAILABLE_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setSelectedLanguage(lang.code);
                          setShowLanguageDropdown(false);
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
                className="flex items-center gap-2 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-all shadow-lg animate-pulse"
              >
                <StopIcon />
                <span>Stop</span>
              </button>
            )}

            {(finalText || liveText) && (
              <>
                <button
                  onClick={handleManualSearch}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all shadow-lg"
                  title="Search on Google"
                >
                  <SearchIcon />
                  <span>Search</span>
                </button>
                
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

      {/* Search Notification */}
      <AnimatePresence>
        {searchNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3"
          >
            <SearchIcon />
            <span className="font-semibold">{searchNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="pt-24 pb-8 px-6">
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
                  Listening... Say "search" to Google it or "stop" to end
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Text Display Area */}
          <div
            ref={textContainerRef}
            className="min-h-[70vh] max-h-[70vh] overflow-y-auto bg-white dark:bg-slate-800 rounded-2xl p-8 border-2 border-gray-200 dark:border-slate-700 shadow-xl"
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
                {/* <div className="text-6xl mb-4">🎤</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Ready to Start
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mb-4">
                  Select your language and press "Start" to begin. Live captions will appear here as you speak.
                </p>
                <div className="bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-800 rounded-xl p-4 max-w-lg">
                  <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
                    💡 Voice Commands & AI Detection
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-indigo-600 dark:text-indigo-400">
                      🔍 <strong>"search [query]"</strong> - Search on Google
                    </p>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400">
                      🤖 <strong>"write code in ChatGPT"</strong> - Opens ChatGPT
                    </p>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400">
                      🤖 <strong>"explain this in Claude"</strong> - Opens Claude AI
                    </p>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400">
                      🤖 <strong>"ask Gemini about..."</strong> - Opens Gemini
                    </p>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400">
                      🛑 <strong>"stop"</strong> - End recording
                    </p>
                  </div>
                  <p className="text-xs text-indigo-500 dark:text-indigo-500 mt-2">
                    Works in all languages • Perfect grammar • AI-powered
                  </p>
                </div> */}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}