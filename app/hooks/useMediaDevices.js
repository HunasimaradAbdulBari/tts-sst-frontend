'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing media devices
 * @returns {Object} Media devices state and methods
 */
export const useMediaDevices = () => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('prompt'); // 'granted', 'denied', 'prompt'
  const [loading, setLoading] = useState(true);

  // Check if browser supports media devices
  useEffect(() => {
    const supported = !!(
      navigator.mediaDevices && 
      navigator.mediaDevices.getUserMedia
    );
    setIsSupported(supported);
    setLoading(false);
  }, []);

  // Get available audio input devices
  const getDevices = useCallback(async () => {
    if (!isSupported) return [];

    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = deviceList.filter(device => device.kind === 'audioinput');
      setDevices(audioInputs);
      
      // Set default device if none selected
      if (!selectedDevice && audioInputs.length > 0) {
        setSelectedDevice(audioInputs[0].deviceId);
      }
      
      return audioInputs;
    } catch (error) {
      console.error('Error enumerating devices:', error);
      return [];
    }
  }, [isSupported, selectedDevice]);

  // Request microphone permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      throw new Error('Media devices not supported');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      setPermission('granted');
      
      // Stop the stream immediately (we just needed permission)
      stream.getTracks().forEach(track => track.stop());
      
      // Now get the device list
      await getDevices();
      
      return true;
    } catch (error) {
      console.error('Permission denied:', error);
      setPermission('denied');
      throw error;
    }
  }, [isSupported, getDevices]);

  // Check permission status
  useEffect(() => {
    if (!isSupported) return;

    const checkPermission = async () => {
      try {
        const result = await navigator.permissions.query({ name: 'microphone' });
        setPermission(result.state);
        
        // Listen for permission changes
        result.addEventListener('change', () => {
          setPermission(result.state);
        });
      } catch (error) {
        console.log('Permission API not supported, using fallback');
      }
    };

    checkPermission();
  }, [isSupported]);

  // Get devices on mount if permission already granted
  useEffect(() => {
    if (permission === 'granted') {
      getDevices();
    }
  }, [permission, getDevices]);

  return {
    devices,
    selectedDevice,
    setSelectedDevice,
    isSupported,
    permission,
    loading,
    requestPermission,
    refreshDevices: getDevices,
  };
};