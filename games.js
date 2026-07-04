// ============================================================
// MINI-SPIELE: Liam Farm + Raik Speed-Run
// Freischaltbar mit Lern-Tokens (10 min lernen = 5 min spielen)
// ============================================================

// ============================================================
// LIAM FARM-SPIEL
// ============================================================
let farmState = null;
const FARM_FIELDS = 6;
const CROP_STAGES = [
  {emoji:'⬛', label:'leer'},
  {emoji:'🟫', label:'gepflügt'},
  {emoji:'🌱', label:'gesät'},
  {emoji:'🌾', label:'wächst'},
  {emoji:'🌾', label:'reif'} // wird gross dargestellt
];
const CROP_GROW_MS = 30000; // 30 sek pro Stufe (für Demo)
const CROP_PRICE = 5;
const HARVEST_REWARD = 15;

function renderFarmGame() {
  if (!Settings.isEnabled('hof_dojo')) {
    alert('In Einstellungen aktivieren');
    return renderHome();
  }
  // Bestehende Session noch aktiv? (z.B. nach Browser-Reload mitten im Spiel)
  const saved = JSON.parse(localStorage.getItem('herzog_farm_state') || 'null');
  const now = Date.now();
  const sessionActive = saved && saved.sessionEnd && saved.sessionEnd > now + 10000; // mind 10 Sek Restzeit
  if (!sessionActive) {
    // Neue Session = Token verbrauchen
    const tokens = getGameTokens('liam');
    if (tokens < 1) {
      return showTokenLockScreen('liam', '🚜 Mein Hof', 'Du brauchst mindestens 1 Spielzeit-Token!\nLerne 10 Minuten, dann kannst du spielen.');
    }
    consumeGameTime('liam', PLAY_PER_TOKEN_SEC);
    // Session-Timer NEU setzen (alte Session-Reste löschen)
    if (saved) {
      saved.sessionStart = now;
      saved.sessionEnd = now + PLAY_PER_TOKEN_SEC * 1000;
      localStorage.setItem('herzog_farm_state', JSON.stringify(saved));
    }
  }
  initFarm();
  drawFarm();
}

function initFarm() {
  const saved = JSON.parse(localStorage.getItem('herzog_farm_state') || 'null');
  if (saved) { farmState = saved; }
  else farmState = {
    fields: Array.from({length:FARM_FIELDS}, () => ({stage:0, plantedAt:0, type:'wheat'})),
    farmCoins: 30,
    animals: [],
    upgrades: {silo:false, scarecrow:false, irrigation:false},
    sessionStart: Date.now(),
    sessionEnd: Date.now() + PLAY_PER_TOKEN_SEC * 1000
  };
  // Update wachstum
  const now = Date.now();
  for (const f of farmState.fields) {
    if (f.stage >= 2 && f.stage < 4 && f.plantedAt) {
      const elapsed = now - f.plantedAt;
      const stages = Math.min(2, Math.floor(elapsed / CROP_GROW_MS));
      f.stage = Math.min(4, f.stage + stages);
    }
  }
  saveFarm();
}

function saveFarm() {
  localStorage.setItem('herzog_farm_state', JSON.stringify(farmState));
}

function drawFarm() {
  clear();
  document.body.className = 'theme-liam';
  const tb = el('div',{class:'topbar'},
    el('button',{class:'back', text:'⬅️', onclick: ()=>{ saveFarm(); renderHome(); }}),
    el('div',{text:'🚜 Mein Hof'}),
    el('div',{class:'score'},
      el('span',{class:'icon',text:'🪙'}),
      el('span',{text: farmState.farmCoins})
    )
  );
  root.appendChild(tb);

  // Header: Restzeit + Token-Counter
  const remainingMs = Math.max(0, farmState.sessionEnd - Date.now());
  const remainSec = Math.ceil(remainingMs / 1000);
  const header = el('div',{attrs:{style:'background:rgba(0,0,0,.4);padding:10px 14px;display:flex;justify-content:space-between;align-items:center;color:#fff;font-weight:700'}});
  header.innerHTML = `⏱ Spielzeit: <b>${Math.floor(remainSec/60)}:${String(remainSec%60).padStart(2,'0')}</b> &nbsp;·&nbsp; Tokens: <b>${getGameTokens('liam')}</b>`;
  root.appendChild(header);

  // Farm-Grid
  const wrap = el('div',{attrs:{style:'flex:1;padding:14px;overflow-y:auto;background:linear-gradient(180deg,#87ceeb 0%,#5d8a3a 70%,#3d2817 100%)'}});
  // Hof-Status
  const status = el('div',{attrs:{style:'background:rgba(255,255,255,.85);color:#222;padding:10px;border-radius:12px;margin-bottom:12px;text-align:center;font-weight:700'}});
  const reifFelder = farmState.fields.filter(f => f.stage===4).length;
  status.innerHTML = `📊 Felder: ${FARM_FIELDS}  ·  Reif zum Ernten: <b>${reifFelder}</b>  ·  Säe für ${CROP_PRICE}🪙, Ernte gibt ${HARVEST_REWARD}🪙`;
  wrap.appendChild(status);

  const grid = el('div',{attrs:{style:'display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px'}});
  farmState.fields.forEach((f, i) => {
    const stage = CROP_STAGES[f.stage];
    const isRipe = f.stage === 4;
    const cell = el('div',{
      attrs:{style:`aspect-ratio:1;background:${f.stage===0?'#5d4037':f.stage===1?'#6d4c41':'#a5d6a7'};border-radius:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;font-size:60px;box-shadow:0 4px 12px rgba(0,0,0,.3);transition:transform .15s;position:relative;overflow:hidden`},
      onclick: () => fieldClick(i)
    });
    cell.appendChild(el('div',{text: isRipe ? '🌾🌾' : stage.emoji, attrs:{style:isRipe?'font-size:50px':''}}));
    cell.appendChild(el('div',{text: stage.label, attrs:{style:'font-size:11px;color:#fff;background:rgba(0,0,0,.5);padding:2px 8px;border-radius:8px;margin-top:4px'}}));
    if (f.stage >= 2 && f.stage < 4 && f.plantedAt) {
      const ms = Date.now() - f.plantedAt;
      const totalGrow = (4 - 2) * CROP_GROW_MS;
      const pct = Math.min(100, ms / totalGrow * 100);
      cell.appendChild(el('div',{attrs:{style:`position:absolute;bottom:0;left:0;height:4px;width:${pct}%;background:#ffeb3b`}}));
    }
    grid.appendChild(cell);
  });
  wrap.appendChild(grid);

  // Maschinen-Garage zur Auswahl (visualisierung der freigeschalteten Maschinen)
  const p = State.data.profiles.liam;
  const unlockedMachines = p.unlocked.length;
  if (unlockedMachines > 0) {
    const machineRow = el('div',{attrs:{style:'background:rgba(255,255,255,.85);color:#222;padding:10px;border-radius:12px;margin-bottom:12px'}});
    machineRow.appendChild(el('div',{text:'🏚️ Deine Maschinen helfen dir:', attrs:{style:'font-weight:700;margin-bottom:6px'}}));
    const mline = el('div',{attrs:{style:'display:flex;gap:8px;flex-wrap:wrap'}});
    MACHINES.forEach(m => {
      if (p.unlocked.includes(m.id)) {
        const chip = el('span',{text: m.icon + ' ' + m.name, attrs:{style:'background:#ffe082;padding:6px 10px;border-radius:8px;font-size:12px;font-weight:600'}});
        mline.appendChild(chip);
      }
    });
    machineRow.appendChild(mline);
    wrap.appendChild(machineRow);
  }

  // Upgrades
  const upBox = el('div',{attrs:{style:'background:rgba(255,255,255,.9);color:#222;padding:14px;border-radius:14px;margin-bottom:12px'}});
  upBox.appendChild(el('h4',{text:'🛒 Hof-Upgrades', attrs:{style:'margin-bottom:10px'}}));
  const ups = [
    {id:'silo', name:'🏗️ Silo (mehr Lager)', price:60},
    {id:'scarecrow', name:'🪖 Vogelscheuche (+10% Ernte)', price:40},
    {id:'irrigation', name:'💧 Bewässerung (wächst schneller)', price:80}
  ];
  ups.forEach(u => {
    const owned = farmState.upgrades[u.id];
    const can = farmState.farmCoins >= u.price && !owned;
    const btn = el('button',{
      text: u.name + (owned ? ' ✓' : ` · ${u.price}🪙`),
      attrs:{style:`display:block;width:100%;padding:10px;margin:4px 0;border-radius:8px;border:none;font-weight:700;cursor:${owned?'default':can?'pointer':'not-allowed'};background:${owned?'#a5d6a7':can?'#ffc107':'#bdbdbd'};color:#000`},
      onclick: () => {
        if (owned || !can) return;
        farmState.farmCoins -= u.price;
        farmState.upgrades[u.id] = true;
        saveFarm();
        drawFarm();
      }
    });
    upBox.appendChild(btn);
  });
  wrap.appendChild(upBox);

  // Anleitung
  wrap.appendChild(el('div',{text:'💡 Tippe auf ein Feld: pflügen → säen → ernten. Reife Felder werden gelb. Verdienst kannst du hier in Hof-Münzen ausgeben.',
    attrs:{style:'background:rgba(255,255,255,.7);color:#333;padding:10px;border-radius:10px;font-size:13px;line-height:1.4'}}));

  root.appendChild(wrap);

  // Timer für Live-Update
  if (!farmState._timer) {
    farmState._timer = setInterval(() => {
      if (Date.now() >= farmState.sessionEnd) {
        clearInterval(farmState._timer);
        farmState._timer = null;
        endFarmSession();
        return;
      }
      // Wachstum updaten
      let dirty = false;
      const now = Date.now();
      for (const f of farmState.fields) {
        if (f.stage >= 2 && f.stage < 4 && f.plantedAt) {
          const elapsed = now - f.plantedAt;
          const newStage = Math.min(4, 2 + Math.floor(elapsed / (farmState.upgrades.irrigation ? CROP_GROW_MS*0.6 : CROP_GROW_MS)));
          if (newStage !== f.stage) { f.stage = newStage; dirty = true; }
        }
      }
      if (dirty) saveFarm();
      drawFarm();
    }, 1500);
  }
}

function fieldClick(i) {
  const f = farmState.fields[i];
  if (f.stage === 0) {
    // Pflügen
    f.stage = 1;
    sfxCorrect?.();
  } else if (f.stage === 1) {
    // Säen (kostet)
    if (farmState.farmCoins < CROP_PRICE) {
      sfxWrong?.();
      return alert(`Nicht genug Münzen! Brauchst ${CROP_PRICE}🪙`);
    }
    farmState.farmCoins -= CROP_PRICE;
    f.stage = 2;
    f.plantedAt = Date.now();
    sfxCorrect?.();
  } else if (f.stage === 4) {
    // Ernten
    let reward = HARVEST_REWARD;
    if (farmState.upgrades.scarecrow) reward = Math.round(reward * 1.1);
    farmState.farmCoins += reward;
    f.stage = 0;
    f.plantedAt = 0;
    sfxUnlock?.();
    showFloating(`+${reward}🪙`, '#43a047');
  } else {
    // Wächst noch
    sfxWrong?.();
  }
  saveFarm();
  drawFarm();
}

function showFloating(text, color) {
  const fl = document.createElement('div');
  fl.textContent = text;
  fl.style.cssText = `position:fixed;top:40%;left:50%;transform:translate(-50%,-50%);font-size:48px;font-weight:900;color:${color};text-shadow:0 4px 12px rgba(0,0,0,.5);pointer-events:none;z-index:9999;animation:floatUp 1.5s ease-out forwards`;
  document.body.appendChild(fl);
  setTimeout(()=>fl.remove(), 1500);
}

function endFarmSession() {
  // Schließt Spiel + zurück zum Home, gibt Bonus-Lern-Münzen wenn Hof gut lief
  const bonus = Math.floor(farmState.farmCoins / 10);
  if (bonus > 0) {
    State.data.profiles.liam.coins += bonus;
    State.save();
    schedulePush?.('liam');
  }
  const overlay = el('div',{class:'reward'},
    el('div',{class:'big', text:'⏰'}),
    el('div',{class:'text', text:'Spielzeit vorbei!'}),
    el('div',{class:'sub', text: `Hof-Münzen behalten: ${farmState.farmCoins} 🪙\nLern-Münzen-Bonus: +${bonus} 🪙\n\nLerne weiter für mehr Spielzeit!`}),
    el('button',{text:'OK', onclick:()=>{overlay.remove(); renderHome();}})
  );
  root.appendChild(overlay);
  saveFarm();
}

function showTokenLockScreen(profileKey, gameTitle, msg) {
  clear();
  const p = State.data.profiles[profileKey];
  document.body.className = 'theme-' + p.theme;
  const tb = el('div',{class:'topbar'},
    el('button',{class:'back', text:'⬅️', onclick: renderHome}),
    el('div',{text: gameTitle}),
    el('div',{class:'score'}, el('span',{class:'icon',text:'🪙'}), el('span',{text:p.coins}))
  );
  root.appendChild(tb);
  const wrap = el('div',{attrs:{style:'flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;color:#fff'}});
  wrap.appendChild(el('div',{text:'🔒', attrs:{style:'font-size:140px;margin-bottom:14px'}}));
  wrap.appendChild(el('div',{text:'Spielzeit nötig!', attrs:{style:'font-size:32px;font-weight:900;margin-bottom:14px'}}));
  wrap.appendChild(el('div',{text:msg, attrs:{style:'font-size:18px;line-height:1.5;background:rgba(0,0,0,.3);padding:18px;border-radius:14px;margin-bottom:18px;white-space:pre-line'}}));
  const pp = Settings.data.per_profile[profileKey];
  const prog = pp.learn_time_today || 0;
  const need = LEARN_PER_TOKEN_SEC;
  const within = prog % need;
  wrap.appendChild(el('div',{text:`Heute schon gelernt: ${Math.floor(prog/60)} Min`, attrs:{style:'font-size:15px;margin-bottom:6px;opacity:.85'}}));
  const barWrap = el('div',{attrs:{style:'width:80%;max-width:300px;height:14px;background:rgba(255,255,255,.2);border-radius:8px;overflow:hidden;margin-bottom:8px'}});
  barWrap.appendChild(el('div',{attrs:{style:`width:${Math.min(100, within/need*100)}%;height:100%;background:#ffeb3b`}}));
  wrap.appendChild(barWrap);
  wrap.appendChild(el('div',{text:`Noch ${Math.ceil((need-within)/60)} Min für nächsten Token`, attrs:{style:'font-size:14px;opacity:.85;margin-bottom:14px'}}));
  wrap.appendChild(el('button',{text:'📚 Jetzt lernen!', onclick:renderHome, attrs:{style:'padding:18px 36px;background:#4caf50;color:#fff;border:none;border-radius:14px;font-weight:900;font-size:20px;cursor:pointer'}}));
  root.appendChild(wrap);
}

// ============================================================
// RAIK SPEED-RUN GAME (Endless Runner)
// ============================================================
let runnerState = null;
function renderRunnerGame() {
  if (!Settings.isEnabled('endless_runner')) {
    alert('In Einstellungen aktivieren');
    return renderHome();
  }
  // Runner ist single-shot (kein Save), prüfe nur Tokens
  const tokens = getGameTokens('raik');
  if (tokens < 1) {
    return showTokenLockScreen('raik', '🏃 Speed Run', 'Du brauchst 1 Spielzeit-Token!\nLerne 10 Minuten - dann kannst du rennen!');
  }
  consumeGameTime('raik', PLAY_PER_TOKEN_SEC);
  initRunner();
}

function initRunner() {
  clear();
  document.body.className = 'theme-raik';
  const p = State.data.profiles.raik;
  // Wähle Lieblings-Charakter (erster freigeschalteter)
  const charId = p.unlocked[0] || 'mario';
  const char = CHARS.find(c => c.id === charId) || CHARS[0];

  const tb = el('div',{class:'topbar'},
    el('button',{class:'back', text:'⬅️', onclick: ()=>{ if (runnerState) runnerState.alive=false; renderHome(); }}),
    el('div',{text:'🏃 Speed Run'}),
    el('div',{class:'score'}, el('span',{class:'icon',text:'🪙'}), el('span',{text:p.coins}))
  );
  root.appendChild(tb);

  const wrap = el('div',{attrs:{style:'flex:1;display:flex;flex-direction:column;padding:10px'}});
  const status = el('div',{attrs:{style:'text-align:center;color:#fff;font-weight:900;font-size:20px;margin-bottom:8px;text-shadow:0 2px 4px rgba(0,0,0,.4)'}});
  status.innerHTML = `🪙 0 &nbsp; · &nbsp; ⏱ ${Math.floor(PLAY_PER_TOKEN_SEC/60)}:00 &nbsp; · &nbsp; ${char.icon} ${char.name}`;
  wrap.appendChild(status);

  const canvas = document.createElement('canvas');
  canvas.width = 800; canvas.height = 300;
  canvas.style.cssText = 'width:100%;max-width:900px;height:auto;background:linear-gradient(180deg,#0066ff 0%,#00ccff 70%,#5d8a3a 100%);border-radius:14px;touch-action:none;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.4)';
  wrap.appendChild(canvas);

  wrap.appendChild(el('div',{text:'TIPPE oder SPACE zum SPRINGEN!',
    attrs:{style:'text-align:center;color:#fff;margin-top:8px;font-weight:700;font-size:16px;text-shadow:0 2px 4px rgba(0,0,0,.4)'}}));

  root.appendChild(wrap);

  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const groundY = H - 50;
  runnerState = {
    alive: true,
    charImg: null,
    charSym: char.icon,
    charColor: char.color,
    charY: groundY - 60,
    vy: 0,
    onGround: true,
    obstacles: [],
    coins: [],
    score: 0,
    distance: 0,
    speed: 5,
    spawnT: 0,
    coinT: 0,
    sessionEnd: Date.now() + PLAY_PER_TOKEN_SEC * 1000,
    canvas, ctx, W, H, groundY, status
  };
  // Char-Bild laden
  if (char.img) {
    const img = new Image();
    img.onload = () => { runnerState.charImg = img; };
    img.src = char.img;
  }
  // Steuerung
  const jump = () => {
    if (!runnerState.alive) return;
    if (runnerState.onGround) {
      runnerState.vy = -14;
      runnerState.onGround = false;
      sfxCorrect?.();
    }
  };
  canvas.addEventListener('pointerdown', (e)=>{ e.preventDefault(); jump(); });
  document.addEventListener('keydown', (e)=>{ if (e.code==='Space') jump(); });
  // Game-Loop
  requestAnimationFrame(runnerLoop);
}

function runnerLoop() {
  if (!runnerState || !runnerState.alive) return;
  const rs = runnerState;
  const remainMs = rs.sessionEnd - Date.now();
  if (remainMs <= 0) { rs.alive = false; finishRunner(); return; }
  rs.ctx.clearRect(0,0,rs.W,rs.H);
  // Boden
  rs.ctx.fillStyle = '#3d2817';
  rs.ctx.fillRect(0, rs.groundY, rs.W, rs.H - rs.groundY);
  // Charakter physik
  rs.vy += 0.7;
  rs.charY += rs.vy;
  if (rs.charY >= rs.groundY - 60) {
    rs.charY = rs.groundY - 60;
    rs.vy = 0;
    rs.onGround = true;
  }
  // Charakter zeichnen (60x60)
  if (rs.charImg) {
    rs.ctx.drawImage(rs.charImg, 80, rs.charY, 60, 60);
  } else {
    rs.ctx.font = '60px sans-serif';
    rs.ctx.fillStyle = rs.charColor || '#fff';
    rs.ctx.fillText(rs.charSym, 80, rs.charY + 50);
  }

  // Hindernisse spawnen
  rs.spawnT++;
  if (rs.spawnT > 80 + Math.random()*60) {
    rs.spawnT = 0;
    rs.obstacles.push({ x: rs.W, y: rs.groundY - 40, w: 30, h: 40 });
  }
  rs.coinT++;
  if (rs.coinT > 50 + Math.random()*40) {
    rs.coinT = 0;
    rs.coins.push({ x: rs.W, y: rs.groundY - 80 - Math.random()*60, r: 14 });
  }

  // Hindernisse + Kollision
  for (let i = rs.obstacles.length - 1; i >= 0; i--) {
    const o = rs.obstacles[i];
    o.x -= rs.speed;
    rs.ctx.fillStyle = '#cc0000';
    rs.ctx.fillRect(o.x, o.y, o.w, o.h);
    rs.ctx.fillStyle = '#fff';
    rs.ctx.font = 'bold 24px sans-serif';
    rs.ctx.fillText('⚠️', o.x+3, o.y+30);
    if (o.x + o.w > 80 && o.x < 140 && rs.charY + 60 > o.y) {
      rs.alive = false;
      sfxWrong?.();
      finishRunner();
      return;
    }
    if (o.x + o.w < 0) rs.obstacles.splice(i, 1);
  }
  // Münzen
  for (let i = rs.coins.length - 1; i >= 0; i--) {
    const c = rs.coins[i];
    c.x -= rs.speed;
    rs.ctx.fillStyle = '#ffd700';
    rs.ctx.beginPath(); rs.ctx.arc(c.x, c.y, c.r, 0, Math.PI*2); rs.ctx.fill();
    rs.ctx.strokeStyle = '#f57f17';
    rs.ctx.lineWidth = 3;
    rs.ctx.stroke();
    rs.ctx.fillStyle = '#f57f17';
    rs.ctx.font = 'bold 14px sans-serif';
    rs.ctx.fillText('€', c.x-4, c.y+5);
    if (Math.hypot(c.x - 110, c.y - (rs.charY + 30)) < c.r + 25) {
      rs.score++;
      rs.coins.splice(i, 1);
      sfxCorrect?.();
    }
    else if (c.x < -20) rs.coins.splice(i, 1);
  }
  // Geschwindigkeit langsam steigern
  rs.distance++;
  if (rs.distance % 200 === 0) rs.speed = Math.min(11, rs.speed + 0.5);

  // Status
  const sec = Math.ceil((rs.sessionEnd - Date.now())/1000);
  rs.status.innerHTML = `🪙 ${rs.score} &nbsp; · &nbsp; ⏱ ${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')} &nbsp; · &nbsp; 💨 Speed ${rs.speed.toFixed(1)}`;

  requestAnimationFrame(runnerLoop);
}

function finishRunner() {
  const rs = runnerState;
  const reward = Math.floor(rs.score / 3);
  if (reward > 0) {
    State.data.profiles.raik.coins += reward;
    State.save();
    schedulePush?.('raik');
  }
  const overlay = el('div',{class:'reward'},
    el('div',{class:'big', text: rs.alive ? '⏰' : '💥'}),
    el('div',{class:'text', text: rs.alive ? 'Spielzeit vorbei!' : 'Aua! Game Over.'}),
    el('div',{class:'sub', text:`Münzen gesammelt: ${rs.score}\nLern-Münzen-Bonus: +${reward} 🪙`}),
    el('button',{text:'Nochmal!', onclick:()=>{overlay.remove(); renderRunnerGame();}}),
    el('button',{text:'Zurück', onclick:()=>{overlay.remove(); renderHome();}, attrs:{style:'margin-left:10px'}})
  );
  root.appendChild(overlay);
}

// ============================================================
// CSS-Animation für floatUp
// ============================================================
(function injectFloatStyle() {
  const s = document.createElement('style');
  s.textContent = `@keyframes floatUp { 0%{opacity:1;transform:translate(-50%,-50%) scale(1)} 100%{opacity:0;transform:translate(-50%,-150%) scale(1.5)} }`;
  document.head.appendChild(s);
})();

// ============================================================
// EINHORN-MAGIE (Alva, 4): Einhorn Funkelstern gegen die
// Schattenfee Wuselwolke. Finger hoch/runter = Einhorn fliegt,
// der Regenbogen-Strahl leuchtet immer. Trifft er die Fee,
// wird sie in Blumen und Schmetterlinge verglitzert – sie
// kichert und kommt neu. Man kann NICHT verlieren.
// ============================================================
let unicornState = null;

function unicornSVG() {
  return `<svg viewBox="0 0 140 120" width="140" height="120" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="hornGrad" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stop-color="#ffd54f"/><stop offset="1" stop-color="#fff8e1"/>
      </linearGradient>
    </defs>
    <ellipse cx="60" cy="78" rx="34" ry="24" fill="#fff" stroke="#f3e5f5" stroke-width="2"/>
    <rect x="34" y="92" width="9" height="22" rx="4" fill="#fff" stroke="#f3e5f5"/>
    <rect x="52" y="96" width="9" height="20" rx="4" fill="#fff" stroke="#f3e5f5"/>
    <rect x="70" y="96" width="9" height="20" rx="4" fill="#fff" stroke="#f3e5f5"/>
    <rect x="84" y="92" width="9" height="22" rx="4" fill="#fff" stroke="#f3e5f5"/>
    <path d="M28 82 Q10 88 14 102 Q22 96 26 90" fill="none" stroke="#ce93d8" stroke-width="6" stroke-linecap="round"/>
    <path d="M30 86 Q16 94 20 106" fill="none" stroke="#80deea" stroke-width="5" stroke-linecap="round"/>
    <circle cx="94" cy="52" r="22" fill="#fff" stroke="#f3e5f5" stroke-width="2"/>
    <ellipse cx="112" cy="58" rx="12" ry="9" fill="#fff" stroke="#f3e5f5" stroke-width="2"/>
    <ellipse cx="116" cy="60" rx="3" ry="2.2" fill="#f8bbd0"/>
    <circle cx="97" cy="48" r="3.5" fill="#4a148c"/>
    <circle cx="98.4" cy="46.8" r="1.2" fill="#fff"/>
    <ellipse cx="90" cy="58" rx="4" ry="2.5" fill="#f8bbd0" opacity=".7"/>
    <path d="M86 32 L98 32 L104 20 Z" fill="#fff" stroke="#f3e5f5"/>
    <path d="M100 34 L124 6 L108 30 Z" fill="url(#hornGrad)" stroke="#ffc107" stroke-width="1.5"/>
    <path d="M78 40 Q66 30 72 52 Q60 44 66 62 Q56 58 64 72" fill="none" stroke="#f48fb1" stroke-width="7" stroke-linecap="round"/>
    <path d="M74 44 Q64 38 68 56 Q60 52 66 66" fill="none" stroke="#ba68c8" stroke-width="5" stroke-linecap="round"/>
    <path d="M72 50 Q64 48 68 62" fill="none" stroke="#4dd0e1" stroke-width="4" stroke-linecap="round"/>
  </svg>`;
}

function shadowFairySVG() {
  return `<svg viewBox="0 0 100 110" width="86" height="95" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="30" cy="45" rx="26" ry="16" fill="#b39ddb" opacity=".55" transform="rotate(-25 30 45)"/>
    <ellipse cx="70" cy="45" rx="26" ry="16" fill="#b39ddb" opacity=".55" transform="rotate(25 70 45)"/>
    <path d="M50 38 L30 96 Q50 106 70 96 Z" fill="#5e35b1"/>
    <path d="M38 72 Q50 80 62 72 L70 96 Q50 106 30 96 Z" fill="#4527a0"/>
    <circle cx="50" cy="30" r="17" fill="#7e57c2"/>
    <path d="M36 22 Q40 8 50 12 Q62 4 64 20 Q70 16 66 26 L36 26 Z" fill="#311b92"/>
    <circle cx="44" cy="30" r="3.6" fill="#fff"/>
    <circle cx="56" cy="30" r="3.6" fill="#fff"/>
    <circle cx="44.8" cy="30.8" r="1.7" fill="#311b92"/>
    <circle cx="56.8" cy="30.8" r="1.7" fill="#311b92"/>
    <path d="M45 39 Q50 42 55 39" fill="none" stroke="#311b92" stroke-width="2" stroke-linecap="round"/>
    <circle cx="50" cy="8" r="3" fill="#ffd54f"/>
  </svg>`;
}

function renderUnicornGame() {
  clear();
  document.body.className = 'theme-alva';
  const p = State.data.profiles.alva;

  const top = el('div',{class:'topbar'},
    el('button',{class:'back', text:'⬅️', onclick: ()=>{ if (unicornState) unicornState.running = false; renderAlvaHome(); }}),
    el('div',{text:'🌈 Einhorn-Magie'}),
    el('div',{class:'score'}, el('span',{class:'icon',text:'✨'}), el('span',{attrs:{id:'uni-score'}, text:'0'}))
  );
  root.appendChild(top);

  const stage = el('div',{class:'uni-stage'});
  stage.appendChild(el('div',{class:'uni-hint', text:'Zieh deinen Finger hoch und runter – triff Wuselwolke mit dem Regenbogen!'}));

  const beam = el('div',{class:'uni-beam'});
  const uni = el('div',{class:'uni-unicorn', html: unicornSVG()});
  const fairy = el('div',{class:'uni-fairy', html: shadowFairySVG()});
  const fairyName = el('div',{class:'uni-fairy-name', text:'Wuselwolke'});
  fairy.appendChild(fairyName);
  stage.appendChild(beam);
  stage.appendChild(uni);
  stage.appendChild(fairy);
  root.appendChild(stage);

  const st = unicornState = {
    running: true,
    score: 0,
    uniY: 0.5,       // 0..1 relativ zur Stage
    fairyY: 0.3,
    t: Math.random() * 100,
    speed: 0.55,
    hitCooldown: 0,
    fairyGone: false
  };

  // Finger folgen: irgendwo auf der Bühne ziehen
  const follow = (e) => {
    const r = stage.getBoundingClientRect();
    st.uniY = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    e.preventDefault();
  };
  stage.addEventListener('pointerdown', follow);
  stage.addEventListener('pointermove', (e)=>{ if (e.buttons || e.pointerType === 'touch') follow(e); });
  stage.style.touchAction = 'none';

  function burst(x, y) {
    const symbols = ['🌸','🦋','✨','🌼','💮','⭐'];
    for (let i = 0; i < 10; i++) {
      const s = document.createElement('div');
      s.className = 'uni-burst';
      s.textContent = symbols[i % symbols.length];
      s.style.left = x + 'px';
      s.style.top = y + 'px';
      s.style.setProperty('--dx', (Math.cos(i/10*Math.PI*2) * (60 + Math.random()*50)) + 'px');
      s.style.setProperty('--dy', (Math.sin(i/10*Math.PI*2) * (60 + Math.random()*50)) + 'px');
      stage.appendChild(s);
      setTimeout(()=> s.remove(), 1000);
    }
  }

  function giggle() {
    const g = el('div',{class:'uni-giggle', text:['Hihi!','Huch!','Kicher!','Bis gleich!'][Math.floor(Math.random()*4)]});
    fairy.appendChild(g);
    setTimeout(()=> g.remove(), 900);
  }

  function loop() {
    if (!st.running || !stage.isConnected) return;
    const r = stage.getBoundingClientRect();
    const H = r.height, W = r.width;

    // Einhorn sanft zur Fingerhöhe gleiten
    const uniTop = st.uniY * (H - 140);
    uni.style.transform = `translateY(${uniTop}px)`;

    // Strahl auf Horn-Höhe
    const beamY = uniTop + 30;
    beam.style.top = beamY + 'px';

    // Fee wuselt (zwei Sinus-Wellen übereinander)
    if (!st.fairyGone) {
      st.t += 0.016 * st.speed * 60 / 60;
      st.fairyY = 0.5 + 0.42 * Math.sin(st.t * 1.1) * Math.cos(st.t * 0.37);
      const fairyTop = Math.min(1, Math.max(0, st.fairyY)) * (H - 120);
      fairy.style.transform = `translateY(${fairyTop}px)`;

      // Treffer? (Strahl-Höhe vs. Feen-Mitte)
      if (st.hitCooldown <= 0 && Math.abs((fairyTop + 50) - (beamY + 13)) < 52) {
        st.fairyGone = true;
        st.hitCooldown = 60;
        st.score++;
        document.getElementById('uni-score').textContent = st.score;
        fairy.classList.add('zapped');
        if (typeof playSound === 'function') playSound('sparkle');
        burst(W - 90, fairyTop + 45);
        giggle();
        setTimeout(()=>{
          if (!st.running) return;
          fairy.classList.remove('zapped');
          st.fairyGone = false;
          st.t = Math.random() * 100;
          st.speed = Math.min(2.1, st.speed * 1.07); // wird ganz sacht flinker
          if (typeof playSound === 'function') playSound('shiny');
        }, 950);
      }
    }
    if (st.hitCooldown > 0) st.hitCooldown--;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
