/** Web Audio ambient sounds — no external files required. */

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let activeNodes: AudioNode[] = [];
let activeSoundId: string | null = null;

function getCtx() {
  if (!ctx) {
    ctx = new AudioContext();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.35;
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return { ctx, gain: masterGain! };
}

function stopAll() {
  activeNodes.forEach((n) => {
    try {
      n.disconnect();
    } catch {
      /* ignore */
    }
  });
  activeNodes = [];
  activeSoundId = null;
}

function track(node: AudioNode) {
  activeNodes.push(node);
  return node;
}

function noiseBuffer(ctx: AudioContext, type: 'white' | 'brown', seconds = 2) {
  const len = ctx.sampleRate * seconds;
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1;
    if (type === 'brown') {
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    } else {
      data[i] = white * 0.4;
    }
  }
  return buffer;
}

function loopNoise(ctx: AudioContext, gain: GainNode, type: 'white' | 'brown') {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, type);
  src.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = type === 'brown' ? 400 : 1200;
  track(src);
  track(filter);
  src.connect(filter);
  filter.connect(gain);
  src.start();
}

function lfoOsc(ctx: AudioContext, gain: GainNode, rate: number, depth: number) {
  const osc = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  osc.frequency.value = rate;
  lfoGain.gain.value = depth;
  track(osc);
  track(lfoGain);
  osc.connect(lfoGain);
  lfoGain.connect(gain.gain);
  osc.start();
}

export function playAmbientSound(id: string, volume = 0.35) {
  stopAll();
  const { ctx, gain } = getCtx();
  gain.gain.value = volume;
  activeSoundId = id;

  switch (id) {
    case 'rain': {
      loopNoise(ctx, gain, 'white');
      lfoOsc(ctx, gain, 0.15, 0.08);
      break;
    }
    case 'ocean': {
      loopNoise(ctx, gain, 'brown');
      lfoOsc(ctx, gain, 0.08, 0.2);
      break;
    }
    case 'forest': {
      loopNoise(ctx, gain, 'brown');
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 600;
      bp.Q.value = 0.8;
      track(bp);
      break;
    }
    case 'white':
      loopNoise(ctx, gain, 'white');
      break;
    case 'brown':
      loopNoise(ctx, gain, 'brown');
      break;
    case 'bowl': {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 196;
      const env = ctx.createGain();
      env.gain.setValueAtTime(0, ctx.currentTime);
      env.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.8);
      env.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 8);
      track(osc);
      track(env);
      osc.connect(env);
      env.connect(gain);
      osc.start();
      osc.stop(ctx.currentTime + 8);
      setTimeout(() => {
        if (activeSoundId === 'bowl') stopAmbientSound();
      }, 8500);
      break;
    }
    case 'piano': {
      const notes = [261.63, 329.63, 392, 523.25];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const env = ctx.createGain();
        const t = ctx.currentTime + i * 2.5;
        env.gain.setValueAtTime(0, t);
        env.gain.linearRampToValueAtTime(0.12, t + 0.3);
        env.gain.exponentialRampToValueAtTime(0.001, t + 4);
        track(osc);
        track(env);
        osc.connect(env);
        env.connect(gain);
        osc.start(t);
        osc.stop(t + 4.5);
      });
      break;
    }
    case 'flute': {
      const scale = [261.63, 293.66, 329.63, 392, 440, 493.88, 523.25];
      const playFluteNote = () => {
        if (activeSoundId !== 'flute') return;
        const freq = scale[Math.floor(Math.random() * scale.length)];
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const overtone = ctx.createOscillator();
        overtone.type = 'sine';
        overtone.frequency.value = freq * 2;
        const mix = ctx.createGain();
        mix.gain.value = 0.7;
        const overtoneGain = ctx.createGain();
        overtoneGain.gain.value = 0.12;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = freq * 1.2;
        filter.Q.value = 6;
        const env = ctx.createGain();
        const t = ctx.currentTime;
        const duration = 5 + Math.random() * 4;
        env.gain.setValueAtTime(0, t);
        env.gain.linearRampToValueAtTime(0.14, t + 0.6);
        env.gain.setValueAtTime(0.1, t + duration * 0.6);
        env.gain.exponentialRampToValueAtTime(0.001, t + duration);
        track(osc);
        track(overtone);
        track(mix);
        track(overtoneGain);
        track(filter);
        track(env);
        osc.connect(mix);
        overtone.connect(overtoneGain);
        overtoneGain.connect(mix);
        mix.connect(filter);
        filter.connect(env);
        env.connect(gain);
        osc.start(t);
        overtone.start(t);
        osc.stop(t + duration + 0.1);
        overtone.stop(t + duration + 0.1);
        window.setTimeout(playFluteNote, (duration + 1.5 + Math.random() * 3) * 1000);
      };
      playFluteNote();
      break;
    }
    case 'mindRelax': {
      const pad = [261.63, 329.63, 392, 493.88];
      pad.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const env = ctx.createGain();
        env.gain.value = 0.035 - i * 0.004;
        track(osc);
        track(env);
        osc.connect(env);
        env.connect(gain);
        osc.start();
        lfoOsc(ctx, env, 0.05 + i * 0.01, 0.025);
      });
      const melody = [392, 440, 493.88, 523.25, 493.88, 440, 392, 329.63];
      let melodyIdx = 0;
      const playRelaxNote = () => {
        if (activeSoundId !== 'mindRelax') return;
        const freq = melody[melodyIdx % melody.length];
        melodyIdx += 1;
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 900;
        const env = ctx.createGain();
        const t = ctx.currentTime;
        const dur = 6;
        env.gain.setValueAtTime(0, t);
        env.gain.linearRampToValueAtTime(0.1, t + 0.8);
        env.gain.exponentialRampToValueAtTime(0.001, t + dur);
        track(osc);
        track(filter);
        track(env);
        osc.connect(filter);
        filter.connect(env);
        env.connect(gain);
        osc.start(t);
        osc.stop(t + dur + 0.1);
        window.setTimeout(playRelaxNote, (dur + 2 + Math.random() * 2) * 1000);
      };
      playRelaxNote();
      break;
    }
    case 'zenPad': {
      [174.61, 220, 261.63, 329.63].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const env = ctx.createGain();
        env.gain.value = 0.05 - i * 0.008;
        track(osc);
        track(env);
        osc.connect(env);
        env.connect(gain);
        osc.start();
        lfoOsc(ctx, env, 0.02, 0.03);
      });
      const ring = () => {
        if (activeSoundId !== 'zenPad') return;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 392;
        const env = ctx.createGain();
        const t = ctx.currentTime;
        env.gain.setValueAtTime(0, t);
        env.gain.linearRampToValueAtTime(0.06, t + 1.2);
        env.gain.exponentialRampToValueAtTime(0.001, t + 12);
        track(osc);
        track(env);
        osc.connect(env);
        env.connect(gain);
        osc.start(t);
        osc.stop(t + 12);
        window.setTimeout(ring, 14000);
      };
      ring();
      break;
    }
    case 'calmFlow': {
      loopNoise(ctx, gain, 'brown');
      lfoOsc(ctx, gain, 0.06, 0.12);
      const flowNotes = [261.63, 293.66, 329.63, 349.23, 392];
      let flowIdx = 0;
      const playFlow = () => {
        if (activeSoundId !== 'calmFlow') return;
        const freq = flowNotes[flowIdx % flowNotes.length];
        flowIdx += 1;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const env = ctx.createGain();
        const t = ctx.currentTime;
        env.gain.setValueAtTime(0, t);
        env.gain.linearRampToValueAtTime(0.07, t + 1);
        env.gain.exponentialRampToValueAtTime(0.001, t + 7);
        track(osc);
        track(env);
        osc.connect(env);
        env.connect(gain);
        osc.start(t);
        osc.stop(t + 7.5);
        window.setTimeout(playFlow, 8000);
      };
      playFlow();
      break;
    }
    case 'delta': {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 1.5;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.25;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.15;
      track(osc);
      track(lfo);
      track(lfoGain);
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      osc.connect(gain);
      lfo.start();
      osc.start();
      loopNoise(ctx, gain, 'brown');
      break;
    }
    case 'nightDrone': {
      [55, 82.5, 110].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const env = ctx.createGain();
        env.gain.value = 0.08 - i * 0.015;
        track(osc);
        track(env);
        osc.connect(env);
        env.connect(gain);
        osc.start();
        lfoOsc(ctx, env, 0.03 + i * 0.01, 0.04);
      });
      break;
    }
    case 'heartbeat': {
      const pulse = () => {
        if (activeSoundId !== 'heartbeat') return;
        const thump = ctx.createOscillator();
        thump.type = 'sine';
        thump.frequency.value = 52;
        const env = ctx.createGain();
        const t = ctx.currentTime;
        env.gain.setValueAtTime(0, t);
        env.gain.linearRampToValueAtTime(0.35, t + 0.08);
        env.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        track(thump);
        track(env);
        thump.connect(env);
        env.connect(gain);
        thump.start(t);
        thump.stop(t + 0.55);
        window.setTimeout(pulse, 920);
      };
      pulse();
      loopNoise(ctx, gain, 'brown');
      break;
    }
    case 'cosmic': {
      loopNoise(ctx, gain, 'brown');
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 280;
      track(filter);
      [130.81, 164.81, 196].forEach((freq) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const env = ctx.createGain();
        env.gain.value = 0.06;
        track(osc);
        track(env);
        osc.connect(env);
        env.connect(gain);
        osc.start();
        lfoOsc(ctx, env, 0.05, 0.03);
      });
      lfoOsc(ctx, gain, 0.12, 0.1);
      break;
    }
    default:
      loopNoise(ctx, gain, 'brown');
  }
}

export function stopAmbientSound() {
  stopAll();
  if (masterGain && ctx) {
    masterGain.gain.value = 0.35;
  }
}

export function setAmbientVolume(volume: number) {
  if (masterGain) masterGain.gain.value = Math.max(0, Math.min(1, volume));
}

export function fadeOutAmbient(ms: number) {
  if (!masterGain || !ctx) return;
  const now = ctx.currentTime;
  masterGain.gain.cancelScheduledValues(now);
  masterGain.gain.setValueAtTime(masterGain.gain.value, now);
  masterGain.gain.linearRampToValueAtTime(0, now + ms / 1000);
  window.setTimeout(stopAmbientSound, ms + 100);
}

export function getActiveSoundId() {
  return activeSoundId;
}
