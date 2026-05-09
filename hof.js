// ============================================================
// LIAMS BAUERNHOF v4 - große Welt, scrollbar, Innen-Ansichten
// ============================================================

const SUPABASE_URL = 'https://nrmqdhcrshyoigesqapm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ybXFkaGNyc2h5b2lnZXNxYXBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MTQ3MjksImV4cCI6MjA4ODk5MDcyOX0.Hw4hg6f9iiJcw92veiEU4-oPGcRX_k5NoLuxHU5_ors';
const TEST_MODE = new URLSearchParams(location.search).has('test');
const SAVE_KEY = TEST_MODE ? 'liam_hof_test_v4' : 'liam_hof_v4';
const ZEIT_FAKTOR = TEST_MODE ? 0.1 : 1;

// === große Welt ===
const W = 2400, H = 1600;
const VIEW_W = 1200, VIEW_H = 800;

// === Felder außen herum, größer ===
const FELD_LAYOUT = {
  feld_weizen:    {x:80,   y:300, w:380, h:200, type:'weizen'},   // links oben
  feld_mais:      {x:80,   y:540, w:380, h:200, type:'mais'},     // links mitte
  feld_kartoffel: {x:80,   y:780, w:380, h:200, type:'kartoffel'},// links unten
  feld_raps:      {x:80,   y:1020,w:380, h:200, type:'raps'},     // links ganz unten
  feld_ruebe:     {x:1940, y:300, w:380, h:200, type:'ruebe'},    // rechts oben
  feld_wiese:     {x:1940, y:540, w:380, h:200, type:'wiese'},    // rechts mitte
  feld_hafer:     {x:1940, y:780, w:380, h:200, type:'hafer'},
  feld_gerste:    {x:1940, y:1020,w:380, h:200, type:'gerste'},
  feld_unten1:    {x:540,  y:1280, w:340, h:200, type:'mais'},    // unten zentriert
  feld_unten2:    {x:920,  y:1280, w:340, h:200, type:'weizen'},
  feld_unten3:    {x:1300, y:1280, w:340, h:200, type:'kartoffel'},
  feld_unten4:    {x:1680, y:1280, w:240, h:200, type:'raps'}
};

// === Gebäude im Hof-Cluster zentriert ===
const GEBAEUDE_LAYOUT = {
  wohnhaus:    {x:560,  y:430, w:280, h:340, name:'Wohnhaus'},
  huehnerstall:{x:880,  y:480, w:240, h:240, name:'Hühnerstall'},
  kuhstall:    {x:1160, y:430, w:340, h:340, name:'Kuhstall'},
  silo:        {x:1530, y:380, w:120, h:380, name:'Silo'},
  schweinestall:{x:1680,y:480, w:240, h:240, name:'Schweinestall'},
  scheune:     {x:580,  y:80,  w:300, h:240, name:'Scheune'},
  hofladen:    {x:1680, y:130, w:240, h:200, name:'Hofladen'},
  werkstatt:   {x:920,  y:140, w:280, h:200, name:'Werkstatt'},
  tankstelle:  {x:1240, y:80,  w:240, h:160, name:'Tankstelle'},
  biogas:      {x:240,  y:80,  w:280, h:240, name:'Biogasanlage'}
};

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
    {id:'feld_wiese', name:'6. Wiese (Heu)', em:'🍃', desc:'Tierfutter', preis:1500, requires:'feld_raps'},
    {id:'feld_hafer', name:'7. Hafer', em:'🌾', desc:'Pferdefutter', preis:2500, requires:'feld_ruebe'},
    {id:'feld_gerste', name:'8. Gerste', em:'🌾', desc:'Bier-Brauerei', preis:3000, requires:'feld_hafer'},
    {id:'feld_unten1', name:'9. Großes Maisfeld', em:'🌽', desc:'XL', preis:4000, requires:'feld_gerste'},
    {id:'feld_unten2', name:'10. XL-Weizen', em:'🌾', desc:'XL', preis:5000, requires:'feld_unten1'},
    {id:'feld_unten3', name:'11. XL-Kartoffeln', em:'🥔', desc:'XL', preis:6500, requires:'feld_unten2'},
    {id:'feld_unten4', name:'12. XL-Raps', em:'🌻', desc:'XL', preis:8000, requires:'feld_unten3'}
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
    {id:'huhn', name:'+ 1 Huhn', em:'🐔', desc:'5 Eier/Tag', preis:50, requires:'huehnerstall', wiederholbar:true, max:12},
    {id:'kuh', name:'+ 1 Kuh', em:'🐮', desc:'8 L Milch/Tag', preis:500, requires:'kuhstall', wiederholbar:true, max:8},
    {id:'schwein', name:'+ 1 Schwein', em:'🐷', desc:'Mastvieh', preis:300, requires:'schweinestall', wiederholbar:true, max:8},
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
  wiese:  {em:'🍃', name:'Heu', wachstumMs:90000, ertragSaecke:5, preisProSack:10, saatkosten:0, color:'#aed581'},
  hafer:  {em:'🌾', name:'Hafer', wachstumMs:100000, ertragSaecke:7, preisProSack:12, saatkosten:8, color:'#dce775'},
  gerste: {em:'🌾', name:'Gerste', wachstumMs:110000, ertragSaecke:8, preisProSack:14, saatkosten:10, color:'#c5e1a5'}
};

// === State ===
let GS = null;
let werkzeugAktiv = 'pflug';
let kameraX = 600, kameraY = 400; // Welt-Pan-Position

const DEFAULT_STATE = {
  geld: TEST_MODE ? 10000 : 50,
  gekauft: ['wohnhaus','feld_weizen','fendt312'],
  felder: { feld_weizen: {stage:0, plantedAt:null, fortschritt:0} },
  tiere: {},
  trecker: {x:1100, y:600, rot:0},
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
  if (!GS.trecker) GS.trecker = {x:1100, y:600, rot:0};
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
      body: JSON.stringify({char_outfits: {hof_v4: GS}})
    });
  } catch (e) {}
}

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

let svgEle = null;
let weltGrp = null;
let treckerGrp = null;

function buildUI() {
  clear();
  root.appendChild(el('div', {class:'topbar'},
    el('button', {class:'back', onclick: zurueckZurApp}, '⬅️'),
    el('div', {id:'geldAnzeige', class:'geld'},
      el('div', {class:'coin'}, '€'),
      el('span', {id:'geldText'}, formatGeld(GS.geld))
    ),
    el('button', {class:'shop-btn', onclick: openShop}, '🛒 BAUEN')
  ));

  if (TEST_MODE) {
    root.appendChild(el('div', {class:'cheats'},
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
        GS.tiere.huhn = 12; GS.tiere.kuh = 8; GS.tiere.schwein = 6;
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
    ));
  }

  const sp = el('div', {class:'spielflaeche', id:'spielflaeche'});
  root.appendChild(sp);
  sp.appendChild(el('div', {class:'modus-indikator', id:'modusIndikator'}, '⛏️ PFLÜGEN'));

  const wz = el('div', {class:'werkzeug-leiste', id:'wzLeiste'});
  for (const w of [{id:'pflug', em:'⛏️'}, {id:'saemaschine', em:'🌱'}, {id:'maehdrescher', em:'🌾'}, {id:'pan', em:'✋'}]) {
    const b = el('div', {class:'wz' + (werkzeugAktiv === w.id ? ' aktiv' : '')}, w.em);
    b.dataset.id = w.id;
    b.addEventListener('click', () => { werkzeugAktiv = w.id; document.querySelectorAll('.wz').forEach(x => x.classList.remove('aktiv')); b.classList.add('aktiv'); updateModus(); });
    wz.appendChild(b);
  }
  sp.appendChild(wz);

  buildSVG(sp);
  updateModus();
  setupTouch(sp);

  if (!localStorage.getItem('liam_hof_seen_v4') && Object.keys(GS.felder).length === 1) {
    showHilfe();
  }
}

function updateGeldText() { const t = document.getElementById('geldText'); if (t) t.textContent = formatGeld(GS.geld); }
function updateModus() {
  const m = document.getElementById('modusIndikator');
  if (!m) return;
  const labels = {pflug:'⛏️ PFLÜGEN', saemaschine:'🌱 SÄEN', maehdrescher:'🌾 ERNTEN', pan:'✋ KARTE VERSCHIEBEN'};
  m.textContent = labels[werkzeugAktiv] + (werkzeugAktiv === 'pan' ? '' : ' · Trecker übers Feld!');
}

function buildSVG(container) {
  const svg = svgEl('svg', {viewBox:`0 0 ${VIEW_W} ${VIEW_H}`, preserveAspectRatio:'xMidYMid slice'});
  const defs = svgEl('defs');
  defs.innerHTML = `
    <linearGradient id="himmel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#7ec8e3"/><stop offset="60%" stop-color="#a5d6a7"/><stop offset="100%" stop-color="#7cb342"/>
    </linearGradient>
    <pattern id="acker" x="0" y="0" width="14" height="8" patternUnits="userSpaceOnUse"><rect width="14" height="8" fill="#5d4037"/><ellipse cx="7" cy="4" rx="6" ry="2" fill="#6d4c41"/><line x1="0" y1="4" x2="14" y2="4" stroke="#3e2723" stroke-width="0.5"/></pattern>
    <pattern id="ziegelRot" x="0" y="0" width="14" height="10" patternUnits="userSpaceOnUse"><rect width="14" height="10" fill="#c62828"/><path d="M 0 5 Q 3.5 0 7 5 Q 10.5 10 14 5" fill="#d84315"/></pattern>
    <pattern id="ziegelDachSeite" x="0" y="0" width="12" height="8" patternUnits="userSpaceOnUse"><rect width="12" height="8" fill="#a52525"/><path d="M 0 4 Q 3 0 6 4" fill="#8b1e1e"/></pattern>
    <pattern id="holzWand" x="0" y="0" width="20" height="6" patternUnits="userSpaceOnUse"><rect width="20" height="6" fill="#a1887f"/><line x1="0" y1="3" x2="20" y2="3" stroke="#5d4037" stroke-width="0.6"/></pattern>
    <pattern id="steinSockel" x="0" y="0" width="16" height="14" patternUnits="userSpaceOnUse"><rect width="16" height="14" fill="#bcaaa4"/><ellipse cx="4" cy="4" rx="3" ry="2" fill="#a1887f"/><ellipse cx="12" cy="9" rx="3" ry="2" fill="#a1887f"/></pattern>
    <pattern id="weg" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#d7ccc8"/><circle cx="5" cy="5" r="1.5" fill="#a1887f"/><circle cx="14" cy="12" r="1.5" fill="#a1887f"/></pattern>
    <linearGradient id="trkGreen" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#43a047"/><stop offset="100%" stop-color="#1b5e20"/></linearGradient>
  `;
  svg.appendChild(defs);

  // Hintergrund (fix)
  svg.appendChild(svgEl('rect', {x:'0', y:'0', width:String(VIEW_W), height:String(VIEW_H), fill:'url(#himmel)'}));

  // === Welt-Gruppe (verschiebbar) ===
  weltGrp = svgEl('g', {id:'weltGrp'});
  svg.appendChild(weltGrp);

  // Riesige Wiese als Grundfläche
  weltGrp.appendChild(svgEl('rect', {x:'0', y:'0', width:String(W), height:String(H), fill:'url(#himmel)'}));
  // Boden grün
  weltGrp.appendChild(svgEl('rect', {x:'0', y:'0', width:String(W), height:String(H), fill:'#7cb342'}));
  // Grashalme zufällig verstreut
  const gras = svgEl('g');
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * W, y = Math.random() * H;
    gras.appendChild(svgEl('path', {d:`M ${x} ${y} l -2 -8 M ${x} ${y} l 2 -8 M ${x} ${y} l 0 -10`, stroke:'#558b2f', 'stroke-width':'1.2', fill:'none'}));
  }
  weltGrp.appendChild(gras);

  // Wege zwischen Gebäuden + Feldern
  const wege = svgEl('g', {opacity:'.7'});
  // Hauptweg horizontal mittig
  wege.appendChild(svgEl('rect', {x:'460', y:'780', width:'1480', height:'40', fill:'url(#weg)'}));
  // Vertikal links/rechts zu Feldern
  wege.appendChild(svgEl('rect', {x:'460', y:'400', width:'40', height:'820', fill:'url(#weg)'}));
  wege.appendChild(svgEl('rect', {x:'1900', y:'400', width:'40', height:'820', fill:'url(#weg)'}));
  // Vertikal Mitte-Süd zu unteren Feldern
  wege.appendChild(svgEl('rect', {x:'1180', y:'780', width:'40', height:'500', fill:'url(#weg)'}));
  weltGrp.appendChild(wege);

  // Sonne, Wolken, Bäume etc. (deko)
  const deko = svgEl('g');
  // Sonne
  deko.innerHTML += `
    <g transform="translate(2200,150)">
      <g opacity=".6"><line x1="0" y1="-50" x2="0" y2="-65" stroke="#fff176" stroke-width="3"/><line x1="50" y1="0" x2="65" y2="0" stroke="#fff176" stroke-width="3"/><line x1="-50" y1="0" x2="-65" y2="0" stroke="#fff176" stroke-width="3"/></g>
      <circle r="40" fill="#fff176"/><circle r="32" fill="#ffeb3b"/>
      <circle cx="-9" cy="-5" r="5" fill="#222"/><circle cx="11" cy="-5" r="5" fill="#222"/>
      <path d="M -11 10 Q 0 22 11 10" stroke="#222" stroke-width="3" fill="none"/>
    </g>
  `;
  // Wolken
  for (const [cx, cy, sc] of [[400, 80, 1], [1500, 100, 1.3], [2100, 220, .9]]) {
    deko.innerHTML += `<g transform="translate(${cx},${cy}) scale(${sc})" fill="#fff" opacity=".95">
      <ellipse cx="0" cy="0" rx="35" ry="14"/><ellipse cx="20" cy="-7" rx="22" ry="13"/><ellipse cx="-22" cy="-3" rx="20" ry="11"/>
    </g>`;
  }
  // Bäume verstreut um den Rand
  for (const [tx, ty] of [[120, 350], [60, 720], [2300, 380], [2330, 720], [400, 1450], [1800, 1450], [1100, 1430]]) {
    deko.innerHTML += `<g transform="translate(${tx},${ty})">
      <ellipse cx="0" cy="60" rx="28" ry="8" fill="#000" opacity=".3"/>
      <rect x="-5" y="35" width="10" height="30" fill="#5d4037" stroke="#000" stroke-width="1.5"/>
      <circle cx="0" cy="20" r="28" fill="#2e7d32" stroke="#000" stroke-width="1.5"/>
      <circle cx="-15" cy="25" r="18" fill="#388e3c" stroke="#000" stroke-width="1"/>
      <circle cx="15" cy="25" r="18" fill="#388e3c" stroke="#000" stroke-width="1"/>
      <circle cx="-6" cy="22" r="3" fill="#e53935"/><circle cx="8" cy="18" r="3" fill="#e53935"/>
    </g>`;
  }
  // Zaun um den Hof
  deko.innerHTML += zaunRundherum();
  weltGrp.appendChild(deko);

  // Felder
  const felderG = svgEl('g', {id:'felderG'});
  weltGrp.appendChild(felderG);
  rerenderFelderInto(felderG);

  // Gebäude (Wohnhaus immer, Rest je nach Status)
  drawWohnhaus(weltGrp, GEBAEUDE_LAYOUT.wohnhaus.x, GEBAEUDE_LAYOUT.wohnhaus.y);
  for (const gid of ['huehnerstall','kuhstall','silo','schweinestall','scheune','hofladen','werkstatt','tankstelle','biogas']) {
    const layout = GEBAEUDE_LAYOUT[gid];
    if (!layout) continue;
    if (GS.gekauft.includes(gid)) {
      drawGebaeude(weltGrp, gid, layout);
    } else {
      const item = SHOP_KATALOG.gebaeude.find(s => s.id === gid);
      if (item && (!item.requires || GS.gekauft.includes(item.requires))) {
        drawBauplatz(weltGrp, gid, layout, item.preis);
      }
    }
  }

  // Trecker
  treckerGrp = svgEl('g', {id:'treckerGrp'});
  drawTreckerInto(treckerGrp);
  weltGrp.appendChild(treckerGrp);
  updateTreckerPosition();
  drawTiereInto(weltGrp);

  // Welt initial positionieren
  updateKamera();
  container.appendChild(svg);
  svgEle = svg;
}

function zaunRundherum() {
  let s = '';
  // Horizontaler Zaun oben
  for (let x = 50; x < W - 50; x += 50) {
    s += `<rect x="${x}" y="60" width="6" height="40" fill="#8d6e63" stroke="#000" stroke-width="1"/>`;
  }
  s += `<rect x="40" y="72" width="${W - 80}" height="6" fill="#a1887f" stroke="#000" stroke-width="1"/>`;
  s += `<rect x="40" y="92" width="${W - 80}" height="6" fill="#a1887f" stroke="#000" stroke-width="1"/>`;
  return s;
}

function updateKamera() {
  if (!weltGrp) return;
  // Welt verschieben so dass Trecker etwa zentriert ist
  const targetX = -kameraX + VIEW_W / 2;
  const targetY = -kameraY + VIEW_H / 2;
  weltGrp.setAttribute('transform', `translate(${targetX},${targetY})`);
}

// === Felder ===
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
    if (owned) drawFeld(parent, fid, layout);
    else {
      const item = SHOP_KATALOG.felder.find(s => s.id === fid);
      if (item && (!item.requires || GS.gekauft.includes(item.requires))) drawFeldBauplatz(parent, fid, layout, item.preis);
    }
  }
}

function drawFeld(parent, fid, layout) {
  if (!GS.felder[fid]) GS.felder[fid] = {stage:0, plantedAt:null, fortschritt:0};
  const f = GS.felder[fid];
  const cfg = CROP_CONFIG[layout.type];
  const g = svgEl('g', {transform:`translate(${layout.x},${layout.y})`, 'data-feld':fid});
  let bg;
  if (f.stage === 0) bg = '#5d4037';
  else if (f.stage === 1) bg = 'url(#acker)';
  else if (f.stage === 2) bg = '#9ccc65';
  else bg = cfg.color === '#fdd835' ? '#fdd835' : '#aed581';
  // Schatten
  g.appendChild(svgEl('rect', {x:'5', y:'5', width:String(layout.w), height:String(layout.h), fill:'#000', opacity:'.3', rx:'8'}));
  g.appendChild(svgEl('rect', {x:'0', y:'0', width:String(layout.w), height:String(layout.h), fill:bg, stroke:'#3e2723', 'stroke-width':'4', rx:'8'}));
  if (f.stage === 0) {
    g.appendChild(svgEl('ellipse', {cx:String(layout.w*0.25), cy:String(layout.h*0.4), rx:'6', ry:'4', fill:'#a1887f', stroke:'#000', 'stroke-width':'1'}));
    g.appendChild(svgEl('ellipse', {cx:String(layout.w*0.7), cy:String(layout.h*0.6), rx:'8', ry:'4', fill:'#a1887f', stroke:'#000', 'stroke-width':'1'}));
    g.appendChild(svgEl('ellipse', {cx:String(layout.w*0.85), cy:String(layout.h*0.3), rx:'5', ry:'3', fill:'#a1887f', stroke:'#000', 'stroke-width':'1'}));
    if (f.fortschritt > 0) g.appendChild(svgEl('rect', {x:'0', y:'0', width:String(layout.w * f.fortschritt / 100), height:String(layout.h), fill:'url(#acker)', opacity:'.85', rx:'8'}));
    g.appendChild(svgEl('text', {x:String(layout.w/2), y:String(layout.h-12), 'text-anchor':'middle', fill:'#fff', 'font-size':'14', 'font-weight':'700'}, '⛏️ Trecker drüber!'));
  } else if (f.stage === 1) {
    g.appendChild(svgEl('text', {x:String(layout.w/2), y:String(layout.h/2 + 5), 'text-anchor':'middle', fill:'#fff', 'font-size':'15', 'font-weight':'700'}, `🌱 Säen (${cfg.saatkosten}€)`));
    g.style.cursor = 'pointer';
    g.addEventListener('click', () => onSaeen(fid));
  } else if (f.stage === 2 || f.stage === 3) {
    drawPflanzenSchoen(g, layout.type, layout.w, layout.h, f.stage === 3);
    if (f.stage === 2 && f.plantedAt) {
      const elapsed = Date.now() - f.plantedAt;
      const wachsMs = cfg.wachstumMs * ZEIT_FAKTOR;
      const pct = Math.min(100, elapsed / wachsMs * 100);
      g.appendChild(svgEl('rect', {x:'5', y:String(layout.h-14), width:String(layout.w-10), height:'8', fill:'rgba(0,0,0,.4)', rx:'4'}));
      g.appendChild(svgEl('rect', {x:'5', y:String(layout.h-14), width:String((layout.w-10)*pct/100), height:'8', fill:'#fbc02d', rx:'4'}));
    } else if (f.stage === 3) {
      g.appendChild(svgEl('rect', {x:'-7', y:'-7', width:String(layout.w+14), height:String(layout.h+14), fill:'none', stroke:'#fbc02d', 'stroke-width':'5', rx:'12', opacity:'.7'}));
      g.appendChild(svgEl('text', {x:String(layout.w/2), y:String(layout.h-8), 'text-anchor':'middle', fill:'#3e2723', 'font-size':'15', 'font-weight':'900'}, `🌾 REIF!`));
      if (f.fortschritt > 0) g.appendChild(svgEl('rect', {x:'0', y:'0', width:String(layout.w * f.fortschritt / 100), height:String(layout.h), fill:'url(#acker)', opacity:'.7', rx:'8'}));
    }
  }
  parent.appendChild(g);
}

function drawFeldBauplatz(parent, fid, layout, preis) {
  const g = svgEl('g', {transform:`translate(${layout.x},${layout.y})`, style:'cursor:pointer'});
  g.appendChild(svgEl('rect', {x:'0', y:'0', width:String(layout.w), height:String(layout.h), fill:'rgba(255,255,255,.1)', stroke:'#fff', 'stroke-width':'4', 'stroke-dasharray':'14 8', rx:'8'}));
  g.appendChild(svgEl('text', {x:String(layout.w/2), y:String(layout.h/2 - 14), 'text-anchor':'middle', fill:'#fff', 'font-size':'18', 'font-weight':'700'}, '🌱 Bauplatz Feld'));
  g.appendChild(svgEl('text', {x:String(layout.w/2), y:String(layout.h/2 + 16), 'text-anchor':'middle', fill:'#fff', 'font-size':'16', 'font-weight':'900'}, formatGeld(preis)));
  g.addEventListener('click', () => kaufen(fid));
  parent.appendChild(g);
}

function drawPflanzenSchoen(g, type, w, h, reif) {
  const cfg = CROP_CONFIG[type];
  const cols = Math.floor(w / 28), rows = Math.floor(h / 50);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const px = (c+0.5) * w / cols;
      const py = h * 0.2 + r * h / rows * 0.95 + (r%2 ? 5 : 0);
      const ph = svgEl('g', {transform:`translate(${px},${py})`});
      if (type === 'weizen' || type === 'hafer' || type === 'gerste') {
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
          ${reif ? '<line x1="-3" y1="-22" x2="-3" y2="-12" stroke="#f57f17" stroke-width=".7"/><line x1="0" y1="-22" x2="0" y2="-12" stroke="#f57f17" stroke-width=".7"/><line x1="3" y1="-22" x2="3" y2="-12" stroke="#f57f17" stroke-width=".7"/>' : ''}
        `;
      } else if (type === 'kartoffel') {
        ph.innerHTML = `
          <ellipse cx="0" cy="6" rx="11" ry="3" fill="#3e2723" opacity=".4"/>
          <circle cx="-5" cy="0" r="5" fill="#558b2f" stroke="#000" stroke-width=".8"/>
          <circle cx="5" cy="0" r="5" fill="#558b2f" stroke="#000" stroke-width=".8"/>
          <circle cx="0" cy="-4" r="6" fill="${reif ? '#7cb342' : '#aed581'}" stroke="#000" stroke-width=".8"/>
          ${reif ? '<circle cx="0" cy="-7" r="2.5" fill="#fff" stroke="#000" stroke-width=".5"/><circle cx="0" cy="-7" r="1.2" fill="#ffeb3b"/>' : ''}
        `;
      } else if (type === 'raps') {
        ph.innerHTML = `
          <line x1="0" y1="14" x2="0" y2="-6" stroke="#558b2f" stroke-width="1.8"/>
          <ellipse cx="-4" cy="2" rx="3" ry="2" fill="#7cb342" stroke="#000" stroke-width=".5"/>
          <ellipse cx="4" cy="0" rx="3" ry="2" fill="#7cb342" stroke="#000" stroke-width=".5"/>
          ${reif ? '<circle cx="0" cy="-10" r="4" fill="#fdd835" stroke="#000" stroke-width=".7"/><circle cx="-3" cy="-12" r="2.5" fill="#fbc02d"/><circle cx="3" cy="-12" r="2.5" fill="#fbc02d"/><circle cx="0" cy="-15" r="2" fill="#fff59d"/>' : '<circle cx="0" cy="-7" r="2.5" fill="#9ccc65" stroke="#000" stroke-width=".5"/>'}
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

// === Gebäude (siehe v3.1 - mit Iso-Tiefe) ===
function drawWohnhaus(svg, x, y) {
  const g = svgEl('g', {transform:`translate(${x},${y})`, style:'cursor:pointer', 'data-gebaeude':'wohnhaus'});
  g.innerHTML = `
    <ellipse cx="140" cy="320" rx="130" ry="14" fill="#000" opacity=".35"/>
    <polygon points="20,300 260,300 280,315 40,315" fill="#8d6e63" stroke="#000" stroke-width="2.5"/>
    <rect x="20" y="285" width="240" height="15" fill="url(#steinSockel)" stroke="#000" stroke-width="2"/>
    <polygon points="260,160 285,180 285,300 260,290" fill="url(#ziegelDachSeite)" stroke="#000" stroke-width="2"/>
    <rect x="20" y="160" width="240" height="125" fill="#fff8e1" stroke="#000" stroke-width="3"/>
    <rect x="20" y="220" width="240" height="5" fill="#5d4037"/>
    <rect x="138" y="160" width="6" height="125" fill="#5d4037"/>
    <rect x="20" y="160" width="6" height="125" fill="#8d6e63"/>
    <rect x="254" y="160" width="6" height="125" fill="#5d4037"/>
    <rect x="40" y="180" width="50" height="32" fill="#90caf9" stroke="#000" stroke-width="3" rx="2"/>
    <polygon points="42,182 58,182 50,196" fill="#fff" opacity=".5"/>
    <line x1="65" y1="180" x2="65" y2="212" stroke="#5d4037" stroke-width="2"/>
    <line x1="40" y1="196" x2="90" y2="196" stroke="#5d4037" stroke-width="2"/>
    <rect x="36" y="212" width="60" height="9" fill="#5d4037" stroke="#000" stroke-width="1.5"/>
    <circle cx="48" cy="210" r="4" fill="#e91e63" stroke="#000" stroke-width=".8"/>
    <circle cx="60" cy="210" r="4" fill="#fff59d" stroke="#000" stroke-width=".8"/>
    <circle cx="72" cy="210" r="4" fill="#9c27b0" stroke="#000" stroke-width=".8"/>
    <circle cx="84" cy="210" r="4" fill="#ff9800" stroke="#000" stroke-width=".8"/>
    <rect x="190" y="180" width="50" height="32" fill="#90caf9" stroke="#000" stroke-width="3" rx="2"/>
    <polygon points="192,182 208,182 200,196" fill="#fff" opacity=".5"/>
    <line x1="215" y1="180" x2="215" y2="212" stroke="#5d4037" stroke-width="2"/>
    <line x1="190" y1="196" x2="240" y2="196" stroke="#5d4037" stroke-width="2"/>
    <rect x="115" y="225" width="50" height="60" fill="#5d4037" stroke="#000" stroke-width="3" rx="2"/>
    <rect x="120" y="230" width="40" height="20" fill="#3e2723"/>
    <circle cx="153" cy="258" r="3" fill="#fbc02d" stroke="#000" stroke-width=".8"/>
    <polygon points="6,160 140,75 274,160" fill="url(#ziegelRot)" stroke="#000" stroke-width="3"/>
    <polygon points="274,160 296,180 162,95 140,75" fill="url(#ziegelDachSeite)" stroke="#000" stroke-width="2.5"/>
    <rect x="125" y="135" width="30" height="28" fill="#fff8e1" stroke="#000" stroke-width="2.5"/>
    <polygon points="121,135 140,118 159,135" fill="#c62828" stroke="#000" stroke-width="2"/>
    <rect x="131" y="142" width="18" height="18" fill="#90caf9" stroke="#000" stroke-width="1.5"/>
    <line x1="140" y1="142" x2="140" y2="160" stroke="#5d4037" stroke-width="1"/>
    <rect x="60" y="90" width="18" height="48" fill="#8d6e63" stroke="#000" stroke-width="2.5"/>
    <rect x="56" y="86" width="26" height="8" fill="#5d4037" stroke="#000" stroke-width="2"/>
    <g opacity=".75">
      <circle cx="69" cy="78" r="8" fill="#eceff1" stroke="#cfd8dc" stroke-width="1"/>
      <circle cx="76" cy="62" r="11" fill="#eceff1" stroke="#cfd8dc" stroke-width="1"/>
      <circle cx="65" cy="46" r="13" fill="#fff" stroke="#cfd8dc" stroke-width="1"/>
    </g>
  `;
  g.addEventListener('click', () => openInnen('wohnhaus'));
  svg.appendChild(g);
}

function drawGebaeude(svg, gid, layout) {
  const g = svgEl('g', {transform:`translate(${layout.x},${layout.y})`, style:'cursor:pointer', 'data-gebaeude':gid});
  if (gid === 'huehnerstall') {
    g.innerHTML = drawHuehnerstall(layout);
    const huehner = GS.tiere.huhn || 0;
    let hStr = '';
    for (let i = 0; i < Math.min(huehner, 6); i++) {
      hStr += `<g transform="translate(${250 + (i%3)*30},${230 + Math.floor(i/3)*30})">
        <ellipse cx="9" cy="14" rx="9" ry="2" fill="#000" opacity=".3"/>
        <ellipse cx="9" cy="9" rx="8" ry="6" fill="#fff" stroke="#000" stroke-width="1.2"/>
        <circle cx="14" cy="5" r="4.5" fill="#fff" stroke="#000" stroke-width="1.2"/>
        <polygon points="17,4 21,5 17,6" fill="#ffa726" stroke="#000" stroke-width=".5"/>
        <path d="M 11 1 L 12 -1 L 13 1 L 14 -1 L 15 1 L 16 -1 L 17 1" fill="#e53935" stroke="#000" stroke-width=".5"/>
        <ellipse cx="15" cy="7" rx="1.5" ry="1.5" fill="#e53935"/>
        <circle cx="15" cy="4" r="1" fill="#000"/>
      </g>`;
    }
    g.innerHTML += hStr;
  } else if (gid === 'kuhstall') {
    g.innerHTML = drawKuhstallSVG(layout);
  } else if (gid === 'silo') {
    g.innerHTML = drawSiloSVG(layout);
  } else {
    g.innerHTML = drawGenericGebaeudeSVG(gid, layout);
  }
  g.addEventListener('click', () => openInnen(gid));
  svg.appendChild(g);
}

function drawHuehnerstall(L) {
  return `
    <ellipse cx="120" cy="226" rx="105" ry="11" fill="#000" opacity=".35"/>
    <polygon points="10,210 230,210 250,222 30,222" fill="#8d6e63" stroke="#000" stroke-width="2"/>
    <rect x="10" y="200" width="220" height="10" fill="url(#steinSockel)" stroke="#000" stroke-width="2"/>
    <polygon points="230,100 252,118 252,210 230,200" fill="url(#ziegelDachSeite)" stroke="#000" stroke-width="2"/>
    <rect x="10" y="100" width="220" height="100" fill="url(#holzWand)" stroke="#000" stroke-width="3"/>
    <line x1="10" y1="135" x2="230" y2="135" stroke="#5d4037" stroke-width="2"/>
    <line x1="10" y1="170" x2="230" y2="170" stroke="#5d4037" stroke-width="2"/>
    <rect x="100" y="145" width="40" height="55" fill="#3e2723" stroke="#000" stroke-width="2.5"/>
    <rect x="105" y="150" width="30" height="30" fill="#5d4037"/>
    <rect x="110" y="180" width="20" height="20" fill="#a1887f"/>
    <circle cx="120" cy="80" r="18" fill="#3e2723" stroke="#000" stroke-width="2.5"/>
    <circle cx="120" cy="80" r="12" fill="#1a1a1a"/>
    <line x1="105" y1="80" x2="135" y2="80" stroke="#5d4037" stroke-width="3"/>
    <polygon points="-5,100 120,30 245,100" fill="url(#ziegelRot)" stroke="#000" stroke-width="3"/>
    <polygon points="245,100 268,118 142,48 120,30" fill="url(#ziegelDachSeite)" stroke="#000" stroke-width="2.5"/>
    <text x="120" y="20" text-anchor="middle" font-size="28" filter="drop-shadow(0 2px 0 rgba(0,0,0,.4))">🐔</text>
  `;
}

function drawKuhstallSVG(L) {
  return `
    <ellipse cx="170" cy="326" rx="155" ry="14" fill="#000" opacity=".35"/>
    <polygon points="10,310 320,310 340,322 30,322" fill="#8d6e63" stroke="#000" stroke-width="2.5"/>
    <rect x="10" y="295" width="310" height="15" fill="url(#steinSockel)" stroke="#000" stroke-width="2"/>
    <polygon points="320,150 345,170 345,310 320,295" fill="url(#ziegelDachSeite)" stroke="#000" stroke-width="2"/>
    <rect x="10" y="150" width="310" height="145" fill="#fff8e1" stroke="#000" stroke-width="3"/>
    <line x1="10" y1="150" x2="320" y2="150" stroke="#5d4037" stroke-width="4"/>
    <line x1="10" y1="220" x2="320" y2="220" stroke="#5d4037" stroke-width="4"/>
    <line x1="170" y1="150" x2="170" y2="295" stroke="#5d4037" stroke-width="4"/>
    <line x1="10" y1="150" x2="170" y2="220" stroke="#5d4037" stroke-width="2.5"/>
    <line x1="10" y1="220" x2="170" y2="150" stroke="#5d4037" stroke-width="2.5"/>
    <line x1="170" y1="150" x2="320" y2="220" stroke="#5d4037" stroke-width="2.5"/>
    <line x1="170" y1="220" x2="320" y2="150" stroke="#5d4037" stroke-width="2.5"/>
    <rect x="140" y="225" width="60" height="70" fill="#3e2723" stroke="#000" stroke-width="3"/>
    <line x1="170" y1="225" x2="170" y2="295" stroke="#5d4037" stroke-width="2"/>
    <rect x="40" y="240" width="35" height="35" fill="#90caf9" stroke="#000" stroke-width="2.5"/>
    <polygon points="42,242 58,242 50,256" fill="#fff" opacity=".5"/>
    <rect x="245" y="240" width="35" height="35" fill="#90caf9" stroke="#000" stroke-width="2.5"/>
    <polygon points="247,242 263,242 255,256" fill="#fff" opacity=".5"/>
    <polygon points="-7,150 170,40 347,150" fill="url(#ziegelRot)" stroke="#000" stroke-width="3"/>
    <polygon points="347,150 370,170 192,60 170,40" fill="url(#ziegelDachSeite)" stroke="#000" stroke-width="2.5"/>
    <rect x="160" y="80" width="20" height="28" fill="#3e2723" stroke="#000" stroke-width="2.5"/>
    <line x1="170" y1="78" x2="170" y2="62" stroke="#000" stroke-width="2"/>
    <circle cx="170" cy="60" r="4" fill="#3e2723" stroke="#000" stroke-width="1.5"/>
    <line x1="170" y1="40" x2="170" y2="22" stroke="#000" stroke-width="2.5"/>
    <polygon points="160,22 170,12 180,22 170,28" fill="#fbc02d" stroke="#000" stroke-width="1.5"/>
  `;
}

function drawSiloSVG(L) {
  return `
    <ellipse cx="60" cy="375" rx="60" ry="10" fill="#000" opacity=".35"/>
    <ellipse cx="60" cy="362" rx="62" ry="14" fill="#5d4037" stroke="#000" stroke-width="2"/>
    <ellipse cx="60" cy="350" rx="60" ry="14" fill="#90a4ae" stroke="#000" stroke-width="2"/>
    <rect x="0" y="100" width="120" height="260" fill="#cfd8dc" stroke="#000" stroke-width="3"/>
    <rect x="8" y="100" width="12" height="260" fill="#fff" opacity=".5"/>
    <rect x="100" y="100" width="12" height="260" fill="#78909c"/>
    <ellipse cx="60" cy="100" rx="60" ry="14" fill="#90a4ae" stroke="#000" stroke-width="3"/>
    <ellipse cx="60" cy="180" rx="60" ry="4" fill="#78909c"/>
    <ellipse cx="60" cy="260" rx="60" ry="4" fill="#78909c"/>
    <path d="M 0 100 Q 60 25 120 100 Z" fill="#b0bec5" stroke="#000" stroke-width="3"/>
    <path d="M 12 65 Q 60 30 108 65" stroke="#fff" stroke-width="4" opacity=".6" fill="none"/>
    <line x1="60" y1="20" x2="60" y2="50" stroke="#000" stroke-width="3"/>
    <circle cx="60" cy="18" r="5" fill="#fbc02d" stroke="#000" stroke-width="2"/>
    <line x1="115" y1="120" x2="115" y2="345" stroke="#000" stroke-width="2"/>
    ${[120,150,180,210,240,270,300,330].map(y => `<line x1="110" y1="${y}" x2="120" y2="${y}" stroke="#000" stroke-width="2"/>`).join('')}
    <text x="62" y="231" text-anchor="middle" font-size="22" font-weight="900" fill="#000" opacity=".5">FUTTER</text>
    <text x="60" y="230" text-anchor="middle" font-size="22" font-weight="900" fill="#3e2723">FUTTER</text>
  `;
}

function drawGenericGebaeudeSVG(gid, L) {
  const farben = {
    schweinestall:{wand:'#bf360c', dach:'#5d4037', em:'🐷', name:'Schweinestall'},
    scheune:{wand:'#8d6e63', dach:'#c62828', em:'🏚️', name:'Scheune'},
    hofladen:{wand:'#43a047', dach:'#fbc02d', em:'🏪', name:'Hofladen'},
    werkstatt:{wand:'#90a4ae', dach:'#37474f', em:'🔧', name:'Werkstatt'},
    tankstelle:{wand:'#1565c0', dach:'#fff', em:'⛽', name:'Tanke'},
    biogas:{wand:'#558b2f', dach:'#7cb342', em:'🔋', name:'Biogas'}
  };
  const f = farben[gid] || {wand:'#bcaaa4', dach:'#c62828', em:'🏠', name:''};
  return `
    <ellipse cx="${L.w/2}" cy="${L.h-2}" rx="${L.w/2 - 5}" ry="10" fill="#000" opacity=".35"/>
    <polygon points="5,${L.h-22} ${L.w-5},${L.h-22} ${L.w+15},${L.h-10} 20,${L.h-10}" fill="#8d6e63" stroke="#000" stroke-width="2"/>
    <rect x="5" y="${L.h-32}" width="${L.w-10}" height="10" fill="url(#steinSockel)" stroke="#000" stroke-width="1.5"/>
    <polygon points="${L.w-5},${L.h*0.4} ${L.w+18},${L.h*0.4 + 18} ${L.w+18},${L.h-10} ${L.w-5},${L.h-22}" fill="${f.wand}" stroke="#000" stroke-width="2" opacity=".7"/>
    <rect x="5" y="${L.h*0.4}" width="${L.w-10}" height="${L.h*0.5 - 8}" fill="${f.wand}" stroke="#000" stroke-width="2.5"/>
    <rect x="${L.w*0.4}" y="${L.h*0.65}" width="${L.w*0.2}" height="${L.h*0.3}" fill="#3e2723" stroke="#000" stroke-width="2"/>
    <polygon points="-5,${L.h*0.4} ${L.w/2},${L.h*0.05} ${L.w+5},${L.h*0.4}" fill="${f.dach}" stroke="#000" stroke-width="3"/>
    <polygon points="${L.w+5},${L.h*0.4} ${L.w+22},${L.h*0.4 + 14} ${L.w/2 + 17},${L.h*0.05 + 14} ${L.w/2},${L.h*0.05}" fill="${f.dach}" stroke="#000" stroke-width="2" opacity=".7"/>
    <text x="${L.w/2}" y="${L.h*0.6}" text-anchor="middle" font-size="48" filter="drop-shadow(0 3px 0 rgba(0,0,0,.5))">${f.em}</text>
    <text x="${L.w/2}" y="${L.h*0.92}" text-anchor="middle" font-size="14" font-weight="900" fill="#fff" stroke="#000" stroke-width="3" paint-order="stroke">${f.name}</text>
  `;
}

function drawBauplatz(svg, gid, layout, preis) {
  const g = svgEl('g', {transform:`translate(${layout.x},${layout.y})`, style:'cursor:pointer'});
  g.appendChild(svgEl('rect', {x:'0', y:'0', width:String(layout.w), height:String(layout.h), fill:'rgba(255,255,255,.1)', stroke:'#fff', 'stroke-width':'5', 'stroke-dasharray':'14 8', rx:'10'}));
  g.appendChild(svgEl('text', {x:String(layout.w/2), y:String(layout.h/2 - 18), 'text-anchor':'middle', fill:'#fff', 'font-size':'22', 'font-weight':'700'}, '🏚️'));
  g.appendChild(svgEl('text', {x:String(layout.w/2), y:String(layout.h/2 + 6), 'text-anchor':'middle', fill:'#fff', 'font-size':'16'}, GEBAEUDE_LAYOUT[gid].name));
  g.appendChild(svgEl('text', {x:String(layout.w/2), y:String(layout.h/2 + 28), 'text-anchor':'middle', fill:'#fff', 'font-size':'18', 'font-weight':'900'}, formatGeld(preis)));
  g.addEventListener('click', () => kaufen(gid));
  svg.appendChild(g);
}

function drawTreckerInto(g) {
  g.innerHTML = `
    <g id="treckerInner" transform="translate(-75,-60)">
      <ellipse cx="75" cy="115" rx="70" ry="9" fill="#000" opacity=".35"/>
      <ellipse cx="35" cy="110" rx="15" ry="7" fill="#1a1a1a"/>
      <ellipse cx="35" cy="105" rx="15" ry="13" fill="#212121" stroke="#000" stroke-width="2"/>
      <ellipse cx="35" cy="105" rx="9" ry="8" fill="#fbc02d" stroke="#000" stroke-width="1.5"/>
      <circle cx="35" cy="105" r="3" fill="#3e2723"/>
      <ellipse cx="115" cy="110" rx="15" ry="7" fill="#1a1a1a"/>
      <ellipse cx="115" cy="105" rx="15" ry="13" fill="#212121" stroke="#000" stroke-width="2"/>
      <ellipse cx="115" cy="105" rx="9" ry="8" fill="#fbc02d" stroke="#000" stroke-width="1.5"/>
      <circle cx="115" cy="105" r="3" fill="#3e2723"/>
      <ellipse cx="135" cy="105" rx="9" ry="5" fill="#1a1a1a"/>
      <ellipse cx="135" cy="100" rx="9" ry="9" fill="#212121" stroke="#000" stroke-width="1.5"/>
      <circle cx="135" cy="100" r="5" fill="#fbc02d" stroke="#000" stroke-width="1"/>
      <circle cx="135" cy="100" r="2" fill="#3e2723"/>
      <rect x="10" y="68" width="115" height="35" rx="6" fill="#0d3010" stroke="#000" stroke-width="2.5"/>
      <rect x="10" y="55" width="115" height="20" rx="6" fill="url(#trkGreen)" stroke="#000" stroke-width="2.5"/>
      <rect x="14" y="58" width="105" height="4" rx="2" fill="#81c784" opacity=".7"/>
      <rect x="95" y="50" width="35" height="40" rx="6" fill="url(#trkGreen)" stroke="#000" stroke-width="2.5"/>
      <rect x="35" y="20" width="55" height="50" rx="8" fill="url(#trkGreen)" stroke="#000" stroke-width="2.5"/>
      <rect x="35" y="60" width="55" height="10" fill="#0d3010" opacity=".5"/>
      <rect x="40" y="26" width="45" height="25" rx="4" fill="#90caf9" stroke="#000" stroke-width="2"/>
      <polygon points="42,28 50,28 47,40" fill="#fff" opacity=".4"/>
      <line x1="55" y1="26" x2="55" y2="51" stroke="#0d3010" stroke-width="1.5"/>
      <line x1="70" y1="26" x2="70" y2="51" stroke="#0d3010" stroke-width="1.5"/>
      <rect x="32" y="14" width="61" height="9" rx="3" fill="#212121" stroke="#000" stroke-width="2"/>
      <rect x="38" y="10" width="49" height="6" rx="2" fill="#37474f" stroke="#000" stroke-width="1.5"/>
      <circle cx="45" cy="13" r="2" fill="#fff59d"/>
      <circle cx="55" cy="13" r="2" fill="#fff59d"/>
      <circle cx="65" cy="13" r="2" fill="#fff59d"/>
      <circle cx="75" cy="13" r="2" fill="#fff59d"/>
      <rect x="28" y="-2" width="9" height="20" fill="#37474f" stroke="#000" stroke-width="1.5"/>
      <rect x="26" y="-4" width="13" height="6" rx="2" fill="#212121" stroke="#000" stroke-width="1.5"/>
      <g opacity=".7">
        <circle cx="32" cy="-12" r="6" fill="#cfd8dc"/>
        <circle cx="38" cy="-22" r="8" fill="#eceff1"/>
        <circle cx="28" cy="-30" r="9" fill="#fff"/>
      </g>
      <rect x="125" y="62" width="6" height="22" fill="#000"/>
      <rect x="98" y="68" width="30" height="8" rx="2" fill="#fbc02d" stroke="#000" stroke-width="1"/>
      <text x="113" y="74" text-anchor="middle" font-size="6" font-weight="900" fill="#1b5e20">JOHN DEERE</text>
      <ellipse cx="128" cy="58" rx="5" ry="3" fill="#fff59d" stroke="#000" stroke-width="1.5"/>
    </g>
  `;
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
  // Schweine außen wenn vorhanden
  const schweine = GS.tiere.schwein || 0;
  for (let i = 0; i < schweine; i++) {
    const tx = 1700 + (i%3) * 60;
    const ty = 700 + Math.floor(i/3) * 50;
    const g = svgEl('g', {transform:`translate(${tx},${ty}) scale(1.5)`});
    g.innerHTML = `
      <ellipse cx="15" cy="26" rx="18" ry="4" fill="#000" opacity=".35"/>
      <ellipse cx="15" cy="17" rx="16" ry="9" fill="#f8bbd0" stroke="#c2185b" stroke-width="1.5"/>
      <rect x="5" y="22" width="3" height="6" fill="#f8bbd0" stroke="#c2185b" stroke-width="1"/>
      <rect x="22" y="22" width="3" height="6" fill="#f8bbd0" stroke="#c2185b" stroke-width="1"/>
      <circle cx="2" cy="14" r="6" fill="#f8bbd0" stroke="#c2185b" stroke-width="1.5"/>
      <ellipse cx="-3" cy="15" rx="3.5" ry="3" fill="#ec407a" stroke="#c2185b" stroke-width="1"/>
      <circle cx="0" cy="11" r="1" fill="#000"/>
      <polygon points="-3,7 -1,2 1,7" fill="#f8bbd0" stroke="#c2185b" stroke-width="1"/>
      <polygon points="3,7 5,2 7,7" fill="#f8bbd0" stroke="#c2185b" stroke-width="1"/>
      <path d="M 30 14 Q 35 13 33 17 Q 31 19 35 19" stroke="#c2185b" stroke-width="1.8" fill="none"/>
    `;
    svg.appendChild(g);
  }
}

// === Touch & Welt-Pan ===
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
    if (werkzeugAktiv === 'pan') {
      panning = true;
      container.classList.add('dragging');
      return;
    }
    // Klick auf Gebäude-Element prüfen
    const t = e.target.closest('[data-gebaeude]');
    if (t && werkzeugAktiv !== 'pan') {
      // Erlaube Klick-Tap
      panning = false; dragging = false;
      return;
    }
    dragging = true;
    container.classList.add('dragging');
  });

  container.addEventListener('pointermove', e => {
    if (e.pointerId !== activePointer) return;
    e.preventDefault();
    const p = svgCoordsView(container, e);
    if (panning) {
      const dx = p.x - lastDragPos.x;
      const dy = p.y - lastDragPos.y;
      kameraX -= dx * (W / VIEW_W);
      kameraY -= dy * (H / VIEW_H);
      kameraX = Math.max(VIEW_W/2, Math.min(W - VIEW_W/2, kameraX));
      kameraY = Math.max(VIEW_H/2, Math.min(H - VIEW_H/2, kameraY));
      updateKamera();
      lastDragPos = p;
      return;
    }
    if (!dragging) return;
    // Welt-Koordinaten
    const wp = viewToWelt(p);
    const dx = wp.x - GS.trecker.x;
    const dy = wp.y - GS.trecker.y;
    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) GS.trecker.rot = Math.atan2(dy, dx) * 180 / Math.PI;
    GS.trecker.x = Math.max(50, Math.min(W - 50, wp.x));
    GS.trecker.y = Math.max(50, Math.min(H - 80, wp.y));
    updateTreckerPosition();
    // Kamera mit-bewegen wenn Trecker am Rand
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

  const stop = () => { dragging = false; panning = false; container.classList.remove('dragging'); activePointer = null; saveState(); };
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

    if (werkzeugAktiv === 'pflug' && f.stage === 0) {
      f.fortschritt = (f.fortschritt || 0) + dt / 30;
      if (f.fortschritt >= 100) { f.stage = 1; f.fortschritt = 0; toast('🚜 Gepflügt!'); saveState(); }
      rerenderFeld(fid);
    } else if (werkzeugAktiv === 'maehdrescher' && f.stage === 3) {
      f.fortschritt = (f.fortschritt || 0) + dt / 30;
      if (f.fortschritt >= 100) {
        const cfg = CROP_CONFIG[layout.type];
        GS.inventar[layout.type] = (GS.inventar[layout.type] || 0) + cfg.ertragSaecke;
        f.stage = 0; f.fortschritt = 0; f.plantedAt = null;
        GS.stats.geernet++;
        saveState(); rerenderFelder();
        setTimeout(() => verkaufenMitMathe(layout.type, cfg.ertragSaecke), 300);
      } else rerenderFeld(fid);
    } else if (werkzeugAktiv === 'saemaschine' && f.stage === 1) {
      const cfg = CROP_CONFIG[layout.type];
      if (GS.geld < cfg.saatkosten) { toast('❌ Zu wenig Geld', '#ef5350'); delete feldArbeit[fid]; return; }
      GS.geld -= cfg.saatkosten;
      f.stage = 2; f.plantedAt = Date.now(); f.fortschritt = 0;
      updateGeldText(); saveState(); rerenderFeld(fid);
      toast(`🌱 Gesät! ${Math.round(cfg.wachstumMs * ZEIT_FAKTOR / 1000)}s`);
      delete feldArbeit[fid];
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

function onSaeen(fid) {
  const f = GS.felder[fid];
  const layout = FELD_LAYOUT[fid];
  const cfg = CROP_CONFIG[layout.type];
  if (f.stage !== 1) return;
  if (GS.geld < cfg.saatkosten) { toast('❌ Zu wenig', '#ef5350'); return; }
  GS.geld -= cfg.saatkosten;
  f.stage = 2; f.plantedAt = Date.now(); f.fortschritt = 0;
  updateGeldText(); saveState(); rerenderFeld(fid);
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

// === INNEN-ANSICHTEN für Gebäude ===
function openInnen(gid) {
  if (gid === 'wohnhaus') openWohnhausInnen();
  else if (gid === 'huehnerstall') openHuehnerstallInnen();
  else if (gid === 'kuhstall') openKuhstallInnen();
  else if (gid === 'schweinestall') openSchweinestallInnen();
  else if (gid === 'silo') openSiloInnen();
  else if (gid === 'hofladen') openHofladenInnen();
  else if (gid === 'werkstatt') openWerkstattInnen();
  else if (gid === 'tankstelle') openTankstelleInnen();
  else openGenericInnen(gid);
}

function openWohnhausInnen() {
  const card = el('div', {class:'modal-card'});
  card.appendChild(el('button', {class:'close', onclick: closeModal}, '✕'));
  card.appendChild(el('h2', {}, '🏠 Wohnhaus'));
  const sceneBg = `<svg viewBox="0 0 400 250" style="width:100%;background:linear-gradient(180deg,#fff8e1,#ffe082);border-radius:14px;border:3px solid #5d4037">
    <!-- Boden -->
    <rect x="0" y="180" width="400" height="70" fill="#a1887f"/>
    <line x1="0" y1="180" x2="400" y2="180" stroke="#5d4037" stroke-width="3"/>
    <!-- Bett -->
    <g transform="translate(40,140)">
      <rect x="0" y="0" width="120" height="50" fill="#5d4037" stroke="#000" stroke-width="2"/>
      <rect x="0" y="0" width="120" height="20" fill="#3e2723"/>
      <rect x="5" y="20" width="110" height="25" fill="#42a5f5" stroke="#000" stroke-width="1.5"/>
      <rect x="5" y="40" width="110" height="5" fill="#1976d2"/>
      <rect x="80" y="0" width="35" height="20" fill="#fff" stroke="#000" stroke-width="1.5"/>
    </g>
    <!-- Tisch -->
    <g transform="translate(220,150)">
      <rect x="0" y="0" width="100" height="10" fill="#8d6e63" stroke="#000" stroke-width="2"/>
      <rect x="5" y="10" width="6" height="30" fill="#5d4037"/>
      <rect x="89" y="10" width="6" height="30" fill="#5d4037"/>
      <!-- Lampe -->
      <line x1="50" y1="0" x2="50" y2="-30" stroke="#000" stroke-width="1.5"/>
      <polygon points="35,-30 65,-30 60,-50 40,-50" fill="#fbc02d" stroke="#000" stroke-width="1.5"/>
      <circle cx="50" cy="-15" r="8" fill="#fff59d" opacity=".6"/>
    </g>
    <!-- Bilderrahmen an Wand -->
    <rect x="160" y="40" width="60" height="50" fill="#fff8e1" stroke="#5d4037" stroke-width="3"/>
    <text x="190" y="73" text-anchor="middle" font-size="28">👨‍👩‍👦</text>
    <!-- Fenster -->
    <rect x="280" y="40" width="80" height="60" fill="#90caf9" stroke="#5d4037" stroke-width="3"/>
    <line x1="320" y1="40" x2="320" y2="100" stroke="#5d4037" stroke-width="2"/>
    <line x1="280" y1="70" x2="360" y2="70" stroke="#5d4037" stroke-width="2"/>
  </svg>`;
  card.innerHTML += sceneBg;
  card.appendChild(el('div', {style:{display:'grid', 'grid-template-columns':'1fr 1fr', gap:'10px', 'margin-top':'14px'}},
    aktionBtn('💤 Schlafen (1 Std)', '+50 € Miete', () => { GS.geld += 50; updateGeldText(); saveState(); toast('💤 +50 €'); closeModal(); }),
    aktionBtn('🍳 Kochen', 'Verbraucht Eier+Milch, +Geld', () => {
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
  card.appendChild(el('h2', {}, '🐔 Hühnerstall – Innen'));
  const huehner = GS.tiere.huhn || 0;
  const eier = huehner * 2;
  // Bild der Hühner innen
  let huehnerSvg = '';
  for (let i = 0; i < Math.min(huehner, 12); i++) {
    const cx = 30 + (i % 4) * 90;
    const cy = 60 + Math.floor(i / 4) * 70;
    huehnerSvg += `<g transform="translate(${cx},${cy}) scale(2)">
      <ellipse cx="9" cy="14" rx="9" ry="2" fill="#000" opacity=".3"/>
      <ellipse cx="9" cy="9" rx="8" ry="6" fill="#fff" stroke="#000" stroke-width="1.2"/>
      <circle cx="14" cy="5" r="4.5" fill="#fff" stroke="#000" stroke-width="1.2"/>
      <polygon points="17,4 21,5 17,6" fill="#ffa726" stroke="#000" stroke-width=".5"/>
      <path d="M 11 1 L 12 -1 L 13 1 L 14 -1 L 15 1" fill="#e53935" stroke="#000" stroke-width=".5"/>
      <circle cx="15" cy="4" r="1" fill="#000"/>
    </g>`;
  }
  card.innerHTML += `<svg viewBox="0 0 400 250" style="width:100%;background:#fff8e1;border-radius:14px;border:3px solid #5d4037">
    <rect x="0" y="180" width="400" height="70" fill="#fbc02d"/>
    <text x="20" y="220" font-size="14" font-weight="900" fill="#5d4037">Stroh</text>
    ${huehnerSvg}
    ${huehner === 0 ? '<text x="200" y="120" text-anchor="middle" font-size="20" fill="#666">Keine Hühner!</text>' : ''}
  </svg>`;
  card.appendChild(el('p', {style:{'text-align':'center', 'margin':'10px 0', 'font-size':'15px', 'font-weight':'700'}}, `${huehner} Hühner · ${eier} Eier zum Sammeln`));
  card.appendChild(aktionBtn('🥚 Eier sammeln + verkaufen', `${eier} Eier`, () => {
    if (huehner === 0) { toast('Keine Hühner!', '#ef5350'); return; }
    GS.inventar.eier = (GS.inventar.eier || 0) + eier; saveState(); closeModal();
    verkaufenMitMatheCustom('eier', eier, 0.4, '🥚 Eier verkaufen', '🥚');
  }));
  showModalRaw(card);
}

function openKuhstallInnen() {
  const card = el('div', {class:'modal-card'});
  card.appendChild(el('button', {class:'close', onclick: closeModal}, '✕'));
  card.appendChild(el('h2', {}, '🐮 Kuhstall – Innen'));
  const kuehe = GS.tiere.kuh || 0;
  const milch = kuehe * 8;
  let kuehSvg = '';
  for (let i = 0; i < Math.min(kuehe, 8); i++) {
    const cx = 50 + (i % 4) * 80;
    const cy = 70 + Math.floor(i / 4) * 80;
    kuehSvg += `<g transform="translate(${cx},${cy}) scale(1.6)">
      <ellipse cx="15" cy="28" rx="22" ry="4" fill="#000" opacity=".3"/>
      <ellipse cx="15" cy="18" rx="20" ry="11" fill="#fff" stroke="#000" stroke-width="1.5"/>
      <ellipse cx="6" cy="14" rx="6" ry="4" fill="#1a1a1a"/>
      <ellipse cx="22" cy="13" rx="5" ry="3" fill="#1a1a1a"/>
      <ellipse cx="-3" cy="14" rx="6" ry="5" fill="#fff" stroke="#000" stroke-width="1.5"/>
      <ellipse cx="-3" cy="16" rx="3" ry="2" fill="#ffcdd2"/>
      <path d="M -7 9 Q -8 6 -7 4" stroke="#fbc02d" stroke-width="2" fill="none"/>
      <path d="M 1 9 Q 2 6 1 4" stroke="#fbc02d" stroke-width="2" fill="none"/>
      <ellipse cx="-7" cy="11" rx="2" ry="3" fill="#fff" stroke="#000" stroke-width=".8"/>
      <ellipse cx="1" cy="11" rx="2" ry="3" fill="#1a1a1a"/>
      <circle cx="-5" cy="13" r="1" fill="#000"/>
      <circle cx="-1" cy="13" r="1" fill="#000"/>
    </g>`;
  }
  card.innerHTML += `<svg viewBox="0 0 400 250" style="width:100%;background:#fff8e1;border-radius:14px;border:3px solid #5d4037">
    <rect x="0" y="180" width="400" height="70" fill="#a1887f"/>
    <rect x="0" y="180" width="400" height="10" fill="#5d4037"/>
    ${kuehSvg}
    ${kuehe === 0 ? '<text x="200" y="120" text-anchor="middle" font-size="20" fill="#666">Keine Kühe!</text>' : ''}
  </svg>`;
  card.appendChild(el('p', {style:{'text-align':'center', 'margin':'10px 0', 'font-size':'15px', 'font-weight':'700'}}, `${kuehe} Kühe · ${milch} L Milch`));
  card.appendChild(aktionBtn('🥛 Melken + verkaufen', `${milch} L`, () => {
    if (kuehe === 0) { toast('Keine Kühe!', '#ef5350'); return; }
    GS.inventar.milch = (GS.inventar.milch || 0) + milch; saveState(); closeModal();
    verkaufenMitMatheCustom('milch', milch, 0.5, '🥛 Milch verkaufen', '🥛');
  }));
  showModalRaw(card);
}

function openSchweinestallInnen() {
  const card = el('div', {class:'modal-card'});
  card.appendChild(el('button', {class:'close', onclick: closeModal}, '✕'));
  card.appendChild(el('h2', {}, '🐷 Schweinestall'));
  const schweine = GS.tiere.schwein || 0;
  card.innerHTML += `<svg viewBox="0 0 400 200" style="width:100%;background:#fff8e1;border-radius:14px;border:3px solid #5d4037">
    <rect x="0" y="140" width="400" height="60" fill="#bcaaa4"/>
    ${schweine === 0 ? '<text x="200" y="100" text-anchor="middle" font-size="20" fill="#666">Keine Schweine</text>' : ''}
  </svg>`;
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

function openSiloInnen() {
  const card = el('div', {class:'modal-card'});
  card.appendChild(el('button', {class:'close', onclick: closeModal}, '✕'));
  card.appendChild(el('h2', {}, '🏗️ Silo – Lagerstand'));
  const items = [['weizen','🌾'],['mais','🌽'],['kartoffel','🥔'],['raps','🌻'],['ruebe','🍠'],['hafer','🌾'],['gerste','🌾'],['eier','🥚'],['milch','🥛']];
  for (const [k, em] of items) {
    const menge = GS.inventar[k] || 0;
    const row = el('div', {style:{display:'flex', 'justify-content':'space-between', padding:'10px', background:'#f5f5f5', 'border-radius':'8px', 'margin-bottom':'6px'}},
      el('span', {style:{'font-weight':'700'}}, `${em} ${k}`),
      el('span', {style:{'font-weight':'900', color:'#1b5e20'}}, String(menge))
    );
    card.appendChild(row);
  }
  showModalRaw(card);
}

function openHofladenInnen() {
  const card = el('div', {class:'modal-card'});
  card.appendChild(el('button', {class:'close', onclick: closeModal}, '✕'));
  card.appendChild(el('h2', {}, '🏪 Hofladen – Direktverkauf'));
  card.appendChild(el('p', {style:{'text-align':'center', 'margin-bottom':'14px'}}, 'Verkauf alles auf einmal mit Bonus +20%'));
  card.appendChild(aktionBtn('💰 Komplett-Verkauf', '+20% Bonus', () => {
    let total = 0;
    const preise = {weizen:5, mais:8, kartoffel:15, raps:25, ruebe:35, hafer:12, gerste:14, eier:0.4, milch:0.5};
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

function openWerkstattInnen() {
  const card = el('div', {class:'modal-card'});
  card.appendChild(el('button', {class:'close', onclick: closeModal}, '✕'));
  card.appendChild(el('h2', {}, '🔧 Werkstatt'));
  card.appendChild(el('p', {style:{'text-align':'center'}}, 'Hier kannst du später deinen Trecker tunen.'));
  showModalRaw(card);
}

function openTankstelleInnen() {
  const card = el('div', {class:'modal-card'});
  card.appendChild(el('button', {class:'close', onclick: closeModal}, '✕'));
  card.appendChild(el('h2', {}, '⛽ Tankstelle'));
  card.appendChild(el('p', {style:{'text-align':'center'}}, 'Diesel-Tank füllen kommt bald.'));
  showModalRaw(card);
}

function openGenericInnen(gid) {
  const card = el('div', {class:'modal-card'});
  card.appendChild(el('button', {class:'close', onclick: closeModal}, '✕'));
  card.appendChild(el('h2', {}, GEBAEUDE_LAYOUT[gid]?.name || gid));
  card.appendChild(el('p', {style:{'text-align':'center'}}, 'Innen-Aktionen folgen!'));
  showModalRaw(card);
}

function aktionBtn(label, sublabel, onclick) {
  const btn = el('button', {style:{display:'block', width:'100%', padding:'16px', background:'linear-gradient(180deg,#43a047,#2e7d32)', color:'#fff', border:'none', 'border-radius':'14px', 'font-weight':'900', 'font-size':'17px', cursor:'pointer', 'margin-bottom':'8px', 'box-shadow':'0 4px 0 #1b5e20'}});
  btn.appendChild(el('div', {}, label));
  if (sublabel) btn.appendChild(el('div', {style:{'font-size':'12px', opacity:'.85', 'margin-top':'4px', 'font-weight':'400'}}, sublabel));
  btn.addEventListener('click', onclick);
  return btn;
}

// === Shop ===
let shopTabAktiv = 'gebaeude';
function openShop() {
  const card = el('div', {class:'modal-card'});
  card.appendChild(el('button', {class:'close', onclick: closeModal}, '✕'));
  card.appendChild(el('h2', {}, '🛒 Bauen'));
  const tabs = el('div', {class:'shop-tabs'});
  for (const tab of ['gebaeude','felder','maschinen','tiere']) {
    const btn = el('button', {class:'shop-tab' + (shopTabAktiv === tab ? ' aktiv' : '')}, tab === 'gebaeude' ? '🏚️' : tab === 'felder' ? '🌱' : tab === 'maschinen' ? '🚜' : '🐮');
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
          GS.geld -= item.preis; GS.stats.kaeufe++;
          saveState(); closeModal(); buildUI();
          toast(`🎉 ${item.name}!`);
        } else { kaufen(item.id); }
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
  saveState(); closeModal(); buildUI();
  toast(`🎉 ${item.name}!`, '#43a047');
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
  localStorage.setItem('liam_hof_seen_v4', '1');
  const tip = el('div', {class:'tooltip', style:{top:'50%', left:'50%', transform:'translate(-50%,-50%)', 'max-width':'90%'}},
    el('div', {style:{'font-size':'26px', 'margin-bottom':'10px'}}, '👋 Hallo Liam!'),
    el('div', {style:{'margin-bottom':'8px'}}, 'Wähle Werkzeug unten, ZIEHE Trecker übers Feld zum Pflügen/Ernten.'),
    el('div', {style:{'margin-bottom':'8px'}}, 'Mit ✋ verschiebst du die Hof-Karte!'),
    el('div', {style:{'margin-bottom':'8px'}}, 'Tippe auf Gebäude → drinnen kannst du Aktionen machen!'),
    (function(){const b=el('button',{style:{'margin-top':'14px', padding:'14px 28px', background:'#1b5e20', color:'#fff', border:'none', 'border-radius':'14px', 'font-weight':'900', 'font-size':'16px', cursor:'pointer'}},'Los gehts!');b.addEventListener('click',()=>tip.remove());return b;})()
  );
  document.body.appendChild(tip);
}

function cheatBtn(label, fn) { const b = el('button', {}, label); b.addEventListener('click', fn); return b; }

setInterval(() => {
  let changed = false;
  for (const fid in GS.felder) {
    const f = GS.felder[fid];
    if (f.stage === 2 && f.plantedAt) {
      const cfg = CROP_CONFIG[FELD_LAYOUT[fid]?.type || 'weizen'];
      if (Date.now() - f.plantedAt >= cfg.wachstumMs * ZEIT_FAKTOR) { f.stage = 3; changed = true; }
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
