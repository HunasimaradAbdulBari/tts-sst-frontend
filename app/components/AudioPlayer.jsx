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
      className="relative w-full max-w-md bg-[#191414] rounded-xl p-4 shadow-2xl"
    >
      <audio ref={audioRef} />

      {/* Top Section */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative w-12 h-12 bg-[#d2d2d2] rounded-md flex items-center justify-center overflow-hidden">
          {isPlaying && (
            <div className="flex gap-0.5 items-center justify-center">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="w-0.5 bg-[#1db954] rounded-full"
                  animate={{
                    height: ['20%', '60%', '90%', '60%', '20%'],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.1,
                  }}
                  style={{ height: '20px' }}
                />
              ))}
            </div>
          )}
          {!isPlaying && (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#1db954">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
            </svg>
          )}
        </div>
        
        <div className="flex-1">
          <p className="text-white text-lg font-bold">Audio Generated</p>
          <p className="text-white text-xs font-medium opacity-80">Voice AI</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div
          onClick={handleSeek}
          className="w-full h-1.5 bg-[#5e5e5e] rounded-full cursor-pointer relative"
        >
          <motion.div
            className="h-full bg-[#1db954] rounded-full relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg" />
          </motion.div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-3">
        <svg 
          onClick={handleDownload}
          className="w-6 h-6 text-white cursor-pointer hover:text-[#1db954] transition-colors" 
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <path clipRule="evenodd" d="M12 21.6a9.6 9.6 0 1 0 0-19.2 9.6 9.6 0 0 0 0 19.2Zm.848-12.352a1.2 1.2 0 0 0-1.696-1.696l-3.6 3.6a1.2 1.2 0 0 0 0 1.696l3.6 3.6a1.2 1.2 0 0 0 1.696-1.696L11.297 13.2H15.6a1.2 1.2 0 1 0 0-2.4h-4.303l1.551-1.552Z" fillRule="evenodd"></path>
        </svg>

        <button
          onClick={togglePlay}
          className="w-12 h-12 bg-white hover:scale-105 transition-transform rounded-full flex items-center justify-center"
        >
          {isPlaying ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#191414">
              <rect x="6" y="4" width="4" height="16"/>
              <rect x="14" y="4" width="4" height="16"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#191414">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          )}
        </button>

        <svg 
          className="w-6 h-6 text-white cursor-pointer hover:text-[#1db954] transition-colors" 
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <path clipRule="evenodd" d="M12 21.6a9.6 9.6 0 1 0 0-19.2 9.6 9.6 0 0 0 0 19.2Zm4.448-10.448-3.6-3.6a1.2 1.2 0 0 0-1.696 1.696l1.551 1.552H8.4a1.2 1.2 0 1 0 0 2.4h4.303l-1.551 1.552a1.2 1.2 0 1 0 1.696 1.696l3.6-3.6a1.2 1.2 0 0 0 0-1.696Z" fillRule="evenodd"></path>
        </svg>
      </div>

      {/* Time Display */}
      <div className="flex justify-between text-white text-xs font-medium">
        <span>{formatDuration(currentTime)}</span>
        <span>{formatDuration(duration)}</span>
      </div>

      {/* Volume Control (Hidden by default, shown on hover) */}
      <div className="absolute top-4 right-4 group">
        <svg 
          className="w-6 h-6 text-white cursor-pointer hover:text-[#1db954] transition-colors" 
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <path clipRule="evenodd" d="M11.26 3.691A1.2 1.2 0 0 1 12 4.8v14.4a1.199 1.199 0 0 1-2.048.848L5.503 15.6H2.4a1.2 1.2 0 0 1-1.2-1.2V9.6a1.2 1.2 0 0 1 1.2-1.2h3.103l4.449-4.448a1.2 1.2 0 0 1 1.308-.26Zm6.328-.176a1.2 1.2 0 0 1 1.697 0A11.967 11.967 0 0 1 22.8 12a11.966 11.966 0 0 1-3.515 8.485 1.2 1.2 0 0 1-1.697-1.697A9.563 9.563 0 0 0 20.4 12a9.565 9.565 0 0 0-2.812-6.788 1.2 1.2 0 0 1 0-1.697Z" fillRule="evenodd"></path>
        </svg>
        
        <div className="absolute right-0 top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-[#282828] rounded-lg p-3 shadow-xl">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24 accent-[#1db954]"
              style={{
                WebkitAppearance: 'none',
                height: '4px',
                background: `linear-gradient(to right, #1db954 0%, #1db954 ${volume * 100}%, #5e5e5e ${volume * 100}%, #5e5e5e 100%)`,
                borderRadius: '2px',
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}