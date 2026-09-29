import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Volume2, VolumeX, Sparkles, AlertCircle, Bot, RotateCcw, CheckCircle2, Globe, HelpCircle } from 'lucide-react'
import { Card, SectionHeader, Badge } from './ui'
import { useAuth } from '../lib/auth'
import { useLang, Lang } from '../lib/i18n'
import { voiceService, SAMPLE_VOICE_QUERIES, VOICE_LANGUAGE_CODES } from '../lib/voiceService'
import { generateAIResponse, AIResponse } from '../lib/aiEngine'
import { supabase } from '../lib/supabase'

const VOICE_LANGUAGES: { code: Lang; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
]

export default function VoiceAssistant() {
  const { profile } = useAuth()
  const { lang, setLang } = useLang()
  const [selectedLang, setSelectedLang] = useState<Lang>('ta') // default to Tamil or user preference
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [aiResult, setAiResult] = useState<AIResponse | null>(null)
  const [processing, setProcessing] = useState(false)
  const [micError, setMicError] = useState<string | null>(null)
  const stopListeningRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    // initialize from profile if available
    if (profile?.preferred_language && VOICE_LANGUAGES.some(l => l.code === profile.preferred_language)) {
      setSelectedLang(profile.preferred_language as Lang)
    }
  }, [profile])

  useEffect(() => {
    return () => {
      voiceService.stopSpeaking()
      voiceService.stopListening()
    }
  }, [])

  function toggleListening() {
    if (isListening) {
      handleStopListening()
    } else {
      handleStartListening()
    }
  }

  function handleStartListening() {
    setMicError(null)
    setTranscript('')
    setIsListening(true)
    voiceService.stopSpeaking()

    stopListeningRef.current = voiceService.startListening({
      lang: selectedLang,
      onStart: () => {
        setIsListening(true)
      },
      onResult: (text: string) => {
        setTranscript(text)
      },
      onError: (err: string) => {
        setIsListening(false)
        setMicError(err)
      },
      onEnd: () => {
        setIsListening(false)
      },
    })
  }

  function handleStopListening() {
    setIsListening(false)
    voiceService.stopListening()
    if (transcript.trim()) {
      processQuestion(transcript.trim())
    }
  }

  async function processQuestion(questionText: string) {
    setProcessing(true)
    setTranscript(questionText)

    // Save user voice query to Supabase if authenticated
    try {
      await supabase.from('chat_messages').insert({
        role: 'user',
        content: `[Voice] ${questionText}`,
      })
    } catch {
      // ignore
    }

    setTimeout(async () => {
      const response = generateAIResponse(questionText, {
        crop: profile?.farming_method || 'Wheat',
        location: 'Tamil Nadu / Punjab',
      })
      setAiResult(response)
      setProcessing(false)

      // Save assistant voice response
      try {
        await supabase.from('chat_messages').insert({
          role: 'assistant',
          content: `[Voice] ${response.text}`,
        })
      } catch {
        // ignore
      }

      // Automatically speak the response aloud
      speakAnswer(response.text)
    }, 800)
  }

  function speakAnswer(text: string) {
    voiceService.stopSpeaking()
    setIsSpeaking(true)
    voiceService.speak(
      text,
      selectedLang,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    )
  }

  function stopSpeaking() {
    voiceService.stopSpeaking()
    setIsSpeaking(false)
  }

  const samplePrompts = SAMPLE_VOICE_QUERIES[selectedLang] || SAMPLE_VOICE_QUERIES.en

  return (
    <div className="animate-fadeIn space-y-6">
      <SectionHeader
        title="AI Voice Farm Assistant"
        subtitle="Speak in your mother tongue — hands-free agricultural guidance for every farmer"
        icon={<Mic size={22} className="text-primary-600" />}
      />

      {/* Main Voice Interaction Hero Panel */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-800 via-primary-700 to-secondary-800 text-white p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-24 translate-x-24 blur-2xl" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-2xl mx-auto">
          {/* Language Pills */}
          <div className="flex flex-wrap justify-center gap-1.5 bg-black/20 p-1.5 rounded-2xl backdrop-blur-md">
            {VOICE_LANGUAGES.map(l => (
              <button
                key={l.code}
                onClick={() => {
                  setSelectedLang(l.code)
                  voiceService.stopSpeaking()
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedLang === l.code
                    ? 'bg-white text-gray-900 shadow-md'
                    : 'text-primary-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{l.label}</span>
                <span className="text-[10px] ml-1 opacity-75">({l.native})</span>
              </button>
            ))}
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isListening ? 'Listening to your voice...' : 'Press the microphone & ask anything'}
            </h2>
            <p className="text-primary-100 text-xs sm:text-sm mt-1">
              Ask about irrigation schedules, pest cures, weather forecasts, or mandi selling prices.
            </p>
          </div>

          {/* Large Animated Microphone Button */}
          <div className="relative my-4">
            {isListening && (
              <>
                <div className="absolute inset-0 rounded-full bg-emerald-400/40 animate-ping" />
                <div className="absolute -inset-4 rounded-full bg-emerald-400/20 animate-pulse" />
              </>
            )}

            <button
              onClick={toggleListening}
              className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center transition-transform active:scale-95 shadow-2xl ${
                isListening
                  ? 'bg-error-500 hover:bg-error-600 text-white ring-8 ring-error-400/40'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white ring-8 ring-emerald-400/20 hover:ring-emerald-400/40'
              }`}
            >
              {isListening ? <MicOff size={36} /> : <Mic size={36} />}
              <span className="text-[10px] uppercase font-bold tracking-wider mt-1">
                {isListening ? 'Stop' : 'Speak'}
              </span>
            </button>
          </div>

          {/* Real-time transcribed text */}
          {transcript && (
            <div className="w-full bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-left animate-slideIn">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300 block mb-1">
                Transcribed Question:
              </span>
              <p className="text-sm font-medium text-white italic">
                "{transcript}"
              </p>
              {isListening && (
                <button
                  onClick={handleStopListening}
                  className="mt-3 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl"
                >
                  Confirm & Ask AI
                </button>
              )}
            </div>
          )}

          {micError && (
            <div className="p-3 bg-black/40 rounded-xl border border-white/20 text-xs text-amber-200">
              {micError}
            </div>
          )}
        </div>
      </div>

      {/* AI Voice Answer Box */}
      {(processing || aiResult) && (
        <Card className="border-2 border-primary-200 shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary-600 text-white flex items-center justify-center">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">FarmWise Voice Response</h3>
                <p className="text-[10px] text-gray-400">Audio playback enabled</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isSpeaking ? (
                <button
                  onClick={stopSpeaking}
                  className="px-3 py-1.5 bg-error-50 hover:bg-error-100 text-error-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <VolumeX size={15} /> Stop Reading
                </button>
              ) : (
                <button
                  onClick={() => aiResult && speakAnswer(aiResult.text)}
                  className="px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Volume2 size={15} /> Read Aloud Again
                </button>
              )}
            </div>
          </div>

          {processing ? (
            <div className="py-8 flex flex-col items-center justify-center gap-3 text-gray-400">
              <Sparkles className="animate-spin text-primary-600" size={24} />
              <p className="text-xs">Consulting agricultural database & preparing voice answer...</p>
            </div>
          ) : (
            aiResult && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-2xl text-gray-800 text-sm leading-relaxed whitespace-pre-line border border-gray-100">
                  {aiResult.text}
                </div>

                {aiResult.warnings && aiResult.warnings.length > 0 && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                    <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      {aiResult.warnings.map((w, i) => (
                        <p key={i}>{w}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </Card>
      )}

      {/* Quick Suggested Voice Questions in Selected Language */}
      <Card>
        <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
          <Sparkles size={16} className="text-amber-500" /> Quick Voice Prompts (Tap to ask instantly)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {samplePrompts.map((item, i) => (
            <button
              key={i}
              onClick={() => processQuestion(item.query)}
              className="p-3 bg-gray-50 hover:bg-primary-50 border border-gray-200/80 hover:border-primary-300 rounded-2xl text-left text-xs font-medium text-gray-700 hover:text-primary-800 transition-all flex items-center justify-between group"
            >
              <span>{item.display}</span>
              <Mic size={14} className="text-gray-400 group-hover:text-primary-600 shrink-0" />
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}
