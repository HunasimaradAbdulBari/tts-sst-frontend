'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧', voice: 'en-IN-NeerjaNeural' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', voice: 'hi-IN-SwaraNeural' },
  { code: 'kn', name: 'Kannada', flag: '🇮🇳', voice: 'kn-IN-GaganNeural' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰', voice: 'ur-PK-AsadNeural' },
];

const LanguageContext = createContext({
  currentLanguage: SUPPORTED_LANGUAGES[0],
  setLanguage: () => {},
  languages: SUPPORTED_LANGUAGES,
  recentLanguages: [],
});

export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState(SUPPORTED_LANGUAGES[0]);
  const [recentLanguages, setRecentLanguages] = useState([]);

  useEffect(() => {
    // Load saved language and recent languages from localStorage
    const savedLangCode = localStorage.getItem('selectedLanguage');
    const savedRecent = localStorage.getItem('recentLanguages');

    if (savedLangCode) {
      const lang = SUPPORTED_LANGUAGES.find(l => l.code === savedLangCode);
      if (lang) setCurrentLanguage(lang);
    }

    if (savedRecent) {
      try {
        setRecentLanguages(JSON.parse(savedRecent));
      } catch (e) {
        console.error('Error parsing recent languages:', e);
      }
    }
  }, []);

  const handleSetLanguage = (language) => {
    setCurrentLanguage(language);
    localStorage.setItem('selectedLanguage', language.code);

    // Update recent languages
    const updatedRecent = [
      language,
      ...recentLanguages.filter(l => l.code !== language.code)
    ].slice(0, 3);
    
    setRecentLanguages(updatedRecent);
    localStorage.setItem('recentLanguages', JSON.stringify(updatedRecent));
  };

  return (
    <LanguageContext.Provider 
      value={{ 
        currentLanguage, 
        setLanguage: handleSetLanguage,
        languages: SUPPORTED_LANGUAGES,
        recentLanguages 
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export { SUPPORTED_LANGUAGES };