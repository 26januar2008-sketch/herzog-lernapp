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

function clear(){ root.innerHTML=''; document.body.className=''; }

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
  const parent = el('button',{class:'parent-btn', text:'👨 Eltern', onclick: askPin});
  wrap.appendChild(parent);
  root.appendChild(wrap);
}

function openProfile(key){
  currentProfile = key;
  renderHome();
  if (typeof hydrateFromRemote === 'function') {
    hydrateFromRemote(key).then(()=> { if (currentProfile === key) renderHome(); });
  }
}

// ===== Home =====
function renderHome(){
  clear();
  const p = State.data.profiles[currentProfile];
  document.body.className = 'theme-' + p.theme;

  const top = el('div',{class:'topbar'},
    el('button',{class:'back', text:'⬅️', onclick: renderPicker}),
    el('div',{text: 'Hi ' + p.name + '!'}),
    el('div',{class:'score'},
      el('span',{class:'icon', text: currentProfile==='liam' ? '🪙' : '🪙'}),
      el('span',{text: p.coins})
    )
  );
  root.appendChild(top);

  const home = el('div',{class:'home'});
  const greet = currentProfile==='liam'
    ? '🚜 Was machen wir heute, Boss?'
    : '⚡ Bereit zum Speed Run?';
  home.appendChild(el('div',{class:'greeting', text: greet}));

  const subs = el('div',{class:'subjects'});
  subs.appendChild(el('div',{class:'subject read', onclick: ()=>renderTask('read')},
    el('span',{class:'em', text:'📖'}),
    document.createTextNode('Lesen')
  ));
  subs.appendChild(el('div',{class:'subject', onclick: ()=>renderTask('math')},
    el('span',{class:'em', text:'➕'}),
    document.createTextNode('Rechnen')
  ));
  subs.appendChild(el('div',{class:'subject', onclick: ()=>renderTask('sach')},
    el('span',{class:'em', text: currentProfile==='liam' ? '🌾' : '🌍'}),
    document.createTextNode('Sachkunde')
  ));
  subs.appendChild(el('div',{class:'subject', onclick: ()=>renderTask('musik')},
    el('span',{class:'em', text:'🎵'}),
    document.createTextNode('Musik')
  ));
  subs.appendChild(el('div',{class:'subject', onclick: renderTraceTask, attrs:{style:'grid-column:span 2;background:#7e57c2;color:#fff'}},
    el('span',{class:'em', text:'✏️'}),
    document.createTextNode('Schreiben (Finger nachfahren)')
  ));
  subs.appendChild(el('div',{class:'subject', onclick: renderCollection, attrs:{style:'grid-column:span 2'}},
    el('span',{class:'em', text: currentProfile==='liam' ? '🏚️' : '🌟'}),
    document.createTextNode(currentProfile==='liam' ? 'Meine Garage' : 'Meine Charaktere')
  ));
  home.appendChild(subs);
  root.appendChild(home);
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

  // Power-Up-Leiste
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
      // Story + 4 Optionen
      task.appendChild(el('div',{class:'task-text story', text: item.text}));
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
    const visual = item.visual || autoVisualForMath(item.q);
    if (visual) {
      const v = el('div',{html:`<div style="font-size:36px;margin-bottom:10px;line-height:1.3">${visual}</div>`});
      mathBox.appendChild(v);
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
function shuffle(arr){ for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];} }

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
  if (typeof sfxCorrect === 'function') correct ? sfxCorrect() : sfxWrong();
  if (typeof schedulePush === 'function') schedulePush(currentProfile);
  setTimeout(() => {
    if (result.unlocked) { if (typeof sfxUnlock === 'function') sfxUnlock(); showReward(result.unlocked, ()=>maybePauseOrContinue(currentTask.subject, next)); }
    else maybePauseOrContinue(currentTask.subject, next);
  }, correct ? 900 : 1800);
}

function maybePauseOrContinue(subject, next){
  const p = State.data.profiles[currentProfile];
  // Raik: Pause nach 5 richtigen Aufgaben
  if (currentProfile==='raik' && p.sessionCount >= 5) {
    p.sessionCount = 0;
    State.save();
    showPauseScreen(()=> next ? next() : renderTask(subject));
    return;
  }
  if (next) next(); else renderTask(subject);
}

function showReward(item, then){
  const overlay = el('div',{class:'reward'},
    el('div',{class:'big', text: item.icon}),
    el('div',{class:'text', text:'NEU FREIGESCHALTET!'}),
    el('div',{class:'sub', text: item.name}),
    el('button',{text:'Weiter machen!', onclick: ()=>{ overlay.remove(); then(); }})
  );
  root.appendChild(overlay);
}

function showPauseScreen(then){
  const overlay = el('div',{class:'pause'});
  const msg = el('div',{class:'text', text:'⚡ Mini-Pause! Steh kurz auf, streck dich!'});
  msg.style.cssText = 'font-size:32px;font-weight:900;color:#fff;text-align:center;padding:0 24px;text-shadow:0 4px 0 rgba(0,0,0,.3)';
  const cd = el('div',{class:'countdown', text:'10'});
  overlay.appendChild(msg);
  overlay.appendChild(cd);
  document.body.appendChild(overlay);
  let n = 10;
  const iv = setInterval(()=>{
    n--;
    cd.textContent = n;
    if (n<=0) { clearInterval(iv); overlay.remove(); then(); }
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
  const grid = el('div',{class:'coll-grid'});
  collection.forEach(item => {
    const unlocked = p.unlocked.includes(item.id);
    const cell = el('div',{class:'coll-item ' + (unlocked?'unlocked':'locked'),
      onclick: unlocked ? ()=> (currentProfile==='liam' ? renderMachineDetail(item.id) : renderCharDetail(item.id)) : null });
    if (unlocked && item.img) {
      const img = document.createElement('img');
      img.className = 'thumb';
      img.src = item.img;
      img.alt = item.name;
      img.onerror = () => { img.replaceWith(el('div',{class:'icon', text: item.icon})); };
      cell.appendChild(img);
    } else {
      cell.appendChild(el('div',{class:'icon', text: unlocked ? item.icon : '🔒'}));
    }
    cell.appendChild(el('div',{text: unlocked ? item.name : `🪙 ${item.price}`}));
    grid.appendChild(cell);
  });
  wrap.appendChild(grid);
  root.appendChild(wrap);
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

  // Action-Buttons: Spielen (Animation), Shop, Stimme
  const actions = el('div',{class:'char-actions'});
  actions.appendChild(el('button',{text:'🎬 Move!', onclick: ()=> emoji.click()}));
  actions.appendChild(el('button',{text:'🛒 Shop', onclick: ()=> renderShop(charId)}));
  actions.appendChild(el('button',{text:'💬 Sag was', onclick: ()=> showSaying(stage, c.sayings[Math.floor(Math.random()*c.sayings.length)]) }));
  stage.appendChild(actions);
  root.appendChild(stage);

  // Auto-Klick beim Öffnen für direkten Wow-Effekt
  setTimeout(()=> emoji.click(), 400);
}

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

// Start: Wenn auto-profile gesetzt (liam.html / raik.html), direkt rein.
// Sonst Profil-Auswahl.
if (typeof window !== 'undefined' && window.__autoProfile === 'liam') {
  openProfile('liam');
} else if (typeof window !== 'undefined' && window.__autoProfile === 'raik') {
  openProfile('raik');
} else {
  renderPicker();
}
