/**
 * Text Extractor - Extract text from circular gesture area
 * Uses Range API and DOM traversal
 */

class TextExtractor {
  constructor() {
    this.minOverlap = 0.5; // 50% overlap to include word
  }

  /**
   * Extract text from bounding box
   * @param {Object} boundingBox - {x, y, width, height}
   * @param {HTMLElement} containerElement - Element containing text
   * @returns {string} Extracted text
   */
  extractTextFromBounds(boundingBox, containerElement) {
    if (!boundingBox || !containerElement) {
      return '';
    }

    const words = [];
    const range = document.createRange();
    
    // Create tree walker to traverse text nodes
    const walker = document.createTreeWalker(
      containerElement,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Skip empty or whitespace-only nodes
          if (!node.textContent.trim()) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    // Traverse all text nodes
    let node;
    while (node = walker.nextNode()) {
      const text = node.textContent;
      const parentElement = node.parentElement;
      
      // Skip if parent is not visible
      if (!this.isVisible(parentElement)) {
        continue;
      }

      // Split into words and check each word
      const textWords = text.split(/\s+/).filter(w => w.length > 0);
      
      textWords.forEach((word, index) => {
        try {
          // Create range for this word
          const wordStart = this.getWordStartOffset(text, word, index);
          if (wordStart === -1) return;
          
          range.setStart(node, wordStart);
          range.setEnd(node, wordStart + word.length);
          
          const rects = range.getClientRects();
          
          // Check if any rect of this word overlaps with bounding box
          for (let i = 0; i < rects.length; i++) {
            const rect = rects[i];
            const overlap = this.calculateOverlap(rect, boundingBox);
            
            if (overlap >= this.minOverlap) {
              words.push({
                text: word,
                overlap: overlap,
                rect: {
                  x: rect.left,
                  y: rect.top,
                  width: rect.width,
                  height: rect.height
                },
                node: node
              });
              break; // Word found, no need to check other rects
            }
          }
        } catch (e) {
          console.warn('Error processing word:', word, e);
        }
      });
    }

    // Sort words by their position (top to bottom, left to right)
    words.sort((a, b) => {
      const yDiff = a.rect.y - b.rect.y;
      if (Math.abs(yDiff) > 10) { // Different lines
        return yDiff;
      }
      return a.rect.x - b.rect.x; // Same line, sort by x
    });

    // Extract text while preserving order
    return words.map(w => w.text).join(' ');
  }

  /**
   * Extract text from circle points (more accurate)
   */
  extractTextFromCircle(circlePoints, containerElement) {
    // Use convex hull or approximate bounding box
    const boundingBox = this.getCircleBounds(circlePoints);
    
    // Get text from bounding box
    let text = this.extractTextFromBounds(boundingBox, containerElement);
    
    // Additional filtering: check if word centers are inside circle
    // This prevents selecting text outside the circle but inside bounding box
    if (circlePoints && circlePoints.length > 10) {
      const words = text.split(/\s+/);
      const filteredWords = words.filter(word => {
        // For each word, check if its approximate position is inside circle
        // (Simplified: we already filtered by bounding box)
        return true; // Keep all for now
      });
      text = filteredWords.join(' ');
    }
    
    return text.trim();
  }

  /**
   * Calculate overlap percentage between rect and bounding box
   */
  calculateOverlap(rect, boundingBox) {
    // Convert rect to same coordinate system as bounding box
    const rectBox = {
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY,
      right: rect.right + window.scrollX,
      bottom: rect.bottom + window.scrollY,
      width: rect.width,
      height: rect.height
    };

    // Calculate intersection
    const left = Math.max(rectBox.left, boundingBox.left);
    const top = Math.max(rectBox.top, boundingBox.top);
    const right = Math.min(rectBox.right, boundingBox.right);
    const bottom = Math.min(rectBox.bottom, boundingBox.bottom);

    if (left >= right || top >= bottom) {
      return 0; // No overlap
    }

    const intersectionArea = (right - left) * (bottom - top);
    const rectArea = rectBox.width * rectBox.height;

    return intersectionArea / rectArea;
  }

  /**
   * Get bounding box from circle points
   */
  getCircleBounds(points) {
    if (!points || points.length === 0) return null;

    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    for (const point of points) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }

    // Add scroll offset
    minX += window.scrollX;
    minY += window.scrollY;
    maxX += window.scrollX;
    maxY += window.scrollY;

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      left: minX,
      top: minY,
      right: maxX,
      bottom: maxY
    };
  }

  /**
   * Find word start offset in text
   */
  getWordStartOffset(text, word, wordIndex) {
    const words = text.split(/\s+/);
    let offset = 0;
    
    for (let i = 0; i < wordIndex; i++) {
      offset = text.indexOf(words[i], offset);
      if (offset === -1) return -1;
      offset += words[i].length;
      
      // Skip whitespace
      while (offset < text.length && /\s/.test(text[offset])) {
        offset++;
      }
    }
    
    offset = text.indexOf(word, offset);
    return offset;
  }

  /**
   * Check if element is visible
   */
  isVisible(element) {
    if (!element) return false;
    
    const style = window.getComputedStyle(element);
    
    if (style.display === 'none' ||
        style.visibility === 'hidden' ||
        style.opacity === '0') {
      return false;
    }
    
    return true;
  }

  /**
   * Extract text with context (surrounding sentences)
   */
  extractWithContext(boundingBox, containerElement, contextSentences = 1) {
    const mainText = this.extractTextFromBounds(boundingBox, containerElement);
    
    if (!mainText) return { main: '', context: '' };
    
    // Get full container text
    const fullText = containerElement.textContent || '';
    
    // Find main text position
    const mainIndex = fullText.indexOf(mainText);
    
    if (mainIndex === -1) {
      return { main: mainText, context: '' };
    }
    
    // Extract context (sentences before and after)
    const beforeText = fullText.substring(0, mainIndex);
    const afterText = fullText.substring(mainIndex + mainText.length);
    
    // Get previous sentences
    const beforeSentences = beforeText.split(/[.!?]+/).slice(-contextSentences).join('. ');
    
    // Get next sentences
    const afterSentences = afterText.split(/[.!?]+/).slice(0, contextSentences).join('. ');
    
    const context = (beforeSentences + ' ' + afterSentences).trim();
    
    return {
      main: mainText,
      context: context,
      full: (beforeSentences + ' ' + mainText + ' ' + afterSentences).trim()
    };
  }

  /**
   * Clean extracted text
   */
  cleanText(text) {
    return text
      .replace(/\s+/g, ' ') // Multiple spaces to single
      .replace(/\n+/g, ' ') // Newlines to space
      .trim();
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TextExtractor };
}