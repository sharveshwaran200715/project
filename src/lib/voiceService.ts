import { Lang } from './i18n'

export const VOICE_LANGUAGE_CODES: Record<Lang, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  mr: 'mr-IN',
}

export const SAMPLE_VOICE_QUERIES: Record<Lang, { query: string; display: string }[]> = {
  en: [
    { query: 'Should I irrigate my wheat crop today?', display: '"Should I irrigate my wheat crop today?"' },
    { query: 'What is the current market price for tomatoes?', display: '"What is the current market price for tomatoes?"' },
    { query: 'How to control yellow leaf curl disease?', display: '"How to control yellow leaf curl disease?"' },
    { query: 'Recommend fertilizer dose for 1 hectare rice', display: '"Recommend fertilizer dose for 1 hectare rice"' },
  ],
  ta: [
    { query: 'இன்று கோதுமை பயிருக்கு தண்ணீர் பாய்ச்ச வேண்டுமா?', display: '"இன்று கோதுமை பயிருக்கு தண்ணீர் பாய்ச்ச வேண்டுமா?"' },
    { query: 'தக்காளி இலை கருகல் நோய்க்கு என்ன மருந்து தெளிக்க வேண்டும்?', display: '"தக்காளி இலை கருகல் நோய்க்கு என்ன மருந்து?"' },
    { query: 'இன்றைய தக்காளி சந்தை விலை என்ன?', display: '"இன்றைய தக்காளி சந்தை விலை என்ன?"' },
    { query: 'நெல் பயிருக்கு உரம் எப்போது இட வேண்டும்?', display: '"நெல் பயிருக்கு உரம் எப்போது இட வேண்டும்?"' },
  ],
  hi: [
    { query: 'क्या आज मुझे अपनी गेहूं की फसल की सिंचाई करनी चाहिए?', display: '"क्या आज मुझे गेहूं की फसल की सिंचाई करनी चाहिए?"' },
    { query: 'टमाटर के पत्तों पर पीले धब्बों का क्या इलाज है?', display: '"टमाटर के पत्तों पर पीले धब्बों का क्या इलाज है?"' },
    { query: 'आज की मंडी में गेहूं और धान का भाव क्या है?', display: '"आज की मंडी में भाव क्या है?"' },
    { query: 'जैविक खाद बनाने का सबसे आसान तरीका क्या है?', display: '"जैविक खाद बनाने का आसान तरीका?"' },
  ],
  te: [
    { query: 'ఈ రోజు నా వరి పంటకు నీరు పెట్టాలా?', display: '"ఈ రోజు నా వరి పంటకు నీరు పెట్టాలా?"' },
    { query: 'టమోటా ఆకు మచ్చల నివారణకు ఏ మందు వాడాలి?', display: '"టమోటా ఆకు మచ్చల నివారణకు ఏ మందు?"' },
    { query: 'నేటి మార్కెట్లో కూరగాయల ధరలు ఎలా ఉన్నాయి?', display: '"నేటి మార్కెట్ ధరలు ఎలా ఉన్నాయి?"' },
  ],
  kn: [
    { query: 'ಇಂದು ನನ್ನ ಬೆಳೆಗಳಿಗೆ ನೀರು ಹಾಯಿಸಬೇಕೇ?', display: '"ಇಂದು ನನ್ನ ಬೆಳೆಗಳಿಗೆ ನೀರು ಹಾಯಿಸಬೇಕೇ?"' },
    { query: 'ಟೊಮ್ಯಾಟೊ ರೋಗಕ್ಕೆ ಯಾವ ಔಷಧಿ ಸಿಂಪಡಿಸಬೇಕು?', display: '"ಟೊಮ್ಯಾಟೊ ರೋಗಕ್ಕೆ ಔಷಧಿ ಏನು?"' },
    { query: 'ಇಂದಿನ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಬೆಲೆಗಳು ಹೇಗಿವೆ?', display: '"ಇಂದಿನ ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು ಹೇಗಿವೆ?"' },
  ],
  ml: [
    { query: 'ഇന്ന് വിളകൾക്ക് നനയ്ക്കേണ്ടതുണ്ടോ?', display: '"ഇന്ന് വിളകൾക്ക് നനയ്ക്കേണ്ടതുണ്ടോ?"' },
    { query: 'തക്കാളിയിലെ ഇലപ്പുള്ളി രോഗത്തിന് എന്ത് മരുന്ന് നൽകണം?', display: '"തക്കാളിയിലെ രോഗത്തിന് എന്ത് മരുന്ന് നൽകണം?"' },
    { query: 'ഇന്നത്തെ ചന്തയിലെ വിളകളുടെ വില എത്രയാണ്?', display: '"ഇന്നത്തെ ചന്തയിലെ വില എത്രയാണ്?"' },
  ],
  mr: [
    { query: 'आज पिकाला पाणी देणे गरजेचे आहे का?', display: '"आज पिकाला पाणी देणे गरजेचे आहे का?"' },
    { query: 'टोमॅटोवरील रोगासाठी कोणते औषध फवारावे?', display: '"टोमॅटोवरील रोगासाठी औषध काय?"' },
    { query: 'आजचे बाजारभाव काय आहेत?', display: '"आजचे बाजारभाव काय आहेत?"' },
  ],
}

class VoiceService {
  private currentUtterance: SpeechSynthesisUtterance | null = null
  private recognitionInstance: any = null

  public isSpeechSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window
  }

  public isSpeechRecognitionSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    )
  }

  public speak(
    text: string,
    lang: Lang = 'en',
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ): boolean {
    if (!this.isSpeechSynthesisSupported()) {
      onEnd?.()
      return false
    }

    try {
      window.speechSynthesis.cancel()

      // Clean markdown or symbol clutter for speech
      const cleanText = text
        .replace(/[*_#`~[\]]/g, '')
        .replace(/https?:\/\/\S+/g, '')
        .replace(/[🌾💡⚠️🚨✅🔴🟠🟢]/g, '')
        .replace(/\n+/g, '. ')

      const utterance = new SpeechSynthesisUtterance(cleanText)
      utterance.lang = VOICE_LANGUAGE_CODES[lang] || 'en-IN'
      utterance.rate = 0.95 // slightly slower for farmer clarity
      utterance.pitch = 1.0

      // Try to find matching voice
      const voices = window.speechSynthesis.getVoices()
      const voice = voices.find(v => v.lang.startsWith(utterance.lang) || v.lang.includes(lang))
      if (voice) {
        utterance.voice = voice
      }

      utterance.onstart = () => onStart?.()
      utterance.onend = () => {
        this.currentUtterance = null
        onEnd?.()
      }
      utterance.onerror = (e) => {
        this.currentUtterance = null
        onError?.(e)
      }

      this.currentUtterance = utterance
      window.speechSynthesis.speak(utterance)
      return true
    } catch (e) {
      console.warn('SpeechSynthesis error:', e)
      onError?.(e)
      return false
    }
  }

  public stopSpeaking(): void {
    if (this.isSpeechSynthesisSupported()) {
      window.speechSynthesis.cancel()
      this.currentUtterance = null
    }
  }

  public startListening(options: {
    lang: Lang
    onStart?: () => void
    onResult: (text: string) => void
    onError: (error: string) => void
    onEnd: () => void
  }): () => void {
    if (!this.isSpeechRecognitionSupported()) {
      options.onError('Speech recognition is not supported in this browser. You can click any suggested question.')
      options.onEnd()
      return () => {}
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      this.recognitionInstance = recognition

      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = VOICE_LANGUAGE_CODES[options.lang] || 'en-IN'

      recognition.onstart = () => {
        options.onStart?.()
      }

      recognition.onresult = (event: any) => {
        let interimTranscript = ''
        let finalTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          } else {
            interimTranscript += event.results[i][0].transcript
          }
        }
        const text = finalTranscript || interimTranscript
        if (text) options.onResult(text)
      }

      recognition.onerror = (event: any) => {
        options.onError(event.error || 'Voice input interrupted.')
      }

      recognition.onend = () => {
        this.recognitionInstance = null
        options.onEnd()
      }

      recognition.start()

      return () => {
        try {
          recognition.abort()
        } catch {
          // ignore
        }
      }
    } catch (e: any) {
      options.onError(e?.message || 'Failed to start speech recognition')
      options.onEnd()
      return () => {}
    }
  }

  public stopListening(): void {
    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.stop()
      } catch {
        // ignore
      }
      this.recognitionInstance = null
    }
  }
}

export const voiceService = new VoiceService()
