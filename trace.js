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
let drawing = false;
let strokes = []; // [{x,y}] arrays
let currentStroke = null;
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

  const buttons = el('div',{attrs:{style:'display:flex;gap:10px;margin-top:6px;flex-wrap:wrap;justify-content:center'}});
  buttons.appendChild(el('button',{text:'🔄 Nochmal', onclick: ()=>{ resetTrace(); renderTraceTask(); },
    attrs:{style:'padding:14px 22px;font-size:16px;border:none;border-radius:14px;background:#666;color:#fff;font-weight:800'}}));
  buttons.appendChild(el('button',{text:'🧹 Löschen', onclick: clearTraceStrokes,
    attrs:{style:'padding:14px 22px;font-size:16px;border:none;border-radius:14px;background:#ff7043;color:#fff;font-weight:800'}}));
  buttons.appendChild(el('button',{text:'✓ Fertig', onclick: finishTrace,
    attrs:{style:'padding:14px 28px;font-size:18px;border:none;border-radius:14px;background:#4caf50;color:#fff;font-weight:900'}}));
  wrap.appendChild(buttons);

  const hint = el('div',{text:'Tipp: Fahre möglichst genau auf den grauen Buchstaben entlang. Auch bunte Linien sind ok!',
    attrs:{style:'font-size:13px;color:rgba(255,255,255,.85);text-align:center;padding:0 16px'}});
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
  currentStroke = null;
  traceCoveredPath = 0;
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
  strokes = []; currentStroke = null; traceCoveredPath = 0;
  drawTraceTemplate();
}

function getCanvasPos(e) {
  const rect = traceCanvas.getBoundingClientRect();
  const scaleX = traceCanvas.width / rect.width;
  const scaleY = traceCanvas.height / rect.height;
  let cx, cy;
  if (e.touches && e.touches.length) {
    cx = e.touches[0].clientX; cy = e.touches[0].clientY;
  } else {
    cx = e.clientX; cy = e.clientY;
  }
  return { x: (cx - rect.left) * scaleX, y: (cy - rect.top) * scaleY };
}

function setupTraceListeners() {
  const onStart = (e) => {
    e.preventDefault();
    drawing = true;
    currentStroke = [];
    strokes.push(currentStroke);
    const pos = getCanvasPos(e);
    currentStroke.push(pos);
  };
  const onMove = (e) => {
    if (!drawing) return;
    e.preventDefault();
    const pos = getCanvasPos(e);
    currentStroke.push(pos);
    // Zeichne Linie
    const last = currentStroke[currentStroke.length - 2];
    if (last) {
      traceCtx.strokeStyle = currentProfile === 'liam' ? '#1b5e20' : '#0277bd';
      traceCtx.lineWidth = 8;
      traceCtx.lineCap = 'round';
      traceCtx.lineJoin = 'round';
      traceCtx.beginPath();
      traceCtx.moveTo(last.x, last.y);
      traceCtx.lineTo(pos.x, pos.y);
      traceCtx.stroke();
    }
  };
  const onEnd = (e) => {
    if (!drawing) return;
    e.preventDefault();
    drawing = false;
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

  // Belohnung
  if (success) {
    const reward = veryGood ? 4 : 2;
    State.data.profiles[currentProfile].coins += reward;
    State.save();
    if (typeof sfxUnlock === 'function') sfxUnlock();
    if (typeof schedulePush === 'function') schedulePush(currentProfile);
    showTraceResult(true, ratio, reward);
  } else {
    if (typeof sfxWrong === 'function') sfxWrong();
    showTraceResult(false, ratio, 0);
  }
}

function showTraceResult(ok, ratio, reward) {
  const overlay = el('div',{class:'reward'},
    el('div',{class:'big', text: ok ? '🎉' : '💪'}),
    el('div',{class:'text', text: ok ? `Super! "${traceText}" ${ratio>=0.70?'PERFEKT':'gut'} nachgezeichnet!` : 'Fast! Versuch es nochmal.'}),
    el('div',{class:'sub', text: ok ? `+${reward} 🪙 verdient!` : `Treffer: ${Math.round(ratio*100)}%`}),
    el('button',{text: ok ? 'Nächstes Wort!' : 'Nochmal probieren', onclick: ()=>{
      overlay.remove();
      if (ok) renderTraceTask();
      else { clearTraceStrokes(); }
    }})
  );
  root.appendChild(overlay);
}
