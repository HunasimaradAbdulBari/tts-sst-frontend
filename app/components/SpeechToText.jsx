// app/components/SpeechToText.jsx - WITH MANUAL LANGUAGE SELECTION
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { speechToText } from '../lib/apiClient';
import { formatDuration } from '../lib/audioUtils';
import WaveformVisualizer from './WaveformVisualizer';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

const MicIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="8" y1="22" x2="16" y2="22"/>
  </svg>
);

const StopIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="6" width="12" height="12" rx="2"/>
  </svg>
);

const CopyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const GlobeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

// LANGUAGE OPTIONS FOR MANUAL SELECTION
const STT_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', native: 'اردو', flag: '🇵🇰' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া', flag: '🇮🇳' },
];

export default function SpeechToText() {
  const [transcribedText, setTranscribedText] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('hi'); // Default to Hindi
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

  useEffect(() => {
    if (isTranscribing) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 300);
      
      return () => clearInterval(interval);
    }
  }, [isTranscribing]);

  const handleStartRecording = async () => {
    try {
      setTranscribedText('');
      setDetectedLanguage(null);
      setProgress(0);
      await startRecording();
      toast.success(`🎙️ Recording in ${STT_LANGUAGES.find(l => l.code === selectedLanguage)?.name}`, { duration: 2000 });
    } catch (error) {
      toast.error(error.message || 'Failed to start recording');
    }
  };

  const handleStopRecording = () => {
    stopRecording();
    toast.success('⏸️ Recording stopped - ready to transcribe');
  };

  const handleTranscribe = async () => {
    if (!audioBlob) {
      toast.error('No audio to transcribe');
      return;
    }

    setIsTranscribing(true);
    setProgress(10);
    
    const startTime = Date.now();
    
    try {
      console.log('🎙️ Starting transcription with language:', selectedLanguage);
      
      setProgress(30);
      
      const audioFile = new File([audioBlob], 'recording.webm', { 
        type: 'audio/webm' 
      });
      
      setProgress(50);
      
      // Call STT API with manual language selection
      const result = await speechToText(audioFile, selectedLanguage);
      
      setProgress(80);
      
      console.log('✅ Response:', result);
      
      const text = result?.data?.text || result?.text || '';
      const langInfo = result?.data?.detected_language || result?.detected_language;
      
      if (!text || text.trim().length === 0) {
        throw new Error('No text transcribed - try speaking louder or longer');
      }
      
      setProgress(100);
      setTranscribedText(text);
      setDetectedLanguage(langInfo);
      
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      
      toast.success(
        <div>
          <div className="font-bold">✅ Transcribed in {elapsed}s!</div>
          <div className="text-sm">{langInfo?.name || 'Success'}</div>
        </div>,
        { duration: 3000 }
      );
      
    } catch (error) {
      console.error('❌ Transcription error:', error);
      setProgress(0);
      toast.error(
        <div>
          <div className="font-bold">Transcription failed</div>
          <div className="text-sm">{error.message}</div>
        </div>,
        { duration: 4000 }
      );
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleCopy = () => {
    if (transcribedText) {
      navigator.clipboard.writeText(transcribedText);
      toast.success('📋 Text copied!');
    }
  };

  const handleClear = () => {
    setTranscribedText('');
    setDetectedLanguage(null);
    setProgress(0);
    resetRecording();
    toast.success('🗑️ Cleared');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      {/* Main Recording Card */}
      <div className="glass rounded-3xl shadow-xl p-8 border border-gray-200/50 dark:border-slate-700/50">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="w-10 h-10 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 rounded-xl flex items-center justify-center mr-3"
            >
              <MicIcon />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 dark:from-red-400 dark:to-pink-400 bg-clip-text text-transparent">
                Speech to Text
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Select your language and speak
              </p>
            </div>
          </div>

          {/* Language Selector */}
          <div className="relative">
            <motion.button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="flex items-center gap-2 px-4 py-2 glass rounded-xl border border-indigo-200/50 dark:border-indigo-700/50 hover:shadow-lg transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-2xl">{STT_LANGUAGES.find(l => l.code === selectedLanguage)?.flag}</span>
              <div className="text-left">
                <p className="text-xs font-semibold text-gray-900 dark:text-white">
                  {STT_LANGUAGES.find(l => l.code === selectedLanguage)?.name}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  {STT_LANGUAGES.find(l => l.code === selectedLanguage)?.native}
                </p>
              </div>
              <svg className={`w-4 h-4 transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </motion.button>

            <AnimatePresence>
              {showLanguageDropdown && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40"
                    onClick={() => setShowLanguageDropdown(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-2 w-64 glass rounded-2xl shadow-2xl border border-gray-200/50 dark:border-slate-700/50 overflow-hidden z-50 max-h-80 overflow-y-auto"
                  >
                    {STT_LANGUAGES.map((lang) => (
                      <motion.button
                        key={lang.code}
                        onClick={() => {
                          setSelectedLanguage(lang.code);
                          setShowLanguageDropdown(false);
                          toast.success(`Selected: ${lang.name}`);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all ${
                          selectedLanguage === lang.code ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''
                        }`}
                        whileHover={{ x: 2 }}
                      >
                        <span className="text-2xl">{lang.flag}</span>
                        <div className="flex-1 text-left">
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
                      </motion.button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Waveform */}
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

        {/* Recording Button */}
        <div className="flex flex-col items-center gap-6">
          <motion.button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            className={`relative w-32 h-32 rounded-full flex items-center justify-center text-white shadow-2xl transition-all ${
              isRecording
                ? 'bg-gradient-to-br from-red-500 to-pink-600'
                : 'bg-gradient-to-br from-indigo-600 to-purple-600'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isTranscribing}
            animate={isRecording ? { 
              boxShadow: [
                '0 0 0 0 rgba(239, 68, 68, 0.7)', 
                '0 0 0 20px rgba(239, 68, 68, 0)'
              ] 
            } : {}}
            transition={isRecording ? { duration: 1.5, repeat: Infinity } : {}}
          >
            {isRecording ? <StopIcon /> : <MicIcon />}
          </motion.button>

          {/* Duration/Status */}
          <AnimatePresence mode="wait">
            {isRecording ? (
              <motion.div
                key="recording"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-3xl font-mono font-bold text-red-600 dark:text-red-400 tabular-nums"
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
                Ready - click to transcribe in {STT_LANGUAGES.find(l => l.code === selectedLanguage)?.name}
              </motion.p>
            ) : (
              <motion.p
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-medium text-gray-600 dark:text-gray-400"
              >
                Click microphone to record in {STT_LANGUAGES.find(l => l.code === selectedLanguage)?.name}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Transcribe Button */}
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
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-2xl font-semibold transition-all disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
              >
                {isTranscribing ? (
                  <>
                    <LoadingSpinner type="pulse" size="sm" color="#ffffff" />
                    <div className="flex flex-col items-start">
                      <span>Transcribing... {Math.round(progress)}%</span>
                    </div>
                  </>
                ) : (
                  <>
                    <SendIcon />
                    <span>Transcribe in {STT_LANGUAGES.find(l => l.code === selectedLanguage)?.name}</span>
                  </>
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
      </div>

      {/* Language Detection Badge */}
      <AnimatePresence>
        {detectedLanguage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex justify-center"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 glass rounded-2xl shadow-lg border border-emerald-200/50 dark:border-emerald-700/50">
              <GlobeIcon />
              <div className="text-left">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Transcribed Language
                </p>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {detectedLanguage.name} ({detectedLanguage.native_name})
                </p>
              </div>
              <div className="flex items-center gap-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  {(detectedLanguage.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transcription Result */}
      <AnimatePresence mode="wait">
        {transcribedText && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            className="glass rounded-3xl shadow-xl p-8 border border-gray-200/50 dark:border-slate-700/50"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl flex items-center justify-center text-2xl"
                >
                  ✨
                </motion.div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                  Transcription Result
                </h3>
              </div>
              <div className="flex gap-2">
                <motion.button
                  onClick={handleCopy}
                  className="p-2.5 glass text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-all border border-gray-200/50 dark:border-slate-700/50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Copy"
                >
                  <CopyIcon />
                </motion.button>
                <motion.button
                  onClick={handleClear}
                  className="p-2.5 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 text-red-600 dark:text-red-400 rounded-xl hover:shadow-lg transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Clear"
                >
                  🗑️
                </motion.button>
              </div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="p-6 glass rounded-2xl min-h-[120px] max-h-[400px] overflow-y-auto border border-gray-200/50 dark:border-slate-700/50"
            >
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed text-lg">
                {transcribedText}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}