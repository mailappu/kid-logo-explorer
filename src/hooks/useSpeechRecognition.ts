import { useCallback, useEffect, useRef, useState } from "react";

// Minimal Web Speech API typings (not in lib.dom for all targets)
interface SRAlternative {
  transcript: string;
}
interface SRResult {
  0: SRAlternative;
}
interface SREvent {
  results: { 0: SRResult }[];
}
interface SRErrorEvent {
  error: string;
}
interface SRInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((e: SREvent) => void) | null;
  onerror: ((e: SRErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}
type SRConstructor = new () => SRInstance;

const getSpeechRecognition = (): SRConstructor | null => {
  const w = window as unknown as {
    SpeechRecognition?: SRConstructor;
    webkitSpeechRecognition?: SRConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

export const isSpeechRecognitionSupported = () => getSpeechRecognition() !== null;

export interface SpeechRecognitionResult {
  transcript: string;
}

interface UseSpeechRecognitionOptions {
  lang?: string;
  timeoutMs?: number;
  onResult: (result: SpeechRecognitionResult) => void;
  onError?: (error: string) => void;
  onTimeout?: () => void;
}

export const useSpeechRecognition = ({
  lang = "en-US",
  timeoutMs = 8000,
  onResult,
  onError,
  onTimeout,
}: UseSpeechRecognitionOptions) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SRInstance | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<SpeechRecognitionResult | null>(null);

  // Always-fresh callbacks
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);
  const onTimeoutRef = useRef(onTimeout);
  useEffect(() => {
    onResultRef.current = onResult;
    onErrorRef.current = onError;
    onTimeoutRef.current = onTimeout;
  });

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn("Error stopping recognition:", e);
      }
      recognitionRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsListening(false);
  }, []);

  const start = useCallback(() => {
    const Ctor = getSpeechRecognition();
    if (!Ctor) {
      onErrorRef.current?.("not-supported");
      return false;
    }

    stop();

    const recognition = new Ctor();
    recognitionRef.current = recognition;
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;

    timeoutRef.current = setTimeout(() => {
      stop();
      onTimeoutRef.current?.();
    }, timeoutMs);

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      pendingRef.current = { transcript };
      try {
        recognition.stop();
      } catch (e) {
        console.warn("Recognition stop error:", e);
      }
    };

    recognition.onerror = (event) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsListening(false);
      recognitionRef.current = null;
      if (event.error !== "aborted" && event.error !== "no-speech") {
        onErrorRef.current?.(event.error);
      }
    };

    recognition.onend = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsListening(false);
      recognitionRef.current = null;

      const pending = pendingRef.current;
      pendingRef.current = null;
      if (!pending) return;

      // Defer slightly so TTS isn't suppressed by the recognition session
      setTimeout(() => onResultRef.current(pending), 150);
    };

    try {
      recognition.start();
      return true;
    } catch (e) {
      console.error("Error starting recognition:", e);
      stop();
      onErrorRef.current?.("start-failed");
      return false;
    }
  }, [lang, timeoutMs, stop]);

  // Cleanup on unmount
  useEffect(() => () => stop(), [stop]);

  return { start, stop, isListening };
};
