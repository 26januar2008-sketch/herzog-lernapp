// ============================================================
// LIAMS BAUERNHOF v2 - Trecker-fährt-über-Feld + bessere Grafik
// ============================================================

const SUPABASE_URL = 'https://nrmqdhcrshyoigesqapm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ybXFkaGNyc2h5b2lnZXNxYXBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MTQ3MjksImV4cCI6MjA4ODk5MDcyOX0.Hw4hg6f9iiJcw92veiEU4-oPGcRX_k5NoLuxHU5_ors';
const TEST_MODE = new URLSearchParams(location.search).has('test');
const SAVE_KEY = TEST_MODE ? 'liam_hof_test' : 'liam_hof_v3';
const ZEIT_FAKTOR = TEST_MODE ? 0.1 : 1;

// === Welt-Koordinaten (festes Layout, viewBox-Pixel) ===
const W = 1200, H = 800;

// === Felder mit fester Position auf der Karte ===
const FELD_LAYOUT = {
  feld_weizen:    {x:60,  y:520, w:240, h:120, type:'weizen'},
  feld_mais:      {x:330, y:520, w:240, h:120, type:'mais'},
  feld_kartoffel: {x:600, y:520, w:240, h:120, type:'kartoffel'},
  feld_raps:      {x:870, y:520, w:240, h:120, type:'raps'},
  feld_ruebe:     {x:60,  y:660, w:240, h:120, type:'ruebe'},
  feld_wiese:     {x:330, y:660, w:240, h:120, type:'wiese'}
};

const GEBAEUDE_LAYOUT = {
  wohnhaus:    {x:60,  y:200, w:200, h:240, name:'Wohnhaus'},
  huehnerstall:{x:300, y:280, w:160, h:160, name:'Hühnerstall'},
  kuhstall:    {x:500, y:200, w:240, h:240, name:'Kuhstall'},
  silo:        {x:780, y:160, w:80,  h:280, name:'Silo'},
  schweinestall:{x:880, y:280, w:160, h:160, name:'Schweinestall'},
  scheune:     {x:1060,y:200, w:140, h:240, name:'Scheune'},
  hofladen:    {x:880, y:120, w:160, h:140, name:'Hofladen'},
  werkstatt:   {x:300, y:120, w:160, h:140, name:'Werkstatt'},
  tankstelle:  {x:60,  y:60,  w:160, h:120, name:'Tankstelle'},
  biogas:      {x:1060,y:80,  w:140, h:120, name:'Biogas'}
};

// === Shop-Katalog ===
const SHOP_KATALOG = {
  gebaeude: [
    {id:'huehnerstall', name:'Hühnerstall', em:'🐔', desc:'+2 Hühner, Eier sammeln', preis:200},
    {id:'kuhstall', name:'Kuhstall', em:'🐮', desc:'+1 Kuh, Milch melken', preis:800, requires:'huehnerstall'},
    {id:'schweinestall', name:'Schweinestall', em:'🐷', desc:'Mastvieh', preis:1500, requires:'kuhstall'},
    {id:'silo', name:'Silo', em:'🏗️', desc:'Mehr Lagerplatz', preis:2500, requires:'kuhstall'},
    {id:'hofladen', name:'Hofladen', em:'🏪', desc:'Bessere Preise', preis:3500, requires:'silo'},
    {id:'werkstatt', name:'Werkstatt', em:'🔧', desc:'Maschinen tunen', preis:5000, requires:'hofladen'},
    {id:'tankstelle', name:'Tankstelle', em:'⛽', desc:'Diesel günstiger', preis:7000, requires:'werkstatt'},
    {id:'scheune', name:'Scheune', em:'🏚️', desc:'Riesiges Lager', preis:10000, requires:'tankstelle'},
    {id:'biogas', name:'Biogasanlage', em:'🔋', desc:'Mais → Strom → Geld', preis:25000, requires:'scheune'}
  ],
  felder: [
    {id:'feld_mais', name:'2. Maisfeld', em:'🌽', desc:'Mais', preis:300},
    {id:'feld_kartoffel', name:'3. Kartoffelfeld', em:'🥔', desc:'Höherer Preis', preis:600, requires:'feld_mais'},
    {id:'feld_raps', name:'4. Rapsfeld', em:'🌻', desc:'Bienen!', preis:1200, requires:'feld_kartoffel'},
    {id:'feld_ruebe', name:'5. Rübenfeld', em:'🍠', desc:'Top-Preis', preis:2000, requires:'feld_raps'},
    {id:'feld_wiese', name:'6. Wiese (Heu)', em:'🍃', desc:'Tierfutter', preis:1500, requires:'feld_raps'}
  ],
  maschinen: [
    {id:'pflug', name:'Pflug', em:'⛏️', desc:'Felder pflügen', preis:400},
    {id:'saemaschine', name:'Sämaschine', em:'🌱', desc:'Auto-Säen', preis:600, requires:'pflug'},
    {id:'duengerstreuer', name:'Düngerstreuer', em:'💨', desc:'+50% Ertrag', preis:1000, requires:'saemaschine'},
    {id:'jd6r', name:'John Deere 6R', em:'🚜', desc:'250 PS · stärker', preis:5000, requires:'duengerstreuer'},
    {id:'lexion', name:'Lexion Mähdrescher', em:'🌾', desc:'Schnell ernten', preis:15000, requires:'jd6r'},
    {id:'kronebigx', name:'Krone Big X', em:'🌽', desc:'Mais häckseln', preis:20000, requires:'lexion'},
    {id:'fendt1050', name:'Fendt 1050 Vario', em:'🚜', desc:'517 PS · TOP', preis:35000, requires:'kronebigx'}
  ],
  tiere: [
    {id:'huhn', name:'+ 1 Huhn', em:'🐔', desc:'5 Eier/Tag', preis:50, requires:'huehnerstall', wiederholbar:true, max:8},
    {id:'kuh', name:'+ 1 Kuh', em:'🐮', desc:'8 L Milch/Tag', preis:500, requires:'kuhstall', wiederholbar:true, max:6},
    {id:'schwein', name:'+ 1 Schwein', em:'🐷', desc:'Mastvieh', preis:300, requires:'schweinestall', wiederholbar:true, max:6},
    {id:'pferd', name:'Pferd', em:'🐴', desc:'Begleiter', preis:2500, requires:'kuhstall'},
    {id:'hund', name:'Hofhund', em:'🐶', desc:'Begleiter', preis:800, requires:'huehnerstall'}
  ]
};

const CROP_CONFIG = {
  weizen: {em:'🌾', name:'Weizen', wachstumMs:60000, ertragSaecke:8, preisProSack:5, saatkosten:5, color:'#fdd835'},
  mais:   {em:'🌽', name:'Mais',   wachstumMs:90000, ertragSaecke:12, preisProSack:8, saatkosten:8, color:'#fbc02d'},
  kartoffel:{em:'🥔', name:'Kartoffel', wachstumMs:120000, ertragSaecke:10, preisProSack:15, saatkosten:12, color:'#7cb342'},
  raps:   {em:'🌻', name:'Raps', wachstumMs:150000, ertragSaecke:6, preisProSack:25, saatkosten:15, color:'#fdd835'},
  ruebe:  {em:'🍠', name:'Rübe', wachstumMs:180000, ertragSaecke:8, preisProSack:35, saatkosten:20, color:'#9c27b0'},
  wiese:  {em:'🍃', name:'Heu', wachstumMs:90000, ertragSaecke:5, preisProSack:10, saatkosten:0, color:'#aed581'}
};

// === Game-State ===
let GS = null;
let werkzeugAktiv = 'pflug'; // 'pflug', 'saemaschine', 'maehdrescher', 'haecksler'

const DEFAULT_STATE = {
  geld: TEST_MODE ? 10000 : 50,
  gekauft: ['wohnhaus','feld_weizen','fendt312'],
  felder: { feld_weizen: {stage:0, plantedAt:null, fortschritt:0} }, // fortschritt = 0-100% bei Pflügen/Ernten durch Trecker
  tiere: {},
  trecker: {x:600, y:430, rot:0},
  inventar: {},
  stats: {geernet:0, kaeufe:0, mathe_richtig:0, mathe_falsch:0}
};

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    GS = raw ? Object.assign({}, structuredClone(DEFAULT_STATE), JSON.parse(raw)) : structuredClone(DEFAULT_STATE);
  } catch { GS = structuredClone(DEFAULT_STATE); }
  if (!GS.felder) GS.felder = {feld_weizen: {stage:0, plantedAt:null, fortschritt:0}};
  if (!GS.tiere) GS.tiere = {};
  if (!GS.inventar) GS.inventar = {};
  if (!GS.stats) GS.stats = {geernet:0, kaeufe:0, mathe_richtig:0, mathe_falsch:0};
  if (!GS.trecker) GS.trecker = {x:600, y:430, rot:0};
  for (const fid in GS.felder) {
    if (GS.felder[fid].fortschritt == null) GS.felder[fid].fortschritt = 0;
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
      body: JSON.stringify({char_outfits: {hof_v3: GS}})
    });
  } catch (e) {}
}

// === Utilities ===
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
function formatGeld(g) { return g.toLocaleString('de-DE') + ' €'; }

// === Render Hauptframe ===
let svgEle = null;
let treckerGrp = null;

function buildUI() {
  clear();
  // Topbar
  root.appendChild(el('div', {class:'topbar'},
    el('button', {class:'back', onclick: zurueckZurApp}, '⬅️'),
    el('div', {id:'geldAnzeige', class:'geld'},
      el('div', {class:'coin'}, '€'),
      el('span', {id:'geldText'}, formatGeld(GS.geld))
    ),
    el('button', {class:'shop-btn', onclick: openShop}, '🛒 BAUEN')
  ));

  // Test-Cheats
  if (TEST_MODE) {
    const cheats = el('div', {class:'cheats'},
      el('span', {style:'padding:6px 10px'}, '🧪 TEST'),
      cheatBtn('+1.000 €', () => { GS.geld += 1000; updateGeldText(); saveState(); }),
      cheatBtn('+10.000 €', () => { GS.geld += 10000; updateGeldText(); saveState(); }),
      cheatBtn('🌾 Reif', () => {
        for (const fid in GS.felder) GS.felder[fid].stage = 3;
        saveState(); rerenderFelder();
      }),
      cheatBtn('🛒 Alles', () => {
        [...SHOP_KATALOG.gebaeude, ...SHOP_KATALOG.felder, ...SHOP_KATALOG.maschinen]
          .filter(i => !i.wiederholbar).forEach(i => { if (!GS.gekauft.includes(i.id)) GS.gekauft.push(i.id); });
        GS.tiere.huhn = 8; GS.tiere.kuh = 6;
        for (const fid in FELD_LAYOUT) if (!GS.felder[fid]) GS.felder[fid] = {stage:0, plantedAt:null, fortschritt:0};
        saveState(); buildUI();
      }),
      cheatBtn('🔄 Reset', () => {
        if (confirm('Test zurücksetzen?')) {
          localStorage.removeItem(SAVE_KEY);
          GS = structuredClone(DEFAULT_STATE);
          saveState(); buildUI();
        }
      })
    );
    root.appendChild(cheats);
  }

  // Spielfläche
  const sp = el('div', {class:'spielflaeche', id:'spielflaeche'});
  root.appendChild(sp);

  // Modus-Indikator
  const modus = el('div', {class:'modus-indikator', id:'modusIndikator'}, '⛏️ PFLÜGEN');
  sp.appendChild(modus);

  // Werkzeug-Leiste unten
  const wz = el('div', {class:'werkzeug-leiste', id:'wzLeiste'});
  const wzList = [
    {id:'pflug', em:'⛏️', label:'Pflügen'},
    {id:'saemaschine', em:'🌱', label:'Säen'},
    {id:'maehdrescher', em:'🌾', label:'Ernten'}
  ];
  wzList.forEach(w => {
    const b = el('div', {class:'wz' + (werkzeugAktiv === w.id ? ' aktiv' : ''), title: w.label}, w.em);
    b.dataset.id = w.id;
    b.addEventListener('click', () => {
      werkzeugAktiv = w.id;
      document.querySelectorAll('.wz').forEach(x => x.classList.remove('aktiv'));
      b.classList.add('aktiv');
      updateModus();
    });
    wz.appendChild(b);
  });
  sp.appendChild(wz);

  // SVG bauen
  buildSVG(sp);
  updateModus();
  setupTreckerDrag(sp);

  // Hilfe beim ersten Mal
  if (!localStorage.getItem('liam_hof_seen_v3') && Object.keys(GS.felder).length === 1) {
    showHilfe();
  }
}

function updateGeldText() {
  const t = document.getElementById('geldText');
  if (t) t.textContent = formatGeld(GS.geld);
}
function updateModus() {
  const m = document.getElementById('modusIndikator');
  if (!m) return;
  const labels = {pflug:'⛏️ PFLÜGEN', saemaschine:'🌱 SÄEN', maehdrescher:'🌾 ERNTEN'};
  m.textContent = labels[werkzeugAktiv] + ' (zieh Trecker übers Feld)';
}

function buildSVG(container) {
  const svg = svgEl('svg', {viewBox:`0 0 ${W} ${H}`, preserveAspectRatio:'xMidYMid slice'});

  // === DEFS für Patterns + Gradients ===
  const defs = svgEl('defs');
  defs.innerHTML = `
    <linearGradient id="himmel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#7ec8e3"/>
      <stop offset="60%" stop-color="#a5d6a7"/>
      <stop offset="100%" stop-color="#7cb342"/>
    </linearGradient>
    <pattern id="acker" x="0" y="0" width="14" height="8" patternUnits="userSpaceOnUse">
      <rect width="14" height="8" fill="#5d4037"/>
      <ellipse cx="7" cy="4" rx="6" ry="2" fill="#6d4c41"/>
      <line x1="0" y1="4" x2="14" y2="4" stroke="#3e2723" stroke-width="0.5"/>
    </pattern>
    <pattern id="ziegelRot" x="0" y="0" width="14" height="10" patternUnits="userSpaceOnUse">
      <rect width="14" height="10" fill="#c62828"/>
      <path d="M 0 5 Q 3.5 0 7 5 Q 10.5 10 14 5" fill="#d84315"/>
    </pattern>
    <pattern id="holzWand" x="0" y="0" width="20" height="6" patternUnits="userSpaceOnUse">
      <rect width="20" height="6" fill="#a1887f"/>
      <line x1="0" y1="3" x2="20" y2="3" stroke="#5d4037" stroke-width="0.6"/>
    </pattern>
    <pattern id="steinSockel" x="0" y="0" width="16" height="14" patternUnits="userSpaceOnUse">
      <rect width="16" height="14" fill="#bcaaa4"/>
      <ellipse cx="4" cy="4" rx="3" ry="2" fill="#a1887f"/>
      <ellipse cx="12" cy="9" rx="3" ry="2" fill="#a1887f"/>
    </pattern>
    <linearGradient id="trkGreen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#43a047"/>
      <stop offset="100%" stop-color="#1b5e20"/>
    </linearGradient>
    <radialGradient id="schatten">
      <stop offset="0%" stop-color="#000" stop-opacity=".4"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
  `;
  svg.appendChild(defs);

  // === Hintergrund ===
  svg.appendChild(svgEl('rect', {x:'0', y:'0', width:String(W), height:String(H), fill:'url(#himmel)'}));

  // Berge
  const berge = svgEl('g', {opacity:'.4'});
  berge.appendChild(svgEl('polygon', {points:`0,200 150,80 300,200`, fill:'#7986cb'}));
  berge.appendChild(svgEl('polygon', {points:`200,200 360,60 520,200`, fill:'#9fa8da'}));
  berge.appendChild(svgEl('polygon', {points:`450,200 600,90 750,200`, fill:'#7986cb'}));
  berge.appendChild(svgEl('polygon', {points:`700,200 880,70 1050,200`, fill:'#9fa8da'}));
  berge.appendChild(svgEl('polygon', {points:`1000,200 1150,100 1200,200`, fill:'#7986cb'}));
  svg.appendChild(berge);

  // Sonne mit Gesicht
  const sonne = svgEl('g', {transform:'translate(1080,90)'});
  sonne.innerHTML = `
    <g opacity=".6">
      <line x1="0" y1="-40" x2="0" y2="-50" stroke="#fff176" stroke-width="3"/>
      <line x1="40" y1="0" x2="50" y2="0" stroke="#fff176" stroke-width="3"/>
      <line x1="-40" y1="0" x2="-50" y2="0" stroke="#fff176" stroke-width="3"/>
      <line x1="28" y1="-28" x2="35" y2="-35" stroke="#fff176" stroke-width="3"/>
      <line x1="-28" y1="-28" x2="-35" y2="-35" stroke="#fff176" stroke-width="3"/>
    </g>
    <circle r="34" fill="#fff176"/>
    <circle r="28" fill="#ffeb3b"/>
    <circle cx="-7" cy="-4" r="4" fill="#222"/>
    <circle cx="9" cy="-4" r="4" fill="#222"/>
    <path d="M -9 8 Q 0 16 9 8" stroke="#222" stroke-width="2.5" fill="none"/>
  `;
  svg.appendChild(sonne);

  // Wolken
  const wolken = svgEl('g', {fill:'#fff', opacity:'.95'});
  wolken.innerHTML = `
    <ellipse cx="220" cy="70" rx="40" ry="14"/>
    <ellipse cx="245" cy="62" rx="28" ry="14"/>
    <ellipse cx="195" cy="66" rx="22" ry="12"/>
    <ellipse cx="600" cy="100" rx="32" ry="12"/>
    <ellipse cx="625" cy="92" rx="22" ry="13"/>
  `;
  svg.appendChild(wolken);

  // Bäume
  for (const tx of [40, 1140]) {
    const b = svgEl('g', {transform:`translate(${tx},${tx > 600 ? 380 : 350})`});
    b.innerHTML = `
      <ellipse cx="0" cy="60" rx="22" ry="6" fill="#000" opacity=".3"/>
      <rect x="-4" y="35" width="8" height="25" fill="#5d4037"/>
      <circle cx="0" cy="20" r="22" fill="#2e7d32"/>
      <circle cx="-12" cy="25" r="14" fill="#388e3c"/>
      <circle cx="12" cy="25" r="14" fill="#388e3c"/>
      <circle cx="-5" cy="22" r="3" fill="#e53935"/>
      <circle cx="6" cy="18" r="3" fill="#e53935"/>
    `;
    svg.appendChild(b);
  }

  // === Felder zeichnen ===
  const felderG = svgEl('g', {id:'felderG'});
  svg.appendChild(felderG);
  rerenderFelderInto(felderG);

  // === Gebäude ===
  // Wohnhaus immer
  drawWohnhaus(svg, GEBAEUDE_LAYOUT.wohnhaus.x, GEBAEUDE_LAYOUT.wohnhaus.y);

  for (const gid of ['huehnerstall','kuhstall','silo','schweinestall','scheune','hofladen','werkstatt','tankstelle','biogas']) {
    const layout = GEBAEUDE_LAYOUT[gid];
    if (!layout) continue;
    if (GS.gekauft.includes(gid)) {
      drawGebaeude(svg, gid, layout);
    } else {
      // Bauplatz nur zeigen wenn requires erfüllt
      const item = SHOP_KATALOG.gebaeude.find(s => s.id === gid);
      if (item && (!item.requires || GS.gekauft.includes(item.requires))) {
        drawBauplatz(svg, gid, layout, item.preis);
      }
    }
  }

  // === Trecker oben drauf ===
  treckerGrp = svgEl('g', {id:'treckerGrp', class:'dragMode'});
  drawTreckerInto(treckerGrp);
  svg.appendChild(treckerGrp);
  updateTreckerPosition();

  // Tiere
  drawTiere(svg);

  container.appendChild(svg);
  svgEle = svg;
}

// === Felder neu rendern ohne den ganzen SVG zu rebuilden ===
function rerenderFelder() {
  const g = document.getElementById('felderG');
  if (!g) return;
  g.innerHTML = '';
  rerenderFelderInto(g);
}

function rerenderFelderInto(parent) {
  for (const fid in FELD_LAYOUT) {
    const layout = FELD_LAYOUT[fid];
    const owned = GS.gekauft.includes(fid);
    if (owned) {
      drawFeld(parent, fid, layout);
    } else {
      // Schau ob requires erfüllt für Bauplatz-Anzeige
      const item = SHOP_KATALOG.felder.find(s => s.id === fid);
      if (item && (!item.requires || GS.gekauft.includes(item.requires))) {
        drawFeldBauplatz(parent, fid, layout, item.preis);
      }
    }
  }
}

function drawFeld(parent, fid, layout) {
  if (!GS.felder[fid]) GS.felder[fid] = {stage:0, plantedAt:null, fortschritt:0};
  const f = GS.felder[fid];
  const cfg = CROP_CONFIG[layout.type];
  const g = svgEl('g', {transform:`translate(${layout.x},${layout.y})`, 'data-feld':fid});

  // Grundfläche
  let bg;
  if (f.stage === 0) bg = '#5d4037';
  else if (f.stage === 1) bg = 'url(#acker)';
  else if (f.stage === 2) bg = '#9ccc65';
  else bg = cfg.color === '#fdd835' ? '#fdd835' : '#aed581';

  g.appendChild(svgEl('rect', {x:'0', y:'0', width:String(layout.w), height:String(layout.h), fill:bg, stroke:'#3e2723', 'stroke-width':'3', rx:'6'}));

  // Stage-Inhalt
  if (f.stage === 0) {
    // Steine
    g.appendChild(svgEl('ellipse', {cx:String(layout.w*0.25), cy:String(layout.h*0.4), rx:'5', ry:'3', fill:'#a1887f'}));
    g.appendChild(svgEl('ellipse', {cx:String(layout.w*0.6), cy:String(layout.h*0.6), rx:'6', ry:'3', fill:'#a1887f'}));
    g.appendChild(svgEl('ellipse', {cx:String(layout.w*0.8), cy:String(layout.h*0.3), rx:'4', ry:'3', fill:'#a1887f'}));
    // Fortschritt-Balken wenn pflügt
    if (f.fortschritt > 0) {
      g.appendChild(svgEl('rect', {x:'0', y:'0', width:String(layout.w * f.fortschritt / 100), height:String(layout.h), fill:'url(#acker)', opacity:'.85'}));
    }
    g.appendChild(svgEl('text', {x:String(layout.w/2), y:String(layout.h-8), 'text-anchor':'middle', fill:'#fff', 'font-size':'12', 'font-weight':'700'}, '⛏️ Trecker drüber fahren!'));
  } else if (f.stage === 1) {
    g.appendChild(svgEl('text', {x:String(layout.w/2), y:String(layout.h/2 + 5), 'text-anchor':'middle', fill:'#fff', 'font-size':'13', 'font-weight':'700'}, `🌱 Tippen zum Säen (${cfg.saatkosten}€)`));
    // Klick-Handler für Säen
    g.style.cursor = 'pointer';
    g.addEventListener('click', () => onSaeen(fid));
  } else if (f.stage === 2 || f.stage === 3) {
    // Detaillierte Pflanzen
    drawPflanzenSchoen(g, layout.type, layout.w, layout.h, f.stage === 3);
    if (f.stage === 2 && f.plantedAt) {
      const elapsed = Date.now() - f.plantedAt;
      const wachsMs = cfg.wachstumMs * ZEIT_FAKTOR;
      const pct = Math.min(100, elapsed / wachsMs * 100);
      g.appendChild(svgEl('rect', {x:'5', y:String(layout.h-12), width:String(layout.w-10), height:'6', fill:'rgba(0,0,0,.4)', rx:'3'}));
      g.appendChild(svgEl('rect', {x:'5', y:String(layout.h-12), width:String((layout.w-10)*pct/100), height:'6', fill:'#fbc02d', rx:'3'}));
    } else if (f.stage === 3) {
      // Reif - Glow-Effekt
      g.appendChild(svgEl('rect', {x:'-5', y:'-5', width:String(layout.w+10), height:String(layout.h+10), fill:'none', stroke:'#fbc02d', 'stroke-width':'4', rx:'10', opacity:'.7'}));
      g.appendChild(svgEl('text', {x:String(layout.w/2), y:String(layout.h-6), 'text-anchor':'middle', fill:'#3e2723', 'font-size':'13', 'font-weight':'900'}, `🌾 REIF! Mähdrescher drüber!`));
      // Fortschritt-Balken bei Ernten
      if (f.fortschritt > 0) {
        g.appendChild(svgEl('rect', {x:'0', y:'0', width:String(layout.w * f.fortschritt / 100), height:String(layout.h), fill:'url(#acker)', opacity:'.7'}));
      }
    }
  }

  parent.appendChild(g);
}

function drawFeldBauplatz(parent, fid, layout, preis) {
  const g = svgEl('g', {transform:`translate(${layout.x},${layout.y})`, style:'cursor:pointer'});
  g.appendChild(svgEl('rect', {x:'0', y:'0', width:String(layout.w), height:String(layout.h), fill:'rgba(255,255,255,.1)', stroke:'#fff', 'stroke-width':'3', 'stroke-dasharray':'10 6', rx:'6'}));
  g.appendChild(svgEl('text', {x:String(layout.w/2), y:String(layout.h/2 - 10), 'text-anchor':'middle', fill:'#fff', 'font-size':'16', 'font-weight':'700'}, '🌱 Bauplatz Feld'));
  g.appendChild(svgEl('text', {x:String(layout.w/2), y:String(layout.h/2 + 14), 'text-anchor':'middle', fill:'#fff', 'font-size':'14', 'font-weight':'900'}, formatGeld(preis)));
  g.addEventListener('click', () => kaufen(fid));
  parent.appendChild(g);
}

function drawPflanzenSchoen(g, type, w, h, reif) {
  const cfg = CROP_CONFIG[type];
  const cols = 14, rows = 3;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const px = (c+0.5) * w / cols;
      const py = h * 0.25 + r * h * 0.25;
      const ph = svgEl('g', {transform:`translate(${px},${py})`});
      if (type === 'weizen') {
        ph.innerHTML = `
          <line x1="0" y1="14" x2="0" y2="-2" stroke="#558b2f" stroke-width="1.5"/>
          <ellipse cx="0" cy="-6" rx="3" ry="6" fill="${reif ? '#fdd835' : '#9ccc65'}"/>
          ${reif ? '<line x1="0" y1="-12" x2="0" y2="-15" stroke="#fbc02d" stroke-width="1"/><line x1="-2" y1="-12" x2="-3" y2="-15" stroke="#fbc02d" stroke-width="0.8"/><line x1="2" y1="-12" x2="3" y2="-15" stroke="#fbc02d" stroke-width="0.8"/>' : ''}
        `;
      } else if (type === 'mais') {
        ph.innerHTML = `
          <line x1="0" y1="18" x2="0" y2="-8" stroke="#33691e" stroke-width="2.5"/>
          <path d="M 0 5 Q -7 0 -5 -5" stroke="#558b2f" stroke-width="2" fill="none"/>
          <path d="M 0 0 Q 7 -5 5 -10" stroke="#558b2f" stroke-width="2" fill="none"/>
          <ellipse cx="0" cy="-10" rx="3.5" ry="9" fill="${reif ? '#fbc02d' : '#aed581'}"/>
          ${reif ? '<line x1="-2" y1="-15" x2="-2" y2="-8" stroke="#f57f17" stroke-width="0.5"/><line x1="0" y1="-15" x2="0" y2="-8" stroke="#f57f17" stroke-width="0.5"/><line x1="2" y1="-15" x2="2" y2="-8" stroke="#f57f17" stroke-width="0.5"/>' : ''}
        `;
      } else if (type === 'kartoffel') {
        ph.innerHTML = `
          <ellipse cx="0" cy="6" rx="9" ry="3" fill="#3e2723" opacity=".4"/>
          <circle cx="-4" cy="0" r="4" fill="#558b2f"/>
          <circle cx="4" cy="0" r="4" fill="#558b2f"/>
          <circle cx="0" cy="-3" r="5" fill="${reif ? '#7cb342' : '#aed581'}"/>
          ${reif ? '<circle cx="0" cy="-6" r="2" fill="#fff"/><circle cx="0" cy="-6" r="1" fill="#ffeb3b"/>' : ''}
        `;
      } else if (type === 'raps') {
        ph.innerHTML = `
          <line x1="0" y1="14" x2="0" y2="-4" stroke="#558b2f" stroke-width="1.5"/>
          <ellipse cx="-3" cy="2" rx="2.5" ry="1.5" fill="#7cb342"/>
          <ellipse cx="3" cy="0" rx="2.5" ry="1.5" fill="#7cb342"/>
          ${reif ? '<circle cx="0" cy="-8" r="3" fill="#fdd835"/><circle cx="-2" cy="-10" r="2" fill="#fbc02d"/><circle cx="2" cy="-10" r="2" fill="#fbc02d"/><circle cx="0" cy="-13" r="1.5" fill="#fff59d"/>' : '<circle cx="0" cy="-6" r="2" fill="#9ccc65"/>'}
        `;
      } else if (type === 'ruebe') {
        ph.innerHTML = `
          <circle cx="0" cy="2" r="${reif ? 6 : 3}" fill="${reif ? '#9c27b0' : '#aed581'}"/>
          <path d="M -3 -3 L -5 -10 M 0 -5 L 0 -12 M 3 -3 L 5 -10" stroke="#558b2f" stroke-width="1.5" fill="none"/>
        `;
      } else if (type === 'wiese') {
        ph.innerHTML = `
          <line x1="-2" y1="12" x2="-2" y2="-2" stroke="#558b2f" stroke-width="1.2"/>
          <line x1="0" y1="12" x2="0" y2="-4" stroke="#558b2f" stroke-width="1.2"/>
          <line x1="2" y1="12" x2="2" y2="-2" stroke="#558b2f" stroke-width="1.2"/>
        `;
      }
      g.appendChild(ph);
    }
  }
}

// === Gebäude ===
function drawWohnhaus(svg, x, y) {
  const g = svgEl('g', {transform:`translate(${x},${y})`});
  // Hay-Day-Stil mit isometrischer 3/4-Perspektive (Seitenwand sichtbar)
  g.innerHTML = `
    <ellipse cx="105" cy="216" rx="90" ry="9" fill="#000" opacity=".35"/>

    <!-- Stein-Sockel mit Tiefe -->
    <polygon points="20,205 175,205 195,215 40,215" fill="#8d6e63" stroke="#000" stroke-width="2"/>
    <rect x="20" y="195" width="155" height="10" fill="url(#steinSockel)" stroke="#000" stroke-width="2"/>

    <!-- SEITENWAND rechts (Tiefe = 3D Effekt) -->
    <polygon points="175,120 195,135 195,205 175,195" fill="#5d4037" stroke="#000" stroke-width="2"/>
    <!-- Frontwand -->
    <rect x="20" y="120" width="155" height="75" fill="#fff8e1" stroke="#000" stroke-width="2.5"/>
    <!-- Holzbalken -->
    <rect x="20" y="155" width="155" height="4" fill="#5d4037"/>
    <rect x="93" y="120" width="5" height="75" fill="#5d4037"/>
    <rect x="20" y="120" width="5" height="75" fill="#8d6e63"/>
    <rect x="170" y="120" width="5" height="75" fill="#5d4037"/>

    <!-- Fenster links mit Rahmen + Highlight + Blumen -->
    <rect x="35" y="130" width="36" height="22" fill="#90caf9" stroke="#000" stroke-width="2.5" rx="1"/>
    <polygon points="37,132 47,132 42,142" fill="#fff" opacity=".4"/>
    <line x1="53" y1="130" x2="53" y2="152" stroke="#5d4037" stroke-width="1.5"/>
    <line x1="35" y1="141" x2="71" y2="141" stroke="#5d4037" stroke-width="1.5"/>
    <rect x="32" y="152" width="42" height="6" fill="#5d4037" stroke="#000" stroke-width="1"/>
    <circle cx="40" cy="151" r="3" fill="#e91e63" stroke="#000" stroke-width=".5"/>
    <circle cx="48" cy="151" r="3" fill="#fff59d" stroke="#000" stroke-width=".5"/>
    <circle cx="56" cy="151" r="3" fill="#9c27b0" stroke="#000" stroke-width=".5"/>
    <circle cx="64" cy="151" r="3" fill="#ff9800" stroke="#000" stroke-width=".5"/>

    <!-- Fenster rechts -->
    <rect x="119" y="130" width="36" height="22" fill="#90caf9" stroke="#000" stroke-width="2.5" rx="1"/>
    <polygon points="121,132 131,132 126,142" fill="#fff" opacity=".4"/>
    <line x1="137" y1="130" x2="137" y2="152" stroke="#5d4037" stroke-width="1.5"/>
    <line x1="119" y1="141" x2="155" y2="141" stroke="#5d4037" stroke-width="1.5"/>

    <!-- Tür mit Tiefe -->
    <rect x="78" y="160" width="32" height="35" fill="#5d4037" stroke="#000" stroke-width="2.5" rx="1"/>
    <rect x="80" y="162" width="28" height="33" fill="#3e2723"/>
    <rect x="82" y="164" width="24" height="14" fill="#5d4037"/>
    <circle cx="103" cy="180" r="2" fill="#fbc02d" stroke="#000" stroke-width=".5"/>

    <!-- DACH ISOMETRISCH (mit Seite!) -->
    <!-- Hauptdach -->
    <polygon points="10,120 95,55 180,120" fill="url(#ziegelRot)" stroke="#000" stroke-width="2.5"/>
    <!-- Dach-Seite rechts -->
    <polygon points="180,120 200,135 115,70 95,55" fill="#a52525" stroke="#000" stroke-width="2"/>

    <!-- Dachgaube -->
    <rect x="83" y="100" width="24" height="22" fill="#fff8e1" stroke="#000" stroke-width="2"/>
    <polygon points="79,100 95,84 111,100" fill="#c62828" stroke="#000" stroke-width="2"/>
    <rect x="88" y="106" width="14" height="14" fill="#90caf9" stroke="#000" stroke-width="1.5"/>
    <line x1="95" y1="106" x2="95" y2="120" stroke="#5d4037" stroke-width="1"/>

    <!-- Schornstein mit Kragen -->
    <rect x="45" y="65" width="14" height="38" fill="#8d6e63" stroke="#000" stroke-width="2"/>
    <rect x="42" y="62" width="20" height="6" fill="#5d4037" stroke="#000" stroke-width="1.5"/>
    <!-- Rauch -->
    <g opacity=".75">
      <circle cx="52" cy="56" r="6" fill="#eceff1" stroke="#cfd8dc" stroke-width=".8"/>
      <circle cx="58" cy="44" r="8" fill="#eceff1" stroke="#cfd8dc" stroke-width=".8"/>
      <circle cx="50" cy="32" r="10" fill="#fff" stroke="#cfd8dc" stroke-width=".8"/>
    </g>
  `;
  svg.appendChild(g);
}

function drawGebaeude(svg, gid, layout) {
  const g = svgEl('g', {transform:`translate(${layout.x},${layout.y})`});
  if (gid === 'huehnerstall') {
    g.innerHTML = `
      <ellipse cx="80" cy="160" rx="72" ry="8" fill="#000" opacity=".35"/>
      <!-- Sockel mit Tiefe -->
      <polygon points="10,150 150,150 165,158 25,158" fill="#8d6e63" stroke="#000" stroke-width="2"/>
      <rect x="10" y="142" width="140" height="10" fill="url(#steinSockel)" stroke="#000" stroke-width="2"/>
      <!-- Seitenwand rechts -->
      <polygon points="150,80 168,95 168,150 150,140" fill="#7d5a3a" stroke="#000" stroke-width="2"/>
      <!-- Frontwand -->
      <rect x="10" y="80" width="140" height="62" fill="#a1887f" stroke="#000" stroke-width="2.5"/>
      <!-- Holzbretter -->
      <line x1="10" y1="100" x2="150" y2="100" stroke="#5d4037" stroke-width="1.5"/>
      <line x1="10" y1="120" x2="150" y2="120" stroke="#5d4037" stroke-width="1.5"/>
      <!-- Tür mit Hühnerklappe -->
      <rect x="65" y="105" width="30" height="37" fill="#3e2723" stroke="#000" stroke-width="2"/>
      <rect x="68" y="108" width="24" height="20" fill="#5d4037"/>
      <rect x="72" y="125" width="16" height="17" fill="#a1887f"/>
      <!-- Rundes Loch oben für Hühner -->
      <circle cx="80" cy="62" r="14" fill="#3e2723" stroke="#000" stroke-width="2"/>
      <circle cx="80" cy="62" r="10" fill="#1a1a1a"/>
      <!-- Sitzstange im Loch -->
      <line x1="68" y1="62" x2="92" y2="62" stroke="#5d4037" stroke-width="3"/>
      <!-- DACH isometrisch -->
      <polygon points="0,80 80,30 160,80" fill="url(#ziegelRot)" stroke="#000" stroke-width="2.5"/>
      <polygon points="160,80 178,93 98,43 80,30" fill="#a52525" stroke="#000" stroke-width="2"/>
      <!-- Hahn auf Dach -->
      <line x1="80" y1="20" x2="80" y2="30" stroke="#000" stroke-width="2"/>
      <text x="80" y="22" text-anchor="middle" font-size="22">🐔</text>
    `;
    // Hühner draußen mit Details
    const huehner = GS.tiere.huhn || 0;
    let hStr = '';
    for (let i = 0; i < Math.min(huehner, 4); i++) {
      hStr += `<g transform="translate(${160 + i*22},${147})">
        <ellipse cx="9" cy="14" rx="9" ry="2" fill="#000" opacity=".3"/>
        <ellipse cx="9" cy="9" rx="8" ry="6" fill="#fff" stroke="#000" stroke-width="1.2"/>
        <ellipse cx="6" cy="10" rx="5" ry="5" fill="#eceff1" stroke="#bdbdbd" stroke-width=".5"/>
        <circle cx="14" cy="5" r="4.5" fill="#fff" stroke="#000" stroke-width="1.2"/>
        <polygon points="17,4 21,5 17,6" fill="#ffa726" stroke="#000" stroke-width=".5"/>
        <path d="M 11 1 L 12 -1 L 13 1 L 14 -1 L 15 1 L 16 -1 L 17 1" fill="#e53935" stroke="#000" stroke-width=".5"/>
        <ellipse cx="15" cy="7" rx="1.5" ry="1.5" fill="#e53935"/>
        <circle cx="15" cy="4" r="1" fill="#000"/>
        <circle cx="15.2" cy="3.7" r=".3" fill="#fff"/>
        <line x1="6" y1="14" x2="6" y2="17" stroke="#fbc02d" stroke-width="1.5"/>
        <line x1="11" y1="14" x2="11" y2="17" stroke="#fbc02d" stroke-width="1.5"/>
      </g>`;
    }
    g.innerHTML += hStr;
    g.style.cursor = 'pointer';
    g.addEventListener('click', () => openTierMenu('huehnerstall'));

  } else if (gid === 'kuhstall') {
    g.innerHTML = `
      <ellipse cx="120" cy="232" rx="110" ry="10" fill="#000" opacity=".35"/>
      <polygon points="10,222 220,222 240,232 30,232" fill="#8d6e63" stroke="#000" stroke-width="2"/>
      <rect x="10" y="212" width="210" height="12" fill="url(#steinSockel)" stroke="#000" stroke-width="2"/>
      <!-- Seitenwand -->
      <polygon points="220,120 240,135 240,222 220,210" fill="#7d5a3a" stroke="#000" stroke-width="2"/>
      <!-- Frontwand mit Fachwerk -->
      <rect x="10" y="120" width="210" height="92" fill="#fff8e1" stroke="#000" stroke-width="2.5"/>
      <!-- Fachwerk-Balken (sauber im Raster) -->
      <line x1="10" y1="120" x2="220" y2="120" stroke="#5d4037" stroke-width="3"/>
      <line x1="10" y1="165" x2="220" y2="165" stroke="#5d4037" stroke-width="3"/>
      <line x1="120" y1="120" x2="120" y2="212" stroke="#5d4037" stroke-width="3"/>
      <!-- Andreas-Kreuze -->
      <line x1="10" y1="120" x2="120" y2="165" stroke="#5d4037" stroke-width="2"/>
      <line x1="10" y1="165" x2="120" y2="120" stroke="#5d4037" stroke-width="2"/>
      <line x1="120" y1="120" x2="220" y2="165" stroke="#5d4037" stroke-width="2"/>
      <line x1="120" y1="165" x2="220" y2="120" stroke="#5d4037" stroke-width="2"/>
      <!-- Großes Stalltor -->
      <rect x="100" y="170" width="40" height="42" fill="#3e2723" stroke="#000" stroke-width="2.5"/>
      <line x1="120" y1="170" x2="120" y2="212" stroke="#5d4037" stroke-width="2"/>
      <line x1="100" y1="190" x2="140" y2="190" stroke="#5d4037" stroke-width="1.5"/>
      <circle cx="116" cy="190" r="2" fill="#fbc02d"/>
      <circle cx="124" cy="190" r="2" fill="#fbc02d"/>
      <!-- Fenster mit Vorhängen -->
      <rect x="35" y="175" width="22" height="22" fill="#90caf9" stroke="#000" stroke-width="2"/>
      <polygon points="37,177 47,177 42,187" fill="#fff" opacity=".4"/>
      <rect x="183" y="175" width="22" height="22" fill="#90caf9" stroke="#000" stroke-width="2"/>
      <polygon points="185,177 195,177 190,187" fill="#fff" opacity=".4"/>
      <!-- DACH ISOMETRISCH -->
      <polygon points="0,120 120,35 240,120" fill="url(#ziegelRot)" stroke="#000" stroke-width="2.5"/>
      <polygon points="240,120 258,135 138,50 120,35" fill="#a52525" stroke="#000" stroke-width="2"/>
      <!-- Heuluken im Dach -->
      <rect x="112" y="65" width="16" height="22" fill="#3e2723" stroke="#000" stroke-width="2"/>
      <line x1="120" y1="65" x2="120" y2="87" stroke="#5d4037" stroke-width="1"/>
      <line x1="120" y1="65" x2="120" y2="50" stroke="#3e2723" stroke-width="1.5"/>
      <circle cx="120" cy="48" r="3" fill="#3e2723" stroke="#000" stroke-width="1"/>
      <!-- Wetterhahn -->
      <line x1="120" y1="35" x2="120" y2="20" stroke="#000" stroke-width="2"/>
      <polygon points="112,20 120,12 128,20 120,24" fill="#fbc02d" stroke="#000" stroke-width="1"/>
    `;
    g.style.cursor = 'pointer';
    g.addEventListener('click', () => openTierMenu('kuhstall'));

  } else if (gid === 'silo') {
    g.innerHTML = `
      <ellipse cx="40" cy="280" rx="40" ry="7" fill="#000" opacity=".35"/>
      <!-- Sockel -->
      <ellipse cx="40" cy="262" rx="42" ry="11" fill="#5d4037" stroke="#000" stroke-width="2"/>
      <ellipse cx="40" cy="255" rx="40" ry="11" fill="#90a4ae" stroke="#000" stroke-width="2"/>
      <!-- Hauptzylinder -->
      <rect x="0" y="80" width="80" height="180" fill="#cfd8dc" stroke="#000" stroke-width="2.5"/>
      <!-- Highlight-Streifen -->
      <rect x="6" y="80" width="8" height="180" fill="#fff" opacity=".5"/>
      <rect x="68" y="80" width="8" height="180" fill="#78909c"/>
      <!-- Horizontal-Bänder -->
      <ellipse cx="40" cy="80" rx="40" ry="9" fill="#90a4ae" stroke="#000" stroke-width="2"/>
      <ellipse cx="40" cy="140" rx="40" ry="3" fill="#78909c"/>
      <ellipse cx="40" cy="200" rx="40" ry="3" fill="#78909c"/>
      <!-- Kuppel mit Highlight -->
      <path d="M 0 80 Q 40 20 80 80 Z" fill="#b0bec5" stroke="#000" stroke-width="2.5"/>
      <path d="M 8 50 Q 40 25 72 50" stroke="#fff" stroke-width="3" opacity=".6" fill="none"/>
      <!-- Spitze -->
      <line x1="40" y1="20" x2="40" y2="40" stroke="#000" stroke-width="2.5"/>
      <circle cx="40" cy="18" r="4" fill="#fbc02d" stroke="#000" stroke-width="1.5"/>
      <!-- Leiter seitlich -->
      <line x1="78" y1="100" x2="78" y2="245" stroke="#000" stroke-width="1.5"/>
      ${[100,120,140,160,180,200,220,240].map(y => `<line x1="74" y1="${y}" x2="82" y2="${y}" stroke="#000" stroke-width="1.5"/>`).join('')}
      <!-- Schriftzug mit Schatten -->
      <text x="42" y="171" text-anchor="middle" font-size="16" font-weight="900" fill="#000" opacity=".5">FUTTER</text>
      <text x="40" y="170" text-anchor="middle" font-size="16" font-weight="900" fill="#3e2723">FUTTER</text>
    `;
  } else {
    // Generisches Gebäude für andere
    const farben = {
      schweinestall:{wand:'#bf360c', dach:'#5d4037', em:'🐷'},
      scheune:{wand:'#8d6e63', dach:'#c62828', em:'🏚️'},
      hofladen:{wand:'#43a047', dach:'#fbc02d', em:'🏪'},
      werkstatt:{wand:'#90a4ae', dach:'#37474f', em:'🔧'},
      tankstelle:{wand:'#1565c0', dach:'#fff', em:'⛽'},
      biogas:{wand:'#558b2f', dach:'#7cb342', em:'🔋'}
    };
    const f = farben[gid] || {wand:'#bcaaa4', dach:'#c62828', em:'🏠'};
    g.innerHTML = `
      <ellipse cx="${layout.w/2}" cy="${layout.h-2}" rx="${layout.w/2 - 5}" ry="8" fill="#000" opacity=".35"/>
      <polygon points="5,${layout.h-22} ${layout.w-5},${layout.h-22} ${layout.w+10},${layout.h-12} 20,${layout.h-12}" fill="#8d6e63" stroke="#000" stroke-width="1.5"/>
      <rect x="5" y="${layout.h-30}" width="${layout.w-10}" height="10" fill="url(#steinSockel)" stroke="#000" stroke-width="1.5"/>
      <polygon points="${layout.w-5},${layout.h*0.4} ${layout.w+15},${layout.h*0.4 + 15} ${layout.w+15},${layout.h-12} ${layout.w-5},${layout.h-22}" fill="${f.wand}" stroke="#000" stroke-width="1.5" opacity=".7"/>
      <rect x="5" y="${layout.h*0.4}" width="${layout.w-10}" height="${layout.h*0.5 - 12}" fill="${f.wand}" stroke="#000" stroke-width="2"/>
      <rect x="${layout.w*0.4}" y="${layout.h*0.65}" width="${layout.w*0.2}" height="${layout.h*0.25}" fill="#3e2723" stroke="#000" stroke-width="1.5"/>
      <polygon points="-5,${layout.h*0.4} ${layout.w/2},${layout.h*0.05} ${layout.w+5},${layout.h*0.4}" fill="${f.dach}" stroke="#000" stroke-width="2.5"/>
      <polygon points="${layout.w+5},${layout.h*0.4} ${layout.w+20},${layout.h*0.4 + 12} ${layout.w/2 + 15},${layout.h*0.05 + 12} ${layout.w/2},${layout.h*0.05}" fill="${f.dach}" stroke="#000" stroke-width="1.5" opacity=".75"/>
      <text x="${layout.w/2}" y="${layout.h*0.62}" text-anchor="middle" font-size="40" filter="drop-shadow(0 2px 0 rgba(0,0,0,.4))">${f.em}</text>
    `;
  }
  svg.appendChild(g);
}

function drawBauplatz(svg, gid, layout, preis) {
  const g = svgEl('g', {transform:`translate(${layout.x},${layout.y})`, style:'cursor:pointer'});
  g.appendChild(svgEl('rect', {x:'0', y:'0', width:String(layout.w), height:String(layout.h), fill:'rgba(255,255,255,.1)', stroke:'#fff', 'stroke-width':'4', 'stroke-dasharray':'12 8', rx:'10'}));
  g.appendChild(svgEl('text', {x:String(layout.w/2), y:String(layout.h/2 - 14), 'text-anchor':'middle', fill:'#fff', 'font-size':'18', 'font-weight':'700'}, '🏚️ Bauplatz'));
  g.appendChild(svgEl('text', {x:String(layout.w/2), y:String(layout.h/2 + 6), 'text-anchor':'middle', fill:'#fff', 'font-size':'14'}, GEBAEUDE_LAYOUT[gid].name));
  g.appendChild(svgEl('text', {x:String(layout.w/2), y:String(layout.h/2 + 26), 'text-anchor':'middle', fill:'#fff', 'font-size':'15', 'font-weight':'900'}, formatGeld(preis)));
  g.addEventListener('click', () => kaufen(gid));
  svg.appendChild(g);
}

function drawTreckerInto(g) {
  // Hay-Day-Stil Trecker, isometrische 3/4-Perspective von schräg oben
  g.innerHTML = `
    <g id="treckerInner" transform="translate(-75,-60)">
      <!-- großer weicher Schatten -->
      <ellipse cx="75" cy="115" rx="70" ry="9" fill="#000" opacity=".35"/>
      <!-- HINTER-Räder (groß, sichtbar an den Seiten) -->
      <ellipse cx="35" cy="110" rx="15" ry="7" fill="#1a1a1a"/>
      <ellipse cx="35" cy="105" rx="15" ry="13" fill="#212121" stroke="#000" stroke-width="2"/>
      <ellipse cx="35" cy="105" rx="9" ry="8" fill="#fbc02d" stroke="#000" stroke-width="1.5"/>
      <circle cx="35" cy="105" r="3" fill="#3e2723"/>
      <ellipse cx="115" cy="110" rx="15" ry="7" fill="#1a1a1a"/>
      <ellipse cx="115" cy="105" rx="15" ry="13" fill="#212121" stroke="#000" stroke-width="2"/>
      <ellipse cx="115" cy="105" rx="9" ry="8" fill="#fbc02d" stroke="#000" stroke-width="1.5"/>
      <circle cx="115" cy="105" r="3" fill="#3e2723"/>
      <!-- VORDER-Räder (etwas kleiner, vorne dran) -->
      <ellipse cx="135" cy="105" rx="9" ry="5" fill="#1a1a1a"/>
      <ellipse cx="135" cy="100" rx="9" ry="9" fill="#212121" stroke="#000" stroke-width="1.5"/>
      <circle cx="135" cy="100" r="5" fill="#fbc02d" stroke="#000" stroke-width="1"/>
      <circle cx="135" cy="100" r="2" fill="#3e2723"/>

      <!-- HAUPTKÖRPER (3D-look mit Schattierung) -->
      <!-- Untere/Schatten-Seite -->
      <rect x="10" y="68" width="115" height="35" rx="6" fill="#0d3010" stroke="#000" stroke-width="2.5"/>
      <!-- Helle Hauptseite -->
      <rect x="10" y="55" width="115" height="20" rx="6" fill="url(#trkGreen)" stroke="#000" stroke-width="2.5"/>
      <!-- Highlight oben -->
      <rect x="14" y="58" width="105" height="4" rx="2" fill="#81c784" opacity=".7"/>

      <!-- Motor-Haube vorne (höher) -->
      <rect x="95" y="50" width="35" height="40" rx="6" fill="url(#trkGreen)" stroke="#000" stroke-width="2.5"/>
      <rect x="95" y="50" width="35" height="6" fill="#81c784" opacity=".7"/>

      <!-- KABINE (auf Hauptkörper) -->
      <rect x="35" y="20" width="55" height="50" rx="8" fill="url(#trkGreen)" stroke="#000" stroke-width="2.5"/>
      <!-- Kabine-Schatten unten -->
      <rect x="35" y="60" width="55" height="10" fill="#0d3010" opacity=".5"/>
      <!-- Frontscheibe -->
      <rect x="40" y="26" width="45" height="25" rx="4" fill="#90caf9" stroke="#000" stroke-width="2"/>
      <!-- Scheibe-Highlight -->
      <polygon points="42,28 50,28 47,40" fill="#fff" opacity=".4"/>
      <!-- Trennstege Scheibe -->
      <line x1="55" y1="26" x2="55" y2="51" stroke="#0d3010" stroke-width="1.5"/>
      <line x1="70" y1="26" x2="70" y2="51" stroke="#0d3010" stroke-width="1.5"/>

      <!-- Dach mit Lichtbalken -->
      <rect x="32" y="14" width="61" height="9" rx="3" fill="#212121" stroke="#000" stroke-width="2"/>
      <rect x="38" y="10" width="49" height="6" rx="2" fill="#37474f" stroke="#000" stroke-width="1.5"/>
      <circle cx="45" cy="13" r="2" fill="#fff59d"/>
      <circle cx="55" cy="13" r="2" fill="#fff59d"/>
      <circle cx="65" cy="13" r="2" fill="#fff59d"/>
      <circle cx="75" cy="13" r="2" fill="#fff59d"/>

      <!-- Auspuff -->
      <rect x="28" y="-2" width="9" height="20" fill="#37474f" stroke="#000" stroke-width="1.5"/>
      <rect x="26" y="-4" width="13" height="6" rx="2" fill="#212121" stroke="#000" stroke-width="1.5"/>
      <!-- Rauch -->
      <g opacity=".7">
        <circle cx="32" cy="-12" r="6" fill="#cfd8dc"/>
        <circle cx="38" cy="-22" r="8" fill="#eceff1"/>
        <circle cx="28" cy="-30" r="9" fill="#fff"/>
      </g>

      <!-- Kühlergrill vorne -->
      <rect x="125" y="62" width="6" height="22" fill="#000"/>
      <line x1="125" y1="66" x2="131" y2="66" stroke="#fbc02d" stroke-width=".8"/>
      <line x1="125" y1="70" x2="131" y2="70" stroke="#fbc02d" stroke-width=".8"/>
      <line x1="125" y1="74" x2="131" y2="74" stroke="#fbc02d" stroke-width=".8"/>
      <line x1="125" y1="78" x2="131" y2="78" stroke="#fbc02d" stroke-width=".8"/>

      <!-- John Deere Logo -->
      <rect x="98" y="68" width="30" height="8" rx="2" fill="#fbc02d" stroke="#000" stroke-width="1"/>
      <text x="113" y="74" text-anchor="middle" font-size="6" font-weight="900" fill="#1b5e20">JOHN DEERE</text>

      <!-- Frontscheinwerfer -->
      <ellipse cx="128" cy="58" rx="5" ry="3" fill="#fff59d" stroke="#000" stroke-width="1.5"/>
      <ellipse cx="128" cy="58" rx="2.5" ry="1.5" fill="#fff"/>

      <!-- Spiegel -->
      <line x1="35" y1="32" x2="28" y2="26" stroke="#212121" stroke-width="2"/>
      <ellipse cx="26" cy="25" rx="4" ry="3" fill="#90caf9" stroke="#000" stroke-width="1.5"/>
      <line x1="90" y1="32" x2="97" y2="26" stroke="#212121" stroke-width="2"/>
      <ellipse cx="99" cy="25" rx="4" ry="3" fill="#90caf9" stroke="#000" stroke-width="1.5"/>
    </g>
  `;
}

function updateTreckerPosition() {
  if (!treckerGrp) return;
  // KEIN ROTATE auf den ganzen Trecker → nur SPIEGELN wenn nach links
  // Plus: ganz leichte vertikale Neigung wenn auf-/ab-Bewegung
  const inner = document.getElementById('treckerInner');
  if (inner) {
    // Wir nutzen die x-Bewegung als „facing": rot zwischen -90 und 90 = nach rechts, sonst nach links
    const facingRight = (GS.trecker.rot >= -90 && GS.trecker.rot <= 90);
    inner.setAttribute('transform', `translate(-75,-60)${facingRight ? '' : ' scale(-1,1) translate(-150,0)'}`);
  }
  // Position ohne rotate
  treckerGrp.setAttribute('transform', `translate(${GS.trecker.x},${GS.trecker.y})`);
}

function drawTiere(svg) {
  // Hühner verstreut wenn mehr als 4 - DETAILLIERT (Hay-Day-Stil)
  const huehner = GS.tiere.huhn || 0;
  for (let i = 4; i < huehner; i++) {
    const tx = 1100 - (i-4) * 35;
    const ty = 460 + (i % 2) * 45;
    const g = svgEl('g', {transform:`translate(${tx},${ty}) scale(1.5)`});
    g.innerHTML = `
      <ellipse cx="9" cy="14" rx="9" ry="2" fill="#000" opacity=".3"/>
      <ellipse cx="9" cy="9" rx="8" ry="6" fill="#fff" stroke="#000" stroke-width="1.2"/>
      <ellipse cx="6" cy="10" rx="5" ry="5" fill="#eceff1" stroke="#bdbdbd" stroke-width=".5"/>
      <circle cx="14" cy="5" r="4.5" fill="#fff" stroke="#000" stroke-width="1.2"/>
      <polygon points="17,4 21,5 17,6" fill="#ffa726" stroke="#000" stroke-width=".5"/>
      <path d="M 11 1 L 12 -1 L 13 1 L 14 -1 L 15 1 L 16 -1 L 17 1" fill="#e53935" stroke="#000" stroke-width=".5"/>
      <ellipse cx="15" cy="7" rx="1.5" ry="1.5" fill="#e53935"/>
      <circle cx="15" cy="4" r="1" fill="#000"/>
      <circle cx="15.2" cy="3.7" r=".3" fill="#fff"/>
      <line x1="6" y1="14" x2="6" y2="17" stroke="#fbc02d" stroke-width="1.5"/>
      <line x1="11" y1="14" x2="11" y2="17" stroke="#fbc02d" stroke-width="1.5"/>
    `;
    svg.appendChild(g);
  }
  // Kühe DETAILLIERT
  const kuehe = GS.tiere.kuh || 0;
  for (let i = 0; i < kuehe; i++) {
    const tx = 760 + (i%3) * 60;
    const ty = 410 + Math.floor(i/3) * 55;
    const g = svgEl('g', {transform:`translate(${tx},${ty}) scale(1.4)`, style:'cursor:pointer'});
    g.innerHTML = `
      <ellipse cx="15" cy="28" rx="22" ry="4" fill="#000" opacity=".35"/>
      <!-- Körper -->
      <ellipse cx="15" cy="18" rx="20" ry="11" fill="#fff" stroke="#000" stroke-width="1.5"/>
      <!-- Schwarz-weiße Flecken -->
      <ellipse cx="6" cy="14" rx="6" ry="4" fill="#1a1a1a"/>
      <ellipse cx="22" cy="13" rx="5" ry="3" fill="#1a1a1a"/>
      <ellipse cx="18" cy="22" rx="4" ry="2" fill="#1a1a1a"/>
      <!-- Bauch / Highlight -->
      <ellipse cx="15" cy="22" rx="14" ry="4" fill="#fff" opacity=".5"/>
      <!-- Beine mit Hufen -->
      <rect x="3" y="25" width="3" height="6" fill="#fff" stroke="#000" stroke-width="1"/>
      <rect x="24" y="25" width="3" height="6" fill="#fff" stroke="#000" stroke-width="1"/>
      <rect x="10" y="26" width="3" height="5" fill="#1a1a1a" stroke="#000" stroke-width=".8"/>
      <rect x="20" y="26" width="3" height="5" fill="#1a1a1a" stroke="#000" stroke-width=".8"/>
      <rect x="3" y="30" width="3" height="2" fill="#3e2723"/>
      <rect x="24" y="30" width="3" height="2" fill="#3e2723"/>
      <!-- Kopf -->
      <ellipse cx="-3" cy="14" rx="6" ry="5" fill="#fff" stroke="#000" stroke-width="1.5"/>
      <ellipse cx="-3" cy="16.5" rx="3" ry="2.5" fill="#ffcdd2" stroke="#e57373" stroke-width=".5"/>
      <!-- Hörner -->
      <path d="M -7 9 Q -8 6 -7 4" stroke="#fbc02d" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M 1 9 Q 2 6 1 4" stroke="#fbc02d" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- Ohren -->
      <ellipse cx="-7" cy="11" rx="2.5" ry="3.5" fill="#fff" stroke="#000" stroke-width="1"/>
      <ellipse cx="1" cy="11" rx="2.5" ry="3.5" fill="#1a1a1a" stroke="#000" stroke-width="1"/>
      <!-- Augen -->
      <circle cx="-5" cy="13" r="1.2" fill="#000"/>
      <circle cx="-1" cy="13" r="1.2" fill="#000"/>
      <circle cx="-4.7" cy="12.7" r=".4" fill="#fff"/>
      <circle cx="-.7" cy="12.7" r=".4" fill="#fff"/>
      <!-- Nüstern -->
      <circle cx="-4" cy="17" r=".7" fill="#3e2723"/>
      <circle cx="-2" cy="17" r=".7" fill="#3e2723"/>
      <!-- Lächeln -->
      <path d="M -5 19 Q -3 20 -1 19" stroke="#3e2723" stroke-width=".8" fill="none"/>
      <!-- Schwanz mit Quaste -->
      <path d="M 35 15 Q 40 18 42 22" stroke="#1a1a1a" stroke-width="1.8" fill="none"/>
      <ellipse cx="42" cy="23" rx="2.5" ry="3" fill="#1a1a1a" stroke="#000" stroke-width=".5"/>
      <!-- Euter -->
      <ellipse cx="15" cy="27" rx="3" ry="2" fill="#ffcdd2" stroke="#e57373" stroke-width=".5"/>
    `;
    g.addEventListener('click', () => onTierClick('kuh'));
    svg.appendChild(g);
  }
  // Schweine wenn vorhanden
  const schweine = GS.tiere.schwein || 0;
  for (let i = 0; i < schweine; i++) {
    const tx = 920 + (i%3) * 50;
    const ty = 430 + Math.floor(i/3) * 40;
    const g = svgEl('g', {transform:`translate(${tx},${ty}) scale(1.3)`});
    g.innerHTML = `
      <ellipse cx="15" cy="26" rx="18" ry="4" fill="#000" opacity=".35"/>
      <!-- Körper -->
      <ellipse cx="15" cy="17" rx="16" ry="9" fill="#f8bbd0" stroke="#c2185b" stroke-width="1.5"/>
      <!-- Beine -->
      <rect x="5" y="22" width="3" height="6" fill="#f8bbd0" stroke="#c2185b" stroke-width="1"/>
      <rect x="22" y="22" width="3" height="6" fill="#f8bbd0" stroke="#c2185b" stroke-width="1"/>
      <!-- Kopf -->
      <circle cx="2" cy="14" r="6" fill="#f8bbd0" stroke="#c2185b" stroke-width="1.5"/>
      <!-- Schnauze -->
      <ellipse cx="-3" cy="15" rx="3.5" ry="3" fill="#ec407a" stroke="#c2185b" stroke-width="1"/>
      <ellipse cx="-4" cy="15" rx=".7" ry="1" fill="#3e2723"/>
      <ellipse cx="-2" cy="15" rx=".7" ry="1" fill="#3e2723"/>
      <!-- Augen -->
      <circle cx="0" cy="11" r="1" fill="#000"/>
      <circle cx=".3" cy="10.7" r=".3" fill="#fff"/>
      <!-- Spitze Ohren -->
      <polygon points="-3,7 -1,2 1,7" fill="#f8bbd0" stroke="#c2185b" stroke-width="1"/>
      <polygon points="3,7 5,2 7,7" fill="#f8bbd0" stroke="#c2185b" stroke-width="1"/>
      <!-- Ringel-Schwanz -->
      <path d="M 30 14 Q 35 13 33 17 Q 31 19 35 19" stroke="#c2185b" stroke-width="1.8" fill="none"/>
    `;
    svg.appendChild(g);
  }
}

// === TRECKER-DRAG mit Feld-Kollision ===
let dragging = false;
let lastDragPos = null;
let activePointer = null;
let feldArbeit = {}; // {fid: {arbeitMs, lastTime}}

function setupTreckerDrag(container) {
  container.addEventListener('pointerdown', e => {
    if (!treckerGrp) return;
    e.preventDefault();
    activePointer = e.pointerId;
    dragging = true;
    container.classList.add('dragging');
    lastDragPos = svgCoords(container, e);
  });
  container.addEventListener('pointermove', e => {
    if (!dragging || e.pointerId !== activePointer) return;
    e.preventDefault();
    const p = svgCoords(container, e);
    const dx = p.x - GS.trecker.x;
    const dy = p.y - GS.trecker.y;
    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
      GS.trecker.rot = Math.atan2(dy, dx) * 180 / Math.PI;
    }
    GS.trecker.x = Math.max(80, Math.min(W - 80, p.x));
    GS.trecker.y = Math.max(60, Math.min(H - 80, p.y));
    updateTreckerPosition();

    // Kollisions-Check mit Feldern
    checkFeldKollision(p);
    lastDragPos = p;
  });
  const stop = () => {
    dragging = false;
    container.classList.remove('dragging');
    activePointer = null;
    saveState();
  };
  container.addEventListener('pointerup', stop);
  container.addEventListener('pointercancel', stop);
  container.addEventListener('pointerleave', stop);
}

function svgCoords(container, evt) {
  const rect = container.getBoundingClientRect();
  const x = (evt.clientX - rect.left) / rect.width * W;
  const y = (evt.clientY - rect.top) / rect.height * H;
  return {x, y};
}

function checkFeldKollision(treckerPos) {
  for (const fid in FELD_LAYOUT) {
    if (!GS.gekauft.includes(fid)) continue;
    const layout = FELD_LAYOUT[fid];
    const f = GS.felder[fid];
    if (!f) continue;
    const inside = treckerPos.x >= layout.x && treckerPos.x <= layout.x + layout.w
                && treckerPos.y >= layout.y && treckerPos.y <= layout.y + layout.h;
    if (!inside) {
      delete feldArbeit[fid];
      continue;
    }
    // Trecker IST über diesem Feld
    const now = Date.now();
    if (!feldArbeit[fid]) feldArbeit[fid] = {start: now, fortschritt: f.fortschritt || 0};
    const dt = now - (feldArbeit[fid].lastTime || now);
    feldArbeit[fid].lastTime = now;

    if (werkzeugAktiv === 'pflug' && f.stage === 0) {
      // Pflügen: Fortschritt erhöhen
      f.fortschritt = (f.fortschritt || 0) + dt / 30; // 3 Sek bis 100%
      if (f.fortschritt >= 100) {
        f.stage = 1;
        f.fortschritt = 0;
        toast('🚜 Feld gepflügt!');
        saveState();
      }
      rerenderFeld(fid);
    } else if (werkzeugAktiv === 'maehdrescher' && f.stage === 3) {
      // Ernten
      f.fortschritt = (f.fortschritt || 0) + dt / 30;
      if (f.fortschritt >= 100) {
        const cfg = CROP_CONFIG[layout.type];
        GS.inventar[layout.type] = (GS.inventar[layout.type] || 0) + cfg.ertragSaecke;
        f.stage = 0;
        f.fortschritt = 0;
        f.plantedAt = null;
        GS.stats.geernet++;
        saveState();
        rerenderFelder();
        setTimeout(() => verkaufenMitMathe(layout.type, cfg.ertragSaecke), 300);
      } else {
        rerenderFeld(fid);
      }
    } else if (werkzeugAktiv === 'saemaschine' && f.stage === 1) {
      const cfg = CROP_CONFIG[layout.type];
      if (GS.geld < cfg.saatkosten) {
        toast('❌ Nicht genug Geld zum Säen', '#e53935');
        delete feldArbeit[fid];
        return;
      }
      GS.geld -= cfg.saatkosten;
      f.stage = 2;
      f.plantedAt = Date.now();
      f.fortschritt = 0;
      updateGeldText();
      saveState();
      rerenderFeld(fid);
      toast(`🌱 Gesät! Wächst ${Math.round(cfg.wachstumMs * ZEIT_FAKTOR / 1000)}s`);
      delete feldArbeit[fid];
    }
  }
}

function rerenderFeld(fid) {
  // Nur dieses eine Feld neu zeichnen für Performance
  const old = document.querySelector(`[data-feld="${fid}"]`);
  if (!old) return;
  const layout = FELD_LAYOUT[fid];
  const parent = old.parentNode;
  old.remove();
  drawFeld(parent, fid, layout);
}

// === Saaen per Klick (alternativ zum Trecker) ===
function onSaeen(fid) {
  const f = GS.felder[fid];
  const layout = FELD_LAYOUT[fid];
  const cfg = CROP_CONFIG[layout.type];
  if (f.stage !== 1) return;
  if (GS.geld < cfg.saatkosten) { toast('❌ Nicht genug Geld', '#e53935'); return; }
  GS.geld -= cfg.saatkosten;
  f.stage = 2;
  f.plantedAt = Date.now();
  f.fortschritt = 0;
  updateGeldText();
  saveState();
  rerenderFeld(fid);
  toast(`🌱 Gesät!`);
}

// === Verkauf mit Mathe ===
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
              GS.geld += richtigerPreis;
              GS.inventar[cropType] = Math.max(0, (GS.inventar[cropType] || 0) - saecke);
              GS.stats.mathe_richtig++;
              saveState();
              setTimeout(() => { closeModal(); updateGeldText(); toast(`✅ +${formatGeld(richtigerPreis)}!`, '#43a047'); }, 800);
            } else {
              const halbe = Math.floor(richtigerPreis / 2);
              GS.geld += halbe;
              GS.inventar[cropType] = Math.max(0, (GS.inventar[cropType] || 0) - saecke);
              GS.stats.mathe_falsch++;
              saveState();
              setTimeout(() => { closeModal(); updateGeldText(); toast(`❌ Halb: +${formatGeld(halbe)}`, '#ef5350'); }, 1200);
            }
          });
          return btn;
        })
      )
    )
  );
}

function onTierClick(typ) {
  if (typ === 'kuh') {
    const kuehe = GS.tiere.kuh || 0;
    const total = kuehe * 8;
    if (kuehe === 0) return;
    GS.inventar.milch = (GS.inventar.milch || 0) + total;
    saveState();
    verkaufenMitMatheCustom('milch', total, 0.5, '🥛 Milch verkaufen', '🥛');
  }
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
              GS.geld += Math.round(richtigerPreis / 100);
              GS.inventar[item] = Math.max(0, (GS.inventar[item] || 0) - menge);
              GS.stats.mathe_richtig++;
              saveState();
              setTimeout(() => { closeModal(); updateGeldText(); toast(`✅ +${Math.round(richtigerPreis/100)}€`, '#43a047'); }, 800);
            } else {
              GS.geld += Math.round(richtigerPreis / 200);
              GS.inventar[item] = Math.max(0, (GS.inventar[item] || 0) - menge);
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

// === Shop ===
let shopTabAktiv = 'gebaeude';
function openShop() {
  const card = el('div', {class:'modal-card'});
  card.appendChild(el('button', {class:'close', onclick: closeModal}, '✕'));
  card.appendChild(el('h2', {}, '🛒 Bauen & Kaufen'));

  const tabs = el('div', {class:'shop-tabs'});
  for (const tab of ['gebaeude','felder','maschinen','tiere']) {
    const btn = el('button', {class:'shop-tab' + (shopTabAktiv === tab ? ' aktiv' : '')},
      tab === 'gebaeude' ? '🏚️' : tab === 'felder' ? '🌱' : tab === 'maschinen' ? '🚜' : '🐮');
    btn.addEventListener('click', () => { shopTabAktiv = tab; closeModal(); openShop(); });
    tabs.appendChild(btn);
  }
  card.appendChild(tabs);

  const grid = el('div', {class:'shop-grid'});
  for (const item of SHOP_KATALOG[shopTabAktiv]) {
    const owned = GS.gekauft.includes(item.id);
    const ownedCount = item.wiederholbar ? (GS.tiere[item.id] || 0) : 0;
    const required = item.requires && !GS.gekauft.includes(item.requires);
    const tooExpensive = !required && GS.geld < item.preis;
    const cls = item.wiederholbar ? '' : (owned ? 'gekauft' : (required ? 'locked' : (tooExpensive ? 'zuteuer' : '')));
    const cell = el('div', {class:'shop-item ' + cls},
      el('span', {class:'em'}, item.em),
      el('div', {class:'name'}, item.name + (item.wiederholbar ? ` (${ownedCount}/${item.max||999})` : '')),
      el('div', {class:'desc'}, item.desc),
      el('div', {class:'preis'}, formatGeld(item.preis))
    );
    if (!owned && !required && (!tooExpensive || item.wiederholbar)) {
      cell.addEventListener('click', () => {
        if (item.wiederholbar) {
          if (ownedCount >= (item.max || 999)) { toast('Max', '#ff7043'); return; }
          if (GS.geld < item.preis) { toast('Zu teuer', '#ef5350'); return; }
          GS.tiere[item.id] = (GS.tiere[item.id] || 0) + 1;
          GS.geld -= item.preis;
          GS.stats.kaeufe++;
          saveState();
          closeModal();
          buildUI();
          toast(`🎉 ${item.name}!`);
        } else {
          kaufen(item.id);
        }
      });
    }
    grid.appendChild(cell);
  }
  card.appendChild(grid);
  showModalRaw(card);
}

function kaufen(itemId) {
  const item = [...SHOP_KATALOG.gebaeude, ...SHOP_KATALOG.felder, ...SHOP_KATALOG.maschinen, ...SHOP_KATALOG.tiere].find(i => i.id === itemId);
  if (!item) return;
  if (GS.geld < item.preis) { toast(`❌ Brauchst noch ${formatGeld(item.preis - GS.geld)}`, '#ef5350'); return; }
  if (item.requires && !GS.gekauft.includes(item.requires)) { toast('🔒 Erst andere bauen', '#ff7043'); return; }
  GS.geld -= item.preis;
  GS.gekauft.push(itemId);
  GS.stats.kaeufe++;
  if (itemId === 'huehnerstall') GS.tiere.huhn = (GS.tiere.huhn || 0) + 2;
  if (itemId === 'kuhstall') GS.tiere.kuh = (GS.tiere.kuh || 0) + 1;
  if (itemId.startsWith('feld_')) GS.felder[itemId] = {stage:0, plantedAt:null, fortschritt:0};
  saveState();
  closeModal();
  buildUI();
  toast(`🎉 ${item.name} gebaut!`, '#43a047');
}

function openTierMenu(stallTyp) {
  const card = el('div', {class:'modal-card'});
  card.appendChild(el('button', {class:'close', onclick: closeModal}, '✕'));
  if (stallTyp === 'huehnerstall') {
    const huehner = GS.tiere.huhn || 0;
    card.appendChild(el('h2', {}, '🐔 Hühnerstall'));
    card.appendChild(el('p', {style:{'text-align':'center', 'margin-bottom':'14px', 'font-size':'16px'}}, `Du hast ${huehner} Hühner.`));
    const btn = el('button', {style:{display:'block', width:'100%', padding:'18px', background:'linear-gradient(180deg,#43a047,#2e7d32)', color:'#fff', border:'none', 'border-radius':'14px', 'font-weight':'900', 'font-size':'18px', cursor:'pointer'}}, `🥚 ${huehner * 2} Eier sammeln`);
    btn.addEventListener('click', () => {
      if (huehner === 0) { toast('Keine Hühner!', '#ef5350'); return; }
      GS.inventar.eier = (GS.inventar.eier || 0) + huehner * 2;
      saveState();
      closeModal();
      verkaufenMitMatheCustom('eier', huehner * 2, 0.4, '🥚 Eier verkaufen', '🥚');
    });
    card.appendChild(btn);
  } else if (stallTyp === 'kuhstall') {
    const kuehe = GS.tiere.kuh || 0;
    card.appendChild(el('h2', {}, '🐮 Kuhstall'));
    card.appendChild(el('p', {style:{'text-align':'center', 'margin-bottom':'14px', 'font-size':'16px'}}, `Du hast ${kuehe} Kühe.`));
    const btn = el('button', {style:{display:'block', width:'100%', padding:'18px', background:'linear-gradient(180deg,#43a047,#2e7d32)', color:'#fff', border:'none', 'border-radius':'14px', 'font-weight':'900', 'font-size':'18px', cursor:'pointer'}}, `🥛 ${kuehe * 8} L Milch melken`);
    btn.addEventListener('click', () => { if (kuehe === 0) { toast('Keine Kühe!', '#ef5350'); return; } onTierClick('kuh'); closeModal(); });
    card.appendChild(btn);
  }
  showModalRaw(card);
}

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
  localStorage.setItem('liam_hof_seen_v3', '1');
  const tip = el('div', {class:'tooltip', style:{top:'50%', left:'50%', transform:'translate(-50%,-50%)', 'max-width':'90%'}},
    el('div', {style:{'font-size':'26px', 'margin-bottom':'10px'}}, '👋 Hallo Liam!'),
    el('div', {style:{'margin-bottom':'8px'}}, 'Wähle unten dein Werkzeug: ⛏️ Pflügen, 🌱 Säen oder 🌾 Ernten'),
    el('div', {style:{'margin-bottom':'8px'}}, 'Dann ZIEHE den Trecker mit dem Finger über das Feld!'),
    el('div', {style:{'margin-bottom':'8px'}}, 'Nach dem Ernten kommt eine Mathe-Aufgabe – richtig = volles Geld!'),
    (function(){const b=el('button',{style:{'margin-top':'14px', padding:'14px 28px', background:'#1b5e20', color:'#fff', border:'none', 'border-radius':'14px', 'font-weight':'900', 'font-size':'16px', cursor:'pointer'}},'Los gehts!');b.addEventListener('click',()=>tip.remove());return b;})()
  );
  document.body.appendChild(tip);
}

function cheatBtn(label, fn) {
  const b = el('button', {}, label);
  b.addEventListener('click', fn);
  return b;
}

// === Auto-Refresh nur fürs Wachstum (sehr selten, kein Full-Render) ===
setInterval(() => {
  let changed = false;
  for (const fid in GS.felder) {
    const f = GS.felder[fid];
    if (f.stage === 2 && f.plantedAt) {
      const cfg = CROP_CONFIG[FELD_LAYOUT[fid]?.type || 'weizen'];
      if (Date.now() - f.plantedAt >= cfg.wachstumMs * ZEIT_FAKTOR) {
        f.stage = 3;
        changed = true;
      }
    }
  }
  if (changed) { saveState(); rerenderFelder(); }
  else {
    // Nur Wachstumsbalken aktualisieren ohne Full-Render
    for (const fid in GS.felder) {
      const f = GS.felder[fid];
      if (f.stage === 2 && f.plantedAt) rerenderFeld(fid);
    }
  }
}, TEST_MODE ? 1000 : 5000);

// === Start ===
loadState();
buildUI();
