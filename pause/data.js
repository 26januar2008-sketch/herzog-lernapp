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
    // ---- Stufen 3–6: Entwurf (entwurf: true), fachlich noch nicht von Michael geprüft.
    { r: 'ᛚ', n: 'Wasser', rn: 'Laguz, das Wasser', entwurf: true,
      cards: [
        ['Wasser vor Nahrung', 'Ohne Wasser hältst du ein paar Tage durch, ohne Essen Wochen. Beim Gehen mit Rucksack brauchst du zwei bis drei Liter am Tag, bei Hitze mehr. Dunkler Urin, Kopfweh und schlechte Laune sind die ersten Zeichen, dass du zu wenig trinkst.'],
        ['Wo du suchst', 'Fließend vor stehend. Weiter oben am Hang vor weiter unten. Oberhalb von Weiden, Äckern und Dörfern, nie unterhalb. Eine Quelle, die direkt aus dem Boden kommt, ist meist das sauberste Wasser im Wald. Trotzdem gilt: Jedes Wasser aus der Natur aufbereiten.'],
        ['Was im Wasser steckt', 'Drei Dinge machen krank: Bakterien, Einzeller wie Giardien und Viren. Dazu kommt Dreck, der Filter verstopft und Mittel schwächt. Trübes Wasser erst durch ein Tuch gießen oder eine Stunde stehen lassen, dann aufbereiten.'],
        ['Abkochen ist am sichersten', 'Sprudelnd kochen lassen, eine Minute reicht. Das tötet Bakterien, Einzeller und Viren. Nachteil: braucht Feuer und Zeit, und das Wasser schmeckt fad. Zwischen zwei Gefäßen umgießen bringt Luft und Geschmack zurück.'],
        ['Filter', 'Kleine Hohlfaserfilter halten Bakterien und Einzeller zurück. Viren sind zu klein für die meisten Filter. In Baden-Württemberg kommen Viren in Bächen selten vor, aber ganz sicher bist du nur mit Abkochen oder zusätzlich Tabletten. Filter nach Gebrauch rückspülen und frostfrei lagern, ein gefrorener Filter ist kaputt.'],
        ['Tabletten', 'Chlordioxid-Tabletten töten Bakterien und Viren in etwa 30 Minuten. Gegen Giardien brauchen sie bis zu zwei Stunden, bei kaltem Wasser noch länger. Immer die Zeit auf der Packung einhalten. Praktisch als Reserve im Rucksack, weil leicht und lange haltbar.'],
        ['Regen sammeln', 'Das Tarp schräg spannen, in der Mitte eine Mulde, einen Stein hinein, darunter die Flasche. Regen direkt vom Tarp ist sauber genug zum Trinken, wenn das Tarp vorher nicht voller Vogeldreck war. Morgens lässt sich auch Tau mit einem Tuch von Gras aufnehmen und auswringen.'],
        ['Schnee und Eis', 'Schnee nicht essen, das kühlt den Körper aus und bringt kaum Wasser. Erst schmelzen, am besten mit einem Schluck Wasser im Topf, sonst brennt der Schnee an. Danach wie jedes andere Wasser behandeln.'],
        ['Die Flasche', 'Eine Edelstahlflasche ohne Beschichtung kannst du direkt ins Feuer stellen. So wird aus Finden, Filtern und Kochen ein Gerät. Deckel vorher abschrauben, sonst baut sich Druck auf.']],
      quiz: [
        ['Wie lange muss Wasser kochen, damit es sicher ist?', ['Nur kurz aufwallen', 'Eine Minute sprudelnd', 'Mindestens zehn Minuten'], 1, 'Eine Minute sprudelnd kochen tötet Bakterien, Einzeller und Viren.'],
        ['Was halten kleine Wasserfilter nicht zurück?', ['Bakterien', 'Einzeller wie Giardien', 'Viren'], 2, 'Viren sind zu klein für Hohlfaserfilter. Dagegen hilft Abkochen oder eine Tablette.'],
        ['Wo suchst du Wasser am besten?', ['Unterhalb einer Weide', 'Oberhalb von Weiden und Dörfern, fließend', 'Im stehenden Tümpel'], 1, 'Alles, was oberhalb liegt, landet im Wasser. Fließendes Wasser ist frischer als stehendes.'],
        ['Was machst du mit trübem Wasser vor dem Filtern?', ['Direkt filtern', 'Durch ein Tuch gießen oder absetzen lassen', 'Mehr Tabletten nehmen'], 1, 'Dreck verstopft den Filter und schwächt Tabletten. Vorfiltern spart beides.'],
        ['Warum keinen Schnee essen?', ['Er ist giftig', 'Er kühlt den Körper aus und bringt kaum Wasser', 'Er macht durstig'], 1, 'Schnee erst schmelzen, dann trinken.'],
        ['Was passiert mit einem Filter, der einfriert?', ['Nichts', 'Er ist kaputt, auch wenn man es nicht sieht', 'Er filtert besser'], 1, 'Die feinen Fasern reißen beim Gefrieren. Filter im Winter am Körper tragen.']],
      tasks: [
        ['Wasser finden', 'Auf einer Wanderung drei mögliche Wasserstellen finden und bewerten: fließend oder stehend, was liegt oberhalb.'],
        ['Filtern und kochen', 'Bachwasser vorfiltern, durch den Filter ziehen und in der Edelstahlflasche am Feuer abkochen.'],
        ['Regen sammeln', 'Mit dem Tarp bei Regen mindestens einen halben Liter auffangen.'],
        ['Tagesbedarf', 'An einem Trainingstag zählen, wie viel du wirklich trinkst. Ziel: zwei bis drei Liter.']] },
    { r: 'ᚱ', n: 'Weg finden', rn: 'Raidho, die Reise', entwurf: true,
      cards: [
        ['Die Karte lesen', 'Auf der Karte 1:25.000 ist ein Zentimeter in der Wirklichkeit 250 Meter. Höhenlinien zeigen das Gelände: liegen sie eng, ist es steil. Täler führen fast immer zu Bächen, Wegen und Dörfern. In Baden-Württemberg bist du selten mehr als eine Stunde von einer Straße entfernt.'],
        ['Karte einnorden', 'Kompass flach auf die Karte, Nadel und Nordlinien der Karte zur Deckung bringen. Jetzt stimmt die Karte mit dem Gelände überein, und du kannst Berge, Täler und Wege zuordnen. Das ist der wichtigste Handgriff, alles andere baut darauf auf.'],
        ['Peilung nehmen und gehen', 'Kompasskante von deinem Standort zum Ziel legen, Dose drehen, bis die Nordlinien parallel zum Kartennorden stehen. Die Zahl an der Marke ist deine Marschrichtung. Beim Gehen die Nadel in die Dose bringen und ein Zwischenziel anpeilen, zum Beispiel einen auffälligen Baum. Dorthin gehen, neu peilen.'],
        ['Missweisung', 'Die Nadel zeigt zum magnetischen Nordpol, nicht zum echten. Der Unterschied liegt in Baden-Württemberg derzeit bei rund drei Grad nach Osten. Für Wanderungen kannst du das vernachlässigen, für lange Peilungen querfeldein rechnest du es ein. Der Wert ändert sich über die Jahre langsam.'],
        ['Sonne als Kompass', 'Die Sonne steht mittags im Süden. Durch die Sommerzeit ist das bei uns etwa um halb zwei, im Winter etwa um halb eins. Mit einer Zeigeruhr: Stundenzeiger zur Sonne richten, die Mitte zwischen Zeiger und der Zwölf (im Sommer der Eins) zeigt nach Süden.'],
        ['Nachts', 'Den Großen Wagen suchen. Die beiden hinteren Kastensterne fünfmal verlängern, dort steht der Polarstern. Er zeigt immer nach Norden und ist nicht besonders hell. Der Mond taugt nur grob: ein zunehmender Halbmond steht abends im Süden.'],
        ['Deine Schrittlänge', 'Eine bekannte Strecke von 100 Metern abgehen und die Doppelschritte zählen, meistens sind es 60 bis 70. Damit kannst du im Wald Entfernungen abschätzen, wenn die Karte 400 Meter sagt. Bergauf werden die Schritte kürzer, also mehr zählen.'],
        ['Wegzeichen und Rettungspunkte', 'Die Wanderwege im Schwarzwald und auf der Alb sind mit farbigen Rauten markiert. Dazu stehen im Wald grüne Schilder mit einer Nummer: Rettungspunkte. Die Nummer sagst du im Notfall der 112, dann findet dich der Rettungsdienst. Merk dir den letzten, an dem du vorbeikamst.'],
        ['Verlaufen', 'Anhalten, nicht weiterrennen. Nachdenken: Wo war ich zuletzt sicher? Umsehen: Was erkenne ich wieder, wo ist Wasser, wo führt das Tal hin? Planen: zurück zum letzten sicheren Punkt oder bergab dem Bach folgen. Handy mit Offline-Karte ist dein Netz, der Kompass dein Boden.']],
      quiz: [
        ['Wie viel sind 4 cm auf einer Karte 1:25.000?', ['400 Meter', '1 Kilometer', '2,5 Kilometer'], 1, 'Ein Zentimeter sind 250 Meter, vier Zentimeter ein Kilometer.'],
        ['Was heißen eng liegende Höhenlinien?', ['Flaches Gelände', 'Steiles Gelände', 'Wasser'], 1, 'Je enger die Linien, desto steiler der Hang.'],
        ['Wo steht die Sonne im Sommer um halb zwei?', ['Im Osten', 'Im Süden', 'Im Westen'], 1, 'Durch die Sommerzeit ist der wahre Mittag bei uns etwa um halb zwei.'],
        ['Wie findest du den Polarstern?', ['Hellster Stern am Himmel', 'Hinterachse des Großen Wagens fünfmal verlängern', 'Direkt über dem Mond'], 1, 'Der Polarstern ist nicht sehr hell, dafür steht er immer im Norden.'],
        ['Was sagst du der 112, wenn du im Wald bist?', ['Den Namen des Waldes', 'Die Nummer des letzten Rettungspunkts', 'Die Himmelsrichtung'], 1, 'Die grünen Rettungspunkt-Schilder sind für genau diesen Fall da.'],
        ['Was tust du als Erstes, wenn du dich verlaufen hast?', ['Schneller gehen', 'Anhalten und nachdenken', 'Laut rufen'], 1, 'Wer hastig weiterläuft, verläuft sich tiefer. Erst stehen bleiben.']],
      tasks: [
        ['Karte und Gelände', 'An einem Aussichtspunkt die Karte einnorden und fünf Dinge im Gelände auf der Karte wiederfinden.'],
        ['Peilung gehen', 'Ein Ziel in 500 Metern Entfernung nur mit Kompass und Zwischenzielen erreichen, ohne Weg.'],
        ['Schrittlänge', 'Deine Doppelschritte auf 100 Metern zählen und notieren. Dann 300 Meter im Wald abschätzen und mit der Karte prüfen.'],
        ['Nacht', 'In einer klaren Nacht den Polarstern finden und die Himmelsrichtungen zeigen. Mit der Familie.']] },
    { r: 'ᚺ', n: 'Heilen & Erste Hilfe', rn: 'Hagalaz, die Prüfung', entwurf: true,
      cards: [
        ['Erst der Überblick', 'Eigene Sicherheit zuerst, dann der Verletzte. Ansprechen, anfassen, atmet er? Bei Bewusstlosigkeit mit Atmung: stabile Seitenlage. Ohne Atmung: 112 und Herzdruckmassage, 100 bis 120 Mal pro Minute, fünf bis sechs Zentimeter tief, nach 30 Mal zwei Atemspenden. Nicht aufhören, bis Hilfe da ist.'],
        ['Blutung', 'Direkt mit der Hand oder einem Tuch draufdrücken, Arm oder Bein hochhalten, dann Druckverband: Wundauflage, Verband, festes Polster drauf, nochmal wickeln. Ein Abbindeband nur bei lebensbedrohlicher Blutung an Arm oder Bein, Uhrzeit notieren und nie wieder lösen. Das macht der Rettungsdienst.'],
        ['Wunden im Wald', 'Mit sauberem Trinkwasser ausspülen, Dreck raus. Die Wundränder desinfizieren, steril abdecken. Tiefe Wunden, Bisse und alles, was klafft, gehören zum Arzt. Tetanus-Impfung prüfen, sie hält zehn Jahre.'],
        ['Zecken', 'Baden-Württemberg ist fast überall FSME-Gebiet, dazu Borreliose. Zecke hautnah mit Karte oder Pinzette fassen und langsam gerade herausziehen, kein Öl, kein Kleber. Stelle markieren. Rötung, die nach Tagen größer wird, oder Fieber: zum Arzt. Eine FSME-Impfung ist für dich und die Kinder eine Überlegung wert.'],
        ['Unterkühlung', 'Zittern ist das erste Zeichen, Verwirrtheit und Aufhören des Zitterns das gefährliche. Raus aus nassen Sachen, Isolation unter den Körper, Rettungsdecke, Mütze. Warme süße Getränke nur, wenn er klar bei Bewusstsein ist. Kein Alkohol, nicht reiben, langsam aufwärmen.'],
        ['Hitze', 'Hitzeerschöpfung: blass, schwitzig, schwindelig. Schatten, trinken, Beine hoch. Hitzschlag: heiße trockene Haut, Verwirrtheit, das ist ein Notfall. 112, kühlen mit Wasser und Fächeln. Vorbeugen: früh starten, Pausen im Schatten, trinken bevor der Durst kommt.'],
        ['Verstauchung und Bruch', 'PECH: Pause, Eis oder kaltes Bachwasser, Compression mit elastischer Binde, Hochlagern. Bei Verdacht auf Bruch das Gelenk mit Ästen und Kleidung ruhigstellen und nicht belasten. Ein Bein, auf das man nicht auftreten kann, ist ein Fall für die 112, nicht für Zusammenbeißen.'],
        ['Verbrennung', 'Sofort mit lauwarmem Wasser kühlen, zehn Minuten, nicht eiskalt. Keine Hausmittel wie Butter oder Zahnpasta. Blasen nicht öffnen, locker steril abdecken. Größer als die Handfläche oder im Gesicht: Arzt.'],
        ['Kleine Plagen', 'Blasen vorbeugen: Socken trocken halten, Tape auf gefährdete Stellen, bevor es brennt. Insektenstiche kühlen. Atemnot, Schwellung im Gesicht oder Kreislaufprobleme nach einem Stich sind ein Notfall. Wespen am Essen: Getränke abdecken, nicht aus der Dose trinken.'],
        ['Die Apotheke im Rucksack', 'Pflaster, sterile Kompressen, elastische Binde, Verbandpäckchen, Tape, Zeckenkarte, Pinzette, Rettungsdecke, Einmalhandschuhe, Desinfektion, Blasenpflaster, deine eigenen Medikamente. Einmal im Jahr durchsehen, Abgelaufenes ersetzen. Kleiner Zettel mit Blutgruppe und Medikamenten dazu.']],
      quiz: [
        ['Jemand ist bewusstlos und atmet. Was tust du?', ['Herzdruckmassage', 'Stabile Seitenlage und 112', 'Wasser ins Gesicht'], 1, 'Wer atmet, braucht die Seitenlage, damit er nicht erstickt. Wer nicht atmet, braucht Herzdruckmassage.'],
        ['Wie schnell drückst du bei der Herzdruckmassage?', ['60 Mal pro Minute', '100 bis 120 Mal pro Minute', 'So schnell wie möglich'], 1, 'Das Tempo eines schnellen Marschlieds. Fünf bis sechs Zentimeter tief.'],
        ['Wie entfernst du eine Zecke?', ['Mit Öl ersticken', 'Hautnah fassen und langsam gerade ziehen', 'Mit dem Feuerzeug'], 1, 'Öl und Hitze lassen die Zecke erbrechen, das erhöht das Risiko.'],
        ['Was ist bei Unterkühlung das Warnzeichen?', ['Starkes Zittern', 'Das Zittern hört auf und er wird verwirrt', 'Rote Wangen'], 1, 'Zittern ist Abwehr. Hört es auf, ist der Körper am Ende seiner Kraft.'],
        ['Wie kühlst du eine Verbrennung?', ['Eiskalt, so lange wie möglich', 'Lauwarm, etwa zehn Minuten', 'Gar nicht, Butter drauf'], 1, 'Eiskalt schadet dem Gewebe, Hausmittel gehören nicht auf Wunden.'],
        ['Wann legst du ein Abbindeband an?', ['Bei jeder Blutung', 'Nur bei lebensbedrohlicher Blutung an Arm oder Bein', 'Bei Nasenbluten'], 1, 'Es ist das letzte Mittel. Uhrzeit notieren, nicht wieder lösen.']],
      tasks: [
        ['Kurs auffrischen', 'Einen Erste-Hilfe-Kurs besuchen oder auffrischen, wenn der letzte länger als drei Jahre her ist.'],
        ['Druckverband', 'Mit Claudia oder den Kindern einen Druckverband am Unterarm üben, in unter zwei Minuten.'],
        ['Rucksack-Apotheke', 'Deine Apotheke zusammenstellen und prüfen. Liste aus der Karte abhaken.'],
        ['Rettungspunkt', 'Bei den nächsten drei Waldgängen jeweils den nächsten Rettungspunkt finden und fotografieren.']] },
    { r: 'ᛃ', n: 'Nahrung aus dem Wald', rn: 'Jera, die Ernte', entwurf: true,
      cards: [
        ['Essen ist zweitrangig', 'Die Dreier-Regel: drei Minuten ohne Luft, drei Stunden ohne Schutz bei Kälte, drei Tage ohne Wasser, drei Wochen ohne Essen. Hunger ist unangenehm, aber nicht gefährlich. Gefährlich ist, aus Hunger etwas Falsches zu essen. Im Zweifel: nicht essen.'],
        ['Was in Baden-Württemberg sicher geht', 'Brennnessel: junge Blätter, gekocht oder gerollt, da sticht nichts mehr. Löwenzahn: Blätter und Blüten. Giersch: Blätter, dreikantiger Stiel, Dreier-Blatt. Brombeere, Himbeere, Walderdbeere. Haselnuss. Hagebutte: Fruchtfleisch, Kerne mit den Härchen raus. Das sind Pflanzen, die du nicht verwechseln kannst, wenn du sie einmal richtig kennst.'],
        ['Mit Vorsicht', 'Holunderbeeren nur gekocht, roh verursachen sie Übelkeit. Bucheckern nur geröstet und in kleinen Mengen. Eicheln sind essbar, aber erst nach tagelangem Wässern gegen die Gerbstoffe. Schlehen erst nach dem ersten Frost. Das ist Arbeit, kein Notfall-Essen.'],
        ['Fuchsbandwurm', 'In Baden-Württemberg kommt der Fuchsbandwurm vor. Die Eier kleben an bodennahen Beeren und Blättern. Das Risiko ist klein, die Krankheit schwer. Darum: alles, was unter Kniehöhe wächst, waschen und am besten erhitzen. Über 60 Grad tötet die Eier, Einfrieren im Haushaltsgefrierfach nicht.'],
        ['Tödliche Verwechslungen', 'Bärlauch gegen Maiglöckchen und Herbstzeitlose: Nur Bärlauch riecht nach Knoblauch, und jedes Blatt hat seinen eigenen Stiel. Doldenblütler wie Wiesenkerbel gegen Schierling und Wasserschierling: Für Anfänger gilt, keine Doldenblütler sammeln. Eibe und Tollkirsche: komplett meiden. Rote Beeren im Wald sind nichts für Kinderhände.'],
        ['Pilze', 'Nie einen Pilz essen, den nicht ein Fachkundiger in der Hand hatte. Der Grüne Knollenblätterpilz sieht einem jungen Champignon ähnlich und tötet mit einem einzigen Exemplar, und zwar erst nach einem Tag, wenn man denkt, es war nichts. Pilzsachverständige beraten oft kostenlos. Das ist die Aufgabe dieser Stufe, nicht das Sammeln.'],
        ['Was erlaubt ist', 'Kleine Mengen Beeren, Kräuter, Nüsse und Pilze für den eigenen Bedarf darfst du im Wald sammeln, die sogenannte Handstraußregel. Nicht in Naturschutzgebieten, nicht in Schonungen, nichts ausreißen. Angeln braucht in Baden-Württemberg den Fischereischein plus Erlaubnis für das Gewässer. Jagen und Fallenstellen sind ohne Jagdschein verboten. Das ist kein Survival-Thema, sondern Strafrecht.'],
        ['Kochen am Feuer', 'Am besten über Glut, nicht über Flammen. Brennnesselsuppe: Zwiebel oder Giersch anbraten, Wasser drauf, Brennnesseln rein, zehn Minuten köcheln, salzen. Stockbrot aus Mehl, Wasser, Salz und einem Löffel Öl, dünn um einen entrindeten Haselstock gewickelt. Die Kinder lieben das.'],
        ['Die Probe', 'Wenn du dir bei einer Pflanze ganz sicher bist und sie trotzdem zum ersten Mal isst: erst ein kleines Stück, dann einige Stunden warten. Nie mehrere neue Pflanzen am selben Tag. Was bitter oder seifig schmeckt, ausspucken. Das ist keine Methode, um Unbekanntes zu testen, nur eine Vorsicht bei Bekanntem.']],
      quiz: [
        ['Wie lange hält ein Mensch ungefähr ohne Essen durch?', ['Drei Tage', 'Drei Wochen', 'Drei Monate'], 1, 'Die Dreier-Regel. Wasser und Wärme sind viel dringender als Essen.'],
        ['Woran erkennst du Bärlauch sicher?', ['Am weißen Blütenstand', 'Am Knoblauchgeruch und einem Stiel pro Blatt', 'Am Standort im Wald'], 1, 'Maiglöckchen und Herbstzeitlose riechen nicht nach Knoblauch. Beide sind giftig.'],
        ['Wie schützt du dich vor dem Fuchsbandwurm?', ['Beeren einfrieren', 'Bodennahes waschen und erhitzen', 'Nur rote Beeren essen'], 1, 'Erhitzen über 60 Grad tötet die Eier, Einfrieren im Gefrierfach nicht.'],
        ['Wer darf dir sagen, ob ein Pilz essbar ist?', ['Eine App', 'Ein Pilzsachverständiger mit dem Pilz in der Hand', 'Das Internet'], 1, 'Ein Knollenblätterpilz reicht. Nie ohne Fachkundigen essen.'],
        ['Wie isst du Holunderbeeren?', ['Roh vom Strauch', 'Nur gekocht', 'Gar nicht, giftig'], 1, 'Roh verursachen sie Übelkeit, gekocht sind sie als Saft oder Mus gut.'],
        ['Was brauchst du zum Angeln in Baden-Württemberg?', ['Nichts, Natur gehört allen', 'Fischereischein und Erlaubnis für das Gewässer', 'Nur eine Angel'], 1, 'Ohne beides ist es Fischwilderei.']],
      tasks: [
        ['Fünf Pflanzen', 'Brennnessel, Löwenzahn, Giersch, Brombeere und Haselnuss im Gelände sicher zeigen und einen Verwechslungspartner nennen.'],
        ['Brennnesselsuppe', 'Brennnesseln sammeln, waschen, am Feuer eine Suppe kochen. Mit der Familie essen.'],
        ['Pilzberatung', 'Eine Pilzberatungsstelle in deiner Nähe heraussuchen und mit einem Korb hingehen. Nichts davon vorher essen.'],
        ['Stockbrot', 'Mit Liam und Raik Stockbrot über der Glut backen. Teig selbst gemacht.']] }];

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
