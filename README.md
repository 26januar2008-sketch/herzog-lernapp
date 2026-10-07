# Herzog Lernapp

PWA-Lernspiel für Liam (9, Klasse 3) und Raik (7, Klasse 1).

- **Liam-Theme:** Hof & Maschinen (Fendt, John Deere, Claas …)
- **Raik-Theme:** Sonic & Mario, ADHS-tauglich (Mikro-Sessions, Pause-Screens)
- **Fächer:** Lesen, Rechnen, Sachkunde, Musik
- **Belohnung:** Maschinen-Garage / Charakter-Sammlung freischalten
- **Adaptive Schwierigkeit** + **Eltern-Dashboard** (PIN 1979)

Statisches PWA, kein Build-Step. Hosting: Cloudflare Pages.
Backend: Supabase `nrmqdhcrshyoigesqapm`, Schema `lernapp`.

## Yggdrasil · Kurz raus (`/pause/`)

Eigene PWA für Michael: Pausen (Atmen, Beckenboden, Bewegen, Dehnen), Arbeitsblock, Tagestraining,
Yoga, Fahrt-Modus (`/pause/#fahrt`), Waldläufer, Für uns, Notizen mit PIN, Einstellungen.
Statisch, kein Build. Eigener Service Worker und eigenes Manifest unter `/pause/`.
Inhalte in `pause/data.js`, private Texte kodiert in `pause/privat.js`. Daten nur lokal im Handy (localStorage).
