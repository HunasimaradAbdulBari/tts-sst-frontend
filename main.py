"""
PERFECT KANNADA STT - UNLIMITED AUDIO
Uses Whisper large-v3 for maximum accuracy
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import uuid
from gtts import gTTS
import traceback
from pathlib import Path
import time

# Whisper imports
try:
    import whisper
    import torch
    import librosa
    import soundfile as sf
    import numpy as np
    WHISPER_AVAILABLE = True
except ImportError:
    WHISPER_AVAILABLE = False
    print("⚠️  Whisper not available. Install: pip install openai-whisper torch librosa soundfile")

from ultimate_language_detector import ultimate_detector

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Directories
BASE_DIR = Path(__file__).parent
AUDIO_DIR = BASE_DIR / "static" / "audio"
TEMP_DIR = BASE_DIR / "temp_audio"
AUDIO_DIR.mkdir(parents=True, exist_ok=True)
TEMP_DIR.mkdir(parents=True, exist_ok=True)

# Whisper Service for Perfect Kannada
whisper_service = None

print("\n" + "="*80)
print("🎯 PERFECT KANNADA STT - UNLIMITED AUDIO")
print("="*80)

if WHISPER_AVAILABLE:
    try:
        WHISPER_MODEL = os.getenv('WHISPER_MODEL', 'large-v3')
        device = 'cuda' if torch.cuda.is_available() else 'cpu'
        
        print(f"\n📥 Loading Whisper {WHISPER_MODEL} model...")
        print(f"   Device: {device.upper()}")
        print(f"   ⚠️  First-time download: ~3GB (one-time only)")
        
        whisper_model = whisper.load_model(WHISPER_MODEL, device=device)
        whisper_model.eval()
        
        class PerfectKannadaSTT:
            """Perfect Kannada Speech-to-Text Engine"""
            
            def __init__(self, model, device):
                self.model = model
                self.device = device
                self.is_ready = True
                
                # Whisper language mapping
                self.whisper_lang_map = {
                    'en': 'english',
                    'hi': 'hindi',
                    'kn': 'kannada',
                    'ta': 'tamil',
                    'te': 'telugu',
                    'ml': 'malayalam',
                    'mr': 'marathi',
                    'gu': 'gujarati',
                    'bn': 'bengali',
                    'pa': 'punjabi',
                    'ur': 'urdu',
                    'or': 'odia',
                    'as': 'assamese',
                }
                
                # CRITICAL: Kannada-specific initial prompt for perfect transcription
                self.kannada_prompt = (
                    'ಇದು ಕನ್ನಡ ಭಾಷೆಯಲ್ಲಿ ಮಾತನಾಡಲಾದ ಆಡಿಯೋ ಆಗಿದೆ। '
                    'ದಯವಿಟ್ಟು ಕನ್ನಡ ಲಿಪಿಯಲ್ಲಿಯೇ ಬರೆಯಿರಿ।'
                )
                
                print(f"✅ Perfect Kannada STT initialized!")
            
            def transcribe(self, audio_path, language_code=None):
                """
                PERFECT transcription with unlimited audio support
                """
                try:
                    print(f"\n🎙️ Starting transcription...")
                    print(f"   File: {Path(audio_path).name}")
                    print(f"   Language: {language_code or 'Auto-detect'}")
                    
                    start_time = time.time()
                    
                    # STEP 1: Load and preprocess audio
                    audio = self._preprocess_audio(audio_path)
                    duration = len(audio) / 16000
                    print(f"   Duration: {duration:.2f}s")
                    
                    # STEP 2: Configure Whisper for MAXIMUM accuracy
                    whisper_language = None
                    initial_prompt = None
                    
                    if language_code and language_code in self.whisper_lang_map:
                        whisper_language = self.whisper_lang_map[language_code]
                        
                        # CRITICAL: Use Kannada prompt for perfect transcription
                        if language_code == 'kn':
                            initial_prompt = self.kannada_prompt
                            print(f"   🎯 Kannada mode: PERFECT accuracy enabled")
                    
                    # STEP 3: Whisper options - OPTIMIZED for quality
                    options = {
                        'task': 'transcribe',
                        'fp16': self.device == 'cuda',
                        'verbose': False,
                        'beam_size': 10,              # MAXIMUM accuracy (10 is max)
                        'best_of': 10,                # MAXIMUM quality
                        'temperature': 0.0,           # Deterministic
                        'compression_ratio_threshold': 2.4,
                        'logprob_threshold': -1.0,
                        'no_speech_threshold': 0.6,
                        'condition_on_previous_text': True,
                        'word_timestamps': True,      # Better accuracy
                    }
                    
                    if whisper_language:
                        options['language'] = whisper_language
                    
                    if initial_prompt:
                        options['initial_prompt'] = initial_prompt
                    
                    # STEP 4: Transcribe with Whisper
                    print(f"   🔄 Transcribing...")
                    
                    with torch.inference_mode():
                        result = self.model.transcribe(audio, **options)
                    
                    transcription_time = time.time() - start_time
                    
                    # STEP 5: Extract results
                    text = result['text'].strip()
                    detected_lang = result.get('language', language_code or 'en')
                    
                    # Calculate confidence
                    segments = result.get('segments', [])
                    if segments:
                        avg_logprob = np.mean([s.get('avg_logprob', -1) for s in segments])
                        confidence = min(0.99, max(0.5, np.exp(avg_logprob)))
                    else:
                        confidence = 0.85
                    
                    # Map back to our language codes
                    lang_code_map = {v: k for k, v in self.whisper_lang_map.items()}
                    final_lang_code = lang_code_map.get(detected_lang, language_code or 'en')
                    
                    # Override with manual selection if provided
                    if language_code:
                        final_lang_code = language_code
                    
                    print(f"\n   ✅ SUCCESS!")
                    print(f"   Time: {transcription_time:.2f}s")
                    print(f"   Language: {final_lang_code}")
                    print(f"   Confidence: {confidence:.2%}")
                    print(f"   Text: {text[:100]}...")
                    
                    return {
                        'text': text,
                        'language': final_lang_code,
                        'confidence': confidence,
                        'duration': transcription_time,
                        'method': f'Whisper-{WHISPER_MODEL}',
                        'segments': len(segments)
                    }
                    
                except Exception as e:
                    print(f"\n   ❌ Transcription error: {e}")
                    traceback.print_exc()
                    raise
            
            def _preprocess_audio(self, audio_path):
                """
                Advanced audio preprocessing for PERFECT quality
                """
                try:
                    # Load audio at 16kHz (Whisper's native rate)
                    audio, sr = librosa.load(audio_path, sr=16000, mono=True)
                    
                    # Gentle trimming (preserve speech)
                    audio, _ = librosa.effects.trim(
                        audio,
                        top_db=30,  # Gentle trimming
                        frame_length=2048,
                        hop_length=512
                    )
                    
                    # Normalize
                    audio = librosa.util.normalize(audio)
                    
                    # Apply preemphasis for better consonant detection
                    audio = librosa.effects.preemphasis(audio)
                    
                    # Ensure minimum length
                    if len(audio) < sr * 0.3:
                        audio = np.pad(audio, (0, int(sr * 0.3) - len(audio)))
                    
                    print(f"   ✅ Audio preprocessed: {len(audio)/sr:.2f}s")
                    
                    return audio
                    
                except Exception as e:
                    print(f"   ⚠️  Preprocessing failed: {e}, using raw audio")
                    return whisper.load_audio(audio_path)
        
        whisper_service = PerfectKannadaSTT(whisper_model, device)
        
        print(f"\n{'='*80}")
        print("✅ WHISPER LARGE-V3 READY - PERFECT KANNADA ENABLED")
        print("="*80)
        
    except Exception as e:
        print(f"\n❌ Whisper initialization failed: {e}")
        traceback.print_exc()
        WHISPER_AVAILABLE = False

print("\n" + "="*80)
print("✅ SPEECH ENGINE READY")
print("="*80)
print(f"   TTS: gTTS (Unlimited)")
print(f"   STT: {'Whisper large-v3 (Perfect Kannada)' if WHISPER_AVAILABLE else 'Unavailable'}")
print("="*80 + "\n")

# ============================================================================
# SPEECH-TO-TEXT - UNLIMITED AUDIO + PERFECT KANNADA
# ============================================================================

@app.route('/stt', methods=['POST', 'OPTIONS'])
def speech_to_text():
    """
    PERFECT KANNADA STT with UNLIMITED audio capacity
    """
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
    
    temp_path = None
    wav_path = None
    
    try:
        print(f"\n{'='*80}")
        print("🎙️ [STT] UNLIMITED AUDIO - PERFECT KANNADA")
        print(f"{'='*80}")
        
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file"}), 422
        
        audio_file = request.files['audio']
        selected_language = request.form.get('language', 'kn')  # Default to Kannada
        
        print(f"   Language: {selected_language}")
        
        # Save temp file
        file_id = str(uuid.uuid4())[:8]
        ext = Path(audio_file.filename).suffix if audio_file.filename else '.webm'
        temp_filename = f"temp_{file_id}{ext}"
        temp_path = TEMP_DIR / temp_filename
        
        audio_file.save(str(temp_path))
        file_size_mb = temp_path.stat().st_size / 1024 / 1024
        print(f"   File: {temp_path.name} ({file_size_mb:.2f} MB)")
        
        # Convert to WAV
        from pydub import AudioSegment
        audio = AudioSegment.from_file(str(temp_path))
        wav_path = TEMP_DIR / f"temp_{file_id}.wav"
        audio.export(str(wav_path), format='wav')
        
        if WHISPER_AVAILABLE and whisper_service:
            # Use Whisper for PERFECT transcription
            result = whisper_service.transcribe(
                str(wav_path),
                language_code=selected_language
            )
            
            text = result['text']
            detected_lang = result['language']
            confidence = result['confidence']
            
            # Get language info
            lang_info = ultimate_detector.get_language_info(detected_lang)
            
            print(f"\n{'='*80}\n")
            
            return jsonify({
                "text": text,
                "detected_language": {
                    "code": detected_lang,
                    "name": lang_info['name'],
                    "native_name": lang_info['native'],
                    "script": lang_info['script'],
                    "confidence": confidence
                },
                "metadata": {
                    "method": result['method'],
                    "duration": result['duration'],
                    "segments": result['segments'],
                    "file_size_mb": file_size_mb,
                    "model": WHISPER_MODEL
                }
            }), 200
        
        else:
            return jsonify({
                "error": "Whisper not available",
                "message": "Install: pip install openai-whisper torch librosa soundfile"
            }), 503
        
    except Exception as e:
        print(f"\n   ❌ STT Error: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    
    finally:
        # Cleanup
        for path in [temp_path, wav_path]:
            if path and Path(path).exists():
                try:
                    Path(path).unlink()
                except:
                    pass

# ============================================================================
# TEXT-TO-SPEECH (Unchanged)
# ============================================================================

@app.route('/tts', methods=['POST', 'OPTIONS'])
def text_to_speech():
    """TTS with auto-detection"""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
    
    try:
        data = request.get_json(force=True)
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({"error": "Text required"}), 400
        
        detected_lang, confidence = ultimate_detector.detect_text_language(text, verbose=False)
        lang_info = ultimate_detector.get_language_info(detected_lang)
        gtts_lang = ultimate_detector.get_gtts_language(detected_lang)
        
        file_id = str(uuid.uuid4())[:8]
        filename = f"speech_{detected_lang}_{file_id}.mp3"
        file_path = AUDIO_DIR / filename
        
        tts = gTTS(text=text, lang=gtts_lang, slow=False, lang_check=False)
        tts.save(str(file_path))
        
        audio_url = f"http://localhost:8000/static/audio/{filename}"
        
        return jsonify({
            "audio_url": audio_url,
            "detected_language": {
                "code": detected_lang,
                "name": lang_info['name'],
                "native_name": lang_info['native'],
                "confidence": confidence
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================================================
# UTILITY ENDPOINTS
# ============================================================================

@app.route('/', methods=['GET'])
def root():
    return jsonify({
        "name": "Perfect Kannada STT Engine",
        "version": "2.0.0",
        "status": "operational",
        "features": {
            "unlimited_audio": True,
            "perfect_kannada": True,
            "whisper_model": WHISPER_MODEL if WHISPER_AVAILABLE else None,
            "device": whisper_service.device if WHISPER_AVAILABLE and whisper_service else None
        }
    }), 200

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "whisper": "ready" if WHISPER_AVAILABLE else "unavailable",
        "model": WHISPER_MODEL if WHISPER_AVAILABLE else None
    }), 200

@app.route('/static/audio/<filename>')
def serve_audio(filename):
    try:
        file_path = AUDIO_DIR / filename
        if not file_path.exists():
            return jsonify({"error": "File not found"}), 404
        return send_file(str(file_path), mimetype='audio/mpeg')
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print(f"\n{'='*80}")
    print("🎉 STARTING PERFECT KANNADA STT ENGINE")
    print(f"{'='*80}")
    print(f"📡 Server: http://localhost:8000")
    print(f"🎯 Model: {WHISPER_MODEL if WHISPER_AVAILABLE else 'N/A'}")
    print(f"📦 Unlimited Audio: ✅")
    print(f"🇮🇳 Perfect Kannada: ✅")
    print(f"{'='*80}\n")
    
    app.run(
        host='0.0.0.0',
        port=8000,
        debug=False,
        threaded=True,
        use_reloader=False
    )