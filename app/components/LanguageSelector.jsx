'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

// SVG Icons
const ChevronDownIcon = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export default function LanguageSelector() {
  const { currentLanguage, setLanguage, languages, recentLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (language) => {
    setLanguage(language);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 transition-colors min-w-[220px]"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="text-2xl">{currentLanguage.flag}</span>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {currentLanguage.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {currentLanguage.nativeName || currentLanguage.name}
          </p>
        </div>
        <ChevronDownIcon 
          className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden z-50"
            >
              {/* Recent Languages */}
              {recentLanguages.length > 0 && (
                <div className="p-2 border-b border-gray-200 dark:border-slate-700">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 mb-1">
                    Recent
                  </p>
                  {recentLanguages.map((lang) => (
                    <LanguageOption
                      key={`recent-${lang.code}`}
                      language={lang}
                      isSelected={currentLanguage.code === lang.code}
                      onClick={() => handleSelect(lang)}
                    />
                  ))}
                </div>
              )}

              {/* All Languages */}
              <div className="p-2 max-h-64 overflow-y-auto">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 mb-1">
                  All Languages
                </p>
                {languages.map((lang) => (
                  <LanguageOption
                    key={lang.code}
                    language={lang}
                    isSelected={currentLanguage.code === lang.code}
                    onClick={() => handleSelect(lang)}
                  />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function LanguageOption({ language, isSelected, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
        isSelected
          ? 'bg-blue-50 dark:bg-blue-900/20'
          : 'hover:bg-gray-100 dark:hover:bg-slate-700'
      }`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <span className="text-2xl">{language.flag}</span>
      <div className="flex-1 text-left">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {language.name}
        </p>
        {language.nativeName && language.nativeName !== language.name && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {language.nativeName}
          </p>
        )}
      </div>
      {isSelected && (
        <div className="text-blue-600 dark:text-blue-400">
          <CheckIcon />
        </div>
      )}
    </motion.button>
  );
}