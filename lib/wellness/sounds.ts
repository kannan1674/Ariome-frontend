import type { AmbientSound } from './types';

export const AMBIENT_SOUNDS: AmbientSound[] = [
  { id: 'rain', label: 'Rain', emoji: '🌧️', description: 'Soft rainfall', category: 'ambient' },
  { id: 'ocean', label: 'Ocean', emoji: '🌊', description: 'Rolling waves', category: 'ambient' },
  { id: 'forest', label: 'Forest', emoji: '🌲', description: 'Woodland ambience', category: 'ambient' },
  { id: 'white', label: 'White noise', emoji: '〰️', description: 'Steady hush', category: 'ambient' },
  { id: 'brown', label: 'Brown noise', emoji: '🟤', description: 'Deep warmth', category: 'ambient' },
  { id: 'bowl', label: 'Singing bowl', emoji: '🔔', description: 'Resonant tone', category: 'ambient' },
  { id: 'piano', label: 'Soft piano', emoji: '🎹', description: 'Gentle keys', category: 'ambient' },
];

export const MIND_RELAX_SOUNDS: AmbientSound[] = [
  { id: 'mindRelax', label: 'Mind relax', emoji: '🧘', description: 'Warm pads & soft melody', category: 'relax' },
  { id: 'zenPad', label: 'Zen calm', emoji: '🪷', description: 'Steady peaceful drone', category: 'relax' },
  { id: 'calmFlow', label: 'Calm flow', emoji: '💧', description: 'Flowing water & tones', category: 'relax' },
];

export const DEEP_SLEEP_SOUNDS: AmbientSound[] = [
  { id: 'delta', label: 'Delta waves', emoji: '🌙', description: 'Ultra-low deep hum', category: 'deep-sleep' },
  { id: 'nightDrone', label: 'Night drone', emoji: '💤', description: 'Slow floating tones', category: 'deep-sleep' },
  { id: 'heartbeat', label: 'Soft heartbeat', emoji: '💗', description: 'Grounding pulse', category: 'deep-sleep' },
  { id: 'cosmic', label: 'Cosmic sleep', emoji: '✨', description: 'Vast, weightless calm', category: 'deep-sleep' },
];
