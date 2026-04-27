// ============================================================
// Spezial-Aufgaben: Memory, Uhr, Geld, Spot, Focus
// ============================================================

// ----- Streak / Tagesziel Helper -----
function currentStreak(profileKey) {
  const p = State.data.profiles[profileKey];
  if (!p.history?.length) return 0;
  const days = new Set();
  for (const h of p.history) {
    const d = new Date(h.ts); d.setHours(0,0,0,0);
    days.add(d.getTime());
  }
  const sorted = [...days].sort((a,b)=>b-a);
  let streak = 0;
  let cursor = (() => { const d = new Date(); d.setHours(0,0,0,0); return d.getTime(); })();
  for (const day of sorted) {
    if (day === cursor || day === cursor - 86400000) {
      streak++;
      cursor = day - 86400000;
    } else break;
  }
  return streak;
}

// ============================================================
// MEMORY-SPIEL (Konzentrations-Training)
// ============================================================
let memoryState = null;
function renderMemoryGame() {
  clear();
  const p = State.data.profiles[currentProfile];
  document.body.className = 'theme-' + p.theme;
  const deck = currentProfile === 'liam' ? MEMORY_DECK_LIAM : MEMORY_DECK_RAIK;
  // Klasse 1 (Raik): 6 Karten (3 Paare). Klasse 3 (Liam): 12 Karten (6 Paare).
  const pairs = currentProfile === 'liam' ? 8 : 6;
  const symbols = shuffle([...deck]).slice(0, pairs);
  const cards = shuffle([...symbols, ...symbols]).map((sym, i) => ({id:i, sym, flipped:false, matched:false}));
  memoryState = { cards, flipped:[], moves:0, matches:0, pairs, startTime:Date.now() };

  const tb = el('div',{class:'topbar'},
    el('button',{class:'back', text:'⬅️', onclick: renderHome}),
    el('div',{text:'🃏 Memory'}),
    el('div',{class:'score'}, el('span',{class:'icon',text:'🪙'}), el('span',{text:p.coins}))
  );
  root.appendChild(tb);

  const wrap = el('div',{attrs:{style:'flex:1;padding:14px;overflow-y:auto'}});
  wrap.appendChild(el('div',{text:'Finde alle Paare! Tippe 2 Karten an.', attrs:{style:'text-align:center;font-weight:700;color:#fff;margin-bottom:14px;text-shadow:0 2px 4px rgba(0,0,0,.3)'}}));

  const cols = currentProfile==='liam' ? 4 : 3;
  const grid = el('div',{attrs:{style:`display:grid;grid-template-columns:repeat(${cols},1fr);gap:10px;max-width:600px;margin:0 auto`}});
  cards.forEach(c => {
    const card = el('div',{
      attrs:{style:'aspect-ratio:1;background:#fff;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:48px;cursor:pointer;box-shadow:0 4px 10px rgba(0,0,0,.3);transition:transform .2s'},
      onclick: () => flipMemoryCard(c.id)
    });
    card.dataset.cardId = c.id;
    card.textContent = '?';
    card.style.background = '#1976d2';
    card.style.color = '#fff';
    grid.appendChild(card);
  });
  wrap.appendChild(grid);
  root.appendChild(wrap);
}

function flipMemoryCard(id) {
  const ms = memoryState; if (!ms) return;
  const c = ms.cards[id];
  if (c.matched || c.flipped) return;
  if (ms.flipped.length >= 2) return;
  c.flipped = true;
  const dom = document.querySelector(`[data-card-id="${id}"]`);
  if (dom) { dom.textContent = c.sym; dom.style.background = '#fff'; dom.style.color = '#222'; }
  ms.flipped.push(c);
  if (ms.flipped.length === 2) {
    ms.moves++;
    const [a, b] = ms.flipped;
    if (a.sym === b.sym) {
      a.matched = b.matched = true;
      ms.matches++;
      sfxCorrect?.();
      ms.flipped = [];
      [a,b].forEach(x => {
        const d = document.querySelector(`[data-card-id="${x.id}"]`);
        if (d) { d.style.background = '#a5d6a7'; d.style.transform = 'scale(.92)'; }
      });
      if (ms.matches === ms.pairs) {
        const sec = Math.round((Date.now() - ms.startTime)/1000);
        const efficiency = ms.pairs / ms.moves;
        const reward = efficiency > 0.7 ? 8 : efficiency > 0.5 ? 5 : 3;
        State.data.profiles[currentProfile].coins += reward;
        State.data.profiles[currentProfile].history.push({ts:Date.now(), subject:'extra', correct:true});
        State.save();
        schedulePush?.(currentProfile);
        sfxUnlock?.();
        setTimeout(() => {
          const overlay = el('div',{class:'reward'},
            el('div',{class:'big',text:'🎉'}),
            el('div',{class:'text', text:`Geschafft in ${ms.moves} Zügen!`}),
            el('div',{class:'sub', text:`+${reward} 🪙 · ${sec} Sekunden`}),
            el('button',{text:'Nochmal!', onclick:()=>{overlay.remove(); renderMemoryGame();}})
          );
          root.appendChild(overlay);
        }, 600);
      }
    } else {
      sfxWrong?.();
      setTimeout(() => {
        [a,b].forEach(x => {
          x.flipped = false;
          const d = document.querySelector(`[data-card-id="${x.id}"]`);
          if (d) { d.textContent = '?'; d.style.background = '#1976d2'; d.style.color = '#fff'; }
        });
        ms.flipped = [];
      }, 1100);
    }
  }
}

// ============================================================
// UHR LESEN
// ============================================================
function renderClockTask() {
  clear();
  const p = State.data.profiles[currentProfile];
  document.body.className = 'theme-' + p.theme;
  const pool = currentProfile === 'liam' ? CLOCK_LIAM : CLOCK_RAIK;
  const target = pool[Math.floor(Math.random() * pool.length)];

  // 4 Optionen: 1 richtige, 3 falsche
  const options = new Set([`${target.h}:${String(target.m).padStart(2,'0')}`]);
  while (options.size < 4) {
    const fakeH = (target.h + Math.floor(Math.random()*5)+1) % 24;
    const fakeM = currentProfile==='raik' ? (Math.random()<0.5?0:30) : [0,15,30,45][Math.floor(Math.random()*4)];
    options.add(`${fakeH}:${String(fakeM).padStart(2,'0')}`);
  }
  const opts = shuffle([...options]);
  const correctIdx = opts.indexOf(`${target.h}:${String(target.m).padStart(2,'0')}`);

  const tb = el('div',{class:'topbar'},
    el('button',{class:'back', text:'⬅️', onclick: renderHome}),
    el('div',{text:'⏰ Uhr lesen'}),
    el('div',{class:'score'}, el('span',{class:'icon',text:'🪙'}), el('span',{text:p.coins}))
  );
  root.appendChild(tb);

  const wrap = el('div',{class:'task'});
  wrap.appendChild(el('div',{text:'Welche Uhrzeit zeigt die Uhr?', attrs:{style:'text-align:center;font-weight:700;font-size:20px;color:#fff;margin-bottom:14px'}}));

  const clock = el('div',{html: clockSVG(target.h, target.m, 240), attrs:{style:'text-align:center;margin-bottom:18px'}});
  wrap.appendChild(clock);

  const optGrid = el('div',{class:'options'});
  opts.forEach((o, i) => {
    optGrid.appendChild(el('button',{class:'opt', text:o, onclick:(e)=>{
      const correct = i === correctIdx;
      e.target.style.background = correct ? '#4caf50' : '#e53935';
      const result = recordAnswer(currentProfile, 'extra', correct);
      sfxCorrect?.(); if (!correct) sfxWrong?.();
      schedulePush?.(currentProfile);
      setTimeout(()=> renderClockTask(), correct ? 900 : 1800);
    }}));
  });
  wrap.appendChild(optGrid);
  root.appendChild(wrap);
}

function clockSVG(h, m, size) {
  const cx = size/2, cy = size/2, r = size/2 - 8;
  // 12er Markierungen
  let marks = '';
  for (let i = 0; i < 12; i++) {
    const ang = i * 30 - 90;
    const rad = ang * Math.PI / 180;
    const x1 = cx + Math.cos(rad)*(r-12);
    const y1 = cy + Math.sin(rad)*(r-12);
    const x2 = cx + Math.cos(rad)*r;
    const y2 = cy + Math.sin(rad)*r;
    marks += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#222" stroke-width="3"/>`;
    const tx = cx + Math.cos(rad)*(r-26);
    const ty = cy + Math.sin(rad)*(r-26) + 7;
    marks += `<text x="${tx}" y="${ty}" text-anchor="middle" font-size="20" font-weight="900" fill="#222">${i===0?12:i}</text>`;
  }
  // Stunden-Zeiger
  const hh = (h % 12) + m/60;
  const hAng = (hh * 30 - 90) * Math.PI / 180;
  const hLen = r * 0.5;
  const hx = cx + Math.cos(hAng)*hLen;
  const hy = cy + Math.sin(hAng)*hLen;
  // Minuten-Zeiger
  const mAng = (m * 6 - 90) * Math.PI / 180;
  const mLen = r * 0.75;
  const mx = cx + Math.cos(mAng)*mLen;
  const my = cy + Math.sin(mAng)*mLen;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="background:#fff;border-radius:50%;box-shadow:0 8px 24px rgba(0,0,0,.4)">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" stroke="#222" stroke-width="4"/>
    ${marks}
    <line x1="${cx}" y1="${cy}" x2="${hx}" y2="${hy}" stroke="#222" stroke-width="8" stroke-linecap="round"/>
    <line x1="${cx}" y1="${cy}" x2="${mx}" y2="${my}" stroke="#1976d2" stroke-width="5" stroke-linecap="round"/>
    <circle cx="${cx}" cy="${cy}" r="8" fill="#222"/>
  </svg>`;
}

// ============================================================
// GELD ZÄHLEN
// ============================================================
function renderMoneyTask() {
  clear();
  const p = State.data.profiles[currentProfile];
  document.body.className = 'theme-' + p.theme;

  // Zufällige Münzen-Kombination, Klasse-1: 2-3 Münzen unter 1€, Klasse-3: 3-5 Münzen
  const easyCoins = COINS.filter(c => c.val <= 50);
  const allCoins = COINS;
  const pool = currentProfile === 'raik' ? easyCoins : allCoins;
  const count = currentProfile === 'raik' ? 2 + Math.floor(Math.random()*2) : 3 + Math.floor(Math.random()*3);
  const selected = [];
  let total = 0;
  for (let i=0;i<count;i++) {
    const c = pool[Math.floor(Math.random()*pool.length)];
    selected.push(c); total += c.val;
  }

  const tb = el('div',{class:'topbar'},
    el('button',{class:'back', text:'⬅️', onclick: renderHome}),
    el('div',{text:'💰 Geld zählen'}),
    el('div',{class:'score'}, el('span',{class:'icon',text:'🪙'}), el('span',{text:p.coins}))
  );
  root.appendChild(tb);

  const wrap = el('div',{class:'task'});
  wrap.appendChild(el('div',{text:'Wie viel Geld ist das?', attrs:{style:'text-align:center;font-weight:700;font-size:20px;color:#fff;margin-bottom:14px'}}));

  const coinsView = el('div',{attrs:{style:'background:rgba(255,255,255,.95);padding:18px;border-radius:18px;display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-bottom:18px'}});
  selected.forEach(c => {
    const coin = el('div',{attrs:{style:`width:64px;height:64px;border-radius:50%;background:${c.val>=100?'#9e9e9e':c.val>=10?'#ffc107':'#bf6e4e'};display:flex;align-items:center;justify-content:center;font-weight:900;color:#fff;font-size:14px;box-shadow:0 3px 8px rgba(0,0,0,.3)`}, text: c.label});
    coinsView.appendChild(coin);
  });
  wrap.appendChild(coinsView);

  // Optionen: 1 richtig, 3 falsch
  const opts = new Set([formatMoney(total)]);
  while (opts.size < 4) {
    const fake = total + (Math.random()<0.5?-1:1) * (5 + Math.floor(Math.random()*30));
    if (fake > 0) opts.add(formatMoney(fake));
  }
  const list = shuffle([...opts]);
  const correctIdx = list.indexOf(formatMoney(total));
  const optGrid = el('div',{class:'options'});
  list.forEach((o, i) => {
    optGrid.appendChild(el('button',{class:'opt', text:o, onclick:(e)=>{
      const correct = i === correctIdx;
      e.target.style.background = correct ? '#4caf50' : '#e53935';
      recordAnswer(currentProfile, 'extra', correct);
      sfxCorrect?.(); if (!correct) sfxWrong?.();
      schedulePush?.(currentProfile);
      setTimeout(()=> renderMoneyTask(), correct ? 900 : 1800);
    }}));
  });
  wrap.appendChild(optGrid);
  root.appendChild(wrap);
}
function formatMoney(cents) {
  if (cents < 100) return `${cents} ct`;
  return `${(cents/100).toFixed(2).replace('.', ',')} €`;
}

// ============================================================
// SPOT THE DIFFERENCE (vereinfacht: Was ist anders?)
// ============================================================
function renderSpotTask() {
  clear();
  const p = State.data.profiles[currentProfile];
  document.body.className = 'theme-' + p.theme;
  // Vereinfacht: 4 Emoji-Reihen, 1 mit anderem Emoji
  const sets = [
    ['🍎','🍎','🍎','🍎','🍎','🍎','🍎','🍌','🍎','🍎'],
    ['🐶','🐶','🐱','🐶','🐶','🐶','🐶','🐶','🐶','🐶'],
    ['⭐','⭐','⭐','⭐','⭐','⭐','⭐','⭐','🌙','⭐'],
    ['🚗','🚗','🚗','🚗','🚌','🚗','🚗','🚗','🚗','🚗'],
    ['🟢','🟢','🟢','🟢','🟢','🔴','🟢','🟢','🟢','🟢']
  ];
  const set = sets[Math.floor(Math.random()*sets.length)];
  const oddIdx = set.findIndex((s,i,arr)=> arr.filter(x=>x===s).length === 1);
  const tb = el('div',{class:'topbar'},
    el('button',{class:'back', text:'⬅️', onclick: renderHome}),
    el('div',{text:'👀 Was ist anders?'}),
    el('div',{class:'score'}, el('span',{class:'icon',text:'🪙'}), el('span',{text:p.coins}))
  );
  root.appendChild(tb);
  const wrap = el('div',{class:'task'});
  wrap.appendChild(el('div',{text:'Tippe auf das andere!', attrs:{style:'text-align:center;font-weight:700;font-size:20px;color:#fff;margin-bottom:14px'}}));
  const grid = el('div',{attrs:{style:'display:grid;grid-template-columns:repeat(5,1fr);gap:8px;background:rgba(255,255,255,.9);padding:14px;border-radius:14px'}});
  set.forEach((s,i) => {
    const cell = el('button',{
      attrs:{style:'aspect-ratio:1;font-size:40px;border:none;background:#f5f5f5;border-radius:10px;cursor:pointer'},
      text: s,
      onclick: (e) => {
        const correct = i === oddIdx;
        e.target.style.background = correct ? '#4caf50' : '#e53935';
        recordAnswer(currentProfile, 'extra', correct);
        sfxCorrect?.(); if (!correct) sfxWrong?.();
        schedulePush?.(currentProfile);
        setTimeout(() => renderSpotTask(), correct ? 900 : 1500);
      }
    });
    grid.appendChild(cell);
  });
  wrap.appendChild(grid);
  root.appendChild(wrap);
}

// ============================================================
// FOKUS-SPIEL: Tippe nur grüne Punkte (NICHT rote)
// ============================================================
let focusState = null;
function renderFocusTask() {
  clear();
  const p = State.data.profiles[currentProfile];
  document.body.className = 'theme-' + p.theme;
  focusState = { score: 0, misses: 0, time: 30, alive: true };

  const tb = el('div',{class:'topbar'},
    el('button',{class:'back', text:'⬅️', onclick: ()=>{ focusState.alive=false; renderHome(); }}),
    el('div',{text:'🎯 Fokus'}),
    el('div',{class:'score'}, el('span',{class:'icon',text:'🪙'}), el('span',{text:p.coins}))
  );
  root.appendChild(tb);

  const wrap = el('div',{attrs:{style:'flex:1;display:flex;flex-direction:column;padding:14px'}});
  const status = el('div',{attrs:{style:'text-align:center;font-weight:900;color:#fff;font-size:22px;margin-bottom:10px;text-shadow:0 2px 4px rgba(0,0,0,.3)'}, text:'30 Sek - Tippe nur 🟢 - NICHT 🔴!'});
  wrap.appendChild(status);
  const arena = el('div',{attrs:{style:'flex:1;background:rgba(255,255,255,.15);border-radius:14px;position:relative;overflow:hidden;min-height:300px'}});
  wrap.appendChild(arena);
  root.appendChild(wrap);

  const tickInterval = setInterval(() => {
    if (!focusState.alive) { clearInterval(tickInterval); clearInterval(spawnInterval); return; }
    focusState.time--;
    status.textContent = `⏱ ${focusState.time} Sek · ✓ ${focusState.score} · ✗ ${focusState.misses}`;
    if (focusState.time <= 0) {
      focusState.alive = false;
      clearInterval(tickInterval); clearInterval(spawnInterval);
      finishFocus(focusState.score, focusState.misses);
    }
  }, 1000);
  const spawnInterval = setInterval(() => {
    if (!focusState.alive) return;
    spawnFocusDot(arena);
  }, 700);
}

function spawnFocusDot(arena) {
  const isGreen = Math.random() < 0.55;
  const dot = document.createElement('div');
  dot.style.cssText = `position:absolute;width:60px;height:60px;border-radius:50%;background:${isGreen?'#4caf50':'#e53935'};left:${Math.random()*(arena.offsetWidth-60)}px;top:${Math.random()*(arena.offsetHeight-60)}px;cursor:pointer;box-shadow:0 4px 8px rgba(0,0,0,.3);transition:opacity .3s`;
  dot.onclick = () => {
    if (!focusState.alive) return;
    if (isGreen) { focusState.score++; sfxCorrect?.(); }
    else { focusState.misses++; sfxWrong?.(); }
    dot.style.opacity = 0;
    setTimeout(()=> dot.remove(), 300);
  };
  arena.appendChild(dot);
  setTimeout(()=> dot.remove(), 1800);
}

function finishFocus(score, misses) {
  const reward = Math.max(0, score - misses * 2);
  if (reward > 0) {
    State.data.profiles[currentProfile].coins += reward;
    State.data.profiles[currentProfile].history.push({ts:Date.now(), subject:'extra', correct:true});
    State.save();
    schedulePush?.(currentProfile);
    sfxUnlock?.();
  }
  const overlay = el('div',{class:'reward'},
    el('div',{class:'big', text: reward > 5 ? '🏆' : '🎯'}),
    el('div',{class:'text', text: `${score} grüne · ${misses} rote`}),
    el('div',{class:'sub', text: `+${reward} 🪙`}),
    el('button',{text:'Nochmal!', onclick:()=>{overlay.remove(); renderFocusTask();}})
  );
  root.appendChild(overlay);
}

// ============================================================
// TTS – Text vorlesen (Web Speech API)
// ============================================================
function speak(text) {
  if (!('speechSynthesis' in window)) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'de-DE'; u.rate = 0.9; u.pitch = 1.05;
    speechSynthesis.speak(u);
  } catch (e) {}
}

// ============================================================
// TAG/NACHT-Modus automatisch nach Uhrzeit
// ============================================================
function applyTimeTheme() {
  const h = new Date().getHours();
  if (h >= 19 || h < 7) document.body.classList.add('night-mode');
  else document.body.classList.remove('night-mode');
}
