import { useCallback, useEffect, useRef } from "react";

interface SpeakOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
}

export const useSpeechSynthesis = (enabled: boolean = true) => {
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
    if (!enabled && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, [enabled]);

  const speak = useCallback((text: string, options: SpeakOptions = {}) => {
    if (!enabledRef.current) return;
    if (!("speechSynthesis" in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate ?? 0.9;
    utterance.pitch = options.pitch ?? 1.1;
    utterance.volume = options.volume ?? 1.0;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, []);

  const cancel = useCallback(() => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  // Cleanup on unmount
  useEffect(() => () => cancel(), [cancel]);

  return { speak, cancel };
};
