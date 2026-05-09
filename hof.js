// ============================================================
// LIAMS BAUERNHOF – Phase 1 MVP
// Hay-Day-Style Progression-Game
// ============================================================

const SUPABASE_URL = 'https://nrmqdhcrshyoigesqapm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ybXFkaGNyc2h5b2lnZXNxYXBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MTQ3MjksImV4cCI6MjA4ODk5MDcyOX0.Hw4hg6f9iiJcw92veiEU4-oPGcRX_k5NoLuxHU5_ors';

// === Datenkatalog ===
const SHOP_KATALOG = {
  gebaeude: [
    {id:'huehnerstall', name:'Hühnerstall', em:'🐔', desc:'2 Hühner gratis dabei. Eier sammeln!', preis:200},
    {id:'kuhstall', name:'Kuhstall', em:'🐮', desc:'1 Kuh gratis. Milch melken.', preis:800, requires:'huehnerstall'},
    {id:'schweinestall', name:'Schweinestall', em:'🐷', desc:'Mastvieh', preis:1500, requires:'kuhstall'},
    {id:'silo', name:'Silo', em:'🏗️', desc:'Mehr Lagerplatz', preis:2500, requires:'kuhstall'},
    {id:'hofladen', name:'Hofladen', em:'🏪', desc:'Bessere Verkaufspreise', preis:3500, requires:'silo'},
    {id:'werkstatt', name:'Werkstatt', em:'🔧', desc:'Maschinen tunen', preis:5000, requires:'hofladen'},
    {id:'tankstelle', name:'Tankstelle', em:'⛽', desc:'Diesel günstiger', preis:7000, requires:'werkstatt'},
    {id:'biogas', name:'Biogasanlage', em:'🔋', desc:'Mais → Strom → Geld', preis:25000, requires:'tankstelle'}
  ],
  felder: [
    {id:'feld_mais', name:'2. Maisfeld', em:'🌽', desc:'Mais zum Häckseln', preis:300, requires_money:200},
    {id:'feld_kartoffel', name:'3. Kartoffelfeld', em:'🥔', desc:'Höherer Verkaufspreis', preis:600, requires:'feld_mais'},
    {id:'feld_raps', name:'4. Rapsfeld', em:'🌻', desc:'Bienen lieben Raps!', preis:1200, requires:'feld_kartoffel'},
    {id:'feld_ruebe', name:'5. Rübenfeld', em:'🍠', desc:'Top-Preis', preis:2000, requires:'feld_raps'},
    {id:'feld_wiese', name:'6. Wiese (Heu)', em:'🍃', desc:'Futter für Tiere', preis:1500, requires:'feld_raps'}
  ],
  maschinen: [
    {id:'pflug', name:'Pflug', em:'⛏️', desc:'Felder pflügen', preis:400},
    {id:'saemaschine', name:'Sämaschine', em:'🌱', desc:'Auto-Säen', preis:600, requires:'pflug'},
    {id:'duengerstreuer', name:'Düngerstreuer', em:'💨', desc:'+50 % Ertrag', preis:1000, requires:'saemaschine'},
    {id:'jd6r', name:'John Deere 6R', em:'🚜', desc:'250 PS · stärker', preis:5000, requires:'duengerstreuer'},
    {id:'lexion', name:'Lexion Mähdrescher', em:'🌾', desc:'Große Felder schnell', preis:15000, requires:'jd6r'},
    {id:'kronebigx', name:'Krone Big X', em:'🌽', desc:'Mais häckseln', preis:20000, requires:'lexion'},
    {id:'fendt1050', name:'Fendt 1050', em:'🚜', desc:'517 PS · TOP', preis:35000, requires:'kronebigx'}
  ],
  tiere: [
    {id:'huhn', name:'+ 1 Huhn', em:'🐔', desc:'5 Eier/Tag', preis:50, requires:'huehnerstall', wiederholbar:true, max:8},
    {id:'kuh', name:'+ 1 Kuh', em:'🐮', desc:'8 L Milch/Tag', preis:500, requires:'kuhstall', wiederholbar:true, max:6},
    {id:'schwein', name:'+ 1 Schwein', em:'🐷', desc:'Verkauf in 30 Tagen', preis:300, requires:'schweinestall', wiederholbar:true, max:6},
    {id:'pferd', name:'Pferd', em:'🐴', desc:'Schneller Avatar', preis:2500, requires:'kuhstall'},
    {id:'hund', name:'Hofhund', em:'🐶', desc:'Begleiter', preis:800, requires:'huehnerstall'}
  ]
};

// Crop-Eigenschaften
const CROP_CONFIG = {
  weizen: {em:'🌾', name:'Weizen', wachstumMs:60000, ertragSaecke:8, preisProSack:5, saatkosten:5},
  mais:   {em:'🌽', name:'Mais',   wachstumMs:90000, ertragSaecke:12, preisProSack:8, saatkosten:8},
  kartoffel:{em:'🥔', name:'Kartoffel', wachstumMs:120000, ertragSaecke:10, preisProSack:15, saatkosten:12},
  raps:   {em:'🌻', name:'Raps', wachstumMs:150000, ertragSaecke:6, preisProSack:25, saatkosten:15},
  ruebe:  {em:'🍠', name:'Rübe', wachstumMs:180000, ertragSaecke:8, preisProSack:35, saatkosten:20},
  wiese:  {em:'🍃', name:'Heu', wachstumMs:90000, ertragSaecke:5, preisProSack:10, saatkosten:0}
};

// === Game-State ===
let GS = null;

const DEFAULT_STATE = {
  geld: 50,
  gekauft: ['wohnhaus','feld_weizen','fendt312'],
  felder: { feld_weizen: {type:'weizen', stage:0, plantedAt:null} },
  tiere: {},
  avatar: {x:30, y:65},  // Prozent-Position
  trecker: {x:50, y:65},
  inventar: { weizen:0, mais:0, kartoffel:0, raps:0, ruebe:0, wiese:0, eier:0, milch:0 },
  stats: { geernet:0, kaeufe:0, mathe_richtig:0, mathe_falsch:0 }
};

function loadState() {
  try {
    const raw = localStorage.getItem('liam_hof_v2');
    GS = raw ? Object.assign({}, DEFAULT_STATE, JSON.parse(raw)) : structuredClone(DEFAULT_STATE);
  } catch { GS = structuredClone(DEFAULT_STATE); }
  // Migration: stelle sicher dass alle Felder existieren
  if (!GS.felder) GS.felder = DEFAULT_STATE.felder;
  if (!GS.tiere) GS.tiere = {};
  if (!GS.inventar) GS.inventar = DEFAULT_STATE.inventar;
  if (!GS.stats) GS.stats = DEFAULT_STATE.stats;
  // Wachstum nachholen falls weg-gewesen
  for (const fid in GS.felder) {
    const f = GS.felder[fid];
    if (f.stage === 2 && f.plantedAt) {
      const ms = Date.now() - f.plantedAt;
      const cfg = CROP_CONFIG[f.type];
      if (cfg && ms >= cfg.wachstumMs) f.stage = 3; // reif
    }
  }
}

function saveState() {
  localStorage.setItem('liam_hof_v2', JSON.stringify(GS));
  // Auch zu Supabase syncen (debounced)
  clearTimeout(saveState._t);
  saveState._t = setTimeout(syncToSupabase, 2000);
}

async function syncToSupabase() {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/lernapp_state?profile_key=eq.liam`, {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({ char_outfits: { hof_v2: GS } })
    });
  } catch (e) {}
}

// === Utility ===
const root = document.getElementById('hof-app');
function el(tag, attrs={}, ...children) {
  const e = document.createElementNS('http://www.w3.org/1999/xhtml', tag);
  for (const k in attrs) {
    if (k === 'class') e.className = attrs[k];
    else if (k === 'onclick') e.addEventListener('click', attrs[k]);
    else e.setAttribute(k, attrs[k]);
  }
  for (const c of children) {
    if (c == null) continue;
    e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return e;
}
function svgEl(tag, attrs={}, ...children) {
  const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const k in attrs) {
    if (k === 'onclick') e.addEventListener('click', attrs[k]);
    else e.setAttribute(k, attrs[k]);
  }
  for (const c of children) {
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

function formatGeld(g) {
  return g.toLocaleString('de-DE') + ' €';
}

// === Hauptrender ===
function render() {
  clear();
  // Topbar
  const top = el('div', {class:'topbar'},
    el('button', {class:'back', onclick: zurueckZurApp}, '⬅️'),
    el('div', {class:'geld'},
      el('div', {class:'coin'}, '€'),
      el('span', {}, formatGeld(GS.geld))
    ),
    el('button', {class:'shop-btn', onclick: openShop}, '🛒 BAUEN')
  );
  root.appendChild(top);

  // Spielfläche
  const sp = el('div', {class:'spielflaeche', id:'spielflaeche'});
  root.appendChild(sp);
  renderSzene(sp);
}

function zurueckZurApp() {
  // Versuche zurück zur Lernapp
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({type:'hof-close'}, '*');
  } else {
    window.location.href = 'liam.html';
  }
}

function renderSzene(container) {
  container.innerHTML = '';
  const svg = svgEl('svg', {viewBox:'0 0 1000 700', preserveAspectRatio:'xMidYMid meet'});

  // Berge Hintergrund
  const berge = svgEl('g', {opacity:'.4'});
  berge.appendChild(svgEl('polygon', {points:'0,200 130,80 260,200', fill:'#7986cb'}));
  berge.appendChild(svgEl('polygon', {points:'500,200 640,90 780,200', fill:'#9fa8da'}));
  svg.appendChild(berge);
  // Sonne
  const sonne = svgEl('g', {transform:'translate(880,80)'});
  sonne.appendChild(svgEl('circle', {r:'28', fill:'#fff176'}));
  sonne.appendChild(svgEl('circle', {r:'22', fill:'#ffeb3b'}));
  svg.appendChild(sonne);
  // Wolken
  const wolke = svgEl('g', {fill:'#fff', opacity:'.95'});
  wolke.appendChild(svgEl('ellipse', {cx:'200', cy:'80', rx:'28', ry:'12'}));
  wolke.appendChild(svgEl('ellipse', {cx:'220', cy:'74', rx:'20', ry:'11'}));
  svg.appendChild(wolke);
  // Baum
  const baum = svgEl('g', {transform:'translate(80,250)'});
  baum.appendChild(svgEl('ellipse', {cx:'0', cy:'60', rx:'22', ry:'6', fill:'#000', opacity:'.3'}));
  baum.appendChild(svgEl('rect', {x:'-4', y:'35', width:'8', height:'25', fill:'#5d4037'}));
  baum.appendChild(svgEl('circle', {cx:'0', cy:'20', r:'22', fill:'#2e7d32'}));
  baum.appendChild(svgEl('circle', {cx:'-12', cy:'25', r:'14', fill:'#388e3c'}));
  baum.appendChild(svgEl('circle', {cx:'12', cy:'25', r:'14', fill:'#388e3c'}));
  svg.appendChild(baum);

  // Wohnhaus (immer da)
  drawWohnhaus(svg, 100, 200);

  // Hühnerstall (wenn gekauft)
  if (GS.gekauft.includes('huehnerstall')) {
    drawHuehnerstall(svg, 380, 230);
  } else {
    drawBauplatz(svg, 380, 230, 160, 100, 'Hühnerstall', 'huehnerstall', 200);
  }

  // Kuhstall (wenn gekauft)
  if (GS.gekauft.includes('kuhstall')) {
    drawKuhstall(svg, 600, 200);
  } else if (GS.gekauft.includes('huehnerstall')) {
    drawBauplatz(svg, 600, 200, 180, 130, 'Kuhstall', 'kuhstall', 800);
  }

  // Silo (wenn gekauft)
  if (GS.gekauft.includes('silo')) {
    drawSilo(svg, 820, 200);
  }

  // === Felder ===
  // Feld 1: Weizen (immer)
  drawFeld(svg, 'feld_weizen', 80, 400, 240, 80);

  // Feld 2: Mais (wenn gekauft)
  if (GS.gekauft.includes('feld_mais')) {
    drawFeld(svg, 'feld_mais', 340, 400, 240, 80);
  } else {
    drawBauplatz(svg, 340, 400, 240, 80, '2. Feld', 'feld_mais', 300);
  }
  // Feld 3
  if (GS.gekauft.includes('feld_kartoffel')) {
    drawFeld(svg, 'feld_kartoffel', 600, 400, 240, 80);
  } else if (GS.gekauft.includes('feld_mais')) {
    drawBauplatz(svg, 600, 400, 240, 80, '3. Feld', 'feld_kartoffel', 600);
  }
  // Feld 4 (untere Reihe)
  if (GS.gekauft.includes('feld_raps')) {
    drawFeld(svg, 'feld_raps', 80, 510, 240, 80);
  } else if (GS.gekauft.includes('feld_kartoffel')) {
    drawBauplatz(svg, 80, 510, 240, 80, '4. Feld', 'feld_raps', 1200);
  }
  // Feld 5
  if (GS.gekauft.includes('feld_ruebe')) {
    drawFeld(svg, 'feld_ruebe', 340, 510, 240, 80);
  } else if (GS.gekauft.includes('feld_raps')) {
    drawBauplatz(svg, 340, 510, 240, 80, '5. Feld', 'feld_ruebe', 2000);
  }
  // Feld 6
  if (GS.gekauft.includes('feld_wiese')) {
    drawFeld(svg, 'feld_wiese', 600, 510, 240, 80);
  } else if (GS.gekauft.includes('feld_raps')) {
    drawBauplatz(svg, 600, 510, 240, 80, '6. Feld', 'feld_wiese', 1500);
  }

  // Trecker
  drawTrecker(svg);

  // Avatar
  drawAvatar(svg);

  // Tiere
  drawTiere(svg);

  container.appendChild(svg);

  // Touch-Steuerung
  setupTouch(container);

  // Erst-Hilfe-Tooltip beim 1. Mal
  if (!localStorage.getItem('liam_hof_seen_hilfe') && Object.keys(GS.felder).length === 1) {
    showHilfe();
  }
}

// === GEBÄUDE-RENDERER ===
function drawWohnhaus(svg, x, y) {
  const g = svgEl('g', {transform:`translate(${x},${y})`, class:'gebaeude'});
  g.appendChild(svgEl('ellipse', {cx:'80', cy:'166', rx:'70', ry:'5', fill:'#000', opacity:'.3'}));
  g.appendChild(svgEl('rect', {x:'10', y:'150', width:'140', height:'14', fill:'#bcaaa4'}));
  g.appendChild(svgEl('rect', {x:'10', y:'80', width:'140', height:'70', fill:'#fff8e1', stroke:'#5d4037', 'stroke-width':'2'}));
  g.appendChild(svgEl('rect', {x:'10', y:'115', width:'140', height:'3', fill:'#5d4037'}));
  g.appendChild(svgEl('rect', {x:'78', y:'80', width:'4', height:'70', fill:'#5d4037'}));
  g.appendChild(svgEl('rect', {x:'22', y:'90', width:'30', height:'20', fill:'#42a5f5', stroke:'#5d4037', 'stroke-width':'2'}));
  g.appendChild(svgEl('rect', {x:'108', y:'90', width:'30', height:'20', fill:'#42a5f5', stroke:'#5d4037', 'stroke-width':'2'}));
  g.appendChild(svgEl('rect', {x:'68', y:'120', width:'24', height:'30', fill:'#5d4037'}));
  g.appendChild(svgEl('circle', {cx:'88', cy:'137', r:'1.5', fill:'#fbc02d'}));
  g.appendChild(svgEl('polygon', {points:'0,80 80,30 160,80', fill:'#c62828', stroke:'#3e2723', 'stroke-width':'2'}));
  g.appendChild(svgEl('rect', {x:'30', y:'45', width:'12', height:'25', fill:'#a1887f'}));
  // Rauch
  const rauch = svgEl('g', {opacity:'.7'});
  rauch.appendChild(svgEl('circle', {cx:'37', cy:'35', r:'5', fill:'#eceff1'}));
  rauch.appendChild(svgEl('circle', {cx:'42', cy:'25', r:'7', fill:'#eceff1'}));
  g.appendChild(rauch);
  svg.appendChild(g);
}

function drawHuehnerstall(svg, x, y) {
  const g = svgEl('g', {transform:`translate(${x},${y})`, class:'gebaeude'});
  g.appendChild(svgEl('ellipse', {cx:'80', cy:'126', rx:'65', ry:'5', fill:'#000', opacity:'.3'}));
  g.appendChild(svgEl('rect', {x:'15', y:'110', width:'130', height:'14', fill:'#bcaaa4'}));
  g.appendChild(svgEl('rect', {x:'15', y:'60', width:'130', height:'50', fill:'#a1887f', stroke:'#3e2723', 'stroke-width':'2'}));
  g.appendChild(svgEl('rect', {x:'70', y:'85', width:'24', height:'25', fill:'#3e2723'}));
  g.appendChild(svgEl('polygon', {points:'5,60 80,25 155,60', fill:'#c62828', stroke:'#3e2723', 'stroke-width':'2'}));
  // Hühner draußen
  const huehner = GS.tiere.huhn || 0;
  for (let i = 0; i < Math.min(huehner, 4); i++) {
    const hg = svgEl('g', {transform:`translate(${150 + i*15},${110})`});
    hg.appendChild(svgEl('ellipse', {cx:'6', cy:'5', rx:'5', ry:'4', fill:'#fff', stroke:'#3e2723', 'stroke-width':'.5'}));
    hg.appendChild(svgEl('circle', {cx:'10', cy:'2', r:'3', fill:'#fff'}));
    hg.appendChild(svgEl('polygon', {points:'12,1 14,2 12,3', fill:'#ffa726'}));
    hg.appendChild(svgEl('path', {d:'M 9 -1 L 10 -3 L 11 -1', stroke:'#e53935', 'stroke-width':'.8', fill:'none'}));
    g.appendChild(hg);
  }
  g.addEventListener('click', () => openTierMenu('huehnerstall'));
  svg.appendChild(g);
}

function drawKuhstall(svg, x, y) {
  const g = svgEl('g', {transform:`translate(${x},${y})`, class:'gebaeude'});
  g.appendChild(svgEl('ellipse', {cx:'90', cy:'166', rx:'78', ry:'6', fill:'#000', opacity:'.3'}));
  g.appendChild(svgEl('rect', {x:'10', y:'150', width:'160', height:'16', fill:'#bcaaa4'}));
  g.appendChild(svgEl('rect', {x:'10', y:'80', width:'160', height:'70', fill:'#a1887f', stroke:'#3e2723', 'stroke-width':'2'}));
  g.appendChild(svgEl('line', {x1:'10', y1:'115', x2:'170', y2:'115', stroke:'#3e2723', 'stroke-width':'2'}));
  g.appendChild(svgEl('line', {x1:'90', y1:'80', x2:'90', y2:'150', stroke:'#3e2723', 'stroke-width':'2'}));
  g.appendChild(svgEl('rect', {x:'70', y:'120', width:'40', height:'30', fill:'#3e2723'}));
  g.appendChild(svgEl('polygon', {points:'0,80 90,20 180,80', fill:'#c62828', stroke:'#3e2723', 'stroke-width':'2'}));
  g.addEventListener('click', () => openTierMenu('kuhstall'));
  svg.appendChild(g);
}

function drawSilo(svg, x, y) {
  const g = svgEl('g', {transform:`translate(${x},${y})`, class:'gebaeude'});
  g.appendChild(svgEl('ellipse', {cx:'30', cy:'186', rx:'30', ry:'5', fill:'#000', opacity:'.3'}));
  g.appendChild(svgEl('rect', {x:'5', y:'60', width:'50', height:'120', fill:'#cfd8dc', stroke:'#78909c', 'stroke-width':'2'}));
  g.appendChild(svgEl('ellipse', {cx:'30', cy:'60', rx:'25', ry:'5', fill:'#90a4ae'}));
  g.appendChild(svgEl('path', {d:'M 5 60 Q 30 25 55 60 Z', fill:'#b0bec5', stroke:'#78909c', 'stroke-width':'2'}));
  g.appendChild(svgEl('text', {x:'30', y:'130', 'text-anchor':'middle', 'font-size':'10', 'font-weight':'900', fill:'#3e2723'}, 'FUTTER'));
  svg.appendChild(g);
}

function drawBauplatz(svg, x, y, w, h, label, itemId, preis) {
  const g = svgEl('g', {transform:`translate(${x},${y})`});
  const bauplatzRect = svgEl('rect', {
    x:'0', y:'0', width:String(w), height:String(h),
    fill:'rgba(255,255,255,.1)', stroke:'#fff', 'stroke-width':'3',
    class:'bauplatz', rx:'8'
  });
  bauplatzRect.addEventListener('click', () => kaufen(itemId));
  g.appendChild(bauplatzRect);
  g.appendChild(svgEl('text', {
    x:String(w/2), y:String(h/2 - 6), 'text-anchor':'middle',
    fill:'#fff', 'font-size':'14', 'font-weight':'700'
  }, '🏚️ ' + label));
  g.appendChild(svgEl('text', {
    x:String(w/2), y:String(h/2 + 14), 'text-anchor':'middle',
    fill:'#fff', 'font-size':'13'
  }, formatGeld(preis)));
  g.appendChild(svgEl('text', {
    x:String(w/2), y:String(h/2 + 30), 'text-anchor':'middle',
    fill:'rgba(255,255,255,.8)', 'font-size':'10'
  }, GS.geld >= preis ? 'tippen zum bauen!' : 'erst sparen…'));
  svg.appendChild(g);
}

function drawFeld(svg, fid, x, y, w, h) {
  let f = GS.felder[fid];
  if (!f) {
    // Default: Weizen
    const cropTypeMap = {feld_weizen:'weizen', feld_mais:'mais', feld_kartoffel:'kartoffel', feld_raps:'raps', feld_ruebe:'ruebe', feld_wiese:'wiese'};
    GS.felder[fid] = { type: cropTypeMap[fid] || 'weizen', stage: 0, plantedAt: null };
    f = GS.felder[fid];
  }
  const g = svgEl('g', {transform:`translate(${x},${y})`});

  // Hintergrund je nach Stage
  let bg;
  if (f.stage === 0) bg = '#5d4037'; // leer/ungepflügt
  else if (f.stage === 1) bg = '#6d4c41'; // gepflügt
  else if (f.stage === 2) bg = '#9ccc65'; // gesät/wächst
  else bg = '#fdd835'; // reif (gelb)

  const isReif = f.stage === 3;
  const rect = svgEl('rect', {
    x:'0', y:'0', width:String(w), height:String(h),
    fill:bg, stroke:'#3e2723', 'stroke-width':'2',
    class: 'feld' + (isReif ? ' reif' : ''), rx:'4'
  });
  rect.addEventListener('click', () => onFeldClick(fid));
  g.appendChild(rect);

  // Detail je nach Stage
  if (f.stage === 0) {
    // Steine
    g.appendChild(svgEl('ellipse', {cx:String(w*0.3), cy:String(h*0.5), rx:'4', ry:'3', fill:'#a1887f'}));
    g.appendChild(svgEl('ellipse', {cx:String(w*0.7), cy:String(h*0.4), rx:'5', ry:'3', fill:'#a1887f'}));
    g.appendChild(svgEl('text', {x:String(w/2), y:String(h-8), 'text-anchor':'middle', fill:'#fff', 'font-size':'11', 'font-weight':'700'}, 'leer · pflügen'));
  } else if (f.stage === 1) {
    // Furchen
    for (let i = 1; i < 5; i++) {
      g.appendChild(svgEl('line', {x1:'5', y1:String(h*i/5), x2:String(w-5), y2:String(h*i/5), stroke:'#3e2723', 'stroke-width':'1', opacity:'.4'}));
    }
    const cfg = CROP_CONFIG[f.type];
    g.appendChild(svgEl('text', {x:String(w/2), y:String(h-8), 'text-anchor':'middle', fill:'#fff', 'font-size':'11', 'font-weight':'700'}, `gepflügt · säen (${cfg.saatkosten}€)`));
  } else if (f.stage === 2 || f.stage === 3) {
    // Pflanzen zeichnen
    drawPflanzen(g, f.type, w, h, f.stage === 3);
    // Wachstums-Balken
    if (f.stage === 2 && f.plantedAt) {
      const cfg = CROP_CONFIG[f.type];
      const elapsed = Date.now() - f.plantedAt;
      const pct = Math.min(100, elapsed / cfg.wachstumMs * 100);
      g.appendChild(svgEl('rect', {x:'5', y:String(h-10), width:String(w-10), height:'5', fill:'rgba(0,0,0,.4)', rx:'2'}));
      g.appendChild(svgEl('rect', {x:'5', y:String(h-10), width:String((w-10)*pct/100), height:'5', fill:'#fbc02d', rx:'2'}));
    }
    if (f.stage === 3) {
      const cfg = CROP_CONFIG[f.type];
      g.appendChild(svgEl('text', {x:String(w/2), y:String(h-4), 'text-anchor':'middle', fill:'#3e2723', 'font-size':'12', 'font-weight':'900'}, `🌾 REIF! Ernten = ${cfg.ertragSaecke} Säcke`));
    }
  }

  svg.appendChild(g);
}

function drawPflanzen(g, type, w, h, reif) {
  const cfg = CROP_CONFIG[type];
  const cols = 12, rows = 2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const px = (c+1) * w / (cols+1);
      const py = h * 0.3 + r * h * 0.3;
      if (type === 'weizen') {
        g.appendChild(svgEl('line', {x1:String(px), y1:String(py+15), x2:String(px), y2:String(py-5), stroke:'#558b2f', 'stroke-width':'1.2'}));
        g.appendChild(svgEl('ellipse', {cx:String(px), cy:String(py-8), rx:'2.5', ry:'5', fill: reif?'#fdd835':'#9ccc65'}));
      } else if (type === 'mais') {
        g.appendChild(svgEl('line', {x1:String(px), y1:String(py+15), x2:String(px), y2:String(py-10), stroke:'#33691e', 'stroke-width':'2'}));
        g.appendChild(svgEl('ellipse', {cx:String(px), cy:String(py-13), rx:'3', ry:'8', fill: reif?'#fbc02d':'#aed581'}));
      } else if (type === 'kartoffel') {
        g.appendChild(svgEl('circle', {cx:String(px), cy:String(py-2), r:'5', fill: reif?'#7cb342':'#aed581'}));
        if (reif) g.appendChild(svgEl('circle', {cx:String(px), cy:String(py-7), r:'2', fill:'#fff'}));
      } else if (type === 'raps') {
        g.appendChild(svgEl('line', {x1:String(px), y1:String(py+15), x2:String(px), y2:String(py-5), stroke:'#558b2f', 'stroke-width':'1.5'}));
        g.appendChild(svgEl('circle', {cx:String(px), cy:String(py-8), r:'3', fill: reif?'#fdd835':'#9ccc65'}));
      } else if (type === 'ruebe') {
        g.appendChild(svgEl('circle', {cx:String(px), cy:String(py), r:'5', fill: reif?'#9c27b0':'#aed581'}));
        g.appendChild(svgEl('path', {d:`M ${px-3} ${py-5} L ${px-5} ${py-12} M ${px+3} ${py-5} L ${px+5} ${py-12} M ${px} ${py-7} L ${px} ${py-14}`, stroke:'#558b2f', 'stroke-width':'1.5', fill:'none'}));
      } else if (type === 'wiese') {
        g.appendChild(svgEl('line', {x1:String(px-2), y1:String(py+12), x2:String(px-2), y2:String(py-4), stroke:'#558b2f', 'stroke-width':'1.2'}));
        g.appendChild(svgEl('line', {x1:String(px), y1:String(py+12), x2:String(px), y2:String(py-6), stroke:'#558b2f', 'stroke-width':'1.2'}));
        g.appendChild(svgEl('line', {x1:String(px+2), y1:String(py+12), x2:String(px+2), y2:String(py-4), stroke:'#558b2f', 'stroke-width':'1.2'}));
      }
    }
  }
}

function drawTrecker(svg) {
  const x = GS.trecker.x * 10; // % zu px
  const y = GS.trecker.y * 7;
  const g = svgEl('g', {transform:`translate(${x-60},${y-40}) scale(0.5)`, class:'trecker'});
  g.appendChild(svgEl('ellipse', {cx:'110', cy:'125', rx:'95', ry:'6', fill:'#000', opacity:'.3'}));
  g.appendChild(svgEl('rect', {x:'64', y:'20', width:'8', height:'40', fill:'#37474f'}));
  g.appendChild(svgEl('rect', {x:'20', y:'55', width:'65', height:'35', rx:'4', fill:'#43a047', stroke:'#0d3010', 'stroke-width':'2'}));
  g.appendChild(svgEl('rect', {x:'80', y:'35', width:'55', height:'55', rx:'5', fill:'#43a047', stroke:'#0d3010', 'stroke-width':'2'}));
  g.appendChild(svgEl('rect', {x:'135', y:'60', width:'35', height:'30', rx:'3', fill:'#43a047', stroke:'#0d3010', 'stroke-width':'2'}));
  g.appendChild(svgEl('rect', {x:'85', y:'42', width:'45', height:'22', rx:'2', fill:'#90caf9', stroke:'#0d3010', 'stroke-width':'1.5'}));
  g.appendChild(svgEl('rect', {x:'78', y:'32', width:'59', height:'6', rx:'2', fill:'#212121'}));
  g.appendChild(svgEl('rect', {x:'35', y:'60', width:'42', height:'6', fill:'#fbc02d'}));
  g.appendChild(svgEl('text', {x:'56', y:'65', 'text-anchor':'middle', 'font-size':'5', 'font-weight':'900', fill:'#1b5e20'}, 'JOHN DEERE'));
  g.appendChild(svgEl('circle', {cx:'40', cy:'100', r:'14', fill:'#212121'}));
  g.appendChild(svgEl('circle', {cx:'40', cy:'100', r:'9', fill:'#fbc02d'}));
  g.appendChild(svgEl('circle', {cx:'135', cy:'100', r:'22', fill:'#212121'}));
  g.appendChild(svgEl('circle', {cx:'135', cy:'100', r:'13', fill:'#fbc02d'}));
  g.dataset.draggable = 'trecker';
  svg.appendChild(g);
}

function drawAvatar(svg) {
  const x = GS.avatar.x * 10;
  const y = GS.avatar.y * 7;
  const g = svgEl('g', {transform:`translate(${x},${y}) scale(1.5)`, class:'avatar'});
  g.appendChild(svgEl('ellipse', {cx:'10', cy:'42', rx:'12', ry:'3', fill:'#000', opacity:'.35'}));
  g.appendChild(svgEl('rect', {x:'4', y:'32', width:'5', height:'10', fill:'#1565c0'}));
  g.appendChild(svgEl('rect', {x:'11', y:'32', width:'5', height:'10', fill:'#1565c0'}));
  g.appendChild(svgEl('rect', {x:'3', y:'14', width:'14', height:'20', fill:'#d84315'}));
  g.appendChild(svgEl('rect', {x:'6', y:'20', width:'8', height:'14', fill:'#1565c0'}));
  g.appendChild(svgEl('circle', {cx:'10', cy:'8', r:'7', fill:'#ffcc80'}));
  g.appendChild(svgEl('ellipse', {cx:'10', cy:'3', rx:'13', ry:'3', fill:'#fdd835'}));
  g.appendChild(svgEl('ellipse', {cx:'10', cy:'2', rx:'7', ry:'3', fill:'#fbc02d'}));
  g.appendChild(svgEl('circle', {cx:'7.5', cy:'8', r:'1', fill:'#000'}));
  g.appendChild(svgEl('circle', {cx:'12.5', cy:'8', r:'1', fill:'#000'}));
  g.appendChild(svgEl('path', {d:'M 7 11 Q 10 13 13 11', stroke:'#3e2723', 'stroke-width':'1.2', fill:'none', 'stroke-linecap':'round'}));
  g.dataset.draggable = 'avatar';
  svg.appendChild(g);
}

function drawTiere(svg) {
  // Hühner verstreut
  const huehner = GS.tiere.huhn || 0;
  for (let i = 4; i < huehner; i++) {
    const tx = 920 - (i-4) * 20;
    const ty = 350 + (i % 2) * 30;
    const g = svgEl('g', {transform:`translate(${tx},${ty})`});
    g.appendChild(svgEl('ellipse', {cx:'6', cy:'5', rx:'5', ry:'4', fill:'#fff', stroke:'#3e2723', 'stroke-width':'.5'}));
    g.appendChild(svgEl('circle', {cx:'10', cy:'2', r:'3', fill:'#fff'}));
    g.appendChild(svgEl('polygon', {points:'12,1 14,2 12,3', fill:'#ffa726'}));
    svg.appendChild(g);
  }
  // Kühe
  const kuehe = GS.tiere.kuh || 0;
  for (let i = 0; i < kuehe; i++) {
    const tx = 870 - i * 50;
    const ty = 450;
    const g = svgEl('g', {transform:`translate(${tx},${ty})`, class:'tier'});
    g.appendChild(svgEl('ellipse', {cx:'15', cy:'18', rx:'18', ry:'10', fill:'#fff', stroke:'#3e2723', 'stroke-width':'1'}));
    g.appendChild(svgEl('ellipse', {cx:'8', cy:'15', rx:'5', ry:'4', fill:'#3e2723'}));
    g.appendChild(svgEl('ellipse', {cx:'-3', cy:'14', rx:'5', ry:'4', fill:'#fff', stroke:'#3e2723'}));
    g.appendChild(svgEl('ellipse', {cx:'-3', cy:'16', rx:'2.5', ry:'1.5', fill:'#ffcdd2'}));
    g.addEventListener('click', () => onTierClick('kuh'));
    svg.appendChild(g);
  }
}

// === INTERAKTION ===
function onFeldClick(fid) {
  const f = GS.felder[fid];
  if (!f) return;
  if (f.stage === 0) {
    // Pflügen (kostenlos)
    f.stage = 1;
    saveState();
    render();
    toast('🚜 Feld gepflügt!');
  } else if (f.stage === 1) {
    // Säen (kostet)
    const cfg = CROP_CONFIG[f.type];
    if (GS.geld < cfg.saatkosten) {
      toast('❌ Nicht genug Geld zum Säen', '#e53935');
      return;
    }
    GS.geld -= cfg.saatkosten;
    f.stage = 2;
    f.plantedAt = Date.now();
    saveState();
    render();
    toast(`🌱 Gesät! Wächst ${Math.round(cfg.wachstumMs/1000)} Sek`);
    // Auto-Update wenn fertig
    setTimeout(() => {
      if (f.stage === 2 && f.plantedAt && (Date.now() - f.plantedAt) >= cfg.wachstumMs) {
        f.stage = 3;
        saveState();
        render();
      }
    }, cfg.wachstumMs + 100);
  } else if (f.stage === 3) {
    // Ernten
    const cfg = CROP_CONFIG[f.type];
    GS.inventar[f.type] = (GS.inventar[f.type] || 0) + cfg.ertragSaecke;
    f.stage = 0;
    f.plantedAt = null;
    GS.stats.geernet++;
    saveState();
    render();
    // Mathe-Aufgabe für Verkauf
    setTimeout(() => verkaufenMitMathe(f.type, cfg.ertragSaecke), 300);
  } else {
    // Wächst noch
    const cfg = CROP_CONFIG[f.type];
    const elapsed = Date.now() - f.plantedAt;
    const restSek = Math.max(0, Math.round((cfg.wachstumMs - elapsed)/1000));
    toast(`⏳ Noch ${restSek} Sekunden bis reif`);
  }
}

function verkaufenMitMathe(cropType, saecke) {
  const cfg = CROP_CONFIG[cropType];
  const richtigerPreis = saecke * cfg.preisProSack;
  // Generiere 4 Antworten
  const opts = new Set([richtigerPreis]);
  while (opts.size < 4) {
    const fake = richtigerPreis + (Math.random() < 0.5 ? -1 : 1) * (5 + Math.floor(Math.random() * 30));
    if (fake > 0) opts.add(fake);
  }
  const optList = [...opts].sort(() => Math.random() - 0.5);

  showModal(
    el('div', {class:'mathe-aufgabe'},
      el('h2', {}, '🌾 Ernte verkaufen!'),
      el('div', {style:'background:#fff9c4;padding:14px;border-radius:10px;margin-bottom:14px'},
        el('div', {style:'font-size:48px'}, cfg.em),
        el('div', {style:'font-weight:900;font-size:18px;margin-top:8px'}, `${saecke} Säcke ${cfg.name}`)
      ),
      el('div', {class:'visual'}, `${saecke} × ${cfg.preisProSack} €`),
      el('div', {class:'frage'}, `Wie viel Geld bekommst du?`),
      el('div', {class:'opt'},
        ...optList.map(o => {
          const btn = el('button', {}, formatGeld(o));
          btn.addEventListener('click', () => {
            const correct = o === richtigerPreis;
            btn.classList.add(correct ? 'correct' : 'wrong');
            if (correct) {
              GS.geld += richtigerPreis;
              GS.inventar[cropType] -= saecke;
              GS.stats.mathe_richtig++;
              saveState();
              setTimeout(() => {
                closeModal();
                render();
                toast(`✅ +${formatGeld(richtigerPreis)}!`, '#4caf50');
              }, 800);
            } else {
              const halbe = Math.floor(richtigerPreis / 2);
              GS.geld += halbe;
              GS.inventar[cropType] -= saecke;
              GS.stats.mathe_falsch++;
              saveState();
              setTimeout(() => {
                closeModal();
                render();
                toast(`❌ Falsch. Nur halb: +${formatGeld(halbe)}`, '#ff7043');
              }, 1200);
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
    // Milch melken
    const kuehe = GS.tiere.kuh || 0;
    const milchProKuh = 8;
    const total = kuehe * milchProKuh;
    GS.inventar.milch = (GS.inventar.milch || 0) + total;
    saveState();
    setTimeout(() => verkaufenMitMatheCustom('milch', total, 0.5, 'Milch verkaufen', '🥛'), 300);
  }
}

function verkaufenMitMatheCustom(item, menge, preisProEinheit, titel, em) {
  const richtigerPreis = Math.round(menge * preisProEinheit * 100); // Cent
  const opts = new Set([richtigerPreis]);
  while (opts.size < 4) {
    const fake = richtigerPreis + (Math.random() < 0.5 ? -1 : 1) * (50 + Math.floor(Math.random() * 200));
    if (fake > 0) opts.add(fake);
  }
  const optList = [...opts].sort(() => Math.random() - 0.5);
  showModal(
    el('div', {class:'mathe-aufgabe'},
      el('h2', {}, titel),
      el('div', {class:'visual', style:'font-size:48px'}, em),
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
              GS.inventar[item] -= menge;
              GS.stats.mathe_richtig++;
              saveState();
              setTimeout(() => { closeModal(); render(); toast(`✅ +${Math.round(richtigerPreis/100)}€`, '#4caf50'); }, 800);
            } else {
              GS.geld += Math.round(richtigerPreis / 200);
              GS.inventar[item] -= menge;
              GS.stats.mathe_falsch++;
              saveState();
              setTimeout(() => { closeModal(); render(); toast(`❌ Halber Preis`, '#ff7043'); }, 1200);
            }
          });
          return btn;
        })
      )
    )
  );
}

// === SHOP ===
let shopTabAktiv = 'gebaeude';
function openShop() {
  const card = el('div', {class:'modal-card'});
  card.appendChild(el('button', {class:'close', onclick: closeModal}, '✕'));
  card.appendChild(el('h2', {}, '🛒 Bauen & Kaufen'));

  const tabs = el('div', {class:'shop-tabs'});
  ['gebaeude','felder','maschinen','tiere'].forEach(tab => {
    const btn = el('button', {class:'shop-tab' + (shopTabAktiv === tab ? ' aktiv' : '')},
      tab === 'gebaeude' ? '🏚️ Gebäude' : tab === 'felder' ? '🌱 Felder' : tab === 'maschinen' ? '🚜 Maschinen' : '🐮 Tiere'
    );
    btn.addEventListener('click', () => { shopTabAktiv = tab; closeModal(); openShop(); });
    tabs.appendChild(btn);
  });
  card.appendChild(tabs);

  const grid = el('div', {class:'shop-grid'});
  for (const item of SHOP_KATALOG[shopTabAktiv]) {
    const owned = GS.gekauft.includes(item.id);
    const ownedCount = item.wiederholbar ? (GS.tiere[item.id.replace('feld_','')] || 0) : 0;
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
          if (ownedCount >= (item.max || 999)) { toast('Max erreicht', '#ff7043'); return; }
          if (GS.geld < item.preis) { toast('Nicht genug Geld', '#e53935'); return; }
          const tierKey = item.id;
          GS.tiere[tierKey] = (GS.tiere[tierKey] || 0) + 1;
          GS.geld -= item.preis;
          GS.stats.kaeufe++;
          saveState();
          closeModal();
          render();
          toast(`🎉 ${item.name} gekauft!`);
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
  if (GS.geld < item.preis) {
    toast(`❌ Brauchst noch ${formatGeld(item.preis - GS.geld)}`, '#e53935');
    return;
  }
  if (item.requires && !GS.gekauft.includes(item.requires)) {
    toast('🔒 Erst andere Sachen bauen', '#ff7043');
    return;
  }
  GS.geld -= item.preis;
  GS.gekauft.push(itemId);
  GS.stats.kaeufe++;
  // Bei Hühnerstall: 2 Hühner gratis dazu
  if (itemId === 'huehnerstall') GS.tiere.huhn = (GS.tiere.huhn || 0) + 2;
  if (itemId === 'kuhstall') GS.tiere.kuh = (GS.tiere.kuh || 0) + 1;
  saveState();
  closeModal();
  render();
  toast(`🎉 ${item.name} gebaut!`, '#4caf50');
}

function openTierMenu(stallTyp) {
  const card = el('div', {class:'modal-card'});
  card.appendChild(el('button', {class:'close', onclick: closeModal}, '✕'));
  card.appendChild(el('h2', {}, stallTyp === 'huehnerstall' ? '🐔 Hühnerstall' : '🐮 Kuhstall'));
  if (stallTyp === 'huehnerstall') {
    const huehner = GS.tiere.huhn || 0;
    card.appendChild(el('p', {style:'text-align:center;margin-bottom:14px'}, `Du hast ${huehner} Hühner.`));
    const btn = el('button', {style:'display:block;width:100%;padding:18px;background:#43a047;color:#fff;border:none;border-radius:14px;font-weight:900;font-size:18px;cursor:pointer;margin-bottom:10px'},
      `🥚 Eier sammeln (${huehner * 2} Stück)`
    );
    btn.addEventListener('click', () => {
      if (huehner === 0) { toast('Keine Hühner!', '#ff7043'); return; }
      GS.inventar.eier = (GS.inventar.eier || 0) + huehner * 2;
      saveState();
      closeModal();
      verkaufenMitMatheCustom('eier', huehner * 2, 0.4, 'Eier verkaufen', '🥚');
    });
    card.appendChild(btn);
  } else if (stallTyp === 'kuhstall') {
    const kuehe = GS.tiere.kuh || 0;
    card.appendChild(el('p', {style:'text-align:center;margin-bottom:14px'}, `Du hast ${kuehe} Kühe.`));
    const btn = el('button', {style:'display:block;width:100%;padding:18px;background:#43a047;color:#fff;border:none;border-radius:14px;font-weight:900;font-size:18px;cursor:pointer'},
      `🥛 Kühe melken (${kuehe * 8} L)`
    );
    btn.addEventListener('click', () => {
      if (kuehe === 0) { toast('Keine Kühe!', '#ff7043'); return; }
      onTierClick('kuh');
      closeModal();
    });
    card.appendChild(btn);
  }
  showModalRaw(card);
}

// === MODAL ===
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
function closeModal() {
  const m = document.getElementById('modal');
  if (m) m.remove();
}

// === TOUCH-STEUERUNG (Avatar/Trecker ziehen) ===
function setupTouch(container) {
  let dragging = null;
  let dragOffset = {x:0,y:0};
  let activePointer = null;

  container.addEventListener('pointerdown', e => {
    const t = e.target.closest('[data-draggable]');
    if (!t) return;
    e.preventDefault();
    activePointer = e.pointerId;
    dragging = t;
    const which = t.dataset.draggable;
    const rect = container.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width * 100;
    const py = (e.clientY - rect.top) / rect.height * 100;
    dragOffset.x = px - GS[which].x;
    dragOffset.y = py - GS[which].y;
  });
  container.addEventListener('pointermove', e => {
    if (!dragging || e.pointerId !== activePointer) return;
    e.preventDefault();
    const rect = container.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width * 100;
    const py = (e.clientY - rect.top) / rect.height * 100;
    const which = dragging.dataset.draggable;
    GS[which].x = Math.max(0, Math.min(100, px - dragOffset.x));
    GS[which].y = Math.max(0, Math.min(100, py - dragOffset.y));
    // Update Position direkt (ohne kompletten Re-Render für Performance)
    if (which === 'avatar') {
      const x = GS.avatar.x * 10, y = GS.avatar.y * 7;
      dragging.setAttribute('transform', `translate(${x},${y}) scale(1.5)`);
    } else if (which === 'trecker') {
      const x = GS.trecker.x * 10, y = GS.trecker.y * 7;
      dragging.setAttribute('transform', `translate(${x-60},${y-40}) scale(0.5)`);
    }
  });
  container.addEventListener('pointerup', () => { if (dragging) { saveState(); dragging = null; activePointer = null; } });
  container.addEventListener('pointercancel', () => { dragging = null; activePointer = null; });
}

// === HILFE ===
function showHilfe() {
  localStorage.setItem('liam_hof_seen_hilfe', '1');
  const tip = el('div', {class:'tooltip unten', style:'top:50%;left:50%;transform:translate(-50%,-50%);max-width:90%;font-size:16px'},
    el('div', {style:'font-size:24px;margin-bottom:8px'}, '👋 Hallo Liam!'),
    el('div', {style:'margin-bottom:8px'}, 'Tippe auf das Weizenfeld ➜ Pflügen ➜ Säen ➜ Warten ➜ Ernten!'),
    el('div', {style:'margin-bottom:8px'}, 'Mit verdientem Geld kannst du oben rechts BAUEN drücken und neue Sachen kaufen.'),
    el('div', {style:'margin-bottom:8px'}, '🚜 Den Trecker und 👨‍🌾 dich selbst kannst du mit dem Finger ziehen!'),
    (function(){const b=el('button',{style:'margin-top:14px;padding:14px 28px;background:#1b5e20;color:#fff;border:none;border-radius:14px;font-weight:900;font-size:16px;cursor:pointer'},'Los gehts!');b.addEventListener('click',()=>tip.remove());return b;})()
  );
  document.body.appendChild(tip);
}

// === START ===
loadState();
render();

// Auto-Refresh für Wachstum (alle 5 Sek)
setInterval(() => {
  let dirty = false;
  for (const fid in GS.felder) {
    const f = GS.felder[fid];
    if (f.stage === 2 && f.plantedAt) {
      const cfg = CROP_CONFIG[f.type];
      if (Date.now() - f.plantedAt >= cfg.wachstumMs) {
        f.stage = 3;
        dirty = true;
      }
    }
  }
  if (dirty) { saveState(); render(); }
  else {
    // Nur Wachstumsbalken updaten ohne kompletten Render
    const sp = document.getElementById('spielflaeche');
    if (sp) renderSzene(sp);
  }
}, 5000);
