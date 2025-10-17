'use client';

import { useTheme } from '../context/ThemeContext';
import { BsSun, BsMoon } from 'react-icons/bs';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 dark:from-gray-700 dark:to-gray-800 shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'dark' ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {theme === 'light' ? (
          <BsSun className="w-6 h-6 text-yellow-300" />
        ) : (
          <BsMoon className="w-6 h-6 text-blue-200" />
        )}
      </motion.div>
    </motion.button>
  );
}