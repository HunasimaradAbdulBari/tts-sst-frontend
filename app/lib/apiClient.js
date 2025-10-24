import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS, ERROR_MESSAGES } from './constants';

// Create axios instance - calls Next.js API routes
const apiClient = axios.create({
  baseURL: '/api', // Changed to call Next.js API routes
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});


// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching
    config.params = {
      ...config.params,
      _t: Date.now(),
    };
    
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    console.error('[API Response Error]', error);
    
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.message || error.response.data?.error;
      
      switch (status) {
        case 400:
          throw new Error(message || 'Bad request');
        case 401:
          throw new Error('Unauthorized');
        case 403:
          throw new Error('Forbidden');
        case 404:
          throw new Error(ERROR_MESSAGES.NOT_FOUND);
        case 429:
          throw new Error('Too many requests. Please try again later.');
        case 500:
          throw new Error(ERROR_MESSAGES.SERVER_ERROR);
        default:
          throw new Error(message || ERROR_MESSAGES.GENERIC);
      }
    } else if (error.request) {
      // Request made but no response
      throw new Error(ERROR_MESSAGES.NETWORK);
    } else {
      // Error in request setup
      throw new Error(error.message || ERROR_MESSAGES.GENERIC);
    }
  }
);

// API Methods

/**
 * Speech-to-Text API call
 * @param {File} audioFile - Audio file to transcribe
 * @param {string} language - Language code
 * @returns {Promise<Object>} Transcription result
 */
export const speechToText = async (audioFile, language = 'en') => {
  const formData = new FormData();
  formData.append('audio', audioFile);
  formData.append('language', language);

  const response = await apiClient.post(API_ENDPOINTS.STT, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * Text-to-Speech API call
 * @param {string} text - Text to convert to speech
 * @param {string} language - Language code
 * @param {Object} options - Additional options (speed, pitch)
 * @returns {Promise<Object>} Audio URL and metadata
 */
export const textToSpeech = async (text, language = 'en', options = {}) => {
  const response = await apiClient.post(API_ENDPOINTS.TTS, {
    text,
    language,
    ...options,
  });

  return response.data;
};

/**
 * Health check API call
 * @returns {Promise<Object>} Health status
 */
export const checkHealth = async () => {
  const response = await apiClient.get(API_ENDPOINTS.HEALTH);
  return response.data;
};

/**
 * Get supported languages
 * @returns {Promise<Array>} List of supported languages
 */
export const getLanguages = async () => {
  const response = await apiClient.get(API_ENDPOINTS.LANGUAGES);
  return response.data;
};

/**
 * Download audio file
 * @param {string} url - Audio file URL
 * @param {string} filename - Desired filename
 */
export const downloadAudio = async (url, filename = 'audio.mp3') => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Download failed:', error);
    throw new Error('Failed to download audio file');
  }
};

export default apiClient;