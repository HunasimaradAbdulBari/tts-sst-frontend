'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { speechToText } from '../lib/apiClient';
import { formatDuration } from '../lib/audioUtils';
import WaveformVisualizer from './WaveformVisualizer';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

const STT_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'ur', name: 'Urdu', native: 'اردو' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া' },
];

export default function SpeechToText() {
  const [transcribedText, setTranscribedText] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('hi');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  
  const {
    isRecording,
    duration,
    audioLevel,
    audioBlob,
    startRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder();

  const handleStartRecording = async () => {
    try {
      await startRecording();
      setTranscribedText('');
      setDetectedLanguage(null);
    } catch (err) {
      toast.error('Failed to start recording. Please check microphone permissions.');
    }
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const handleTranscribe = async () => {
    if (!audioBlob) return;

    setIsTranscribing(true);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90));
    }, 200);

    try {
      const response = await speechToText(audioBlob, selectedLanguage);
      
      clearInterval(progressInterval);
      setProgress(100);

      if (response.text) {
        setTranscribedText(response.text);
        
        if (response.language_info) {
          setDetectedLanguage({
            name: STT_LANGUAGES.find(l => l.code === response.language_info.language)?.name || response.language_info.language,
            confidence: response.language_info.confidence || 1.0
          });
        }
        
        toast.success('Audio transcribed successfully!');
        resetRecording();
      }
    } catch (error) {
      clearInterval(progressInterval);
      toast.error(error.message || 'Failed to transcribe audio');
    } finally {
      setIsTranscribing(false);
      setTimeout(() => setProgress(0), 500);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transcribedText);
    toast.success('Text copied to clipboard!');
  };

  const handleClear = () => {
    setTranscribedText('');
    setDetectedLanguage(null);
    resetRecording();
  };

  return (
    <div className="w-full space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Record Audio
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Select language and start recording
            </p>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {STT_LANGUAGES.find(l => l.code === selectedLanguage)?.name}
              </span>
              <svg className={`w-4 h-4 transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

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
                    {STT_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setSelectedLanguage(lang.code);
                          setShowLanguageDropdown(false);
                          toast.success(`Selected: ${lang.name}`);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors ${
                          selectedLanguage === lang.code ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''
                        }`}
                      >
                        <div className="text-left">
                          <p className={`text-sm font-semibold ${
                            selectedLanguage === lang.code ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'
                          }`}>
                            {lang.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {lang.native}
                          </p>
                        </div>
                        {selectedLanguage === lang.code && (
                          <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
        </div>

        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <WaveformVisualizer audioLevel={audioLevel} isActive={isRecording} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col items-center gap-6">
          <button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={isTranscribing}
            className={`w-24 h-24 rounded-full flex items-center justify-center text-white shadow-xl transition-all ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isRecording ? (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2"/>
              </svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              </svg>
            )}
          </button>

          <AnimatePresence mode="wait">
            {isRecording ? (
              <motion.div
                key="recording"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-3xl font-mono font-bold text-red-600 dark:text-red-400"
              >
                {formatDuration(duration)}
              </motion.div>
            ) : audioBlob ? (
              <motion.p
                key="ready"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2"
              >
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Ready to transcribe
              </motion.p>
            ) : (
              <motion.p
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-medium text-gray-600 dark:text-gray-400"
              >
                Click to start recording
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {audioBlob && !isRecording && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-8"
            >
              <button
                onClick={handleTranscribe}
                disabled={isTranscribing}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-semibold transition-all disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
              >
                {isTranscribing ? (
                  <>
                    <LoadingSpinner type="pulse" size="sm" color="#ffffff" />
                    <span>Transcribing... {Math.round(progress)}%</span>
                  </>
                ) : (
                  <span>Transcribe</span>
                )}
              </button>
              
              {isTranscribing && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mt-2"
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {detectedLanguage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex justify-center"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-emerald-200 dark:border-emerald-700">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Transcribed Language
                </p>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {detectedLanguage.name}
                </p>
              </div>
              <div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  {(detectedLanguage.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {transcribedText && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Transcription Result
              </h3>
              <div className="flex gap-2">
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
              </div>
            </div>
            
            <div className="p-6 bg-gray-50 dark:bg-slate-900 rounded-xl min-h-[120px] max-h-[400px] overflow-y-auto border border-gray-200 dark:border-slate-700">
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed text-lg">
                {transcribedText}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}