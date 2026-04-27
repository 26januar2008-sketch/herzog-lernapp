// ============================================================
// Supabase-Sync: Profile-State zwischen Tablets + KI-Aufgaben
// ============================================================

const SUPABASE_URL = 'https://nrmqdhcrshyoigesqapm.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ybXFkaGNyc2h5b2lnZXNxYXBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MTQ3MjksImV4cCI6MjA4ODk5MDcyOX0.Hw4hg6f9iiJcw92veiEU4-oPGcRX_k5NoLuxHU5_ors';
const LERNAPP_KEY = 'herzog-lernapp-2026';

const Sync = {
  online: true,
  pendingPush: false,

  async loadProfile(profileKey) {
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/lernapp_state?profile_key=eq.${profileKey}&select=*`, {
        headers: { apikey: SUPABASE_ANON, Authorization: 'Bearer '+SUPABASE_ANON }
      });
      if (!r.ok) return null;
      const rows = await r.json();
      return rows[0] || null;
    } catch (e) { this.online = false; return null; }
  },

  async pushProfile(profileKey, data) {
    try {
      const body = {
        coins: data.coins,
        unlocked: data.unlocked,
        stats: data.stats,
        history: data.history.slice(-100),
        updated_at: new Date().toISOString()
      };
      const r = await fetch(`${SUPABASE_URL}/rest/v1/lernapp_state?profile_key=eq.${profileKey}`, {
        method: 'PATCH',
        headers: {
          apikey: SUPABASE_ANON,
          Authorization: 'Bearer '+SUPABASE_ANON,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        body: JSON.stringify(body)
      });
      this.online = r.ok;
      return r.ok;
    } catch (e) { this.online = false; return false; }
  },

  async fetchAITask(profileKey, subject) {
    try {
      const r = await fetch(`${SUPABASE_URL}/functions/v1/lernapp-generate/next?profile=${profileKey}&subject=${subject}`, {
        headers: {
          'X-Lernapp-Key': LERNAPP_KEY,
          Authorization: 'Bearer '+SUPABASE_ANON
        }
      });
      if (!r.ok) return null;
      const j = await r.json();
      return j.payload || null;
    } catch (e) { return null; }
  }
};

// Hydrate-Logik: beim Profil-Öffnen Remote-State holen, falls neuer als lokal
async function hydrateFromRemote(profileKey) {
  const remote = await Sync.loadProfile(profileKey);
  if (!remote) return;
  const localUpdated = State.data.profiles[profileKey]._lastSync || 0;
  const remoteUpdated = new Date(remote.updated_at).getTime();
  if (remoteUpdated > localUpdated) {
    const p = State.data.profiles[profileKey];
    p.coins = remote.coins;
    p.unlocked = remote.unlocked || [];
    p.stats = { ...p.stats, ...remote.stats };
    p.history = remote.history || [];
    p._lastSync = remoteUpdated;
    State.save();
  }
}

// Debounced Push nach jeder Aktion
let pushTimer = null;
function schedulePush(profileKey) {
  clearTimeout(pushTimer);
  pushTimer = setTimeout(async () => {
    const p = State.data.profiles[profileKey];
    const ok = await Sync.pushProfile(profileKey, p);
    if (ok) p._lastSync = Date.now();
    State.save();
  }, 1500);
}
