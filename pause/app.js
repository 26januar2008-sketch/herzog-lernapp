// ============================================================
// Yggdrasil · App-Logik
// Alle Abläufe aus dem Prototyp, dazu: Speicherung als Einzel-Ereignisse,
// Einstellungen, Trainingslog, PIN für Notizen, Hell/Dunkel, Wake Lock.
// ============================================================
(function () {
  'use strict';
  const D = window.YGG_DATA, PV = window.YGG_PRIVAT, T = window.YGG_TREE;
  const $ = (id) => document.getElementById(id);
  const APP_VERSION = '1.0';

  // ---------- Speicher (localStorage, Präfix ygg.) ----------
  const S = {
    get(k, d) { try { const v = localStorage.getItem('ygg.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('ygg.' + k, JSON.stringify(v)); } catch (e) {} },
    keys() { const out = []; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith('ygg.')) out.push(k); } } catch (e) {} return out; }
  };
  const DEF = { ziel: 4, plan: D.dayDrill.slice(), noLegs: false, theme: 'auto', pomo: 25, ton: true };
  let settings = Object.assign({}, DEF, S.get('settings', {}));
  if (!Array.isArray(settings.plan) || settings.plan.length !== 7) settings.plan = D.dayDrill.slice();
  function saveSettings() { S.set('settings', settings); }

  // Pausen als Einzel-Ereignisse: {d:'JJJJ-MM-TT', plan, s: Dauer in Sekunden, t: Zeitstempel}
  let pausen = S.get('pausen', []);
  let training = S.get('training', []);
  function dkey(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function cnt(d) { const k = dkey(d); let n = 0; for (const e of pausen) if (e.d === k) n++; return n; }
  function todayCount() { return cnt(new Date()); }
  function beckenCount() { let n = 0; for (const e of pausen) if (e.plan === 'becken' || e.plan === 'alles') n++; return n; }
  function streak() { let n = 0; const d = new Date(); if (cnt(d) === 0) d.setDate(d.getDate() - 1); while (cnt(d) > 0 && n < 999) { n++; d.setDate(d.getDate() - 1); } return n; }
  function weekDays() { // Tage dieser Woche (Mo–So) mit mindestens einer Pause
    const today = new Date(), dow = (today.getDay() + 6) % 7; let n = 0;
    for (let i = 0; i <= dow; i++) { const d = new Date(today); d.setDate(today.getDate() - dow + i); if (cnt(d) > 0) n++; }
    return n;
  }
  function stageFor(n) { const g = settings.ziel; if (n <= 0) return 0; if (n >= g) return 4; return Math.max(1, Math.min(3, Math.ceil(n / g * 3))); }

  // ---------- Thema ----------
  function applyTheme() {
    const m = settings.theme, h = new Date().getHours();
    const dark = m === 'dunkel' || (m === 'auto' && ((window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) || h >= 20 || h < 7));
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.setAttribute('content', dark ? '#10171A' : '#1F3A2E');
  }
  applyTheme(); setInterval(applyTheme, 60000);
  try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme); } catch (e) {}

  // ---------- Hilfen ----------
  let toastT = null;
  function toast(t) { const el = $('toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2200); }
  function buzz(ms) { try { navigator.vibrate && navigator.vibrate(ms || 60); } catch (e) {} }
  let AC = null;
  function tone(freq, dur, gain) {
    if (!settings.ton) return;
    try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const o = AC.createOscillator(), g = AC.createGain();
      o.type = 'sine'; o.frequency.value = freq || 520; g.gain.value = gain || .08; o.connect(g); g.connect(AC.destination);
      o.start(); g.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + (dur || .18)); o.stop(AC.currentTime + (dur || .18) + .02); } catch (e) {}
  }
  function beep() { if (!settings.ton) return; try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); [0, .35, .7].forEach(t => { const o = AC.createOscillator(), g = AC.createGain(); o.frequency.value = 660; g.gain.value = .15; o.connect(g); g.connect(AC.destination); o.start(AC.currentTime + t); o.stop(AC.currentTime + t + .2); }); } catch (e) {} }
  let lock = null;
  async function keepAwake() { try { if ('wakeLock' in navigator) lock = await navigator.wakeLock.request('screen'); } catch (e) {} }
  function release() { try { lock && lock.release(); } catch (e) {} lock = null; }
  function esc(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  // ---------- Ansichten ----------
  const VIEWS = ['home', 'session', 'pomo', 'brk', 'done', 'drive', 'wald', 'pin', 'priv', 'settings'];
  let curView = 'home';
  function view(v) { curView = v; VIEWS.forEach(id => $(id).classList.toggle('show', id === v)); window.scrollTo(0, 0); }

  // ---------- Startseite ----------
  function runeToday() {
    const d = new Date(); const n = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); const r = D.runes[((n % 24) + 24) % 24];
    $('runeGlyph').textContent = r[0]; $('runeName').textContent = 'Rune des Tages: ' + r[1]; $('runeText').textContent = r[2] + ' ' + r[3];
  }
  function todayDrill() { const k = settings.plan[new Date().getDay()]; return D.drills[k] || D.drills.mobil; }
  function planText() {
    const names = { kraft: 'Kraft', rumpf: 'Rumpf', hart: 'Militär-Zirkel', mobil: 'Mobility' }, days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    return [1, 2, 3, 4, 5, 6, 0].map(i => days[i] + ' ' + names[settings.plan[i]]).join(' · ');
  }
  function showCount() {
    const n = todayCount(), G = settings.ziel;
    $('countToday').textContent = n; $('countText').textContent = 'von ' + G + ' Pausen heute';
    T.draw($('tree'), stageFor(n), weekDays(), n >= G);
    const st = streak(); $('streak').textContent = st > 1 ? st + ' Tage in Folge' : (n > 0 ? 'Heute gestartet' : 'Heute noch keine Pause');
    const w = $('week'); w.innerHTML = ''; const today = new Date(); const dow = (today.getDay() + 6) % 7; const names = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    for (let i = 0; i < 7; i++) { const d = new Date(today); d.setDate(today.getDate() - dow + i); const c = cnt(d); const sp = document.createElement('span');
      sp.textContent = names[i]; if (c >= G) sp.className = 'goal'; else if (c > 0) sp.className = 'on'; if (i === dow) sp.classList.add('now'); sp.title = c + ' Pausen'; w.appendChild(sp); }
    const lvl = D.pelvicLevel(beckenCount());
    $('pelvicSmall').textContent = 'Stufe ' + lvl.stufe + ': maximal anspannen, ' + lvl.hold + ' Sekunden halten' + (lvl.stufe >= 2 ? ', Aufzug' : '') + ', Schnellkraft';
    const dr = todayDrill(); $('drillSmall').textContent = dr.n + ': ' + dr.d; $('drillMin').textContent = dr.m;
    showLeg(); setLenUI();
    $('homeNote').textContent = 'Tagestraining: ' + planText() + '. Bei Übungen nie die Luft anhalten. Beim Beckenboden immer weiteratmen. Bei den Halte-Phasen der Atemübungen die Luft nur locker halten, nicht pressen. Wird dir schwindelig: normal weiteratmen.';
    updWaldBtn();
  }
  document.querySelectorAll('.knot').forEach(k => T.knot(k, 480));

  // ---------- Beine schonen ----------
  function showLeg() { const on = !!settings.noLegs; $('legBtn').setAttribute('aria-pressed', on); $('legTitle').textContent = 'Beine schonen: ' + (on ? 'an' : 'aus'); $('legIcon').textContent = on ? '🩹' : '🦵'; }
  $('legBtn').addEventListener('click', () => { settings.noLegs = !settings.noLegs; saveSettings(); showLeg(); });
  function legFree(arr, plan) {
    let u = 0, s = 0; const out = [];
    arr.forEach(st => { const name = st.l + ' ' + st.s;
      if (!D.LEG.test(name)) { out.push(st); return; }
      if (st.k === 'max') { const r = D.UPPER[u++ % D.UPPER.length]; const rd = (st.l.match(/ · Runde \d+/) || [''])[0]; out.push({ l: r[0] + rd, s: r[1], t: st.t, k: 'max' }); }
      else if (/Aufwärmen|Auf der Stelle/.test(name)) { out.push({ l: 'Aufwärmen', s: 'Im Sitzen: Arme kreisen, Schultern rollen, Hände ausschütteln.', t: st.t, k: 'move' }); }
      else if (plan === 'yoga') { const r = D.SEATED[s++ % D.SEATED.length]; out.push({ l: r[0], s: r[1], t: st.t, k: 'move' }); }
    });
    return out.map((st, i) => st.l === 'Pause' && out[i + 1] ? Object.assign({}, st, { s: 'Durchatmen. Nächste Übung: ' + out[i + 1].l.replace(/ · Runde \d+/, '') }) : st);
  }

  // ---------- Übungen ----------
  let plans = {}, steps = [], idx = 0, left = 0, timer = null, total = 0, elapsed = 0, curPlan = '';
  function buildPlans() {
    const pelvic = D.makePelvic(D.pelvicLevel(beckenCount()).stufe);
    plans = { tag: todayDrill().p, yoga: D.yoga, dehnen: D.dehnen, atmen: D.breath, resonanz: D.breath, seufzer: D.seufzer, box: D.box, schlaf: D.schlaf, becken: pelvic, bewegen: D.move, alles: [...D.breath.slice(0, 12), ...pelvic, ...D.move] };
  }
  const ring = $('ring');
  function setRing(k, t) {
    ring.style.transitionDuration = (k === 'in' || k === 'out') ? t + 's' : (k === 'holdIn' || k === 'holdOut' ? '0s' : '.6s');
    const s = { in: 1, out: .55, holdIn: 1, holdOut: .55, rest: .7, pulse: .8, move: .85, max: 1, relax: .55 }[k] || .7;
    requestAnimationFrame(() => { ring.style.transform = 'scale(' + s + ')'; });
  }
  function runStep(first) {
    if (idx >= steps.length) { finish(); return; }
    const st = steps[idx]; left = st.t;
    $('label').textContent = st.l; $('sub').textContent = st.s; $('count').textContent = left;
    $('stepInfo').textContent = 'Schritt ' + (idx + 1) + ' von ' + steps.length;
    setRing(st.k, st.t); buzz(60); if (!first) tone(st.k === 'out' || st.k === 'relax' ? 440 : 560, .16);
  }
  function tick() { left--; elapsed++; $('bar').style.width = Math.min(100, elapsed / total * 100) + '%'; if (left <= 0) { idx++; runStep(false); } else { $('count').textContent = left; } }
  function start(name) {
    buildPlans(); curPlan = name; steps = plans[name]; if (settings.noLegs) steps = legFree(steps, name);
    if (!steps.length) { toast('Mit „Beine schonen“ bleibt hier nichts übrig.'); return; }
    idx = 0; elapsed = 0; total = steps.reduce((a, s) => a + s.t, 0);
    $('bar').style.width = '0'; ring.style.transitionDuration = '0s'; ring.style.transform = 'scale(.55)';
    view('session'); keepAwake(); runStep(true); clearInterval(timer); timer = setInterval(tick, 1000);
  }
  function stopSession() { clearInterval(timer); timer = null; release(); }
  function badgeFor(tot, st, today) {
    if (today === settings.ziel) return 'Tagesziel geschafft. Der Baum steht in voller Pracht.';
    if ([10, 25, 50, 100, 200].includes(tot)) return tot + ' Pausen insgesamt. Stark.';
    if ([3, 7, 14, 30].includes(st) && today === 1) return st + ' Tage in Folge. Weiter so.';
    return null;
  }
  let pendingTraining = null;
  function finish() {
    stopSession();
    const now = new Date();
    pausen.push({ d: dkey(now), plan: curPlan, s: total, t: now.toISOString() }); S.set('pausen', pausen);
    const n = todayCount(), tot = pausen.length, G = settings.ziel;
    const b = badgeFor(tot, streak(), n);
    $('saying').innerHTML = esc(pick(D.sayings)) + '<small>frei nach dem Hávamál</small>';
    $('doneText').textContent = n >= G ? 'Pause ' + n + ' heute. Tagesziel erreicht.' : 'Pause ' + n + ' von ' + G + ' heute.';
    $('badge').hidden = !b; $('badge').textContent = b || '';
    T.draw($('treeDone'), stageFor(n), weekDays(), n >= G);
    const isTraining = curPlan === 'tag' || curPlan === 'yoga';
    $('feelBox').hidden = !isTraining; document.querySelectorAll('#feel button').forEach(x => x.setAttribute('aria-pressed', 'false'));
    pendingTraining = isTraining ? { d: dkey(now), plan: curPlan === 'tag' ? todayDrill().n : 'Yoga', s: total, t: now.toISOString(), gefuehl: null } : null;
    if (isTraining) { training.push(pendingTraining); S.set('training', training); }
    view('done'); buzz([80, 60, 80]); tone(660, .3, .1);
  }
  document.querySelectorAll('#feel button').forEach(b => b.addEventListener('click', () => {
    if (!pendingTraining) return; pendingTraining.gefuehl = +b.dataset.f; S.set('training', training);
    document.querySelectorAll('#feel button').forEach(x => x.setAttribute('aria-pressed', x === b)); toast('Gespeichert');
  }));
  document.querySelectorAll('.choice[data-plan]').forEach(b => b.addEventListener('click', () => start(b.dataset.plan)));
  $('stop').addEventListener('click', () => { stopSession(); showCount(); view('home'); });
  $('back').addEventListener('click', () => { showCount(); view('home'); });
  $('again').addEventListener('click', () => pomoStart());
  $('breathBtn').addEventListener('click', () => { const m = $('breathMenu'); m.hidden = !m.hidden; });
  $('surprise').addEventListener('click', () => start(pick(['resonanz', 'seufzer', 'box', 'becken', 'bewegen', 'alles'])));
  $('drillBtn').addEventListener('click', () => start('tag'));

  // ---------- Arbeitsblock ----------
  let POMO = settings.pomo * 60000, pomoEnd = 0, pomoTimer = null;
  function setLenUI() { const m = settings.pomo; POMO = m * 60000; $('pomoMin').textContent = m + ' Min'; $('pomoSmall').textContent = m + ' Minuten arbeiten, dann meldet sich die Pause'; if (!pomoTimer) $('pomoClock').textContent = m + ':00'; }
  function pomoTick() {
    const r = Math.max(0, pomoEnd - Date.now()); const m = Math.floor(r / 60000), sec = Math.floor(r / 1000) % 60;
    $('pomoClock').textContent = String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0'); $('pomoBar').style.width = (100 - r / POMO * 100) + '%';
    if (r <= 0) { clearInterval(pomoTimer); pomoTimer = null; release(); buzz([400, 200, 400, 200, 400]); beep(); notify('Block geschafft', 'Zeit für eine kurze Pause.'); view('brk'); }
  }
  function pomoStart() {
    pomoEnd = Date.now() + POMO; view('pomo'); keepAwake(); pomoTick(); clearInterval(pomoTimer); pomoTimer = setInterval(pomoTick, 1000);
    try { if ('Notification' in window && Notification.permission === 'default' && !S.get('askedNotify', false)) { S.set('askedNotify', true); Notification.requestPermission(); } } catch (e) {}
  }
  function notify(title, body) { try { if ('Notification' in window && Notification.permission === 'granted' && document.visibilityState !== 'visible') new Notification(title, { body, icon: 'icon-192.png', tag: 'ygg-pomo' }); } catch (e) {} }
  $('pomoLen').addEventListener('click', () => { settings.pomo = settings.pomo === 25 ? 50 : 25; saveSettings(); setLenUI(); });
  $('pomoStart').addEventListener('click', pomoStart);
  $('pomoStop').addEventListener('click', () => { clearInterval(pomoTimer); pomoTimer = null; release(); showCount(); view('home'); });
  $('brkSkip').addEventListener('click', () => { showCount(); view('home'); });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') { if (pomoTimer) { keepAwake(); pomoTick(); } if (timer) keepAwake(); if (driveOn) keepAwake(); }
    else if (curView === 'priv' || curView === 'pin') { lockPriv(); }
  });

  // ---------- Fahrt-Modus: nur Sprachansagen ----------
  let driveOn = false, driveT = [];
  function say(t) { try { const u = new SpeechSynthesisUtterance(t); u.lang = 'de-DE'; u.rate = .95; speechSynthesis.speak(u); } catch (e) {} $('driveNow').textContent = t; }
  function at(ms, fn) { driveT.push(setTimeout(() => { if (driveOn) fn(); }, ms)); }
  function runBlock(b) {
    say(b.intro);
    if (b.reps) for (let i = 0; i < b.reps; i++) { at(b.start + i * b.period, () => say(b.on)); at(b.start + b.offAt + i * b.period, () => say(b.off)); }
    return b.dur;
  }
  function driveLoop() { let i = 0;
    const next = () => { if (!driveOn) return; const b = D.driveBlocks[i % D.driveBlocks.length]; driveT.push(setTimeout(() => { if (!driveOn) return; const dur = runBlock(b); i++; driveT.push(setTimeout(next, dur + 180000)); }, 0)); };
    next(); }
  function driveStart() { driveOn = true; keepAwake(); $('driveGo').textContent = 'Stopp'; $('driveGo').classList.add('on'); say('Fahrt-Modus gestartet. Gute Fahrt. Die erste Übung kommt gleich.'); driveT.push(setTimeout(() => { if (driveOn) driveLoop(); }, 8000)); }
  function driveStop() { driveOn = false; driveT.forEach(clearTimeout); driveT = []; try { speechSynthesis.cancel(); } catch (e) {} release(); $('driveGo').textContent = 'Start'; $('driveGo').classList.remove('on'); $('driveNow').textContent = 'Bereit'; }
  $('driveGo').addEventListener('click', () => { driveOn ? driveStop() : driveStart(); });
  $('driveBtn').addEventListener('click', () => view('drive'));
  $('driveClose').addEventListener('click', () => { driveStop(); showCount(); view('home'); });

  // ---------- Für uns ----------
  function newIdea() { $('ideaText').textContent = pick(PV.ideas); $('ideaCard').hidden = false; }
  $('ideaBtn').addEventListener('click', newIdea); $('ideaNext').addEventListener('click', newIdea);

  // ---------- Notizen (Privat) mit PIN ----------
  let pinMode = 'check', pinBuf = '', pinFirst = '';
  function pinDots() { document.querySelectorAll('#pinDots i').forEach((d, i) => d.classList.toggle('on', i < pinBuf.length)); }
  function openPriv() {
    const pin = S.get('pin', null); pinBuf = ''; pinFirst = '';
    if (!pin) { pinMode = 'set1'; $('pinText').textContent = 'Neue PIN wählen (4 Ziffern)'; } else { pinMode = 'check'; $('pinText').textContent = 'PIN eingeben'; }
    pinDots(); view('pin');
  }
  function lockPriv() { pinBuf = ''; pinDots(); showCount(); view('home'); }
  function pinDone() {
    if (pinMode === 'set1') { pinFirst = pinBuf; pinBuf = ''; pinMode = 'set2'; $('pinText').textContent = 'PIN wiederholen'; pinDots(); return; }
    if (pinMode === 'set2') { if (pinBuf === pinFirst) { S.set('pin', pinBuf); toast('PIN gespeichert'); showPriv(); } else { toast('Stimmt nicht überein. Noch einmal.'); pinBuf = ''; pinFirst = ''; pinMode = 'set1'; $('pinText').textContent = 'Neue PIN wählen (4 Ziffern)'; pinDots(); } return; }
    if (pinBuf === S.get('pin', '')) { showPriv(); } else { buzz([80, 60, 80]); toast('Falsche PIN'); pinBuf = ''; pinDots(); }
  }
  $('pad').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.k === 'del') { pinBuf = pinBuf.slice(0, -1); pinDots(); return; }
    if (b.dataset.k === 'reset') { if (confirm('PIN zurücksetzen? Deine gemerkten Notizen bleiben erhalten.')) { S.set('pin', null); openPriv(); } return; }
    if (pinBuf.length >= 4) return; pinBuf += b.textContent.trim(); pinDots(); if (pinBuf.length === 4) setTimeout(pinDone, 120);
  });
  $('pinClose').addEventListener('click', lockPriv);
  $('privClose').addEventListener('click', lockPriv);
  $('privBtn').addEventListener('click', openPriv);

  let curCat = 'Alle', curTip = null;
  function favs() { return S.get('favs', []); }
  function renderFavs() { const f = favs(); $('favHead').hidden = !f.length; const ul = $('favs'); ul.innerHTML = '';
    f.forEach((t, i) => { const li = document.createElement('li'); li.textContent = t; const b = document.createElement('button'); b.textContent = 'entfernen';
      b.onclick = () => { const g = favs(); g.splice(i, 1); S.set('favs', g); renderFavs(); updFav(); }; li.appendChild(b); ul.appendChild(li); }); }
  function updFav() { const on = curTip && favs().includes(curTip[1]); $('tipFav').textContent = on ? '★ Gemerkt' : '☆ Merken'; }
  function newTip() { const pool = curCat === 'Alle' ? PV.tips : PV.tips.filter(t => t[0] === curCat); let t; do { t = pick(pool); } while (pool.length > 1 && t === curTip);
    curTip = t; $('tipCat').textContent = t[0]; $('tipText').textContent = t[1]; updFav(); }
  PV.cats.forEach(c => { const b = document.createElement('button'); b.className = 'chip'; b.textContent = c; b.setAttribute('aria-pressed', c === curCat);
    b.onclick = () => { curCat = c; document.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-pressed', x.textContent === c)); newTip(); }; $('chips').appendChild(b); });
  function showPriv() { newTip(); renderFavs(); view('priv'); }
  $('tipNext').addEventListener('click', newTip);
  $('tipFav').addEventListener('click', () => { if (!curTip) return; const f = favs(); const i = f.indexOf(curTip[1]); if (i >= 0) f.splice(i, 1); else f.push(curTip[1]); S.set('favs', f); renderFavs(); updFav(); });

  // ---------- Waldläufer ----------
  const W = D.W, GEAR = D.GEAR;
  function wget(k, d) { const w = S.get('wald', {}); return w[k] === undefined ? d : w[k]; }
  function wset(k, v) { const w = S.get('wald', {}); w[k] = v; S.set('wald', w); }
  let wStage = 0, wTab = 'lernen', qState = null;
  function tasksDone(i) { const d = wget('tasks', {}); return (W[i].tasks || []).every((t, j) => d[i + '-' + j]); }
  function curStage() { let i = 0; while (i < W.length && W[i].tasks && tasksDone(i)) i++; return Math.min(i, W.length - 1); }
  function renderRunes() { const box = $('waldRunes'); box.innerHTML = '';
    W.forEach((st, i) => { const b = document.createElement('button'); b.textContent = st.r; b.title = st.n; b.setAttribute('aria-label', 'Stufe ' + (i + 1) + ': ' + st.n);
      if (st.tasks && tasksDone(i)) b.className = 'done'; if (i === wStage) b.classList.add('cur');
      if (st.locked) b.disabled = true; b.onclick = () => { wStage = i; qState = null; renderWald(); }; box.appendChild(b); }); }
  function renderWald() {
    renderRunes(); const st = W[wStage]; $('wTitle').textContent = 'Stufe ' + (wStage + 1) + ': ' + st.n + ' · ' + st.rn;
    document.querySelectorAll('.tab').forEach(t => t.setAttribute('aria-selected', t.dataset.tab === wTab));
    const b = $('wBody');
    if (wTab === 'ausruestung') { let h = '<div class="gear">'; GEAR.forEach(g => { h += '<h3>' + esc(g[0]) + '</h3>';
        g[1].forEach((it, j) => { const k = 'g-' + g[0] + '-' + j; const on = wget('gear', {})[k];
          h += '<label class="chk"><input type="checkbox" data-gear="' + esc(k) + '"' + (on ? ' checked' : '') + '><span><b>' + esc(it[0]) + '</b><small>' + esc(it[1]) + '</small></span></label>'; }); });
      b.innerHTML = h + '</div>'; b.querySelectorAll('[data-gear]').forEach(c => c.onchange = () => { const g = wget('gear', {}); g[c.dataset.gear] = c.checked; wset('gear', g); }); return; }
    if (st.locked) { b.innerHTML = '<div class="card"><h3>Kommt als Nächstes</h3><p>Diese Stufe wird eingebaut, sobald du die vorherige geschafft hast.</p></div>'; return; }
    if (wTab === 'lernen') { const n = Math.floor(Date.now() / 864e5); const today = st.cards[n % st.cards.length];
      let h = '<p class="muted">Karte des Tages</p><div class="card today"><h3>' + esc(today[0]) + '</h3><p>' + esc(today[1]) + '</p></div><p class="muted">Alle Karten dieser Stufe</p>';
      st.cards.forEach(c => { if (c !== today) h += '<div class="card"><h3>' + esc(c[0]) + '</h3><p>' + esc(c[1]) + '</p></div>'; }); b.innerHTML = h; return; }
    if (wTab === 'aufgaben') { const d = wget('tasks', {}); let h = '<p class="muted">Draußen im Wald. Alle erledigt, dann ist die Stufe geschafft.</p>';
      st.tasks.forEach((t, j) => { const k = wStage + '-' + j; h += '<label class="chk"><input type="checkbox" data-task="' + k + '"' + (d[k] ? ' checked' : '') + '><span><b>' + esc(t[0]) + '</b><small>' + esc(t[1]) + '</small></span></label>'; });
      b.innerHTML = h; b.querySelectorAll('[data-task]').forEach(c => c.onchange = () => { const x = wget('tasks', {}); x[c.dataset.task] = c.checked; wset('tasks', x);
        if (tasksDone(wStage)) { buzz([80, 60, 80]); b.insertAdjacentHTML('afterbegin', '<div class="card today"><h3>Stufe geschafft</h3><p>Die Rune ' + esc(st.r) + ' gehört dir. Die nächste Stufe ist offen.</p></div>'); }
        renderRunes(); updWaldBtn(); }); return; }
    if (wTab === 'quiz') renderQuiz();
  }
  function renderQuiz() { const st = W[wStage], b = $('wBody');
    if (!qState || qState.stage !== wStage) {
      // Korrektur aus Auftrag B2.10: alle falschen zuerst und vollständig behalten, dann auffüllen
      const wrong = (wget('wrong', {})[wStage] || []).filter(i => i < st.quiz.length);
      const rest = st.quiz.map((q, i) => i).filter(i => !wrong.includes(i)).sort(() => Math.random() - .5);
      const order = [...wrong, ...rest].slice(0, Math.max(5, wrong.length)); qState = { stage: wStage, order, i: 0, score: 0 }; }
    if (qState.i >= qState.order.length) { b.innerHTML = '<div class="card"><h3>' + qState.score + ' von ' + qState.order.length + ' richtig</h3><p>Was du falsch hattest, kommt beim nächsten Quiz zuerst wieder.</p></div><button class="back" id="qAgain">Nochmal</button>';
      $('qAgain').onclick = () => { qState = null; renderQuiz(); }; return; }
    const qi = qState.order[qState.i], q = st.quiz[qi];
    let h = '<p class="muted">Frage ' + (qState.i + 1) + ' von ' + qState.order.length + '</p><div class="card"><h3>' + esc(q[0]) + '</h3></div>';
    q[1].forEach((o, j) => { h += '<button class="opt" data-o="' + j + '">' + esc(o) + '</button>'; }); h += '<p id="qExp" class="muted" style="margin-top:10px"></p>'; b.innerHTML = h; b.dataset.answered = '';
    b.querySelectorAll('.opt').forEach(btn => btn.onclick = () => { if (b.dataset.answered === '1') return; b.dataset.answered = '1';
      const j = +btn.dataset.o, ok = j === q[2]; const w = wget('wrong', {}); w[wStage] = (w[wStage] || []).filter(x => x !== qi); if (!ok) w[wStage].push(qi); wset('wrong', w);
      if (ok) qState.score++; b.querySelectorAll('.opt')[q[2]].classList.add('right'); if (!ok) btn.classList.add('wrong');
      $('qExp').textContent = (ok ? 'Richtig. ' : 'Nicht ganz. ') + q[3];
      const nx = document.createElement('button'); nx.className = 'back'; nx.textContent = 'Weiter'; nx.onclick = () => { b.dataset.answered = ''; qState.i++; renderQuiz(); }; b.appendChild(nx); }); }
  function updWaldBtn() { const c = curStage(); $('waldRune').textContent = W[c].r; $('waldSmall').textContent = 'Stufe ' + (c + 1) + ': ' + W[c].n + '. Wissen, Quiz, Aufgaben'; }
  document.querySelectorAll('.tab').forEach(t => t.onclick = () => { wTab = t.dataset.tab; qState = null; renderWald(); });
  $('waldBtn').addEventListener('click', () => { wStage = curStage(); if (W[wStage].locked) wStage = Math.max(0, wStage - 1); view('wald'); renderWald(); });
  $('waldClose').addEventListener('click', () => { updWaldBtn(); showCount(); view('home'); });

  // ---------- Einstellungen ----------
  const DRILL_NAMES = { kraft: 'Kraft-Zirkel', rumpf: 'Rumpf & Rücken', hart: 'Militär-Zirkel', mobil: 'Mobility' };
  function seg(opts, cur, on) { const d = document.createElement('div'); d.className = 'seg';
    opts.forEach(o => { const b = document.createElement('button'); b.textContent = o[1]; b.setAttribute('aria-pressed', String(o[0]) === String(cur)); b.onclick = () => { on(o[0]); renderSettings(); }; d.appendChild(b); }); return d; }
  function sw(label, hint, val, on) { const b = document.createElement('button'); b.className = 'switch'; b.setAttribute('role', 'switch'); b.setAttribute('aria-checked', !!val);
    b.innerHTML = '<span><b>' + esc(label) + '</b>' + (hint ? '<br><span class="soft small">' + esc(hint) + '</span>' : '') + '</span><i></i>'; b.onclick = () => { on(!val); renderSettings(); }; return b; }
  function box(title, hint) { const d = document.createElement('div'); d.className = 'set'; d.innerHTML = '<h3>' + esc(title) + '</h3>' + (hint ? '<p class="hint">' + esc(hint) + '</p>' : ''); return d; }
  function renderSettings() {
    const b = $('setBody'); b.innerHTML = '';
    let x = box('Tagesziel', 'So viele Pausen am Tag, dann trägt der Baum Früchte.');
    x.appendChild(seg([[3, '3'], [4, '4'], [5, '5'], [6, '6']], settings.ziel, v => { settings.ziel = v; saveSettings(); })); b.appendChild(x);

    x = box('Wochenplan', 'Welches Tagestraining an welchem Tag.'); const grid = document.createElement('div'); grid.className = 'plan';
    [1, 2, 3, 4, 5, 6, 0].forEach(i => { const l = document.createElement('label'); l.textContent = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][i]; const s = document.createElement('select'); l.htmlFor = 'plan' + i; s.id = 'plan' + i;
      Object.keys(DRILL_NAMES).forEach(k => { const o = document.createElement('option'); o.value = k; o.textContent = DRILL_NAMES[k]; o.selected = settings.plan[i] === k; s.appendChild(o); });
      s.onchange = () => { settings.plan[i] = s.value; saveSettings(); }; grid.appendChild(l); grid.appendChild(s); });
    x.appendChild(grid); const rs = document.createElement('button'); rs.className = 'stop'; rs.style.marginTop = '10px'; rs.textContent = 'Standard wiederherstellen'; rs.onclick = () => { settings.plan = D.dayDrill.slice(); saveSettings(); renderSettings(); }; x.appendChild(rs); b.appendChild(x);

    x = box('Übungen'); x.appendChild(sw('Beine schonen', 'Bei Verletzung: keine Bein-Übungen, Ersatz für Oberkörper und Sitzen.', settings.noLegs, v => { settings.noLegs = v; saveSettings(); }));
    x.appendChild(sw('Ton bei Wechseln', 'Kurzer Ton, wenn die nächste Übung beginnt. Vibration bleibt immer an.', settings.ton, v => { settings.ton = v; saveSettings(); }));
    const pl = document.createElement('p'); pl.className = 'hint'; pl.style.marginTop = '8px'; pl.textContent = 'Arbeitsblock'; x.appendChild(pl);
    x.appendChild(seg([[25, '25 Minuten'], [50, '50 Minuten']], settings.pomo, v => { settings.pomo = v; saveSettings(); })); b.appendChild(x);

    x = box('Darstellung', 'Automatisch: dunkel abends ab 20 Uhr und wenn dein Handy dunkel eingestellt ist.');
    x.appendChild(seg([['auto', 'Automatisch'], ['hell', 'Hell'], ['dunkel', 'Dunkel']], settings.theme, v => { settings.theme = v; saveSettings(); applyTheme(); })); b.appendChild(x);

    x = box('Trainingslog', training.length ? 'Die letzten Einheiten.' : 'Noch keine Einheit. Nach Tagestraining oder Yoga fragt die App, wie es sich angefühlt hat.');
    if (training.length) { const ul = document.createElement('ul'); ul.className = 'log';
      training.slice(-12).reverse().forEach(e => { const li = document.createElement('li'); const d = e.d.split('-'); li.innerHTML = '<span>' + d[2] + '.' + d[1] + '. · ' + esc(e.plan) + '</span><span class="f">' + (e.gefuehl ? '●'.repeat(e.gefuehl) + '○'.repeat(5 - e.gefuehl) : '–') + '</span>'; ul.appendChild(li); });
      x.appendChild(ul); }
    b.appendChild(x);

    x = box('Zahlen'); const tot = pausen.length, mins = Math.round(pausen.reduce((a, e) => a + (e.s || 0), 0) / 60);
    x.insertAdjacentHTML('beforeend', '<p class="small">' + tot + ' Pausen insgesamt · ' + mins + ' Minuten · Beckenboden Stufe ' + D.pelvicLevel(beckenCount()).stufe + ' (' + beckenCount() + ' Einheiten)</p>'); b.appendChild(x);

    x = box('Daten', 'Alles bleibt auf diesem Handy. Export als Datei, zum Beispiel für ein neues Handy.');
    const row = document.createElement('div'); row.className = 'row';
    const ex = document.createElement('button'); ex.className = 'stop'; ex.textContent = 'Exportieren'; ex.onclick = exportData;
    const im = document.createElement('button'); im.className = 'stop'; im.textContent = 'Importieren'; const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'application/json,.json'; inp.hidden = true; inp.onchange = () => importData(inp.files[0]); im.onclick = () => inp.click();
    const pn = document.createElement('button'); pn.className = 'stop'; pn.textContent = 'Notizen-PIN zurücksetzen'; pn.onclick = () => { if (confirm('PIN zurücksetzen? Beim nächsten Öffnen der Notizen wählst du eine neue.')) { S.set('pin', null); toast('PIN zurückgesetzt'); } };
    row.appendChild(ex); row.appendChild(im); row.appendChild(inp); row.appendChild(pn); x.appendChild(row); b.appendChild(x);

    x = box('Hinweis'); x.insertAdjacentHTML('beforeend', '<p class="small soft">Diese App ersetzt keinen Arzt. Bei Beschwerden, Schwindel oder Schmerzen: aufhören und ärztlichen Rat holen. Bei allen Übungen weiteratmen, nicht pressen. Die Runen-Deutungen sind moderne Deutungen.</p><p class="small soft" style="margin-top:6px">Yggdrasil ' + APP_VERSION + '</p>'); b.appendChild(x);
  }
  function exportData() {
    const out = { app: 'yggdrasil', version: APP_VERSION, exported: new Date().toISOString(), data: {} };
    S.keys().forEach(k => { if (k === 'ygg.pin') return; try { out.data[k] = JSON.parse(localStorage.getItem(k)); } catch (e) {} });
    const blob = new Blob([JSON.stringify(out, null, 1)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'yggdrasil-' + dkey(new Date()) + '.json'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); toast('Datei erstellt');
  }
  function importData(file) {
    if (!file) return; const r = new FileReader();
    r.onload = () => { try { const o = JSON.parse(r.result); if (!o || o.app !== 'yggdrasil' || !o.data) throw 0;
        if (!confirm('Daten aus der Datei übernehmen? Vorhandene Einträge werden ersetzt.')) return;
        Object.keys(o.data).forEach(k => { if (k.startsWith('ygg.') && k !== 'ygg.pin') localStorage.setItem(k, JSON.stringify(o.data[k])); }); location.reload(); }
      catch (e) { toast('Das ist keine Yggdrasil-Datei.'); } };
    r.readAsText(file);
  }
  $('gearBtn').addEventListener('click', () => { renderSettings(); view('settings'); });
  $('setClose').addEventListener('click', () => { showCount(); view('home'); });

  // ---------- Start ----------
  function route() { if (location.hash === '#fahrt') view('drive'); }
  window.addEventListener('hashchange', route);
  runeToday(); showCount(); view('home'); route();
  if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); }); }
})();
