// ============================================================
// Web Audio Sound-Engine – generiert kurze Sounds synthetisch
// (keine Lizenz-Probleme, keine externen Files)
// ============================================================

let audioCtx = null;
function getCtx() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch (e) { return null; }
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function tone(freq, dur, type='sine', vol=0.3, when=0) {
  const ctx = getCtx(); if (!ctx) return;
  const t0 = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0); osc.stop(t0 + dur + 0.05);
  return osc;
}

function slide(fromFreq, toFreq, dur, type='sine', vol=0.3, when=0) {
  const ctx = getCtx(); if (!ctx) return;
  const t0 = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(fromFreq, t0);
  osc.frequency.exponentialRampToValueAtTime(toFreq, t0 + dur);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0); osc.stop(t0 + dur + 0.05);
}

function noise(dur, vol=0.2, when=0, lowpass=2000) {
  const ctx = getCtx(); if (!ctx) return;
  const t0 = ctx.currentTime + when;
  const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i=0; i<data.length; i++) data[i] = (Math.random()*2-1) * (1 - i/data.length);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = lowpass;
  const gain = ctx.createGain();
  gain.gain.value = vol;
  src.connect(filter).connect(gain).connect(ctx.destination);
  src.start(t0);
}

const SOUND_PATTERNS = {
  'wahoo': () => { slide(440, 880, 0.25, 'square', 0.3); slide(880, 1320, 0.15, 'square', 0.25, 0.25); },
  'oh-yeah': () => { tone(523, 0.15, 'square', 0.3); tone(784, 0.25, 'square', 0.3, 0.18); },
  'whoosh': () => { noise(0.3, 0.3, 0, 4000); slide(200, 1500, 0.3, 'sawtooth', 0.15); },
  'spin': () => { for (let i=0;i<4;i++) tone(440 + i*220, 0.08, 'square', 0.25, i*0.06); },
  'yoshi': () => { slide(330, 660, 0.15, 'triangle', 0.35); slide(660, 440, 0.2, 'triangle', 0.3, 0.15); },
  'pow': () => { tone(110, 0.15, 'sawtooth', 0.4); noise(0.1, 0.3); },
  'shiny': () => { for (let i=0;i<5;i++) tone(523 * Math.pow(1.26, i), 0.1, 'sine', 0.25, i*0.05); },
  'zap': () => { slide(2000, 100, 0.15, 'sawtooth', 0.3); noise(0.05, 0.2, 0, 5000); },
  'roar': () => { slide(80, 200, 0.4, 'sawtooth', 0.4); noise(0.4, 0.25, 0, 800); },
  'evil-laugh': () => { for (let i=0;i<5;i++) { tone(200 + i*30, 0.1, 'square', 0.25, i*0.13); tone(150 + i*30, 0.08, 'square', 0.2, i*0.13 + 0.04); } },
  'sparkle': () => { for (let i=0;i<8;i++) tone(800 + Math.random()*1200, 0.06, 'sine', 0.2, i*0.04); },
  'fanfare': () => { tone(523, 0.2, 'square', 0.3); tone(659, 0.2, 'square', 0.3); tone(784, 0.4, 'square', 0.35, 0.2); tone(1047, 0.4, 'square', 0.35, 0.2); },
  // Ninjago-Sounds
  'fire-whoosh': () => { noise(0.5, 0.35, 0, 1500); slide(800, 200, 0.5, 'sawtooth', 0.2); },
  'thunder': () => { slide(2500, 80, 0.18, 'sawtooth', 0.4); noise(0.3, 0.4, 0.15, 800); tone(60, 0.2, 'sawtooth', 0.4, 0.18); },
  'earth-stomp': () => { tone(50, 0.4, 'sawtooth', 0.5); tone(80, 0.35, 'sawtooth', 0.4, 0.05); noise(0.3, 0.3, 0, 400); },
  'ice-crystal': () => { for (let i=0;i<6;i++) tone(1500 + i*200, 0.08, 'sine', 0.18, i*0.05); tone(2500, 0.3, 'triangle', 0.15, 0.3); },
  'energy-burst': () => { slide(440, 1760, 0.3, 'square', 0.3); for (let i=0;i<4;i++) tone(880 + i*220, 0.1, 'square', 0.2, 0.3 + i*0.05); },
  'water-splash': () => { noise(0.4, 0.3, 0, 3000); slide(600, 200, 0.4, 'sine', 0.2); for (let i=0;i<5;i++) tone(400 + Math.random()*400, 0.08, 'sine', 0.15, i*0.06); },
  'gong': () => { tone(110, 1.5, 'sine', 0.4); tone(165, 1.2, 'sine', 0.25, 0.02); tone(220, 1.0, 'sine', 0.15, 0.04); }
};

function playSound(name) {
  const fn = SOUND_PATTERNS[name];
  if (fn) try { fn(); } catch (e) {}
}

// Zusätzliche Sound-Effekte für Aufgaben (richtig/falsch/freischalten)
function sfxCorrect() { tone(523, 0.1, 'square', 0.2); tone(784, 0.15, 'square', 0.25, 0.1); }
function sfxWrong() { tone(220, 0.15, 'sawtooth', 0.25); tone(180, 0.2, 'sawtooth', 0.2, 0.12); }
function sfxUnlock() { for (let i=0;i<6;i++) tone(523 * Math.pow(1.122, i), 0.12, 'square', 0.3, i*0.08); }
