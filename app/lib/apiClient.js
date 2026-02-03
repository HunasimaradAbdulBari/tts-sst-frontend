import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS, ERROR_MESSAGES } from './constants';

// Create axios instance - NO TIMEOUT, UNLIMITED SIZE
const apiClient = axios.create({
  baseURL: '/',
  timeout: 0, // NO TIMEOUT - UNLIMITED
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
 * Speech to Text API - UNLIMITED SIZE, KANNADA OPTIMIZED
 */
export const speechToText = async (audioBlob, language = 'kn') => {
  try {
    console.log(`🎙️ [API Client] Starting STT for ${language}`);
    console.log(`📦 File size: ${(audioBlob.size / 1024 / 1024).toFixed(2)} MB`);
    
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    
    // Always send language (default: Kannada)
    formData.append('language', language);
    console.log(`🎯 [API Client] Language: ${language}`);
    
    const response = await apiClient.post('/api/stt', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 0, // NO TIMEOUT
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`📤 Upload progress: ${percentCompleted}%`);
      },
    });
    
    console.log('✅ [API Client] STT Success');
    return response.data;
  } catch (error) {
    console.error('❌ [API Client] STT Error:', error);
    throw error;
  }
};

/**
 * Text to Speech API - AUTO LANGUAGE DETECTION
 */
export const textToSpeech = async (text) => {
  try {
    console.log(`🔊 [API Client] Starting TTS`);
    
    const response = await apiClient.post('/api/tts', {
      text
    }, {
      timeout: 0,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    
    console.log('✅ [API Client] TTS Success');
    return response.data;
  } catch (error) {
    console.error('❌ [API Client] TTS Error:', error);
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