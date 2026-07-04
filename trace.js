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
// Alva (4): einfache Formen (als dicke Spur) + erste Buchstaben + Zahlen 1-5
const TRACE_ALVA = [
  {shape:'kreis',      label:'Kreis'},
  {shape:'welle',      label:'Wellen'},
  {shape:'zickzack',   label:'Zickzack'},
  {shape:'herz',       label:'Herz'},
  {shape:'stern',      label:'Stern'},
  {shape:'regenbogen', label:'Regenbogen'},
  {shape:'krone',      label:'Krone'},
  {text:'A'},{text:'L'},{text:'V'},{text:'O'},{text:'M'},{text:'I'},{text:'U'},
  {text:'1'},{text:'2'},{text:'3'},{text:'4'},{text:'5'},
  {text:'ALVA', label:'Dein Name!'}
];

let traceCanvas = null;
let traceCtx = null;
let traceItem = null; // {text} oder {shape,label}
let traceText = '';
let strokes = []; // [{x,y}] arrays
let traceCoveredPath = 0; // einfacher Score

function renderTraceTask() {
  clear();
  const p = State.data.profiles[currentProfile];
  document.body.className = 'theme-' + p.theme;

  const isAlva = currentProfile === 'alva';
  const pool = currentProfile === 'liam' ? TRACE_LIAM : isAlva ? TRACE_ALVA : TRACE_RAIK;
  const rawItem = pool[Math.floor(Math.random() * pool.length)];
  traceItem = typeof rawItem === 'string' ? { text: rawItem } : rawItem;
  traceText = traceItem.text || traceItem.label || '';

  const top = el('div',{class:'topbar'},
    el('button',{class:'back', text:'⬅️', onclick: isAlva ? renderAlvaHome : renderHome}),
    el('div',{text: isAlva ? '✏️ Malen' : '✏️ Schreiben'}),
    isAlva
      ? el('div',{class:'score'}, el('span',{class:'icon',text:'🌟'}), el('span',{text:p.unlocked.length}))
      : el('div',{class:'score'}, el('span',{class:'icon',text:'🪙'}), el('span',{text:p.coins}))
  );
  root.appendChild(top);

  const wrap = el('div',{attrs:{style:'flex:1;display:flex;flex-direction:column;padding:14px;gap:10px;align-items:center'}});
  wrap.appendChild(el('div',{
    text: isAlva
      ? (traceItem.shape ? `Fahre ${traceItem.label === 'Wellen' ? 'die Wellen' : (traceItem.label === 'Zickzack' ? 'den Zickzack' : 'die Form')} nach! 💜`
                         : (traceItem.label ? '✨ ' + traceItem.label + ' ✨' : 'Fahre den Buchstaben nach! 💜'))
      : 'Fahre mit dem Finger die Buchstaben nach!',
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

// Formen-Pfade für Alva (Kreis, Wellen, Zickzack, Herz, Stern, Regenbogen, Krone)
function traceShapePath(ctx, shape, w, h) {
  const cx = w/2, cy = h/2;
  ctx.beginPath();
  if (shape === 'kreis') {
    ctx.arc(cx, cy, Math.min(w,h)*0.36, 0, Math.PI*2);
  } else if (shape === 'welle') {
    const amp = h*0.16, x0 = w*0.08, x1 = w*0.92, n = 3, seg = (x1-x0)/n;
    ctx.moveTo(x0, cy);
    for (let i=0;i<n;i++){
      ctx.quadraticCurveTo(x0+seg*(i+0.25), cy-amp*2, x0+seg*(i+0.5), cy);
      ctx.quadraticCurveTo(x0+seg*(i+0.75), cy+amp*2, x0+seg*(i+1), cy);
    }
  } else if (shape === 'zickzack') {
    const y0 = h*0.7, y1 = h*0.3, x0 = w*0.08, x1 = w*0.92, n = 4, seg = (x1-x0)/n;
    ctx.moveTo(x0, y0);
    for (let i=1;i<=n;i++) ctx.lineTo(x0+seg*i, i%2 ? y1 : y0);
  } else if (shape === 'herz') {
    const s = Math.min(w,h)*0.42;
    ctx.moveTo(cx, cy + s*0.75);
    ctx.bezierCurveTo(cx - s*1.4, cy - s*0.1, cx - s*0.6, cy - s*1.05, cx, cy - s*0.35);
    ctx.bezierCurveTo(cx + s*0.6, cy - s*1.05, cx + s*1.4, cy - s*0.1, cx, cy + s*0.75);
  } else if (shape === 'stern') {
    const R = Math.min(w,h)*0.44, r = R*0.45;
    for (let i=0;i<10;i++){
      const ang = -Math.PI/2 + i*Math.PI/5;
      const rad = i%2===0 ? R : r;
      const x = cx + Math.cos(ang)*rad, y = cy + Math.sin(ang)*rad;
      if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.closePath();
  } else if (shape === 'regenbogen') {
    const R = Math.min(w*0.4, h*0.75), yB = h*0.85;
    ctx.arc(cx, yB, R, Math.PI, 0);
    ctx.moveTo(cx + R*0.6, yB);
    ctx.arc(cx, yB, R*0.6, 0, Math.PI, true);
  } else if (shape === 'krone') {
    const x0 = w*0.18, x1 = w*0.82, yB = h*0.75, yT = h*0.25, yM = h*0.45;
    ctx.moveTo(x0, yB);
    ctx.lineTo(x0, yM);
    ctx.lineTo(x0 + (x1-x0)*0.166, yT);
    ctx.lineTo(x0 + (x1-x0)*0.333, yM);
    ctx.lineTo(cx, yT);
    ctx.lineTo(x0 + (x1-x0)*0.666, yM);
    ctx.lineTo(x0 + (x1-x0)*0.833, yT);
    ctx.lineTo(x1, yM);
    ctx.lineTo(x1, yB);
    ctx.closePath();
  }
}

function drawTraceTemplate() {
  if (!traceCtx) return;
  const w = traceCanvas.width, h = traceCanvas.height;
  traceCtx.clearRect(0, 0, w, h);

  // Alva-Formen: breite helle Spur + gestrichelte Mittellinie
  if (traceItem && traceItem.shape) {
    traceCtx.lineCap = 'round'; traceCtx.lineJoin = 'round';
    traceCtx.strokeStyle = '#f3e5f5';
    traceCtx.lineWidth = 30;
    traceShapePath(traceCtx, traceItem.shape, w, h);
    traceCtx.stroke();
    traceCtx.strokeStyle = '#ce93d8';
    traceCtx.lineWidth = 3;
    traceCtx.setLineDash([12, 9]);
    traceShapePath(traceCtx, traceItem.shape, w, h);
    traceCtx.stroke();
    traceCtx.setLineDash([]);
    return;
  }

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

function traceLineWidth() {
  return currentProfile === 'alva' ? 13 : 8; // Alva malt dicker
}

// Alles neu zeichnen (Vorlage + alle gespeicherten Striche) –
// wird gebraucht, wenn ein Handballen-Fehlstrich verworfen wird
function redrawAllStrokes() {
  drawTraceTemplate();
  traceCtx.strokeStyle = traceColor();
  traceCtx.lineWidth = traceLineWidth();
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

// Glitzer-Spur hinter dem Stift (Alva): kleine Funkel-Sterne, die verpuffen
let _lastSparkle = 0;
function spawnSparkle(clientX, clientY) {
  const now = Date.now();
  if (now - _lastSparkle < 90) return; // gedrosselt, damit das Tablet nicht schwitzt
  _lastSparkle = now;
  const s = document.createElement('div');
  s.className = 'trace-sparkle';
  s.textContent = ['✨','⭐','💫'][Math.floor(Math.random()*3)];
  s.style.left = (clientX - 10 + Math.random()*20) + 'px';
  s.style.top = (clientY - 10 + Math.random()*20) + 'px';
  document.body.appendChild(s);
  setTimeout(()=> s.remove(), 800);
}

function setupTraceListeners() {
  traceCanvas.style.touchAction = 'none';
  traceCanvas.addEventListener('contextmenu', (e) => e.preventDefault());

  const drawTo = (stroke, pos) => {
    stroke.push(pos);
    const last = stroke[stroke.length - 2];
    if (last) {
      traceCtx.strokeStyle = traceColor();
      traceCtx.lineWidth = traceLineWidth();
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
      if (currentProfile === 'alva') spawnSparkle(e.clientX, e.clientY);
      return;
    }
    if (e.pointerId !== activePointerId || !activeStroke) return;
    e.preventDefault();
    drawTo(activeStroke, getPosFromEvent(e));
    if (currentProfile === 'alva') spawnSparkle(e.clientX, e.clientY);
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
  // Bewertung: wie viele Vorlagen-Pixel sind durch farbige Linie überdeckt?
  const w = traceCanvas.width, h = traceCanvas.height;
  // Erstelle "Soll-Maske" (Buchstaben oder Alva-Form)
  const off = document.createElement('canvas'); off.width = w; off.height = h;
  const oc = off.getContext('2d');
  if (traceItem && traceItem.shape) {
    oc.strokeStyle = '#000'; oc.lineWidth = 34; oc.lineCap = 'round'; oc.lineJoin = 'round';
    traceShapePath(oc, traceItem.shape, w, h);
    oc.stroke();
  } else {
    const fontSize = Math.min(180, Math.floor(h * 0.62));
    oc.font = `900 ${fontSize}px "Segoe UI Black", Arial Black, sans-serif`;
    oc.textAlign = 'center'; oc.textBaseline = 'middle';
    oc.fillStyle = '#000';
    oc.fillText(traceText, w/2, h/2);
  }
  const sollData = oc.getImageData(0,0,w,h).data;
  // User-Striche als Maske: rendere Strokes solo
  const off2 = document.createElement('canvas'); off2.width = w; off2.height = h;
  const oc2 = off2.getContext('2d');
  oc2.strokeStyle = '#000'; oc2.lineWidth = currentProfile === 'alva' ? 32 : 24;
  oc2.lineCap = 'round'; oc2.lineJoin = 'round';
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
  // Alva (4): sehr niedrige Hürde – ab 30 % ist es geschafft, Jubel ab 55 %
  const minOk = currentProfile === 'alva' ? 0.30 : 0.45;
  const success = ratio >= minOk && strokes.length > 0;
  const veryGood = ratio >= (currentProfile === 'alva' ? 0.55 : 0.70);

  // Alva: Sticker statt Münzen, danach evtl. Kuschel-Pause
  if (currentProfile === 'alva') {
    if (success) {
      const g = grantRandomSticker('alva');
      const p = State.data.profiles.alva;
      p.sessionCount = (p.sessionCount||0) + 1;
      State.save();
      if (typeof sfxUnlock === 'function') sfxUnlock();
      if (typeof schedulePush === 'function') schedulePush('alva');
      showAlvaStickerReward(g);
    } else {
      if (typeof playSound === 'function') playSound('yoshi'); // sanft, nie bestrafend
      showTraceResult(false, ratio, 0, null);
    }
    return;
  }

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
  if (currentProfile === 'alva' && !ok) sub = 'Du schaffst das! 💜';
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
