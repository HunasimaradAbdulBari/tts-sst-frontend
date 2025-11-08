'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatDuration } from '../lib/audioUtils';
import toast from 'react-hot-toast';

export default function AudioPlayer({ audioUrl, filename = 'audio.mp3' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [showVolume, setShowVolume] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = audioUrl;

    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    audio.currentTime = percentage * duration;
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
  };

  const handleDownload = async () => {
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
      toast.success('Downloaded');
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-slate-700"
    >
      <audio ref={audioRef} />

      {/* Header with Album Art and Info */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center overflow-hidden shadow-lg">
          {isPlaying && (
            <div className="flex gap-1 items-center justify-center">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-white rounded-full"
                  animate={{
                    height: ['12px', '24px', '12px'],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.1,
                  }}
                />
              ))}
            </div>
          )}
          {!isPlaying && (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
            </svg>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-gray-900 dark:text-white text-lg font-bold truncate">
            Audio Generated
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            Voice AI
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div
          onClick={handleSeek}
          className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full cursor-pointer relative group"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        </div>
        
        {/* Time Display */}
        <div className="flex justify-between mt-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {formatDuration(currentTime)}
          </span>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {formatDuration(duration)}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Volume Control */}
        <div className="relative">
          <button
            onClick={() => setShowVolume(!showVolume)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            title="Volume"
          >
            <svg 
              className="w-5 h-5 text-gray-700 dark:text-gray-300" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M11.26 3.691A1.2 1.2 0 0 1 12 4.8v14.4a1.199 1.199 0 0 1-2.048.848L5.503 15.6H2.4a1.2 1.2 0 0 1-1.2-1.2V9.6a1.2 1.2 0 0 1 1.2-1.2h3.103l4.449-4.448a1.2 1.2 0 0 1 1.308-.26Zm6.328-.176a1.2 1.2 0 0 1 1.697 0A11.967 11.967 0 0 1 22.8 12a11.966 11.966 0 0 1-3.515 8.485 1.2 1.2 0 0 1-1.697-1.697A9.563 9.563 0 0 0 20.4 12a9.565 9.565 0 0 0-2.812-6.788 1.2 1.2 0 0 1 0-1.697Z"/>
            </svg>
          </button>
          
          {/* Volume Slider */}
          {showVolume && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white dark:bg-slate-700 rounded-lg p-3 shadow-xl border border-gray-200 dark:border-slate-600"
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-24 h-2 accent-indigo-500"
                style={{
                  WebkitAppearance: 'none',
                  background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${volume * 100}%, #d1d5db ${volume * 100}%, #d1d5db 100%)`,
                  borderRadius: '4px',
                }}
              />
            </motion.div>
          )}
        </div>

        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
        >
          {isPlaying ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <rect x="6" y="4" width="4" height="16" rx="2"/>
              <rect x="14" y="4" width="4" height="16" rx="2"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          title="Download"
        >
          <svg 
            className="w-5 h-5 text-gray-700 dark:text-gray-300" 
            viewBox="0 0 24 24" 
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </button>
      </div>
    </motion.div>
  );
}