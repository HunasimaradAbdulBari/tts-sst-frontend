import { AUDIO_CONFIG } from './constants';

/**
 * Check if browser supports audio recording
 * @returns {boolean}
 */
export const isAudioRecordingSupported = () => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

/**
 * Request microphone permission
 * @returns {Promise<MediaStream>}
 */
export const requestMicrophonePermission = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      } 
    });
    return stream;
  } catch (error) {
    console.error('Microphone permission denied:', error);
    throw new Error('Microphone permission denied');
  }
};

/**
 * Validate audio file
 * @param {File} file - Audio file to validate
 * @returns {Object} Validation result
 */
export const validateAudioFile = (file) => {
  const errors = [];

  // Check file size
  if (file.size > AUDIO_CONFIG.MAX_FILE_SIZE) {
    errors.push(`File size exceeds ${AUDIO_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB limit`);
  }

  // Check file type
  if (!AUDIO_CONFIG.SUPPORTED_FORMATS.includes(file.type)) {
    errors.push('Unsupported audio format');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Convert blob to base64
 * @param {Blob} blob - Blob to convert
 * @returns {Promise<string>}
 */
export const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Format duration from seconds to mm:ss
 * @param {number} seconds - Duration in seconds
 * @returns {string}
 */
export const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Get audio duration from file
 * @param {File} file - Audio file
 * @returns {Promise<number>}
 */
export const getAudioDuration = (file) => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.onloadedmetadata = () => {
      resolve(audio.duration);
    };
    audio.onerror = () => {
      reject(new Error('Failed to load audio metadata'));
    };
    audio.src = URL.createObjectURL(file);
  });
};

/**
 * Calculate audio level from analyser data
 * @param {Uint8Array} dataArray - Audio frequency data
 * @returns {number} Audio level (0-100)
 */
export const calculateAudioLevel = (dataArray) => {
  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) {
    sum += dataArray[i];
  }
  const average = sum / dataArray.length;
  return Math.min(100, (average / 255) * 100);
};

/**
 * Create audio context
 * @returns {AudioContext}
 */
export const createAudioContext = () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  return new AudioContext();
};

/**
 * Convert audio buffer to WAV blob
 * @param {AudioBuffer} buffer - Audio buffer
 * @returns {Blob}
 */
export const audioBufferToWav = (buffer) => {
  const length = buffer.length * buffer.numberOfChannels * 2 + 44;
  const arrayBuffer = new ArrayBuffer(length);
  const view = new DataView(arrayBuffer);
  const channels = [];
  let offset = 0;
  let pos = 0;

  // Write WAV header
  const setUint16 = (data) => {
    view.setUint16(pos, data, true);
    pos += 2;
  };
  const setUint32 = (data) => {
    view.setUint32(pos, data, true);
    pos += 4;
  };

  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"
  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(buffer.numberOfChannels);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels);
  setUint16(buffer.numberOfChannels * 2);
  setUint16(16);
  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4);

  // Write interleaved data
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < length) {
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
};

/**
 * Detect silence in audio stream
 * @param {AnalyserNode} analyser - Audio analyser node
 * @param {number} threshold - Silence threshold (0-255)
 * @returns {boolean}
 */
export const detectSilence = (analyser, threshold = 10) => {
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);

  let sum = 0;
  for (let i = 0; i < bufferLength; i++) {
    sum += dataArray[i];
  }
  const average = sum / bufferLength;

  return average < threshold;
};

/**
 * Apply fade in/out effect to audio
 * @param {AudioBuffer} buffer - Audio buffer
 * @param {number} fadeTime - Fade duration in seconds
 * @returns {AudioBuffer}
 */
export const applyFade = (buffer, fadeTime = 0.5) => {
  const sampleRate = buffer.sampleRate;
  const fadeSamples = sampleRate * fadeTime;

  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const channelData = buffer.getChannelData(channel);

    // Fade in
    for (let i = 0; i < fadeSamples; i++) {
      channelData[i] *= i / fadeSamples;
    }

    // Fade out
    for (let i = 0; i < fadeSamples; i++) {
      const idx = channelData.length - i - 1;
      channelData[idx] *= i / fadeSamples;
    }
  }

  return buffer;
};