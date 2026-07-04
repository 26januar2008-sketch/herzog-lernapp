// ============================================================
// UI-Rendering – Vanilla JS, keine Frameworks
// ============================================================

const root = document.getElementById('app');
let currentProfile = null;

State.load();

function el(tag, opts={}, ...children){
  const e = document.createElement(tag);
  if (opts.class) e.className = opts.class;
  if (opts.text) e.textContent = opts.text;
  if (opts.html) e.innerHTML = opts.html;
  if (opts.onclick) e.addEventListener('click', opts.onclick);
  if (opts.attrs) for (const k in opts.attrs) e.setAttribute(k, opts.attrs[k]);
  for (const c of children) if (c) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  return e;
}

function clear(){
  // Stop all interval-based games
  if (typeof memoryState !== 'undefined' && memoryState) memoryState.aborted = true;
  if (typeof focusState !== 'undefined' && focusState) focusState.alive = false;
  if (typeof runnerState !== 'undefined' && runnerState) runnerState.alive = false;
  if (typeof farmState !== 'undefined' && farmState && farmState._timer) {
    clearInterval(farmState._timer); farmState._timer = null;
  }
  root.innerHTML='';
  document.body.className='';
}

// ===== Profil-Auswahl =====
function renderPicker(){
  clear();
  const wrap = el('div',{class:'picker'});
  wrap.appendChild(el('div',{class:'profile-card card-liam', onclick: ()=>openProfile('liam')},
    el('div',{class:'emoji', text:'🚜'}),
    el('div',{class:'name', text:'Liam'}),
    el('div',{class:'age', text:'9 Jahre · Hof-Boss'})
  ));
  wrap.appendChild(el('div',{class:'profile-card card-raik', onclick: ()=>openProfile('raik')},
    el('div',{class:'emoji', text:'💨'}),
    el('div',{class:'name', text:'Raik'}),
    el('div',{class:'age', text:'7 Jahre · Speed Run'})
  ));
  wrap.appendChild(el('div',{class:'profile-card card-alva', onclick: ()=>openProfile('alva')},
    el('div',{class:'emoji', text:'🦄'}),
    el('div',{class:'name', text:'Alva'}),
    el('div',{class:'age', text:'4 Jahre · Zauberwelt'})
  ));
  const parent = el('button',{class:'parent-btn', text:'👨 Eltern', onclick: askPin});
  wrap.appendChild(parent);
  root.appendChild(wrap);
}

function openProfile(key){
  currentProfile = key;
  if (Settings.isEnabled('night_mode') && typeof applyTimeTheme === 'function') applyTimeTheme();
  startLearnTimer?.();
  // Auto-stop bei Tab-Wechsel
  document.addEventListener('visibilitychange', ()=> {
    if (document.hidden) stopLearnTimer?.(currentProfile);
    else startLearnTimer?.();
  });
  const renderStart = ()=> key === 'alva' ? renderAlvaHome() : renderHome();
  renderStart();
  if (typeof hydrateFromRemote === 'function') {
    hydrateFromRemote(key).then(()=> { if (currentProfile === key) renderStart(); });
  }
}

// ===== Home =====
function renderHome(){
  if (currentProfile === 'alva') return renderAlvaHome();
  window._surpriseActive = false;
  clear();
  const p = State.data.profiles[currentProfile];
  document.body.className = 'theme-' + p.theme;

  // Avatar wenn gesetzt
  const avatarId = Settings.isEnabled('custom_avatar') && Settings.data.per_profile[currentProfile].custom_avatar;
  const avatarItem = avatarId ? (currentProfile==='liam' ? MACHINES : CHARS).find(x=>x.id===avatarId) : null;
  const top = el('div',{class:'topbar'},
    el('button',{class:'back', text:'⬅️', onclick: renderPicker}),
    el('div',{attrs:{style:'display:flex;align-items:center;gap:8px'}},
      avatarItem?.img ? (() => { const i = document.createElement('img'); i.src = avatarItem.img; i.style.cssText='width:36px;height:36px;object-fit:contain;border-radius:50%;background:#fff'; return i; })() : null,
      el('span',{text: 'Hi ' + p.name + '!'})
    ),
    el('div',{class:'score'},
      el('span',{class:'icon', text:'🪙'}),
      el('span',{text: p.coins})
    )
  );
  root.appendChild(top);

  const home = el('div',{class:'home'});
  const greet = currentProfile==='liam'
    ? '🚜 Was machen wir heute, Boss?'
    : '⚡ Bereit zum Speed Run?';
  home.appendChild(el('div',{class:'greeting', text: greet}));

  // Tagesziel + Streak + Karriere – jeweils nur wenn Setting on
  const showGoal = Settings.isEnabled('daily_goal');
  const showStreak = Settings.isEnabled('streak');
  const showCareer = Settings.isEnabled('career_mode');
  if (showGoal || showStreak || showCareer) {
    const today = todayStats(currentProfile);
    const goal = Settings.get('daily_goal')?.value || 10;
    const streak = currentStreak(currentProfile);
    const career = getCareerRank(currentProfile);
    const bar = el('div',{attrs:{style:'background:rgba(255,255,255,.15);padding:10px 14px;border-radius:14px;margin-bottom:14px;text-align:center;font-weight:700'}});
    let html = '';
    if (showGoal) html += `📅 Heute: <b>${today.total}</b> / ${goal} Aufgaben`;
    if (showStreak && streak) html += (html?' &nbsp; ':'') + `🔥 Streak: <b>${streak}</b> Tage`;
    if (showCareer && career) html += (html?'<br>':'') + `<span style="color:${career.color}">${career.name}</span>` + (career.nextAt ? ` <small>(noch ${career.nextAt - career.totalCorrect} bis ${career.nextName})</small>` : '');
    bar.innerHTML = html;
    home.appendChild(bar);
  }

  // Zeitlimit-Warnung
  if (Settings.isEnabled('time_limit')) {
    const left = timeLeftToday(currentProfile);
    const total = (Settings.get('time_limit').value||30)*60;
    const used = total - left;
    const pct = Math.min(100, Math.round(used/total*100));
    const tlBar = el('div',{attrs:{style:'background:rgba(255,255,255,.1);padding:8px 12px;border-radius:10px;margin-bottom:14px;font-size:13px;text-align:center'}});
    tlBar.innerHTML = `⏱ ${Math.round(used/60)} / ${Math.round(total/60)} Min heute &nbsp; <div style="margin-top:4px;height:6px;background:rgba(0,0,0,.3);border-radius:3px;overflow:hidden"><div style="width:${pct}%;height:100%;background:${pct>80?'#e53935':pct>50?'#ffc107':'#4caf50'}"></div></div>`;
    home.appendChild(tlBar);
    if (left <= 0) {
      home.appendChild(el('div',{text:'⛔ Tageszeit aufgebraucht. Komm morgen wieder!', attrs:{style:'background:#e53935;color:#fff;padding:14px;border-radius:10px;text-align:center;font-weight:800;margin-bottom:14px'}}));
    }
  }

  const subs = el('div',{class:'subjects'});
  const tree = SUBJECTS_TREE[currentProfile];
  for (const topKey of Object.keys(tree)) {
    const top = tree[topKey];
    subs.appendChild(el('div',{class:'subject', onclick: ()=> renderSubjectHub(topKey)},
      el('span',{class:'em', text: top.emoji}),
      document.createTextNode(top.label.replace(/^.\s/, ''))
    ));
  }
  subs.appendChild(el('div',{class:'subject', onclick: renderCollection, attrs:{style:'grid-column:span 2'}},
    el('span',{class:'em', text: currentProfile==='liam' ? '🏚️' : '🌟'}),
    document.createTextNode(currentProfile==='liam' ? 'Meine Garage' : 'Meine Charaktere')
  ));

  // SPIEL-Button (mit Token-Anzeige)
  const tokens = getGameTokens(currentProfile);
  const gameTitle = currentProfile==='liam' ? '🚜 Mein Hof' : '🏃 Speed Run';
  const gameDesc = tokens > 0 ? `${tokens} × 5 Min Spielzeit verfügbar` : 'Lerne 10 Min für 5 Min Spielen';
  const gameBtn = el('div',{
    class:'subject',
    attrs:{style:`grid-column:span 2;background:${tokens>0?'linear-gradient(135deg,#ffd700,#ff9800)':'rgba(255,255,255,.15)'};color:${tokens>0?'#222':'#fff'};border:3px solid ${tokens>0?'#ff9800':'rgba(255,255,255,.3)'}`},
    onclick: () => currentProfile==='liam' ? renderFarmGame() : renderRunnerGame()
  },
    el('span',{class:'em', text: tokens > 0 ? '🎮' : '🔒'}),
    document.createTextNode(gameTitle),
    el('div',{text: gameDesc, attrs:{style:'font-size:11px;margin-top:4px;font-weight:600'}})
  );
  subs.appendChild(gameBtn);

  // 🎲 Überraschungs-Runde: Zufallsmix quer durch alle Fächer
  subs.appendChild(el('div',{
    class:'subject',
    attrs:{style:'grid-column:span 2;background:linear-gradient(135deg,#7e57c2,#26c6da);color:#fff;border:3px solid rgba(255,255,255,.35)'},
    onclick: renderSurpriseRound
  },
    el('span',{class:'em', text:'🎲'}),
    document.createTextNode('Überraschungs-Runde'),
    el('div',{text: currentProfile==='raik'
        ? 'Alle Fächer gemischt · Bonus-Münzen · bessere Fang-Chancen!'
        : 'Alle Fächer gemischt · Bonus-Münzen!',
      attrs:{style:'font-size:11px;margin-top:4px;font-weight:600'}})
  ));
  home.appendChild(subs);
  root.appendChild(home);
}

// ===== Sub-Fach-Hub: zeigt z.B. 7 Mathe-Bereiche =====
function renderSubjectHub(topKey){
  window._surpriseActive = false;
  clear();
  const p = State.data.profiles[currentProfile];
  document.body.className = 'theme-' + p.theme;
  const top = SUBJECTS_TREE[currentProfile][topKey];
  if (!top) return renderHome();

  const tb = el('div',{class:'topbar'},
    el('button',{class:'back', text:'⬅️', onclick: renderHome}),
    el('div',{text: top.label}),
    el('div',{class:'score'}, el('span',{class:'icon',text:'🪙'}), el('span',{text:p.coins}))
  );
  root.appendChild(tb);

  const home = el('div',{class:'home'});
  home.appendChild(el('div',{class:'greeting', text: 'Was üben wir?', attrs:{style:'font-size:24px'}}));
  const subs = el('div',{class:'subjects'});
  for (const sub of top.subs) {
    if (!Settings.isSubjectEnabled(topKey, sub.id)) continue;
    const cell = el('div',{class:'subject', onclick: ()=> startSub(topKey, sub)},
      el('span',{class:'em', text:(sub.label.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u)||['📚'])[0]}),
      el('div',{text: sub.label.replace(/^[^\sA-Za-zÄÖÜäöüß]+\s?/,''), attrs:{style:'font-size:16px'}}),
      sub.desc ? el('div',{text: sub.desc, attrs:{style:'font-size:11px;opacity:.7;margin-top:4px;font-weight:400'}}) : null
    );
    subs.appendChild(cell);
  }
  home.appendChild(subs);
  root.appendChild(home);
}

// Dispatcher: startet die richtige Aufgaben-Render basierend auf sub.special oder backend
function startSub(topKey, sub) {
  if (sub.special === 'trace') return renderTraceTask();
  if (sub.special === 'memory') return renderMemoryGame();
  if (sub.special === 'clock') return renderClockTask();
  if (sub.special === 'money') return renderMoneyTask();
  if (sub.special === 'tools') return renderQuizTask(topKey, sub, TOOLS_QUIZ, 'sach');
  if (sub.special === 'hofproblems') {
    if (!Settings.isEnabled('hof_problems')) { alert('In Einstellungen aktivieren'); return renderHome(); }
    return renderQuizTask(topKey, sub, HOF_PROBLEMS, 'sach');
  }
  if (sub.special === 'machinediary') {
    if (!Settings.isEnabled('machine_diary')) { alert('In Einstellungen aktivieren'); return renderHome(); }
    return renderMachineDiaryTask(topKey, sub);
  }
  if (sub.special === 'schlau') return renderSchlauTask(topKey, sub);
  if (sub.special === 'odd') return renderQuizTask(topKey, sub, ODD_ONE_OUT, 'extra');
  if (sub.special === 'spot') return renderSpotTask();
  if (sub.special === 'focus') return renderFocusTask();
  // Standard: Backend-Pool oder kuratierter Sub-Pool
  if (sub.backend) return renderTask(sub.backend);
  // Sub-Pool aus data.js
  const poolMap = {
    liam: {
      'mathe.mal_geteilt': LIAM_MAL_GETEILT,
      'mathe.zahlenraum': LIAM_ZAHLENRAUM,
      'mathe.zahlenmuster': LIAM_ZAHLENMUSTER,
      'mathe.geometrie': LIAM_GEOMETRIE,
      'deutsch.rechtschreibung': LIAM_RECHTSCHREIBUNG,
      'deutsch.wortarten': LIAM_WORTARTEN,
      'deutsch.wortschatz': LIAM_WORTSCHATZ,
      'deutsch.lueckentext': LIAM_LUECKENTEXT
    },
    raik: {
      'mathe.zahlenraum': RAIK_ZAHLENRAUM,
      'mathe.sachaufgabe': RAIK_SACHAUFGABE,
      'mathe.geometrie': RAIK_GEOMETRIE,
      'deutsch.rechtschreibung': RAIK_RECHTSCHREIBUNG,
      'deutsch.wortschatz': RAIK_WORTSCHATZ
    }
  };
  const key = `${topKey}.${sub.id}`;
  const pool = poolMap[currentProfile]?.[key];
  if (pool) {
    const isMath = topKey === 'mathe';
    return renderQuizTask(topKey, sub, pool, isMath ? 'math' : 'read');
  }
  // Fallback
  alert('Diese Aufgabe kommt bald! 🚧');
  renderHome();
}

// Generische Quiz-Render für kuratierte Pools (mit options/correct ODER q/a) + Anti-Wiederhol
const _quizRecent = {}; // poolKey -> [indices]
function renderQuizTask(topKey, sub, pool, statKey) {
  clear();
  const p = State.data.profiles[currentProfile];
  document.body.className = 'theme-' + p.theme;
  // Anti-Wiederhol pro (currentProfile + topKey + sub)
  const key = currentProfile + ':' + topKey + ':' + sub.id;
  if (!_quizRecent[key]) _quizRecent[key] = [];
  const recent = _quizRecent[key];
  let avail = pool.map((_,i) => i).filter(i => !recent.includes(i));
  if (avail.length === 0) avail = pool.map((_,i) => i);
  const idx = avail[Math.floor(Math.random() * avail.length)];
  recent.push(idx);
  const maxRecent = Math.min(8, Math.floor(pool.length * 0.7));
  while (recent.length > maxRecent) recent.shift();
  const item = pool[idx];
  currentTask = { subject: statKey, item, fiftyUsed: false };

  const tb = el('div',{class:'topbar'},
    el('button',{class:'back', text:'⬅️', onclick: ()=> renderSubjectHub(topKey)}),
    el('div',{text: sub.label}),
    el('div',{class:'score'}, el('span',{class:'icon',text:'🪙'}), el('span',{text:p.coins}))
  );
  root.appendChild(tb);
  renderPowerupBar();
  const task = el('div',{class:'task'});

  if (item.options && typeof item.correct === 'number') {
    const head = el('div',{class:'task-text'});
    if (item.img) head.appendChild(el('div',{html:'<div style="font-size:80px;margin-bottom:12px">'+item.img+'</div>'}));
    head.appendChild(el('div',{text:item.q,attrs:{style:'font-size:22px'}}));
    task.appendChild(head);
    const opts = el('div',{class:'options'});
    item.options.forEach((o,i) => {
      opts.appendChild(el('button',{class:'opt', text:o, onclick:(e)=>answer(e.target, i===item.correct, ()=>renderQuizTask(topKey, sub, pool, statKey))}));
    });
    task.appendChild(opts);
  } else if (typeof item.a === 'number') {
    const mathBox = el('div',{class:'task-text'});
    const visual = item.visual || autoVisualForMath(item.q);
    if (visual) mathBox.appendChild(el('div',{html:`<div style="font-size:36px;margin-bottom:10px;line-height:1.3">${visual}</div>`}));
    mathBox.appendChild(el('div',{text:item.q, attrs:{style:'font-size:24px'}}));
    task.appendChild(mathBox);
    const inputBox = el('div',{class:'input-task'});
    const input = el('input',{attrs:{type:'tel',inputmode:'numeric'}});
    const btn = el('button',{text:'✓ Fertig'});
    btn.addEventListener('click', () => {
      const val = parseInt(input.value, 10);
      const correct = val === item.a;
      btn.style.background = correct ? '#4caf50' : '#e53935';
      btn.textContent = correct ? '✓ Richtig!' : `✗ Richtig: ${item.a}`;
      const result = recordAnswer(currentProfile, statKey, correct);
      if (correct) showCoinToast(result);
      if (typeof sfxCorrect === 'function') correct ? sfxCorrect() : sfxWrong();
      if (typeof schedulePush === 'function') schedulePush(currentProfile);
      setTimeout(() => {
        const cont = ()=> renderQuizTask(topKey, sub, pool, statKey);
        if (result.unlocked) { sfxUnlock?.(); showReward(result.unlocked, ()=> maybePauseOrContinue(statKey, cont)); }
        else maybePauseOrContinue(statKey, cont);
      }, correct ? 800 : 1800);
    });
    input.addEventListener('keyup', e => { if (e.key === 'Enter') btn.click(); });
    inputBox.appendChild(input); inputBox.appendChild(btn);
    task.appendChild(inputBox);
    setTimeout(()=>input.focus(), 100);
  }
  root.appendChild(task);
}

function renderPowerupBar() {
  if (!Settings.isEnabled('powerups')) return;
  const p = State.data.profiles[currentProfile];
  const pwrBar = el('div',{class:'powerups'});
  POWERUPS.forEach(pu => {
    const canAfford = p.coins >= pu.price;
    const isActive = pu.id === 'double' && p.powerup_double;
    const usedThisTask = pu.id === 'fifty' && currentTask?.fiftyUsed;
    pwrBar.appendChild(el('button',{
      class:'pwr ' + (isActive?'active':'') + (!canAfford||usedThisTask?' disabled':''),
      onclick:()=> {
        if (!canAfford||usedThisTask) return;
        if (pu.id==='fifty') applyFifty();
        else if (pu.id==='skip') applySkip();
        else if (pu.id==='double') applyDouble();
      }
    }, el('span',{class:'em',text:pu.icon}), el('span',{text:pu.price+'🪙'})));
  });
  root.appendChild(pwrBar);
}

// ===== Aufgabe =====
let currentTask = null;
async function renderTask(subject){
  clear();
  const p = State.data.profiles[currentProfile];
  document.body.className = 'theme-' + p.theme;

  // 50% Chance: KI-Aufgabe vom Server holen (wenn Sync verfügbar). Fallback: lokal.
  let item;
  const useAI = typeof Sync !== 'undefined' && Sync.online && Math.random() < 0.5;
  if (useAI) {
    const aiPayload = await Promise.race([
      Sync.fetchAITask(currentProfile, subject),
      new Promise(res => setTimeout(()=>res(null), 4000))
    ]);
    if (aiPayload && (aiPayload.q || aiPayload.text)) {
      // Normalisiere Felder: Mathe braucht 'a', andere 'options/correct'; Lese hat 'text'
      item = aiPayload;
      if (subject === 'read' && currentProfile === 'liam' && !item.text) item.text = item.q || '';
    }
  }
  if (!item) {
    const picked = pickTask(currentProfile, subject);
    item = picked.item;
  }
  currentTask = { subject, item, fiftyUsed: false };

  const titles = {read:'📖 Lesen', math:'➕ Rechnen', sach:'🌍 Sachkunde', musik:'🎵 Musik'};
  const top = el('div',{class:'topbar'},
    el('button',{class:'back', text:'⬅️', onclick: renderHome}),
    el('div',{text: titles[subject]}),
    el('div',{class:'score'}, el('span',{class:'icon',text:'🪙'}), el('span',{text:p.coins}))
  );
  root.appendChild(top);

  // Sanduhr-Timer (wenn Setting on)
  if (Settings.isEnabled('hourglass_timer')) {
    const sec = currentProfile==='raik' ? 45 : 60;
    const timerBar = el('div',{attrs:{style:'background:rgba(0,0,0,.3);height:6px;width:100%'}});
    const fill = el('div',{attrs:{style:`width:100%;height:100%;background:linear-gradient(90deg,#4caf50,#ffc107,#e53935);transition:width 1s linear`}});
    timerBar.appendChild(fill);
    root.appendChild(timerBar);
    let left = sec;
    const iv = setInterval(()=>{
      left--;
      fill.style.width = (left/sec*100)+'%';
      if (left <= 0) { clearInterval(iv); }
    }, 1000);
    if (!currentTask) currentTask = {};
    currentTask._timer = iv;
  }

  // Power-Up-Leiste (nur wenn Setting on)
  if (!Settings.isEnabled('powerups')) { /* skip */ } else {
  const pwrBar = el('div',{class:'powerups'});
  POWERUPS.forEach(pu => {
    const canAfford = p.coins >= pu.price;
    const isActive = pu.id === 'double' && p.powerup_double;
    const usedThisTask = pu.id === 'fifty' && currentTask.fiftyUsed;
    const btn = el('button',{
      class:'pwr ' + (isActive ? 'active' : '') + (!canAfford || usedThisTask ? ' disabled' : ''),
      attrs:{title: pu.desc + ' (Kostet '+pu.price+')'},
      onclick: ()=> {
        if (!canAfford || usedThisTask) return;
        if (pu.id === 'fifty') applyFifty();
        else if (pu.id === 'skip') applySkip();
        else if (pu.id === 'double') applyDouble();
      }
    },
      el('span',{class:'em', text: pu.icon}),
      el('span',{text: pu.price+'🪙'})
    );
    pwrBar.appendChild(btn);
  });
  root.appendChild(pwrBar);
  }

  const task = el('div',{class:'task'});

  // SACHKUNDE + MUSIK – beide haben options + correct, optional img
  if (subject==='sach' || subject==='musik') {
    const head = el('div',{class:'task-text'});
    if (item.img) head.appendChild(el('div',{html:'<div style="font-size:80px;margin-bottom:12px">'+item.img+'</div>'}));
    head.appendChild(el('div',{text:item.q,attrs:{style:'font-size:24px'}}));
    task.appendChild(head);
    const opts = el('div',{class:'options'});
    item.options.forEach((o,i) => {
      opts.appendChild(el('button',{class:'opt', text:o, onclick:(e)=>answer(e.target, i===item.correct, ()=>renderTask(subject))}));
    });
    task.appendChild(opts);
  }
  // LESEN
  else if (subject==='read') {
    if (currentProfile==='liam') {
      // Story + Vorlese-Button + 4 Optionen
      const story = el('div',{class:'task-text story', text: item.text});
      task.appendChild(story);
      if (Settings.isEnabled('tts')) task.appendChild(el('button',{
        text:'🔊 Vorlesen',
        onclick: ()=> speak(item.text + '. ' + item.q),
        attrs:{style:'align-self:center;padding:10px 20px;background:#1976d2;color:#fff;border:none;border-radius:12px;font-weight:700;margin-bottom:10px;cursor:pointer'}
      }));
      task.appendChild(el('div',{class:'task-text', text: item.q, attrs:{style:'min-height:60px;font-size:22px'}}));
      const opts = el('div',{class:'options'});
      item.options.forEach((o,i) => {
        opts.appendChild(el('button',{class:'opt', text:o, onclick:(e)=>answer(e.target, i===item.correct, ()=>renderTask('read'))}));
      });
      task.appendChild(opts);
    } else {
      // Raik: kurze Frage + Bild + 4 Optionen
      const head = el('div',{class:'task-text'},
        item.img ? el('div',{html:'<div style="font-size:80px">'+item.img+'</div>'}) : null,
        el('div',{text:item.text})
      );
      task.appendChild(head);
      const opts = el('div',{class:'options'});
      item.options.forEach((o,i) => {
        opts.appendChild(el('button',{class:'opt', text:o, onclick:(e)=>answer(e.target, i===item.correct, ()=>renderTask('read'))}));
      });
      task.appendChild(opts);
    }
  }
  // RECHNEN
  else {
    const mathBox = el('div',{class:'task-text'});
    // Auto-Visual: bei Mathe-Aufgaben mit Schlüsselwörtern visualisiere die kleinen Zahlen mit Emojis
    if (Settings.isEnabled('visuals')) {
      const visual = item.visual || autoVisualForMath(item.q);
      if (visual) mathBox.appendChild(el('div',{html:`<div style="font-size:36px;margin-bottom:10px;line-height:1.3">${visual}</div>`}));
    }
    mathBox.appendChild(el('div',{text: item.q, attrs:{style:'font-size:24px'}}));
    task.appendChild(mathBox);
    const inputBox = el('div',{class:'input-task'});
    const input = el('input',{attrs:{type:'tel', inputmode:'numeric', autocomplete:'off'}});
    const btn = el('button',{text:'✓ Fertig'});
    btn.addEventListener('click', () => {
      const val = parseInt(input.value, 10);
      const correct = val === item.a;
      btn.classList.add(correct ? 'correct' : 'wrong');
      btn.style.background = correct ? '#4caf50' : '#e53935';
      btn.textContent = correct ? '✓ Richtig!' : `✗ Richtig wäre: ${item.a}`;
      const result = recordAnswer(currentProfile, currentTask.subject, correct);
      if (correct) showCoinToast(result);
      if (typeof sfxCorrect === 'function') correct ? sfxCorrect() : sfxWrong();
      if (typeof schedulePush === 'function') schedulePush(currentProfile);
      setTimeout(() => {
        if (result.unlocked) { if (typeof sfxUnlock === 'function') sfxUnlock(); showReward(result.unlocked, ()=>maybePauseOrContinue('math')); }
        else maybePauseOrContinue('math');
      }, correct ? 800 : 1800);
    });
    input.addEventListener('keyup', (e) => { if (e.key==='Enter') btn.click(); });
    inputBox.appendChild(input);
    inputBox.appendChild(btn);
    task.appendChild(inputBox);
    setTimeout(()=>input.focus(), 100);
  }

  root.appendChild(task);
}

// Power-Up Aktionen
function applyFifty(){
  if (!usePowerup(currentProfile, 'fifty')) return;
  currentTask.fiftyUsed = true;
  const item = currentTask.item;
  const wrongIdx = item.options.map((_,i)=>i).filter(i => i !== item.correct);
  shuffle(wrongIdx);
  const toHide = wrongIdx.slice(0, 2);
  document.querySelectorAll('.opt').forEach((b,i) => {
    if (toHide.includes(i)) b.classList.add('fifty-out');
  });
  // PowerUp-Bar refresh
  refreshPowerupBar();
}
function applySkip(){
  if (!usePowerup(currentProfile, 'skip')) return;
  if (typeof schedulePush === 'function') schedulePush(currentProfile);
  renderTask(currentTask.subject);
}
function applyDouble(){
  if (!usePowerup(currentProfile, 'double')) return;
  if (typeof schedulePush === 'function') schedulePush(currentProfile);
  refreshPowerupBar();
}
function refreshPowerupBar(){
  const oldBar = document.querySelector('.powerups');
  if (!oldBar) return;
  const p = State.data.profiles[currentProfile];
  oldBar.innerHTML = '';
  POWERUPS.forEach(pu => {
    const canAfford = p.coins >= pu.price;
    const isActive = pu.id === 'double' && p.powerup_double;
    const usedThisTask = pu.id === 'fifty' && currentTask.fiftyUsed;
    const btn = el('button',{
      class:'pwr ' + (isActive ? 'active' : '') + (!canAfford || usedThisTask ? ' disabled' : ''),
      onclick: ()=> {
        if (!canAfford || usedThisTask) return;
        if (pu.id === 'fifty') applyFifty();
        else if (pu.id === 'skip') applySkip();
        else if (pu.id === 'double') applyDouble();
      }
    },
      el('span',{class:'em', text: pu.icon}),
      el('span',{text: pu.price+'🪙'})
    );
    oldBar.appendChild(btn);
  });
}
function shuffle(arr){ for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];} return arr; }

// Auto-Visual für Mathe: erkennt Schlüsselwörter und macht Emoji-Reihen
function autoVisualForMath(q) {
  if (!q) return null;
  const ql = q.toLowerCase();
  const map = [
    {kw:/münze|muenze/, em:'🪙'},
    {kw:/ring/, em:'💍'},
    {kw:/pilz/, em:'🍄'},
    {kw:/kirsch/, em:'🍒'},
    {kw:/bombe/, em:'💣'},
    {kw:/stroh|ball/, em:'🟡'},
    {kw:/küh|kuh|rind/, em:'🐮'},
    {kw:/ei /, em:'🥚'},
    {kw:/apfel/, em:'🍎'},
    {kw:/stern/, em:'⭐'},
    {kw:/blume/, em:'🌼'},
    {kw:/edelstein/, em:'💎'}
  ];
  let emoji = null;
  for (const m of map) if (m.kw.test(ql)) { emoji = m.em; break; }
  if (!emoji) return null;
  const nums = (q.match(/\d+/g) || []).map(n => parseInt(n,10)).filter(n => n > 0 && n <= 12);
  if (nums.length < 1 || nums.length > 3) return null;
  const isMinus = /weniger|verliert|minus|gibt|ab|wirft|ohne|abz/.test(ql);
  const sign = isMinus ? ' − ' : ' + ';
  return nums.map(n => emoji.repeat(n)).join(sign);
}

function answer(btn, correct, next){
  // alle Buttons disabled
  btn.parentElement.querySelectorAll('button').forEach(b => b.disabled = true);
  btn.classList.add(correct ? 'correct' : 'wrong');
  if (!correct) {
    // markiere richtige Antwort grün
    const item = currentTask.item;
    btn.parentElement.querySelectorAll('button').forEach((b,i)=>{
      if (i === item.correct) b.classList.add('correct');
    });
  }
  const result = recordAnswer(currentProfile, currentTask.subject, correct);
  if (correct) showCoinToast(result);
  // Lern-Zeit tracken: 30 Sek pro Antwort als Schätzung
  trackLearnTime?.(currentProfile, 30);
  if (typeof sfxCorrect === 'function') correct ? sfxCorrect() : sfxWrong();
  if (typeof schedulePush === 'function') schedulePush(currentProfile);
  setTimeout(() => {
    if (result.unlocked) { if (typeof sfxUnlock === 'function') sfxUnlock(); showReward(result.unlocked, ()=>maybePauseOrContinue(currentTask.subject, next)); }
    else maybePauseOrContinue(currentTask.subject, next);
  }, correct ? 900 : 1800);
}

function maybePauseOrContinue(subject, next){
  const p = State.data.profiles[currentProfile];
  // Raik: nach 5 richtigen Antworten erscheint ein wildes Pokémon,
  // danach die Mini-Pause (ADHS-Modus)
  // Liam: Bewegungs-Pause nach 10 Aufgaben
  const trigger = currentProfile==='raik' ? 5 : 10;
  if ((p.sessionCount||0) >= trigger) {
    p.sessionCount = 0;
    State.save();
    const goOn = ()=> next ? next() : renderTask(subject);
    const pauseThenGo = ()=> Settings.isEnabled('movement_pause') ? showPauseScreen(goOn) : goOn();
    if (currentProfile === 'raik' && typeof pickWildPokemon === 'function') {
      const wild = pickWildPokemon(currentProfile);
      if (wild) return showCatchMoment(wild, pauseThenGo);
    }
    return pauseThenGo();
  }
  if (next) next(); else renderTask(subject);
}

// Kleiner Münz-Toast (Abwechslungs-Bonus / Schlaufuchs-Tipp), verschwindet von selbst
let _lastHintTs = 0;
function showCoinToast(result){
  if (!result) return;
  let text = null;
  if (result.bonus) text = '🌈 Abwechslungs-Bonus! +1 🪙';
  else if (result.firstReduced && Date.now() - _lastHintTs > 60000) {
    text = '🌈 Tipp: Wechsel mal das Fach – volle Münzen!';
    _lastHintTs = Date.now();
  }
  if (!text) return;
  const t = el('div',{class:'coin-toast', text});
  document.body.appendChild(t);
  setTimeout(()=> t.remove(), 2200);
}

// Konfetti-Regen für Belohnungs-Momente (rein CSS-animiert, kurz und leicht)
function spawnConfetti(container, count=28){
  const colors = ['#ffd700','#ff5252','#40c4ff','#69f0ae','#ff9800','#e040fb','#fff176'];
  for (let i=0; i<count; i++) {
    const f = document.createElement('div');
    f.className = 'confetti';
    f.style.left = Math.random()*100 + '%';
    f.style.background = colors[i % colors.length];
    f.style.animationDelay = (Math.random()*0.5) + 's';
    f.style.animationDuration = (1.5 + Math.random()*1.3) + 's';
    container.appendChild(f);
    setTimeout(()=> f.remove(), 3500);
  }
}

function showReward(item, then){
  let visual;
  if (item.img) {
    visual = document.createElement('img');
    visual.className = 'reward-img';
    visual.src = item.img;
    visual.alt = item.name;
    visual.onerror = ()=> { visual.replaceWith(el('div',{class:'big', text: item.icon || '🎁'})); };
  } else {
    visual = el('div',{class:'big', text: item.icon});
  }
  let rewardDone = false; // Doppel-Tap-Schutz (Tablet!)
  const overlay = el('div',{class:'reward'},
    visual,
    el('div',{class:'text', text:'NEU FREIGESCHALTET!'}),
    el('div',{class:'sub', text: item.name}),
    el('button',{text:'Weiter machen!', onclick: ()=>{ if (rewardDone) return; rewardDone = true; overlay.remove(); then(); }})
  );
  spawnConfetti(overlay);
  root.appendChild(overlay);
}

// ===== Pokémon-Fang-Moment (Raik) =====
// Kurz und knackig: Pokémon erscheint → Tipp auf den Pokéball →
// einsaugen, wackeln, gefangen! Kein Fehlschlag möglich.
function showCatchMoment(wild, then){
  const c = wild.char;
  const overlay = el('div',{class:'catch-overlay' + (wild.legendary ? ' legendary' : '')});
  const title = el('div',{class:'catch-title',
    text: (wild.legendary ? '⭐ Ein legendäres ' : 'Ein wildes ') + c.name + ' erscheint!'});
  const stage = el('div',{class:'catch-stage'});
  let poke;
  if (c.img) {
    poke = document.createElement('img');
    poke.className = 'catch-poke';
    poke.src = c.img;
    poke.alt = c.name;
    poke.onerror = ()=> {
      const fb = el('div',{class:'catch-poke catch-poke-emoji', text: c.icon || '🔮'});
      poke.replaceWith(fb);
    };
  } else {
    poke = el('div',{class:'catch-poke catch-poke-emoji', text: c.icon || '🔮'});
  }
  stage.appendChild(poke);
  const ballZone = el('div',{class:'catch-ballzone'});
  const ball = el('div',{class:'pokeball idle'});
  const hint = el('div',{class:'catch-hint', text:'Tippe den Pokéball!'});
  ballZone.appendChild(ball);
  ballZone.appendChild(hint);
  overlay.appendChild(title);
  overlay.appendChild(stage);
  overlay.appendChild(ballZone);
  document.body.appendChild(overlay);
  if (typeof playSound === 'function') playSound(wild.legendary ? 'fanfare' : 'sparkle');

  let thrown = false;
  let finished = false; // Doppel-Tap-Schutz für den Weiter-Button
  const autoTimer = setTimeout(doThrow, 8000); // wirft automatisch, falls nicht getippt
  function doThrow(){
    if (thrown) return;
    thrown = true;
    clearTimeout(autoTimer);
    hint.remove();
    ball.classList.remove('idle');
    if (typeof playSound === 'function') playSound('whoosh');
    const target = stage.querySelector('.catch-poke');
    if (target) target.classList.add('sucked');
    setTimeout(()=>{
      if (typeof playSound === 'function') playSound('pow');
      ball.classList.add('wobble');
      setTimeout(()=>{
        ball.classList.remove('wobble');
        ball.classList.add('caught');
        const r = catchPokemon(currentProfile, c.id);
        if (typeof schedulePush === 'function') schedulePush(currentProfile);
        if (typeof sfxUnlock === 'function') sfxUnlock();
        spawnConfetti(overlay);
        title.textContent = r.isNew
          ? c.name + ' wurde gefangen!'
          : c.name + ' war schon da – +15 Münzen!';
        const done = el('div',{class:'catch-done'});
        if (c.img) {
          const mini = document.createElement('img');
          mini.className = 'catch-mini';
          mini.src = c.img;
          mini.alt = c.name;
          mini.onerror = ()=> mini.remove();
          done.appendChild(mini);
        }
        if (r.isNew) done.appendChild(el('div',{class:'catch-sub', text:'Ab in deinen Pokédex! 📕'}));
        done.appendChild(el('button',{class:'catch-btn', text:'Weiter!',
          onclick: ()=>{ if (finished) return; finished = true; overlay.remove(); then(); }}));
        overlay.appendChild(done);
      }, 1400);
    }, 600);
  }
  ball.addEventListener('click', doThrow);
  overlay.addEventListener('click', ()=> { if (!thrown) doThrow(); });
}

function showPauseScreen(then, msgText){
  const overlay = el('div',{class:'pause'});
  const msg = el('div',{class:'text', text: msgText || '⚡ Mini-Pause! Steh kurz auf, streck dich!'});
  msg.style.cssText = 'font-size:32px;font-weight:900;color:#fff;text-align:center;padding:0 24px;text-shadow:0 4px 0 rgba(0,0,0,.3)';
  const cd = el('div',{class:'countdown', text:'10'});
  overlay.appendChild(msg);
  overlay.appendChild(cd);
  document.body.appendChild(overlay);
  let n = 10;
  let pauseDone = false;
  const iv = setInterval(()=>{
    n--;
    cd.textContent = n;
    if (n<=0 && !pauseDone) { pauseDone = true; clearInterval(iv); overlay.remove(); then(); }
  }, 1000);
}

// ===== Sammlung (Garage / Charaktere) =====
function renderCollection(){
  clear();
  const p = State.data.profiles[currentProfile];
  document.body.className = 'theme-' + p.theme;
  const collection = currentProfile==='liam' ? MACHINES : CHARS;
  const top = el('div',{class:'topbar'},
    el('button',{class:'back', text:'⬅️', onclick: renderHome}),
    el('div',{text: currentProfile==='liam' ? '🏚️ Garage' : '🌟 Charaktere'}),
    el('div',{class:'score'}, el('span',{class:'icon',text:'🪙'}), el('span',{text:p.coins}))
  );
  root.appendChild(top);
  const wrap = el('div',{class:'collection'});
  wrap.appendChild(el('h2',{text:`${p.unlocked.length} / ${collection.length} freigeschaltet · Tippe an um anzuschauen`}));

  // Pokédex-Banner (Raik): Fortschritt + Einstieg in die Pokédex-Ansicht
  if (currentProfile === 'raik' && typeof POKEDEX !== 'undefined' && typeof caughtDexNumbers === 'function') {
    const caught = caughtDexNumbers(p).size;
    const pct = Math.round(caught / POKEDEX.length * 100);
    const banner = el('div',{class:'dex-banner', onclick: renderPokedex});
    banner.appendChild(el('div',{class:'dex-banner-title', text:'📕 Pokédex'}));
    banner.appendChild(el('div',{class:'dex-banner-count', text:`Gefangen: ${caught} / ${POKEDEX.length}`}));
    const bar = el('div',{class:'dex-bar'});
    const fill = el('div',{class:'dex-bar-fill'});
    fill.style.width = pct + '%';
    bar.appendChild(fill);
    banner.appendChild(bar);
    banner.appendChild(el('div',{class:'dex-banner-hint', text:'Wilde Pokémon fängst du mit 5 richtigen Antworten!'}));
    wrap.appendChild(banner);
  }

  // Booster-Pack-Button (wenn cards-Feature on UND etwas freigeschaltet)
  if (Settings.isEnabled('collection_cards') && p.unlocked.length > 0) {
    const COST = 25;
    const canAfford = p.coins >= COST;
    const totalCards = Object.values(p.cards||{}).reduce((s,arr)=>s+arr.length, 0);
    const boosterBox = el('div',{attrs:{style:'background:linear-gradient(135deg,#7e57c2,#1976d2);padding:14px;border-radius:14px;margin-bottom:14px;color:#fff;text-align:center'}});
    boosterBox.innerHTML = `🎴 <b>${totalCards}</b> Karten gesammelt`;
    const btn = el('button',{
      text: canAfford ? `📦 Booster-Pack öffnen (${COST} 🪙)` : `🔒 ${COST}🪙 fehlen`,
      attrs:{style:`display:block;width:100%;margin-top:8px;padding:14px;background:${canAfford?'#ffc107':'#666'};color:${canAfford?'#000':'#aaa'};border:none;border-radius:10px;font-weight:900;font-size:16px;cursor:${canAfford?'pointer':'not-allowed'}`},
      onclick: ()=> { if (canAfford) openBoosterAnimation(); }
    });
    boosterBox.appendChild(btn);
    wrap.appendChild(boosterBox);
  }

  const grid = el('div',{class:'coll-grid'});
  collection.forEach(item => {
    const unlocked = p.unlocked.includes(item.id);
    const canAfford = !unlocked && p.coins >= item.price;
    const cell = el('div',{class:'coll-item ' + (unlocked?'unlocked':'locked'),
      attrs: !unlocked && canAfford ? {style:'cursor:pointer;border:2px solid #ffc107;background:rgba(255,193,7,.15)'} : null,
      onclick: unlocked
        ? ()=> (currentProfile==='liam' ? renderMachineDetail(item.id) : renderCharDetail(item.id))
        : (canAfford ? ()=> tryBuyItem(item.id) : null)
    });
    if (item.img) {
      const img = document.createElement('img');
      img.className = 'thumb';
      img.src = item.img;
      img.alt = item.name;
      // Wenn nicht freigeschaltet: graustufig + dunkel
      if (!unlocked) img.style.cssText += 'filter:grayscale(1) brightness(.4) contrast(.9);opacity:.6';
      img.onerror = () => { img.replaceWith(el('div',{class:'icon', text: unlocked ? item.icon : '🔒'})); };
      cell.appendChild(img);
    } else {
      cell.appendChild(el('div',{class:'icon', text: unlocked ? item.icon : '🔒'}));
    }
    if (unlocked) {
      cell.appendChild(el('div',{text: item.name, attrs:{style:'font-weight:700'}}));
    } else {
      cell.appendChild(el('div',{text: item.name, attrs:{style:'opacity:.7;font-size:12px;margin-top:4px'}}));
      cell.appendChild(el('div',{text: canAfford ? `KAUFEN` : `🔒`,
        attrs:{style:`margin-top:6px;font-size:13px;font-weight:900;color:${canAfford?'#ff6f00':'#888'}`}}));
      cell.appendChild(el('div',{text: `${item.price} 🪙`,
        attrs:{style:`margin-top:4px;font-size:22px;font-weight:900;color:${canAfford?'#ff6f00':'#fbc02d'};text-shadow:0 1px 0 rgba(0,0,0,.3)`}}));
    }
    grid.appendChild(cell);
  });
  wrap.appendChild(grid);
  root.appendChild(wrap);
}

// ===== Straßenschläue 🦊: Alltags-Szenarien mit Warum-Erklärung =====
function renderSchlauTask(topKey, sub){
  clear();
  const p = State.data.profiles[currentProfile];
  document.body.className = 'theme-' + p.theme;
  const pool = currentProfile === 'liam' ? SCHLAU_LIAM : SCHLAU_RAIK;
  const key = currentProfile + ':schlau';
  if (!_quizRecent[key]) _quizRecent[key] = [];
  const recent = _quizRecent[key];
  let avail = pool.map((_,i) => i).filter(i => !recent.includes(i));
  if (avail.length === 0) avail = pool.map((_,i) => i);
  const idx = avail[Math.floor(Math.random() * avail.length)];
  recent.push(idx);
  const maxRecent = Math.min(15, Math.floor(pool.length * 0.7));
  while (recent.length > maxRecent) recent.shift();
  const item = pool[idx];
  currentTask = { subject: 'schlau', item, fiftyUsed: false };

  const tb = el('div',{class:'topbar'},
    el('button',{class:'back', text:'⬅️', onclick: ()=> renderSubjectHub(topKey)}),
    el('div',{text:'🦊 Schlaufuchs'}),
    el('div',{class:'score'}, el('span',{class:'icon',text:'🪙'}), el('span',{text:p.coins}))
  );
  root.appendChild(tb);
  const task = el('div',{class:'task schlau-task'});
  const head = el('div',{class:'task-text'});
  const headInner = el('div');
  if (item.img) headInner.appendChild(el('div',{text:item.img, attrs:{style:'font-size:60px;margin-bottom:8px'}}));
  headInner.appendChild(el('div',{text:item.q, attrs:{style:'font-size:20px'}}));
  head.appendChild(headInner);
  task.appendChild(head);
  const opts = el('div',{class:'options'});
  item.options.forEach((o,i) => {
    opts.appendChild(el('button',{class:'opt', text:o,
      attrs:{style:'font-size:18px;padding:18px 12px'},
      onclick:(e)=> schlauAnswer(e.target, i, item, ()=> renderSchlauTask(topKey, sub))}));
  });
  task.appendChild(opts);
  root.appendChild(task);
}

// Antwort + Warum-Box (die Erklärung ist der eigentliche Lernkern)
function schlauAnswer(btn, i, item, next){
  const correct = i === item.correct;
  const buttons = btn.parentElement.querySelectorAll('button');
  buttons.forEach(b => b.disabled = true);
  btn.classList.add(correct ? 'correct' : 'wrong');
  buttons[item.correct].classList.add('correct');
  const result = recordAnswer(currentProfile, 'schlau', correct);
  if (correct) showCoinToast(result);
  trackLearnTime?.(currentProfile, 30);
  if (typeof sfxCorrect === 'function') correct ? sfxCorrect() : sfxWrong();
  if (typeof schedulePush === 'function') schedulePush(currentProfile);
  const task = document.querySelector('.task');
  if (!task) return;
  const box = el('div',{class:'why-box'},
    el('div',{class:'why-title', text: correct ? '🦊 Genau! Und warum?' : '🦊 Kein Problem – hier ist der Trick:'}),
    el('div',{class:'why-text', text: item.why || ''}),
    el('button',{class:'why-btn', text:'Verstanden – weiter!', onclick:(e)=>{
      e.target.disabled = true;
      maybePauseOrContinue('schlau', next);
    }})
  );
  task.appendChild(box);
  setTimeout(()=> box.scrollIntoView({behavior:'smooth', block:'end'}), 100);
}

// ===== 🎲 Überraschungs-Runde: Zufallsmix quer durch alle Fächer =====
function renderSurpriseRound(){
  window._surpriseActive = true;
  renderSurpriseTask();
}

function surpriseSources(){
  if (currentProfile === 'liam') return [
    {subject:'math',  pool: typeof LIAM_MATH !== 'undefined' ? LIAM_MATH : null},
    {subject:'math',  pool: typeof LIAM_MAL_GETEILT !== 'undefined' ? LIAM_MAL_GETEILT : null},
    {subject:'math',  pool: typeof LIAM_ZAHLENRAUM !== 'undefined' ? LIAM_ZAHLENRAUM : null},
    {subject:'read',  pool: typeof LIAM_STORIES !== 'undefined' ? LIAM_STORIES : null},
    {subject:'read',  pool: typeof LIAM_RECHTSCHREIBUNG !== 'undefined' ? LIAM_RECHTSCHREIBUNG : null},
    {subject:'read',  pool: typeof LIAM_WORTSCHATZ !== 'undefined' ? LIAM_WORTSCHATZ : null},
    {subject:'sach',  pool: typeof LIAM_SACH !== 'undefined' ? LIAM_SACH : null},
    {subject:'musik', pool: typeof LIAM_MUSIK !== 'undefined' ? LIAM_MUSIK : null},
    {subject:'schlau',pool: typeof SCHLAU_LIAM !== 'undefined' ? SCHLAU_LIAM : null}
  ];
  return [
    {subject:'math',  pool: typeof RAIK_MATH !== 'undefined' ? RAIK_MATH : null},
    {subject:'math',  pool: typeof RAIK_ZAHLENRAUM !== 'undefined' ? RAIK_ZAHLENRAUM : null},
    {subject:'read',  pool: typeof RAIK_READING !== 'undefined' ? RAIK_READING : null},
    {subject:'read',  pool: typeof RAIK_WORTSCHATZ !== 'undefined' ? RAIK_WORTSCHATZ : null},
    {subject:'sach',  pool: typeof RAIK_SACH !== 'undefined' ? RAIK_SACH : null},
    {subject:'musik', pool: typeof RAIK_MUSIK !== 'undefined' ? RAIK_MUSIK : null},
    {subject:'schlau',pool: typeof SCHLAU_RAIK !== 'undefined' ? SCHLAU_RAIK : null}
  ];
}

function renderSurpriseTask(){
  window._surpriseActive = true;
  clear();
  const p = State.data.profiles[currentProfile];
  document.body.className = 'theme-' + p.theme;
  const sources = surpriseSources().filter(s => Array.isArray(s.pool) && s.pool.length > 0);
  if (sources.length === 0) return renderHome();
  const src = sources[Math.floor(Math.random() * sources.length)];
  const item = src.pool[Math.floor(Math.random() * src.pool.length)];
  currentTask = { subject: src.subject, item, fiftyUsed: false };

  const tb = el('div',{class:'topbar'},
    el('button',{class:'back', text:'⬅️', onclick: ()=>{ window._surpriseActive = false; renderHome(); }}),
    el('div',{text:'🎲 Überraschung!'}),
    el('div',{class:'score'}, el('span',{class:'icon',text:'🪙'}), el('span',{text:p.coins}))
  );
  root.appendChild(tb);
  const task = el('div',{class:'task schlau-task'});
  if (item.text) task.appendChild(el('div',{class:'task-text' + (item.text.length > 60 ? ' story' : ''), text: item.text}));
  if (item.img || item.q) {
    const head = el('div',{class:'task-text'});
    const inner = el('div');
    if (item.img) inner.appendChild(el('div',{text:item.img, attrs:{style:'font-size:60px;margin-bottom:8px'}}));
    if (item.q) inner.appendChild(el('div',{text:item.q, attrs:{style:'font-size:20px'}}));
    head.appendChild(inner);
    task.appendChild(head);
  }
  const finishTo = ()=> maybePauseOrContinue(src.subject, renderSurpriseTask);
  const adventureBonus = (result)=>{
    p.coins += 1;
    State.save();
    if (result && result.bonus) { showCoinToast(result); return; }
    const t = el('div',{class:'coin-toast', text:'🎲 Abenteuer-Bonus! +1 🪙'});
    document.body.appendChild(t);
    setTimeout(()=> t.remove(), 1800);
  };

  if (item.options && typeof item.correct === 'number') {
    const opts = el('div',{class:'options'});
    item.options.forEach((o,i) => {
      opts.appendChild(el('button',{class:'opt', text:o, onclick:(e)=>{
        const correct = i === item.correct;
        const bs = e.target.parentElement.querySelectorAll('button');
        bs.forEach(b => b.disabled = true);
        e.target.classList.add(correct ? 'correct' : 'wrong');
        bs[item.correct].classList.add('correct');
        const result = recordAnswer(currentProfile, src.subject, correct);
        if (correct) adventureBonus(result);
        trackLearnTime?.(currentProfile, 30);
        if (typeof sfxCorrect === 'function') correct ? sfxCorrect() : sfxWrong();
        if (typeof schedulePush === 'function') schedulePush(currentProfile);
        if (item.why) {
          const box = el('div',{class:'why-box'},
            el('div',{class:'why-title', text: correct ? '🦊 Genau! Und warum?' : '🦊 Kein Problem – hier ist der Trick:'}),
            el('div',{class:'why-text', text: item.why}),
            el('button',{class:'why-btn', text:'Verstanden – weiter!', onclick:(ev)=>{ ev.target.disabled = true; finishTo(); }})
          );
          task.appendChild(box);
          setTimeout(()=> box.scrollIntoView({behavior:'smooth', block:'end'}), 100);
        } else {
          setTimeout(finishTo, correct ? 900 : 1800);
        }
      }}));
    });
    task.appendChild(opts);
  } else if (typeof item.a === 'number') {
    const inputBox = el('div',{class:'input-task'});
    const input = el('input',{attrs:{type:'tel', inputmode:'numeric'}});
    const btn = el('button',{text:'✓ Fertig'});
    btn.addEventListener('click', ()=>{
      if (btn.disabled) return;
      btn.disabled = true;
      const val = parseInt(input.value, 10);
      const correct = val === item.a;
      btn.style.background = correct ? '#4caf50' : '#e53935';
      btn.textContent = correct ? '✓ Richtig!' : `✗ Richtig: ${item.a}`;
      const result = recordAnswer(currentProfile, src.subject, correct);
      if (correct) adventureBonus(result);
      trackLearnTime?.(currentProfile, 30);
      if (typeof sfxCorrect === 'function') correct ? sfxCorrect() : sfxWrong();
      if (typeof schedulePush === 'function') schedulePush(currentProfile);
      setTimeout(finishTo, correct ? 800 : 1800);
    });
    input.addEventListener('keyup', e => { if (e.key === 'Enter') btn.click(); });
    inputBox.appendChild(input);
    inputBox.appendChild(btn);
    task.appendChild(inputBox);
    setTimeout(()=> input.focus(), 100);
  } else {
    // Unbekanntes Format: einfach nächste Überraschung
    return renderSurpriseTask();
  }
  root.appendChild(task);
}

// ===== Alva (4): Zauberwelt-Startseite =====
function renderAlvaHome(){
  clear();
  document.body.className = 'theme-alva';
  const p = State.data.profiles.alva;
  const top = el('div',{class:'topbar'},
    el('button',{class:'back', text:'⬅️', onclick: renderPicker}),
    el('div',{text:'Hallo Alva! 🦄'}),
    el('div',{class:'score'}, el('span',{class:'icon',text:'🌟'}), el('span',{text: p.unlocked.length}))
  );
  root.appendChild(top);
  const home = el('div',{class:'home'});
  home.appendChild(el('div',{class:'greeting', text:'🌈 Deine Zauberwelt'}));
  const subs = el('div',{class:'subjects'});
  subs.appendChild(el('div',{class:'subject alva-tile', attrs:{style:'grid-column:span 2'}, onclick: renderTraceTask},
    el('span',{class:'em', text:'✏️'}),
    document.createTextNode('Malen & Schreiben')
  ));
  subs.appendChild(el('div',{class:'subject alva-tile', attrs:{style:'grid-column:span 2'}, onclick: renderAlvaStickers},
    el('span',{class:'em', text:'🦄'}),
    document.createTextNode('Meine Sticker'),
    el('div',{text:`${p.unlocked.length} / ${typeof ALVA_STICKERS !== 'undefined' ? ALVA_STICKERS.length : 0} gesammelt`,
      attrs:{style:'font-size:13px;margin-top:4px;font-weight:600;opacity:.8'}})
  ));
  if (typeof renderUnicornGame === 'function') {
    subs.appendChild(el('div',{class:'subject alva-tile', attrs:{style:'grid-column:span 2;background:linear-gradient(135deg,#fff,#e1bee7)'}, onclick: renderUnicornGame},
      el('span',{class:'em', text:'🌈'}),
      document.createTextNode('Einhorn-Magie'),
      el('div',{text:'Verglitzer die Schattenfee Wuselwolke!', attrs:{style:'font-size:13px;margin-top:4px;font-weight:600;opacity:.8'}})
    ));
  }
  home.appendChild(subs);
  root.appendChild(home);
}

// ===== Alva: Sticker-Sammlung =====
function renderAlvaStickers(){
  clear();
  document.body.className = 'theme-alva';
  const p = State.data.profiles.alva;
  const top = el('div',{class:'topbar'},
    el('button',{class:'back', text:'⬅️', onclick: renderAlvaHome}),
    el('div',{text:'🦄 Meine Sticker'}),
    el('div',{class:'score'}, el('span',{class:'icon',text:'🌟'}), el('span',{text: p.unlocked.length}))
  );
  root.appendChild(top);
  const wrap = el('div',{class:'collection'});
  wrap.appendChild(el('h2',{text:`${p.unlocked.length} / ${ALVA_STICKERS.length} Sticker gesammelt`}));
  const grid = el('div',{class:'sticker-grid'});
  ALVA_STICKERS.forEach(s => {
    const got = p.unlocked.includes(s.id);
    const cell = el('div',{class:'sticker-item ' + (got ? 'got' : 'missing'),
      onclick: got ? ()=> showAlvaStickerDetail(s) : null});
    if (got) cell.style.background = s.color || '#f8bbd0';
    cell.appendChild(el('div',{class:'big', text: got ? s.emoji : '❓'}));
    cell.appendChild(el('div',{class:'nm', text: got ? s.name : '???'}));
    grid.appendChild(cell);
  });
  wrap.appendChild(grid);
  root.appendChild(wrap);
}

function showAlvaStickerDetail(s){
  let done = false;
  const overlay = el('div',{class:'reward'},
    el('div',{class:'sticker-big', text: s.emoji, attrs:{style:'background:' + (s.color||'#f8bbd0')}}),
    el('div',{class:'text', text: s.name}),
    el('div',{class:'sub', text: s.desc, attrs:{style:'max-width:320px;text-align:center;font-size:17px;line-height:1.5'}}),
    Settings.isEnabled('tts')
      ? el('button',{text:'🔊 Vorlesen', onclick: (e)=>{ e.stopPropagation(); speak(s.name + '. ' + s.desc); },
          attrs:{style:'margin-top:14px;padding:10px 22px;background:#7b1fa2;color:#fff;border:none;border-radius:12px;font-weight:700;cursor:pointer;font-size:15px'}})
      : null,
    el('button',{text:'Toll! 💜', onclick: ()=>{ if (done) return; done = true; overlay.remove(); }})
  );
  document.body.appendChild(overlay);
  if (typeof playSound === 'function') playSound('shiny');
}

// ===== Alva: Sticker-Belohnung nach geschafftem Motiv =====
function showAlvaStickerReward(g){
  const s = g.sticker;
  let done = false;
  // Zauber-Enthüllung: erst Funkeln, dann ploppt der Sticker auf
  const big = el('div',{class:'sticker-big', text:'✨', attrs:{style:'background:rgba(255,255,255,.35)'}});
  setTimeout(()=>{
    big.textContent = s.emoji;
    big.style.background = s.color || '#f8bbd0';
    big.style.animation = 'none';
    void big.offsetWidth; // Animation neu starten
    big.style.animation = 'popIn .45s ease-out';
    if (typeof sfxUnlock === 'function') sfxUnlock();
  }, 600);
  const overlay = el('div',{class:'reward'},
    big,
    el('div',{class:'text', text: g.isNew ? 'Ein neuer Sticker für dich!' : s.name + ' besucht dich!'}),
    el('div',{class:'sub', text: s.emoji + ' ' + s.name, attrs:{style:'font-size:26px;font-weight:900'}}),
    el('button',{text:'Weiter malen! 🖍️', onclick: ()=>{
      if (done) return; done = true;
      overlay.remove();
      const p = State.data.profiles.alva;
      if ((p.sessionCount||0) >= 5) {
        p.sessionCount = 0;
        State.save();
        showPauseScreen(()=> renderTraceTask(), '💜 Kuschel-Pause! Schüttel mal die Hände aus!');
      } else {
        renderTraceTask();
      }
    }})
  );
  spawnConfetti(overlay);
  document.body.appendChild(overlay);
  if (typeof playSound === 'function') playSound('shiny');
}

// ===== Pokédex-Ansicht (Raik) =====
function renderPokedex(){
  clear();
  const p = State.data.profiles[currentProfile];
  document.body.className = 'theme-raik';
  const caughtSet = caughtDexNumbers(p);
  const top = el('div',{class:'topbar'},
    el('button',{class:'back', text:'⬅️', onclick: renderCollection}),
    el('div',{text:'📕 Pokédex'}),
    el('div',{class:'score'}, el('span',{class:'icon',text:'🪙'}), el('span',{text:p.coins}))
  );
  root.appendChild(top);
  const wrap = el('div',{class:'collection'});
  const head = el('div',{class:'dex-head'});
  head.appendChild(el('div',{class:'dex-head-count', text:`Gefangen: ${caughtSet.size} / ${POKEDEX.length}`}));
  const bar = el('div',{class:'dex-bar'});
  const fill = el('div',{class:'dex-bar-fill'});
  fill.style.width = Math.round(caughtSet.size / POKEDEX.length * 100) + '%';
  bar.appendChild(fill);
  head.appendChild(bar);
  wrap.appendChild(head);
  const grid = el('div',{class:'dex-grid'});
  for (const e of POKEDEX) {
    const caught = caughtSet.has(e.n);
    const cell = el('div',{class:'dex-item ' + (caught ? 'caught' : 'missing'),
      onclick: caught ? ()=> renderPokedexDetail(e.n) : null});
    const img = document.createElement('img');
    img.src = 'img/chars/pokemon/' + e.n + '.png';
    img.alt = caught ? e.de : '???';
    img.loading = 'lazy';
    if (!caught) img.className = 'silhouette';
    img.onerror = ()=> { img.replaceWith(el('div',{class:'dex-fallback', text: caught ? '🔮' : '❓'})); };
    cell.appendChild(img);
    cell.appendChild(el('div',{class:'dex-no', text:'#'+e.n}));
    cell.appendChild(el('div',{class:'dex-name', text: caught ? e.de : '???'}));
    grid.appendChild(cell);
  }
  wrap.appendChild(grid);
  root.appendChild(wrap);
}

// Detailkarte eines gefangenen Pokémon (Bild, Typ, Beschreibung)
function renderPokedexDetail(n){
  clear();
  const p = State.data.profiles[currentProfile];
  document.body.className = 'theme-raik';
  const e = POKEDEX.find(x => x.n === n);
  if (!e) return renderPokedex();
  const top = el('div',{class:'topbar'},
    el('button',{class:'back', text:'⬅️', onclick: renderPokedex}),
    el('div',{text:'📕 #' + e.n}),
    el('div',{class:'score'}, el('span',{class:'icon',text:'🪙'}), el('span',{text:p.coins}))
  );
  root.appendChild(top);
  const wrap = el('div',{class:'detail'});
  const card = el('div',{class:'detail-card'});
  const img = document.createElement('img');
  img.className = 'detail-img';
  img.src = 'img/chars/pokemon/' + e.n + '.png';
  img.alt = e.de;
  img.onerror = ()=> { img.replaceWith(el('div',{class:'detail-icon', text:'🔮'})); };
  card.appendChild(img);
  card.appendChild(el('div',{class:'detail-name', text: e.de, attrs:{style:'color:'+(e.color||'#1b5e20')}}));
  card.appendChild(el('div',{class:'detail-typ', text: '#' + e.n + ' · ' + (e.type || 'Pokemon')}));
  if (e.desc) {
    const sec = el('div',{class:'detail-section'});
    sec.appendChild(el('h4',{text:'Was ist das?'}));
    sec.appendChild(el('p',{text: e.desc}));
    card.appendChild(sec);
  }
  const charId = 'pkm_' + e.n;
  if (p.unlocked.includes(charId)) {
    card.appendChild(el('button',{text:'🌟 Anschauen & spielen',
      onclick: ()=> renderCharDetail(charId),
      attrs:{style:'display:block;margin:14px auto 0;padding:12px 24px;background:#e53935;color:#fff;border:none;border-radius:12px;font-weight:800;font-size:16px;cursor:pointer'}}));
  }
  if (Settings.isEnabled('tts') && e.desc) {
    card.appendChild(el('button',{text:'🔊 Vorlesen', onclick: ()=> speak(e.de + '. ' + (e.type||'') + '. ' + e.desc),
      attrs:{style:'display:block;margin:10px auto 0;padding:10px 20px;background:#1976d2;color:#fff;border:none;border-radius:10px;font-weight:700;cursor:pointer'}}));
  }
  wrap.appendChild(card);
  root.appendChild(wrap);
}

// ===== Item kaufen mit Bestätigungs-Dialog =====
function tryBuyItem(itemId) {
  const collection = currentProfile==='liam' ? MACHINES : CHARS;
  const item = collection.find(x => x.id === itemId);
  if (!item) return;
  const overlay = document.createElement('div');
  overlay.className = 'reward';
  overlay.style.background = 'rgba(0,0,0,.85)';
  const card = document.createElement('div');
  card.style.cssText = 'background:#fff;color:#222;padding:24px;border-radius:20px;text-align:center;max-width:340px;box-shadow:0 12px 40px rgba(0,0,0,.6)';
  if (item.img) {
    const img = document.createElement('img');
    img.src = item.img;
    img.style.cssText = 'width:160px;height:160px;object-fit:contain;margin-bottom:10px;filter:grayscale(1) brightness(.5);transition:filter .8s';
    card.appendChild(img);
    setTimeout(()=> img.style.filter = 'none', 100);
  }
  card.appendChild(el('div',{text:`Möchtest du ${item.name} kaufen?`, attrs:{style:'font-size:20px;font-weight:900;margin-bottom:8px'}}));
  card.appendChild(el('div',{text:`Kosten: ${item.price} 🪙`, attrs:{style:'font-size:18px;color:#e65100;font-weight:700;margin-bottom:18px'}}));
  const btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:10px;justify-content:center';
  const buyBtn = el('button',{text:`✓ JA, kaufen!`,
    attrs:{style:'padding:14px 24px;background:#4caf50;color:#fff;border:none;border-radius:14px;font-weight:900;font-size:16px;cursor:pointer'},
    onclick:()=>{
      const r = buyItem(currentProfile, itemId);
      if (r.ok) {
        sfxUnlock?.();
        schedulePush?.(currentProfile);
        overlay.remove();
        showReward(item, ()=> renderCollection());
      } else { alert(r.reason); }
    }
  });
  const cancelBtn = el('button',{text:'Nein',
    attrs:{style:'padding:14px 24px;background:#bdbdbd;color:#222;border:none;border-radius:14px;font-weight:700;font-size:16px;cursor:pointer'},
    onclick:()=> overlay.remove()
  });
  btnRow.appendChild(cancelBtn);
  btnRow.appendChild(buyBtn);
  card.appendChild(btnRow);
  overlay.appendChild(card);
  document.body.appendChild(overlay);
}

// ===== Maschinen-Lexikon (Liam) =====
function renderMachineDetail(machineId){
  clear();
  const p = State.data.profiles[currentProfile];
  document.body.className = 'theme-liam';
  const m = MACHINES.find(x => x.id === machineId);
  if (!m) return renderCollection();
  const top = el('div',{class:'topbar'},
    el('button',{class:'back', text:'⬅️', onclick: renderCollection}),
    el('div',{text: '📖 Lexikon'}),
    el('div',{class:'score'}, el('span',{class:'icon',text:'🪙'}), el('span',{text:p.coins}))
  );
  root.appendChild(top);
  const wrap = el('div',{class:'detail'});
  const card = el('div',{class:'detail-card'});
  if (m.img) {
    const img = document.createElement('img');
    img.className = 'detail-img'; img.src = m.img; img.alt = m.name;
    img.onerror = () => { img.replaceWith(el('div',{class:'detail-icon', text: m.icon})); };
    card.appendChild(img);
  } else {
    card.appendChild(el('div',{class:'detail-icon', text: m.icon}));
  }
  card.appendChild(el('div',{class:'detail-name', text: m.name}));
  card.appendChild(el('div',{class:'detail-typ', text: m.typ || ''}));

  const spec = el('div',{class:'detail-spec'});
  function row(k,v){ if(!v) return; spec.appendChild(el('b',{text:k})); spec.appendChild(el('div',{text:String(v)})); }
  row('Hersteller', m.hersteller);
  row('Leistung', m.ps ? m.ps + ' PS' : null);
  row('Baujahr', m.baujahr);
  if (spec.children.length) card.appendChild(spec);

  if (m.beschreibung) {
    const sec = el('div',{class:'detail-section'});
    sec.appendChild(el('h4',{text:'Was ist das?'}));
    sec.appendChild(el('p',{text: m.beschreibung}));
    card.appendChild(sec);
  }
  if (m.einsatz) {
    const sec = el('div',{class:'detail-section'});
    sec.appendChild(el('h4',{text:'Wofür wird sie eingesetzt?'}));
    sec.appendChild(el('p',{text: m.einsatz}));
    card.appendChild(sec);
  }
  if (m.funfact) {
    const fact = el('div',{class:'detail-fact'},
      el('b',{text:'💡 Wusstest du? '}),
      document.createTextNode(m.funfact)
    );
    card.appendChild(fact);
  }
  wrap.appendChild(card);
  root.appendChild(wrap);
}

// ===== Charakter-Detail mit Animation, Sound, Shop (Raik) =====
function renderCharDetail(charId){
  clear();
  const p = State.data.profiles[currentProfile];
  document.body.className = 'theme-raik';
  const c = CHARS.find(x => x.id === charId);
  if (!c) return renderCollection();

  const top = el('div',{class:'topbar'},
    el('button',{class:'back', text:'⬅️', onclick: renderCollection}),
    el('div',{text: c.name}),
    el('div',{class:'score'}, el('span',{class:'icon',text:'🪙'}), el('span',{text:p.coins}))
  );
  root.appendChild(top);

  // Hintergrund je nach gekauftem bg
  const outfits = (p.char_outfits && p.char_outfits[charId]) || {};
  const bgClass = outfits.background ? 'char-bg-' + outfits.background.replace('bg_','') : '';
  const stage = el('div',{class:'char-stage ' + bgClass});

  const charWrap = el('div', {attrs:{style:'position:relative;text-align:center'}});
  let emoji;
  if (c.img) {
    emoji = document.createElement('img');
    emoji.className = 'char-img'; emoji.src = c.img; emoji.alt = c.name;
    emoji.onerror = () => {
      const fallback = el('div',{class:'char-emoji', text:c.icon, attrs:{style:`color:${c.color};text-shadow:0 0 30px ${c.color}88,0 8px 20px rgba(0,0,0,.4)`}});
      emoji.replaceWith(fallback); emoji = fallback;
    };
  } else {
    emoji = el('div',{class:'char-emoji', text:c.icon, attrs:{style:`color:${c.color};text-shadow:0 0 30px ${c.color}88,0 8px 20px rgba(0,0,0,.4)`}});
  }
  charWrap.appendChild(emoji);

  // Hut/Outfit oben drauf
  if (outfits.outfit) {
    const hatItem = SHOP_ITEMS.find(s => s.id === outfits.outfit);
    if (hatItem) charWrap.appendChild(el('div',{class:'char-hat', text: hatItem.icon}));
  }

  stage.appendChild(charWrap);
  stage.appendChild(el('div',{class:'char-name', text: c.name}));

  // Klick auf Charakter → Animation + Spruch + Sound + Effekt
  emoji.addEventListener('click', () => {
    emoji.classList.remove('move-' + c.move);
    void emoji.offsetWidth; // reflow trick
    emoji.classList.add('move-' + c.move);
    playSound(c.sound);
    showSaying(stage, c.sayings[Math.floor(Math.random()*c.sayings.length)]);
    if (outfits.effect) spawnEffectTrail(stage, outfits.effect);
  });

  // Info-Karte direkt unter Bild + Name
  if (c.desc || c.welt || c.type || c.pokedexNo) {
    const info = el('div',{attrs:{style:'background:rgba(255,255,255,.95);color:#222;padding:14px 18px;border-radius:16px;margin:14px 16px 8px;box-shadow:0 6px 18px rgba(0,0,0,.4);max-width:600px;width:calc(100% - 32px);align-self:center;box-sizing:border-box'}});
    if (c.welt) info.appendChild(el('div',{text:'🌍 Welt: ' + c.welt, attrs:{style:'font-size:13px;color:#1976d2;font-weight:700;margin-bottom:4px'}}));
    if (c.type) info.appendChild(el('div',{text: c.type, attrs:{style:'font-size:14px;font-style:italic;color:#666;margin-bottom:8px'}}));
    if (c.pokedexNo) info.appendChild(el('div',{text:'#' + c.pokedexNo + ' Pokédex', attrs:{style:'font-size:12px;color:#888;font-weight:700;margin-bottom:6px'}}));
    if (c.desc) info.appendChild(el('div',{text: c.desc, attrs:{style:'font-size:15px;line-height:1.5'}}));
    if (Settings.isEnabled('tts') && c.desc) {
      info.appendChild(el('button',{
        text:'🔊 Vorlesen',
        onclick: ()=> speak(c.name + '. ' + (c.type||'') + '. ' + c.desc),
        attrs:{style:'margin-top:10px;padding:8px 16px;background:#1976d2;color:#fff;border:none;border-radius:10px;font-weight:700;cursor:pointer;font-size:14px'}
      }));
    }
    stage.appendChild(info);
  }

  // Action-Buttons: Spielen (Animation), Shop, Stimme
  const actions = el('div',{class:'char-actions'});
  actions.appendChild(el('button',{text:'🎬 Move!', onclick: ()=> emoji.click()}));
  actions.appendChild(el('button',{text:'🛒 Shop', onclick: ()=> renderShop(charId)}));
  actions.appendChild(el('button',{text:'💬 Sag was', onclick: ()=> showSaying(stage, c.sayings[Math.floor(Math.random()*c.sayings.length)]) }));
  stage.appendChild(actions);
  root.appendChild(stage);

  // Auto-Klick beim Öffnen für direkten Wow-Effekt
  setTimeout(()=> emoji.click(), 400);

  // Karten-Strip am Ende
  if (Settings.isEnabled('collection_cards')) {
    const owned = (p.cards && p.cards[charId]) || [];
    if (owned.length > 0 || true) {
      const cardsRow = el('div',{attrs:{style:'background:rgba(0,0,0,.5);padding:12px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap;overflow-x:auto'}});
      cardsRow.appendChild(el('div',{text:'🎴 Editionen:', attrs:{style:'color:#fff;font-weight:700;width:100%;text-align:center;margin-bottom:6px'}}));
      CARD_EDITIONS.forEach(ed => {
        const ownedThis = owned.includes(ed.id);
        const cardChip = el('div',{attrs:{
          style:`width:60px;height:80px;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;${ownedThis?`box-shadow:${ed.glow};border:2px solid #fff`:'background:rgba(255,255,255,.1);opacity:.4;border:1px dashed #888'};${ownedThis && c.img?`background-image:url(${c.img});background-size:cover;background-position:center;filter:${ed.filter}`:''};${ownedThis && ed.animated?'animation:rainbow 3s linear infinite':''}`
        }});
        cardChip.appendChild(el('div',{text: ownedThis?ed.icon:'?', attrs:{style:'font-size:24px'}}));
        cardChip.appendChild(el('div',{text: ed.name, attrs:{style:'font-size:8px;font-weight:700;color:#fff;background:rgba(0,0,0,.6);padding:1px 4px;border-radius:4px;margin-top:2px'}}));
        cardsRow.appendChild(cardChip);
      });
      stage.appendChild(cardsRow);
    }
  }
}

// ===== Booster-Pack mit dramatischer Animation =====
function openBoosterAnimation() {
  const result = openBooster(currentProfile);
  if (!result) return alert('Nicht genug Münzen oder noch keine Charaktere/Maschinen freigeschaltet');
  const { charId, edition, isNew } = result;
  const collection = currentProfile==='liam' ? MACHINES : CHARS;
  const item = collection.find(x => x.id === charId);
  const ed = CARD_EDITIONS.find(e => e.id === edition);
  if (!item || !ed) return;

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.9);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;animation:fadein .3s';
  overlay.innerHTML = `
    <div style="font-size:80px;margin-bottom:20px;animation:bounce 1s infinite">📦</div>
    <div style="color:#fff;font-size:24px;font-weight:900;margin-bottom:30px">Booster wird geöffnet...</div>
  `;
  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.innerHTML = '';
    const card = document.createElement('div');
    card.style.cssText = `width:280px;height:380px;background:#fff;border-radius:20px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;box-shadow:${ed.glow};animation:cardReveal 1s ease-out;${ed.animated?'background:linear-gradient(45deg,#ff00ff,#00ffff,#ffff00,#ff00ff);background-size:400% 400%;animation:cardReveal 1s ease-out, rainbow 3s linear infinite':''}`;
    if (item.img) {
      const img = document.createElement('img');
      img.src = item.img;
      img.style.cssText = `max-width:200px;max-height:200px;object-fit:contain;filter:${ed.filter}`;
      card.appendChild(img);
    } else {
      const e = document.createElement('div');
      e.textContent = item.icon; e.style.cssText = 'font-size:140px';
      card.appendChild(e);
    }
    const name = document.createElement('div');
    name.textContent = item.name;
    name.style.cssText = 'font-size:22px;font-weight:900;color:#222;margin-top:10px;text-align:center';
    card.appendChild(name);
    const editionLabel = document.createElement('div');
    editionLabel.textContent = ed.icon + ' ' + ed.name + ' Edition';
    editionLabel.style.cssText = 'font-size:16px;font-weight:700;color:#666;margin-top:6px';
    card.appendChild(editionLabel);
    if (isNew) {
      const newTag = document.createElement('div');
      newTag.textContent = '✨ NEU!';
      newTag.style.cssText = 'background:#e53935;color:#fff;padding:6px 14px;border-radius:14px;margin-top:10px;font-weight:900;animation:pulse 1s infinite';
      card.appendChild(newTag);
    } else {
      const dupTag = document.createElement('div');
      dupTag.textContent = 'Hast du schon';
      dupTag.style.cssText = 'color:#999;font-size:12px;margin-top:8px';
      card.appendChild(dupTag);
    }
    overlay.appendChild(card);
    sfxUnlock?.();
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'OK';
    closeBtn.style.cssText = 'margin-top:24px;padding:14px 36px;background:#4caf50;color:#fff;border:none;border-radius:14px;font-weight:900;font-size:18px;cursor:pointer';
    closeBtn.onclick = () => { overlay.remove(); schedulePush?.(currentProfile); renderCollection(); };
    overlay.appendChild(closeBtn);
  }, 1500);
}

// Wrapper um openBoosterPack mit besserem Namen
function openBooster(profileKey) { return openBoosterPack(profileKey); }


function showSaying(stage, text){
  // Entferne alte Speech-Bubble
  const old = stage.querySelector('.char-saying');
  if (old) old.remove();
  const bubble = el('div',{class:'char-saying', text});
  stage.appendChild(bubble);
  setTimeout(()=> bubble.remove(), 2500);
}

function spawnEffectTrail(stage, effectId){
  const item = SHOP_ITEMS.find(s => s.id === effectId);
  if (!item) return;
  for (let i=0; i<5; i++) {
    setTimeout(() => {
      const trail = el('div',{class:'fx-trail', text: item.icon, attrs:{style:`left:${30+Math.random()*40}%;top:${30+Math.random()*30}%`}});
      stage.appendChild(trail);
      setTimeout(()=> trail.remove(), 1300);
    }, i * 80);
  }
}

// ===== Shop (Outfits, Backgrounds, Effekte für Charaktere) =====
function renderShop(charId){
  clear();
  const p = State.data.profiles[currentProfile];
  document.body.className = 'theme-' + p.theme;
  const c = CHARS.find(x => x.id === charId);
  const top = el('div',{class:'topbar'},
    el('button',{class:'back', text:'⬅️', onclick: ()=> renderCharDetail(charId)}),
    el('div',{text: '🛒 Shop für ' + c.name}),
    el('div',{class:'score'}, el('span',{class:'icon',text:'🪙'}), el('span',{text:p.coins}))
  );
  root.appendChild(top);

  const wrap = el('div',{class:'shop'});
  const outfits = (p.char_outfits && p.char_outfits[charId]) || {};
  const sections = [
    {kind:'background', title:'🎨 Hintergrund'},
    {kind:'outfit', title:'🎩 Outfit'},
    {kind:'effect', title:'✨ Effekt'}
  ];
  for (const sec of sections) {
    wrap.appendChild(el('div',{class:'shop-section-title', text: sec.title}));
    const grid = el('div',{class:'shop-grid'});
    SHOP_ITEMS.filter(s => s.kind === sec.kind).forEach(item => {
      const owned = (outfits[sec.kind] === item.id);
      const canBuy = p.coins >= item.price || owned;
      const cell = el('div',{class:'shop-item ' + (owned?'owned':'') + (!canBuy?' cant':''),
        onclick: () => {
          if (owned) return;
          if (!canBuy) return;
          if (buyShopItem(currentProfile, charId, item.id)) {
            if (typeof schedulePush === 'function') schedulePush(currentProfile);
            renderShop(charId); // Reload
          }
        }},
        el('span',{class:'icon', text:item.icon}),
        el('div',{class:'name', text:item.name}),
        el('div',{class:'price', text: owned ? '✓ benutzt' : `🪙 ${item.price}`})
      );
      grid.appendChild(cell);
    });
    wrap.appendChild(grid);
  }
  root.appendChild(wrap);
}

// ===== Eltern-Dashboard =====
function askPin(){
  clear();
  const wrap = el('div',{class:'dash'});
  wrap.appendChild(el('h2',{text:'🔒 PIN eingeben'}));
  const input = el('input',{class:'pin-input', attrs:{type:'tel', inputmode:'numeric', maxlength:'4'}});
  wrap.appendChild(input);
  wrap.appendChild(document.createElement('br'));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('button',{text:'Weiter', onclick:()=>{
    if (input.value === PARENT_PIN) renderDashboard();
    else { input.value=''; input.placeholder='Falsch'; }
  }, attrs:{style:'padding:14px 32px;font-size:20px;border:none;border-radius:12px;background:#4caf50;color:#fff;font-weight:800'}}));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('br'));
  wrap.appendChild(el('button',{text:'⬅️ Zurück', onclick: renderPicker, attrs:{style:'background:none;border:none;color:#aaa;font-size:16px;text-decoration:underline'}}));
  root.appendChild(wrap);
  setTimeout(()=>input.focus(),100);
}

function renderDashboard(){
  clear();
  const wrap = el('div',{class:'dash'});
  wrap.appendChild(el('h2',{text:'📊 Eltern-Dashboard'}));

  // Schnell-Navigation
  const nav = el('div',{attrs:{style:'display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap'}});
  nav.appendChild(el('button',{text:'⚙️ Einstellungen', onclick: renderSettings, attrs:{style:'padding:10px 18px;background:#1976d2;color:#fff;border:none;border-radius:10px;font-weight:700;cursor:pointer'}}));
  nav.appendChild(el('button',{text:'📝 Eigene Aufgaben', onclick: renderCustomTasks, attrs:{style:'padding:10px 18px;background:#7e57c2;color:#fff;border:none;border-radius:10px;font-weight:700;cursor:pointer'}}));
  nav.appendChild(el('button',{text:'📊 Wochen-Report', onclick: renderWeeklyReport, attrs:{style:'padding:10px 18px;background:#43a047;color:#fff;border:none;border-radius:10px;font-weight:700;cursor:pointer'}}));
  nav.appendChild(el('button',{text:'👤 Profilbilder', onclick: renderAvatarPicker, attrs:{style:'padding:10px 18px;background:#ec407a;color:#fff;border:none;border-radius:10px;font-weight:700;cursor:pointer'}}));
  wrap.appendChild(nav);
  for (const k of ['liam','raik']) {
    const p = State.data.profiles[k];
    const today = todayStats(k);
    const card = el('div',{attrs:{style:'background:rgba(255,255,255,.08);padding:16px;border-radius:16px;margin-bottom:16px'}});
    card.appendChild(el('h3',{text:`${p.name} (${p.age}, Klasse ${p.class})`, attrs:{style:'margin-bottom:12px'}}));
    card.appendChild(rowDash('Heute Aufgaben', `${today.total} (${today.correct} richtig)`));
    const subjLabels = {read:'📖 Lesen', math:'➕ Rechnen', sach:'🌍 Sachkunde', musik:'🎵 Musik'};
    for (const sk of ['read','math','sach','musik']) {
      const s = p.stats[sk] || {tries:0,correct:0,level:0};
      const ratio = s.tries ? Math.round(s.correct/s.tries*100) : 0;
      card.appendChild(rowDash(subjLabels[sk], `${s.tries} Aufgaben · ${ratio}% richtig · Lvl ${s.level}`));
    }
    card.appendChild(rowDash('Münzen', p.coins + ' 🪙'));
    card.appendChild(rowDash('Freigeschaltet', `${p.unlocked.length} / ${(k==='liam'?MACHINES:CHARS).length}`));
    wrap.appendChild(card);
  }
  wrap.appendChild(el('button',{text:'⬅️ Zurück', onclick: renderPicker, attrs:{style:'padding:14px 32px;font-size:18px;border:none;border-radius:12px;background:#666;color:#fff'}}));
  wrap.appendChild(el('button',{text:'🗑️ Alles zurücksetzen', onclick:()=>{
    if (confirm('Wirklich ALLE Fortschritte beider Kinder löschen?')) { State.reset(); renderPicker(); }
  }, attrs:{style:'margin-left:12px;padding:14px 32px;font-size:18px;border:none;border-radius:12px;background:#e53935;color:#fff'}}));
  root.appendChild(wrap);
}

function rowDash(label, val){
  return el('div',{class:'dash-row'}, el('div',{text:label}), el('div',{text:val,attrs:{style:'font-weight:700'}}));
}

// ===== Charakter-Lexikon (Pokemon-Steckbriefe etc.) =====
function renderCharLexikon(charId){
  clear();
  const p = State.data.profiles[currentProfile];
  document.body.className = 'theme-' + p.theme;
  const c = CHARS.find(x => x.id === charId);
  if (!c) return renderCollection();
  const tb = el('div',{class:'topbar'},
    el('button',{class:'back', text:'⬅️', onclick: ()=> renderCharDetail(charId)}),
    el('div',{text: '📖 Lexikon'}),
    el('div',{class:'score'}, el('span',{class:'icon',text:'🪙'}), el('span',{text:p.coins}))
  );
  root.appendChild(tb);
  const wrap = el('div',{class:'detail'});
  const card = el('div',{class:'detail-card'});
  if (c.img) {
    const img = document.createElement('img');
    img.className = 'detail-img'; img.src = c.img; img.alt = c.name;
    img.onerror = () => { img.replaceWith(el('div',{class:'detail-icon', text: c.icon})); };
    card.appendChild(img);
  } else {
    card.appendChild(el('div',{class:'detail-icon', text: c.icon}));
  }
  card.appendChild(el('div',{class:'detail-name', text: c.name}));
  if (c.pokedexNo) card.appendChild(el('div',{class:'detail-typ', text: '#' + c.pokedexNo + ' Pokédex'}));
  else card.appendChild(el('div',{class:'detail-typ', text: c.type || ''}));

  const spec = el('div',{class:'detail-spec'});
  function row(k, v){ if(!v) return; spec.appendChild(el('b',{text:k})); spec.appendChild(el('div',{text:String(v)})); }
  if (c.type) row('Typ', c.type);
  row('Preis', c.price + ' Münzen');
  if (c.pokedexNo) row('Welt', 'Pokemon');
  else if (['mario','luigi','yoshi','peach','bowser','rosalina','superstar'].includes(c.id)) row('Welt', 'Mario');
  else if (['sonic','tails','knuckles','shadow','eggman'].includes(c.id)) row('Welt', 'Sonic');
  else if (['kai','jay','cole','zane','lloyd','nya','wu'].includes(c.id)) row('Welt', 'Lego Ninjago');
  card.appendChild(spec);
  if (c.desc) {
    const sec = el('div',{class:'detail-section'});
    sec.appendChild(el('h4',{text:'Was ist das?'}));
    sec.appendChild(el('p',{text: c.desc}));
    card.appendChild(sec);
  }
  if (Settings.isEnabled('tts')) {
    card.appendChild(el('button',{text:'🔊 Vorlesen', onclick: ()=> speak(c.name + '. ' + (c.desc || '')),
      attrs:{style:'margin-top:14px;padding:12px 24px;background:#1976d2;color:#fff;border:none;border-radius:12px;font-weight:700;cursor:pointer;display:block;margin-left:auto;margin-right:auto'}}));
  }
  wrap.appendChild(card);
  root.appendChild(wrap);
}

// ===== Profilbild-Picker (Eltern) =====
function renderAvatarPicker(){
  clear();
  const wrap = el('div',{class:'dash'});
  wrap.appendChild(el('h2',{text:'👤 Profilbilder wählen'}));
  wrap.appendChild(el('p',{text:'Wähle pro Junge sein Lieblings-Bild. Erscheint im Spiel oben.', attrs:{style:'opacity:.85;margin-bottom:14px'}}));

  for (const profile of ['liam','raik']) {
    wrap.appendChild(el('h3',{text: profile==='liam'?'🚜 Liam':'💨 Raik', attrs:{style:'margin:12px 0 8px'}}));
    const collection = profile==='liam' ? MACHINES : CHARS;
    const grid = el('div',{attrs:{style:'display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px'}});
    const current = Settings.data.per_profile[profile].custom_avatar;
    collection.forEach(item => {
      const cell = el('div',{
        attrs:{style:`aspect-ratio:1;background:${current===item.id?'#ffd700':'rgba(255,255,255,.1)'};border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;padding:6px;border:${current===item.id?'3px solid #ff9800':'1px solid rgba(255,255,255,.2)'}`},
        onclick: () => {
          Settings.data.per_profile[profile].custom_avatar = current===item.id ? '' : item.id;
          Settings.save();
          renderAvatarPicker();
        }
      });
      if (item.img) {
        const img = document.createElement('img');
        img.src = item.img;
        img.style.cssText = 'width:60%;height:auto;max-height:60px;object-fit:contain';
        cell.appendChild(img);
      } else {
        cell.appendChild(el('div',{text:item.icon,attrs:{style:'font-size:36px'}}));
      }
      cell.appendChild(el('div',{text:item.name, attrs:{style:'font-size:10px;text-align:center;color:'+(current===item.id?'#222':'#fff')+';margin-top:4px'}}));
      grid.appendChild(cell);
    });
    wrap.appendChild(grid);
  }
  wrap.appendChild(el('button',{text:'⬅️ Zurück', onclick: renderDashboard, attrs:{style:'padding:12px 24px;background:#666;color:#fff;border:none;border-radius:10px;font-weight:700;cursor:pointer'}}));
  root.appendChild(wrap);
}

// ===== Maschinen-Tagebuch (Liam) =====
function renderMachineDiaryTask(topKey, sub) {
  clear();
  const p = State.data.profiles[currentProfile];
  document.body.className = 'theme-' + p.theme;
  const item = MACHINE_DIARY[Math.floor(Math.random()*MACHINE_DIARY.length)];
  currentTask = { subject:'read', item, fiftyUsed:false };
  const tb = el('div',{class:'topbar'},
    el('button',{class:'back', text:'⬅️', onclick: ()=>renderSubjectHub(topKey)}),
    el('div',{text: '📔 Tagebuch'}),
    el('div',{class:'score'}, el('span',{class:'icon',text:'🪙'}), el('span',{text:p.coins}))
  );
  root.appendChild(tb);
  renderPowerupBar();
  const task = el('div',{class:'task'});
  task.appendChild(el('div',{class:'task-text story', text:item.text}));
  if (Settings.isEnabled('tts')) task.appendChild(el('button',{
    text:'🔊 Vorlesen',
    onclick: ()=> speak(item.text + '. ' + item.q),
    attrs:{style:'align-self:center;padding:10px 20px;background:#1976d2;color:#fff;border:none;border-radius:12px;font-weight:700;margin-bottom:10px;cursor:pointer'}
  }));
  task.appendChild(el('div',{class:'task-text', text:item.q, attrs:{style:'min-height:50px;font-size:20px'}}));
  const opts = el('div',{class:'options'});
  item.options.forEach((o,i) => {
    opts.appendChild(el('button',{class:'opt', text:o, onclick:(e)=>answer(e.target, i===item.correct, ()=>renderMachineDiaryTask(topKey, sub))}));
  });
  task.appendChild(opts);
  root.appendChild(task);
}

// ===== Settings-Page =====
function renderSettings(){
  clear();
  const wrap = el('div',{class:'dash'});
  wrap.appendChild(el('h2',{text:'⚙️ Einstellungen'}));
  wrap.appendChild(el('p',{text:'Schalte einzelne Features ein/aus. Änderungen wirken sofort.', attrs:{style:'opacity:.85;margin-bottom:14px'}}));

  // Sektionen
  const sections = [
    {title:'🎮 Spielmechanik', keys:['daily_goal','streak','movement_pause','hourglass_timer','night_mode','tts','powerups','visuals']},
    {title:'🏆 Belohnungen', keys:['collection_cards','custom_avatar','career_mode','sound_packs','hof_dojo','endless_runner','hof_problems','machine_diary']},
    {title:'👨‍👩‍👦 Eltern-Kontrolle', keys:['task_block','time_limit','weekly_report','custom_tasks','teacher_mode']}
  ];
  for (const sec of sections) {
    wrap.appendChild(el('h3',{text:sec.title, attrs:{style:'margin:18px 0 8px;color:#90caf9'}}));
    for (const k of sec.keys) {
      const s = Settings.data[k];
      if (!s) continue;
      const row = el('div',{attrs:{style:'background:rgba(255,255,255,.08);padding:12px;border-radius:12px;margin-bottom:8px;display:flex;align-items:center;gap:12px;flex-wrap:wrap'}});
      row.appendChild(el('div',{text:s.label,attrs:{style:'flex:1;font-weight:600'}}));
      // Wert (für solche mit value)
      if ('value' in s && typeof s.value === 'number') {
        const inp = el('input',{attrs:{type:'number',min:'1',value:s.value,style:'width:70px;padding:6px;border-radius:6px;border:none;font-size:14px'}});
        inp.addEventListener('change', ()=> { s.value = parseInt(inp.value)||s.value; Settings.save(); });
        row.appendChild(inp);
      }
      if ('email' in s) {
        const inp = el('input',{attrs:{type:'email',placeholder:'mail@beispiel.de',value:s.email||'',style:'flex:1;padding:6px;border-radius:6px;border:none;font-size:14px;min-width:140px'}});
        inp.addEventListener('change', ()=> { s.email = inp.value; Settings.save(); });
        row.appendChild(inp);
      }
      if ('code' in s) {
        const inp = el('input',{attrs:{type:'text',placeholder:'4-stellig',value:s.code||'',style:'width:100px;padding:6px;border-radius:6px;border:none;font-size:14px'}});
        inp.addEventListener('change', ()=> { s.code = inp.value; Settings.save(); });
        row.appendChild(inp);
      }
      // Toggle
      const tgl = el('label',{attrs:{style:'position:relative;display:inline-block;width:54px;height:30px;cursor:pointer'}});
      const cb = el('input',{attrs:{type:'checkbox',style:'opacity:0;width:0;height:0'}});
      cb.checked = !!s.enabled;
      cb.addEventListener('change', ()=>{ s.enabled = cb.checked; Settings.save(); slider.style.background = cb.checked?'#4caf50':'#666'; knob.style.left = cb.checked?'27px':'3px'; });
      const slider = el('span',{attrs:{style:`position:absolute;inset:0;background:${cb.checked?'#4caf50':'#666'};border-radius:30px;transition:.2s`}});
      const knob = el('span',{attrs:{style:`position:absolute;top:3px;left:${cb.checked?'27px':'3px'};width:24px;height:24px;background:#fff;border-radius:50%;transition:.2s`}});
      tgl.appendChild(cb); tgl.appendChild(slider); tgl.appendChild(knob);
      row.appendChild(tgl);
      wrap.appendChild(row);
    }
  }

  // Sub-Fächer ausblenden
  wrap.appendChild(el('h3',{text:'🚫 Sub-Fächer aus-/einblenden', attrs:{style:'margin:18px 0 8px;color:#90caf9'}}));
  wrap.appendChild(el('p',{text:'Tippe ein Sub-Fach um es im Spiel auszublenden (z.B. wenn der Lehrer diese Woche keine Geometrie macht).', attrs:{style:'font-size:13px;opacity:.7;margin-bottom:8px'}}));
  for (const profile of ['liam','raik']) {
    wrap.appendChild(el('h4',{text: profile==='liam'?'🚜 Liam':'💨 Raik', attrs:{style:'margin:8px 0 4px'}}));
    const tree = SUBJECTS_TREE[profile];
    for (const topKey of Object.keys(tree)) {
      for (const sub of tree[topKey].subs) {
        const enabled = Settings.isSubjectEnabled(topKey, sub.id);
        const chip = el('button',{text:sub.label, attrs:{style:`margin:3px;padding:6px 12px;font-size:12px;border:none;border-radius:14px;cursor:pointer;background:${enabled?'#4caf50':'#666'};color:#fff;font-weight:600`}});
        chip.addEventListener('click', ()=>{
          Settings.toggleSubject(topKey, sub.id);
          const e = Settings.isSubjectEnabled(topKey, sub.id);
          chip.style.background = e?'#4caf50':'#666';
        });
        wrap.appendChild(chip);
      }
    }
  }

  wrap.appendChild(el('div',{attrs:{style:'margin-top:24px'}},
    el('button',{text:'⬅️ Zurück zum Dashboard', onclick: renderDashboard, attrs:{style:'padding:12px 24px;background:#666;color:#fff;border:none;border-radius:10px;font-weight:700;cursor:pointer'}})
  ));
  root.appendChild(wrap);
}

// ===== Eigene Aufgaben hochladen =====
function renderCustomTasks(){
  clear();
  const wrap = el('div',{class:'dash'});
  wrap.appendChild(el('h2',{text:'📝 Eigene Aufgaben'}));
  wrap.appendChild(el('p',{text:'Hier kannst du eigene Aufgaben für die Jungs hinzufügen (z.B. aus dem Mathebuch).', attrs:{style:'opacity:.85;margin-bottom:14px'}}));

  const list = JSON.parse(localStorage.getItem('herzog_lernapp_custom_tasks') || '[]');
  // Liste anzeigen
  const listBox = el('div',{attrs:{style:'margin-bottom:18px'}});
  if (list.length === 0) {
    listBox.appendChild(el('p',{text:'Noch keine eigenen Aufgaben.', attrs:{style:'opacity:.6'}}));
  } else {
    for (let i = 0; i < list.length; i++) {
      const t = list[i];
      const row = el('div',{attrs:{style:'background:rgba(255,255,255,.08);padding:10px;border-radius:10px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;gap:8px'}});
      row.appendChild(el('div',{attrs:{style:'flex:1'}},
        el('div',{text:`[${t.profile}] ${t.q}`, attrs:{style:'font-weight:600'}}),
        el('div',{text:`Antwort: ${t.a}`, attrs:{style:'font-size:13px;opacity:.7'}})
      ));
      row.appendChild(el('button',{text:'🗑️', onclick:()=>{ list.splice(i,1); localStorage.setItem('herzog_lernapp_custom_tasks', JSON.stringify(list)); renderCustomTasks(); }, attrs:{style:'background:#e53935;color:#fff;border:none;padding:6px 10px;border-radius:8px;cursor:pointer'}}));
      listBox.appendChild(row);
    }
  }
  wrap.appendChild(listBox);

  // Formular
  wrap.appendChild(el('h3',{text:'+ Neue Aufgabe', attrs:{style:'margin-bottom:8px'}}));
  const form = el('div',{attrs:{style:'background:rgba(255,255,255,.08);padding:14px;border-radius:12px;display:flex;flex-direction:column;gap:8px'}});
  const profSel = el('select',{attrs:{style:'padding:8px;border-radius:6px;border:none'}},
    el('option',{text:'Liam',attrs:{value:'liam'}}),
    el('option',{text:'Raik',attrs:{value:'raik'}})
  );
  const qInp = el('input',{attrs:{type:'text',placeholder:'Frage (z.B. 7+8 oder Was ist...)',style:'padding:8px;border-radius:6px;border:none'}});
  const aInp = el('input',{attrs:{type:'text',placeholder:'Richtige Antwort',style:'padding:8px;border-radius:6px;border:none'}});
  const optsInp = el('input',{attrs:{type:'text',placeholder:'Falsche Antworten, mit Komma getrennt (für Multiple-Choice). Leer = Eingabe-Aufgabe',style:'padding:8px;border-radius:6px;border:none'}});
  form.appendChild(el('label',{text:'Für wen:'})); form.appendChild(profSel);
  form.appendChild(el('label',{text:'Frage:'})); form.appendChild(qInp);
  form.appendChild(el('label',{text:'Richtige Antwort:'})); form.appendChild(aInp);
  form.appendChild(el('label',{text:'Falsche Antworten (optional):'})); form.appendChild(optsInp);
  form.appendChild(el('button',{text:'+ Speichern', onclick:()=>{
    if (!qInp.value || !aInp.value) return alert('Frage und Antwort sind Pflicht');
    const wrong = optsInp.value.split(',').map(s=>s.trim()).filter(Boolean);
    const task = {profile:profSel.value, q:qInp.value, a:aInp.value, wrong, ts:Date.now()};
    list.push(task);
    localStorage.setItem('herzog_lernapp_custom_tasks', JSON.stringify(list));
    renderCustomTasks();
  }, attrs:{style:'padding:12px;background:#4caf50;color:#fff;border:none;border-radius:8px;font-weight:800;cursor:pointer;margin-top:8px'}}));
  wrap.appendChild(form);
  wrap.appendChild(el('button',{text:'⬅️ Zurück', onclick: renderDashboard, attrs:{style:'margin-top:18px;padding:12px 24px;background:#666;color:#fff;border:none;border-radius:10px;font-weight:700;cursor:pointer'}}));
  root.appendChild(wrap);
}

// ===== Wochen-Report (Live + optional Mail) =====
function renderWeeklyReport(){
  clear();
  const wrap = el('div',{class:'dash'});
  wrap.appendChild(el('h2',{text:'📊 Wochen-Report'}));
  const week = 7 * 86400000;
  const since = Date.now() - week;
  for (const k of ['liam','raik']) {
    const p = State.data.profiles[k];
    const wHist = (p.history||[]).filter(h => h.ts >= since);
    const subjs = {};
    for (const h of wHist) {
      if (!subjs[h.subject]) subjs[h.subject] = {tries:0, correct:0};
      subjs[h.subject].tries++;
      if (h.correct) subjs[h.subject].correct++;
    }
    const days = new Set(wHist.map(h => new Date(h.ts).toISOString().slice(0,10))).size;
    const card = el('div',{attrs:{style:'background:rgba(255,255,255,.08);padding:16px;border-radius:14px;margin-bottom:14px'}});
    card.appendChild(el('h3',{text:`${p.name} – letzte 7 Tage`}));
    card.appendChild(rowDash('Aktive Tage', `${days} / 7`));
    card.appendChild(rowDash('Aufgaben gesamt', `${wHist.length} (${wHist.filter(h=>h.correct).length} richtig)`));
    card.appendChild(rowDash('Münzen gesamt', `${p.coins} 🪙`));
    const career = getCareerRank(k);
    if (career) card.appendChild(rowDash('Rang', `${career.name}` + (career.nextAt ? ` (noch ${career.nextAt - career.totalCorrect} bis ${career.nextName})` : ' MAX')));
    for (const sk of Object.keys(subjs)) {
      const s = subjs[sk];
      const r = s.tries ? Math.round(s.correct/s.tries*100) : 0;
      card.appendChild(rowDash('  · '+sk, `${s.tries} · ${r}% richtig`));
    }
    // Empfehlung
    const weakest = Object.entries(subjs).sort((a,b) => (a[1].correct/a[1].tries) - (b[1].correct/b[1].tries))[0];
    if (weakest) card.appendChild(el('div',{text:'💡 Schwachstelle: ' + weakest[0] + ' – Fokus diese Woche?', attrs:{style:'margin-top:8px;padding:10px;background:#fff9c4;color:#333;border-radius:8px;font-weight:600'}}));
    wrap.appendChild(card);
  }
  if (Settings.isEnabled('weekly_report') && Settings.get('weekly_report').email) {
    wrap.appendChild(el('div',{text:`📧 Mail-Versand an ${Settings.get('weekly_report').email} ist aktiviert (jeden Sonntag 18:00).`, attrs:{style:'background:rgba(76,175,80,.2);padding:12px;border-radius:10px;margin-bottom:14px'}}));
  } else {
    wrap.appendChild(el('div',{text:'ℹ️ Mail-Versand nicht aktiv. In Einstellungen aktivierbar.', attrs:{style:'background:rgba(255,255,255,.06);padding:12px;border-radius:10px;margin-bottom:14px;font-size:13px'}}));
  }
  wrap.appendChild(el('button',{text:'⬅️ Zurück', onclick: renderDashboard, attrs:{style:'padding:12px 24px;background:#666;color:#fff;border:none;border-radius:10px;font-weight:700;cursor:pointer'}}));
  root.appendChild(wrap);
}

// Start: Wenn auto-profile gesetzt (liam.html / raik.html / alva.html), direkt rein.
// Sonst Profil-Auswahl.
if (typeof window !== 'undefined' && ['liam','raik','alva'].includes(window.__autoProfile)) {
  openProfile(window.__autoProfile);
} else {
  renderPicker();
}
