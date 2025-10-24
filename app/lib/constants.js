// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// API Endpoints - These call Next.js API routes which forward to Express
export const API_ENDPOINTS = {
  STT: '/api/stt',
  TTS: '/api/tts',
  HEALTH: '/api/health',
  LANGUAGES: '/api/languages',
};

// Audio Configuration
export const AUDIO_CONFIG = {
  MAX_DURATION: parseInt(process.env.NEXT_PUBLIC_MAX_AUDIO_DURATION) || 300, // 5 minutes
  MAX_FILE_SIZE: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE) || 10485760, // 10MB
  SAMPLE_RATE: 44100,
  CHANNELS: 1,
  BIT_DEPTH: 16,
  SUPPORTED_FORMATS: ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/m4a', 'audio/ogg'],
  MIME_TYPE: 'audio/webm;codecs=opus',
};

// Recording States
export const RECORDING_STATES = {
  IDLE: 'idle',
  RECORDING: 'recording',
  PAUSED: 'paused',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  ERROR: 'error',
};

// Supported Languages
export const LANGUAGES = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    voice: 'en-IN-NeerjaNeural',
    whisperCode: 'en',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    voice: 'hi-IN-SwaraNeural',
    whisperCode: 'hi',
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    flag: '🇮🇳',
    voice: 'kn-IN-GaganNeural',
    whisperCode: 'kn',
  },
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    flag: '🇵🇰',
    voice: 'ur-PK-AsadNeural',
    whisperCode: 'ur',
  },
];

// Toast Messages
export const TOAST_MESSAGES = {
  STT_SUCCESS: 'Transcription completed successfully!',
  STT_ERROR: 'Failed to transcribe audio. Please try again.',
  TTS_SUCCESS: 'Audio generated successfully!',
  TTS_ERROR: 'Failed to generate audio. Please try again.',
  RECORDING_START: 'Recording started...',
  RECORDING_STOP: 'Recording stopped.',
  MIC_PERMISSION_DENIED: 'Microphone permission denied.',
  FILE_TOO_LARGE: 'File size exceeds maximum limit.',
  INVALID_FORMAT: 'Invalid audio format.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
};

// UI Configuration
export const UI_CONFIG = {
  ANIMATION_DURATION: 300,
  TOAST_DURATION: 3000,
  MAX_TEXT_LENGTH: 5000,
  DEBOUNCE_DELAY: 500,
};

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred.',
  NETWORK: 'Network error. Please check your connection.',
  TIMEOUT: 'Request timeout. Please try again.',
  PERMISSION: 'Permission denied.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
};

// App Information
export const APP_INFO = {
  NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Multilingual Speech App',
  VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  DESCRIPTION: 'Professional multilingual Text-to-Speech and Speech-to-Text application',
  AUTHOR: 'Your Name',
  GITHUB: 'https://github.com/yourusername/speech-app',
};

// Feature Flags
export const FEATURES = {
  ENABLE_PWA: process.env.NEXT_PUBLIC_ENABLE_PWA === 'true',
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  ENABLE_DARK_MODE: true,
  ENABLE_WAVEFORM: true,
  ENABLE_VOICE_DETECTION: true,
};