/* eslint-disable @typescript-eslint/no-explicit-any */
type SR = any;

export function getRecognizer(lang = "zh-CN"): SR | null {
  if (typeof window === "undefined") return null;
  const w = window as any;
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  if (!Ctor) return null;
  const r: SR = new Ctor();
  r.lang = lang;
  r.interimResults = false;
  r.maxAlternatives = 1;
  return r;
}

export function isSpeechSupported() {
  if (typeof window === "undefined") return false;
  const w = window as any;
  return !!(w.SpeechRecognition || w.webkitSpeechRecognition);
}
