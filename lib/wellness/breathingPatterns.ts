import type { BreathingPattern, BreathingPatternId } from './types';

export const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    id: 'box',
    label: 'Box breathing',
    description: '4-4-4-4 — calm focus and nervous system balance.',
    inhale: 4,
    holdIn: 4,
    exhale: 4,
    holdOut: 4,
    cycles: 6,
  },
  {
    id: '478',
    label: '4-7-8 relaxation',
    description: 'Inhale 4, hold 7, exhale 8 — ideal before sleep.',
    inhale: 4,
    holdIn: 7,
    exhale: 8,
    holdOut: 0,
    cycles: 4,
  },
  {
    id: 'calm',
    label: 'Calm breath',
    description: 'Gentle 5-5 rhythm for everyday grounding.',
    inhale: 5,
    holdIn: 0,
    exhale: 5,
    holdOut: 0,
    cycles: 8,
  },
];

export function getBreathingPattern(id: BreathingPatternId) {
  return BREATHING_PATTERNS.find((p) => p.id === id) ?? BREATHING_PATTERNS[0];
}

export function phaseLabel(phase: 'inhale' | 'holdIn' | 'exhale' | 'holdOut') {
  switch (phase) {
    case 'inhale':
      return 'Breathe in';
    case 'holdIn':
      return 'Hold';
    case 'exhale':
      return 'Breathe out';
    case 'holdOut':
      return 'Hold';
    default:
      return '';
  }
}

export function getBreathingVoiceIntro(patternId: BreathingPatternId) {
  switch (patternId) {
    case 'box':
      return "Box breathing. Four, four, four, four. Calm focus and nervous system balance. Let's begin.";
    case '478':
      return 'Four, seven, eight breathing. Relax your shoulders. Breathe in when I guide you.';
    case 'calm':
      return 'Calm breath. Five counts in, five counts out. Follow my voice.';
    default:
      return 'Follow my voice and breathe with the circle.';
  }
}

export function getBreathingVoiceCue(
  phase: 'inhale' | 'holdIn' | 'exhale' | 'holdOut',
  patternId: BreathingPatternId,
) {
  if (patternId === 'box') {
    switch (phase) {
      case 'inhale':
        return 'Breathe in. Two, three, four.';
      case 'holdIn':
        return 'Hold. Stay soft and steady.';
      case 'exhale':
        return 'Breathe out. Slowly release.';
      case 'holdOut':
        return 'Hold empty. Rest here.';
      default:
        return '';
    }
  }
  if (patternId === '478') {
    switch (phase) {
      case 'inhale':
        return 'Breathe in for four.';
      case 'holdIn':
        return 'Hold for seven. Stay relaxed.';
      case 'exhale':
        return 'Breathe out for eight. Let go.';
      default:
        return '';
    }
  }
  switch (phase) {
    case 'inhale':
      return 'Breathe in.';
    case 'exhale':
      return 'Breathe out.';
    default:
      return phaseLabel(phase);
  }
}
