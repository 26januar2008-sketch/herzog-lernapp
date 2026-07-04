// ============================================================
// Schreib-/Trace-Aufgaben: Silben/Wörter mit dem Finger nachzeichnen
// ============================================================

// Pool an Silben/kurzen Wörtern, die nachgefahren werden sollen.
// Pro Profil unterschiedlich.
const TRACE_LIAM = [
  'TRAK','TOR','MAEH','HER','STALL','SAAT','MILK','HOF','BAUR','KORN',
  'KUEH','PFLUG','HEU','EI','PFER','MAIS','WEI','ZEN','RAPS','GUL','LE'
];
const TRACE_RAIK = [
  'MA','RI','SO','NIC','YO','SHI','LU','GI','BOW','SER','TAILS',
  'KAI','JAY','CO','LE','ZA','NE','LLOYD','NYA','NIN','JA','GO','PILZ',
  'RING','MUEN','ZE','HOPF','LAUF','SPRING','MARIO','SONIC','YOSHI',
  'NINJA','BLITZ','FEUER','EIS'
];

let traceCanvas = null;
let traceCtx = null;
let traceText = '';
let strokes = []; // [{x,y}] arrays
let traceCoveredPath = 0; // einfacher Score

function renderTraceTask() {
  clear();
  const p = State.data.profiles[currentProfile];
  document.body.className = 'theme-' + p.theme;

  const pool = currentProfile === 'liam' ? TRACE_LIAM : TRACE_RAIK;
  traceText = pool[Math.floor(Math.random() * pool.length)];

  const top = el('div',{class:'topbar'},
    el('button',{class:'back', text:'⬅️', onclick: renderHome}),
    el('div',{text:'✏️ Schreiben'}),
    el('div',{class:'score'}, el('span',{class:'icon',text:'🪙'}), el('span',{text:p.coins}))
  );
  root.appendChild(top);

  const wrap = el('div',{attrs:{style:'flex:1;display:flex;flex-direction:column;padding:14px;gap:10px;align-items:center'}});
  wrap.appendChild(el('div',{text:'Fahre mit dem Finger die Buchstaben nach!',
    attrs:{style:'font-size:18px;font-weight:700;text-align:center;color:#fff;text-shadow:0 2px 4px rgba(0,0,0,.3)'}}));

  const canvas = el('canvas', {attrs:{width:'600',height:'300',style:'background:#fff;border-radius:18px;box-shadow:0 6px 20px rgba(0,0,0,.4);width:95%;max-width:700px;height:auto;touch-action:none'}});
  wrap.appendChild(canvas);

  // Modus-Umschalter Finger ↔ Stift
  const modeRow = el('div',{attrs:{style:'display:flex;gap:8px;justify-content:center;margin-top:4px'}});
  const fingerBtn = el('button',{text:'👆 Finger', attrs:{style:`padding:10px 18px;font-size:14px;border:none;border-radius:10px;font-weight:700;cursor:pointer;background:${traceMode==='alle'?'#4caf50':'rgba(255,255,255,.2)'};color:${traceMode==='alle'?'#fff':'#fff'}`}});
  const penBtn = el('button',{text:'✏️ Stift (Hand auflegen ok)', attrs:{style:`padding:10px 18px;font-size:14px;border:none;border-radius:10px;font-weight:700;cursor:pointer;background:${traceMode==='stift'?'#4caf50':'rgba(255,255,255,.2)'};color:#fff`}});
  fingerBtn.onclick = ()=>{ traceMode='alle'; resetTrace(); renderTraceTask(); };
  penBtn.onclick = ()=>{ traceMode='stift'; resetTrace(); renderTraceTask(); };
  modeRow.appendChild(fingerBtn);
  modeRow.appendChild(penBtn);
  wrap.appendChild(modeRow);

  const buttons = el('div',{attrs:{style:'display:flex;gap:10px;margin-top:6px;flex-wrap:wrap;justify-content:center'}});
  buttons.appendChild(el('button',{text:'🔄 Nochmal', onclick: ()=>{ resetTrace(); renderTraceTask(); },
    attrs:{style:'padding:14px 22px;font-size:16px;border:none;border-radius:14px;background:#666;color:#fff;font-weight:800'}}));
  buttons.appendChild(el('button',{text:'🧹 Löschen', onclick: clearTraceStrokes,
    attrs:{style:'padding:14px 22px;font-size:16px;border:none;border-radius:14px;background:#ff7043;color:#fff;font-weight:800'}}));
  buttons.appendChild(el('button',{text:'✓ Fertig', onclick: finishTrace,
    attrs:{style:'padding:14px 28px;font-size:18px;border:none;border-radius:14px;background:#4caf50;color:#fff;font-weight:900'}}));
  wrap.appendChild(buttons);

  const hint = el('div',{
    text: traceMode==='stift'
      ? '✏️ Stift-Modus: Du kannst die Hand ganz normal auflegen – nur die Stiftspitze schreibt!'
      : '👆 Finger-Modus: Jeder Finger malt. Wenn deine Hand stört: ✏️ Stift-Modus!',
    attrs:{style:'font-size:13px;color:rgba(255,255,255,.9);text-align:center;padding:0 16px;background:rgba(0,0,0,.3);border-radius:8px;padding:8px 12px'}
  });
  wrap.appendChild(hint);

  root.appendChild(wrap);

  traceCanvas = canvas;
  traceCtx = canvas.getContext('2d');
  resetTrace();
  drawTraceTemplate();
  setupTraceListeners();
}

function resetTrace() {
  strokes = [];
  traceCoveredPath = 0;
  activePointerId = null;
  activeInfo = null;
  activeStroke = null;
  fingerStrokes = {};
}

function drawTraceTemplate() {
  if (!traceCtx) return;
  const w = traceCanvas.width, h = traceCanvas.height;
  traceCtx.clearRect(0, 0, w, h);
  // Faint grid (Schreiblinien)
  traceCtx.strokeStyle = '#eceff1';
  traceCtx.lineWidth = 1;
  traceCtx.beginPath(); traceCtx.moveTo(0, h*0.25); traceCtx.lineTo(w, h*0.25); traceCtx.stroke();
  traceCtx.beginPath(); traceCtx.moveTo(0, h*0.75); traceCtx.lineTo(w, h*0.75); traceCtx.stroke();

  // Großer grauer Text als „Vorlage"
  const fontSize = Math.min(180, Math.floor(h * 0.62));
  traceCtx.font = `900 ${fontSize}px "Segoe UI Black", Arial Black, sans-serif`;
  traceCtx.textAlign = 'center';
  traceCtx.textBaseline = 'middle';
  // Outline
  traceCtx.lineWidth = 4;
  traceCtx.strokeStyle = '#90a4ae';
  traceCtx.strokeText(traceText, w/2, h/2);
  // Fill light
  traceCtx.fillStyle = '#eceff1';
  traceCtx.fillText(traceText, w/2, h/2);
  // Outline wieder drüber
  traceCtx.strokeText(traceText, w/2, h/2);
}

function clearTraceStrokes() {
  strokes = []; activeStroke = null; activePointerId = null; activeInfo = null; fingerStrokes = {};
  traceCoveredPath = 0;
  drawTraceTemplate();
}

function getPosFromEvent(e) {
  const rect = traceCanvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (traceCanvas.width / rect.width),
    y: (e.clientY - rect.top) * (traceCanvas.height / rect.height)
  };
}

function traceColor() {
  return currentProfile === 'liam' ? '#1b5e20' : currentProfile === 'alva' ? '#ad1457' : '#0277bd';
}

// Alles neu zeichnen (Vorlage + alle gespeicherten Striche) –
// wird gebraucht, wenn ein Handballen-Fehlstrich verworfen wird
function redrawAllStrokes() {
  drawTraceTemplate();
  traceCtx.strokeStyle = traceColor();
  traceCtx.lineWidth = 8;
  traceCtx.lineCap = 'round';
  traceCtx.lineJoin = 'round';
  for (const stroke of strokes) {
    if (stroke.length < 2) continue;
    traceCtx.beginPath();
    traceCtx.moveTo(stroke[0].x, stroke[0].y);
    for (let i = 1; i < stroke.length; i++) traceCtx.lineTo(stroke[i].x, stroke[i].y);
    traceCtx.stroke();
  }
}

// ============================================================
// PALM REJECTION (Stift-Modus, Standard):
// Die Kinder schreiben mit Kugelschreiber-Touchpens und legen
// die Hand auf. Der Fire-Silk-Browser meldet den Stift meist als
// normalen Touch – deshalb Heuristik:
//   1. pointerType 'pen' gewinnt immer (falls gemeldet)
//   2. sonst: kleinste Kontaktfläche (width*height) gewinnt
//   3. Fallback ohne Flächen-Angabe: der höhere Touch gewinnt
//      (die Stiftspitze ist praktisch immer über dem Handballen)
// Landet erst der Handballen und dann die Stiftspitze, wird der
// Fehlstrich des Ballens verworfen und neu gezeichnet.
// Finger-Modus: jeder Finger malt seine eigene Linie.
// ============================================================
let activePointerId = null;
let activeInfo = null;    // {size, y} des aktiven Pointers
let activeStroke = null;
let fingerStrokes = {};   // Finger-Modus: pointerId -> stroke
let traceMode = 'stift';  // Standard: Stift mit Handauflegen

function pointerSize(e) {
  const s = (e.width || 0) * (e.height || 0);
  return s > 1 ? s : null; // <=1 bedeutet: Browser meldet keine echte Fläche
}

function isClearlyBetter(e, info) {
  if (e.pointerType === 'pen') return true;
  const ns = pointerSize(e);
  if (ns !== null && info.size !== null) return ns < info.size * 0.7;
  return e.clientY < info.y - 40; // Stiftspitze deutlich über dem Handballen
}

function setupTraceListeners() {
  traceCanvas.style.touchAction = 'none';
  traceCanvas.addEventListener('contextmenu', (e) => e.preventDefault());

  const drawTo = (stroke, pos) => {
    stroke.push(pos);
    const last = stroke[stroke.length - 2];
    if (last) {
      traceCtx.strokeStyle = traceColor();
      traceCtx.lineWidth = 8;
      traceCtx.lineCap = 'round';
      traceCtx.lineJoin = 'round';
      traceCtx.beginPath();
      traceCtx.moveTo(last.x, last.y);
      traceCtx.lineTo(pos.x, pos.y);
      traceCtx.stroke();
    }
  };

  const adoptPointer = (e) => {
    activePointerId = e.pointerId;
    activeInfo = { size: pointerSize(e), y: e.clientY };
    activeStroke = [];
    strokes.push(activeStroke);
    drawTo(activeStroke, getPosFromEvent(e));
  };

  const discardActiveStroke = () => {
    const idx = strokes.indexOf(activeStroke);
    if (idx >= 0) strokes.splice(idx, 1);
    redrawAllStrokes();
  };

  const onStart = (e) => {
    e.preventDefault();
    if (traceMode === 'alle') {
      const stroke = [];
      strokes.push(stroke);
      fingerStrokes[e.pointerId] = stroke;
      drawTo(stroke, getPosFromEvent(e));
      return;
    }
    // Stift-Modus
    if (activePointerId === null) {
      adoptPointer(e);
    } else if (e.pointerId !== activePointerId && isClearlyBetter(e, activeInfo)) {
      // Der Handballen kam zuerst: Fehlstrich verwerfen, auf Stift umschalten
      discardActiveStroke();
      adoptPointer(e);
    }
    // sonst: zusätzlicher Touch = Handballen → komplett ignorieren
  };

  const onMove = (e) => {
    if (traceMode === 'alle') {
      const stroke = fingerStrokes[e.pointerId];
      if (!stroke) return;
      e.preventDefault();
      drawTo(stroke, getPosFromEvent(e));
      return;
    }
    if (e.pointerId !== activePointerId || !activeStroke) return;
    e.preventDefault();
    drawTo(activeStroke, getPosFromEvent(e));
  };

  const onEnd = (e) => {
    e.preventDefault();
    if (traceMode === 'alle') {
      delete fingerStrokes[e.pointerId];
      return;
    }
    if (e.pointerId === activePointerId) {
      activePointerId = null;
      activeInfo = null;
      activeStroke = null;
    }
    // Handballen hebt ab → interessiert uns nicht
  };

  traceCanvas.addEventListener('pointerdown', onStart);
  traceCanvas.addEventListener('pointermove', onMove);
  traceCanvas.addEventListener('pointerup', onEnd);
  traceCanvas.addEventListener('pointercancel', onEnd);
  traceCanvas.addEventListener('pointerleave', onEnd);
}

function finishTrace() {
  // Bewertung: wie viele schwarze/Vorlagen-Pixel sind durch farbige Linie überdeckt?
  const w = traceCanvas.width, h = traceCanvas.height;
  // Erstelle "Soll-Maske" mit Buchstaben
  const off = document.createElement('canvas'); off.width = w; off.height = h;
  const oc = off.getContext('2d');
  const fontSize = Math.min(180, Math.floor(h * 0.62));
  oc.font = `900 ${fontSize}px "Segoe UI Black", Arial Black, sans-serif`;
  oc.textAlign = 'center'; oc.textBaseline = 'middle';
  oc.fillStyle = '#000';
  oc.fillText(traceText, w/2, h/2);
  const sollData = oc.getImageData(0,0,w,h).data;
  // User-Striche als Maske: rendere Strokes solo
  const off2 = document.createElement('canvas'); off2.width = w; off2.height = h;
  const oc2 = off2.getContext('2d');
  oc2.strokeStyle = '#000'; oc2.lineWidth = 24; oc2.lineCap = 'round'; oc2.lineJoin = 'round';
  for (const stroke of strokes) {
    if (!stroke.length) continue;
    oc2.beginPath();
    oc2.moveTo(stroke[0].x, stroke[0].y);
    for (let i = 1; i < stroke.length; i++) oc2.lineTo(stroke[i].x, stroke[i].y);
    oc2.stroke();
  }
  const userData = oc2.getImageData(0,0,w,h).data;
  // Treffer = Pixel wo soll>0 UND user>0
  let soll = 0, hits = 0;
  for (let i = 3; i < sollData.length; i += 4) {
    if (sollData[i] > 50) {
      soll++;
      if (userData[i] > 50) hits++;
    }
  }
  const ratio = soll ? hits / soll : 0;
  const success = ratio >= 0.45 && strokes.length > 0;
  const veryGood = ratio >= 0.70;

  // Belohnung (mit Abwechslungs-Bonus-System gegen einseitiges Farmen)
  if (success) {
    const base = veryGood ? 4 : 2;
    const adj = (typeof varietyAdjust === 'function')
      ? varietyAdjust(currentProfile, 'trace', base)
      : { reward: base, bonus: 0, reduced: false, firstReduced: false };
    State.data.profiles[currentProfile].coins += adj.reward;
    State.save();
    if (typeof sfxUnlock === 'function') sfxUnlock();
    if (typeof schedulePush === 'function') schedulePush(currentProfile);
    showTraceResult(true, ratio, adj.reward, adj);
  } else {
    if (typeof sfxWrong === 'function') sfxWrong();
    showTraceResult(false, ratio, 0, null);
  }
}

function showTraceResult(ok, ratio, reward, adj) {
  let sub = ok ? `+${reward} 🪙 verdient!` : `Treffer: ${Math.round(ratio*100)}%`;
  if (ok && adj && adj.bonus) sub += ' (🌈 Abwechslungs-Bonus dabei!)';
  const overlay = el('div',{class:'reward'},
    el('div',{class:'big', text: ok ? '🎉' : '💪'}),
    el('div',{class:'text', text: ok ? `Super! "${traceText}" ${ratio>=0.70?'PERFEKT':'gut'} nachgezeichnet!` : 'Fast! Versuch es nochmal.'}),
    el('div',{class:'sub', text: sub}),
    ok && adj && adj.reduced
      ? el('div',{text:'🌈 Schlaufuchs-Tipp: Wechsel mal das Fach – dann gibt es wieder volle Münzen!',
          attrs:{style:'margin-top:10px;background:rgba(255,255,255,.15);padding:10px 16px;border-radius:12px;font-size:15px;font-weight:700;max-width:320px;text-align:center'}})
      : null,
    el('button',{text: ok ? 'Nächstes Wort!' : 'Nochmal probieren', onclick: ()=>{
      overlay.remove();
      if (ok) renderTraceTask();
      else { clearTraceStrokes(); }
    }})
  );
  root.appendChild(overlay);
}
