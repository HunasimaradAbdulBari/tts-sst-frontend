'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { speechToText } from '../lib/apiClient';
import { formatDuration } from '../lib/audioUtils';
import WaveformVisualizer from './WaveformVisualizer';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

// SVG Icons
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

const TrashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
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

export default function SpeechToText() {
  const [transcribedText, setTranscribedText] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  
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
      setTranscribedText('');
      setDetectedLanguage(null);
      await startRecording();
      toast.success('🎙️ Recording started - speak in any language');
    } catch (error) {
      toast.error(error.message || 'Failed to start recording');
    }
  };

  const handleStopRecording = () => {
    stopRecording();
    toast.success('⏸️ Recording stopped');
  };

  const handleTranscribe = async () => {
    if (!audioBlob) {
      toast.error('No audio to transcribe');
      return;
    }

    setIsTranscribing(true);
    try {
      console.log('='.repeat(60));
      console.log('🎙️ [STT Component] Starting transcription with AUTO-DETECTION...');
      console.log('Audio blob size:', audioBlob.size);
      console.log('='.repeat(60));
      
      const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
      
      console.log('📁 [STT Component] Created audio file:');
      console.log('  - Name:', audioFile.name);
      console.log('  - Size:', audioFile.size, 'bytes');
      
      // NO language parameter - auto-detection
      const result = await speechToText(audioFile);
      
      console.log('✅ [STT Component] Response received:');
      console.log(JSON.stringify(result, null, 2));
      
      // Extract text and detected language
      let extractedText = '';
      let extractedLanguage = null;
      
      const possibleTextPaths = [
        result?.data?.text,
        result?.data?.transcription,
        result?.text,
        result?.transcription,
      ];
      
      for (const path of possibleTextPaths) {
        if (path && typeof path === 'string') {
          extractedText = path;
          break;
        }
      }
      
      // Extract detected language
      extractedLanguage = result?.data?.detected_language || 
                         result?.detected_language;
      
      console.log('📝 [STT Component] Extracted text:', extractedText);
      console.log('🌐 [STT Component] Detected language:', extractedLanguage);
      
      if (!extractedText) {
        throw new Error('No transcription received from server');
      }
      
      if (extractedText.trim().length === 0) {
        throw new Error('Transcription is empty. Try speaking louder or longer.');
      }
      
      setTranscribedText(extractedText);
      setDetectedLanguage(extractedLanguage);
      
      toast.success(
        `✅ Transcribed in ${extractedLanguage?.name || 'detected language'}!`,
        { duration: 3000 }
      );
      console.log('='.repeat(60));
      
    } catch (error) {
      console.error('❌ [STT Component] Error:', error);
      toast.error(error.message || 'Transcription failed');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleCopy = () => {
    if (transcribedText) {
      navigator.clipboard.writeText(transcribedText);
      toast.success('📋 Text copied to clipboard!');
    }
  };

  const handleClear = () => {
    setTranscribedText('');
    setDetectedLanguage(null);
    resetRecording();
    toast.success('🗑️ Cleared');
  };

  const handleUseText = () => {
    if (transcribedText) {
      localStorage.setItem('pendingTTSText', transcribedText);
      toast.success('✨ Text ready! Switch to Text-to-Speech tab.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      {/* Recording Card */}
      <div className="glass rounded-3xl shadow-xl p-8 border border-gray-200/50 dark:border-slate-700/50">
        <div className="flex items-center justify-center mb-8">
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
              Speak in any language - automatic detection
            </p>
          </div>
        </div>

        {/* Waveform Visualizer */}
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
            animate={isRecording ? { boxShadow: ['0 0 0 0 rgba(239, 68, 68, 0.7)', '0 0 0 20px rgba(239, 68, 68, 0)'] } : {}}
            transition={isRecording ? { duration: 1.5, repeat: Infinity } : {}}
          >
            {isRecording ? <StopIcon /> : <MicIcon />}
          </motion.button>

          {/* Duration */}
          <AnimatePresence>
            {isRecording && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-3xl font-mono font-bold text-gray-700 dark:text-gray-300 tabular-nums"
              >
                {formatDuration(duration)}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-medium text-gray-600 dark:text-gray-400"
          >
            {isRecording ? (
              <span className="flex items-center gap-2">
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 bg-red-500 rounded-full"
                />
                Recording - language will be auto-detected...
              </span>
            ) : (
              'Click to start recording in any language'
            )}
          </motion.p>
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
                    <span>Detecting language & transcribing...</span>
                  </>
                ) : (
                  <>
                    <SendIcon />
                    <span>Transcribe Audio (Auto-Detect Language)</span>
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Detected Language Badge */}
      <AnimatePresence>
        {detectedLanguage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex justify-center"
          >
            <div className="inline-flex items-center gap-3 px-5 py-3 glass rounded-2xl shadow-lg border border-emerald-200/50 dark:border-emerald-700/50">
              <GlobeIcon />
              <div className="text-left">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Detected Language
                </p>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {detectedLanguage.name} ({detectedLanguage.native_name})
                </p>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
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
            key="transcription-result"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
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
                  title="Copy to clipboard"
                >
                  <CopyIcon />
                </motion.button>
                <motion.button
                  onClick={handleClear}
                  className="p-2.5 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 text-red-600 dark:text-red-400 rounded-xl hover:shadow-lg transition-all border border-red-200/50 dark:border-red-700/50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Clear"
                >
                  <TrashIcon />
                </motion.button>
              </div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="p-6 glass rounded-2xl min-h-[120px] max-h-[400px] overflow-y-auto border border-gray-200/50 dark:border-slate-700/50 custom-scrollbar"
            >
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed text-lg font-light">
                {transcribedText}
              </p>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={handleUseText}
              className="w-full mt-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <SendIcon />
              <span>Use for Text-to-Speech</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}