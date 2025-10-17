import { AUDIO_CONFIG, UI_CONFIG, LANGUAGES } from './constants';

/**
 * Validate text input
 * @param {string} text - Text to validate
 * @returns {Object} Validation result
 */
export const validateText = (text) => {
  const errors = [];

  if (!text || text.trim().length === 0) {
    errors.push('Text cannot be empty');
  }

  if (text.length > UI_CONFIG.MAX_TEXT_LENGTH) {
    errors.push(`Text exceeds maximum length of ${UI_CONFIG.MAX_TEXT_LENGTH} characters`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate language code
 * @param {string} languageCode - Language code to validate
 * @returns {boolean}
 */
export const validateLanguage = (languageCode) => {
  return LANGUAGES.some(lang => lang.code === languageCode);
};

/**
 * Validate audio file
 * @param {File} file - File to validate
 * @returns {Object} Validation result
 */
export const validateAudioFile = (file) => {
  const errors = [];

  if (!file) {
    errors.push('No file provided');
    return { valid: false, errors };
  }

  // Check file size
  if (file.size > AUDIO_CONFIG.MAX_FILE_SIZE) {
    errors.push(
      `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum of ${
        AUDIO_CONFIG.MAX_FILE_SIZE / 1024 / 1024
      }MB`
    );
  }

  // Check file type
  const fileType = file.type;
  if (!AUDIO_CONFIG.SUPPORTED_FORMATS.some(format => fileType.includes(format.split('/')[1]))) {
    errors.push(`Unsupported file type: ${fileType}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate audio duration
 * @param {number} duration - Duration in seconds
 * @returns {Object} Validation result
 */
export const validateAudioDuration = (duration) => {
  const errors = [];

  if (duration > AUDIO_CONFIG.MAX_DURATION) {
    errors.push(
      `Audio duration (${Math.floor(duration)}s) exceeds maximum of ${AUDIO_CONFIG.MAX_DURATION}s`
    );
  }

  if (duration < 0.5) {
    errors.push('Audio duration is too short (minimum 0.5s)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Sanitize text input
 * @param {string} text - Text to sanitize
 * @returns {string}
 */
export const sanitizeText = (text) => {
  return text
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[^\w\s\p{L}\p{N}.,!?;:'"()\-]/gu, ''); // Keep only valid characters
};

/**
 * Validate file extension
 * @param {string} filename - Filename to validate
 * @param {Array<string>} allowedExtensions - Allowed extensions
 * @returns {boolean}
 */
export const validateFileExtension = (filename, allowedExtensions = ['.wav', '.mp3', '.webm', '.m4a', '.ogg']) => {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return allowedExtensions.includes(extension);
};

/**
 * Validate email (for future use)
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean}
 */
export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};