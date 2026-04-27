// ============================================================
// SETTINGS-System: Eltern können jedes Feature ein/ausschalten
// ============================================================

const DEFAULT_SETTINGS = {
  // ===== Spielmechanik =====
  daily_goal: {enabled:true, value:10, label:'📅 Tagesziel-Anzeige'},
  streak: {enabled:true, label:'🔥 Tages-Streak'},
  movement_pause: {enabled:true, label:'🤸 Bewegungs-Pause (alle 10 Aufgaben)'},
  hourglass_timer: {enabled:false, label:'⏳ Sanduhr-Timer pro Aufgabe'},
  night_mode: {enabled:true, label:'🌙 Tag/Nacht-Modus (auto nach Uhrzeit)'},
  tts: {enabled:true, label:'🔊 Vorlesen-Funktion'},
  powerups: {enabled:true, label:'⚡ Power-Ups (50/50, Skip, Doppel-Münzen)'},
  visuals: {enabled:true, label:'🪙 Auto-Visualisierung bei Mathe (Münzen-Reihen)'},

  // ===== Belohnungen =====
  collection_cards: {enabled:true, label:'🎴 Sammelkarten (5 Varianten pro Char)'},
  custom_avatar: {enabled:true, label:'👤 Eigenes Profilbild wählen'},
  career_mode: {enabled:true, label:'🏆 Karriere-Modus (Lehrling → Meister)'},
  sound_packs: {enabled:true, label:'🎼 Sound-Pakete kaufbar'},
  hof_dojo: {enabled:true, label:'🏚️ Hof / Dojo bauen mit Münzen'},
  endless_runner: {enabled:true, label:'🏃 Mini-Spiel (Endless Runner)'},
  hof_problems: {enabled:true, label:'🔧 Echte Hof-Probleme lösen'},
  machine_diary: {enabled:true, label:'📔 Maschinen-Tagebuch (Liam)'},

  // ===== Eltern-Kontrolle =====
  task_block: {enabled:false, value:5, label:'🚧 Pflicht-Aufgaben vor Belohnung (pro Tag)'},
  time_limit: {enabled:false, value:30, label:'⏱️ Tages-Zeitlimit (Minuten)'},
  weekly_report: {enabled:false, email:'', label:'📧 Wochen-Report per Mail'},
  custom_tasks: {enabled:true, label:'📝 Eigene Aufgaben hochladen'},
  teacher_mode: {enabled:false, code:'', label:'👩‍🏫 Lehrer-Modus (Code für Lehrer)'},

  // ===== Sub-Fächer ein/aus (Liste) =====
  subjects_disabled: {value:[], label:'🚫 Bestimmte Sub-Fächer deaktivieren'},

  // ===== Pro-Profil-Settings =====
  per_profile: {
    liam: { task_block_remaining: 0, time_used_today: 0, last_active_day: '' },
    raik: { task_block_remaining: 0, time_used_today: 0, last_active_day: '' }
  }
};

const Settings = {
  data: null,
  load() {
    try {
      const raw = localStorage.getItem('herzog_lernapp_settings');
      this.data = raw ? Object.assign({}, DEFAULT_SETTINGS, JSON.parse(raw)) : structuredClone(DEFAULT_SETTINGS);
    } catch { this.data = structuredClone(DEFAULT_SETTINGS); }
    // Merge defaults so neue Keys nach Update da sind
    for (const k of Object.keys(DEFAULT_SETTINGS)) {
      if (!(k in this.data)) this.data[k] = structuredClone(DEFAULT_SETTINGS[k]);
    }
  },
  save() { localStorage.setItem('herzog_lernapp_settings', JSON.stringify(this.data)); },
  get(key) { return this.data?.[key]; },
  isEnabled(key) { return !!this.data?.[key]?.enabled; },
  isSubjectEnabled(topKey, subId) {
    const list = this.data?.subjects_disabled?.value || [];
    return !list.includes(`${topKey}.${subId}`);
  },
  toggleSubject(topKey, subId) {
    const list = this.data.subjects_disabled.value || [];
    const k = `${topKey}.${subId}`;
    const i = list.indexOf(k);
    if (i >= 0) list.splice(i, 1); else list.push(k);
    this.data.subjects_disabled.value = list;
    this.save();
  }
};

Settings.load();

// Tages-Zeit Tracking
function trackTimeSpent(profileKey, seconds) {
  if (!Settings.isEnabled('time_limit')) return false;
  const pp = Settings.data.per_profile[profileKey];
  const today = new Date().toISOString().slice(0, 10);
  if (pp.last_active_day !== today) { pp.time_used_today = 0; pp.last_active_day = today; }
  pp.time_used_today += seconds;
  Settings.save();
  return pp.time_used_today >= (Settings.data.time_limit.value || 30) * 60;
}

function timeLeftToday(profileKey) {
  if (!Settings.isEnabled('time_limit')) return Infinity;
  const pp = Settings.data.per_profile[profileKey];
  const today = new Date().toISOString().slice(0, 10);
  if (pp.last_active_day !== today) return (Settings.data.time_limit.value || 30) * 60;
  return Math.max(0, (Settings.data.time_limit.value || 30) * 60 - pp.time_used_today);
}

// Karriere-Modus
const CAREER_RANKS = [
  {min:0,    name:'🌱 Lehrling',     color:'#9e9e9e'},
  {min:50,   name:'👨‍🌾 Junior-Bauer', color:'#8bc34a'},
  {min:150,  name:'🚜 Bauer',         color:'#43a047'},
  {min:300,  name:'⭐ Geselle',       color:'#1976d2'},
  {min:600,  name:'🏆 Meister-Bauer', color:'#fbc02d'},
  {min:1000, name:'👑 Hof-Boss',      color:'#e65100'}
];
const CAREER_RANKS_RAIK = [
  {min:0,    name:'🥷 Schueler',      color:'#9e9e9e'},
  {min:50,   name:'⚡ Junior-Ninja',   color:'#0277bd'},
  {min:150,  name:'🔥 Ninja',         color:'#e53935'},
  {min:300,  name:'🌟 Spinjitzu-Profi', color:'#43a047'},
  {min:600,  name:'🏆 Meister',       color:'#fbc02d'},
  {min:1000, name:'👑 Spinjitzu-Grossmeister', color:'#7b1fa2'}
];

function getCareerRank(profileKey) {
  if (!Settings.isEnabled('career_mode')) return null;
  const p = State.data.profiles[profileKey];
  const totalCorrect = (p.history || []).filter(h => h.correct).length;
  const ranks = profileKey === 'liam' ? CAREER_RANKS : CAREER_RANKS_RAIK;
  let current = ranks[0];
  for (const r of ranks) if (totalCorrect >= r.min) current = r;
  // Nächster Rang
  const next = ranks.find(r => r.min > totalCorrect);
  return { ...current, totalCorrect, nextAt: next?.min, nextName: next?.name };
}
