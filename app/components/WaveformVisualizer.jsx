'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function WaveformVisualizer({ audioLevel = 0, isActive = false }) {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const barCount = 40;
    const barWidth = width / barCount;

    let bars = Array(barCount).fill(0);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Update bars with smooth animation
      if (isActive) {
        bars = bars.map((bar, i) => {
          const target = (audioLevel / 100) * height * (0.4 + Math.random() * 0.6);
          return bar + (target - bar) * 0.25;
        });
      } else {
        bars = bars.map(bar => bar * 0.92);
      }

      // Draw bars with gradient (indigo → purple → pink)
      bars.forEach((barHeight, i) => {
        const x = i * barWidth;
        
        // Create gradient for each bar based on position
        const gradient = ctx.createLinearGradient(x, height - barHeight, x, height);
        
        // Calculate color based on position (left to right: indigo → purple → pink)
        const progress = i / barCount;
        if (progress < 0.33) {
          // Indigo to Purple
          gradient.addColorStop(0, 'rgba(99, 102, 241, 0.9)');   // Indigo
          gradient.addColorStop(0.5, 'rgba(129, 140, 248, 0.7)'); 
          gradient.addColorStop(1, 'rgba(139, 92, 246, 0.5)');    // Purple
        } else if (progress < 0.66) {
          // Purple
          gradient.addColorStop(0, 'rgba(139, 92, 246, 0.9)');    // Purple
          gradient.addColorStop(0.5, 'rgba(167, 139, 250, 0.7)'); 
          gradient.addColorStop(1, 'rgba(192, 132, 252, 0.5)');
        } else {
          // Purple to Pink
          gradient.addColorStop(0, 'rgba(192, 132, 252, 0.9)');
          gradient.addColorStop(0.5, 'rgba(217, 70, 239, 0.7)');
          gradient.addColorStop(1, 'rgba(236, 72, 153, 0.5)');    // Pink
        }
        
        ctx.fillStyle = gradient;
        
        // Draw rounded bars
        const radius = 3;
        const barX = x + 2;
        const barW = barWidth - 4;
        const barY = height - barHeight;
        
        ctx.beginPath();
        ctx.moveTo(barX, height);
        ctx.lineTo(barX, barY + radius);
        ctx.quadraticCurveTo(barX, barY, barX + radius, barY);
        ctx.lineTo(barX + barW - radius, barY);
        ctx.quadraticCurveTo(barX + barW, barY, barX + barW, barY + radius);
        ctx.lineTo(barX + barW, height);
        ctx.closePath();
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioLevel, isActive]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full h-28 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-pink-950/30 rounded-2xl overflow-hidden border border-indigo-200/50 dark:border-indigo-800/50 shadow-inner"
    >
      <canvas
        ref={canvasRef}
        width={800}
        height={112}
        className="w-full h-full"
      />
    </motion.div>
  );
}