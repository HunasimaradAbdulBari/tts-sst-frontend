// app/lib/speechEngine.js
// Speech Recognition Engine using Web Speech API

/**
 * Language mapping for Web Speech API
 * Maps our simple codes (en, hi, kn) to Web Speech API language codes
 */
const LANGUAGE_MAP = {
  en: 'en-US',      // English
  hi: 'hi-IN',      // Hindi
  kn: 'kn-IN',      // Kannada
  ta: 'ta-IN',      // Tamil
  te: 'te-IN',      // Telugu
  ml: 'ml-IN',      // Malayalam
  mr: 'mr-IN',      // Marathi
  gu: 'gu-IN',      // Gujarati
  bn: 'bn-IN',      // Bengali
  pa: 'pa-IN',      // Punjabi
  ur: 'ur-PK',      // Urdu
};

/**
 * Stop words in different languages
 * Used to detect when user says "stop" to end recording
 */
const STOP_WORDS = {
  en: ['stop', 'stopped', 'stopping'],
  hi: ['रुको', 'रोको', 'बंद', 'बंद करो'],
  kn: ['ನಿಲ್ಲಿ', 'ನಿಲ್ಲು', 'ಬಿಡು'],
  ta: ['நில்', 'நிறுத்து', 'நிறுத்தவும்'],
  te: ['ఆపు', 'ఆగు', 'నిలిపివేయి'],
  ml: ['നിർത്തുക', 'നിർത്താൻ'],
  mr: ['थांबा', 'बंद'],
  gu: ['બંધ', 'રોકો'],
  bn: ['থামো', 'বন্ধ'],
  pa: ['ਰੁਕੋ', 'ਬੰਦ'],
  ur: ['رکو', 'بند'],
};

/**
 * Check if browser supports Web Speech API
 */
export const isSpeechRecognitionSupported = () => {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
};

/**
 * Get the Web Speech API language code for our simple language code
 */
export const getLanguageCode = (simpleLang) => {
  return LANGUAGE_MAP[simpleLang] || 'en-US';
};

/**
 * Check if the recognized text contains a stop word
 */
const containsStopWord = (text, language) => {
  const stopWords = STOP_WORDS[language] || STOP_WORDS.en;
  const lowerText = text.toLowerCase().trim();
  
  return stopWords.some(word => {
    // Check if the stop word appears at the end of the text
    // This prevents false positives (e.g., "stop sign" should not trigger)
    return lowerText.endsWith(word) || lowerText === word;
  });
};

/**
 * Remove stop word from the end of text
 */
const removeStopWord = (text, language) => {
  const stopWords = STOP_WORDS[language] || STOP_WORDS.en;
  let cleanedText = text.trim();
  
  for (const word of stopWords) {
    // Remove stop word if it appears at the end
    if (cleanedText.toLowerCase().endsWith(word)) {
      cleanedText = cleanedText.slice(0, -word.length).trim();
      break;
    }
  }
  
  return cleanedText;
};

/**
 * Main Speech Engine Class
 * Handles speech recognition using Web Speech API
 */
export class SpeechEngine {
  constructor() {
    // Initialize the Speech Recognition API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      throw new Error('Speech Recognition is not supported in this browser');
    }
    
    this.recognition = new SpeechRecognition();
    
    // Set recognition properties for optimal performance
    this.recognition.continuous = true;        // Keep listening continuously
    this.recognition.interimResults = true;    // Show partial results in real-time
    this.recognition.maxAlternatives = 1;      // Only get the best result
    
    // State
    this.isListening = false;
    this.currentLanguage = 'en';
    this.fullTranscript = '';
    
    // Callbacks (will be set by the component)
    this.onPartialResult = null;    // Called with partial/live text
    this.onFinalResult = null;       // Called when a phrase is finalized
    this.onEnd = null;               // Called when recognition stops
    this.onError = null;             // Called on error
  }

  /**
   * Start listening for speech
   * @param {string} language - Language code (en, hi, kn, etc.)
   */
  start(language = 'en') {
    if (this.isListening) {
      console.warn('Already listening');
      return;
    }

    // Set the language for recognition
    this.currentLanguage = language;
    this.recognition.lang = getLanguageCode(language);
    this.fullTranscript = '';
    
    console.log(`🎤 Starting recognition in ${language} (${this.recognition.lang})`);

    // Event: Partial results (live captions)
    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      // Process all results from this recognition session
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          // This is a finalized phrase
          finalTranscript += transcript + ' ';
          
          // Check if it contains a stop word
          if (containsStopWord(transcript, this.currentLanguage)) {
            console.log('🛑 Stop word detected!');
            
            // Remove the stop word from the transcript
            const cleanedText = removeStopWord(transcript, this.currentLanguage);
            if (cleanedText) {
              this.fullTranscript += cleanedText + ' ';
            }
            
            // Stop recognition
            this.stop();
            return;
          }
          
          this.fullTranscript += transcript + ' ';
        } else {
          // This is partial/interim text (live caption)
          interimTranscript += transcript;
        }
      }

      // Call callbacks with the results
      if (this.onPartialResult && interimTranscript) {
        this.onPartialResult(this.fullTranscript + interimTranscript);
      }
      
      if (this.onFinalResult && finalTranscript) {
        this.onFinalResult(this.fullTranscript.trim());
      }
    };

    // Event: Recognition ended
    this.recognition.onend = () => {
      console.log('🎤 Recognition ended');
      this.isListening = false;
      
      if (this.onEnd) {
        this.onEnd(this.fullTranscript.trim());
      }
    };

    // Event: Recognition error
    this.recognition.onerror = (event) => {
      console.error('🎤 Recognition error:', event.error);
      this.isListening = false;
      
      if (this.onError) {
        this.onError(event.error);
      }
    };

    // Start recognition
    try {
      this.recognition.start();
      this.isListening = true;
    } catch (error) {
      console.error('Failed to start recognition:', error);
      if (this.onError) {
        this.onError(error.message);
      }
    }
  }

  /**
   * Stop listening
   */
  stop() {
    if (!this.isListening) {
      return;
    }

    console.log('🎤 Stopping recognition');
    
    try {
      this.recognition.stop();
      this.isListening = false;
    } catch (error) {
      console.error('Error stopping recognition:', error);
    }
  }

  /**
   * Get the current full transcript
   */
  getTranscript() {
    return this.fullTranscript.trim();
  }

  /**
   * Clear the transcript
   */
  clearTranscript() {
    this.fullTranscript = '';
  }
}