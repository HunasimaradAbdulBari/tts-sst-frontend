/**
 * Smart Search Parser - Context-aware search with AI platform detection
 * Supports: Google, ChatGPT, Claude, Gemini, Copilot
 */

class SearchParser {
  constructor() {
    // AI Platform patterns (case-insensitive)
    this.platformPatterns = {
      chatgpt: {
        keywords: ['chatgpt', 'chat gpt', 'openai', 'gpt'],
        regex: /\b(chatgpt|chat\s*gpt|openai|gpt[-\s]*[34]?)\b/i,
        url: 'https://chat.openai.com/',
        name: 'ChatGPT'
      },
      claude: {
        keywords: ['claude', 'anthropic', 'claude ai'],
        regex: /\b(claude|anthropic|claude\s*ai)\b/i,
        url: 'https://claude.ai/new',
        name: 'Claude AI'
      },
      gemini: {
        keywords: ['gemini', 'bard', 'google gemini'],
        regex: /\b(gemini|google\s*gemini|bard)\b/i,
        url: 'https://gemini.google.com/',
        name: 'Gemini'
      },
      copilot: {
        keywords: ['copilot', 'bing ai', 'microsoft ai', 'bing chat'],
        regex: /\b(copilot|bing\s*ai|microsoft\s*ai|bing\s*chat)\b/i,
        url: 'https://copilot.microsoft.com/',
        name: 'Copilot'
      },
      perplexity: {
        keywords: ['perplexity', 'perplexity ai'],
        regex: /\b(perplexity|perplexity\s*ai)\b/i,
        url: 'https://www.perplexity.ai/',
        name: 'Perplexity'
      }
    };

    // Search command variations (multilingual)
    this.searchCommands = {
      en: [
        'search this', 'search for', 'google this', 'google',
        'look up', 'find information about', 'find', 'search',
        'ask chatgpt', 'ask claude', 'ask gemini', 'ask ai',
        'search in chatgpt', 'open in claude', 'use gemini',
        'query', 'research'
      ],
      hi: [
        'इसे खोजो', 'सर्च करो', 'गूगल करो',
        'चैटजीपीटी में पूछो', 'क्लॉड में पूछो',
        'जानकारी खोजो', 'ढूंढो'
      ],
      kn: [
        'ಇದನ್ನು ಹುಡುಕು', 'ಸರ್ಚ್ ಮಾಡು', 'ಗೂಗಲ್ ಮಾಡು',
        'ChatGPT ಯಲ್ಲಿ ಕೇಳು', 'Claude ಯಲ್ಲಿ ಕೇಳು'
      ],
      // Add more languages...
    };

    // Intent classification patterns
    this.intentPatterns = {
      search: /\b(search|find|look|lookup|google|query)\b/i,
      question: /\b(how|why|when|where|who|what|which|can|could|would|should)\b/i,
      command: /\b(open|close|start|stop|create|delete|show|hide)\b/i,
      ai_query: /\b(explain|summarize|analyze|compare|describe|write|code|generate)\b/i
    };
  }

  /**
   * Parse search query and detect platform
   * @param {string} transcript - Full transcript text
   * @returns {Object} {platform, query, confidence, intent}
   */
  parse(transcript) {
    if (!transcript || transcript.trim().length === 0) {
      return null;
    }

    const cleanText = transcript.trim();
    const lowerText = cleanText.toLowerCase();

    // 1. Detect AI platform
    const platformResult = this.detectPlatform(cleanText);

    // 2. Extract query (remove platform mentions and commands)
    const query = this.extractQuery(cleanText, platformResult.platform);

    // 3. Classify intent
    const intent = this.classifyIntent(cleanText);

    // 4. Clean query
    const cleanQuery = this.cleanQuery(query);

    return {
      platform: platformResult.platform,
      query: cleanQuery,
      originalText: cleanText,
      confidence: platformResult.confidence,
      intent: intent,
      url: this.buildURL(platformResult.platform, cleanQuery)
    };
  }

  /**
   * Detect which AI platform to use
   */
  detectPlatform(text) {
    const lowerText = text.toLowerCase();
    
    // Check each platform
    for (const [platform, config] of Object.entries(this.platformPatterns)) {
      if (config.regex.test(lowerText)) {
        // Calculate confidence based on explicitness
        let confidence = 0.7;
        
        // Higher confidence if platform mentioned multiple times
        const matches = lowerText.match(config.regex);
        if (matches && matches.length > 1) {
          confidence = 0.9;
        }
        
        // Higher confidence if specific keywords present
        if (config.keywords.some(kw => lowerText.includes(kw))) {
          confidence = Math.min(1.0, confidence + 0.2);
        }
        
        return { platform, confidence };
      }
    }

    // Default to Google if no AI platform detected
    return { platform: 'google', confidence: 0.5 };
  }

  /**
   * Extract actual query from transcript
   */
  extractQuery(text, platform) {
    let query = text;

    // Remove platform mentions
    if (platform && platform !== 'google') {
      const config = this.platformPatterns[platform];
      if (config) {
        // Remove platform keywords
        config.keywords.forEach(keyword => {
          const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
          query = query.replace(regex, '');
        });
      }
    }

    // Remove command phrases
    const allCommands = Object.values(this.searchCommands).flat();
    allCommands.forEach(command => {
      const regex = new RegExp(`\\b${command}\\b`, 'gi');
      query = query.replace(regex, '');
    });

    // Remove common filler words
    const fillers = [
      'um', 'uh', 'like', 'you know', 'i mean', 'basically',
      'actually', 'literally', 'so', 'well', 'okay', 'alright',
      'in', 'the', 'on', 'for', 'about'
    ];
    
    fillers.forEach(filler => {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      query = query.replace(regex, ' ');
    });

    return query.trim();
  }

  /**
   * Classify user intent
   */
  classifyIntent(text) {
    const intents = [];
    let maxScore = 0;
    let primaryIntent = 'search';

    for (const [intent, pattern] of Object.entries(this.intentPatterns)) {
      if (pattern.test(text)) {
        const matches = text.match(pattern);
        const score = matches ? matches.length : 0;
        
        intents.push({ intent, score });
        
        if (score > maxScore) {
          maxScore = score;
          primaryIntent = intent;
        }
      }
    }

    return {
      primary: primaryIntent,
      all: intents,
      confidence: maxScore > 0 ? Math.min(1.0, maxScore * 0.3) : 0.5
    };
  }

  /**
   * Clean and optimize query
   */
  cleanQuery(query) {
    return query
      .replace(/\s+/g, ' ')           // Multiple spaces to single
      .replace(/[^\w\s\p{L}\p{N}]/gu, ' ')  // Remove special chars but keep Unicode
      .trim()
      .replace(/^(please|kindly|can you|could you)\s*/i, ''); // Remove politeness
  }

  /**
   * Build search URL based on platform
   */
  buildURL(platform, query) {
    const encodedQuery = encodeURIComponent(query);
    
    const urls = {
      chatgpt: `https://chat.openai.com/?q=${encodedQuery}`,
      claude: `https://claude.ai/new?q=${encodedQuery}`,
      gemini: `https://gemini.google.com/?q=${encodedQuery}`,
      copilot: `https://copilot.microsoft.com/?q=${encodedQuery}`,
      perplexity: `https://www.perplexity.ai/?q=${encodedQuery}`,
      google: `https://www.google.com/search?q=${encodedQuery}`
    };

    return urls[platform] || urls.google;
  }

  /**
   * Optimize query for specific platform
   */
  optimizeForPlatform(query, platform) {
    const optimizations = {
      chatgpt: (q) => `${q}. Please be concise and actionable.`,
      claude: (q) => `${q}. Think step by step.`,
      gemini: (q) => `${q}`,
      copilot: (q) => `${q}`,
      google: (q) => q
    };

    const optimizer = optimizations[platform] || optimizations.google;
    return optimizer(query);
  }
}

/**
 * Platform Redirector - Handle search execution
 */
class PlatformRedirector {
  constructor() {
    this.parser = new SearchParser();
  }

  /**
   * Execute search on detected platform
   * @param {string} transcript - Raw transcript
   * @param {Object} options - {newTab, optimize}
   */
  search(transcript, options = {}) {
    const {
      newTab = true,
      optimize = true
    } = options;

    // Parse transcript
    const result = this.parser.parse(transcript);
    
    if (!result || !result.query) {
      console.warn('No valid query extracted');
      return null;
    }

    // Optimize query if requested
    let finalQuery = result.query;
    if (optimize) {
      finalQuery = this.parser.optimizeForPlatform(finalQuery, result.platform);
    }

    // Build final URL
    const url = this.parser.buildURL(result.platform, finalQuery);

    // Open in new tab or current tab
    if (newTab) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = url;
    }

    // Return metadata
    return {
      platform: result.platform,
      query: finalQuery,
      url: url,
      confidence: result.confidence,
      intent: result.intent
    };
  }

  /**
   * Get platform info
   */
  getPlatformInfo(platformName) {
    const parser = new SearchParser();
    return parser.platformPatterns[platformName] || null;
  }

  /**
   * Check if text contains search intent
   */
  hasSearchIntent(text) {
    const result = this.parser.parse(text);
    return result && result.query.length > 0;
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SearchParser, PlatformRedirector };
}

// Global instance
if (typeof window !== 'undefined') {
  window.SearchParser = SearchParser;
  window.PlatformRedirector = PlatformRedirector;
}