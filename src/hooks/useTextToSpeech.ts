import { useCallback } from "react";

export function useTextToSpeech() {
  return useCallback((text: string, language: "en" | "hi" | null) => {
    if (!("speechSynthesis" in window) || !text.trim()) return;
    const synthesizer = window.speechSynthesis;
    synthesizer.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = language === "hi" ? "hi-IN" : "en-IN";
    speech.rate = 0.95;
    speech.volume = 1;
    speech.onerror = () => console.warn("Speech output is unavailable in this browser.");
    synthesizer.resume();
    synthesizer.speak(speech);
  }, []);
}
