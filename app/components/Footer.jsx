'use client';

import { motion } from 'framer-motion';
import { FaGithub, FaHeart } from 'react-icons/fa';
import { APP_INFO } from '../lib/constants';

export default function Footer() {
  return (
    <motion.footer
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-20 border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Made with</span>
            <FaHeart className="text-red-500 animate-pulse" />
            <span>by {APP_INFO.AUTHOR}</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <motion.a
              href={APP_INFO.GITHUB}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaGithub className="w-5 h-5" />
            </motion.a>
            <span className="text-sm text-gray-500 dark:text-gray-500">
              © 2024 {APP_INFO.NAME}
            </span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}