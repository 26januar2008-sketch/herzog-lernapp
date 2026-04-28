// ============================================================
// Lern-Engine: Profile, Fortschritt, Adaptive Schwierigkeit, Belohnungen
// ============================================================

const STORAGE_KEY = 'herzog_lernapp_v1';
const PARENT_PIN = '1979'; // Michael's PIN, kann er ändern

const DEFAULT_STATE = {
  profiles: {
    liam: {
      name: 'Liam', age: 9, theme: 'liam', class: 3,
      coins: 0,
      unlocked: [],
      stats: { read:{tries:0,correct:0,level:0}, math:{tries:0,correct:0,level:0}, sach:{tries:0,correct:0,level:0}, musik:{tries:0,correct:0,level:0} },
      history: [],
      lastIndex: { read: -1, math: -1, sach: -1, musik: -1 },
      shop: [],          // gekaufte SHOP_ITEMS
      char_outfits: {},  // charId -> outfit/bg/effect
      powerup_double: false  // nächste richtige Antwort: doppelt Coins
    },
    raik: {
      name: 'Raik', age: 7, theme: 'raik', class: 1,
      coins: 0,
      unlocked: [],
      stats: { read:{tries:0,correct:0,level:0}, math:{tries:0,correct:0,level:0}, sach:{tries:0,correct:0,level:0}, musik:{tries:0,correct:0,level:0} },
      history: [],
      lastIndex: { read: -1, math: -1, sach: -1, musik: -1 },
      shop: [],
      char_outfits: {},
      powerup_double: false,
      sessionCount: 0  // Für Pause-Trigger nach 5 Aufgaben
    }
  }
};

const State = {
  data: null,
  load(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this.data = raw ? JSON.parse(raw) : structuredClone(DEFAULT_STATE);
    } catch(e){
      this.data = structuredClone(DEFAULT_STATE);
    }
    // Sicherstellen dass beide Profile existieren (Migration bei Updates)
    for (const k of ['liam','raik']) {
      if (!this.data.profiles[k]) this.data.profiles[k] = structuredClone(DEFAULT_STATE.profiles[k]);
    }
  },
  save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data)); },
  reset(){ localStorage.removeItem(STORAGE_KEY); this.load(); }
};

// Aufgabe-Auswahl: Adaptive Schwierigkeit + sanfter Einstieg + Anti-Wiederhol-Liste
function pickTask(profileKey, subject) {
  const p = State.data.profiles[profileKey];
  let pool;
  if (profileKey === 'liam') {
    pool = { read:LIAM_STORIES, math:LIAM_MATH, sach:LIAM_SACH, musik:LIAM_MUSIK }[subject];
  } else {
    pool = { read:RAIK_READING, math:RAIK_MATH, sach:RAIK_SACH, musik:RAIK_MUSIK }[subject];
  }
  // Sanfter Einstieg nur Liam
  let candidates = pool;
  const tries = p.stats[subject]?.tries || 0;
  if (profileKey === 'liam' && typeof Settings !== 'undefined' && Settings.isEnabled('gentle_start')) {
    if (tries < 5) candidates = pool.slice(0, Math.max(3, Math.floor(pool.length / 3)));
    else if (tries < 15) candidates = pool.slice(0, Math.max(5, Math.floor(pool.length * 2 / 3)));
  }
  // Anti-Wiederhol: tracke letzte 8 Indizes pro Fach
  if (!p.recentIdx) p.recentIdx = {};
  if (!p.recentIdx[subject]) p.recentIdx[subject] = [];
  const recent = p.recentIdx[subject];

  // Erstelle Liste aller Indizes aus candidates (im Original-Pool)
  const candIndices = candidates.map(c => pool.indexOf(c));
  // Filtere die zuletzt benutzten raus
  let available = candIndices.filter(i => !recent.includes(i));
  // Wenn nichts übrig: alle erlaubt (Pool zu klein)
  if (available.length === 0) available = candIndices;

  const realIdx = available[Math.floor(Math.random() * available.length)];
  // Update recent: max 8 letzte (oder pool.length-1)
  recent.push(realIdx);
  const maxRecent = Math.min(8, Math.floor(candidates.length * 0.7));
  while (recent.length > maxRecent) recent.shift();
  p.lastIndex[subject] = realIdx;
  return { item: pool[realIdx], idx: realIdx };
}

function recordAnswer(profileKey, subject, correct) {
  const p = State.data.profiles[profileKey];
  const s = p.stats[subject];
  s.tries++;
  if (correct) {
    s.correct++;
    let reward = profileKey === 'liam'
      ? (subject === 'read' ? 3 : subject === 'math' ? 1 : 2)
      : (subject === 'read' ? 2 : 1);
    if (p.powerup_double) { reward *= 2; p.powerup_double = false; }
    p.coins += reward;
    p.sessionCount = (p.sessionCount||0) + 1;
  }
  // Adaptive Level (einfach gehalten)
  const ratio = s.correct / Math.max(s.tries, 1);
  if (ratio > 0.8 && s.tries >= 5) s.level = Math.min(3, s.level+1);
  if (ratio < 0.4 && s.tries >= 5) s.level = Math.max(0, s.level-1);
  p.history.push({ ts: Date.now(), subject, correct });
  if (p.history.length > 200) p.history = p.history.slice(-200);
  // KEIN Auto-Unlock mehr - Items müssen aktiv mit Münzen gekauft werden
  State.save();
  return { unlocked: null, coins: p.coins };
}

// Aktiver Kauf eines Items (Maschine oder Charakter)
function buyItem(profileKey, itemId) {
  const p = State.data.profiles[profileKey];
  const collection = profileKey === 'liam' ? MACHINES : CHARS;
  const item = collection.find(x => x.id === itemId);
  if (!item) return { ok:false, reason:'nicht gefunden' };
  if (p.unlocked.includes(itemId)) return { ok:false, reason:'schon gekauft' };
  if (p.coins < item.price) return { ok:false, reason:'zu wenig Münzen' };
  p.coins -= item.price;
  p.unlocked.push(itemId);
  grantStandardCard(profileKey, itemId);
  State.save();
  return { ok:true, item };
}

// ===== Sammelkarten =====
function ensureCards(profileKey) {
  const p = State.data.profiles[profileKey];
  if (!p.cards) p.cards = {}; // {charId: ['standard', 'gold', ...]}
}
function grantStandardCard(profileKey, charId) {
  ensureCards(profileKey);
  const p = State.data.profiles[profileKey];
  if (!p.cards[charId]) p.cards[charId] = [];
  if (!p.cards[charId].includes('standard')) p.cards[charId].push('standard');
  State.save();
}
function pickRandomEdition() {
  const r = Math.random();
  let acc = 0;
  // Verteilung: standard rarer als angegeben (nur wenige), bronze häufig, etc.
  const weights = {standard:0, bronze:50, silver:25, gold:15, holo:8, shiny:2};
  let total = 0; for (const k in weights) total += weights[k];
  const pick = Math.random() * total;
  let cum = 0;
  for (const e of CARD_EDITIONS) {
    cum += weights[e.id] || 0;
    if (pick < cum) return e.id;
  }
  return 'bronze';
}
function openBoosterPack(profileKey) {
  const p = State.data.profiles[profileKey];
  const COST = 25;
  if (p.coins < COST) return null;
  if (p.unlocked.length === 0) return null; // keine Chars noch frei
  p.coins -= COST;
  ensureCards(profileKey);
  // Wähle zufälligen freigeschalteten Char
  const charId = p.unlocked[Math.floor(Math.random() * p.unlocked.length)];
  const edition = pickRandomEdition();
  if (!p.cards[charId]) p.cards[charId] = [];
  const isNew = !p.cards[charId].includes(edition);
  if (isNew) p.cards[charId].push(edition);
  State.save();
  return { charId, edition, isNew, cost: COST };
}

// Power-Up nutzen (Coins abziehen)
function usePowerup(profileKey, powerupId) {
  const p = State.data.profiles[profileKey];
  const pu = POWERUPS.find(x => x.id === powerupId);
  if (!pu || p.coins < pu.price) return false;
  p.coins -= pu.price;
  if (powerupId === 'double') p.powerup_double = true;
  State.save();
  return true;
}

// Shop-Item kaufen für aktiven Charakter
function buyShopItem(profileKey, charId, itemId) {
  const p = State.data.profiles[profileKey];
  const item = SHOP_ITEMS.find(x => x.id === itemId);
  if (!item || p.coins < item.price) return false;
  p.coins -= item.price;
  if (!p.shop.includes(itemId)) p.shop.push(itemId);
  if (!p.char_outfits) p.char_outfits = {};
  if (!p.char_outfits[charId]) p.char_outfits[charId] = {};
  p.char_outfits[charId][item.kind] = itemId;
  State.save();
  return true;
}

function todayStats(profileKey) {
  const p = State.data.profiles[profileKey];
  const today = new Date(); today.setHours(0,0,0,0);
  const t = today.getTime();
  const todays = p.history.filter(h => h.ts >= t);
  return {
    total: todays.length,
    correct: todays.filter(h => h.correct).length,
    read: todays.filter(h => h.subject==='read').length,
    math: todays.filter(h => h.subject==='math').length
  };
}
