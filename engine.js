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

// ===== Abwechslungs-Bonus (gegen Einseitigkeits-Farming) =====
// Gleiche Aufgabenart oft hintereinander → Münzen werden weniger
// (nie 0!). Fachwechsel nach einer Serie → +1 Bonus-Münze.
// Kindgerecht: kein Abzug, nur „volle Münzen gibt's bei Abwechslung".
function varietyAdjust(profileKey, taskType, baseReward) {
  const p = State.data.profiles[profileKey];
  if (profileKey === 'alva') return { reward: baseReward, bonus: 0, reduced: false, firstReduced: false }; // Alva (4) immer voll
  if (!p.recentTypes) p.recentTypes = [];
  const arr = p.recentTypes;
  // Wie lang ist die gleichartige Serie am Ende?
  let run = 0;
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] === taskType) run++; else break;
  }
  let reward = baseReward, reduced = false;
  if (run >= 6) { reward = 1; reduced = baseReward > 1; }
  else if (run >= 3) { reward = Math.max(1, Math.ceil(baseReward / 2)); reduced = reward < baseReward; }
  // Bonus: vorher lief 3+ mal etwas anderes, jetzt gewechselt
  let bonus = 0;
  if (arr.length >= 3 && arr[arr.length - 1] !== taskType) {
    const lastType = arr[arr.length - 1];
    let lastRun = 0;
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i] === lastType) lastRun++; else break;
    }
    if (lastRun >= 3) bonus = 1;
  }
  arr.push(taskType);
  if (arr.length > 30) arr.splice(0, arr.length - 30);
  return { reward: reward + bonus, bonus, reduced, firstReduced: reduced && run === 3 };
}

function recordAnswer(profileKey, subject, correct) {
  const p = State.data.profiles[profileKey];
  // Auto-init unbekannte Subjects (z.B. 'extra' für Knobeln)
  if (!p.stats[subject]) p.stats[subject] = {tries:0, correct:0, level:0};
  if (!p.lastIndex[subject]) p.lastIndex[subject] = -1;
  const s = p.stats[subject];
  s.tries++;
  let adj = null;
  if (correct) {
    s.correct++;
    let reward = profileKey === 'liam'
      ? (subject === 'read' ? 3 : subject === 'math' ? 1 : 2)
      : (subject === 'read' ? 2 : 1);
    if (p.powerup_double) { reward *= 2; p.powerup_double = false; }
    adj = varietyAdjust(profileKey, subject, reward);
    p.coins += adj.reward;
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
  return {
    unlocked: null,
    coins: p.coins,
    bonus: adj ? adj.bonus : 0,
    reduced: adj ? adj.reduced : false,
    firstReduced: adj ? adj.firstReduced : false
  };
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

// ============================================================
// Pokémon-Fang-System (Raik): alle 5 richtigen Antworten
// erscheint ein wildes Pokémon. Nutzt die bestehende
// unlocked-Sammlung, damit der Supabase-Sync weiterläuft.
// ============================================================

// Welche Pokédex-Nummern hat das Profil schon?
// (pkm_*-IDs direkt, alte Einzel-Charaktere wie 'glumanda' über den Namen)
function caughtDexNumbers(p) {
  const set = new Set();
  if (typeof POKEDEX === 'undefined' || typeof CHARS === 'undefined') return set;
  const byName = {};
  for (const e of POKEDEX) byName[e.de] = e.n;
  for (const id of (p.unlocked || [])) {
    const c = CHARS.find(x => x.id === id);
    if (!c) continue;
    if (c.pokedexNo) set.add(c.pokedexNo);
    else if (byName[c.name]) set.add(byName[c.name]);
  }
  return set;
}

function isLegendaryDex(n) { return (n >= 144 && n <= 151) || (n >= 243 && n <= 251); }

// Wildes Pokémon ziehen: überwiegend häufige, bei starken Tagen (15/25
// richtige) seltenere. Legendäre nur bei perfekter 10er-Serie ohne Fehler
// oder perfektem Tag (ab 20 Aufgaben, alle richtig). Bereits gefangene
// werden nicht doppelt gezogen, solange noch welche fehlen.
function pickWildPokemon(profileKey) {
  if (typeof CHARS === 'undefined' || typeof POKEDEX === 'undefined') return null;
  const p = State.data.profiles[profileKey];
  const all = CHARS.filter(c => c.pokedexNo);
  if (all.length === 0) return null;
  const caught = caughtDexNumbers(p);
  const missing = all.filter(c => !caught.has(c.pokedexNo));
  if (missing.length === 0) {
    // Alle 251 gefangen: ein bekanntes Pokémon schaut vorbei (Bonus-Münzen)
    return { char: all[Math.floor(Math.random() * all.length)], alreadyCaught: true };
  }
  const today = todayStats(profileKey);
  const last10 = (p.history || []).slice(-10);
  const perfectRun = last10.length === 10 && last10.every(h => h.correct);
  const perfectDay = today.total >= 20 && today.correct === today.total;
  const legends = missing.filter(c => isLegendaryDex(c.pokedexNo));
  if (legends.length && (perfectRun || perfectDay) && Math.random() < 0.25) {
    return { char: legends[Math.floor(Math.random() * legends.length)], legendary: true };
  }
  const normal = missing.filter(c => !isLegendaryDex(c.pokedexNo));
  const pool = normal.length ? normal : missing;
  // Seltenheit über den Preis (spiegelt Pokédex-Nr + Endform wider)
  const common = pool.filter(c => c.price <= 45);
  const medium = pool.filter(c => c.price > 45 && c.price <= 90);
  const rare   = pool.filter(c => c.price > 90);
  let wC = 70, wM = 25, wR = 5;
  if (today.correct >= 25)      { wC = 35; wM = 40; wR = 25; }
  else if (today.correct >= 15) { wC = 50; wM = 35; wR = 15; }
  const buckets = [[common, wC], [medium, wM], [rare, wR]].filter(b => b[0].length > 0);
  if (buckets.length === 0) return { char: pool[Math.floor(Math.random() * pool.length)] };
  const total = buckets.reduce((s, b) => s + b[1], 0);
  let r = Math.random() * total;
  for (const [arr, w] of buckets) {
    r -= w;
    if (r < 0) return { char: arr[Math.floor(Math.random() * arr.length)] };
  }
  return { char: pool[Math.floor(Math.random() * pool.length)] };
}

// Gefangenes Pokémon in die bestehende unlocked-Sammlung übernehmen
function catchPokemon(profileKey, charId) {
  const p = State.data.profiles[profileKey];
  const isNew = !p.unlocked.includes(charId);
  if (isNew) {
    p.unlocked.push(charId);
    grantStandardCard(profileKey, charId);
  } else {
    p.coins += 15; // Bonus, falls schon da (nur möglich wenn alle 251 gefangen)
  }
  State.save();
  return { isNew };
}
