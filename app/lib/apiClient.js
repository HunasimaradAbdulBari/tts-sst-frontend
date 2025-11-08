// app/lib/apiClient.js - Updated with manual language support
import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS, ERROR_MESSAGES } from './constants';

// Create axios instance - NO TIMEOUT
const apiClient = axios.create({
  baseURL: '/',
  timeout: 0, // NO TIMEOUT
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
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
      const errorMessage = error.response.data?.error || error.response.statusText || 'Server error';
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error('Network error - could not reach server');
    } else {
      throw new Error('Request setup error');
    }
  }
);

/**
 * Text to Speech API call - NO LANGUAGE PARAMETER (Auto-Detection)
 * NO LENGTH LIMIT
 */
export const textToSpeech = async (text) => {
  try {
    const response = await apiClient.post('/api/tts', {
      text
    });
    return response.data;
  } catch (error) {
    console.error('TTS API Error:', error);
    throw error;
  }
};

/**
 * Speech to Text API call - WITH MANUAL LANGUAGE SELECTION
 */
export const speechToText = async (audioBlob, language = null) => {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    
    // Add manual language selection if provided
    if (language) {
      formData.append('language', language);
      console.log(`🎯 [API Client] Manual language selected: ${language}`);
    }
    
    const response = await apiClient.post('/api/stt', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 0, // NO TIMEOUT
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    return response.data;
  } catch (error) {
    console.error('STT API Error:', error);
    throw error;
  }
};

/**
 * Health check API call
 */
export const healthCheck = async () => {
  try {
    const response = await apiClient.get('/api/health');
    return response.data;
  } catch (error) {
    console.error('Health check error:', error);
    throw error;
  }
};

/**
 * Download audio file
 */
export const downloadAudio = async (audioUrl, filename = 'audio.mp3') => {
  try {
    const response = await fetch(audioUrl);
    const blob = await response.blob();
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Download error:', error);
    throw new Error('Failed to download audio file');
  }
};

export default apiClient;