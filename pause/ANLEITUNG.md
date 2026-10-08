# Yggdrasil · Kurze Anleitung

## Installieren (Android, Chrome)

1. Diese Adresse in Chrome öffnen: **https://26januar2008-sketch.github.io/herzog-lernapp/pause/**
2. Oben rechts auf die drei Punkte, dann **„Zum Startbildschirm hinzufügen“** oder **„App installieren“**.
3. Einmal öffnen, kurz warten. Danach läuft die App auch ohne Netz (Flugmodus-Test: App schließen, Flugmodus an, App öffnen).

Nach einem Update: App schließen und neu öffnen, beim zweiten Start ist die neue Version da.

## Fahrt-Modus mit Tasker

Der Link für Tasker: `https://26januar2008-sketch.github.io/herzog-lernapp/pause/#fahrt`

Tasker-Profil „Auto“:

- **Auslöser:** Status → Netz → BT verbunden, Name deines Autos.
- **Aufgabe beim Verbinden:**
  1. Display → **Display Timeout**: 30 Minuten (braucht einmalig die Berechtigung „Systemeinstellungen ändern“).
  2. App → **URL öffnen** mit dem Link oben, in Chrome.
- **Aufgabe beim Trennen (Exit-Task):**
  1. Display → Display Timeout zurück auf deinen normalen Wert, zum Beispiel 1 Minute.

Hinweis: Tasker „Stay On“ hält den Bildschirm nur, solange das Handy lädt. Wenn dein Handy im Auto am Kabel hängt, geht das auch.

Dann im Auto: Handy in die Halterung, einmal auf den großen **Start**-Knopf tippen. Android verlangt diese eine Berührung, bevor eine Web-App sprechen darf. Danach nichts mehr anfassen.

Wenn der Bildschirm trotzdem ausgeht:

- **Energiesparmodus aus.** Android verweigert Browsern sonst die Bildschirm-Sperre.
- Die App muss vorne bleiben. Im Hintergrund kann sie weder sprechen noch den Bildschirm halten.
- Unter dem Ansage-Text steht, ob der Bildschirm gerade gehalten wird.

Wenn Spotify nicht leiser wird: In den Einstellungen der App ist „Gong vor jeder Ansage“ eingeschaltet. Der Gong holt den Ton zur App. Sag mir, was passiert, wenn es nicht reicht.

## Erinnerung am PC (Windows)

Im Ordner `pause/pc/` liegen zwei Dateien:

- **einrichten.cmd**: einmal doppelklicken. Legt in der Windows-Aufgabenplanung vier Aufgaben an. Werktags um 10:00, 12:00, 14:30 und 16:30 öffnet sich Yggdrasil als eigenes Fenster (Chrome oder Edge im App-Modus). Zeiten ändern: in der Datei die Zeile `ZEITEN` anpassen und noch einmal ausführen.
- **entfernen.cmd**: nimmt alle diese Aufgaben wieder weg.

Download: https://github.com/26januar2008-sketch/herzog-lernapp/raw/main/pause/pc/einrichten.cmd (Rechtsklick, „Link speichern unter“). Windows warnt beim ersten Start vor einer unbekannten Datei, „Trotzdem ausführen“ wählen.

Feiertage in Baden-Württemberg kennt die Aufgabenplanung nicht, da öffnet sich das Fenster trotzdem.

## Daten sichern

Alles liegt nur auf deinem Handy. Einstellungen → Daten → **Exportieren** erzeugt eine Datei, die du zum Beispiel in Google Drive legst. Auf einem neuen Handy mit **Importieren** zurückholen. Die PIN der Notizen wird nicht mit exportiert, die wählst du neu.

## Notizen

Der Knopf „Notizen“ ist der Bereich „Privat“. Beim ersten Öffnen wählst du eine PIN mit vier Ziffern. PIN vergessen: im PIN-Feld auf „Vergessen“, dann eine neue wählen. Deine gemerkten Einträge bleiben.

## Repository privat stellen (empfohlen)

Die Texte aus „Notizen“ und „Für uns“ liegen kodiert im Code. Wer gezielt sucht, kann sie lesen. Auf GitHub: Repository → Settings → ganz unten „Danger Zone“ → **Change visibility → Private**. Achtung: Die App läuft über GitHub Pages, und das ist beim kostenlosen Konto nur für öffentliche Repositories möglich. Privat stellen würde die App abschalten. Also entweder öffentlich lassen, oder die App auf ein anderes Hosting umziehen. Sag Bescheid, wenn du das willst.
