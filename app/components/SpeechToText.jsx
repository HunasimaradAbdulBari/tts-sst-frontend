'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useLanguage } from '../context/LanguageContext';
import { speechToText } from '../lib/apiClient';
import { formatDuration } from '../lib/audioUtils';
import WaveformVisualizer from './WaveformVisualizer';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

// SVG Icons
const MicIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="8" y1="22" x2="16" y2="22"/>
  </svg>
);

const StopIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
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

export default function SpeechToText() {
  const [transcribedText, setTranscribedText] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const { currentLanguage } = useLanguage();
  
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
      toast.success('Recording started');
    } catch (error) {
      toast.error(error.message || 'Failed to start recording');
    }
  };

  const handleStopRecording = () => {
    stopRecording();
    toast.success('Recording stopped');
  };

  const handleTranscribe = async () => {
    if (!audioBlob) {
      toast.error('No audio to transcribe');
      return;
    }

    setIsTranscribing(true);
    try {
      const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
      const result = await speechToText(audioFile, currentLanguage.code);
      setTranscribedText(result.text || result.transcription || '');
      toast.success('Transcription completed!');
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error(error.message || 'Transcription failed');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transcribedText);
    toast.success('Text copied to clipboard!');
  };

  const handleClear = () => {
    setTranscribedText('');
    resetRecording();
    toast.success('Cleared');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl mx-auto space-y-6"
    >
      {/* Recording Card */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
          Speech to Text
        </h2>

        {/* Waveform Visualizer */}
        {isRecording && (
          <div className="mb-6">
            <WaveformVisualizer audioLevel={audioLevel} isActive={isRecording} />
          </div>
        )}

        {/* Recording Button */}
        <div className="flex flex-col items-center gap-4">
          <motion.button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            className={`w-24 h-24 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${
              isRecording
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isTranscribing}
          >
            {isRecording ? <StopIcon /> : <MicIcon />}
          </motion.button>

          {/* Duration */}
          {isRecording && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-2xl font-mono font-semibold text-gray-700 dark:text-gray-300"
            >
              {formatDuration(duration)}
            </motion.div>
          )}

          {/* Status Text */}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isRecording ? 'Recording in progress...' : 'Click to start recording'}
          </p>
        </div>

        {/* Transcribe Button */}
        {audioBlob && !isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <button
              onClick={handleTranscribe}
              disabled={isTranscribing}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isTranscribing ? (
                <LoadingSpinner type="pulse" size="sm" color="#ffffff" text="Transcribing..." />
              ) : (
                'Transcribe Audio'
              )}
            </button>
          </motion.div>
        )}
      </div>

      {/* Transcription Result */}
      <AnimatePresence>
        {transcribedText && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Transcription Result
              </h3>
              <div className="flex gap-2">
                <motion.button
                  onClick={handleCopy}
                  className="p-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Copy to clipboard"
                >
                  <CopyIcon />
                </motion.button>
                <motion.button
                  onClick={handleClear}
                  className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Clear"
                >
                  <TrashIcon />
                </motion.button>
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg min-h-[100px] max-h-[300px] overflow-y-auto border border-gray-200 dark:border-slate-700">
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                {transcribedText}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}