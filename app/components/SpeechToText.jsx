'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMicrophone, HiStop } from 'react-icons/hi';
import { FiCopy, FiTrash2 } from 'react-icons/fi';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useLanguage } from '../context/LanguageContext';
import { speechToText } from '../lib/apiClient';
import { formatDuration } from '../lib/audioUtils';
import WaveformVisualizer from './WaveformVisualizer';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

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
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 backdrop-blur-lg">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          🎙️ Speech to Text
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
            className={`w-24 h-24 rounded-full flex items-center justify-center text-white shadow-2xl ${
              isRecording
                ? 'bg-gradient-to-br from-red-500 to-pink-500 animate-pulse'
                : 'bg-gradient-to-br from-blue-500 to-purple-500'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            disabled={isTranscribing}
          >
            {isRecording ? (
              <HiStop className="w-10 h-10" />
            ) : (
              <HiMicrophone className="w-10 h-10" />
            )}
          </motion.button>

          {/* Duration */}
          {isRecording && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-2xl font-mono font-bold text-gray-700 dark:text-gray-300"
            >
              {formatDuration(duration)}
            </motion.div>
          )}

          {/* Status Text */}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isRecording ? 'Recording...' : 'Click to start recording'}
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
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTranscribing ? (
                <LoadingSpinner type="pulse" size="sm" color="#ffffff" text="Transcribing..." />
              ) : (
                '✨ Transcribe Audio'
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
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                📝 Transcription
              </h3>
              <div className="flex gap-2">
                <motion.button
                  onClick={handleCopy}
                  className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiCopy className="w-5 h-5" />
                </motion.button>
                <motion.button
                  onClick={handleClear}
                  className="p-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiTrash2 className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl min-h-[100px] max-h-[300px] overflow-y-auto">
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