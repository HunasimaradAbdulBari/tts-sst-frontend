// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// API Endpoints
export const API_ENDPOINTS = {
  STT: '/api/stt',
  TTS: '/api/tts',
  HEALTH: '/api/health',
  LANGUAGES: '/api/languages',
};

// Audio Configuration - UNLIMITED
export const AUDIO_CONFIG = {
  MAX_DURATION: Infinity, // UNLIMITED DURATION
  MAX_FILE_SIZE: Infinity, // UNLIMITED FILE SIZE
  SAMPLE_RATE: 44100,
  CHANNELS: 1,
  BIT_DEPTH: 16,
  SUPPORTED_FORMATS: ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/m4a', 'audio/ogg', 'audio/mpeg', 'audio/aac', 'audio/flac'],
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

// Supported Languages - KANNADA FIRST
export const LANGUAGES = [
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    flag: '🇮🇳',
    voice: 'kn-IN-GaganNeural',
    whisperCode: 'kn',
  },
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
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇮🇳',
    voice: 'ta-IN-PallaviNeural',
    whisperCode: 'ta',
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    flag: '🇮🇳',
    voice: 'te-IN-ShrutiNeural',
    whisperCode: 'te',
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    flag: '🇮🇳',
    voice: 'ml-IN-SobhanaNeural',
    whisperCode: 'ml',
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    flag: '🇮🇳',
    voice: 'mr-IN-AarohiNeural',
    whisperCode: 'mr',
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    flag: '🇮🇳',
    voice: 'gu-IN-DhwaniNeural',
    whisperCode: 'gu',
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    flag: '🇮🇳',
    voice: 'bn-IN-BashkarNeural',
    whisperCode: 'bn',
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    flag: '🇮🇳',
    voice: 'pa-IN-GaganNeural',
    whisperCode: 'pa',
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

// Toast Messages - UPDATED
export const TOAST_MESSAGES = {
  STT_SUCCESS: 'Transcription completed successfully!',
  STT_ERROR: 'Failed to transcribe audio. Please try again.',
  STT_LARGE_FILE: 'Processing large file... This may take a while.',
  TTS_SUCCESS: 'Audio generated successfully!',
  TTS_ERROR: 'Failed to generate audio. Please try again.',
  RECORDING_START: 'Recording started...',
  RECORDING_STOP: 'Recording stopped.',
  MIC_PERMISSION_DENIED: 'Microphone permission denied.',
  FILE_TOO_LARGE: 'Large file detected. Processing may take time.',
  INVALID_FORMAT: 'Invalid audio format.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UPLOAD_PROGRESS: 'Uploading... Please wait.',
};

// UI Configuration
export const UI_CONFIG = {
  ANIMATION_DURATION: 300,
  TOAST_DURATION: 5000, // Increased for large files
  MAX_TEXT_LENGTH: Infinity, // UNLIMITED
  DEBOUNCE_DELAY: 500,
  SHOW_FILE_SIZE_WARNING: 100, // Show warning above 100MB
};

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred.',
  NETWORK: 'Network error. Please check your connection.',
  TIMEOUT: 'Request timeout. Please try again.',
  PERMISSION: 'Permission denied.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  LARGE_FILE: 'Processing large file. Please be patient.',
};

// App Information
export const APP_INFO = {
  NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Kannada Speech App',
  VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '2.0.0',
  DESCRIPTION: 'Perfect Kannada STT with unlimited file support',
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
  UNLIMITED_FILE_SIZE: true, // NEW
  KANNADA_OPTIMIZED: true, // NEW
};