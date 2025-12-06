/**
 * Advanced Speech Engine with Buffer Management
 * Features:
 * - Circular buffer for transcript segments
 * - Automatic punctuation detection
 * - Silence detection for paragraph breaks
 * - Confidence scoring
 * - Smart capitalization
 */

class TranscriptBuffer {
  constructor(maxSegments = 50) {
    this.segments = [];
    this.maxSegments = maxSegments;
  }

  addSegment(text, confidence = 0.85, isFinal = false) {
    const segment = {
      text,
      timestamp: Date.now(),
      confidence,
      isFinal,
      id: `seg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    this.segments.push(segment);

    // Maintain circular buffer
    if (this.segments.length > this.maxSegments) {
      this.segments.shift();
    }

    return segment;
  }

  getFullTranscript() {
    return this.segments
      .filter(seg => seg.isFinal)
      .map(seg => seg.text)
      .join(' ')
      .trim();
  }

  getLastNSegments(n) {
    return this.segments.slice(-n);
  }

  clearOldSegments(olderThan = 300000) { // 5 minutes default
    const cutoff = Date.now() - olderThan;
    this.segments = this.segments.filter(seg => seg.timestamp > cutoff);
  }

  clear() {
    this.segments = [];
  }

  exportAsText() {
    return this.getFullTranscript();
  }

  exportAsJSON() {
    return JSON.stringify({
      segments: this.segments,
      fullText: this.getFullTranscript(),
      exportedAt: new Date().toISOString(),
      segmentCount: this.segments.length
    }, null, 2);
  }

  getStats() {
    const final = this.segments.filter(s => s.isFinal);
    const avgConfidence = final.reduce((sum, s) => sum + s.confidence, 0) / final.length || 0;
    
    return {
      totalSegments: this.segments.length,
      finalSegments: final.length,
      averageConfidence: avgConfidence,
      wordCount: this.getFullTranscript().split(/\s+/).length,
      oldestSegment: this.segments[0]?.timestamp,
      newestSegment: this.segments[this.segments.length - 1]?.timestamp
    };
  }
}

class AdvancedSpeechEngine {
  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      throw new Error('Speech Recognition not supported in this browser');
    }
    
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;
    
    this.buffer = new TranscriptBuffer();
    this.isListening = false;
    this.currentLanguage = 'en';
    this.lastSpeechTime = Date.now();
    this.silenceTimeout = null;
    this.pauseThreshold = 2000; // 2 seconds
    
    // Callbacks
    this.onPartialResult = null;
    this.onFinalResult = null;
    this.onParagraphBreak = null;
    this.onEnd = null;
    this.onError = null;
    this.onCommandDetected = null;
  }

  start(language = 'en') {
    if (this.isListening) {
      console.warn('Already listening');
      return;
    }

    this.currentLanguage = language;
    this.recognition.lang = this.getLanguageCode(language);
    this.buffer.clear();
    this.lastSpeechTime = Date.now();
    
    this.setupRecognitionHandlers();
    
    try {
      this.recognition.start();
      this.isListening = true;
      console.log(`🎤 Started listening in ${language}`);
    } catch (error) {
      console.error('Failed to start recognition:', error);
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
      
      if (this.silenceTimeout) {
        clearTimeout(this.silenceTimeout);
      }
      
      console.log('🎤 Stopped listening');
    } catch (error) {
      console.error('Error stopping recognition:', error);
    }
  }

  setupRecognitionHandlers() {
    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      let confidence = 0;

      // Process results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        confidence = result[0].confidence;

        if (result.isFinal) {
          // Apply smart capitalization and punctuation
          const processedText = this.processText(transcript);
          
          // Add to buffer
          this.buffer.addSegment(processedText, confidence, true);
          finalTranscript += processedText + ' ';
          
          // Reset silence timer
          this.lastSpeechTime = Date.now();
          this.startSilenceDetection();
        } else {
          interimTranscript += transcript;
        }
      }

      // Callbacks
      if (this.onPartialResult && interimTranscript) {
        const fullText = this.buffer.getFullTranscript() + ' ' + interimTranscript;
        this.onPartialResult(fullText.trim(), interimTranscript);
      }
      
      if (this.onFinalResult && finalTranscript) {
        this.onFinalResult(this.buffer.getFullTranscript());
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      
      if (this.onEnd) {
        this.onEnd(this.buffer.getFullTranscript());
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
      
      if (this.onError) {
        this.onError(event.error);
      }
    };
  }

  startSilenceDetection() {
    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout);
    }

    this.silenceTimeout = setTimeout(() => {
      const silenceDuration = Date.now() - this.lastSpeechTime;
      
      if (silenceDuration >= this.pauseThreshold) {
        // Paragraph break detected
        if (this.onParagraphBreak) {
          this.onParagraphBreak();
        }
        
        // Add paragraph marker
        this.buffer.addSegment('\n\n', 1.0, true);
      }
    }, this.pauseThreshold);
  }

  processText(text) {
    // Smart capitalization
    text = text.trim();
    
    // Capitalize first letter
    if (text.length > 0) {
      text = text.charAt(0).toUpperCase() + text.slice(1);
    }
    
    // Auto-punctuation at end if missing
    const lastChar = text.slice(-1);
    if (!/[.!?]/.test(lastChar)) {
      // Check if it seems like end of sentence
      if (text.length > 20 && this.seemsComplete(text)) {
        text += '.';
      }
    }
    
    return text;
  }

  seemsComplete(text) {
    // Heuristic to check if sentence seems complete
    const words = text.toLowerCase().split(/\s+/);
    const lastWord = words[words.length - 1];
    
    // Check for sentence-ending patterns
    const endingWords = ['done', 'finished', 'complete', 'end', 'stop'];
    return endingWords.some(w => lastWord.includes(w));
  }

  getLanguageCode(simpleLang) {
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
    return codes[simpleLang] || 'en-US';
  }

  getTranscript() {
    return this.buffer.getFullTranscript();
  }

  getBuffer() {
    return this.buffer;
  }

  clearTranscript() {
    this.buffer.clear();
  }

  exportTranscript(format = 'text') {
    return format === 'json' 
      ? this.buffer.exportAsJSON()
      : this.buffer.exportAsText();
  }

  getStats() {
    return this.buffer.getStats();
  }
}

// Export for use in components
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AdvancedSpeechEngine, TranscriptBuffer };
}