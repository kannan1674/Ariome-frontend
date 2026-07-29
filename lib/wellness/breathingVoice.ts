/** Spoken cues for guided breathing (Web Speech API). */

export function isBreathingVoiceSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function stopBreathingVoice() {
  if (!isBreathingVoiceSupported()) return;
  window.speechSynthesis.cancel();
}

export function speakBreathingCue(
  text: string,
  options?: { rate?: number; pitch?: number; onEnd?: () => void },
) {
  if (!isBreathingVoiceSupported() || !text.trim()) {
    options?.onEnd?.();
    return;
  }
  stopBreathingVoice();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = options?.rate ?? 0.9;
  utter.pitch = options?.pitch ?? 1;
  utter.onend = () => options?.onEnd?.();
  utter.onerror = () => options?.onEnd?.();
  window.speechSynthesis.speak(utter);
}
