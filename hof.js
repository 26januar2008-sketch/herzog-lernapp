// ============================================================
// LIAMS BAUERNHOF v5 - Epochen, freie Platzierung, Brachland
// ============================================================

const SUPABASE_URL = 'https://nrmqdhcrshyoigesqapm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ybXFkaGNyc2h5b2lnZXNxYXBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MTQ3MjksImV4cCI6MjA4ODk5MDcyOX0.Hw4hg6f9iiJcw92veiEU4-oPGcRX_k5NoLuxHU5_ors';
const TEST_MODE = new URLSearchParams(location.search).has('test');
const SAVE_KEY = TEST_MODE ? 'liam_hof_test_v5' : 'liam_hof_v5';
const ZEIT_FAKTOR = TEST_MODE ? 0.1 : 1;
const BRACH_BONUS_MS = (TEST_MODE ? 30 : 300) * 1000; // ab 5 min Brache → Bonus

// === große Welt ===
const W = 2400, H = 1600;
const VIEW_W = 1200, VIEW_H = 800;

// ============================================================
// EPOCHEN – jede schaltet neue Sachen frei + Lerntext
// ============================================================
const EPOCHEN = [
  { id:'steinzeit', name:'Jungsteinzeit', em:'🪨', kosten:0,
    farbeHimmel:'#c8a070', farbeBoden:'#8d6e63',
    lerntext:'Vor 10 000 Jahren wurden Menschen sesshaft. Mit Hacken aus Stein und Holz haben sie kleine Felder neben ihren Hütten bestellt. Dünger gab es nicht – also wechselten sie die Felder durch.' },
  { id:'antike', name:'Antike', em:'🏛️', kosten:600,
    farbeHimmel:'#9ec5fe', farbeBoden:'#9ccc65',
    lerntext:'Die Römer und Griechen bauten Steinhäuser mit Säulen und Atrium. Ochsen zogen den Holzpflug. Erste Wassermühlen mahlten Korn zu Mehl.' },
  { id:'wikinger', name:'Wikingerzeit', em:'⚔️', kosten:1800,
    farbeHimmel:'#90a4ae', farbeBoden:'#7cb342',
    lerntext:'Vor 1 200 Jahren! Die Wikinger lebten in langen Holzhäusern mit Grasdach und Drachenköpfen am Giebel. Sie züchteten Schafe für Wolle, fuhren mit Drachenbooten über die Meere und brachten neue Pflanzen wie Roggen aus dem Osten mit.' },
  { id:'mittelalter', name:'Mittelalter', em:'🏰', kosten:4000,
    farbeHimmel:'#90caf9', farbeBoden:'#7cb342',
    lerntext:'Drei-Felder-Wirtschaft: ein Feld Sommerfrucht, eins Winterfrucht, eins BRACH (ruht). So bleibt der Boden fruchtbar! Ritter pflügten mit Pferden, Windmühlen mahlten das Korn.' },
  { id:'industrie', name:'Industriezeit', em:'🏭', kosten:18000,
    farbeHimmel:'#a5d6a7', farbeBoden:'#7cb342',
    lerntext:'Dampf-Pflüge und Lanz-Bulldog! Erste Mähdrescher ersetzen Sense und Sichel. Eisenbahnen bringen Dünger und Kohle aufs Land.' },
  { id:'moderne', name:'Moderne', em:'🚜', kosten:60000,
    farbeHimmel:'#7ec8e3', farbeBoden:'#7cb342',
    lerntext:'GPS-Trecker, 12 m breite Mähdrescher, Roboter im Stall. Heute ernährt 1 Bauer ca. 140 Menschen – früher nur 4!' }
];

// ============================================================
// TRAKTOREN – wählbar in der Werkstatt-Garage
// ============================================================
const TRAKTOR_TYPEN = {
  hacke:      { name:'Steinhacke', em:'🪨', epoche:'steinzeit', preis:0, speed:0.8 },
  ochse:      { name:'Ochsenpflug', em:'🐂', epoche:'antike', preis:300, speed:1.0 },
  drachenboot:{ name:'Drachenboot', em:'⛵', epoche:'wikinger', preis:800, speed:1.2 },
  pferd:      { name:'Pferdegespann', em:'🐴', epoche:'mittelalter', preis:1500, speed:1.4 },
  dampfpflug: { name:'Dampfpflug', em:'💨', epoche:'industrie', preis:6000, speed:1.6 },
  lanzbulldog:{ name:'Lanz Bulldog', em:'🚜', epoche:'industrie', preis:9000, speed:1.8 },
  fendt312:   { name:'Fendt 312', em:'🚜', epoche:'moderne', preis:0, speed:2.0 },
  jd6r:       { name:'John Deere 6R', em:'🚜', epoche:'moderne', preis:12000, speed:2.4 },
  fendt1050:  { name:'Fendt 1050', em:'🚜', epoche:'moderne', preis:35000, speed:3.0 }
};

// ============================================================
// CROPS – pro Epoche freigeschaltet
// ============================================================
const CROP_CONFIG = {
  weizen:    { em:'🌾', name:'Weizen',    wachstumMs:60000,  ertragSaecke:8,  preisProSack:5,  saatkosten:5,  color:'#fdd835', epoche:'steinzeit' },
  gerste:    { em:'🌾', name:'Gerste',    wachstumMs:75000,  ertragSaecke:7,  preisProSack:7,  saatkosten:6,  color:'#dce775', epoche:'steinzeit' },
  hafer:     { em:'🌾', name:'Hafer',     wachstumMs:80000,  ertragSaecke:7,  preisProSack:9,  saatkosten:7,  color:'#c5e1a5', epoche:'antike' },
  roggen:    { em:'🌾', name:'Roggen',    wachstumMs:90000,  ertragSaecke:6,  preisProSack:11, saatkosten:8,  color:'#bcaaa4', epoche:'antike' },
  wiese:     { em:'🍃', name:'Heu',       wachstumMs:90000,  ertragSaecke:5,  preisProSack:10, saatkosten:0,  color:'#aed581', epoche:'wikinger' },
  mais:      { em:'🌽', name:'Mais',      wachstumMs:90000,  ertragSaecke:12, preisProSack:8,  saatkosten:8,  color:'#fbc02d', epoche:'industrie' },
  kartoffel: { em:'🥔', name:'Kartoffel', wachstumMs:120000, ertragSaecke:10, preisProSack:15, saatkosten:12, color:'#7cb342', epoche:'industrie' },
  ruebe:     { em:'🍠', name:'Rübe',      wachstumMs:180000, ertragSaecke:8,  preisProSack:35, saatkosten:20, color:'#9c27b0', epoche:'industrie' },
  raps:      { em:'🌻', name:'Raps',      wachstumMs:150000, ertragSaecke:6,  preisProSack:25, saatkosten:15, color:'#fdd835', epoche:'moderne' },
  soja:      { em:'🌱', name:'Soja',      wachstumMs:130000, ertragSaecke:7,  preisProSack:22, saatkosten:14, color:'#a5d6a7', epoche:'moderne' }
};

// ============================================================
// FELDER – im Außenring, organisch verteilt
// ============================================================
const FELD_LAYOUT = {
  feld_1:  {x:80,   y:240, w:340, h:180},
  feld_2:  {x:80,   y:460, w:340, h:200},
  feld_3:  {x:60,   y:720, w:380, h:200},
  feld_4:  {x:100,  y:980, w:340, h:200},
  feld_5:  {x:1980, y:240, w:340, h:180},
  feld_6:  {x:1960, y:460, w:380, h:220},
  feld_7:  {x:1980, y:740, w:340, h:200},
  feld_8:  {x:2000, y:1000,w:320, h:180},
  feld_9:  {x:520,  y:1280, w:340, h:200},
  feld_10: {x:920,  y:1300, w:340, h:200},
  feld_11: {x:1320, y:1280, w:340, h:200},
  feld_12: {x:1700, y:1300, w:280, h:200}
};

// ============================================================
// GEBÄUDE – natürlich um den Hof verteilt (nicht in Reihe)
// Werte sind DEFAULTS; gekaufte Gebäude bekommen eine Position
// in GS.gebaeudePos die per freier Platzierung gesetzt wird.
// ============================================================
const GEBAEUDE_DEFAULTS = {
  wohnhaus:     {x:780,  y:520, w:280, h:340, name:'Wohnhaus',      em:'🏠', epoche:'steinzeit' },
  feuerstelle:  {x:1080, y:760, w:120, h:120, name:'Feuerstelle',   em:'🔥', epoche:'steinzeit' },
  vorratsgrube: {x:600,  y:760, w:140, h:140, name:'Vorratsgrube',  em:'🪣', epoche:'steinzeit' },
  huehnerstall: {x:1140, y:580, w:240, h:240, name:'Hühnerstall',   em:'🐔', epoche:'antike' },
  steinstall:   {x:1420, y:540, w:280, h:300, name:'Ochsenstall',   em:'🐂', epoche:'antike' },
  muehle:       {x:480,  y:380, w:200, h:280, name:'Wassermühle',   em:'⚙️', epoche:'antike' },
  langhaus:     {x:300,  y:480, w:380, h:240, name:'Wikinger-Langhaus', em:'⚔️', epoche:'wikinger' },
  schafstall:   {x:1700, y:1000,w:240, h:200, name:'Schafstall',    em:'🐑', epoche:'wikinger' },
  fachwerkhaus: {x:760,  y:200, w:300, h:280, name:'Fachwerkhaus',  em:'🏡', epoche:'mittelalter' },
  windmuehle:   {x:1750, y:200, w:200, h:340, name:'Windmühle',     em:'🌀', epoche:'mittelalter' },
  schmiede:     {x:1100, y:300, w:240, h:220, name:'Schmiede',      em:'⚒️', epoche:'mittelalter' },
  kuhstall:     {x:1500, y:880, w:340, h:300, name:'Kuhstall',      em:'🐮', epoche:'mittelalter' },
  schweinestall:{x:1180, y:920, w:240, h:220, name:'Schweinestall', em:'🐷', epoche:'mittelalter' },
  scheune:      {x:560,  y:140, w:340, h:260, name:'Scheune',       em:'🏚️', epoche:'industrie' },
  silo:         {x:1820, y:560, w:140, h:380, name:'Silo',          em:'🏗️', epoche:'industrie' },
  werkstatt:    {x:920,  y:920, w:300, h:220, name:'Werkstatt',     em:'🔧', epoche:'industrie' },
  hofladen:     {x:1380, y:160, w:260, h:220, name:'Hofladen',      em:'🏪', epoche:'moderne' },
  tankstelle:   {x:600,  y:920, w:240, h:180, name:'Tankstelle',    em:'⛽', epoche:'moderne' },
  biogas:       {x:240,  y:140, w:300, h:260, name:'Biogasanlage',  em:'🔋', epoche:'moderne' }
};

// ============================================================
// SHOP – pro Epoche gefiltert
// ============================================================
const SHOP_KATALOG = {
  gebaeude: [
    { id:'feuerstelle',  preis:30,    desc:'Wärme + Kochen' },
    { id:'vorratsgrube', preis:80,    desc:'Mehr Lager' },
    { id:'huehnerstall', preis:200,   desc:'+2 Hühner' },
    { id:'steinstall',   preis:500,   desc:'Ochsen halten' },
    { id:'muehle',       preis:900,   desc:'Korn → Mehl' },
    { id:'langhaus',     preis:1200,  desc:'Wikinger-Halle' },
    { id:'schafstall',   preis:900,   desc:'+2 Schafe, Wolle' },
    { id:'fachwerkhaus', preis:1500,  desc:'Mehr Wohnraum' },
    { id:'windmuehle',   preis:2400,  desc:'Wind = Energie' },
    { id:'schmiede',     preis:1800,  desc:'Werkzeuge' },
    { id:'kuhstall',     preis:2000,  desc:'+1 Kuh' },
    { id:'schweinestall',preis:2500,  desc:'Mastvieh' },
    { id:'scheune',      preis:6000,  desc:'XL-Lager' },
    { id:'silo',         preis:7500,  desc:'Futter-Silo' },
    { id:'werkstatt',    preis:8000,  desc:'Trecker tunen' },
    { id:'hofladen',     preis:12000, desc:'Direktverkauf +20 %' },
    { id:'tankstelle',   preis:15000, desc:'Diesel günstiger' },
    { id:'biogas',       preis:30000, desc:'Mais → Strom' }
  ],
  felder: [
    { id:'feld_1', preis:40 }, { id:'feld_2', preis:80 }, { id:'feld_3', preis:160 },
    { id:'feld_4', preis:300 }, { id:'feld_5', preis:600 }, { id:'feld_6', preis:1000 },
    { id:'feld_7', preis:1800 }, { id:'feld_8', preis:3000 }, { id:'feld_9', preis:5000 },
    { id:'feld_10',preis:7500 }, { id:'feld_11',preis:10000}, { id:'feld_12',preis:14000 }
  ],
  maschinen: [], // wird dynamisch aus TRAKTOR_TYPEN gefüllt
  tiere: [
    { id:'huhn',    name:'+ Huhn',  em:'🐔', preis:50,  desc:'5 Eier/Tag', requires:'huehnerstall', wiederholbar:true, max:12 },
    { id:'ochse',   name:'+ Ochse', em:'🐂', preis:200, desc:'Zugtier',    requires:'steinstall',  wiederholbar:true, max:4 },
    { id:'schaf',   name:'+ Schaf', em:'🐑', preis:120, desc:'Wolle + Milch', requires:'schafstall', wiederholbar:true, max:8 },
    { id:'kuh',     name:'+ Kuh',   em:'🐮', preis:500, desc:'8 L Milch',  requires:'kuhstall',    wiederholbar:true, max:8 },
    { id:'schwein', name:'+ Schwein',em:'🐷',preis:300, desc:'Mastvieh',   requires:'schweinestall',wiederholbar:true, max:8 },
    { id:'pferd',   name:'Pferd',   em:'🐴', preis:1500,desc:'Reittier',   requires:'steinstall' },
    { id:'hund',    name:'Hofhund', em:'🐶', preis:600, desc:'Bewacht den Hof', requires:'huehnerstall' }
  ]
};
// Maschinen aus TRAKTOR_TYPEN aufbauen
for (const tid in TRAKTOR_TYPEN) {
  const t = TRAKTOR_TYPEN[tid];
  if (t.preis === 0) continue;
  SHOP_KATALOG.maschinen.push({ id:'trk_'+tid, traktorId:tid, name:t.name, em:t.em, preis:t.preis, desc:`Tempo ×${t.speed}`, epoche:t.epoche });
}

// ============================================================
// State
// ============================================================
let GS = null;
let werkzeugAktiv = 'pflug';
let kameraX = 600, kameraY = 400;
let platzierenItem = null; // {gid, w, h} wenn Spieler gerade ein Gebäude platziert
let platzierenPos = {x:600, y:400};

const DEFAULT_STATE = {
  geld: TEST_MODE ? 5000 : 80,
  epoche: 'steinzeit',
  gekauft: ['wohnhaus','feld_1'],
  felder: { feld_1: {stage:0, type:null, plantedAt:null, fortschritt:0, brachSeit:Date.now(), bonusReady:false} },
  gebaeudePos: { wohnhaus: {x:780,y:520} },
  tiere: {},
  trecker: { x:1100, y:700, rot:0 },
  treckerOwn: ['hacke'],
  treckerAktiv: 'hacke',
  inventar: {},
  stats: {geernet:0, kaeufe:0, mathe_richtig:0, mathe_falsch:0, brachgenutzt:0},
  gesehen: {} // für einmalige Lerntexte
};

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    GS = raw ? Object.assign({}, structuredClone(DEFAULT_STATE), JSON.parse(raw)) : structuredClone(DEFAULT_STATE);
  } catch { GS = structuredClone(DEFAULT_STATE); }
  // Defaults nachziehen
  for (const k in DEFAULT_STATE) if (GS[k] == null) GS[k] = structuredClone(DEFAULT_STATE[k]);
  if (!GS.felder.feld_1) GS.felder.feld_1 = {stage:0, type:null, plantedAt:null, fortschritt:0, brachSeit:Date.now()};
  if (!GS.gebaeudePos.wohnhaus) GS.gebaeudePos.wohnhaus = {x:780, y:520};
  if (!GS.treckerOwn || !GS.treckerOwn.length) GS.treckerOwn = ['hacke'];
  if (!GS.treckerAktiv || !TRAKTOR_TYPEN[GS.treckerAktiv]) GS.treckerAktiv = GS.treckerOwn[0];
  for (const fid in GS.felder) {
    const f = GS.felder[fid];
    if (f.fortschritt == null) f.fortschritt = 0;
    if (f.brachSeit == null) f.brachSeit = Date.now();
    if (f.bonusReady == null) f.bonusReady = false;
  }
}

function saveState() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(GS));
  if (TEST_MODE) return;
  clearTimeout(saveState._t);
  saveState._t = setTimeout(syncToSupabase, 2000);
}
async function syncToSupabase() {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/lernapp_state?profile_key=eq.liam`, {
      method:'PATCH',
      headers:{apikey:SUPABASE_KEY, Authorization:'Bearer '+SUPABASE_KEY, 'Content-Type':'application/json', Prefer:'return=minimal'},
      body: JSON.stringify({char_outfits: {hof_v5: GS}})
    });
  } catch (e) {}
}

// ============================================================
// Utils
// ============================================================
const root = document.getElementById('hof-app');
function el(tag, attrs={}, ...kids) {
  const e = document.createElement(tag);
  for (const k in attrs) {
    if (k === 'class') e.className = attrs[k];
    else if (k === 'onclick') e.addEventListener('click', attrs[k]);
    else if (k === 'style' && typeof attrs[k] === 'object') Object.assign(e.style, attrs[k]);
    else e.setAttribute(k, attrs[k]);
  }
  for (const c of kids) {
    if (c == null) continue;
    e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return e;
}
function svgEl(tag, attrs={}, ...kids) {
  const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const k in attrs) {
    if (k === 'onclick') e.addEventListener('click', attrs[k]);
    else e.setAttribute(k, attrs[k]);
  }
  for (const c of kids) {
    if (c == null) continue;
    e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return e;
}
function clear() { root.innerHTML = ''; }
function toast(msg, color) {
  const t = el('div', {class:'toast'}, msg);
  if (color) t.style.background = color;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}
function formatGeld(g) { return Math.round(g).toLocaleString('de-DE') + ' €'; }
function epocheIdx(eid) { return EPOCHEN.findIndex(e => e.id === eid); }
function aktuelleEpoche() { return EPOCHEN[epocheIdx(GS.epoche)] || EPOCHEN[0]; }
function epocheUnlocked(eid) { return epocheIdx(eid) <= epocheIdx(GS.epoche); }
function gebaeudePos(gid) {
  return GS.gebaeudePos[gid] || GEBAEUDE_DEFAULTS[gid];
}
function gebaeudeBox(gid) {
  const p = gebaeudePos(gid);
  const d = GEBAEUDE_DEFAULTS[gid];
  return { x: p.x, y: p.y, w: d.w, h: d.h };
}

// ============================================================
// UI Aufbau
// ============================================================
let svgEle = null;
let weltGrp = null;
let treckerGrp = null;

function buildUI() {
  clear();
  const ep = aktuelleEpoche();
  root.appendChild(el('div', {class:'topbar'},
    el('button', {class:'back', onclick: zurueckZurApp}, '⬅️'),
    el('div', {style:{display:'flex', gap:'8px', 'align-items':'center'}},
      el('button', {class:'shop-btn', style:{background:'linear-gradient(180deg,#7e57c2,#4527a0)', 'box-shadow':'0 4px 0 #311b92'}, onclick: openEpocheModal},
        ep.em + ' ' + ep.name),
      el('div', {id:'geldAnzeige', class:'geld'},
        el('div', {class:'coin'}, '€'),
        el('span', {id:'geldText'}, formatGeld(GS.geld))
      )
    ),
    el('button', {class:'shop-btn', onclick: openShop}, '🛒')
  ));

  if (TEST_MODE) {
    root.appendChild(el('div', {class:'cheats'},
      el('span', {style:'padding:6px 10px'}, '🧪'),
      cheatBtn('+1k€', () => { GS.geld += 1000; updateGeldText(); saveState(); }),
      cheatBtn('+10k€', () => { GS.geld += 10000; updateGeldText(); saveState(); }),
      cheatBtn('🌾Reif', () => { for (const fid in GS.felder) { const f = GS.felder[fid]; if (f.type) f.stage = 3; } saveState(); rerenderFelder(); }),
      cheatBtn('Brach✓', () => { for (const fid in GS.felder) GS.felder[fid].brachSeit = Date.now() - BRACH_BONUS_MS - 1000; saveState(); rerenderFelder(); }),
      cheatBtn('Reset', () => { if (confirm('Reset?')) { localStorage.removeItem(SAVE_KEY); GS = structuredClone(DEFAULT_STATE); saveState(); buildUI(); } })
    ));
  }

  const sp = el('div', {class:'spielflaeche', id:'spielflaeche'});
  root.appendChild(sp);
  sp.appendChild(el('div', {class:'modus-indikator', id:'modusIndikator'}, '⛏️ PFLÜGEN'));

  // Werkzeug-Leiste
  const wz = el('div', {class:'werkzeug-leiste', id:'wzLeiste'});
  for (const w of [{id:'pflug', em:'⛏️'}, {id:'maehdrescher', em:'🌾'}, {id:'pan', em:'✋'}]) {
    const b = el('div', {class:'wz' + (werkzeugAktiv === w.id ? ' aktiv' : '')}, w.em);
    b.dataset.id = w.id;
    b.addEventListener('click', () => { werkzeugAktiv = w.id; document.querySelectorAll('.wz').forEach(x => x.classList.remove('aktiv')); b.classList.add('aktiv'); updateModus(); });
    wz.appendChild(b);
  }
  // Trecker-Anzeige in Leiste
  const trk = TRAKTOR_TYPEN[GS.treckerAktiv];
  const trkBtn = el('div', {class:'wz', style:{width:'auto', padding:'0 14px', 'font-size':'18px'}}, trk.em + ' ' + trk.name);
  trkBtn.addEventListener('click', () => openTreckerGarage());
  wz.appendChild(trkBtn);
  sp.appendChild(wz);

  buildSVG(sp);
  updateModus();
  setupTouch(sp);

  if (!GS.gesehen.intro) {
    GS.gesehen.intro = true; saveState();
    showHilfe();
  }
}

function updateGeldText() { const t = document.getElementById('geldText'); if (t) t.textContent = formatGeld(GS.geld); }
function updateModus() {
  const m = document.getElementById('modusIndikator');
  if (!m) return;
  if (platzierenItem) { m.textContent = '📍 ZIEHE & TIPPE zum Platzieren'; return; }
  const labels = {pflug:'⛏️ PFLÜGEN · Trecker drüber!', maehdrescher:'🌾 ERNTEN · Trecker drüber!', pan:'✋ Karte verschieben'};
  m.textContent = labels[werkzeugAktiv] || '';
}

// ============================================================
// SVG-Welt
// ============================================================
function buildSVG(container) {
  const ep = aktuelleEpoche();
  const svg = svgEl('svg', {viewBox:`0 0 ${VIEW_W} ${VIEW_H}`, preserveAspectRatio:'xMidYMid slice'});
  const defs = svgEl('defs');
  defs.innerHTML = `
    <linearGradient id="himmel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${ep.farbeHimmel}"/>
      <stop offset="60%" stop-color="${ep.farbeBoden}"/>
      <stop offset="100%" stop-color="#558b2f"/>
    </linearGradient>
    <pattern id="acker" x="0" y="0" width="14" height="8" patternUnits="userSpaceOnUse"><rect width="14" height="8" fill="#5d4037"/><ellipse cx="7" cy="4" rx="6" ry="2" fill="#6d4c41"/><line x1="0" y1="4" x2="14" y2="4" stroke="#3e2723" stroke-width="0.5"/></pattern>
    <pattern id="brach" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#8d6e63"/><circle cx="5" cy="6" r="2" fill="#aed581"/><circle cx="14" cy="13" r="1.5" fill="#aed581"/><circle cx="11" cy="3" r="1" fill="#fdd835"/></pattern>
    <pattern id="ziegelRot" x="0" y="0" width="14" height="10" patternUnits="userSpaceOnUse"><rect width="14" height="10" fill="#c62828"/><path d="M 0 5 Q 3.5 0 7 5 Q 10.5 10 14 5" fill="#d84315"/></pattern>
    <pattern id="ziegelDachSeite" x="0" y="0" width="12" height="8" patternUnits="userSpaceOnUse"><rect width="12" height="8" fill="#a52525"/><path d="M 0 4 Q 3 0 6 4" fill="#8b1e1e"/></pattern>
    <pattern id="holzWand" x="0" y="0" width="20" height="6" patternUnits="userSpaceOnUse"><rect width="20" height="6" fill="#a1887f"/><line x1="0" y1="3" x2="20" y2="3" stroke="#5d4037" stroke-width="0.6"/></pattern>
    <pattern id="fachwerk" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#fff8e1"/><line x1="0" y1="0" x2="40" y2="40" stroke="#3e2723" stroke-width="2"/><line x1="40" y1="0" x2="0" y2="40" stroke="#3e2723" stroke-width="2"/><rect x="0" y="0" width="40" height="3" fill="#3e2723"/><rect x="0" y="37" width="40" height="3" fill="#3e2723"/></pattern>
    <pattern id="steinSockel" x="0" y="0" width="16" height="14" patternUnits="userSpaceOnUse"><rect width="16" height="14" fill="#bcaaa4"/><ellipse cx="4" cy="4" rx="3" ry="2" fill="#a1887f"/><ellipse cx="12" cy="9" rx="3" ry="2" fill="#a1887f"/></pattern>
    <pattern id="weg" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#d7ccc8"/><circle cx="5" cy="5" r="1.5" fill="#a1887f"/><circle cx="14" cy="12" r="1.5" fill="#a1887f"/></pattern>
    <linearGradient id="trkGreen" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#43a047"/><stop offset="100%" stop-color="#1b5e20"/></linearGradient>
    <linearGradient id="trkRed" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e53935"/><stop offset="100%" stop-color="#b71c1c"/></linearGradient>
    <linearGradient id="trkBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1976d2"/><stop offset="100%" stop-color="#0d47a1"/></linearGradient>
    <radialGradient id="grasFlecken"><stop offset="0%" stop-color="#7cb342"/><stop offset="100%" stop-color="#558b2f"/></radialGradient>
  `;
  svg.appendChild(defs);

  svg.appendChild(svgEl('rect', {x:'0', y:'0', width:String(VIEW_W), height:String(VIEW_H), fill:'url(#himmel)'}));

  weltGrp = svgEl('g', {id:'weltGrp'});
  svg.appendChild(weltGrp);

  // Hintergrund Welt
  weltGrp.appendChild(svgEl('rect', {x:'0', y:'0', width:String(W), height:String(H), fill:ep.farbeBoden}));
  // Naturflecken/Hügel
  const natur = svgEl('g', {opacity:'.5'});
  for (let i = 0; i < 30; i++) {
    const x = 80 + Math.random() * (W - 160);
    const y = 200 + Math.random() * (H - 400);
    const r = 60 + Math.random() * 100;
    natur.appendChild(svgEl('ellipse', {cx:String(x), cy:String(y), rx:String(r), ry:String(r*0.4), fill:'url(#grasFlecken)'}));
  }
  weltGrp.appendChild(natur);
  // Grashalme
  const gras = svgEl('g');
  for (let i = 0; i < 120; i++) {
    const x = Math.random() * W, y = 80 + Math.random() * (H - 100);
    gras.appendChild(svgEl('path', {d:`M ${x} ${y} l -2 -8 M ${x} ${y} l 2 -8 M ${x} ${y} l 0 -10`, stroke:'#558b2f', 'stroke-width':'1.2', fill:'none'}));
  }
  weltGrp.appendChild(gras);

  // organische Wege (geschwungen)
  const wege = svgEl('g', {opacity:'.6'});
  wege.innerHTML = `
    <path d="M 460 1100 Q 800 900 1100 800 T 1900 700" stroke="url(#weg)" stroke-width="44" fill="none" stroke-linecap="round" opacity=".8"/>
    <path d="M 1100 800 Q 1100 1100 1100 1280" stroke="url(#weg)" stroke-width="38" fill="none" stroke-linecap="round" opacity=".8"/>
    <path d="M 600 400 Q 700 600 900 700" stroke="url(#weg)" stroke-width="34" fill="none" stroke-linecap="round" opacity=".7"/>
  `;
  weltGrp.appendChild(wege);

  // Dekoration
  const deko = svgEl('g');
  deko.innerHTML = `
    <g transform="translate(2200,150)">
      <g opacity=".6"><line x1="0" y1="-50" x2="0" y2="-65" stroke="#fff176" stroke-width="3"/><line x1="50" y1="0" x2="65" y2="0" stroke="#fff176" stroke-width="3"/><line x1="-50" y1="0" x2="-65" y2="0" stroke="#fff176" stroke-width="3"/></g>
      <circle r="40" fill="#fff176"/><circle r="32" fill="#ffeb3b"/>
      <circle cx="-9" cy="-5" r="5" fill="#222"/><circle cx="11" cy="-5" r="5" fill="#222"/>
      <path d="M -11 10 Q 0 22 11 10" stroke="#222" stroke-width="3" fill="none"/>
    </g>
  `;
  for (const [cx, cy, sc] of [[400, 80, 1], [1500, 100, 1.3], [2100, 220, .9]]) {
    deko.innerHTML += `<g transform="translate(${cx},${cy}) scale(${sc})" fill="#fff" opacity=".95">
      <ellipse cx="0" cy="0" rx="35" ry="14"/><ellipse cx="20" cy="-7" rx="22" ry="13"/><ellipse cx="-22" cy="-3" rx="20" ry="11"/>
    </g>`;
  }
  // Bäume natürlich verstreut
  const baumPos = [[120,350],[60,720],[2300,380],[2330,720],[400,1450],[1800,1450],[1100,1430],[200,1100],[2280,1100],[150,1400],[2350,1400]];
  for (const [tx, ty] of baumPos) {
    deko.innerHTML += `<g transform="translate(${tx},${ty})">
      <ellipse cx="0" cy="60" rx="32" ry="9" fill="#000" opacity=".3"/>
      <rect x="-6" y="35" width="12" height="34" fill="#5d4037" stroke="#000" stroke-width="1.5"/>
      <circle cx="0" cy="20" r="32" fill="#2e7d32" stroke="#000" stroke-width="1.5"/>
      <circle cx="-18" cy="28" r="20" fill="#388e3c" stroke="#000" stroke-width="1"/>
      <circle cx="18" cy="28" r="20" fill="#388e3c" stroke="#000" stroke-width="1"/>
      <circle cx="-6" cy="22" r="3" fill="#e53935"/><circle cx="8" cy="18" r="3" fill="#e53935"/><circle cx="0" cy="35" r="3" fill="#e53935"/>
    </g>`;
  }
  // Steine / Felsen
  for (const [sx, sy] of [[380,1100],[2100,1100],[850,1100],[1700,1180]]) {
    deko.innerHTML += `<g transform="translate(${sx},${sy})">
      <ellipse cx="0" cy="20" rx="28" ry="6" fill="#000" opacity=".3"/>
      <ellipse cx="0" cy="10" rx="22" ry="14" fill="#9e9e9e" stroke="#424242" stroke-width="2"/>
      <ellipse cx="-6" cy="6" rx="8" ry="5" fill="#bdbdbd" opacity=".7"/>
    </g>`;
  }
  // Teich
  deko.innerHTML += `<g transform="translate(1900,1280)">
    <ellipse cx="0" cy="0" rx="120" ry="40" fill="#1565c0" stroke="#000" stroke-width="2" opacity=".8"/>
    <ellipse cx="-30" cy="-10" rx="40" ry="10" fill="#42a5f5" opacity=".6"/>
    <ellipse cx="50" cy="8" rx="20" ry="5" fill="#42a5f5" opacity=".6"/>
  </g>`;
  weltGrp.appendChild(deko);

  // Zaun rundherum
  weltGrp.appendChild(zaunSVG());

  // Felder
  const felderG = svgEl('g', {id:'felderG'});
  weltGrp.appendChild(felderG);
  rerenderFelderInto(felderG);

  // Gebäude
  const gebG = svgEl('g', {id:'gebG'});
  weltGrp.appendChild(gebG);
  rerenderGebaeudeInto(gebG);

  // Trecker
  treckerGrp = svgEl('g', {id:'treckerGrp'});
  drawTreckerInto(treckerGrp);
  weltGrp.appendChild(treckerGrp);
  updateTreckerPosition();

  drawTiereInto(weltGrp);

  // Platzier-Geist
  const ghost = svgEl('g', {id:'platzGhost', style:'display:none', opacity:'.7'});
  weltGrp.appendChild(ghost);

  updateKamera();
  container.appendChild(svg);
  svgEle = svg;
}

function zaunSVG() {
  const g = svgEl('g');
  let s = '';
  for (let x = 50; x < W - 50; x += 50) {
    s += `<rect x="${x}" y="60" width="6" height="40" fill="#8d6e63" stroke="#000" stroke-width="1"/>`;
  }
  s += `<rect x="40" y="72" width="${W - 80}" height="6" fill="#a1887f" stroke="#000" stroke-width="1"/>`;
  s += `<rect x="40" y="92" width="${W - 80}" height="6" fill="#a1887f" stroke="#000" stroke-width="1"/>`;
  g.innerHTML = s;
  return g;
}

function updateKamera() {
  if (!weltGrp) return;
  const targetX = -kameraX + VIEW_W / 2;
  const targetY = -kameraY + VIEW_H / 2;
  weltGrp.setAttribute('transform', `translate(${targetX},${targetY})`);
}

// ============================================================
// FELDER
// ============================================================
function rerenderFelder() {
  const g = document.getElementById('felderG');
  if (!g) return;
  g.innerHTML = '';
  rerenderFelderInto(g);
}

function rerenderFelderInto(parent) {
  for (const fid in FELD_LAYOUT) {
    const layout = FELD_LAYOUT[fid];
    if (GS.gekauft.includes(fid)) drawFeld(parent, fid, layout);
    else {
      const item = SHOP_KATALOG.felder.find(s => s.id === fid);
      if (item) drawFeldBauplatz(parent, fid, layout, item.preis);
    }
  }
}

function drawFeld(parent, fid, layout) {
  if (!GS.felder[fid]) GS.felder[fid] = {stage:0, type:null, plantedAt:null, fortschritt:0, brachSeit:Date.now()};
  const f = GS.felder[fid];
  const cfg = f.type ? CROP_CONFIG[f.type] : null;
  const g = svgEl('g', {transform:`translate(${layout.x},${layout.y})`, 'data-feld':fid});
  let bg;
  if (f.stage === 0) {
    // Brache - sieht aus wie wilde Wiese
    bg = 'url(#brach)';
  }
  else if (f.stage === 1) bg = 'url(#acker)';
  else if (f.stage === 2 || f.stage === 3) bg = cfg ? cfg.color : '#aed581';

  g.appendChild(svgEl('rect', {x:'5', y:'5', width:String(layout.w), height:String(layout.h), fill:'#000', opacity:'.3', rx:'8'}));
  g.appendChild(svgEl('rect', {x:'0', y:'0', width:String(layout.w), height:String(layout.h), fill:bg, stroke:'#3e2723', 'stroke-width':'4', rx:'8'}));

  if (f.stage === 0) {
    // Brache-Anzeige + ggf Bonus-Badge
    const brachZeit = Date.now() - (f.brachSeit || Date.now());
    const bonus = brachZeit >= BRACH_BONUS_MS;
    if (bonus && !f.bonusReady) { f.bonusReady = true; saveState(); }
    if (f.bonusReady) {
      g.appendChild(svgEl('rect', {x:'-7', y:'-7', width:String(layout.w+14), height:String(layout.h+14), fill:'none', stroke:'#7cb342', 'stroke-width':'5', rx:'12', opacity:'.7'}));
      g.appendChild(svgEl('text', {x:String(layout.w/2), y:'24', 'text-anchor':'middle', fill:'#1b5e20', 'font-size':'18', 'font-weight':'900', stroke:'#fff', 'stroke-width':'4', 'paint-order':'stroke'}, '🌿 BRACH +50%'));
    }
    if (f.fortschritt > 0) g.appendChild(svgEl('rect', {x:'0', y:'0', width:String(layout.w * f.fortschritt / 100), height:String(layout.h), fill:'url(#acker)', opacity:'.85', rx:'8'}));
    g.appendChild(svgEl('text', {x:String(layout.w/2), y:String(layout.h-12), 'text-anchor':'middle', fill:'#fff', 'font-size':'14', 'font-weight':'700', stroke:'#000', 'stroke-width':'3', 'paint-order':'stroke'}, '⛏️ Trecker drüber zum Pflügen'));
  } else if (f.stage === 1) {
    g.appendChild(svgEl('text', {x:String(layout.w/2), y:String(layout.h/2 - 6), 'text-anchor':'middle', fill:'#fff', 'font-size':'16', 'font-weight':'700', stroke:'#000', 'stroke-width':'3', 'paint-order':'stroke'}, '🌱 TIPPEN: Pflanze auswählen'));
    g.appendChild(svgEl('text', {x:String(layout.w/2), y:String(layout.h/2 + 16), 'text-anchor':'middle', fill:'#fff', 'font-size':'13', stroke:'#000', 'stroke-width':'3', 'paint-order':'stroke'}, '(Was willst du säen?)'));
    g.style.cursor = 'pointer';
    g.addEventListener('click', () => openCropPicker(fid));
  } else if (f.stage === 2 || f.stage === 3) {
    if (cfg) drawPflanzenSchoen(g, f.type, layout.w, layout.h, f.stage === 3);
    if (f.stage === 2 && f.plantedAt) {
      const elapsed = Date.now() - f.plantedAt;
      const wachsMs = cfg.wachstumMs * ZEIT_FAKTOR;
      const pct = Math.min(100, elapsed / wachsMs * 100);
      g.appendChild(svgEl('rect', {x:'5', y:String(layout.h-14), width:String(layout.w-10), height:'8', fill:'rgba(0,0,0,.4)', rx:'4'}));
      g.appendChild(svgEl('rect', {x:'5', y:String(layout.h-14), width:String((layout.w-10)*pct/100), height:'8', fill:'#fbc02d', rx:'4'}));
    } else if (f.stage === 3) {
      g.appendChild(svgEl('rect', {x:'-7', y:'-7', width:String(layout.w+14), height:String(layout.h+14), fill:'none', stroke:'#fbc02d', 'stroke-width':'5', rx:'12', opacity:'.7'}));
      g.appendChild(svgEl('text', {x:String(layout.w/2), y:String(layout.h-8), 'text-anchor':'middle', fill:'#3e2723', 'font-size':'15', 'font-weight':'900'}, '🌾 REIF!'));
      if (f.fortschritt > 0) g.appendChild(svgEl('rect', {x:'0', y:'0', width:String(layout.w * f.fortschritt / 100), height:String(layout.h), fill:'url(#acker)', opacity:'.7', rx:'8'}));
    }
  }
  parent.appendChild(g);
}

function drawFeldBauplatz(parent, fid, layout, preis) {
  const g = svgEl('g', {transform:`translate(${layout.x},${layout.y})`, style:'cursor:pointer'});
  g.appendChild(svgEl('rect', {x:'0', y:'0', width:String(layout.w), height:String(layout.h), fill:'rgba(255,255,255,.1)', stroke:'#fff', 'stroke-width':'4', 'stroke-dasharray':'14 8', rx:'8'}));
  g.appendChild(svgEl('text', {x:String(layout.w/2), y:String(layout.h/2 - 14), 'text-anchor':'middle', fill:'#fff', 'font-size':'18', 'font-weight':'700'}, '🌱 Land kaufen'));
  g.appendChild(svgEl('text', {x:String(layout.w/2), y:String(layout.h/2 + 16), 'text-anchor':'middle', fill:'#fff', 'font-size':'16', 'font-weight':'900'}, formatGeld(preis)));
  g.addEventListener('click', () => kaufenFeld(fid));
  parent.appendChild(g);
}

function drawPflanzenSchoen(g, type, w, h, reif) {
  const cfg = CROP_CONFIG[type];
  if (!cfg) return;
  const cols = Math.floor(w / 28), rows = Math.floor(h / 50);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const px = (c+0.5) * w / cols;
      const py = h * 0.2 + r * h / rows * 0.95 + (r%2 ? 5 : 0);
      const ph = svgEl('g', {transform:`translate(${px},${py})`});
      if (type === 'weizen' || type === 'hafer' || type === 'gerste' || type === 'roggen') {
        ph.innerHTML = `
          <line x1="0" y1="14" x2="0" y2="-2" stroke="#558b2f" stroke-width="1.8"/>
          <ellipse cx="0" cy="-6" rx="4" ry="8" fill="${reif ? '#fdd835' : '#9ccc65'}" stroke="#000" stroke-width=".7"/>
          ${reif ? '<line x1="0" y1="-14" x2="0" y2="-18" stroke="#fbc02d" stroke-width="1.2"/><line x1="-3" y1="-14" x2="-4" y2="-18" stroke="#fbc02d" stroke-width="1"/><line x1="3" y1="-14" x2="4" y2="-18" stroke="#fbc02d" stroke-width="1"/>' : ''}
        `;
      } else if (type === 'mais') {
        ph.innerHTML = `
          <line x1="0" y1="22" x2="0" y2="-12" stroke="#33691e" stroke-width="3"/>
          <path d="M 0 8 Q -10 2 -7 -7" stroke="#558b2f" stroke-width="2.5" fill="none"/>
          <path d="M 0 0 Q 10 -7 8 -15" stroke="#558b2f" stroke-width="2.5" fill="none"/>
          <ellipse cx="0" cy="-15" rx="5" ry="12" fill="${reif ? '#fbc02d' : '#aed581'}" stroke="#000" stroke-width="1"/>
        `;
      } else if (type === 'kartoffel') {
        ph.innerHTML = `
          <ellipse cx="0" cy="6" rx="11" ry="3" fill="#3e2723" opacity=".4"/>
          <circle cx="-5" cy="0" r="5" fill="#558b2f" stroke="#000" stroke-width=".8"/>
          <circle cx="5" cy="0" r="5" fill="#558b2f" stroke="#000" stroke-width=".8"/>
          <circle cx="0" cy="-4" r="6" fill="${reif ? '#7cb342' : '#aed581'}" stroke="#000" stroke-width=".8"/>
          ${reif ? '<circle cx="0" cy="-7" r="2.5" fill="#fff" stroke="#000" stroke-width=".5"/><circle cx="0" cy="-7" r="1.2" fill="#ffeb3b"/>' : ''}
        `;
      } else if (type === 'raps' || type === 'soja') {
        ph.innerHTML = `
          <line x1="0" y1="14" x2="0" y2="-6" stroke="#558b2f" stroke-width="1.8"/>
          <ellipse cx="-4" cy="2" rx="3" ry="2" fill="#7cb342" stroke="#000" stroke-width=".5"/>
          <ellipse cx="4" cy="0" rx="3" ry="2" fill="#7cb342" stroke="#000" stroke-width=".5"/>
          ${reif ? `<circle cx="0" cy="-10" r="4" fill="${type==='soja'?'#aed581':'#fdd835'}" stroke="#000" stroke-width=".7"/><circle cx="-3" cy="-12" r="2.5" fill="#fbc02d"/><circle cx="3" cy="-12" r="2.5" fill="#fbc02d"/>` : '<circle cx="0" cy="-7" r="2.5" fill="#9ccc65" stroke="#000" stroke-width=".5"/>'}
        `;
      } else if (type === 'ruebe') {
        ph.innerHTML = `
          <circle cx="0" cy="3" r="${reif ? 8 : 4}" fill="${reif ? '#9c27b0' : '#aed581'}" stroke="#000" stroke-width=".8"/>
          <path d="M -4 -4 L -6 -12 M 0 -7 L 0 -15 M 4 -4 L 6 -12" stroke="#558b2f" stroke-width="2" fill="none"/>
        `;
      } else if (type === 'wiese') {
        ph.innerHTML = `
          <path d="M -3 14 L -3 -3" stroke="#558b2f" stroke-width="1.5"/>
          <path d="M 0 14 L 0 -5" stroke="#558b2f" stroke-width="1.5"/>
          <path d="M 3 14 L 3 -3" stroke="#558b2f" stroke-width="1.5"/>
        `;
      }
      g.appendChild(ph);
    }
  }
}

// ============================================================
// CROP PICKER
// ============================================================
function openCropPicker(fid) {
  const card = el('div', {class:'modal-card'});
  card.appendChild(el('button', {class:'close', onclick: closeModal}, '✕'));
  card.appendChild(el('h2', {}, '🌱 Was willst du pflanzen?'));
  const f = GS.felder[fid];
  const bonus = f.bonusReady;
  if (bonus) card.appendChild(el('div', {style:{background:'#dcedc8', padding:'10px', 'border-radius':'10px', 'margin-bottom':'10px', 'text-align':'center', 'font-weight':'700', color:'#33691e'}}, '🌿 BRACH-BONUS aktiv: +50 % Ertrag!'));

  const grid = el('div', {style:{display:'grid', 'grid-template-columns':'1fr 1fr', gap:'10px'}});
  for (const cid in CROP_CONFIG) {
    const cfg = CROP_CONFIG[cid];
    const locked = !epocheUnlocked(cfg.epoche);
    const tooExpensive = GS.geld < cfg.saatkosten;
    const cell = el('div', {style:{background: locked ? '#eee' : '#f5f5f5', 'border-radius':'12px', padding:'12px', 'text-align':'center', cursor: locked ? 'not-allowed' : 'pointer', opacity: locked ? '.4' : '1', border: '2px solid ' + (tooExpensive && !locked ? '#ef5350' : 'transparent')}},
      el('div', {style:{'font-size':'40px'}}, cfg.em),
      el('div', {style:{'font-weight':'900', 'font-size':'14px', 'margin-top':'4px'}}, cfg.name),
      el('div', {style:{'font-size':'11px', color:'#666', 'margin-top':'2px'}}, `Saat ${cfg.saatkosten}€ → ${cfg.ertragSaecke}× ${cfg.preisProSack}€`),
      el('div', {style:{'font-size':'10px', color:'#888', 'margin-top':'2px'}}, `~${Math.round(cfg.wachstumMs * ZEIT_FAKTOR / 1000)}s wachsen`),
      locked ? el('div', {style:{'font-size':'11px', color:'#888', 'margin-top':'4px'}}, '🔒 erst ' + EPOCHEN.find(e=>e.id===cfg.epoche).name) : null
    );
    if (!locked) {
      cell.addEventListener('click', () => {
        if (GS.geld < cfg.saatkosten) { toast(`❌ Brauchst ${cfg.saatkosten}€`, '#ef5350'); return; }
        GS.geld -= cfg.saatkosten;
        f.type = cid; f.stage = 2; f.plantedAt = Date.now(); f.fortschritt = 0;
        f.bonusVerwendet = bonus;
        if (bonus) { f.bonusReady = false; GS.stats.brachgenutzt++; }
        updateGeldText(); saveState(); rerenderFeld(fid); closeModal();
        toast(`🌱 ${cfg.name} gesät!` + (bonus ? ' (+50%)' : ''));
      });
    }
    grid.appendChild(cell);
  }
  card.appendChild(grid);
  card.appendChild(el('div', {style:{'margin-top':'14px', 'text-align':'center', 'font-size':'12px', color:'#888'}}, '💡 Wenn du ein Feld lange BRACH liegen lässt, gibt es +50 % Ertrag!'));
  showModalRaw(card);
}

// ============================================================
// GEBÄUDE rendern
// ============================================================
function rerenderGebaeude() {
  const g = document.getElementById('gebG');
  if (!g) return;
  g.innerHTML = '';
  rerenderGebaeudeInto(g);
}
function rerenderGebaeudeInto(parent) {
  // Sortieren nach y damit niedrige hinten
  const ids = Object.keys(GEBAEUDE_DEFAULTS).sort((a,b) => gebaeudePos(a).y - gebaeudePos(b).y);
  for (const gid of ids) {
    if (GS.gekauft.includes(gid)) {
      drawGebaeude(parent, gid);
    } else {
      const meta = GEBAEUDE_DEFAULTS[gid];
      if (!epocheUnlocked(meta.epoche)) continue;
      const item = SHOP_KATALOG.gebaeude.find(i => i.id === gid);
      if (item) drawBauplatz(parent, gid, item.preis);
    }
  }
}

function drawGebaeude(parent, gid) {
  const pos = gebaeudePos(gid);
  const meta = GEBAEUDE_DEFAULTS[gid];
  const g = svgEl('g', {transform:`translate(${pos.x},${pos.y})`, style:'cursor:pointer', 'data-gebaeude':gid});
  g.innerHTML = renderGebaeudeSVG(gid, meta);
  g.addEventListener('click', () => openInnen(gid));
  parent.appendChild(g);
}

function drawBauplatz(parent, gid, preis) {
  const meta = GEBAEUDE_DEFAULTS[gid];
  const pos = gebaeudePos(gid);
  const g = svgEl('g', {transform:`translate(${pos.x},${pos.y})`, style:'cursor:pointer'});
  g.appendChild(svgEl('rect', {x:'0', y:'0', width:String(meta.w), height:String(meta.h), fill:'rgba(255,255,255,.12)', stroke:'#fff', 'stroke-width':'4', 'stroke-dasharray':'12 8', rx:'10'}));
  g.appendChild(svgEl('text', {x:String(meta.w/2), y:String(meta.h/2 - 16), 'text-anchor':'middle', fill:'#fff', 'font-size':'34'}, meta.em));
  g.appendChild(svgEl('text', {x:String(meta.w/2), y:String(meta.h/2 + 14), 'text-anchor':'middle', fill:'#fff', 'font-size':'14', 'font-weight':'700'}, meta.name));
  g.appendChild(svgEl('text', {x:String(meta.w/2), y:String(meta.h/2 + 36), 'text-anchor':'middle', fill:'#fff', 'font-size':'15', 'font-weight':'900'}, formatGeld(preis)));
  g.addEventListener('click', () => kaufenGebaeude(gid));
  parent.appendChild(g);
}

// ============================================================
// HÄUSER-RENDER PRO TYP (deutlich detaillierter)
// ============================================================
function renderGebaeudeSVG(gid, meta) {
  const w = meta.w, h = meta.h;
  switch(gid) {
    case 'wohnhaus':     return svgWohnhausFuerEpoche(w, h);
    case 'langhaus':     return svgLanghaus(w, h);
    case 'schafstall':   return svgSchafstall(w, h);
    case 'fachwerkhaus': return svgFachwerkhaus(w, h);
    case 'feuerstelle':  return svgFeuerstelle(w, h);
    case 'vorratsgrube': return svgVorratsgrube(w, h);
    case 'huehnerstall': return svgHuehnerstall(w, h, GS.tiere.huhn || 0);
    case 'steinstall':   return svgSteinstall(w, h);
    case 'muehle':       return svgMuehle(w, h);
    case 'windmuehle':   return svgWindmuehle(w, h);
    case 'schmiede':     return svgSchmiede(w, h);
    case 'kuhstall':     return svgKuhstall(w, h);
    case 'schweinestall':return svgSchweinestall(w, h);
    case 'scheune':      return svgScheune(w, h);
    case 'silo':         return svgSilo(w, h);
    case 'werkstatt':    return svgWerkstatt(w, h);
    case 'hofladen':     return svgHofladen(w, h);
    case 'tankstelle':   return svgTankstelle(w, h);
    case 'biogas':       return svgBiogas(w, h);
    default: return svgGeneric(w, h, meta.em);
  }
}

// --- WOHNHAUS pro Epoche ---
function svgWohnhausFuerEpoche(w, h) {
  switch(GS.epoche) {
    case 'steinzeit':   return svgWohnhausSteinzeit(w, h);
    case 'antike':      return svgWohnhausAntike(w, h);
    case 'wikinger':    return svgLanghaus(w, h);
    case 'mittelalter': return svgFachwerkhaus(w, h);
    case 'industrie':   return svgWohnhausIndustrie(w, h);
    case 'moderne':     return svgWohnhausModerne(w, h);
    default:            return svgWohnhausSteinzeit(w, h);
  }
}

// Steinzeit – runde Lehmhütte mit Strohdach
function svgWohnhausSteinzeit(w, h) {
  const cx = w/2, baseY = h*0.95, wallTop = h*0.55, peak = h*0.12;
  return `
    <ellipse cx="${cx}" cy="${baseY+5}" rx="${w*0.45}" ry="11" fill="#000" opacity=".35"/>
    <!-- Lehmwand rund -->
    <path d="M ${w*0.1} ${baseY} Q ${w*0.1} ${wallTop} ${cx} ${wallTop} Q ${w*0.9} ${wallTop} ${w*0.9} ${baseY} Z"
          fill="#a1887f" stroke="#5d4037" stroke-width="3"/>
    <!-- Wand-Textur -->
    <path d="M ${w*0.18} ${wallTop+20} Q ${cx} ${wallTop+10} ${w*0.82} ${wallTop+20}" stroke="#8d6e63" stroke-width="2" fill="none" opacity=".7"/>
    <path d="M ${w*0.15} ${wallTop+45} Q ${cx} ${wallTop+35} ${w*0.85} ${wallTop+45}" stroke="#8d6e63" stroke-width="2" fill="none" opacity=".7"/>
    <!-- Strohdach -->
    <path d="M ${w*0.05} ${wallTop+5} Q ${cx} ${peak} ${w*0.95} ${wallTop+5} L ${w*0.9} ${wallTop} L ${w*0.1} ${wallTop} Z"
          fill="#bf8b3a" stroke="#5d4037" stroke-width="3"/>
    <!-- Stroh-Striche -->
    ${[0.15,0.28,0.4,0.5,0.6,0.72,0.85].map(p => `<line x1="${w*p}" y1="${wallTop}" x2="${w*p + (p<0.5?-6:6)}" y2="${peak + (p-0.5)*(p-0.5)*h*1.2 + h*0.02}" stroke="#8d6e63" stroke-width="1.5"/>`).join('')}
    <!-- Eingang -->
    <path d="M ${cx-22} ${baseY} L ${cx-22} ${baseY-h*0.3} Q ${cx-22} ${baseY-h*0.4} ${cx} ${baseY-h*0.4} Q ${cx+22} ${baseY-h*0.4} ${cx+22} ${baseY-h*0.3} L ${cx+22} ${baseY} Z"
          fill="#3e2723" stroke="#000" stroke-width="2"/>
    <path d="M ${cx-18} ${baseY-5} L ${cx-18} ${baseY-h*0.28} Q ${cx-18} ${baseY-h*0.36} ${cx} ${baseY-h*0.36} Q ${cx+18} ${baseY-h*0.36} ${cx+18} ${baseY-h*0.28} L ${cx+18} ${baseY-5} Z"
          fill="#1a0e08"/>
    <!-- Rauchloch -->
    <ellipse cx="${cx}" cy="${peak+10}" rx="14" ry="6" fill="#000"/>
    <g opacity=".7">
      <circle cx="${cx-3}" cy="${peak-2}" r="6" fill="#cfd8dc"/>
      <circle cx="${cx+5}" cy="${peak-12}" r="9" fill="#eceff1"/>
      <circle cx="${cx-2}" cy="${peak-22}" r="11" fill="#fff"/>
    </g>
    <!-- Kleiner Stein vorm Eingang -->
    <ellipse cx="${cx-w*0.32}" cy="${baseY+2}" rx="14" ry="6" fill="#9e9e9e" stroke="#424242" stroke-width="1.5"/>
  `;
}

// Antike – römisches Steinhaus mit Säulen + Atrium
function svgWohnhausAntike(w, h) {
  return `
    <ellipse cx="${w/2}" cy="${h-5}" rx="${w/2-10}" ry="12" fill="#000" opacity=".35"/>
    <!-- Sockel -->
    <rect x="10" y="${h*0.85}" width="${w-20}" height="${h*0.1}" fill="#cfd8dc" stroke="#5d4037" stroke-width="3"/>
    <line x1="10" y1="${h*0.92}" x2="${w-10}" y2="${h*0.92}" stroke="#90a4ae" stroke-width="1.5"/>
    <!-- Hauptmauer -->
    <rect x="20" y="${h*0.4}" width="${w-40}" height="${h*0.45}" fill="#fff8e1" stroke="#5d4037" stroke-width="3"/>
    <!-- Säulen -->
    ${[0.18,0.36,0.54,0.72].map(p => `
      <rect x="${w*p-7}" y="${h*0.42}" width="14" height="${h*0.43}" fill="#eceff1" stroke="#5d4037" stroke-width="2"/>
      <rect x="${w*p-12}" y="${h*0.42}" width="24" height="6" fill="#cfd8dc" stroke="#5d4037" stroke-width="1.5"/>
      <rect x="${w*p-12}" y="${h*0.79}" width="24" height="6" fill="#cfd8dc" stroke="#5d4037" stroke-width="1.5"/>
      <line x1="${w*p}" y1="${h*0.48}" x2="${w*p}" y2="${h*0.78}" stroke="#cfd8dc" stroke-width="1"/>
    `).join('')}
    <!-- Eingang -->
    <rect x="${w*0.85-15}" y="${h*0.6}" width="30" height="${h*0.25}" fill="#5d4037" stroke="#000" stroke-width="2.5"/>
    <!-- Flaches Dach mit Giebel -->
    <polygon points="0,${h*0.4} ${w/2},${h*0.18} ${w},${h*0.4}" fill="#c62828" stroke="#5d4037" stroke-width="3"/>
    <polygon points="${w},${h*0.4} ${w+18},${h*0.42} ${w/2+18},${h*0.2} ${w/2},${h*0.18}" fill="#8b1e1e" stroke="#5d4037" stroke-width="2"/>
    <!-- Tympanon -->
    <text x="${w/2}" y="${h*0.32}" text-anchor="middle" font-size="20">🏛️</text>
    <text x="${w/2}" y="${h-2}" text-anchor="middle" font-size="11" font-weight="900" fill="#fff" stroke="#000" stroke-width="3" paint-order="stroke">VILLA</text>
  `;
}

// Industriezeit – Backsteinhaus mit hohem Schornstein
function svgWohnhausIndustrie(w, h) {
  return `
    <ellipse cx="${w/2}" cy="${h-5}" rx="${w/2-10}" ry="12" fill="#000" opacity=".35"/>
    <rect x="10" y="${h*0.88}" width="${w-20}" height="${h*0.07}" fill="url(#steinSockel)" stroke="#000" stroke-width="2"/>
    <!-- Backsteinwand -->
    <rect x="20" y="${h*0.35}" width="${w-40}" height="${h*0.53}" fill="url(#ziegelRot)" stroke="#3e2723" stroke-width="3"/>
    <!-- Stockwerk-Linie -->
    <rect x="20" y="${h*0.6}" width="${w-40}" height="4" fill="#3e2723"/>
    <!-- Fenster oben Reihe -->
    ${[0.2,0.45,0.7].map(p => `
      <rect x="${w*p-22}" y="${h*0.42}" width="44" height="36" fill="#90caf9" stroke="#3e2723" stroke-width="2.5"/>
      <line x1="${w*p}" y1="${h*0.42}" x2="${w*p}" y2="${h*0.42+36}" stroke="#3e2723" stroke-width="1.5"/>
      <line x1="${w*p-22}" y1="${h*0.42+18}" x2="${w*p+22}" y2="${h*0.42+18}" stroke="#3e2723" stroke-width="1.5"/>
    `).join('')}
    <!-- Tür + Fenster unten -->
    <rect x="${w*0.2-22}" y="${h*0.66}" width="44" height="36" fill="#90caf9" stroke="#3e2723" stroke-width="2.5"/>
    <rect x="${w*0.7-22}" y="${h*0.66}" width="44" height="36" fill="#90caf9" stroke="#3e2723" stroke-width="2.5"/>
    <rect x="${w*0.45-20}" y="${h*0.65}" width="40" height="${h*0.23}" fill="#5d4037" stroke="#3e2723" stroke-width="3"/>
    <rect x="${w*0.45-16}" y="${h*0.69}" width="32" height="14" fill="#3e2723"/>
    <circle cx="${w*0.45+10}" cy="${h*0.78}" r="2.5" fill="#fbc02d"/>
    <!-- Walmdach -->
    <polygon points="0,${h*0.35} ${w*0.2},${h*0.13} ${w*0.8},${h*0.13} ${w},${h*0.35}" fill="#37474f" stroke="#000" stroke-width="3"/>
    <polygon points="${w},${h*0.35} ${w+18},${h*0.37} ${w*0.8+18},${h*0.15} ${w*0.8},${h*0.13}" fill="#263238" stroke="#000" stroke-width="2"/>
    <!-- Hoher Industrieschornstein -->
    <rect x="${w*0.85}" y="${h*-0.15}" width="20" height="${h*0.5}" fill="#a1887f" stroke="#3e2723" stroke-width="2"/>
    <rect x="${w*0.85-3}" y="${h*-0.18}" width="26" height="8" fill="#5d4037" stroke="#000" stroke-width="2"/>
    <g opacity=".7">
      <circle cx="${w*0.85+10}" cy="${h*-0.25}" r="9" fill="#90a4ae"/>
      <circle cx="${w*0.85+18}" cy="${h*-0.35}" r="11" fill="#b0bec5"/>
      <circle cx="${w*0.85+8}" cy="${h*-0.45}" r="13" fill="#cfd8dc"/>
    </g>
  `;
}

// Moderne – sauberes 2-stöckiges Wohnhaus
function svgWohnhausModerne(w, h) {
  const cx = w/2;
  return `
    <ellipse cx="${cx}" cy="${h-5}" rx="${w/2-10}" ry="12" fill="#000" opacity=".35"/>
    <!-- Sockel -->
    <rect x="15" y="${h*0.86}" width="${w-30}" height="${h*0.09}" fill="url(#steinSockel)" stroke="#000" stroke-width="2.5"/>
    <!-- Wand 2 Stockwerke -->
    <rect x="20" y="${h*0.38}" width="${w-40}" height="${h*0.48}" fill="#fff8e1" stroke="#3e2723" stroke-width="3"/>
    <!-- Stockwerk-Trennung -->
    <rect x="15" y="${h*0.62}" width="${w-30}" height="6" fill="#5d4037"/>
    <!-- Fenster oben -->
    <rect x="${w*0.18}" y="${h*0.43}" width="48" height="34" fill="#90caf9" stroke="#3e2723" stroke-width="3"/>
    <line x1="${w*0.18+24}" y1="${h*0.43}" x2="${w*0.18+24}" y2="${h*0.43+34}" stroke="#3e2723" stroke-width="2"/>
    <line x1="${w*0.18}" y1="${h*0.6}" x2="${w*0.18+48}" y2="${h*0.6}" stroke="#3e2723" stroke-width="2"/>
    <rect x="${w*0.62}" y="${h*0.43}" width="48" height="34" fill="#90caf9" stroke="#3e2723" stroke-width="3"/>
    <line x1="${w*0.62+24}" y1="${h*0.43}" x2="${w*0.62+24}" y2="${h*0.43+34}" stroke="#3e2723" stroke-width="2"/>
    <line x1="${w*0.62}" y1="${h*0.6}" x2="${w*0.62+48}" y2="${h*0.6}" stroke="#3e2723" stroke-width="2"/>
    <!-- Fenster unten links -->
    <rect x="${w*0.15}" y="${h*0.7}" width="50" height="32" fill="#90caf9" stroke="#3e2723" stroke-width="3"/>
    <line x1="${w*0.15+25}" y1="${h*0.7}" x2="${w*0.15+25}" y2="${h*0.7+32}" stroke="#3e2723" stroke-width="2"/>
    <!-- Blumenkasten -->
    <rect x="${w*0.15-3}" y="${h*0.7+32}" width="56" height="6" fill="#5d4037" stroke="#000" stroke-width="1.5"/>
    <circle cx="${w*0.15+10}" cy="${h*0.7+32}" r="3" fill="#e91e63"/>
    <circle cx="${w*0.15+25}" cy="${h*0.7+32}" r="3" fill="#fff59d"/>
    <circle cx="${w*0.15+40}" cy="${h*0.7+32}" r="3" fill="#9c27b0"/>
    <!-- Tür mittig -->
    <rect x="${cx-22}" y="${h*0.65}" width="44" height="${h*0.21}" fill="#5d4037" stroke="#3e2723" stroke-width="3" rx="3"/>
    <rect x="${cx-18}" y="${h*0.69}" width="36" height="18" fill="#90caf9" stroke="#3e2723" stroke-width="1.5"/>
    <circle cx="${cx+12}" cy="${h*0.78}" r="2.5" fill="#fbc02d"/>
    <!-- Fenster unten rechts -->
    <rect x="${w*0.65}" y="${h*0.7}" width="50" height="32" fill="#90caf9" stroke="#3e2723" stroke-width="3"/>
    <line x1="${w*0.65+25}" y1="${h*0.7}" x2="${w*0.65+25}" y2="${h*0.7+32}" stroke="#3e2723" stroke-width="2"/>
    <!-- Satteldach -->
    <polygon points="0,${h*0.38} ${cx},${h*0.08} ${w},${h*0.38}" fill="url(#ziegelRot)" stroke="#3e2723" stroke-width="3"/>
    <polygon points="${w},${h*0.38} ${w+22},${h*0.4} ${cx+22},${h*0.1} ${cx},${h*0.08}" fill="url(#ziegelDachSeite)" stroke="#3e2723" stroke-width="2.5"/>
    <!-- Schornstein -->
    <rect x="${cx+w*0.18}" y="${h*0.13}" width="18" height="${h*0.18}" fill="#a52525" stroke="#3e2723" stroke-width="2"/>
    <rect x="${cx+w*0.18-3}" y="${h*0.11}" width="24" height="6" fill="#3e2723"/>
    <g opacity=".75">
      <circle cx="${cx+w*0.18+10}" cy="${h*0.06}" r="6" fill="#eceff1"/>
      <circle cx="${cx+w*0.18+16}" cy="${h*0}" r="9" fill="#fff"/>
    </g>
  `;
}

// Wikinger-Langhaus
function svgLanghaus(w, h) {
  const cx = w/2, base = h*0.95, dachAnsatz = h*0.55, peak = h*0.18;
  return `
    <ellipse cx="${cx}" cy="${base+5}" rx="${w/2-5}" ry="11" fill="#000" opacity=".4"/>
    <!-- niedrige Holzwand -->
    <rect x="20" y="${dachAnsatz}" width="${w-40}" height="${base-dachAnsatz}" fill="url(#holzWand)" stroke="#3e2723" stroke-width="3"/>
    ${[0.15,0.28,0.4,0.52,0.65,0.78,0.9].map(p => `<line x1="${w*p}" y1="${dachAnsatz}" x2="${w*p}" y2="${base}" stroke="#5d4037" stroke-width="2"/>`).join('')}
    <!-- Eingangs-Tor -->
    <rect x="${cx-30}" y="${dachAnsatz+30}" width="60" height="${base-dachAnsatz-30}" fill="#3e2723" stroke="#000" stroke-width="3"/>
    <line x1="${cx}" y1="${dachAnsatz+30}" x2="${cx}" y2="${base}" stroke="#5d4037" stroke-width="2"/>
    <!-- Mini-Fenster -->
    <rect x="${w*0.2}" y="${dachAnsatz+25}" width="20" height="20" fill="#fbc02d" stroke="#000" stroke-width="2"/>
    <rect x="${w*0.78}" y="${dachAnsatz+25}" width="20" height="20" fill="#fbc02d" stroke="#000" stroke-width="2"/>
    <!-- Grasdach – langes Walmdach -->
    <path d="M -10 ${dachAnsatz+5} L ${w*0.18} ${peak} L ${w*0.82} ${peak} L ${w+10} ${dachAnsatz+5} L ${w-10} ${dachAnsatz} L 10 ${dachAnsatz} Z"
          fill="#558b2f" stroke="#33691e" stroke-width="3"/>
    <!-- Grasflecken auf Dach -->
    ${[0.12,0.25,0.4,0.55,0.7,0.85].map(p => `<ellipse cx="${w*p}" cy="${peak + (p<0.18 || p>0.82 ? (p<0.18?(0.18-p):(p-0.82))*h*0.6 : 5)}" rx="14" ry="5" fill="#7cb342" opacity=".7"/>`).join('')}
    ${[0.18,0.32,0.48,0.62,0.78].map(p => `<line x1="${w*p}" y1="${peak+10}" x2="${w*p+3}" y2="${peak+22}" stroke="#33691e" stroke-width="1.5"/>`).join('')}
    <!-- Drachenköpfe gekreuzt am Giebel -->
    <g transform="translate(${w*0.18},${peak})">
      <line x1="0" y1="0" x2="-25" y2="-35" stroke="#5d4037" stroke-width="6" stroke-linecap="round"/>
      <g transform="translate(-25,-35) rotate(-30)">
        <path d="M 0 0 L -10 -4 L -16 0 L -22 -3 L -20 4 L -8 8 Z" fill="#3e2723" stroke="#000" stroke-width="1.5"/>
        <circle cx="-6" cy="-1" r="1.5" fill="#e53935"/>
      </g>
    </g>
    <g transform="translate(${w*0.82},${peak})">
      <line x1="0" y1="0" x2="25" y2="-35" stroke="#5d4037" stroke-width="6" stroke-linecap="round"/>
      <g transform="translate(25,-35) rotate(30)">
        <path d="M 0 0 L 10 -4 L 16 0 L 22 -3 L 20 4 L 8 8 Z" fill="#3e2723" stroke="#000" stroke-width="1.5"/>
        <circle cx="6" cy="-1" r="1.5" fill="#e53935"/>
      </g>
    </g>
    <!-- Rauch in der Mitte -->
    <g opacity=".7">
      <circle cx="${cx-3}" cy="${peak+5}" r="6" fill="#cfd8dc"/>
      <circle cx="${cx+5}" cy="${peak-8}" r="9" fill="#eceff1"/>
      <circle cx="${cx-2}" cy="${peak-22}" r="11" fill="#fff"/>
    </g>
    <!-- Wikinger-Schild -->
    <circle cx="40" cy="${dachAnsatz+25}" r="14" fill="#c62828" stroke="#3e2723" stroke-width="2.5"/>
    <line x1="40" y1="${dachAnsatz+11}" x2="40" y2="${dachAnsatz+39}" stroke="#3e2723" stroke-width="2"/>
    <line x1="26" y1="${dachAnsatz+25}" x2="54" y2="${dachAnsatz+25}" stroke="#3e2723" stroke-width="2"/>
    <circle cx="40" cy="${dachAnsatz+25}" r="3" fill="#fbc02d" stroke="#3e2723" stroke-width="1"/>
  `;
}

function svgSchafstall(w, h) {
  let schafe = '';
  const anz = Math.min(GS.tiere.schaf || 0, 4);
  for (let i = 0; i < anz; i++) {
    const sx = w*0.2 + (i%2)*w*0.35, sy = h*0.65 + Math.floor(i/2)*22;
    schafe += `<g transform="translate(${sx},${sy})">
      <ellipse cx="0" cy="6" rx="14" ry="4" fill="#000" opacity=".3"/>
      <ellipse cx="0" cy="0" rx="13" ry="9" fill="#fff" stroke="#000" stroke-width="1.5"/>
      <circle cx="-9" cy="-3" r="5" fill="#3e2723" stroke="#000" stroke-width="1.5"/>
      <circle cx="-11" cy="-4" r="1" fill="#fff"/>
      <line x1="-5" y1="6" x2="-5" y2="11" stroke="#3e2723" stroke-width="2"/>
      <line x1="5" y1="6" x2="5" y2="11" stroke="#3e2723" stroke-width="2"/>
    </g>`;
  }
  return `
    <ellipse cx="${w/2}" cy="${h-5}" rx="${w/2-10}" ry="11" fill="#000" opacity=".35"/>
    <rect x="10" y="${h*0.85}" width="${w-20}" height="${h*0.1}" fill="url(#steinSockel)" stroke="#000" stroke-width="2"/>
    <rect x="10" y="${h*0.45}" width="${w-20}" height="${h*0.4}" fill="url(#holzWand)" stroke="#3e2723" stroke-width="3"/>
    <rect x="${w/2-25}" y="${h*0.6}" width="50" height="${h*0.25}" fill="#3e2723" stroke="#000" stroke-width="2.5"/>
    <polygon points="-5,${h*0.45} ${w/2},${h*0.15} ${w+5},${h*0.45}" fill="#558b2f" stroke="#33691e" stroke-width="3"/>
    <text x="${w/2}" y="${h*0.12}" text-anchor="middle" font-size="22">🐑</text>
    ${schafe}
  `;
}

function svgFachwerkhaus(w, h) {
  return `
    <ellipse cx="${w/2}" cy="${h-5}" rx="${w/2-10}" ry="12" fill="#000" opacity=".35"/>
    <rect x="15" y="${h*0.78}" width="${w-30}" height="${h*0.18}" fill="url(#steinSockel)" stroke="#000" stroke-width="2"/>
    <polygon points="${w-15},${h*0.35} ${w+8},${h*0.37} ${w+8},${h*0.78} ${w-15},${h*0.76}" fill="#8d6e63" stroke="#000" stroke-width="2"/>
    <rect x="15" y="${h*0.35}" width="${w-30}" height="${h*0.43}" fill="url(#fachwerk)" stroke="#000" stroke-width="3"/>
    <rect x="40" y="${h*0.42}" width="46" height="32" fill="#8d6e63" stroke="#000" stroke-width="2.5"/>
    <line x1="63" y1="${h*0.42}" x2="63" y2="${h*0.42+32}" stroke="#3e2723" stroke-width="2"/>
    <rect x="${w-86}" y="${h*0.42}" width="46" height="32" fill="#8d6e63" stroke="#000" stroke-width="2.5"/>
    <line x1="${w-63}" y1="${h*0.42}" x2="${w-63}" y2="${h*0.42+32}" stroke="#3e2723" stroke-width="2"/>
    <rect x="${w/2-22}" y="${h*0.58}" width="44" height="${h*0.2}" fill="#5d4037" stroke="#000" stroke-width="3"/>
    <polygon points="${w/2-22},${h*0.58} ${w/2},${h*0.5} ${w/2+22},${h*0.58}" fill="#3e2723" stroke="#000" stroke-width="2"/>
    <polygon points="0,${h*0.35} ${w/2},${h*0.05} ${w},${h*0.35}" fill="url(#ziegelRot)" stroke="#000" stroke-width="3"/>
    <polygon points="${w},${h*0.35} ${w+22},${h*0.37} ${w/2+22},${h*0.05+5} ${w/2},${h*0.05}" fill="url(#ziegelDachSeite)" stroke="#000" stroke-width="2.5"/>
    <rect x="${w/2-12}" y="${h*0.27}" width="24" height="18" fill="#fff8e1" stroke="#000" stroke-width="2"/>
    <rect x="50" y="${h*0.13}" width="16" height="38" fill="#8d6e63" stroke="#000" stroke-width="2.5"/>
    <g opacity=".75">
      <circle cx="58" cy="${h*0.08}" r="7" fill="#eceff1"/>
      <circle cx="65" cy="${h*0.03}" r="9" fill="#fff"/>
    </g>
  `;
}

function svgFeuerstelle(w, h) {
  return `
    <ellipse cx="${w/2}" cy="${h-5}" rx="${w/2-5}" ry="9" fill="#000" opacity=".4"/>
    <ellipse cx="${w/2}" cy="${h*0.78}" rx="${w*0.42}" ry="${h*0.16}" fill="#9e9e9e" stroke="#424242" stroke-width="3"/>
    <ellipse cx="${w/2}" cy="${h*0.7}" rx="${w*0.32}" ry="${h*0.1}" fill="#3e2723"/>
    <polygon points="${w/2-15},${h*0.7} ${w/2-25},${h*0.3} ${w/2-5},${h*0.5}" fill="#5d4037" stroke="#3e2723" stroke-width="1.5"/>
    <polygon points="${w/2+15},${h*0.7} ${w/2+25},${h*0.3} ${w/2+5},${h*0.5}" fill="#5d4037" stroke="#3e2723" stroke-width="1.5"/>
    <ellipse cx="${w/2}" cy="${h*0.45}" rx="14" ry="22" fill="#ff5722"/>
    <ellipse cx="${w/2}" cy="${h*0.4}" rx="9" ry="16" fill="#ffeb3b"/>
    <ellipse cx="${w/2}" cy="${h*0.35}" rx="5" ry="9" fill="#fff"/>
    <text x="${w/2}" y="${h-2}" text-anchor="middle" font-size="11" font-weight="900" fill="#fff" stroke="#000" stroke-width="3" paint-order="stroke">Feuerstelle</text>
  `;
}

function svgVorratsgrube(w, h) {
  return `
    <ellipse cx="${w/2}" cy="${h-5}" rx="${w/2-5}" ry="9" fill="#000" opacity=".4"/>
    <ellipse cx="${w/2}" cy="${h*0.7}" rx="${w*0.42}" ry="${h*0.18}" fill="#5d4037" stroke="#3e2723" stroke-width="3"/>
    <ellipse cx="${w/2}" cy="${h*0.55}" rx="${w*0.36}" ry="${h*0.13}" fill="#3e2723"/>
    <ellipse cx="${w/2}" cy="${h*0.5}" rx="${w*0.3}" ry="${h*0.08}" fill="#1a1a1a"/>
    <rect x="${w/2-20}" y="${h*0.3}" width="40" height="22" fill="#a1887f" stroke="#5d4037" stroke-width="2" rx="3"/>
    <line x1="${w/2-15}" y1="${h*0.35}" x2="${w/2+15}" y2="${h*0.35}" stroke="#5d4037" stroke-width="1"/>
    <text x="${w/2}" y="${h-2}" text-anchor="middle" font-size="11" font-weight="900" fill="#fff" stroke="#000" stroke-width="3" paint-order="stroke">Vorratsgrube</text>
  `;
}

function svgHuehnerstall(w, h, huehner) {
  let huehnerSvg = '';
  for (let i = 0; i < Math.min(huehner, 6); i++) {
    huehnerSvg += `<g transform="translate(${w*0.55 + (i%3)*22},${h*0.78 + Math.floor(i/3)*20})">
      <ellipse cx="9" cy="14" rx="9" ry="2" fill="#000" opacity=".3"/>
      <ellipse cx="9" cy="9" rx="8" ry="6" fill="#fff" stroke="#000" stroke-width="1.2"/>
      <circle cx="14" cy="5" r="4.5" fill="#fff" stroke="#000" stroke-width="1.2"/>
      <polygon points="17,4 21,5 17,6" fill="#ffa726" stroke="#000" stroke-width=".5"/>
      <path d="M 11 1 L 12 -1 L 13 1 L 14 -1 L 15 1" fill="#e53935" stroke="#000" stroke-width=".5"/>
      <circle cx="15" cy="4" r="1" fill="#000"/>
    </g>`;
  }
  return `
    <ellipse cx="${w/2}" cy="${h-5}" rx="${w/2-10}" ry="11" fill="#000" opacity=".35"/>
    <rect x="10" y="${h*0.82}" width="${w-20}" height="${h*0.13}" fill="url(#steinSockel)" stroke="#000" stroke-width="2"/>
    <polygon points="${w-10},${h*0.42} ${w+10},${h*0.44} ${w+10},${h*0.82} ${w-10},${h*0.8}" fill="url(#ziegelDachSeite)" stroke="#000" stroke-width="2"/>
    <rect x="10" y="${h*0.42}" width="${w-20}" height="${h*0.4}" fill="url(#holzWand)" stroke="#000" stroke-width="3"/>
    <line x1="10" y1="${h*0.55}" x2="${w-10}" y2="${h*0.55}" stroke="#5d4037" stroke-width="2"/>
    <line x1="10" y1="${h*0.7}" x2="${w-10}" y2="${h*0.7}" stroke="#5d4037" stroke-width="2"/>
    <rect x="${w/2-20}" y="${h*0.6}" width="40" height="${h*0.22}" fill="#3e2723" stroke="#000" stroke-width="2.5"/>
    <rect x="${w/2-15}" y="${h*0.65}" width="30" height="${h*0.12}" fill="#5d4037"/>
    <circle cx="${w/2}" cy="${h*0.34}" r="14" fill="#3e2723" stroke="#000" stroke-width="2.5"/>
    <circle cx="${w/2}" cy="${h*0.34}" r="10" fill="#1a1a1a"/>
    <line x1="${w/2-12}" y1="${h*0.34}" x2="${w/2+12}" y2="${h*0.34}" stroke="#5d4037" stroke-width="3"/>
    <polygon points="-5,${h*0.42} ${w/2},${h*0.12} ${w+5},${h*0.42}" fill="url(#ziegelRot)" stroke="#000" stroke-width="3"/>
    <polygon points="${w+5},${h*0.42} ${w+25},${h*0.44} ${w/2+20},${h*0.14} ${w/2},${h*0.12}" fill="url(#ziegelDachSeite)" stroke="#000" stroke-width="2.5"/>
    <text x="${w/2}" y="${h*0.09}" text-anchor="middle" font-size="22">🐔</text>
    ${huehnerSvg}
  `;
}

function svgSteinstall(w, h) {
  return `
    <ellipse cx="${w/2}" cy="${h-5}" rx="${w/2-10}" ry="11" fill="#000" opacity=".35"/>
    <polygon points="${w-10},${h*0.4} ${w+10},${h*0.42} ${w+10},${h*0.92} ${w-10},${h*0.9}" fill="#a1887f" stroke="#000" stroke-width="2"/>
    <rect x="10" y="${h*0.4}" width="${w-20}" height="${h*0.5}" fill="url(#steinSockel)" stroke="#000" stroke-width="3"/>
    <rect x="${w/2-25}" y="${h*0.55}" width="50" height="${h*0.35}" fill="#3e2723" stroke="#000" stroke-width="3" rx="20"/>
    <rect x="40" y="${h*0.48}" width="36" height="28" fill="#3e2723" stroke="#000" stroke-width="2"/>
    <rect x="${w-76}" y="${h*0.48}" width="36" height="28" fill="#3e2723" stroke="#000" stroke-width="2"/>
    <polygon points="-5,${h*0.4} ${w/2},${h*0.1} ${w+5},${h*0.4}" fill="#a52525" stroke="#000" stroke-width="3"/>
    <polygon points="${w+5},${h*0.4} ${w+22},${h*0.42} ${w/2+18},${h*0.12} ${w/2},${h*0.1}" fill="#8b1e1e" stroke="#000" stroke-width="2"/>
    <text x="${w/2}" y="${h*0.06}" text-anchor="middle" font-size="22">🐂</text>
  `;
}

function svgMuehle(w, h) {
  return `
    <ellipse cx="${w/2}" cy="${h-5}" rx="${w/2-5}" ry="11" fill="#000" opacity=".35"/>
    <rect x="10" y="${h*0.45}" width="${w-20}" height="${h*0.5}" fill="url(#steinSockel)" stroke="#000" stroke-width="3"/>
    <polygon points="0,${h*0.45} ${w/2},${h*0.18} ${w},${h*0.45}" fill="#5d4037" stroke="#000" stroke-width="3"/>
    <rect x="${w/2-15}" y="${h*0.62}" width="30" height="${h*0.33}" fill="#3e2723" stroke="#000" stroke-width="2.5"/>
    <rect x="20" y="${h*0.55}" width="20" height="20" fill="#fff8e1" stroke="#000" stroke-width="2"/>
    <rect x="${w-40}" y="${h*0.55}" width="20" height="20" fill="#fff8e1" stroke="#000" stroke-width="2"/>
    <!-- Wasserrad -->
    <circle cx="${w-5}" cy="${h*0.7}" r="${h*0.22}" fill="#5d4037" stroke="#000" stroke-width="3"/>
    <circle cx="${w-5}" cy="${h*0.7}" r="6" fill="#3e2723"/>
    <line x1="${w-5}" y1="${h*0.48}" x2="${w-5}" y2="${h*0.92}" stroke="#3e2723" stroke-width="3"/>
    <line x1="${w-5-h*0.22}" y1="${h*0.7}" x2="${w-5+h*0.22}" y2="${h*0.7}" stroke="#3e2723" stroke-width="3"/>
    <line x1="${w-5-h*0.16}" y1="${h*0.7-h*0.16}" x2="${w-5+h*0.16}" y2="${h*0.7+h*0.16}" stroke="#3e2723" stroke-width="3"/>
    <line x1="${w-5+h*0.16}" y1="${h*0.7-h*0.16}" x2="${w-5-h*0.16}" y2="${h*0.7+h*0.16}" stroke="#3e2723" stroke-width="3"/>
    <text x="${w/2}" y="${h*0.4}" text-anchor="middle" font-size="22">⚙️</text>
  `;
}

function svgWindmuehle(w, h) {
  const cx = w/2, cy = h*0.25;
  return `
    <ellipse cx="${w/2}" cy="${h-5}" rx="${w/2-5}" ry="11" fill="#000" opacity=".35"/>
    <polygon points="${w/2-30},${h*0.95} ${w/2-50},${h*0.45} ${w/2+50},${h*0.45} ${w/2+30},${h*0.95}" fill="url(#ziegelRot)" stroke="#000" stroke-width="3"/>
    <rect x="${w/2-12}" y="${h*0.7}" width="24" height="${h*0.25}" fill="#3e2723" stroke="#000" stroke-width="2.5"/>
    <rect x="${w/2-22}" y="${h*0.55}" width="14" height="14" fill="#fff8e1" stroke="#000" stroke-width="2"/>
    <rect x="${w/2+8}" y="${h*0.55}" width="14" height="14" fill="#fff8e1" stroke="#000" stroke-width="2"/>
    <polygon points="${w/2-50},${h*0.45} ${w/2},${h*0.3} ${w/2+50},${h*0.45}" fill="#5d4037" stroke="#000" stroke-width="3"/>
    <!-- Flügel -->
    <g transform="translate(${cx},${cy})">
      <g>
        <rect x="-2" y="-90" width="4" height="80" fill="#5d4037" stroke="#000" stroke-width="1.5"/>
        <polygon points="-15,-90 15,-90 5,-15 -5,-15" fill="#fff8e1" stroke="#000" stroke-width="1.5"/>
      </g>
      <g transform="rotate(90)">
        <rect x="-2" y="-90" width="4" height="80" fill="#5d4037" stroke="#000" stroke-width="1.5"/>
        <polygon points="-15,-90 15,-90 5,-15 -5,-15" fill="#fff8e1" stroke="#000" stroke-width="1.5"/>
      </g>
      <g transform="rotate(180)">
        <rect x="-2" y="-90" width="4" height="80" fill="#5d4037" stroke="#000" stroke-width="1.5"/>
        <polygon points="-15,-90 15,-90 5,-15 -5,-15" fill="#fff8e1" stroke="#000" stroke-width="1.5"/>
      </g>
      <g transform="rotate(270)">
        <rect x="-2" y="-90" width="4" height="80" fill="#5d4037" stroke="#000" stroke-width="1.5"/>
        <polygon points="-15,-90 15,-90 5,-15 -5,-15" fill="#fff8e1" stroke="#000" stroke-width="1.5"/>
      </g>
      <circle r="8" fill="#3e2723" stroke="#000" stroke-width="2"/>
      <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="8s" repeatCount="indefinite"/>
    </g>
  `;
}

function svgSchmiede(w, h) {
  return `
    <ellipse cx="${w/2}" cy="${h-5}" rx="${w/2-10}" ry="10" fill="#000" opacity=".35"/>
    <rect x="10" y="${h*0.45}" width="${w-20}" height="${h*0.5}" fill="url(#steinSockel)" stroke="#000" stroke-width="3"/>
    <rect x="${w/2-25}" y="${h*0.55}" width="50" height="${h*0.4}" fill="#3e2723" stroke="#000" stroke-width="3" rx="3"/>
    <polygon points="0,${h*0.45} ${w/2},${h*0.15} ${w},${h*0.45}" fill="#37474f" stroke="#000" stroke-width="3"/>
    <!-- Schornstein mit Rauch -->
    <rect x="${w*0.7}" y="${h*0.1}" width="20" height="${h*0.3}" fill="#5d4037" stroke="#000" stroke-width="2"/>
    <g opacity=".7">
      <circle cx="${w*0.7+10}" cy="${h*0.05}" r="9" fill="#90a4ae"/>
      <circle cx="${w*0.7+18}" cy="${h*-0.02}" r="11" fill="#b0bec5"/>
    </g>
    <text x="${w/2}" y="${h*0.42}" text-anchor="middle" font-size="22">⚒️</text>
    <!-- glühender Amboss -->
    <ellipse cx="${w*0.25}" cy="${h*0.78}" rx="14" ry="3" fill="#ff5722" opacity=".7"/>
    <rect x="${w*0.21}" y="${h*0.7}" width="20" height="${h*0.08}" fill="#212121" stroke="#000" stroke-width="2"/>
  `;
}

function svgKuhstall(w, h) {
  return `
    <ellipse cx="${w/2}" cy="${h-5}" rx="${w/2-10}" ry="13" fill="#000" opacity=".35"/>
    <rect x="10" y="${h*0.85}" width="${w-20}" height="${h*0.1}" fill="url(#steinSockel)" stroke="#000" stroke-width="2"/>
    <polygon points="${w-10},${h*0.45} ${w+15},${h*0.47} ${w+15},${h*0.85} ${w-10},${h*0.83}" fill="url(#ziegelDachSeite)" stroke="#000" stroke-width="2"/>
    <rect x="10" y="${h*0.45}" width="${w-20}" height="${h*0.4}" fill="#fff8e1" stroke="#000" stroke-width="3"/>
    <line x1="10" y1="${h*0.45}" x2="${w-10}" y2="${h*0.45}" stroke="#5d4037" stroke-width="4"/>
    <line x1="10" y1="${h*0.65}" x2="${w-10}" y2="${h*0.65}" stroke="#5d4037" stroke-width="3"/>
    <line x1="10" y1="${h*0.45}" x2="${w/2}" y2="${h*0.65}" stroke="#5d4037" stroke-width="2"/>
    <line x1="10" y1="${h*0.65}" x2="${w/2}" y2="${h*0.45}" stroke="#5d4037" stroke-width="2"/>
    <line x1="${w/2}" y1="${h*0.45}" x2="${w-10}" y2="${h*0.65}" stroke="#5d4037" stroke-width="2"/>
    <line x1="${w/2}" y1="${h*0.65}" x2="${w-10}" y2="${h*0.45}" stroke="#5d4037" stroke-width="2"/>
    <rect x="${w/2-25}" y="${h*0.65}" width="50" height="${h*0.2}" fill="#3e2723" stroke="#000" stroke-width="3"/>
    <rect x="40" y="${h*0.7}" width="32" height="28" fill="#90caf9" stroke="#000" stroke-width="2.5"/>
    <rect x="${w-72}" y="${h*0.7}" width="32" height="28" fill="#90caf9" stroke="#000" stroke-width="2.5"/>
    <polygon points="-5,${h*0.45} ${w/2},${h*0.13} ${w+5},${h*0.45}" fill="url(#ziegelRot)" stroke="#000" stroke-width="3"/>
    <polygon points="${w+5},${h*0.45} ${w+25},${h*0.47} ${w/2+22},${h*0.15} ${w/2},${h*0.13}" fill="url(#ziegelDachSeite)" stroke="#000" stroke-width="2.5"/>
    <rect x="${w/2-12}" y="${h*0.25}" width="24" height="22" fill="#3e2723" stroke="#000" stroke-width="2"/>
    <text x="${w/2}" y="${h*0.1}" text-anchor="middle" font-size="22">🐮</text>
  `;
}

function svgSchweinestall(w, h) {
  return svgGenericFarbig(w, h, '#bf360c', '#5d4037', '🐷');
}
function svgScheune(w, h) {
  return `
    <ellipse cx="${w/2}" cy="${h-5}" rx="${w/2-10}" ry="13" fill="#000" opacity=".35"/>
    <polygon points="${w-10},${h*0.45} ${w+15},${h*0.47} ${w+15},${h*0.92} ${w-10},${h*0.9}" fill="#5d4037" stroke="#000" stroke-width="2"/>
    <rect x="10" y="${h*0.45}" width="${w-20}" height="${h*0.45}" fill="#8d4a2b" stroke="#000" stroke-width="3"/>
    <line x1="20" y1="${h*0.5}" x2="${w-20}" y2="${h*0.5}" stroke="#5d4037" stroke-width="2"/>
    <line x1="20" y1="${h*0.85}" x2="${w-20}" y2="${h*0.85}" stroke="#5d4037" stroke-width="2"/>
    <rect x="${w/2-40}" y="${h*0.5}" width="80" height="${h*0.4}" fill="#5d4037" stroke="#000" stroke-width="3"/>
    <line x1="${w/2}" y1="${h*0.5}" x2="${w/2}" y2="${h*0.9}" stroke="#3e2723" stroke-width="3"/>
    <line x1="${w/2-40}" y1="${h*0.5}" x2="${w/2+40}" y2="${h*0.9}" stroke="#3e2723" stroke-width="2"/>
    <line x1="${w/2+40}" y1="${h*0.5}" x2="${w/2-40}" y2="${h*0.9}" stroke="#3e2723" stroke-width="2"/>
    <polygon points="-5,${h*0.45} ${w/2},${h*0.1} ${w+5},${h*0.45}" fill="#c62828" stroke="#000" stroke-width="3"/>
    <polygon points="${w+5},${h*0.45} ${w+25},${h*0.47} ${w/2+22},${h*0.12} ${w/2},${h*0.1}" fill="#8b1e1e" stroke="#000" stroke-width="2.5"/>
    <text x="${w/2}" y="${h*0.32}" text-anchor="middle" font-size="22">🌾</text>
  `;
}
function svgSilo(w, h) {
  return `
    <ellipse cx="${w/2}" cy="${h-5}" rx="${w/2-5}" ry="9" fill="#000" opacity=".35"/>
    <ellipse cx="${w/2}" cy="${h*0.95}" rx="${w/2}" ry="11" fill="#5d4037" stroke="#000" stroke-width="2"/>
    <rect x="0" y="${h*0.25}" width="${w}" height="${h*0.7}" fill="#cfd8dc" stroke="#000" stroke-width="3"/>
    <rect x="6" y="${h*0.25}" width="10" height="${h*0.7}" fill="#fff" opacity=".4"/>
    <rect x="${w-16}" y="${h*0.25}" width="10" height="${h*0.7}" fill="#78909c"/>
    <ellipse cx="${w/2}" cy="${h*0.25}" rx="${w/2}" ry="11" fill="#90a4ae" stroke="#000" stroke-width="3"/>
    <path d="M 0 ${h*0.25} Q ${w/2} ${h*0.05} ${w} ${h*0.25} Z" fill="#b0bec5" stroke="#000" stroke-width="3"/>
    <line x1="${w/2}" y1="${h*0.05}" x2="${w/2}" y2="${h*-0.04}" stroke="#000" stroke-width="3"/>
    <circle cx="${w/2}" cy="${h*-0.04}" r="5" fill="#fbc02d" stroke="#000" stroke-width="2"/>
    ${[0.4, 0.55, 0.7, 0.85].map(y => `<ellipse cx="${w/2}" cy="${h*y}" rx="${w/2}" ry="3" fill="#78909c"/>`).join('')}
    <text x="${w/2}" y="${h*0.6}" text-anchor="middle" font-size="14" font-weight="900" fill="#3e2723">SILO</text>
  `;
}
function svgWerkstatt(w, h) {
  return `
    <ellipse cx="${w/2}" cy="${h-5}" rx="${w/2-10}" ry="11" fill="#000" opacity=".35"/>
    <rect x="10" y="${h*0.4}" width="${w-20}" height="${h*0.55}" fill="#90a4ae" stroke="#000" stroke-width="3"/>
    <polygon points="0,${h*0.4} ${w/2},${h*0.18} ${w},${h*0.4}" fill="#37474f" stroke="#000" stroke-width="3"/>
    <rect x="${w/2-35}" y="${h*0.55}" width="70" height="${h*0.4}" fill="#3e2723" stroke="#000" stroke-width="3"/>
    <line x1="${w/2-35}" y1="${h*0.6}" x2="${w/2+35}" y2="${h*0.6}" stroke="#5d4037" stroke-width="1.5"/>
    <line x1="${w/2-35}" y1="${h*0.7}" x2="${w/2+35}" y2="${h*0.7}" stroke="#5d4037" stroke-width="1.5"/>
    <line x1="${w/2-35}" y1="${h*0.8}" x2="${w/2+35}" y2="${h*0.8}" stroke="#5d4037" stroke-width="1.5"/>
    <rect x="20" y="${h*0.5}" width="32" height="28" fill="#fbc02d" stroke="#000" stroke-width="2"/>
    <rect x="${w-52}" y="${h*0.5}" width="32" height="28" fill="#fbc02d" stroke="#000" stroke-width="2"/>
    <text x="${w/2}" y="${h*0.45}" text-anchor="middle" font-size="22">🔧</text>
  `;
}
function svgHofladen(w, h) {
  return `
    <ellipse cx="${w/2}" cy="${h-5}" rx="${w/2-10}" ry="11" fill="#000" opacity=".35"/>
    <rect x="10" y="${h*0.4}" width="${w-20}" height="${h*0.55}" fill="#fff8e1" stroke="#000" stroke-width="3"/>
    <polygon points="0,${h*0.4} ${w/2},${h*0.15} ${w},${h*0.4}" fill="#43a047" stroke="#000" stroke-width="3"/>
    <!-- Markise gestreift -->
    <polygon points="10,${h*0.5} ${w-10},${h*0.5} ${w-25},${h*0.62} 25,${h*0.62}" fill="#e53935" stroke="#000" stroke-width="2"/>
    <polygon points="40,${h*0.5} 60,${h*0.5} 50,${h*0.62}" fill="#fff"/>
    <polygon points="80,${h*0.5} 100,${h*0.5} 90,${h*0.62}" fill="#fff"/>
    <polygon points="${w-100},${h*0.5} ${w-80},${h*0.5} ${w-90},${h*0.62}" fill="#fff"/>
    <rect x="${w/2-25}" y="${h*0.65}" width="50" height="${h*0.3}" fill="#5d4037" stroke="#000" stroke-width="3"/>
    <rect x="${w/2-22}" y="${h*0.7}" width="44" height="22" fill="#90caf9" stroke="#000" stroke-width="2"/>
    <text x="${w/2}" y="${h*0.34}" text-anchor="middle" font-size="22">🏪</text>
    <text x="${w/2}" y="${h-2}" text-anchor="middle" font-size="11" font-weight="900" fill="#fff" stroke="#000" stroke-width="3" paint-order="stroke">HOFLADEN</text>
  `;
}
function svgTankstelle(w, h) {
  return `
    <ellipse cx="${w/2}" cy="${h-5}" rx="${w/2-5}" ry="9" fill="#000" opacity=".35"/>
    <rect x="${w*0.1}" y="${h*0.85}" width="${w*0.8}" height="${h*0.1}" fill="#37474f" stroke="#000" stroke-width="2"/>
    <rect x="20" y="${h*0.55}" width="22" height="${h*0.3}" fill="#1565c0" stroke="#000" stroke-width="3"/>
    <rect x="22" y="${h*0.58}" width="18" height="14" fill="#fff" stroke="#000" stroke-width="1.5"/>
    <text x="31" y="${h*0.68}" text-anchor="middle" font-size="9" font-weight="900" fill="#1565c0">€</text>
    <line x1="42" y1="${h*0.7}" x2="60" y2="${h*0.7}" stroke="#000" stroke-width="3"/>
    <rect x="${w*0.1}" y="${h*0.18}" width="${w*0.8}" height="14" fill="#fbc02d" stroke="#000" stroke-width="3"/>
    <rect x="${w*0.15}" y="${h*0.18}" width="14" height="${h*0.4}" fill="#90a4ae" stroke="#000" stroke-width="2"/>
    <rect x="${w*0.78}" y="${h*0.18}" width="14" height="${h*0.4}" fill="#90a4ae" stroke="#000" stroke-width="2"/>
    <text x="${w/2}" y="${h*0.3}" text-anchor="middle" font-size="22">⛽</text>
  `;
}
function svgBiogas(w, h) {
  return `
    <ellipse cx="${w/2}" cy="${h-5}" rx="${w/2-10}" ry="11" fill="#000" opacity=".35"/>
    <ellipse cx="${w*0.35}" cy="${h*0.55}" rx="${w*0.3}" ry="${h*0.4}" fill="#558b2f" stroke="#000" stroke-width="3"/>
    <ellipse cx="${w*0.35}" cy="${h*0.25}" rx="${w*0.3}" ry="${h*0.1}" fill="#7cb342" stroke="#000" stroke-width="3"/>
    <rect x="${w*0.7}" y="${h*0.4}" width="${w*0.25}" height="${h*0.55}" fill="#90a4ae" stroke="#000" stroke-width="3"/>
    <rect x="${w*0.7}" y="${h*0.4}" width="${w*0.25}" height="14" fill="#cfd8dc"/>
    <rect x="${w*0.74}" y="${h*0.5}" width="14" height="14" fill="#fbc02d" stroke="#000" stroke-width="1.5"/>
    <text x="${w*0.74+7}" y="${h*0.62}" text-anchor="middle" font-size="14" font-weight="900" fill="#000">⚡</text>
    <text x="${w/2}" y="${h*0.18}" text-anchor="middle" font-size="22">🔋</text>
  `;
}
function svgGeneric(w, h, em) { return svgGenericFarbig(w, h, '#bcaaa4', '#c62828', em); }
function svgGenericFarbig(w, h, wand, dach, em) {
  return `
    <ellipse cx="${w/2}" cy="${h-2}" rx="${w/2 - 5}" ry="10" fill="#000" opacity=".35"/>
    <polygon points="5,${h-22} ${w-5},${h-22} ${w+15},${h-10} 20,${h-10}" fill="#8d6e63" stroke="#000" stroke-width="2"/>
    <rect x="5" y="${h-32}" width="${w-10}" height="10" fill="url(#steinSockel)" stroke="#000" stroke-width="1.5"/>
    <polygon points="${w-5},${h*0.4} ${w+18},${h*0.4 + 18} ${w+18},${h-10} ${w-5},${h-22}" fill="${wand}" stroke="#000" stroke-width="2" opacity=".7"/>
    <rect x="5" y="${h*0.4}" width="${w-10}" height="${h*0.5 - 8}" fill="${wand}" stroke="#000" stroke-width="2.5"/>
    <rect x="${w*0.4}" y="${h*0.65}" width="${w*0.2}" height="${h*0.3}" fill="#3e2723" stroke="#000" stroke-width="2"/>
    <polygon points="-5,${h*0.4} ${w/2},${h*0.05} ${w+5},${h*0.4}" fill="${dach}" stroke="#000" stroke-width="3"/>
    <polygon points="${w+5},${h*0.4} ${w+22},${h*0.4 + 14} ${w/2 + 17},${h*0.05 + 14} ${w/2},${h*0.05}" fill="${dach}" stroke="#000" stroke-width="2" opacity=".7"/>
    <text x="${w/2}" y="${h*0.5}" text-anchor="middle" font-size="44">${em}</text>
  `;
}

// ============================================================
// TRECKER (verschiedene Sprites pro Typ)
// ============================================================
function drawTreckerInto(g) {
  g.innerHTML = '';
  g.appendChild(svgEl('g', {id:'treckerInner', transform:'translate(-75,-60)'}));
  const inner = g.querySelector('#treckerInner');
  inner.innerHTML = treckerSpriteFor(GS.treckerAktiv);
}
function treckerSpriteFor(typ) {
  switch(typ) {
    case 'hacke': return `
      <ellipse cx="75" cy="115" rx="35" ry="6" fill="#000" opacity=".35"/>
      <g transform="translate(60,60)">
        <rect x="-4" y="-50" width="8" height="80" fill="#8d6e63" stroke="#000" stroke-width="2"/>
        <polygon points="-15,-55 15,-55 10,-30 -10,-30" fill="#9e9e9e" stroke="#000" stroke-width="2"/>
        <text x="0" y="50" text-anchor="middle" font-size="11" font-weight="900" fill="#fff" stroke="#000" stroke-width="3" paint-order="stroke">Steinhacke</text>
      </g>
    `;
    case 'ochse': return `
      <ellipse cx="75" cy="115" rx="55" ry="8" fill="#000" opacity=".35"/>
      <g transform="translate(35,40)">
        <ellipse cx="20" cy="60" rx="35" ry="20" fill="#5d4037" stroke="#000" stroke-width="2.5"/>
        <ellipse cx="-12" cy="50" rx="14" ry="13" fill="#5d4037" stroke="#000" stroke-width="2.5"/>
        <ellipse cx="-18" cy="48" rx="3" ry="6" fill="#fff" stroke="#000" stroke-width="1"/>
        <ellipse cx="-8" cy="48" rx="3" ry="6" fill="#fff" stroke="#000" stroke-width="1"/>
        <circle cx="-18" cy="49" r="1.5" fill="#000"/>
        <circle cx="-8" cy="49" r="1.5" fill="#000"/>
        <path d="M -22 40 Q -28 30 -25 38" stroke="#fff" stroke-width="3" fill="none"/>
        <path d="M -2 40 Q 4 30 1 38" stroke="#fff" stroke-width="3" fill="none"/>
        <line x1="0" y1="80" x2="0" y2="95" stroke="#3e2723" stroke-width="3"/>
        <line x1="20" y1="80" x2="20" y2="95" stroke="#3e2723" stroke-width="3"/>
        <line x1="40" y1="80" x2="40" y2="95" stroke="#3e2723" stroke-width="3"/>
        <line x1="55" y1="80" x2="55" y2="95" stroke="#3e2723" stroke-width="3"/>
        <rect x="50" y="65" width="40" height="6" fill="#5d4037" stroke="#000" stroke-width="1.5"/>
        <polygon points="90,55 105,75 80,80" fill="#3e2723" stroke="#000" stroke-width="2"/>
      </g>
    `;
    case 'drachenboot': return `
      <ellipse cx="75" cy="115" rx="70" ry="9" fill="#000" opacity=".4"/>
      <g transform="translate(0,40)">
        <!-- Rumpf -->
        <path d="M 5 50 Q 75 80 145 50 L 135 30 Q 75 20 15 30 Z" fill="#5d4037" stroke="#3e2723" stroke-width="2.5"/>
        <line x1="20" y1="40" x2="130" y2="40" stroke="#3e2723" stroke-width="1.5"/>
        <!-- Schilde am Rand -->
        ${[30,55,80,105].map(x => `<circle cx="${x}" cy="35" r="7" fill="#c62828" stroke="#3e2723" stroke-width="1.5"/><circle cx="${x}" cy="35" r="2" fill="#fbc02d"/>`).join('')}
        <!-- Mast -->
        <line x1="75" y1="32" x2="75" y2="-30" stroke="#3e2723" stroke-width="3"/>
        <!-- Segel rot-weiß gestreift -->
        <rect x="40" y="-25" width="70" height="50" fill="#fff" stroke="#3e2723" stroke-width="2"/>
        <rect x="40" y="-15" width="70" height="8" fill="#c62828"/>
        <rect x="40" y="3" width="70" height="8" fill="#c62828"/>
        <!-- Drachenkopf vorn -->
        <path d="M 145 50 L 158 30 L 162 35 L 156 42 L 162 45 L 152 55 Z" fill="#3e2723" stroke="#000" stroke-width="2"/>
        <circle cx="156" cy="38" r="1.5" fill="#e53935"/>
        <!-- Heck -->
        <path d="M 5 50 L -5 35 L 0 50" fill="#3e2723" stroke="#000" stroke-width="2"/>
      </g>
    `;
    case 'pferd': return `
      <ellipse cx="75" cy="115" rx="55" ry="8" fill="#000" opacity=".35"/>
      <g transform="translate(35,30)">
        <ellipse cx="25" cy="60" rx="38" ry="18" fill="#6d4c41" stroke="#000" stroke-width="2.5"/>
        <ellipse cx="-12" cy="40" rx="11" ry="14" fill="#6d4c41" stroke="#000" stroke-width="2.5"/>
        <polygon points="-20,30 -15,15 -10,30" fill="#6d4c41" stroke="#000" stroke-width="1.5"/>
        <polygon points="-7,28 -2,15 0,30" fill="#6d4c41" stroke="#000" stroke-width="1.5"/>
        <circle cx="-15" cy="40" r="1.5" fill="#000"/>
        <ellipse cx="-13" cy="48" rx="2" ry="3" fill="#000"/>
        <path d="M -3 35 Q 10 25 12 30" stroke="#3e2723" stroke-width="3" fill="none"/>
        <line x1="5" y1="78" x2="5" y2="100" stroke="#3e2723" stroke-width="4"/>
        <line x1="20" y1="78" x2="20" y2="100" stroke="#3e2723" stroke-width="4"/>
        <line x1="40" y1="78" x2="40" y2="100" stroke="#3e2723" stroke-width="4"/>
        <line x1="55" y1="78" x2="55" y2="100" stroke="#3e2723" stroke-width="4"/>
        <path d="M 60 65 Q 75 75 70 90" stroke="#3e2723" stroke-width="4" fill="none"/>
        <rect x="60" y="60" width="50" height="8" fill="#5d4037" stroke="#000" stroke-width="1.5"/>
        <polygon points="110,55 125,75 100,80" fill="#3e2723" stroke="#000" stroke-width="2"/>
      </g>
    `;
    case 'dampfpflug': return `
      <ellipse cx="75" cy="115" rx="65" ry="8" fill="#000" opacity=".35"/>
      <g transform="translate(15,35)">
        <ellipse cx="35" cy="78" rx="20" ry="20" fill="#212121" stroke="#000" stroke-width="2"/>
        <circle cx="35" cy="78" r="14" fill="#37474f" stroke="#000" stroke-width="1.5"/>
        <ellipse cx="100" cy="78" rx="20" ry="20" fill="#212121" stroke="#000" stroke-width="2"/>
        <circle cx="100" cy="78" r="14" fill="#37474f" stroke="#000" stroke-width="1.5"/>
        <rect x="20" y="40" width="100" height="35" fill="#1565c0" stroke="#000" stroke-width="2.5"/>
        <rect x="55" y="10" width="20" height="35" fill="#37474f" stroke="#000" stroke-width="2"/>
        <rect x="50" y="6" width="30" height="8" fill="#212121" stroke="#000" stroke-width="2"/>
        <g opacity=".8">
          <circle cx="65" cy="-5" r="9" fill="#cfd8dc"/>
          <circle cx="73" cy="-15" r="11" fill="#eceff1"/>
          <circle cx="60" cy="-22" r="13" fill="#fff"/>
        </g>
        <circle cx="40" cy="55" r="6" fill="#fbc02d" stroke="#000" stroke-width="1.5"/>
        <text x="70" y="60" text-anchor="middle" font-size="9" font-weight="900" fill="#fff">DAMPF</text>
      </g>
    `;
    case 'lanzbulldog': return `
      <ellipse cx="75" cy="115" rx="65" ry="8" fill="#000" opacity=".35"/>
      <g transform="translate(15,35)">
        <ellipse cx="35" cy="78" rx="22" ry="22" fill="#212121"/>
        <circle cx="35" cy="78" r="16" fill="#37474f" stroke="#000" stroke-width="1.5"/>
        <circle cx="35" cy="78" r="6" fill="#fbc02d"/>
        <ellipse cx="100" cy="78" rx="22" ry="22" fill="#212121"/>
        <circle cx="100" cy="78" r="16" fill="#37474f" stroke="#000" stroke-width="1.5"/>
        <circle cx="100" cy="78" r="6" fill="#fbc02d"/>
        <rect x="20" y="35" width="100" height="40" rx="6" fill="#1565c0" stroke="#000" stroke-width="3"/>
        <rect x="50" y="20" width="40" height="20" fill="#1565c0" stroke="#000" stroke-width="2"/>
        <text x="70" y="58" text-anchor="middle" font-size="11" font-weight="900" fill="#fff">LANZ</text>
        <rect x="30" y="10" width="6" height="20" fill="#212121"/>
      </g>
    `;
    case 'fendt312':
    case 'jd6r':
    case 'fendt1050':
    default: {
      const grad = typ === 'jd6r' ? 'trkGreen' : (typ === 'fendt1050' ? 'trkGreen' : 'trkGreen');
      return `
        <ellipse cx="75" cy="115" rx="70" ry="9" fill="#000" opacity=".35"/>
        <ellipse cx="35" cy="110" rx="15" ry="7" fill="#1a1a1a"/>
        <ellipse cx="35" cy="105" rx="15" ry="13" fill="#212121" stroke="#000" stroke-width="2"/>
        <ellipse cx="35" cy="105" rx="9" ry="8" fill="#fbc02d" stroke="#000" stroke-width="1.5"/>
        <circle cx="35" cy="105" r="3" fill="#3e2723"/>
        <ellipse cx="115" cy="110" rx="15" ry="7" fill="#1a1a1a"/>
        <ellipse cx="115" cy="105" rx="15" ry="13" fill="#212121" stroke="#000" stroke-width="2"/>
        <ellipse cx="115" cy="105" rx="9" ry="8" fill="#fbc02d" stroke="#000" stroke-width="1.5"/>
        <circle cx="115" cy="105" r="3" fill="#3e2723"/>
        <rect x="10" y="68" width="115" height="35" rx="6" fill="#0d3010" stroke="#000" stroke-width="2.5"/>
        <rect x="10" y="55" width="115" height="20" rx="6" fill="url(#${grad})" stroke="#000" stroke-width="2.5"/>
        <rect x="95" y="50" width="35" height="40" rx="6" fill="url(#${grad})" stroke="#000" stroke-width="2.5"/>
        <rect x="35" y="20" width="55" height="50" rx="8" fill="url(#${grad})" stroke="#000" stroke-width="2.5"/>
        <rect x="40" y="26" width="45" height="25" rx="4" fill="#90caf9" stroke="#000" stroke-width="2"/>
        <rect x="32" y="14" width="61" height="9" rx="3" fill="#212121" stroke="#000" stroke-width="2"/>
        <circle cx="45" cy="13" r="2" fill="#fff59d"/>
        <circle cx="55" cy="13" r="2" fill="#fff59d"/>
        <circle cx="65" cy="13" r="2" fill="#fff59d"/>
        <circle cx="75" cy="13" r="2" fill="#fff59d"/>
        <rect x="28" y="-2" width="9" height="20" fill="#37474f" stroke="#000" stroke-width="1.5"/>
        <text x="113" y="74" text-anchor="middle" font-size="6" font-weight="900" fill="#fff">${typ.toUpperCase()}</text>
      `;
    }
  }
}

function updateTreckerPosition() {
  if (!treckerGrp) return;
  const inner = document.getElementById('treckerInner');
  if (inner) {
    const facingRight = (GS.trecker.rot >= -90 && GS.trecker.rot <= 90);
    inner.setAttribute('transform', `translate(-75,-60)${facingRight ? '' : ' scale(-1,1) translate(-150,0)'}`);
  }
  treckerGrp.setAttribute('transform', `translate(${GS.trecker.x},${GS.trecker.y})`);
}

function drawTiereInto(svg) {
  const schweine = GS.tiere.schwein || 0;
  for (let i = 0; i < schweine; i++) {
    const tx = 1200 + (i%3) * 60;
    const ty = 1100 + Math.floor(i/3) * 50;
    const g = svgEl('g', {transform:`translate(${tx},${ty}) scale(1.3)`});
    g.innerHTML = `
      <ellipse cx="15" cy="26" rx="18" ry="4" fill="#000" opacity=".35"/>
      <ellipse cx="15" cy="17" rx="16" ry="9" fill="#f8bbd0" stroke="#c2185b" stroke-width="1.5"/>
      <circle cx="2" cy="14" r="6" fill="#f8bbd0" stroke="#c2185b" stroke-width="1.5"/>
      <ellipse cx="-3" cy="15" rx="3.5" ry="3" fill="#ec407a"/>
      <circle cx="0" cy="11" r="1" fill="#000"/>
      <path d="M 30 14 Q 35 13 33 17" stroke="#c2185b" stroke-width="1.8" fill="none"/>
    `;
    svg.appendChild(g);
  }
}

// ============================================================
// TOUCH + Welt-Pan + Platzieren
// ============================================================
let dragging = false;
let panning = false;
let lastDragPos = null;
let activePointer = null;
let feldArbeit = {};

function setupTouch(container) {
  container.addEventListener('pointerdown', e => {
    e.preventDefault();
    activePointer = e.pointerId;
    lastDragPos = svgCoordsView(container, e);

    // Platzier-Modus
    if (platzierenItem) {
      const wp = viewToWelt(lastDragPos);
      platzierenPos = {x: wp.x - platzierenItem.w/2, y: wp.y - platzierenItem.h/2};
      updatePlatzGhost();
      // beim Pointer-Up: bestätigen
      return;
    }

    if (werkzeugAktiv === 'pan') {
      panning = true;
      container.classList.add('dragging');
      return;
    }
    const t = e.target.closest('[data-gebaeude]');
    if (t) { panning = false; dragging = false; return; }
    dragging = true;
    container.classList.add('dragging');
  });

  container.addEventListener('pointermove', e => {
    if (e.pointerId !== activePointer) return;
    e.preventDefault();
    const p = svgCoordsView(container, e);

    if (platzierenItem) {
      const wp = viewToWelt(p);
      platzierenPos = {x: wp.x - platzierenItem.w/2, y: wp.y - platzierenItem.h/2};
      updatePlatzGhost();
      lastDragPos = p; return;
    }

    if (panning) {
      const dx = p.x - lastDragPos.x, dy = p.y - lastDragPos.y;
      kameraX -= dx * (W / VIEW_W); kameraY -= dy * (H / VIEW_H);
      kameraX = Math.max(VIEW_W/2, Math.min(W - VIEW_W/2, kameraX));
      kameraY = Math.max(VIEW_H/2, Math.min(H - VIEW_H/2, kameraY));
      updateKamera(); lastDragPos = p; return;
    }
    if (!dragging) return;
    const wp = viewToWelt(p);
    const dx = wp.x - GS.trecker.x, dy = wp.y - GS.trecker.y;
    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) GS.trecker.rot = Math.atan2(dy, dx) * 180 / Math.PI;
    GS.trecker.x = Math.max(50, Math.min(W - 50, wp.x));
    GS.trecker.y = Math.max(50, Math.min(H - 80, wp.y));
    updateTreckerPosition();
    const margin = 200;
    if (GS.trecker.x - kameraX > VIEW_W/2 - margin) kameraX = GS.trecker.x - VIEW_W/2 + margin;
    if (GS.trecker.x - kameraX < -VIEW_W/2 + margin) kameraX = GS.trecker.x + VIEW_W/2 - margin;
    if (GS.trecker.y - kameraY > VIEW_H/2 - margin) kameraY = GS.trecker.y - VIEW_H/2 + margin;
    if (GS.trecker.y - kameraY < -VIEW_H/2 + margin) kameraY = GS.trecker.y + VIEW_H/2 - margin;
    kameraX = Math.max(VIEW_W/2, Math.min(W - VIEW_W/2, kameraX));
    kameraY = Math.max(VIEW_H/2, Math.min(H - VIEW_H/2, kameraY));
    updateKamera();
    checkFeldKollision({x: GS.trecker.x, y: GS.trecker.y});
    lastDragPos = p;
  });

  const stop = e => {
    if (platzierenItem) { commitPlatzieren(); }
    dragging = false; panning = false;
    container.classList.remove('dragging'); activePointer = null; saveState();
  };
  container.addEventListener('pointerup', stop);
  container.addEventListener('pointercancel', stop);
  container.addEventListener('pointerleave', stop);
}

function svgCoordsView(container, e) {
  const r = container.getBoundingClientRect();
  return {x: (e.clientX - r.left) / r.width * VIEW_W, y: (e.clientY - r.top) / r.height * VIEW_H};
}
function viewToWelt(p) {
  return {x: p.x - VIEW_W/2 + kameraX, y: p.y - VIEW_H/2 + kameraY};
}

function checkFeldKollision(pos) {
  for (const fid in FELD_LAYOUT) {
    if (!GS.gekauft.includes(fid)) continue;
    const layout = FELD_LAYOUT[fid];
    const f = GS.felder[fid];
    if (!f) continue;
    const inside = pos.x >= layout.x && pos.x <= layout.x + layout.w && pos.y >= layout.y && pos.y <= layout.y + layout.h;
    if (!inside) { delete feldArbeit[fid]; continue; }
    const now = Date.now();
    if (!feldArbeit[fid]) feldArbeit[fid] = {start: now, lastTime: now};
    const dt = now - feldArbeit[fid].lastTime;
    feldArbeit[fid].lastTime = now;
    const speed = TRAKTOR_TYPEN[GS.treckerAktiv].speed;

    if (werkzeugAktiv === 'pflug' && f.stage === 0) {
      f.fortschritt = (f.fortschritt || 0) + dt * speed / 30;
      if (f.fortschritt >= 100) {
        f.stage = 1; f.fortschritt = 0;
        toast('🚜 Gepflügt! Jetzt antippen zum Säen');
        if (f.bonusReady && !GS.gesehen.brachLern) {
          GS.gesehen.brachLern = true;
          setTimeout(() => zeigeLerntextModal('🌿 Brache lohnt sich!', 'Dieses Feld lag eine Weile brach. Der Boden hatte Zeit, sich zu erholen – die nächste Ernte gibt jetzt +50 % mehr! Im Mittelalter haben das alle Bauern so gemacht: Drei-Felder-Wirtschaft.'), 600);
        }
        saveState();
      }
      rerenderFeld(fid);
    } else if (werkzeugAktiv === 'maehdrescher' && f.stage === 3) {
      f.fortschritt = (f.fortschritt || 0) + dt * speed / 30;
      if (f.fortschritt >= 100) {
        const cfg = CROP_CONFIG[f.type];
        let saecke = cfg.ertragSaecke;
        if (f.bonusVerwendet) saecke = Math.round(saecke * 1.5);
        GS.inventar[f.type] = (GS.inventar[f.type] || 0) + saecke;
        const cropType = f.type;
        f.stage = 0; f.fortschritt = 0; f.plantedAt = null; f.type = null;
        f.brachSeit = Date.now(); f.bonusReady = false; f.bonusVerwendet = false;
        GS.stats.geernet++;
        saveState(); rerenderFelder();
        setTimeout(() => verkaufenMitMathe(cropType, saecke), 300);
      } else rerenderFeld(fid);
    }
  }
}

function rerenderFeld(fid) {
  const old = document.querySelector(`[data-feld="${fid}"]`);
  if (!old) return;
  const layout = FELD_LAYOUT[fid];
  const parent = old.parentNode;
  old.remove();
  drawFeld(parent, fid, layout);
}

// ============================================================
// FREIE PLATZIERUNG
// ============================================================
function startePlatzieren(gid) {
  const meta = GEBAEUDE_DEFAULTS[gid];
  platzierenItem = {gid, w: meta.w, h: meta.h};
  platzierenPos = {x: kameraX - meta.w/2, y: kameraY - meta.h/2};
  updatePlatzGhost();
  updateModus();
}

function updatePlatzGhost() {
  const ghost = document.getElementById('platzGhost');
  if (!ghost || !platzierenItem) return;
  const meta = GEBAEUDE_DEFAULTS[platzierenItem.gid];
  const ok = !platzierenKollision(platzierenPos.x, platzierenPos.y, meta.w, meta.h, platzierenItem.gid);
  ghost.style.display = '';
  ghost.setAttribute('transform', `translate(${platzierenPos.x},${platzierenPos.y})`);
  ghost.innerHTML = `
    <rect x="0" y="0" width="${meta.w}" height="${meta.h}" fill="${ok ? 'rgba(76,175,80,.4)' : 'rgba(239,83,80,.5)'}" stroke="${ok ? '#43a047' : '#c62828'}" stroke-width="6" stroke-dasharray="14 8" rx="10"/>
    <text x="${meta.w/2}" y="${meta.h/2 - 10}" text-anchor="middle" font-size="36">${meta.em}</text>
    <text x="${meta.w/2}" y="${meta.h/2 + 18}" text-anchor="middle" font-size="14" fill="#fff" stroke="#000" stroke-width="3" paint-order="stroke" font-weight="900">${ok ? '✅ TIPPEN ZUM SETZEN' : '❌ Hier kein Platz'}</text>
  `;
}
function platzierenKollision(x, y, w, h, ignoreGid) {
  // Welt-Grenzen
  if (x < 60 || y < 110 || x + w > W - 60 || y + h > H - 60) return true;
  // andere Gebäude
  for (const gid in GEBAEUDE_DEFAULTS) {
    if (gid === ignoreGid) continue;
    if (!GS.gekauft.includes(gid)) continue;
    const b = gebaeudeBox(gid);
    if (x < b.x + b.w && x + w > b.x && y < b.y + b.h && y + h > b.y) return true;
  }
  // Felder (gekaufte)
  for (const fid in FELD_LAYOUT) {
    if (!GS.gekauft.includes(fid)) continue;
    const f = FELD_LAYOUT[fid];
    if (x < f.x + f.w && x + w > f.x && y < f.y + f.h && y + h > f.y) return true;
  }
  return false;
}
function commitPlatzieren() {
  if (!platzierenItem) return;
  const meta = GEBAEUDE_DEFAULTS[platzierenItem.gid];
  if (platzierenKollision(platzierenPos.x, platzierenPos.y, meta.w, meta.h, platzierenItem.gid)) {
    toast('❌ Da passt nichts hin – woanders versuchen', '#ef5350');
    return;
  }
  const item = SHOP_KATALOG.gebaeude.find(i => i.id === platzierenItem.gid);
  if (item && !GS.gekauft.includes(platzierenItem.gid)) {
    if (GS.geld < item.preis) { toast('❌ Zu teuer', '#ef5350'); platzierenItem = null; document.getElementById('platzGhost').style.display='none'; updateModus(); return; }
    GS.geld -= item.preis;
    GS.gekauft.push(platzierenItem.gid);
    GS.stats.kaeufe++;
    if (platzierenItem.gid === 'huehnerstall') GS.tiere.huhn = (GS.tiere.huhn || 0) + 2;
    if (platzierenItem.gid === 'kuhstall')      GS.tiere.kuh  = (GS.tiere.kuh || 0) + 1;
    if (platzierenItem.gid === 'steinstall')    GS.tiere.ochse= (GS.tiere.ochse || 0) + 1;
    if (platzierenItem.gid === 'schafstall')    GS.tiere.schaf= (GS.tiere.schaf || 0) + 2;
  }
  GS.gebaeudePos[platzierenItem.gid] = {x: Math.round(platzierenPos.x), y: Math.round(platzierenPos.y)};
  toast(`🎉 ${meta.name} steht!`, '#43a047');
  platzierenItem = null;
  document.getElementById('platzGhost').style.display = 'none';
  saveState(); updateGeldText(); buildUI();
}

// ============================================================
// VERKAUF mit Mathe
// ============================================================
function verkaufenMitMathe(cropType, saecke) {
  const cfg = CROP_CONFIG[cropType];
  const richtigerPreis = saecke * cfg.preisProSack;
  const opts = new Set([richtigerPreis]);
  while (opts.size < 4) {
    const fake = richtigerPreis + (Math.random() < 0.5 ? -1 : 1) * (5 + Math.floor(Math.random() * 30));
    if (fake > 0 && fake !== richtigerPreis) opts.add(fake);
  }
  const optList = [...opts].sort(() => Math.random() - 0.5);
  showModal(
    el('div', {class:'mathe-aufgabe'},
      el('h2', {}, '🌾 Ernte verkaufen!'),
      el('div', {style:{background:'linear-gradient(135deg,#fff9c4,#ffe082)', padding:'16px', 'border-radius':'14px', 'margin-bottom':'14px'}},
        el('div', {style:{'font-size':'56px'}}, cfg.em),
        el('div', {style:{'font-weight':'900', 'font-size':'18px', 'margin-top':'8px', color:'#3e2723'}}, `${saecke} Säcke ${cfg.name}`)
      ),
      el('div', {class:'visual'}, `${saecke} × ${cfg.preisProSack} €`),
      el('div', {class:'frage'}, 'Wie viel Geld bekommst du?'),
      el('div', {class:'opt'},
        ...optList.map(o => {
          const btn = el('button', {}, formatGeld(o));
          btn.addEventListener('click', () => {
            const correct = o === richtigerPreis;
            btn.classList.add(correct ? 'correct' : 'wrong');
            if (correct) {
              GS.geld += richtigerPreis; GS.inventar[cropType] = Math.max(0, (GS.inventar[cropType] || 0) - saecke);
              GS.stats.mathe_richtig++; saveState();
              setTimeout(() => { closeModal(); updateGeldText(); toast(`✅ +${formatGeld(richtigerPreis)}!`, '#43a047'); }, 800);
            } else {
              const halbe = Math.floor(richtigerPreis / 2);
              GS.geld += halbe; GS.inventar[cropType] = Math.max(0, (GS.inventar[cropType] || 0) - saecke);
              GS.stats.mathe_falsch++; saveState();
              setTimeout(() => { closeModal(); updateGeldText(); toast(`❌ Halb: +${formatGeld(halbe)}`, '#ef5350'); }, 1200);
            }
          });
          return btn;
        })
      )
    )
  );
}

function verkaufenMitMatheCustom(item, menge, preisProEinheit, titel, em) {
  const richtigerPreis = Math.round(menge * preisProEinheit * 100);
  const opts = new Set([richtigerPreis]);
  while (opts.size < 4) {
    const fake = richtigerPreis + (Math.random() < 0.5 ? -1 : 1) * (50 + Math.floor(Math.random() * 200));
    if (fake > 0) opts.add(fake);
  }
  const optList = [...opts].sort(() => Math.random() - 0.5);
  showModal(
    el('div', {class:'mathe-aufgabe'},
      el('h2', {}, titel),
      el('div', {class:'visual', style:{'font-size':'72px'}}, em),
      el('div', {class:'visual'}, `${menge} × ${preisProEinheit*100} ct`),
      el('div', {class:'frage'}, 'Wie viel bekommst du?'),
      el('div', {class:'opt'},
        ...optList.map(o => {
          const btn = el('button', {}, `${o} ct`);
          btn.addEventListener('click', () => {
            const correct = o === richtigerPreis;
            btn.classList.add(correct ? 'correct' : 'wrong');
            if (correct) {
              GS.geld += Math.round(richtigerPreis / 100); GS.inventar[item] = Math.max(0, (GS.inventar[item] || 0) - menge);
              GS.stats.mathe_richtig++; saveState();
              setTimeout(() => { closeModal(); updateGeldText(); toast(`✅ +${Math.round(richtigerPreis/100)}€`, '#43a047'); }, 800);
            } else {
              GS.geld += Math.round(richtigerPreis / 200); GS.inventar[item] = Math.max(0, (GS.inventar[item] || 0) - menge);
              saveState();
              setTimeout(() => { closeModal(); updateGeldText(); toast(`❌ Halb`, '#ef5350'); }, 1200);
            }
          });
          return btn;
        })
      )
    )
  );
}

// ============================================================
// INNEN-ANSICHTEN
// ============================================================
function openInnen(gid) {
  if (gid === 'wohnhaus' || gid === 'fachwerkhaus' || gid === 'langhaus') return openWohnhausInnen(gid);
  if (gid === 'schafstall')   return openSchafstallInnen();
  if (gid === 'huehnerstall') return openHuehnerstallInnen();
  if (gid === 'kuhstall')     return openKuhstallInnen();
  if (gid === 'steinstall')   return openSteinstallInnen();
  if (gid === 'schweinestall')return openSchweinestallInnen();
  if (gid === 'silo' || gid === 'vorratsgrube' || gid === 'scheune') return openLagerInnen(gid);
  if (gid === 'hofladen')     return openHofladenInnen();
  if (gid === 'werkstatt' || gid === 'schmiede') return openTreckerGarage();
  if (gid === 'feuerstelle')  return openFeuerstelleInnen();
  if (gid === 'muehle' || gid === 'windmuehle') return openMuehleInnen(gid);
  if (gid === 'tankstelle')   return openTankstelleInnen();
  if (gid === 'biogas')       return openBiogasInnen();
  return openGenericInnen(gid);
}

function openWohnhausInnen(gid) {
  const card = el('div', {class:'modal-card'});
  card.appendChild(el('button', {class:'close', onclick: closeModal}, '✕'));
  card.appendChild(el('h2', {}, '🏠 Wohnhaus'));
  card.innerHTML += `<svg viewBox="0 0 400 250" style="width:100%;background:linear-gradient(180deg,#fff8e1,#ffe082);border-radius:14px;border:3px solid #5d4037">
    <rect x="0" y="180" width="400" height="70" fill="#a1887f"/>
    <line x1="0" y1="180" x2="400" y2="180" stroke="#5d4037" stroke-width="3"/>
    <g transform="translate(40,140)">
      <rect x="0" y="0" width="120" height="50" fill="#5d4037" stroke="#000" stroke-width="2"/>
      <rect x="0" y="0" width="120" height="20" fill="#3e2723"/>
      <rect x="5" y="20" width="110" height="25" fill="#42a5f5" stroke="#000" stroke-width="1.5"/>
      <rect x="5" y="40" width="110" height="5" fill="#1976d2"/>
      <rect x="80" y="0" width="35" height="20" fill="#fff" stroke="#000" stroke-width="1.5"/>
    </g>
    <g transform="translate(220,150)">
      <rect x="0" y="0" width="100" height="10" fill="#8d6e63" stroke="#000" stroke-width="2"/>
      <rect x="5" y="10" width="6" height="30" fill="#5d4037"/>
      <rect x="89" y="10" width="6" height="30" fill="#5d4037"/>
      <line x1="50" y1="0" x2="50" y2="-30" stroke="#000" stroke-width="1.5"/>
      <polygon points="35,-30 65,-30 60,-50 40,-50" fill="#fbc02d" stroke="#000" stroke-width="1.5"/>
      <circle cx="50" cy="-15" r="8" fill="#fff59d" opacity=".6"/>
    </g>
    <rect x="160" y="40" width="60" height="50" fill="#fff8e1" stroke="#5d4037" stroke-width="3"/>
    <text x="190" y="73" text-anchor="middle" font-size="28">👨‍👩‍👦</text>
    <rect x="280" y="40" width="80" height="60" fill="#90caf9" stroke="#5d4037" stroke-width="3"/>
    <line x1="320" y1="40" x2="320" y2="100" stroke="#5d4037" stroke-width="2"/>
    <line x1="280" y1="70" x2="360" y2="70" stroke="#5d4037" stroke-width="2"/>
  </svg>`;
  card.appendChild(el('div', {style:{display:'grid', 'grid-template-columns':'1fr 1fr', gap:'10px', 'margin-top':'14px'}},
    aktionBtn('💤 Schlafen', '+50 €', () => { GS.geld += 50; updateGeldText(); saveState(); toast('💤 +50 €'); closeModal(); }),
    aktionBtn('🍳 Kochen', 'Eier+Milch → +30 €', () => {
      const e = GS.inventar.eier || 0, m = GS.inventar.milch || 0;
      if (e < 2 || m < 1) { toast('❌ Brauchst 2 Eier + 1 L Milch', '#ef5350'); return; }
      GS.inventar.eier -= 2; GS.inventar.milch -= 1;
      GS.geld += 30; updateGeldText(); saveState();
      toast('🍳 Pfannkuchen! +30 €');
    })
  ));
  showModalRaw(card);
}

function openHuehnerstallInnen() {
  const card = el('div', {class:'modal-card'});
  card.appendChild(el('button', {class:'close', onclick: closeModal}, '✕'));
  card.appendChild(el('h2', {}, '🐔 Hühnerstall'));
  const huehner = GS.tiere.huhn || 0;
  const eier = huehner * 2;
  let huehnerSvg = '';
  for (let i = 0; i < Math.min(huehner, 12); i++) {
    const cx = 30 + (i % 4) * 90, cy = 60 + Math.floor(i / 4) * 70;
    huehnerSvg += `<g transform="translate(${cx},${cy}) scale(2)">
      <ellipse cx="9" cy="14" rx="9" ry="2" fill="#000" opacity=".3"/>
      <ellipse cx="9" cy="9" rx="8" ry="6" fill="#fff" stroke="#000" stroke-width="1.2"/>
      <circle cx="14" cy="5" r="4.5" fill="#fff" stroke="#000" stroke-width="1.2"/>
      <polygon points="17,4 21,5 17,6" fill="#ffa726"/>
      <circle cx="15" cy="4" r="1" fill="#000"/>
    </g>`;
  }
  card.innerHTML += `<svg viewBox="0 0 400 250" style="width:100%;background:#fff8e1;border-radius:14px;border:3px solid #5d4037">
    <rect x="0" y="180" width="400" height="70" fill="#fbc02d"/>
    ${huehnerSvg}
    ${huehner === 0 ? '<text x="200" y="120" text-anchor="middle" font-size="20" fill="#666">Keine Hühner!</text>' : ''}
  </svg>`;
  card.appendChild(el('p', {style:{'text-align':'center', 'margin':'10px 0', 'font-weight':'700'}}, `${huehner} Hühner · ${eier} Eier`));
  card.appendChild(aktionBtn('🥚 Eier sammeln', `${eier} Eier`, () => {
    if (huehner === 0) { toast('Keine Hühner!', '#ef5350'); return; }
    GS.inventar.eier = (GS.inventar.eier || 0) + eier; saveState(); closeModal();
    verkaufenMitMatheCustom('eier', eier, 0.4, '🥚 Eier verkaufen', '🥚');
  }));
  showModalRaw(card);
}

function openKuhstallInnen() {
  const card = el('div', {class:'modal-card'});
  card.appendChild(el('button', {class:'close', onclick: closeModal}, '✕'));
  card.appendChild(el('h2', {}, '🐮 Kuhstall'));
  const kuehe = GS.tiere.kuh || 0, milch = kuehe * 8;
  card.innerHTML += `<svg viewBox="0 0 400 200" style="width:100%;background:#fff8e1;border-radius:14px;border:3px solid #5d4037">
    <rect x="0" y="140" width="400" height="60" fill="#a1887f"/>
    ${kuehe === 0 ? '<text x="200" y="100" text-anchor="middle" font-size="20" fill="#666">Keine Kühe</text>' : ''}
  </svg>`;
  card.appendChild(el('p', {style:{'text-align':'center', 'margin':'10px 0', 'font-weight':'700'}}, `${kuehe} Kühe · ${milch} L`));
  card.appendChild(aktionBtn('🥛 Melken', `${milch} L`, () => {
    if (kuehe === 0) { toast('Keine Kühe!', '#ef5350'); return; }
    GS.inventar.milch = (GS.inventar.milch || 0) + milch; saveState(); closeModal();
    verkaufenMitMatheCustom('milch', milch, 0.5, '🥛 Milch verkaufen', '🥛');
  }));
  showModalRaw(card);
}

function openSteinstallInnen() {
  const card = el('div', {class:'modal-card'});
  card.appendChild(el('button', {class:'close', onclick: closeModal}, '✕'));
  card.appendChild(el('h2', {}, '🐂 Ochsenstall'));
  const ochsen = GS.tiere.ochse || 0;
  card.appendChild(el('p', {style:{'text-align':'center', 'margin':'10px'}}, `${ochsen} Ochsen · Zugtiere für Pflug`));
  card.appendChild(el('p', {style:{'text-align':'center', 'font-size':'13px', color:'#666'}}, 'Ochsen ziehen den Pflug schon seit der Antike. Sie sind langsam aber stark.'));
  showModalRaw(card);
}

function openSchafstallInnen() {
  const card = el('div', {class:'modal-card'});
  card.appendChild(el('button', {class:'close', onclick: closeModal}, '✕'));
  card.appendChild(el('h2', {}, '🐑 Schafstall'));
  const schafe = GS.tiere.schaf || 0;
  const wolle = schafe * 2, milch = schafe * 1;
  card.appendChild(el('p', {style:{'text-align':'center', 'margin':'10px'}}, `${schafe} Schafe · ${wolle} Wolle · ${milch} L Milch`));
  card.appendChild(aktionBtn('🧶 Wolle scheren', `+${wolle*8}€`, () => {
    if (schafe === 0) { toast('Keine Schafe', '#ef5350'); return; }
    GS.geld += wolle * 8; updateGeldText(); saveState(); closeModal(); toast(`🧶 +${wolle*8}€`);
  }));
  card.appendChild(aktionBtn('🥛 Milch sammeln', `+${milch*1}€`, () => {
    if (schafe === 0) return;
    GS.inventar.milch = (GS.inventar.milch || 0) + milch; saveState(); closeModal();
    verkaufenMitMatheCustom('milch', milch, 0.5, '🥛 Schafsmilch verkaufen', '🥛');
  }));
  showModalRaw(card);
}

function openSchweinestallInnen() {
  const card = el('div', {class:'modal-card'});
  card.appendChild(el('button', {class:'close', onclick: closeModal}, '✕'));
  card.appendChild(el('h2', {}, '🐷 Schweinestall'));
  const schweine = GS.tiere.schwein || 0;
  card.appendChild(el('p', {style:{'text-align':'center', 'margin':'10px'}}, `${schweine} Schweine`));
  card.appendChild(aktionBtn('🍖 Verkaufen', '+50 € pro Schwein', () => {
    if (schweine === 0) { toast('Keine!', '#ef5350'); return; }
    const verdient = schweine * 50;
    GS.geld += verdient; GS.tiere.schwein = 0; updateGeldText(); saveState();
    closeModal(); buildUI();
    toast(`🍖 +${verdient}€!`);
  }));
  showModalRaw(card);
}

function openLagerInnen(gid) {
  const card = el('div', {class:'modal-card'});
  card.appendChild(el('button', {class:'close', onclick: closeModal}, '✕'));
  const titel = gid === 'silo' ? '🏗️ Silo' : (gid === 'scheune' ? '🏚️ Scheune' : '🪣 Vorratsgrube');
  card.appendChild(el('h2', {}, titel + ' – Lager'));
  const items = [['weizen','🌾'],['gerste','🌾'],['hafer','🌾'],['roggen','🌾'],['mais','🌽'],['kartoffel','🥔'],['raps','🌻'],['ruebe','🍠'],['soja','🌱'],['eier','🥚'],['milch','🥛']];
  for (const [k, em] of items) {
    const menge = GS.inventar[k] || 0;
    if (menge === 0) continue;
    card.appendChild(el('div', {style:{display:'flex', 'justify-content':'space-between', padding:'10px', background:'#f5f5f5', 'border-radius':'8px', 'margin-bottom':'6px'}},
      el('span', {style:{'font-weight':'700'}}, `${em} ${k}`),
      el('span', {style:{'font-weight':'900', color:'#1b5e20'}}, String(menge))
    ));
  }
  if (Object.values(GS.inventar).every(v => !v)) card.appendChild(el('p', {style:{'text-align':'center', color:'#888'}}, 'Lager leer'));
  showModalRaw(card);
}

function openHofladenInnen() {
  const card = el('div', {class:'modal-card'});
  card.appendChild(el('button', {class:'close', onclick: closeModal}, '✕'));
  card.appendChild(el('h2', {}, '🏪 Hofladen'));
  card.appendChild(el('p', {style:{'text-align':'center', 'margin-bottom':'14px'}}, 'Direktverkauf mit +20 % Bonus'));
  card.appendChild(aktionBtn('💰 Komplett-Verkauf', '+20 % Bonus', () => {
    let total = 0;
    const preise = {weizen:5, gerste:7, hafer:9, roggen:11, mais:8, kartoffel:15, raps:25, ruebe:35, soja:22, eier:0.4, milch:0.5};
    for (const k in preise) {
      const m = GS.inventar[k] || 0;
      total += m * preise[k];
      GS.inventar[k] = 0;
    }
    total = Math.round(total * 1.2);
    GS.geld += total; updateGeldText(); saveState();
    closeModal(); toast(`💰 +${formatGeld(total)}!`);
  }));
  showModalRaw(card);
}

function openFeuerstelleInnen() {
  const card = el('div', {class:'modal-card'});
  card.appendChild(el('button', {class:'close', onclick: closeModal}, '✕'));
  card.appendChild(el('h2', {}, '🔥 Feuerstelle'));
  card.appendChild(el('p', {style:{'text-align':'center'}}, 'Hier hat alles angefangen: Feuer hält warm und gart Essen.'));
  card.appendChild(aktionBtn('🍖 Etwas grillen', 'Verbraucht 5 Hafer → +20 €', () => {
    const h = GS.inventar.hafer || 0;
    if (h < 5) { toast('Brauchst 5 Hafer', '#ef5350'); return; }
    GS.inventar.hafer -= 5; GS.geld += 20; updateGeldText(); saveState(); closeModal(); toast('🍖 +20 €');
  }));
  showModalRaw(card);
}

function openMuehleInnen(gid) {
  const card = el('div', {class:'modal-card'});
  card.appendChild(el('button', {class:'close', onclick: closeModal}, '✕'));
  card.appendChild(el('h2', {}, gid === 'windmuehle' ? '🌀 Windmühle' : '⚙️ Wassermühle'));
  card.appendChild(el('p', {style:{'text-align':'center', 'font-size':'13px', color:'#666', 'margin-bottom':'14px'}}, 'Mahlt Korn zu Mehl. Mehl bringt 3× so viel Geld wie Korn!'));
  const w = GS.inventar.weizen || 0;
  card.appendChild(el('p', {style:{'text-align':'center', 'margin':'10px'}}, `${w} Säcke Weizen vorrätig`));
  card.appendChild(aktionBtn(`Mahlen → ${w*3} € Mehl`, '1 Sack → 3 €', () => {
    if (w === 0) { toast('Kein Weizen!', '#ef5350'); return; }
    const ertrag = w * 3;
    GS.inventar.weizen = 0;
    GS.geld += ertrag; updateGeldText(); saveState(); closeModal(); toast(`🌾→💰 +${ertrag}€`);
  }));
  showModalRaw(card);
}

function openTankstelleInnen() {
  const card = el('div', {class:'modal-card'});
  card.appendChild(el('button', {class:'close', onclick: closeModal}, '✕'));
  card.appendChild(el('h2', {}, '⛽ Tankstelle'));
  card.appendChild(el('p', {style:{'text-align':'center'}}, 'Diesel ist hier 20 % günstiger – kommt im nächsten Update!'));
  showModalRaw(card);
}

function openBiogasInnen() {
  const card = el('div', {class:'modal-card'});
  card.appendChild(el('button', {class:'close', onclick: closeModal}, '✕'));
  card.appendChild(el('h2', {}, '🔋 Biogas'));
  const m = GS.inventar.mais || 0;
  card.appendChild(el('p', {style:{'text-align':'center'}}, `${m} Säcke Mais → Strom`));
  card.appendChild(aktionBtn('Strom verkaufen', '5 €/Sack', () => {
    if (m === 0) { toast('Kein Mais', '#ef5350'); return; }
    const v = m * 5;
    GS.inventar.mais = 0; GS.geld += v; updateGeldText(); saveState(); closeModal(); toast(`⚡ +${v}€`);
  }));
  showModalRaw(card);
}

function openGenericInnen(gid) {
  const card = el('div', {class:'modal-card'});
  card.appendChild(el('button', {class:'close', onclick: closeModal}, '✕'));
  card.appendChild(el('h2', {}, GEBAEUDE_DEFAULTS[gid]?.name || gid));
  card.appendChild(el('p', {style:{'text-align':'center'}}, 'Innen-Aktionen folgen!'));
  showModalRaw(card);
}

// ============================================================
// TRECKER-GARAGE (Werkstatt)
// ============================================================
function openTreckerGarage() {
  const card = el('div', {class:'modal-card'});
  card.appendChild(el('button', {class:'close', onclick: closeModal}, '✕'));
  card.appendChild(el('h2', {}, '🚜 Trecker-Garage'));
  card.appendChild(el('p', {style:{'text-align':'center', 'font-size':'13px', color:'#666', 'margin-bottom':'14px'}}, 'Wähle, mit welchem Trecker du fahren willst!'));
  const grid = el('div', {style:{display:'grid', 'grid-template-columns':'1fr 1fr', gap:'10px'}});
  for (const tid in TRAKTOR_TYPEN) {
    const t = TRAKTOR_TYPEN[tid];
    const owned = GS.treckerOwn.includes(tid);
    const isAktiv = GS.treckerAktiv === tid;
    const lockedEpoche = !epocheUnlocked(t.epoche);
    const cell = el('div', {style:{
      background: isAktiv ? '#dcedc8' : (owned ? '#f5f5f5' : '#eee'),
      border: '3px solid ' + (isAktiv ? '#1b5e20' : 'transparent'),
      'border-radius':'12px', padding:'12px', 'text-align':'center',
      cursor: lockedEpoche ? 'not-allowed' : 'pointer', opacity: lockedEpoche ? '.4' : '1'
    }},
      el('div', {style:{'font-size':'40px'}}, t.em),
      el('div', {style:{'font-weight':'900', 'font-size':'14px'}}, t.name),
      el('div', {style:{'font-size':'11px', color:'#666', 'margin-top':'2px'}}, `Tempo ×${t.speed}`),
      lockedEpoche
        ? el('div', {style:{'font-size':'11px', 'margin-top':'4px'}}, '🔒 ' + EPOCHEN.find(e=>e.id===t.epoche).name)
        : (owned
          ? (isAktiv ? el('div', {style:{color:'#1b5e20', 'font-weight':'900', 'margin-top':'6px'}}, '✓ AKTIV') : el('div', {style:{color:'#1b5e20', 'margin-top':'6px'}}, 'Tippen zum Wählen'))
          : el('div', {style:{'margin-top':'6px', color:'#d84315', 'font-weight':'900'}}, 'Kosten: ' + formatGeld(t.preis)))
    );
    if (!lockedEpoche) {
      cell.addEventListener('click', () => {
        if (owned) { GS.treckerAktiv = tid; saveState(); closeModal(); buildUI(); toast(`🚜 ${t.name}`); return; }
        if (GS.geld < t.preis) { toast(`❌ Brauchst ${formatGeld(t.preis)}`, '#ef5350'); return; }
        GS.geld -= t.preis;
        GS.treckerOwn.push(tid);
        GS.treckerAktiv = tid;
        saveState(); closeModal(); buildUI();
        toast(`🎉 ${t.name} gekauft!`);
      });
    }
    grid.appendChild(cell);
  }
  card.appendChild(grid);
  showModalRaw(card);
}

function aktionBtn(label, sublabel, onclick) {
  const btn = el('button', {style:{display:'block', width:'100%', padding:'16px', background:'linear-gradient(180deg,#43a047,#2e7d32)', color:'#fff', border:'none', 'border-radius':'14px', 'font-weight':'900', 'font-size':'17px', cursor:'pointer', 'margin-bottom':'8px', 'box-shadow':'0 4px 0 #1b5e20'}});
  btn.appendChild(el('div', {}, label));
  if (sublabel) btn.appendChild(el('div', {style:{'font-size':'12px', opacity:'.85', 'margin-top':'4px', 'font-weight':'400'}}, sublabel));
  btn.addEventListener('click', onclick);
  return btn;
}

// ============================================================
// SHOP
// ============================================================
let shopTabAktiv = 'gebaeude';
function openShop() {
  const card = el('div', {class:'modal-card'});
  card.appendChild(el('button', {class:'close', onclick: closeModal}, '✕'));
  card.appendChild(el('h2', {}, '🛒 Bauen & Kaufen'));
  card.appendChild(el('div', {style:{'text-align':'center', 'font-size':'12px', color:'#888', 'margin-bottom':'10px'}}, 'Aktuelle Epoche: ' + aktuelleEpoche().em + ' ' + aktuelleEpoche().name));

  const tabs = el('div', {class:'shop-tabs'});
  for (const tab of ['gebaeude','felder','maschinen','tiere']) {
    const btn = el('button', {class:'shop-tab' + (shopTabAktiv === tab ? ' aktiv' : '')},
      tab === 'gebaeude' ? '🏚️ Häuser' : tab === 'felder' ? '🌱 Land' : tab === 'maschinen' ? '🚜 Trecker' : '🐮 Tiere');
    btn.addEventListener('click', () => { shopTabAktiv = tab; closeModal(); openShop(); });
    tabs.appendChild(btn);
  }
  card.appendChild(tabs);

  const grid = el('div', {class:'shop-grid'});
  for (const item of SHOP_KATALOG[shopTabAktiv]) {
    let meta;
    if (shopTabAktiv === 'gebaeude') meta = GEBAEUDE_DEFAULTS[item.id];
    else if (shopTabAktiv === 'felder') meta = {name:'Land', em:'🟫', epoche:'steinzeit'};
    else if (shopTabAktiv === 'maschinen') meta = {name:item.name, em:item.em, epoche:item.epoche};
    else meta = {name:item.name, em:item.em, epoche:'steinzeit'};

    const owned = (shopTabAktiv === 'maschinen') ? GS.treckerOwn.includes(item.traktorId) : GS.gekauft.includes(item.id);
    const ownedCount = item.wiederholbar ? (GS.tiere[item.id] || 0) : 0;
    const epochenLock = meta.epoche && !epocheUnlocked(meta.epoche);
    const required = item.requires && !GS.gekauft.includes(item.requires);
    const tooExpensive = !epochenLock && !required && GS.geld < item.preis;
    const cls = item.wiederholbar ? '' : (owned ? 'gekauft' : ((epochenLock || required) ? 'locked' : (tooExpensive ? 'zuteuer' : '')));

    const cell = el('div', {class:'shop-item ' + cls},
      el('span', {class:'em'}, meta.em),
      el('div', {class:'name'}, (meta.name || item.name) + (item.wiederholbar ? ` (${ownedCount}/${item.max||999})` : '')),
      el('div', {class:'desc'}, item.desc || ''),
      el('div', {class:'preis'}, formatGeld(item.preis))
    );
    if (epochenLock) cell.appendChild(el('div', {style:{'font-size':'10px', color:'#888', 'margin-top':'4px'}}, '🔒 erst ' + EPOCHEN.find(e=>e.id===meta.epoche).name));

    if (!owned && !epochenLock && !required) {
      cell.addEventListener('click', () => {
        if (item.wiederholbar) {
          if (item.requires && !GS.gekauft.includes(item.requires)) { toast('🔒 erst Stall', '#ff7043'); return; }
          if (ownedCount >= (item.max || 999)) { toast('Max', '#ff7043'); return; }
          if (GS.geld < item.preis) { toast('Zu teuer', '#ef5350'); return; }
          GS.tiere[item.id] = (GS.tiere[item.id] || 0) + 1;
          GS.geld -= item.preis; GS.stats.kaeufe++;
          saveState(); closeModal(); buildUI();
          toast(`🎉 ${item.name}!`);
        } else if (shopTabAktiv === 'gebaeude') {
          if (GS.geld < item.preis) { toast(`❌ Brauchst ${formatGeld(item.preis - GS.geld)}`, '#ef5350'); return; }
          closeModal();
          startePlatzieren(item.id);
          toast('📍 Wähle, wo es stehen soll!');
        } else if (shopTabAktiv === 'felder') {
          kaufenFeld(item.id);
        } else if (shopTabAktiv === 'maschinen') {
          if (GS.geld < item.preis) { toast(`❌ Brauchst ${formatGeld(item.preis - GS.geld)}`, '#ef5350'); return; }
          GS.geld -= item.preis;
          GS.treckerOwn.push(item.traktorId);
          GS.treckerAktiv = item.traktorId;
          GS.stats.kaeufe++;
          saveState(); closeModal(); buildUI();
          toast(`🎉 ${item.name}!`);
        }
      });
    }
    grid.appendChild(cell);
  }
  card.appendChild(grid);
  showModalRaw(card);
}

function kaufenGebaeude(gid) {
  const item = SHOP_KATALOG.gebaeude.find(i => i.id === gid);
  if (!item) return;
  const meta = GEBAEUDE_DEFAULTS[gid];
  if (!epocheUnlocked(meta.epoche)) { toast('🔒 erst ' + EPOCHEN.find(e=>e.id===meta.epoche).name, '#ff7043'); return; }
  if (GS.geld < item.preis) { toast(`❌ Brauchst ${formatGeld(item.preis - GS.geld)}`, '#ef5350'); return; }
  startePlatzieren(gid);
  toast('📍 Wähle einen Platz!');
}

function kaufenFeld(fid) {
  const item = SHOP_KATALOG.felder.find(i => i.id === fid);
  if (!item) return;
  if (GS.geld < item.preis) { toast(`❌ Brauchst ${formatGeld(item.preis - GS.geld)}`, '#ef5350'); return; }
  GS.geld -= item.preis;
  GS.gekauft.push(fid);
  GS.felder[fid] = {stage:0, type:null, plantedAt:null, fortschritt:0, brachSeit:Date.now() - BRACH_BONUS_MS};
  GS.stats.kaeufe++;
  saveState(); closeModal(); buildUI();
  toast('🎉 Land gekauft!');
}

// ============================================================
// EPOCHEN-Modal (Aufstieg + Lerntext)
// ============================================================
function openEpocheModal() {
  const idx = epocheIdx(GS.epoche);
  const card = el('div', {class:'modal-card'});
  card.appendChild(el('button', {class:'close', onclick: closeModal}, '✕'));
  const ep = EPOCHEN[idx];
  card.appendChild(el('h2', {}, ep.em + ' ' + ep.name));
  card.appendChild(el('div', {style:{background:'#fff8e1', padding:'14px', 'border-radius':'12px', 'margin-bottom':'14px', 'font-size':'14px', 'line-height':'1.5'}}, ep.lerntext));
  card.appendChild(el('h3', {style:{'margin-bottom':'10px', 'font-size':'16px'}}, '📜 Alle Epochen'));
  for (let i = 0; i < EPOCHEN.length; i++) {
    const e = EPOCHEN[i];
    const aktuell = i === idx;
    const erreicht = i <= idx;
    const naechste = i === idx + 1;
    const row = el('div', {style:{display:'flex', 'justify-content':'space-between', 'align-items':'center', padding:'12px', background: aktuell ? '#dcedc8' : (erreicht ? '#f5f5f5' : '#eee'), 'border-radius':'10px', 'margin-bottom':'6px', opacity: erreicht ? '1' : '.6'}},
      el('div', {},
        el('div', {style:{'font-weight':'900'}}, e.em + ' ' + e.name),
        el('div', {style:{'font-size':'11px', color:'#666'}}, erreicht ? '✓ erreicht' : `Aufstieg: ${formatGeld(e.kosten)}`)
      ),
      naechste ? (function() {
        const b = el('button', {style:{padding:'10px 16px', background:'#7e57c2', color:'#fff', border:'none', 'border-radius':'10px', 'font-weight':'900', cursor:'pointer'}}, '🚀 Aufsteigen');
        b.addEventListener('click', () => {
          if (GS.geld < e.kosten) { toast(`❌ Brauchst ${formatGeld(e.kosten - GS.geld)}`, '#ef5350'); return; }
          GS.geld -= e.kosten;
          GS.epoche = e.id;
          saveState(); closeModal(); buildUI();
          zeigeLerntextModal(`🎉 ${e.em} ${e.name} erreicht!`, e.lerntext);
        });
        return b;
      })() : null
    );
    card.appendChild(row);
  }
  showModalRaw(card);
}

function zeigeLerntextModal(titel, text) {
  const card = el('div', {class:'modal-card'});
  card.appendChild(el('button', {class:'close', onclick: closeModal}, '✕'));
  card.appendChild(el('h2', {}, titel));
  card.appendChild(el('div', {style:{background:'#fff8e1', padding:'18px', 'border-radius':'14px', 'font-size':'15px', 'line-height':'1.6', 'margin':'10px 0'}}, text));
  const ok = el('button', {style:{display:'block', width:'100%', padding:'16px', background:'#1b5e20', color:'#fff', border:'none', 'border-radius':'14px', 'font-weight':'900', 'font-size':'17px', cursor:'pointer'}}, '👍 Verstanden!');
  ok.addEventListener('click', closeModal);
  card.appendChild(ok);
  showModalRaw(card);
}

// ============================================================
// Modal-Helper
// ============================================================
function showModal(content) {
  const m = el('div', {class:'modal'});
  const card = el('div', {class:'modal-card'});
  card.appendChild(el('button', {class:'close', onclick: closeModal}, '✕'));
  card.appendChild(content);
  m.appendChild(card);
  m.id = 'modal';
  document.body.appendChild(m);
}
function showModalRaw(card) {
  const m = el('div', {class:'modal'});
  m.appendChild(card);
  m.id = 'modal';
  m.addEventListener('click', e => { if (e.target === m) closeModal(); });
  document.body.appendChild(m);
}
function closeModal() { const m = document.getElementById('modal'); if (m) m.remove(); }

function zurueckZurApp() {
  if (window.parent && window.parent !== window) window.parent.postMessage({type:'hof-close'}, '*');
  else window.location.href = 'liam.html';
}

function showHilfe() {
  const tip = el('div', {class:'tooltip', style:{top:'50%', left:'50%', transform:'translate(-50%,-50%)', 'max-width':'90%'}},
    el('div', {style:{'font-size':'26px', 'margin-bottom':'10px'}}, '👋 Willkommen in der Steinzeit!'),
    el('div', {style:{'margin-bottom':'8px'}}, 'Vor 10 000 Jahren! Du startest mit Hütte, Hacke und einem kleinen Feld.'),
    el('div', {style:{'margin-bottom':'8px'}}, '• ⛏️ Hacke übers Feld ziehen → pflügen'),
    el('div', {style:{'margin-bottom':'8px'}}, '• Feld antippen → Pflanze wählen'),
    el('div', {style:{'margin-bottom':'8px'}}, '• 🌾 ernten, verkaufen, neue Sachen kaufen'),
    el('div', {style:{'margin-bottom':'8px'}}, '• ✋ Karte verschieben • 🛒 Bauen • 🪨 Epoche-Knopf für Aufstieg'),
    (function(){const b=el('button',{style:{'margin-top':'14px', padding:'14px 28px', background:'#1b5e20', color:'#fff', border:'none', 'border-radius':'14px', 'font-weight':'900', 'font-size':'16px', cursor:'pointer'}},'Los gehts!');b.addEventListener('click',()=>tip.remove());return b;})()
  );
  document.body.appendChild(tip);
}

function cheatBtn(label, fn) { const b = el('button', {}, label); b.addEventListener('click', fn); return b; }

// ============================================================
// Tick (Wachstum)
// ============================================================
setInterval(() => {
  let changed = false;
  for (const fid in GS.felder) {
    const f = GS.felder[fid];
    if (f.stage === 2 && f.plantedAt && f.type) {
      const cfg = CROP_CONFIG[f.type];
      if (Date.now() - f.plantedAt >= cfg.wachstumMs * ZEIT_FAKTOR) { f.stage = 3; changed = true; }
    }
    if (f.stage === 0 && !f.bonusReady && f.brachSeit && Date.now() - f.brachSeit >= BRACH_BONUS_MS) {
      f.bonusReady = true; changed = true;
    }
  }
  if (changed) { saveState(); rerenderFelder(); }
  else {
    for (const fid in GS.felder) {
      const f = GS.felder[fid];
      if (f.stage === 2 && f.plantedAt) rerenderFeld(fid);
    }
  }
}, TEST_MODE ? 1000 : 5000);

loadState();
buildUI();
