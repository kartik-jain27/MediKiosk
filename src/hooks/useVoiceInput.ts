import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionInstance = {
  lang: string;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

export function useVoiceInput(language: "en" | "hi", onResult: (value: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const Constructor = window.SpeechRecognition ?? window.webkitSpeechRecognition;

  const start = useCallback(() => {
    if (!Constructor || recognitionRef.current) return;
    const recognition = new (Constructor as SpeechRecognitionConstructor)();
    recognitionRef.current = recognition;
    recognition.lang = language === "hi" ? "hi-IN" : "en-IN";
    recognition.interimResults = false;
    recognition.onresult = (event) => onResult(event.results[0][0].transcript);
    recognition.onend = () => { recognitionRef.current = null; setIsListening(false); };
    recognition.onerror = () => { setError("voiceInputUnavailable"); setIsListening(false); };
    setError("");
    setIsListening(true);
    try { recognition.start(); } catch { recognitionRef.current = null; setIsListening(false); setError("voiceInputUnavailable"); }
  }, [Constructor, language, onResult]);

  const stop = useCallback(() => { recognitionRef.current?.stop(); }, []);
  useEffect(() => () => recognitionRef.current?.stop(), []);

  return { isListening, isSupported: Boolean(Constructor), start, stop, error };
}
