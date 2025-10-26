'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

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

const GlobeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
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
    <div className="relative z-50">
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-5 py-3.5 glass rounded-2xl shadow-lg border border-gray-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all min-w-[240px]"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl flex items-center justify-center text-2xl">
          {currentLanguage.flag}
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {currentLanguage.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {currentLanguage.nativeName || currentLanguage.name}
          </p>
        </div>
        <ChevronDownIcon 
          className={`text-gray-500 dark:text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
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
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-full left-0 right-0 mt-2 glass rounded-2xl shadow-2xl border border-gray-200/50 dark:border-slate-700/50 overflow-hidden z-50"
            >
              {/* Recent Languages */}
              {recentLanguages.length > 0 && (
                <div className="p-3 border-b border-gray-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 px-2 mb-2">
                    <div className="w-1 h-1 bg-indigo-500 rounded-full"></div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Recent
                    </p>
                  </div>
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
              <div className="p-3 max-h-64 overflow-y-auto custom-scrollbar">
                <div className="flex items-center gap-2 px-2 mb-2">
                  <GlobeIcon />
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    All Languages
                  </p>
                </div>
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
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
        isSelected
          ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 shadow-sm'
          : 'hover:bg-gray-100 dark:hover:bg-slate-700'
      }`}
      whileHover={{ scale: 1.01, x: 2 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-2xl ${
        isSelected ? 'bg-white dark:bg-slate-800 shadow-sm' : 'bg-gray-50 dark:bg-slate-800'
      }`}>
        {language.flag}
      </div>
      <div className="flex-1 text-left">
        <p className={`text-sm font-semibold ${
          isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'
        }`}>
          {language.name}
        </p>
        {language.nativeName && language.nativeName !== language.name && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {language.nativeName}
          </p>
        )}
      </div>
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-indigo-600 dark:text-indigo-400"
        >
          <CheckIcon />
        </motion.div>
      )}
    </motion.button>
  );
}