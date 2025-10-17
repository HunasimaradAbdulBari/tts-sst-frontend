'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { AUDIO_CONFIG, RECORDING_STATES } from '../lib/constants';

/**
 * Custom hook for audio recording with advanced features
 * @returns {Object} Recording state and methods
 */
export const useAudioRecorder = () => {
  const [recordingState, setRecordingState] = useState(RECORDING_STATES.IDLE);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Initialize audio context and analyser
  const initializeAudioAnalysis = useCallback((stream) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Update audio level in real-time
      const updateAudioLevel = () => {
        analyserRef.current.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const level = Math.min(100, (average / 255) * 100);
        
        setAudioLevel(level);
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };

      updateAudioLevel();
    } catch (err) {
      console.error('Error initializing audio analysis:', err);
    }
  }, []);

  // Start recording
  const startRecording = useCallback(async (deviceId = null) => {
    try {
      setError(null);
      audioChunksRef.current = [];

      // Get media stream
      const constraints = {
        audio: deviceId 
          ? { deviceId: { exact: deviceId }, echoCancellation: true, noiseSuppression: true }
          : { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Initialize audio analysis
      initializeAudioAnalysis(stream);

      // Create media recorder
      const mimeType = MediaRecorder.isTypeSupported(AUDIO_CONFIG.MIME_TYPE)
        ? AUDIO_CONFIG.MIME_TYPE
        : 'audio/webm';

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
        setRecordingState(RECORDING_STATES.COMPLETED);
      };

      mediaRecorderRef.current.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        setError(event.error.message);
        setRecordingState(RECORDING_STATES.ERROR);
      };

      // Start recording
      mediaRecorderRef.current.start(100); // Collect data every 100ms
      setRecordingState(RECORDING_STATES.RECORDING);
      startTimeRef.current = Date.now();

      // Start duration timer
      timerIntervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setDuration(elapsed);

        // Auto-stop if max duration reached
        if (elapsed >= AUDIO_CONFIG.MAX_DURATION) {
          stopRecording();
        }
      }, 100);

    } catch (err) {
      console.error('Error starting recording:', err);
      setError(err.message);
      setRecordingState(RECORDING_STATES.ERROR);
      throw err;
    }
  }, [initializeAudioAnalysis]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === RECORDING_STATES.RECORDING) {
      mediaRecorderRef.current.stop();
      setRecordingState(RECORDING_STATES.PROCESSING);

      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Stop audio analysis
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Stop timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      // Close audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }

      setAudioLevel(0);
    }
  }, [recordingState]);

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === RECORDING_STATES.RECORDING) {
      mediaRecorderRef.current.pause();
      setRecordingState(RECORDING_STATES.PAUSED);
      
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  }, [recordingState]);

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === RECORDING_STATES.PAUSED) {
      mediaRecorderRef.current.resume();
      setRecordingState(RECORDING_STATES.RECORDING);

      // Resume timer
      timerIntervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setDuration(elapsed);

        if (elapsed >= AUDIO_CONFIG.MAX_DURATION) {
          stopRecording();
        }
      }, 100);
    }
  }, [recordingState, stopRecording]);

  // Reset recording
  const resetRecording = useCallback(() => {
    setRecordingState(RECORDING_STATES.IDLE);
    setAudioBlob(null);
    setAudioURL(null);
    setDuration(0);
    setAudioLevel(0);
    setError(null);
    audioChunksRef.current = [];
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  return {
    recordingState,
    audioBlob,
    audioURL,
    duration,
    audioLevel,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    isRecording: recordingState === RECORDING_STATES.RECORDING,
    isPaused: recordingState === RECORDING_STATES.PAUSED,
    isCompleted: recordingState === RECORDING_STATES.COMPLETED,
  };
};