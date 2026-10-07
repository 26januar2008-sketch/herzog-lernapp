// ============================================================
// Yggdrasil · Inhalte aus dem Prototyp (pause.html)
// Alle Texte 1:1 übernommen. Nichts erfunden.
// ============================================================
window.YGG_DATA = (function () {
  const IN = 'Durch die Nase, Bauch weitet sich', OUT = 'Langsam durch den Mund';
  function rep(n, a) { const r = []; for (let i = 0; i < n; i++) r.push(...a); return r; }

  // ---- Atmen (Önd, der Atem)
  const breath = rep(11, [{ l: 'Einatmen', s: IN, t: 5, k: 'in' }, { l: 'Ausatmen', s: OUT + ', länger als ein', t: 6, k: 'out' }]);
  const seufzer = rep(8, [{ l: 'Einatmen', s: 'Tief durch die Nase', t: 2, k: 'in' }, { l: 'Nachziehen', s: 'Noch ein kurzer Zug obendrauf', t: 1, k: 'in' }, { l: 'Ausatmen', s: 'Lang und langsam durch den Mund', t: 6, k: 'out' }]);
  const box = rep(8, [{ l: 'Einatmen', s: IN, t: 4, k: 'in' }, { l: 'Halten', s: 'Locker halten, nicht pressen', t: 4, k: 'holdIn' }, { l: 'Ausatmen', s: OUT, t: 4, k: 'out' }, { l: 'Halten', s: 'Leer, locker bleiben', t: 4, k: 'holdOut' }]);
  const schlaf = rep(4, [{ l: 'Einatmen', s: 'Leise durch die Nase', t: 4, k: 'in' }, { l: 'Halten', s: 'Locker halten, nicht pressen', t: 7, k: 'holdIn' }, { l: 'Ausatmen', s: 'Hörbar durch den Mund', t: 8, k: 'out' }]);

  // ---- Beckenboden, 3 Stufen (Aufstieg nach 10 und 25 Einheiten)
  function makePelvic(lv) {
    const hold = [8, 10, 10][lv - 1], reps = [8, 10, 12][lv - 1];
    const a = [{ l: 'Vorbereiten', s: 'Aufrecht sitzen oder stehen, Knie leicht auseinander. Weiteratmen.', t: 5, k: 'rest' }];
    for (let i = 0; i < reps; i++) {
      a.push({ l: 'Maximal anspannen', s: 'Mit voller Kraft nach innen oben ziehen und halten. Po und Bauch locker, weiteratmen.', t: hold, k: 'max' });
      a.push({ l: 'Komplett lösen', s: 'Ganz loslassen, bewusst entspannen', t: hold, k: 'relax' });
    }
    if (lv >= 2) {
      a.push({ l: 'Aufzug Stufe 1', s: 'Leicht anspannen, ein Drittel der Kraft', t: 4, k: 'in' }, { l: 'Aufzug Stufe 2', s: 'Zwei Drittel', t: 4, k: 'in' }, { l: 'Aufzug Stufe 3', s: 'Voll anspannen und halten', t: 6, k: 'max' }, { l: 'Runter', s: 'Langsam Stufe für Stufe lösen', t: 6, k: 'relax' });
    }
    a.push({ l: 'Schnellkraft', s: 'Kräftig zusammenziehen und sofort lösen, so schnell du sauber kannst. 20 Mal.', t: 25, k: 'pulse' });
    a.push({ l: 'Entspannen', s: 'Ganz loslassen. Entspannen gehört zum Training.', t: 10, k: 'relax' });
    return a;
  }
  function pelvicLevel(n) { if (n >= 25) return { hold: 10, stufe: 3 }; if (n >= 10) return { hold: 10, stufe: 2 }; return { hold: 8, stufe: 1 }; }

  // ---- Bewegen
  const move = [
    { l: 'Aufstehen', s: 'Schultern langsam nach hinten kreisen', t: 20, k: 'move' },
    { l: 'Kniebeugen', s: 'Langsam runter, beim Hochkommen ausatmen', t: 25, k: 'move' },
    { l: 'Wadenheben', s: 'Auf die Zehen, langsam wieder ab', t: 20, k: 'move' },
    { l: 'Brust öffnen', s: 'Hände hinter den Kopf, Ellbogen weit nach hinten', t: 20, k: 'move' },
    { l: 'Hüfte kreisen', s: 'Große Kreise, dann Richtung wechseln', t: 20, k: 'move' },
    { l: 'Nacken', s: 'Kopf sanft zu jeder Seite neigen', t: 15, k: 'move' }];

  // ---- Dehnen
  const dehnen = [
    { l: 'Hüftbeuger links', s: 'Großer Ausfallschritt, linkes Knie hinten, Becken nach vorn schieben. Oberkörper aufrecht.', t: 30, k: 'move' },
    { l: 'Hüftbeuger rechts', s: 'Seite wechseln, rechtes Knie hinten.', t: 30, k: 'move' },
    { l: 'Oberschenkel hinten', s: 'Ferse auf eine Stufe, Bein gestreckt, mit geradem Rücken leicht vorbeugen. Erst links…', t: 25, k: 'move' },
    { l: '…dann rechts', s: 'Seite wechseln. Nicht wippen, ruhig atmen.', t: 25, k: 'move' },
    { l: 'Brust', s: 'Unterarm an Türrahmen oder Wand, Körper sanft wegdrehen. Links…', t: 25, k: 'move' },
    { l: '…und rechts', s: 'Seite wechseln.', t: 25, k: 'move' },
    { l: 'Waden', s: 'Hände an die Wand, ein Bein gestreckt nach hinten, Ferse am Boden. Nach 15 Sekunden wechseln.', t: 30, k: 'move' },
    { l: 'Unterarme', s: 'Arm gestreckt, Handfläche nach vorn, Finger mit der anderen Hand sanft zurückziehen. Dann Handrücken. Beide Seiten.', t: 40, k: 'move' },
    { l: 'Seite', s: 'Arm über den Kopf, zur Seite neigen. Nach 15 Sekunden wechseln.', t: 30, k: 'move' },
    { l: 'Nacken', s: 'Ohr Richtung Schulter, gegenüberliegende Schulter nach unten. Nach 15 Sekunden wechseln.', t: 30, k: 'move' }];

  // ---- Zirkel / Tagestraining
  function circuit(rounds, ex, work, rest) {
    const a = [{ l: 'Aufwärmen', s: 'Auf der Stelle laufen, Arme kreisen, locker werden.', t: 45, k: 'move' }];
    for (let r = 1; r <= rounds; r++) ex.forEach((e, i) => {
      a.push({ l: e[0] + ' · Runde ' + r, s: e[1], t: work, k: 'max' });
      if (rest) a.push({ l: 'Pause', s: 'Durchatmen. Nächste Übung: ' + (ex[i + 1] || ex[0])[0], t: rest, k: 'relax' });
    });
    a.push({ l: 'Auslaufen', s: 'Ruhig gehen, tief ausatmen.', t: 45, k: 'relax' });
    return a;
  }
  const drills = {
    kraft: { n: 'Kraft-Zirkel', d: 'Liegestütze, Kniebeugen, Ausfallschritte, Unterarmstütz. 3 Runden', m: '12 Min', p: circuit(3, [
      ['Liegestütze', 'Körper gerade wie ein Brett. Zu schwer: Knie ablegen.'],
      ['Kniebeugen', 'Tief runter, Fersen am Boden, Brust aufrecht.'],
      ['Ausfallschritte', 'Abwechselnd links und rechts, hinteres Knie fast am Boden.'],
      ['Unterarmstütz', 'Bauch und Po fest, weiteratmen, nicht pressen.']], 40, 20) },
    rumpf: { n: 'Rumpf & Rücken', d: 'Bird-Dog, Seitstütz, Superman, Mountain Climber. 3 Runden', m: '12 Min', p: circuit(3, [
      ['Bird-Dog', 'Vierfüßler, rechter Arm und linkes Bein strecken, wechseln. Langsam.'],
      ['Seitstütz', 'Halbe Zeit links, halbe Zeit rechts. Hüfte hoch.'],
      ['Superman', 'Bauchlage, Arme und Beine leicht abheben, halten.'],
      ['Mountain Climber', 'Knie zügig zur Brust, Rücken gerade.']], 40, 20) },
    hart: { n: 'Militär-Zirkel', d: 'Burpees, Hampelmann, Kniebeugen, Liegestütze. Zügig, 4 Runden', m: '14 Min', p: circuit(4, [
      ['Burpees', 'Runter, Brett, hoch, kleiner Sprung. Sauber vor schnell.'],
      ['Hampelmann', 'Locker und gleichmäßig.'],
      ['Sprung-Kniebeugen', 'Weich landen. Knie mag es nicht: normale Kniebeugen.'],
      ['Liegestütze', 'So viele saubere wie möglich.']], 40, 20) },
    mobil: { n: 'Mobility', d: 'Heute ist Training. Nur lockern, damit du frisch bist', m: '6 Min', p: [
      { l: 'Hüfte kreisen', s: 'Große Kreise, beide Richtungen.', t: 40, k: 'move' },
      { l: 'Tiefe Hocke', s: 'In die tiefe Hocke, Ellbogen drücken die Knie leicht auseinander.', t: 45, k: 'move' },
      { l: 'Weltbeste Dehnung links', s: 'Ausfallschritt, linke Hand neben den Fuß, rechten Arm zur Decke drehen.', t: 40, k: 'move' },
      { l: 'Weltbeste Dehnung rechts', s: 'Seite wechseln.', t: 40, k: 'move' },
      { l: 'Katze-Kuh', s: 'Vierfüßler, Rücken rund, dann hohl. Mit dem Atem.', t: 45, k: 'move' },
      { l: 'Schultern', s: 'Arme groß nach hinten kreisen, dann Nacken locker.', t: 40, k: 'move' },
      { l: 'Nacken & Handgelenke', s: 'Ringer-Klassiker: Nacken sanft kreisen, Handgelenke lockern.', t: 40, k: 'move' }] } };
  // Standard-Wochenplan, Index = getDay() (0 = Sonntag)
  // So Militär · Mo Kraft · Di Ringen · Mi CrossFit · Do Ringen · Fr Rumpf · Sa Kampf
  const dayDrill = ['hart', 'kraft', 'mobil', 'mobil', 'mobil', 'rumpf', 'mobil'];

  // ---- Yoga, 10-Minuten-Flow
  const yoga = [
    { l: 'Ankommen', s: 'Bequem sitzen, Augen zu, ruhig durch die Nase atmen.', t: 40, k: 'rest' },
    { l: 'Katze-Kuh', s: 'Einatmen Rücken hohl, ausatmen rund.', t: 50, k: 'move' },
    { l: 'Herabschauender Hund', s: 'Po hoch, Fersen Richtung Boden, abwechselnd die Knie beugen.', t: 50, k: 'move' },
    { l: 'Tiefer Ausfallschritt links', s: 'Rechtes Knie ablegen, Hüfte sinkt nach vorn, Arme hoch.', t: 45, k: 'move' },
    { l: 'Tiefer Ausfallschritt rechts', s: 'Seite wechseln.', t: 45, k: 'move' },
    { l: 'Krieger II links', s: 'Breiter Stand, linkes Knie über dem Fuß, Arme lang.', t: 40, k: 'move' },
    { l: 'Krieger II rechts', s: 'Seite wechseln.', t: 40, k: 'move' },
    { l: 'Taube links', s: 'Linkes Bein vorn angewinkelt, rechtes lang nach hinten. Für Hüfte und Po.', t: 60, k: 'move' },
    { l: 'Taube rechts', s: 'Seite wechseln.', t: 60, k: 'move' },
    { l: 'Kind', s: 'Fersensitz, Stirn ablegen, Arme lang. Atem in den Rücken.', t: 50, k: 'relax' },
    { l: 'Drehung im Liegen', s: 'Rückenlage, Knie nach links fallen lassen, Blick nach rechts. Nach 30 Sekunden wechseln.', t: 60, k: 'relax' },
    { l: 'Entspannung', s: 'Flach liegen, alles schwer werden lassen.', t: 60, k: 'relax' }];

  // ---- „Beine schonen“: Ersatz-Übungen
  const LEG = /Kniebeuge|Ausfallschritt|Burpee|Hampelmann|Mountain|Wade|Hocke|Weltbeste|Hüftbeuger|Oberschenkel|Krieger|Taube|Hund|Auf der Stelle|Hüfte kreisen|Aufstehen/;
  const UPPER = [
    ['Liegestütze erhöht', 'Hände auf Tisch oder Bank, Körper gerade. Beine nur abstützen.'],
    ['Stuhl-Dips', 'Hände auf die Stuhlkante, Beine nur leicht aufstellen, nicht abdrücken.'],
    ['Schulterdrücken', 'Zwei volle Wasserflaschen, im Sitzen über den Kopf drücken.'],
    ['Rudern im Sitzen', 'Flaschen oder Rucksack, Oberkörper leicht vor, Ellbogen nach hinten ziehen.'],
    ['Unterarmstütz auf den Knien', 'Knie am Boden, Bauch fest, weiteratmen.'],
    ['Arme halten', 'Arme seitlich gestreckt halten, kleine Kreise.']];
  // Sitzende Alternativen im Yoga-Flow (Korrektur aus Auftrag B2.10: ersetzt Krieger, Taube, Hund)
  const SEATED = [
    ['Drehsitz links', 'Aufrecht sitzen, rechte Hand ans linke Knie, Oberkörper sanft nach links drehen. Ruhig atmen.'],
    ['Drehsitz rechts', 'Seite wechseln.'],
    ['Nacken', 'Kopf sanft zu jeder Seite neigen, die andere Schulter bleibt unten.'],
    ['Schulterkreise', 'Große, langsame Kreise nach hinten, dann nach vorn.']];

  // ---- Runen (moderne Deutungen)
  const runes = [
    ['ᚠ', 'Fehu', 'Besitz und Wohlstand.', 'Pflege heute, was du schon hast, statt nur Neues zu jagen.'],
    ['ᚢ', 'Uruz', 'Urkraft, Stärke.', 'Heute eine Bewegungspause mehr. Dein Körper ist dein Werkzeug.'],
    ['ᚦ', 'Thurisaz', 'Thors Kraft, Schutz und Widerstand.', 'Stell dich einer Sache, die du vor dir herschiebst.'],
    ['ᚨ', 'Ansuz', 'Odins Rune, Wort und Weisheit.', 'Sprich heute ein ehrliches Wort, zuhause oder im Betrieb.'],
    ['ᚱ', 'Raidho', 'Reise, der richtige Weg.', 'Prüf kurz, ob dein Tag in die Richtung geht, die du willst.'],
    ['ᚲ', 'Kenaz', 'Fackel, Erkenntnis.', 'Lern heute etwas Neues, auch wenn es nur eine Kleinigkeit ist.'],
    ['ᚷ', 'Gebo', 'Gabe und Austausch.', 'Schenk jemandem heute Zeit oder Aufmerksamkeit.'],
    ['ᚹ', 'Wunjo', 'Freude und Gemeinschaft.', 'Nimm dir bewusst Zeit für die Menschen, die dir wichtig sind.'],
    ['ᚺ', 'Hagalaz', 'Hagel, Störung, die klärt.', 'Wenn heute etwas schiefgeht: durchatmen, dann handeln.'],
    ['ᚾ', 'Nauthiz', 'Not, die stark macht.', 'Was dich heute drückt, trainiert dich. Atempause einlegen.'],
    ['ᛁ', 'Isa', 'Eis, Stillstand, Ruhe.', 'Heute ist ein Tag für Stille. Deine zehn Minuten nicht vergessen.'],
    ['ᛃ', 'Jera', 'Ernte, die Frucht der Zeit.', 'Geduld: Was du regelmäßig tust, trägt später Frucht.'],
    ['ᛇ', 'Eihwaz', 'Eibe, Ausdauer.', 'Bleib dran, auch wenn es heute zäh ist.'],
    ['ᛈ', 'Perthro', 'Das Verborgene, das Los.', 'Lass heute etwas Unerwartetes zu.'],
    ['ᛉ', 'Algiz', 'Schutz.', 'Schütz heute deine Grenzen: Feierabend ist Feierabend.'],
    ['ᛊ', 'Sowilo', 'Sonne, Kraft und Gelingen.', 'Geh heute in der Pause kurz raus ans Licht.'],
    ['ᛏ', 'Tiwaz', 'Tyr, Mut und Gerechtigkeit.', 'Triff heute eine Entscheidung, die richtig ist, nicht bequem.'],
    ['ᛒ', 'Berkano', 'Birke, Wachstum und Familie.', 'Sei heute ganz bei deinen Kindern, wenn du bei ihnen bist.'],
    ['ᛖ', 'Ehwaz', 'Pferd, Vertrauen und Partnerschaft.', 'Zeig Claudia heute, dass du auf sie zählst.'],
    ['ᛗ', 'Mannaz', 'Der Mensch, Gemeinschaft.', 'Hör heute einem deiner Leute richtig zu.'],
    ['ᛚ', 'Laguz', 'Wasser, Fluss, Gefühl.', 'Trink genug und lass die Dinge fließen.'],
    ['ᛜ', 'Ingwaz', 'Samen, Kraft in Ruhe.', 'Säe heute etwas für später: eine Idee, ein Gespräch.'],
    ['ᛞ', 'Dagaz', 'Tag, Durchbruch.', 'Heute kann etwas Neues beginnen. Nutz den Morgen.'],
    ['ᛟ', 'Othala', 'Erbe, Heimat, Ahnen.', 'Denk an das, was du weitergeben willst, im Betrieb und an die Kinder.']];

  // ---- Sprüche frei nach dem Hávamál
  const sayings = [
    'Wer maßhält bei Met und Mahl, bleibt klar im Kopf.',
    'Früh aufstehen muss, wer viel schaffen will.',
    'Besser ein kleines eigenes Haus als an fremdem Tisch betteln.',
    'Vieh stirbt, Verwandte sterben, doch der Ruf, den einer sich erwirbt, stirbt nie.',
    'Zum Freund führt ein kurzer Weg, auch wenn er weit weg wohnt.',
    'Der Gast braucht Wasser, Feuer und ein freundliches Wort.',
    'Mäßig klug soll ein Mann sein, nicht allzu klug. Wer sein Schicksal nicht vorher kennt, lebt freier.',
    'Wer allein ist, verdorrt wie eine Tanne ohne Rinde und Nadeln.',
    'Ein guter Freund ist der, dem man sein Herz ganz öffnen kann.',
    'Lange schweigen ist besser als unbedacht reden.'];

  // ---- Fahrt-Modus: Ansagen (deutsch)
  const driveBlocks = [
    { intro: 'Beckenboden. Wir spannen fünfmal an, weiter normal atmen.', reps: 5, start: 5000, period: 12000, on: 'Anspannen', off: 'Lösen', offAt: 6000, dur: 66000 },
    { intro: 'Ruhig atmen. Sechs Atemzüge, langsam aus.', reps: 6, start: 4000, period: 11000, on: 'Ein', off: 'Aus', offAt: 5000, dur: 72000 },
    { intro: 'Haltung. Aufrecht sitzen, Schultern weg von den Ohren, Kinn leicht zurück. Hände locker am Lenkrad.', dur: 12000 },
    { intro: 'Schultern. An der nächsten roten Ampel: Schultern hochziehen, halten, fallen lassen. Dreimal.', dur: 12000 }];

  // ---- Waldläufer (Survival), Stufen 1+2 fertig, 3–6 folgen
  const W = [
    { r: 'ᚲ', n: 'Feuer', rn: 'Kenaz, die Fackel',
      cards: [
        ['Das Feuerdreieck', 'Feuer braucht Brennstoff, Hitze und Sauerstoff. Fehlt eins, geht es aus. Die meisten Anfänger ersticken ihr Feuer, weil sie zu früh zu viel Holz drauflegen.'],
        ['Drei Holzstufen', 'Zunder fängt den Funken. Anzündholz ist streichholz- bis bleistiftdick. Brennholz ist daumen- bis armdick. Leg von jeder Stufe einen guten Haufen bereit, bevor du den ersten Funken schlägst.'],
        ['Birkenrinde', 'Die äußere, papierdünne Birkenrinde enthält ein Öl und brennt sogar feucht. Nur lose Streifen abziehen, nie den Stamm schälen, sonst schadet es dem Baum.'],
        ['Trockenes Holz finden', 'Tote Äste, die noch am Baum hängen, sind viel trockener als Holz vom Boden. Test: Bricht er mit hellem Knacken, ist er trocken. Biegt er sich, ist er nass.'],
        ['Feuerstahl richtig', 'Nicht den Stab über den Zunder schlagen, sondern den Stahl ruhig halten und den Stab nach hinten wegziehen. So bleibt der Zunder liegen, und die Funken landen genau drauf.'],
        ['Kienspan und Harz', 'Harzreiches Kiefernholz, oft am Fuß abgestorbener Kiefern, brennt lange und heiß. Ein paar Späne davon retten jedes Feuer bei Regen.'],
        ['Tipi oder Blockhaus', 'Tipi: Hölzer kegelförmig, brennt schnell und hoch, gut zum Anzünden. Blockhaus: Hölzer kreuzweise gestapelt, brennt gleichmäßig und gibt gute Glut zum Kochen.'],
        ['Feuer sicher löschen', 'Wasser drauf, umrühren, nochmal Wasser. Dann die Hand knapp über die Asche halten. Spürst du noch Wärme, ist es nicht aus. Glut kann in Wurzeln und Waldboden weiterglimmen.']],
      quiz: [
        ['Welches Holz ist meist am trockensten?', ['Holz vom Waldboden', 'Tote Äste, die noch am Baum hängen', 'Frische grüne Äste'], 1, 'Holz am Boden saugt Feuchtigkeit auf. Totholz am Baum trocknet im Wind.'],
        ['Wie dick sollte Anzündholz sein?', ['Streichholz bis Bleistift', 'Daumen bis Arm', 'Wie ein Unterarm'], 0, 'Erst dünnes Anzündholz, dann langsam dicker werden.'],
        ['Warum brennt Birkenrinde auch feucht?', ['Sie ist innen hohl', 'Sie enthält ein Öl', 'Sie ist besonders dünn'], 1, 'Das Öl in der Rinde brennt auch, wenn die Oberfläche nass ist.'],
        ['Was ist der häufigste Anfängerfehler?', ['Zu wenig Zunder', 'Zu früh zu viel dickes Holz', 'Zu viel Wind'], 1, 'Dickes Holz zu früh erstickt die kleine Flamme.'],
        ['Wie prüfst du, ob ein Feuer aus ist?', ['Kein Rauch mehr zu sehen', 'Hand knapp über die Asche halten', 'Eine Stunde warten'], 1, 'Rauch kann fehlen, obwohl darunter noch Glut ist.'],
        ['Welche Feuerform gibt die beste Kochglut?', ['Tipi', 'Blockhaus', 'Sternfeuer'], 1, 'Das kreuzweise gestapelte Blockhaus brennt gleichmäßig nieder.']],
      tasks: [
        ['Zunder sammeln', 'Drei verschiedene Zunder aus dem Wald finden, z. B. Birkenrinde, trockenes Gras, Kiefernharz.'],
        ['Feuer mit Feuerstahl', 'An einer erlaubten Feuerstelle ein Feuer nur mit Feuerstahl entzünden.'],
        ['Feuer bei Nässe', 'Nach Regen ein Feuer in unter 15 Minuten. Tipp: Totholz von innen spalten, das ist trocken.'],
        ['Sicher löschen', 'Feuer komplett löschen und mit der Hand prüfen.']] },
    { r: 'ᛉ', n: 'Schutz & Shelter', rn: 'Algiz, der Schutz',
      cards: [
        ['Zuerst der Platz', 'Nicht in eine Senke, dort sammeln sich kalte Luft und Wasser. Nicht unter tote Äste, die nennt man im Englischen „Witwenmacher“. Leicht erhöht, windgeschützt, Eingang weg vom Wind.'],
        ['Unten ist wichtiger als oben', 'Der Boden zieht dir über die Berührung viel mehr Wärme aus dem Körper als die Luft. Eine dicke Schicht Laub, Fichtenzweige oder eine Isomatte unter dir ist wichtiger als ein dichtes Dach.'],
        ['Tarp als A-Dach', 'Eine Leine zwischen zwei Bäumen auf Hüfthöhe, Tarp drüber, Seiten schräg abspannen. Bei Regen tief, bei schönem Wetter höher und offener.'],
        ['Die Laubhütte', 'Eine lange, stabile Firststange auf einen Baumstumpf oder eine Astgabel legen, das andere Ende auf den Boden. Seitlich Äste anlehnen wie Rippen, dann dick mit Laub abdecken, mindestens armlang. Innen nur so groß, dass du gerade reinpasst. Kleiner Raum bleibt warm.'],
        ['Das Pultdach mit Feuer', 'Ein schräges Dach auf einer Seite offen, davor ein Feuer und dahinter eine Wand aus aufgeschichteten Stämmen. Die Wand wirft die Wärme zurück in den Shelter.'],
        ['Knoten: Palstek', 'Bildet eine feste Schlinge, die sich nicht zuzieht und sich trotzdem leicht wieder löst. Für Leinen um Bäume und zum Sichern von Menschen.'],
        ['Knoten: Spannknoten', 'Lässt sich verschieben und hält trotzdem unter Last. Damit spannst du die Abspannleinen deines Tarps nach.'],
        ['Knoten: Mastwurf', 'Schnell um einen Pfahl oder Ast gelegt. Gut zum Starten einer Leine, hält aber nur unter Zug.'],
        ['Ein fester Unterschlupf', 'Für eine dauerhafte Hütte oder Kote auf deinem Grundstück gilt Baurecht. Im Außenbereich braucht fast jedes feste Gebäude eine Genehmigung. Ein Shelter aus Ästen, der wieder abgebaut wird, ist etwas anderes. Vorher beim Bauamt oder Forstamt fragen.']],
      quiz: [
        ['Wo baust du deinen Shelter?', ['In der windstillen Senke', 'Leicht erhöht, nicht unter toten Ästen', 'Direkt am Bach'], 1, 'In Senken sammeln sich kalte Luft und Wasser. Am Bach ist es feucht und laut.'],
        ['Was ist im Kalten am wichtigsten?', ['Ein hohes Dach', 'Isolation unter dir', 'Ein großer Innenraum'], 1, 'Über den Boden verlierst du die meiste Wärme.'],
        ['Wie dick sollte das Laub auf einer Laubhütte sein?', ['Eine Handbreit', 'Mindestens eine Armlänge', 'Egal, Hauptsache dicht'], 1, 'Erst eine dicke Schicht hält Wärme und Regen ab.'],
        ['Welcher Knoten zieht sich nicht zu?', ['Palstek', 'Mastwurf', 'Spannknoten'], 0, 'Der Palstek bildet eine feste Schlinge.'],
        ['Welcher Knoten ist zum Nachspannen?', ['Palstek', 'Spannknoten', 'Kreuzknoten'], 1, 'Der Spannknoten lässt sich schieben und hält unter Last.'],
        ['Warum eine Wand hinter dem Feuer?', ['Gegen Tiere', 'Sie wirft die Wärme zurück', 'Gegen Rauch'], 1, 'Die Wand reflektiert die Wärme in den Shelter.']],
      tasks: [
        ['Drei Knoten blind', 'Palstek, Spannknoten und Mastwurf mit geschlossenen Augen binden.'],
        ['Tarp in 5 Minuten', 'Ein A-Dach mit Tarp und Leine in unter 5 Minuten aufbauen.'],
        ['Laubhütte bauen', 'Eine Laubhütte bauen, in die du ganz reinpasst. Danach wieder abbauen.'],
        ['Eine Nacht draußen', 'Mit Erlaubnis des Grundstückseigentümers eine Nacht im eigenen Shelter.']] },
    { r: 'ᛚ', n: 'Wasser', rn: 'Laguz, das Wasser', locked: true },
    { r: 'ᚱ', n: 'Weg finden', rn: 'Raidho, die Reise', locked: true },
    { r: 'ᚺ', n: 'Heilen & Erste Hilfe', rn: 'Hagalaz, die Prüfung', locked: true },
    { r: 'ᛃ', n: 'Nahrung aus dem Wald', rn: 'Jera, die Ernte', locked: true }];

  // ---- Ausrüstung
  const GEAR = [
    ['Grundausrüstung', [
      ['Feststehendes Messer', 'Klinge um 10 cm, z. B. ein Mora Companion. Robust, günstig, leicht zu schärfen.'],
      ['Feuerstahl', 'Funktioniert auch nass. Dazu etwas Zunder in einer Dose, z. B. Watte mit Vaseline.'],
      ['Tarp 3 × 3 m', 'Mit Ösen. Grün oder braun fällt im Wald weniger auf.'],
      ['Paracord, 30 m', 'Für Leinen, Abspannung und Reparaturen.'],
      ['Klappsäge', 'Schneller und sicherer als ein Beil, gerade am Anfang.'],
      ['Stirnlampe', 'Mit Ersatzbatterien.'],
      ['Erste-Hilfe-Set', 'Dazu eine Rettungsdecke.']]],
    ['Für Wasser', [
      ['Edelstahlflasche', 'Ohne Beschichtung, damit du darin Wasser abkochen kannst.'],
      ['Wasserfilter', 'Ein kleiner Filter zum Durchdrücken oder Saugen. Gegen Viren hilft nur Abkochen.']]],
    ['Für die Nacht', [
      ['Isomatte', 'Die wichtigste Wärmequelle von unten.'],
      ['Schlafsack', 'Komfortbereich passend zur Jahreszeit.'],
      ['Wechselkleidung', 'Wolle statt Baumwolle. Wolle wärmt auch feucht.']]],
    ['Orientierung', [
      ['Karte 1:25.000', 'Deine Gegend auf Papier.'],
      ['Kompass', 'Mit Spiegel oder Lineal zum Kartenlesen.']]],
    ['Beachten', [
      ['Messer führen', 'In der Öffentlichkeit dürfen Messer mit feststehender Klinge über 12 cm und Einhandmesser nicht griffbereit getragen werden. Im Rucksack verpackt auf dem Weg in den Wald ist es in Ordnung. Regeln können sich ändern, im Zweifel nachschauen.'],
      ['Feuer und Übernachten', 'Im Wald in Baden-Württemberg nur mit Erlaubnis. Für dein eigenes Grundstück beim Forstamt nachfragen.']]]];

  return { breath, seufzer, box, schlaf, makePelvic, pelvicLevel, move, dehnen, drills, dayDrill, yoga, LEG, UPPER, SEATED, runes, sayings, driveBlocks, W, GEAR };
})();
