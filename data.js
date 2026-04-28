// ============================================================
// Lerninhalte – kuratiert auf Liams (Landwirtschaft) & Raiks (Sonic/Mario) Interessen
// ============================================================

const MACHINES = [
  {id:'fendt312',name:'Fendt 312 Vario',icon:'🚜',img:'img/machines/fendt312.jpg',price:5,
   typ:'Standardschlepper',hersteller:'Fendt (Marktoberdorf, DE)',ps:124,baujahr:'seit 2014',
   beschreibung:'Mittlerer Schlepper für viele Aufgaben am Hof. Stufenloses Vario-Getriebe – Geschwindigkeit lässt sich ohne Schalten anpassen.',
   einsatz:'Heuwenden, Düngerstreuen, Anhänger ziehen, Frontlader-Arbeit.',
   funfact:'Der Vario heißt so, weil er stufenlos schaltet – wie ein Roller mit CVT-Getriebe.'},
  {id:'jd6r',name:'John Deere 6R 250',icon:'🚜',img:'img/machines/jd6r.jpg',price:10,
   typ:'Universal-Schlepper',hersteller:'John Deere (USA, Werk in Mannheim)',ps:250,baujahr:'seit 2022',
   beschreibung:'Beliebter Allrounder in grün-gelb. CommandPRO-Joystick statt Lenkrad-Hebeln.',
   einsatz:'Pflug ziehen, Säen, Pressen, Stallarbeit. Auf vielen deutschen Höfen Standard.',
   funfact:'In Mannheim werden John Deere Traktoren für ganz Europa gebaut – seit 1956.'},
  {id:'fendt724',name:'Fendt 724 Vario',icon:'🚜',img:'img/machines/fendt724.jpg',price:20,
   typ:'Großer Standardschlepper',hersteller:'Fendt (Marktoberdorf, DE)',ps:246,baujahr:'seit 2018',
   beschreibung:'Der meistverkaufte Fendt überhaupt. Berühmt für Sparsamkeit beim Diesel.',
   einsatz:'Schwere Bodenbearbeitung, Saatbett, Mähdreschen-Anhänger ziehen.',
   funfact:'Fendt ist die teuerste Schlepper-Marke – aber Bauern kaufen sie weil sie 20 Jahre halten.'},
  {id:'claas_axion',name:'Claas Axion 870',icon:'🚜',img:'img/machines/claas_axion.jpg',price:30,
   typ:'Großschlepper',hersteller:'Claas (Harsewinkel, DE)',ps:295,baujahr:'seit 2019',
   beschreibung:'Stark und sparsam, mit C-Matic stufenlosem Getriebe. Großer Tank für lange Arbeitstage.',
   einsatz:'Pflug 5-6 Schar, Grubber, schwere Anhänger, Häcksler-Transport.',
   funfact:'Claas wurde 1913 als Strohbinder-Firma gegründet – heute Welt-Nummer-1 bei Mähdreschern.'},
  {id:'mb_trac',name:'MB-trac 1500',icon:'🚜',img:'img/machines/mb_trac.jpg',price:40,
   typ:'System-Schlepper (Klassiker)',hersteller:'Mercedes-Benz (Gaggenau, DE)',ps:150,baujahr:'1980-1991',
   beschreibung:'Legendärer Schlepper mit vier gleich großen Rädern und Kabine in der Mitte. Vorne UND hinten Anbau möglich.',
   einsatz:'Mähen mit Front-Mähwerk + Heck-Wender gleichzeitig, Kommunalarbeit, Forst.',
   funfact:'MB-trac war seiner Zeit weit voraus – heute Sammlerstück, gebraucht teurer als damals neu!'},
  {id:'fendt1050',name:'Fendt 1050 Vario',icon:'🚜',img:'img/machines/fendt1050.jpg',price:60,
   typ:'Großtraktor (King of Tractors)',hersteller:'Fendt (Marktoberdorf, DE)',ps:517,baujahr:'seit 2015',
   beschreibung:'Größter Standard-Traktor der Welt. 13,5 Tonnen Gewicht, 60 km/h schnell.',
   einsatz:'Großbetriebe, Lohnunternehmer. Zieht 12-Schar-Pflug, riesige Grubber, schwere Häcksler-Wagen.',
   funfact:'Mit 517 PS hat er mehr Leistung als ein Porsche 911 GT3!'},
  {id:'jd8r',name:'John Deere 8R 410',icon:'🚜',img:'img/machines/jd8r.jpg',price:80,
   typ:'Großschlepper mit Raupen',hersteller:'John Deere (USA, Waterloo)',ps:410,baujahr:'seit 2020',
   beschreibung:'Statt Reifen hat er Gummi-Raupen wie ein Bagger. Drückt den Boden weniger fest – Wurzeln können besser wachsen.',
   einsatz:'Schwere Bodenbearbeitung auf empfindlichem Boden, große Säkombinationen.',
   funfact:'Die Raupen sind aus Gummi mit Stahl-Einlage – halten ca. 4000 Stunden.'},
  {id:'lexion',name:'Claas Lexion 8900',icon:'🌾',img:'img/machines/lexion.jpg',price:100,
   typ:'Mähdrescher Topmodell',hersteller:'Claas (Harsewinkel, DE)',ps:790,baujahr:'seit 2020',
   beschreibung:'Größter Mähdrescher Europas. Schneidwerk bis 13,80 m Breite, Korntank 18.000 Liter.',
   einsatz:'Weizen, Gerste, Roggen, Raps, Mais ernten. Drischt 60-70 Tonnen Korn pro Stunde.',
   funfact:'Ein Lexion 8900 kostet über 600.000 Euro – mehr als ein Einfamilienhaus.'},
  {id:'kronebigx',name:'Krone Big X 1180',icon:'🌽',img:'img/machines/kronebigx.jpg',price:130,
   typ:'Selbstfahrender Häcksler',hersteller:'Krone (Spelle, DE)',ps:1156,baujahr:'seit 2018',
   beschreibung:'Stärkster Häcksler der Welt mit 1156 PS. Häckselt Mais, Gras und Ganzpflanzensilage.',
   einsatz:'Maishäckseln für Biogasanlagen und Kuhfutter. Schafft 400 Tonnen Mais pro Stunde.',
   funfact:'Der Big X verbraucht bis zu 200 Liter Diesel pro Stunde – ein Auto fährt damit 4000 km.'},
  {id:'jcb_fastrac',name:'JCB Fastrac 8330',icon:'🚜',img:'img/machines/jcb_fastrac.jpg',price:160,
   typ:'Schneller Großschlepper',hersteller:'JCB (Großbritannien)',ps:348,baujahr:'seit 2014',
   beschreibung:'Schnellster Serien-Traktor: 70 km/h. Mit Vollfederung wie ein LKW – läuft auch auf Straße ruhig.',
   einsatz:'Lohnunternehmer mit langen Wegen, Güllefässer transportieren, Heuballen-Logistik.',
   funfact:'Ein modifizierter JCB Fastrac fuhr 2019 Weltrekord: 247,8 km/h schneller Traktor.'},
  {id:'cat_d11',name:'Caterpillar D11',icon:'🚧',img:'img/machines/cat_d11.jpg',price:200,
   typ:'Riesen-Planierraupe',hersteller:'Caterpillar (USA)',ps:850,baujahr:'seit 2008',
   beschreibung:'104 Tonnen schwer, 8,69 m lang. Schiebt mit Riesenschild Erde, Steine, Schutt.',
   einsatz:'Steinbruch, Tagebau, Großbaustellen. Jahresleistung: kann ganze Hügel abtragen.',
   funfact:'Ein D11 kostet über 3 Millionen Euro – und braucht alle 100 Stunden 800 Liter Motoröl.'},
  {id:'jd_x9',name:'John Deere X9 1100',icon:'🌾',img:'img/machines/jd_x9.jpg',price:250,
   typ:'Mähdrescher Top-Klasse',hersteller:'John Deere (USA)',ps:690,baujahr:'seit 2020',
   beschreibung:'Drischt mit zwei Rotoren parallel – schneller und korn-schonender als Single-Rotor.',
   einsatz:'Großbetriebe USA/Europa. Schafft auf gutem Weizen über 100 t Korn pro Stunde.',
   funfact:'Im X9 läuft KI-Software die selbst die Drusch-Einstellungen optimiert.'}
];

const CHARS = [
  {id:'mario',name:'Mario',icon:'🍄',img:'img/chars/mario.png',color:'#e53935',price:5,move:'jump',sound:'wahoo',
   sayings:['Hier kommt Mario!','Mamma mia!','Wahoo!','Lets-a go!']},
  {id:'luigi',name:'Luigi',icon:'🟢',img:'img/chars/luigi.png',color:'#43a047',price:10,move:'tallJump',sound:'oh-yeah',
   sayings:['Luigi-Time!','Yeah!','Oki Doki!']},
  {id:'sonic',name:'Sonic',icon:'💨',img:'img/chars/sonic.png',color:'#1976d2',price:20,move:'dash',sound:'whoosh',
   sayings:['Gotta go fast!','Yeah baby!','Im outta here!']},
  {id:'tails',name:'Tails',icon:'🦊',img:'img/chars/tails.png',color:'#fb8c00',price:30,move:'fly',sound:'spin',
   sayings:['Lets fly!','Im on it!','Spinnen los!']},
  {id:'yoshi',name:'Yoshi',icon:'🦖',img:'img/chars/yoshi.png',color:'#7cb342',price:40,move:'tongue',sound:'yoshi',
   sayings:['Yoshi!','Yoshi Yoshi!','Hap!']},
  {id:'knuckles',name:'Knuckles',icon:'👊',img:'img/chars/knuckles.png',color:'#d84315',price:60,move:'punch',sound:'pow',
   sayings:['Knuckles!','Hau drauf!','Bumm!']},
  {id:'peach',name:'Peach',icon:'👑',img:'img/chars/peach.png',color:'#ec407a',price:80,move:'float',sound:'shiny',
   sayings:['Sweet!','Hi everyone!','Bye bye!']},
  {id:'shadow',name:'Shadow',icon:'⚡',img:'img/chars/shadow.png',color:'#212121',price:100,move:'teleport',sound:'zap',
   sayings:['Chaos Control!','Hmpf.','Du verlierst!']},
  {id:'bowser',name:'Bowser',icon:'🐢',img:'img/chars/bowser.png',color:'#6d4c41',price:130,move:'roar',sound:'roar',
   sayings:['Grrrwaaah!','Bowser regiert!','Du gehst unter!']},
  {id:'eggman',name:'Dr. Eggman',icon:'🥚',img:'img/chars/eggman.png',color:'#f57f17',price:160,move:'spin',sound:'evil-laugh',
   sayings:['Hihihi!','Eggman ist da!','Genie!']},
  {id:'rosalina',name:'Rosalina',icon:'⭐',img:'img/chars/rosalina.png',color:'#7b1fa2',price:200,move:'spin-star',sound:'sparkle',
   sayings:['Hallo Sternchen!','Lumalee Lumalo!']},
  {id:'superstar',name:'Superstar',icon:'🌟',color:'#fbc02d',price:250,move:'rainbow',sound:'fanfare',
   sayings:['SUPERSTAR!','Du bist EIN HELD!','GEWONNEN!']},
  // ===== Ninjago-Welt =====
  {id:'kai',name:'Kai (Feuer)',icon:'🔥',img:'img/chars/ninja_group.jpg',color:'#e53935',price:35,move:'roar',sound:'fire-whoosh',
   sayings:['Ninja-Go!','Feuer frei!','Kai ist heiss!','Lass mich ran!']},
  {id:'jay',name:'Jay (Blitz)',icon:'⚡',img:'img/chars/ninja_group.jpg',color:'#1976d2',price:45,move:'teleport',sound:'thunder',
   sayings:['BZZZT!','Blitzschnell!','Jay-Style!','Voll geladen!']},
  {id:'cole',name:'Cole (Erde)',icon:'🪨',img:'img/chars/ninja_group.jpg',color:'#5d4037',price:55,move:'punch',sound:'earth-stomp',
   sayings:['BOOM!','Stein an Stein!','Cole rockt!','Erschuetterung!']},
  {id:'zane',name:'Zane (Eis)',icon:'❄️',img:'img/chars/ninja_group.jpg',color:'#81d4fa',price:70,move:'float',sound:'ice-crystal',
   sayings:['Eiskalt.','Zane berechnet alles.','Frost!','Mein System ist optimal.']},
  {id:'lloyd',name:'Lloyd (Energie)',icon:'🟢',img:'img/chars/lloyd.webp',color:'#43a047',price:90,move:'spin-star',sound:'energy-burst',
   sayings:['Gruener Ninja!','Lloyd kommt!','Energie raus!','Ich bin der Auserwaehlte!']},
  {id:'nya',name:'Nya (Wasser)',icon:'🌊',img:'img/chars/ninja_group.jpg',color:'#0277bd',price:110,move:'float',sound:'water-splash',
   sayings:['Wasser marsch!','Nya weiss wie es geht!','Spritzer!','Komm rein, das Wasser ist fein!']},
  {id:'wu',name:'Master Wu',icon:'🍵',img:'img/chars/wu.jpg',color:'#fff9c4',price:180,move:'spin',sound:'gong',
   sayings:['Geduld, junger Schueler.','Der Tee ist heiss.','Niinja!','Weisheit ist Macht.'],desc:'Sensei der Ninja. Trinkt grünen Tee, kennt alle Geheimnisse von Spinjitzu.',type:'Lehrer'},
  // ===== POKEMON 1-251 werden in pokedex.js dynamisch hinzugefügt =====
  // Removed hardcoded Pokemon - now generated from POKEDEX
  ...[].concat([
  {id:'_dummy_',name:'Pikachu',icon:'⚡',img:'img/chars/pikachu.png',color:'#fbc02d',price:25,move:'spin',sound:'thunder',
   sayings:['Pika Pika!','Pikachuuuu!','Pi-ka-chu!']},
  {id:'glumanda',name:'Glumanda',icon:'🔥',img:'img/chars/glumanda.png',color:'#ff7043',price:35,move:'roar',sound:'fire-whoosh',
   sayings:['Gluuu!','Glumanda!','Schwanzflamme an!']},
  {id:'schiggy',name:'Schiggy',icon:'💧',img:'img/chars/schiggy.png',color:'#4fc3f7',price:35,move:'spin',sound:'water-splash',
   sayings:['Schiggy!','Wasserpistole!','Bubbles!']},
  {id:'bisasam',name:'Bisasam',icon:'🌱',img:'img/chars/bisasam.png',color:'#7cb342',price:35,move:'tongue',sound:'spin',
   sayings:['Bisa!','Rankenhieb!','Bisasaaam!']},
  {id:'pummeluff',name:'Pummeluff',icon:'🎀',img:'img/chars/pummeluff.png',color:'#f8bbd0',price:45,move:'float',sound:'shiny',
   sayings:['Puuuummel!','Pummeluff!','Schlaflied!']},
  {id:'mauzi',name:'Mauzi',icon:'😼',img:'img/chars/mauzi.png',color:'#ffeb3b',price:45,move:'punch',sound:'pow',
   sayings:['Mauzi!','Krratzfuss!','Mauzi-Mauzi!']},
  {id:'evoli',name:'Evoli',icon:'🦊',img:'img/chars/evoli.png',color:'#a1887f',price:50,move:'jump',sound:'yoshi',
   sayings:['Evoliii!','Voli!','Bin so vielseitig!']},
  {id:'pichu',name:'Pichu',icon:'⚡',img:'img/chars/pichu.png',color:'#fff59d',price:50,move:'jump',sound:'zap',
   sayings:['Pi-Pi!','Pichu!','Knister!']},
  {id:'togepi',name:'Togepi',icon:'🥚',img:'img/chars/togepi.png',color:'#fff9c4',price:55,move:'float',sound:'sparkle',
   sayings:['Togepi!','Toge-toge!','Schalalaaa!']},
  {id:'karpador',name:'Karpador',icon:'🐟',img:'img/chars/karpador.png',color:'#ff7043',price:55,move:'tongue',sound:'water-splash',
   sayings:['Karp.','Karpadooor!','Platsch!']},
  {id:'onix',name:'Onix',icon:'🪨',img:'img/chars/onix.png',color:'#9e9e9e',price:65,move:'roar',sound:'earth-stomp',
   sayings:['ROOOOAAR!','Felsen-Hieb!','Onix!']},
  {id:'lapras',name:'Lapras',icon:'🌊',img:'img/chars/lapras.png',color:'#4fc3f7',price:75,move:'float',sound:'water-splash',
   sayings:['Lapraaas!','Komm reit!','Eis-Strahl!']},
  {id:'aquana',name:'Aquana',icon:'💦',img:'img/chars/aquana.png',color:'#0288d1',price:80,move:'fly',sound:'water-splash',
   sayings:['Aquaaa!','Hydro-Pumpe!']},
  {id:'flamara',name:'Flamara',icon:'🔥',img:'img/chars/flamara.png',color:'#e53935',price:80,move:'roar',sound:'fire-whoosh',
   sayings:['Flamaraaa!','Feuer-Sturm!']},
  {id:'blitza',name:'Blitza',icon:'⚡',img:'img/chars/blitza.png',color:'#ffeb3b',price:80,move:'teleport',sound:'thunder',
   sayings:['Blitzaa!','Donner!']},
  {id:'psiana',name:'Psiana',icon:'🔮',img:'img/chars/psiana.png',color:'#ce93d8',price:90,move:'spin-star',sound:'sparkle',
   sayings:['Psiaa!','Psycho-Power!']},
  {id:'nachtara',name:'Nachtara',icon:'🌙',img:'img/chars/nachtara.png',color:'#212121',price:90,move:'teleport',sound:'evil-laugh',
   sayings:['Nachtaaa!','Im Schatten!']},
  {id:'gengar',name:'Gengar',icon:'👻',img:'img/chars/gengar.png',color:'#7b1fa2',price:100,move:'teleport',sound:'evil-laugh',
   sayings:['Gengaaar!','Hihihi!','Schattenball!']},
  {id:'chaneira',name:'Chaneira',icon:'💗',img:'img/chars/chaneira.png',color:'#f8bbd0',price:100,move:'float',sound:'shiny',
   sayings:['Chaaa!','Glücks-Ei!','Heilung!']},
  {id:'glurak',name:'Glurak',icon:'🔥',img:'img/chars/glurak.png',color:'#e53935',price:120,move:'fly',sound:'roar',
   sayings:['GLUUUURAK!','Flammenwurf!','Ich bin ein Drache!']},
  {id:'turtok',name:'Turtok',icon:'🐢',img:'img/chars/turtok.png',color:'#0277bd',price:120,move:'roar',sound:'water-splash',
   sayings:['Turtoook!','Hydro-Kanone!']},
  {id:'bisaflor',name:'Bisaflor',icon:'🌳',img:'img/chars/bisaflor.png',color:'#388e3c',price:120,move:'roar',sound:'earth-stomp',
   sayings:['Bisaflooor!','Solar-Strahl!']},
  {id:'relaxo',name:'Relaxo',icon:'😴',img:'img/chars/relaxo.png',color:'#5d4037',price:130,move:'punch',sound:'earth-stomp',
   sayings:['Zzzzz...','Relaxo isst.','Schubs nicht!']},
  {id:'garados',name:'Garados',icon:'🐉',img:'img/chars/garados.png',color:'#1565c0',price:140,move:'roar',sound:'roar',
   sayings:['ROOOAAAR!','Hyperstrahl!','Du gehst unter!']},
  {id:'lucario',name:'Lucario',icon:'🥋',img:'img/chars/lucario.png',color:'#1976d2',price:160,move:'punch',sound:'thunder',
   sayings:['Aura!','Aura-Sphäre!','Lucario!']},
  {id:'quajutsu',name:'Quajutsu',icon:'🥷',img:'img/chars/quajutsu.png',color:'#01579b',price:170,move:'dash',sound:'whoosh',
   sayings:['Quaa!','Wasser-Shuriken!','Ninja-Frosch!']},
  {id:'garchomp',name:'Knakrack',icon:'🦈',img:'img/chars/garchomp.png',color:'#0277bd',price:180,move:'dash',sound:'pow',
   sayings:['ROAR!','Drachen-Klaue!']},
  {id:'zoroark',name:'Zoroark',icon:'🦊',img:'img/chars/zoroark.png',color:'#212121',price:190,move:'teleport',sound:'evil-laugh',
   sayings:['Zoroark!','Illusion!']},
  {id:'kapuhototo',name:'Mimigma',icon:'👻',img:'img/chars/kapuhototo.png',color:'#fbc02d',price:200,move:'spin',sound:'sparkle',
   sayings:['Mimi!','Geheimnis!']},
  {id:'mew',name:'Mew',icon:'💗',img:'img/chars/mew.png',color:'#f48fb1',price:220,move:'float',sound:'sparkle',
   sayings:['Mew!','Mew Mew!','Ich kann ALLE Attacken!']},
  {id:'mewtu',name:'Mewtu',icon:'🧠',img:'img/chars/mewtu.png',color:'#9c27b0',price:280,move:'spin-star',sound:'energy-burst',
   sayings:['Hmpf.','Ich bin überlegen.','Psystrahl!']},
  {id:'lugia',name:'Lugia',icon:'🌊',img:'img/chars/lugia.png',color:'#90caf9',price:320,move:'fly',sound:'gong',
   sayings:['Aero-Geschoss!','Hüter der Meere.']},
  {id:'hooh',name:'Ho-Oh',icon:'🔥',img:'img/chars/hooh.png',color:'#ff9800',price:320,move:'fly',sound:'fanfare',
   sayings:['Heiliges Feuer!','Phönix!']},
  {id:'rayquaza',name:'Rayquaza',icon:'🐲',img:'img/chars/rayquaza.png',color:'#388e3c',price:380,move:'spin',sound:'roar',
   sayings:['ROOOOAR!','Drachen-Aszension!','Wächter des Himmels!']},
  {id:'arceus',name:'Arceus',icon:'✨',img:'img/chars/arceus.png',color:'#ffd700',price:500,move:'rainbow',sound:'fanfare',
   sayings:['Schöpfer.','Alpha-Pokemon.','Tausend Welten.']}
  ].filter(c=>c.id!=='_dummy_'))
];

// Dynamisch alle 251 Pokemon aus POKEDEX hinzufügen
if (typeof POKEDEX !== 'undefined') {
  const moves = ['jump','dash','spin','roar','float','tongue','teleport','punch'];
  const sounds = ['wahoo','whoosh','spin','yoshi','shiny','pow','zap','sparkle'];
  const finalForms = new Set([3,6,9,18,20,22,24,26,28,31,34,36,38,40,42,45,47,49,51,53,55,57,59,62,65,68,71,73,76,78,80,82,85,87,89,91,93,94,103,105,107,110,112,115,121,124,125,126,127,128,130,131,134,135,136,142,143,149,154,157,160,162,164,166,168,169,171,176,178,181,184,186,188,189,192,195,196,197,205,210,212,215,217,219,221,224,227,229,230,232,233,238,239,240,242,248]);
  const legendaries = new Set([144,145,146,150,151,243,244,245,249,250,251]);
  for (const p of POKEDEX) {
    let price = 8 + Math.floor(p.n / 8) * 3;
    if (legendaries.has(p.n)) price = 200 + (p.n % 10) * 20;
    if (finalForms.has(p.n)) price += 15;
    CHARS.push({
      id: 'pkm_' + p.n,
      name: p.de,
      icon: '🔮',
      img: 'img/chars/pokemon/' + p.n + '.png',
      color: p.color || '#9e9e9e',
      price: price,
      move: moves[p.n % moves.length],
      sound: sounds[p.n % sounds.length],
      sayings: [p.de + '!', p.de + '-' + p.de + '!', (p.type || 'Pokemon') + '-Power!'],
      desc: p.desc,
      type: p.type,
      pokedexNo: p.n
    });
  }
}

// Outfits/Hintergründe die mit Münzen kaufbar sind (nach Charakter-Freischaltung)
const SHOP_ITEMS = [
  {id:'bg_castle',name:'Schloss-Hintergrund',icon:'🏰',price:30,kind:'background'},
  {id:'bg_beach',name:'Strand-Hintergrund',icon:'🏖️',price:30,kind:'background'},
  {id:'bg_space',name:'Weltraum-Hintergrund',icon:'🚀',price:50,kind:'background'},
  {id:'hat_party',name:'Party-Hut',icon:'🎉',price:15,kind:'outfit'},
  {id:'hat_crown',name:'Goldene Krone',icon:'👑',price:40,kind:'outfit'},
  {id:'hat_cap',name:'Baseball-Cap',icon:'🧢',price:15,kind:'outfit'},
  {id:'fx_fire',name:'Feuer-Effekt',icon:'🔥',price:25,kind:'effect'},
  {id:'fx_rainbow',name:'Regenbogen-Spur',icon:'🌈',price:25,kind:'effect'},
  {id:'fx_lightning',name:'Blitz-Effekt',icon:'⚡',price:25,kind:'effect'},
  // Sound-Pakete
  {id:'sp_animals',name:'Tier-Sound-Paket',icon:'🐮',price:60,kind:'sound'},
  {id:'sp_starwars',name:'Weltraum-Sounds',icon:'🚀',price:80,kind:'sound'},
  {id:'sp_ninja',name:'Ninja-Sounds',icon:'🥷',price:80,kind:'sound'}
];

// Power-Ups die WÄHREND einer Aufgabe nutzbar sind
const POWERUPS = [
  {id:'fifty',name:'50/50 Joker',icon:'⚖️',price:5,desc:'2 falsche Antworten verschwinden'},
  {id:'skip',name:'Skip',icon:'⏭️',price:3,desc:'Aufgabe überspringen'},
  {id:'double',name:'Doppel-Münzen',icon:'💰',price:4,desc:'Nächste richtige Antwort: doppelt Münzen'}
];

// ============================================================
// FÄCHER-HIERARCHIE: Top-Fach → Sub-Fächer
// ============================================================
const SUBJECTS_TREE = {
  liam: {
    deutsch: {label:'📚 Deutsch', emoji:'📚', subs: [
      {id:'lesen', label:'📖 Lesen', desc:'Texte verstehen', backend:'read'},
      {id:'rechtschreibung', label:'✏️ Rechtschreibung', desc:'-ck/-tz, ß, Doppellaute'},
      {id:'wortarten', label:'🔤 Wortarten', desc:'Nomen, Verb, Adjektiv'},
      {id:'wortschatz', label:'🎯 Wortschatz', desc:'Synonyme, Gegenteile'},
      {id:'lueckentext', label:'🧩 Lückentext', desc:'Wörter einsetzen'},
      {id:'schreiben', label:'✍️ Schreiben', desc:'Wörter nachfahren', special:'trace'}
    ]},
    mathe: {label:'➕ Mathe', emoji:'➕', subs: [
      {id:'plus_minus', label:'➕ Plus & Minus', desc:'bis 1000', backend:'math'},
      {id:'mal_geteilt', label:'✖️ Mal & Geteilt', desc:'1×1, schriftlich'},
      {id:'zahlenraum', label:'🔢 Zahlenraum', desc:'Vorgänger, Nachfolger, Stellenwert'},
      {id:'sachaufgabe', label:'📊 Sachaufgaben', desc:'2-Schritt-Probleme'},
      {id:'zahlenmuster', label:'🧮 Zahlenmuster', desc:'Reihen weiterführen'},
      {id:'geometrie', label:'📐 Geometrie', desc:'Formen, Symmetrie'}
    ]},
    sach: {label:'🌍 Sachkunde', emoji:'🌍', subs: [
      {id:'allgemein', label:'🌾 Allgemein', desc:'Hof, Tiere, Natur', backend:'sach'},
      {id:'werkzeug', label:'🔧 Werkzeug', desc:'Hammer, Säge, Wasserwaage', special:'tools'},
      {id:'hofprobleme', label:'🚜 Hof-Probleme', desc:'Was tun wenn?', special:'hofproblems'},
      {id:'maschinendiary', label:'📔 Maschinen-Tagebuch', desc:'Lesen + Frage zur Maschine', special:'machinediary'}
    ]},
    musik: {label:'🎵 Musik', emoji:'🎵', subs: [
      {id:'allgemein', label:'🎼 Noten & Instrumente', desc:'Allgemein', backend:'musik'}
    ]},
    extra: {label:'🧠 Knobeln', emoji:'🧠', subs: [
      {id:'konzentration', label:'🃏 Memory', desc:'Karten umdrehen', special:'memory'},
      {id:'zeit', label:'⏰ Zeit', desc:'Uhr lesen', special:'clock'},
      {id:'geld', label:'💰 Geld', desc:'Münzen & Cent', special:'money'},
      {id:'logik', label:'🧩 Logik', desc:'Was passt nicht?', special:'odd'}
    ]}
  },
  raik: {
    deutsch: {label:'📚 Deutsch', emoji:'📚', subs: [
      {id:'lesen', label:'📖 Silben & Sätze', desc:'Mario/Sonic/Ninjago', backend:'read'},
      {id:'rechtschreibung', label:'✏️ Rechtschreibung', desc:'a/A, au/ei/ie'},
      {id:'wortschatz', label:'🎯 Wörter', desc:'Bild → Wort'},
      {id:'schreiben', label:'✍️ Schreiben', desc:'Buchstaben nachfahren', special:'trace'}
    ]},
    mathe: {label:'➕ Mathe', emoji:'➕', subs: [
      {id:'plus_minus', label:'➕ Plus & Minus', desc:'bis 20', backend:'math'},
      {id:'zahlenraum', label:'🔢 Zahlenraum', desc:'Nachbarn, Nachfolger'},
      {id:'sachaufgabe', label:'📊 Sachaufgaben', desc:'1 Schritt'},
      {id:'geometrie', label:'📐 Formen', desc:'Kreis, Quadrat, Dreieck'}
    ]},
    sach: {label:'🌍 Sachkunde', emoji:'🌍', subs: [
      {id:'allgemein', label:'🦁 Tiere & Natur', desc:'Bauernhof, Wald, Wasser', backend:'sach'}
    ]},
    musik: {label:'🎵 Musik', emoji:'🎵', subs: [
      {id:'allgemein', label:'🥁 Instrumente & Töne', desc:'Allgemein', backend:'musik'}
    ]},
    extra: {label:'🧠 Knobeln', emoji:'🧠', subs: [
      {id:'konzentration', label:'🃏 Memory', desc:'Karten merken (ADHS-Training!)', special:'memory'},
      {id:'wahrnehmung', label:'👀 Suchen', desc:'Was ist anders?', special:'spot'},
      {id:'zeit', label:'⏰ Uhr lernen', desc:'Volle und halbe Stunde', special:'clock'},
      {id:'geld', label:'💰 Geld', desc:'Münzen zählen', special:'money'},
      {id:'logik', label:'🧩 Logik', desc:'Was passt nicht?', special:'odd'},
      {id:'fokus', label:'🎯 Fokus-Spiel', desc:'Tippe nur grüne Punkte', special:'focus'}
    ]}
  }
};

// ============================================================
// ZUSÄTZLICHE KURATIERTE AUFGABEN-POOLS pro Sub-Fach
// ============================================================

// --- LIAM Mathe Sub-Pools ---
const LIAM_MAL_GETEILT = [
  {q:"7 × 8 = ?",a:56},{q:"6 × 9 = ?",a:54},{q:"4 × 12 = ?",a:48},
  {q:"63 : 9 = ?",a:7},{q:"81 : 9 = ?",a:9},{q:"144 : 12 = ?",a:12},
  {q:"15 × 6 = ?",a:90},{q:"25 × 4 = ?",a:100},{q:"100 : 4 = ?",a:25},
  {q:"Auf 5 Höfen wohnen je 8 Kühe. Wie viele insgesamt?",a:40},
  {q:"144 Eier in 12er-Schachteln. Wie viele Schachteln?",a:12},
  {q:"6 × 12 = ?",a:72},{q:"96 : 8 = ?",a:12},{q:"7 × 9 = ?",a:63},
  {q:"8 × 8 = ?",a:64},{q:"9 × 9 = ?",a:81},{q:"108 : 12 = ?",a:9},
  {q:"3 Bauern teilen 24 Strohballen gleich. Jeder bekommt?",a:8}
];
const LIAM_ZAHLENRAUM = [
  {q:"Was ist der Vorgänger von 700?",a:699},
  {q:"Was ist der Nachfolger von 999?",a:1000},
  {q:"Welche Hunderter-Zahl liegt zwischen 450 und 550?",a:500},
  {q:"Schreibe als Zahl: 4 Hunderter, 3 Zehner, 7 Einer.",a:437},
  {q:"Wie viele Zehner hat 580?",a:58},
  {q:"Runde 367 auf den nächsten Zehner.",a:370},
  {q:"Runde 234 auf den nächsten Hunderter.",a:200},
  {q:"Verdopple 145.",a:290},
  {q:"Halbiere 480.",a:240},
  {q:"Was ist die größte 3-stellige Zahl?",a:999}
];
const LIAM_ZAHLENMUSTER = [
  {q:"Welche Zahl folgt? 5, 10, 15, 20, ?",a:25},
  {q:"Welche Zahl folgt? 100, 90, 80, 70, ?",a:60},
  {q:"Welche Zahl folgt? 3, 6, 9, 12, ?",a:15},
  {q:"Welche Zahl folgt? 2, 4, 8, 16, ?",a:32},
  {q:"Welche Zahl folgt? 100, 95, 90, 85, ?",a:80},
  {q:"Welche Zahl folgt? 7, 14, 21, 28, ?",a:35}
];

// --- LIAM Deutsch Sub-Pools ---
const LIAM_RECHTSCHREIBUNG = [
  {q:"Welches Wort ist richtig?",options:["Ferner","Verner","Vehrner","Ferrner"],correct:0},
  {q:"-ck oder -k? Pa___",options:["ck","k","kk","gk"],correct:0},
  {q:"-tz oder -z? Spi___e",options:["tz","z","ts","zz"],correct:0},
  {q:"Welche Schreibung ist richtig?",options:["Strase","Straße","Strasse","Strate"],correct:1},
  {q:"Wann schreibt man groß?",options:["Verben","Adjektive","Nomen/Substantive","Pronomen"],correct:2},
  {q:"Wie viele f in 'Schiff'?",options:["1","2","3","keins"],correct:1},
  {q:"Welches Wort ist richtig?",options:["Ferd","Pferd","Pfärd","Pferdt"],correct:1},
  {q:"-ie oder -i? S___ben",options:["ie","i","ii","y"],correct:0},
  {q:"Welche Schreibung?",options:["Tracktor","Traktor","Trraktor","Trackdor"],correct:1},
  {q:"groß oder klein? 'Auf dem ___ steht der Trecker.'",options:["Hof","hof","HOF","höf"],correct:0}
];
const LIAM_WORTARTEN = [
  {q:"Welches ist ein NOMEN?",options:["laufen","Trecker","schnell","gross"],correct:1},
  {q:"Welches ist ein VERB?",options:["Hof","schwer","melken","grün"],correct:2},
  {q:"Welches ist ein ADJEKTIV?",options:["Pferd","reiten","schnell","Stall"],correct:2},
  {q:"Was ist 'Mähdrescher'?",options:["Verb","Nomen","Adjektiv","Pronomen"],correct:1},
  {q:"Was ist 'pflügen'?",options:["Verb","Nomen","Adjektiv","Artikel"],correct:0},
  {q:"Was ist 'rot'?",options:["Verb","Nomen","Adjektiv","Pronomen"],correct:2},
  {q:"Welcher Artikel passt? ___ Trecker",options:["der","die","das","dem"],correct:0},
  {q:"Welcher Artikel passt? ___ Kuh",options:["der","die","das","den"],correct:1},
  {q:"Welcher Artikel passt? ___ Pferd",options:["der","die","das","den"],correct:2}
];
const LIAM_WORTSCHATZ = [
  {q:"Was ist das Gegenteil von 'gross'?",options:["dick","klein","weit","laut"],correct:1},
  {q:"Was ist das Gegenteil von 'schnell'?",options:["langsam","müde","schwer","weich"],correct:0},
  {q:"Synonym für 'rennen'?",options:["sitzen","laufen","schlafen","essen"],correct:1},
  {q:"Synonym für 'müde'?",options:["wach","erschöpft","fröhlich","stark"],correct:1},
  {q:"Was bedeutet 'Ernte'?",options:["Aussäen","Pflügen","Einsammeln","Pflanzen"],correct:2},
  {q:"Was ist ein 'Stall'?",options:["Eine Wiese","Ein Haus für Tiere","Ein Feld","Ein Bach"],correct:1},
  {q:"Was bedeutet 'Silage'?",options:["Holzlager","Futterkonserve","Milchkanne","Heuhaufen"],correct:1},
  {q:"Synonym für 'gross'?",options:["riesig","klein","leise","kalt"],correct:0}
];
const LIAM_LUECKENTEXT = [
  {q:"Der ___ pflügt das Feld.",options:["Trecker","Kuh","Hahn","Eimer"],correct:0},
  {q:"Auf dem Hof leben viele ___.",options:["Autos","Tiere","Bücher","Häuser"],correct:1},
  {q:"Der Mähdrescher ___ das Korn.",options:["frisst","drischt","trinkt","singt"],correct:1},
  {q:"Im Frühling wird ___.",options:["geerntet","gesät","gebremst","geföhnt"],correct:1},
  {q:"Die Kuh gibt uns ___.",options:["Eier","Wolle","Milch","Honig"],correct:2},
  {q:"Im Winter steht das Vieh im ___.",options:["Wald","Stall","Bach","Feld"],correct:1}
];

// --- LIAM Geometrie ---
const LIAM_GEOMETRIE = [
  {q:"Wie viele Ecken hat ein Quadrat?",options:["3","4","5","6"],correct:1},
  {q:"Wie viele Ecken hat ein Dreieck?",options:["2","3","4","5"],correct:1},
  {q:"Wie viele gleiche Seiten hat ein Quadrat?",options:["2","3","4","alle"],correct:3},
  {q:"Welche Form hat ein Rad?",options:["Quadrat","Kreis","Dreieck","Stern"],correct:1},
  {q:"Wie viele Flächen hat ein Würfel?",options:["4","6","8","12"],correct:1},
  {q:"Wie viele Kanten hat ein Würfel?",options:["6","8","12","16"],correct:2},
  {q:"Was ist symmetrisch?",options:["Schmetterling","Wolke","Stein","Blatt zerrissen"],correct:0}
];

// --- RAIK Mathe Sub-Pools ---
const RAIK_ZAHLENRAUM = [
  {q:"Vorgänger von 7?",a:6},{q:"Nachfolger von 9?",a:10},
  {q:"Vorgänger von 15?",a:14},{q:"Nachfolger von 19?",a:20},
  {q:"Welche Zahl liegt zwischen 4 und 6?",a:5},
  {q:"Welche Zahl liegt zwischen 12 und 14?",a:13},
  {q:"Verdopple 4.",a:8},{q:"Verdopple 7.",a:14},
  {q:"Halbiere 10.",a:5},{q:"Halbiere 16.",a:8}
];
const RAIK_SACHAUFGABE = [
  {q:"Mario sammelt 5 Münzen, dann 4 mehr.",a:9},
  {q:"Sonic verliert 3 von 10 Ringen.",a:7},
  {q:"Yoshi frisst 2 Kirschen, dann 6 mehr.",a:8},
  {q:"Kai zündet 4 Feuer, 2 erlöschen.",a:2},
  {q:"Lloyd findet 7 Energiekugeln, gibt 2 ab.",a:5},
  {q:"Bowser hat 9 Bomben, wirft 4.",a:5},
  {q:"Tails sammelt 6 Edelsteine, findet 5 mehr.",a:11}
];
const RAIK_GEOMETRIE = [
  {q:"Wie heißt diese Form? ⬛",options:["Kreis","Quadrat","Dreieck","Stern"],correct:1},
  {q:"Wie heißt diese Form? ⚫",options:["Quadrat","Dreieck","Kreis","Stern"],correct:2},
  {q:"Wie heißt diese Form? 🔺",options:["Kreis","Quadrat","Dreieck","Pfeil"],correct:2},
  {q:"Wie heißt diese Form? ⭐",options:["Stern","Mond","Sonne","Herz"],correct:0},
  {q:"Wie viele Ecken hat ein Quadrat?",options:["3","4","5","viele"],correct:1},
  {q:"Wie viele Ecken hat ein Dreieck?",options:["2","3","4","5"],correct:1}
];

// --- RAIK Deutsch Sub-Pools ---
const RAIK_RECHTSCHREIBUNG = [
  {q:"Wie schreibt man? Mein A___to.",options:["u","au","oh","ou"],correct:1,img:"🚗"},
  {q:"Wie schreibt man? Das B___t.",options:["o","oo","oh","oot"],correct:1,img:"⛵"},
  {q:"Wie schreibt man? Die K___tze.",options:["a","ah","aa","ä"],correct:0,img:"🐱"},
  {q:"Was schreibt man groß?",options:["mama","kuh","Mario","alles"],correct:2},
  {q:"Welcher Anfangsbuchstabe? __ans (Hund-Name)",options:["h","H","B","K"],correct:1},
  {q:"Wie endet das Wort? Die Son___.",options:["ne","na","nu","ni"],correct:0,img:"☀️"},
  {q:"ie oder i? Das Sp___l.",options:["i","ie","ii","y"],correct:1}
];
const RAIK_WORTSCHATZ = [
  {q:"Welches Wort gehört zu diesem Bild? 🍎",options:["Auto","Apfel","Hut","Schere"],correct:1,img:"🍎"},
  {q:"Welches Wort gehört zu diesem Bild? 🐶",options:["Katze","Pferd","Hund","Kuh"],correct:2,img:"🐶"},
  {q:"Welches Wort gehört zu diesem Bild? ☀️",options:["Mond","Stern","Sonne","Wolke"],correct:2,img:"☀️"},
  {q:"Welches Wort gehört zu diesem Bild? 🍕",options:["Pasta","Pizza","Brot","Banane"],correct:1,img:"🍕"},
  {q:"Welches Wort gehört zu diesem Bild? 🚗",options:["Bus","Bagger","Auto","Boot"],correct:2,img:"🚗"},
  {q:"Welches Wort gehört zu diesem Bild? 🦁",options:["Tiger","Bär","Wolf","Löwe"],correct:3,img:"🦁"}
];

// ===== Werkzeug-Quiz (Liam) =====
const TOOLS_QUIZ = [
  {q:"Welches Werkzeug schlägt Nägel ein?",options:["Säge","Hammer","Bohrer","Zange"],correct:1,img:"🔨"},
  {q:"Womit dreht man eine Schraube ein?",options:["Hammer","Schraubenzieher","Bohrer","Hobel"],correct:1,img:"🪛"},
  {q:"Welches Werkzeug schneidet Holz?",options:["Hammer","Säge","Zange","Pinsel"],correct:1,img:"🪚"},
  {q:"Was misst man mit einer Wasserwaage?",options:["Länge","Gewicht","Ob es waagerecht ist","Temperatur"],correct:2},
  {q:"Was machst du mit dem Bohrer?",options:["Schrauben","Löcher bohren","Schneiden","Hämmern"],correct:1,img:"🪛"},
  {q:"Womit dreht man Muttern fest?",options:["Hammer","Säge","Schraubenschlüssel","Pinsel"],correct:2,img:"🔧"},
  {q:"Womit misst man die Länge eines Brettes?",options:["Wasserwaage","Zollstock","Pinsel","Hammer"],correct:1,img:"📏"},
  {q:"Was klemmt etwas fest?",options:["Schraubzwinge","Hammer","Pinsel","Säge"],correct:0},
  {q:"Was hält eine Schraube an Ort und Stelle?",options:["Mutter","Pflug","Reifen","Säge"],correct:0},
  {q:"Womit zeichnet man eine gerade Linie?",options:["Pinsel","Lineal","Wasserwaage","Hammer"],correct:1,img:"📐"}
];

// ===== Sammelkarten-Editionen =====
const CARD_EDITIONS = [
  {id:'standard', name:'Standard', icon:'⚪', rarity:1.00, filter:'none', glow:''},
  {id:'bronze',   name:'Bronze',   icon:'🥉', rarity:0.40, filter:'sepia(0.6) hue-rotate(-15deg) saturate(1.4)', glow:'0 0 20px #cd7f32'},
  {id:'silver',   name:'Silber',   icon:'🥈', rarity:0.25, filter:'grayscale(0.7) brightness(1.1) contrast(1.1)', glow:'0 0 20px #c0c0c0'},
  {id:'gold',     name:'Gold',     icon:'🥇', rarity:0.12, filter:'sepia(0.9) saturate(2.5) hue-rotate(-25deg) brightness(1.15)', glow:'0 0 30px #ffd700'},
  {id:'holo',     name:'Holo-Foil',icon:'🌈', rarity:0.06, filter:'hue-rotate(180deg) saturate(2)', glow:'0 0 30px #00ffff', animated:true},
  {id:'shiny',    name:'Shiny',    icon:'✨', rarity:0.02, filter:'invert(0.8) hue-rotate(180deg) saturate(2)', glow:'0 0 40px #ff00ff'}
];

// ===== Hof-Probleme (Liam, Sachkunde-Sub) =====
const HOF_PROBLEMS = [
  {q:"Der Trecker startet nicht. Was schaust du zuerst nach?",
   options:["Ob er aufgepumpt ist","Ob Diesel im Tank ist","Ob die Sonne scheint","Ob das Radio aus ist"],correct:1},
  {q:"Eine Kuh frisst nicht und steht müde. Was tust du?",
   options:["Mehr Futter ihr hinwerfen","Tierarzt anrufen","Selber operieren","Sie laufen lassen"],correct:1},
  {q:"Beim Pflügen geht der Pflug nicht tief genug. Was kann es sein?",
   options:["Pflug ist zu schwer","Schar ist stumpf","Trecker zu langsam","Erde ist nass"],correct:1},
  {q:"Der Mähdrescher verliert vorne Korn. Was prüfst du?",
   options:["Ob die Tankuhr stimmt","Ob das Schneidwerk richtig hoch ist","Ob die Sitze gepolstert sind","Ob das Funkgerät an ist"],correct:1},
  {q:"Ein Strohballen rollt vom Anhänger. Was hättest du tun müssen?",
   options:["Schneller fahren","Mit Spanngurten sichern","Ihn anpinseln","Ihm zureden"],correct:1},
  {q:"Auf der Strasse: Hinter dir ein Auto. Was machst du?",
   options:["Ignorieren","Bei nächster Möglichkeit rechts ranfahren und vorbeilassen","Mitten anhalten","Schneller fahren"],correct:1},
  {q:"Das Hydraulik-Öl tropft. Was sofort tun?",
   options:["Weiterfahren","Anhalten und Werkstatt anrufen","Ein Tuch drumwickeln","Mit Kaffee auffüllen"],correct:1},
  {q:"Bei der Heuernte zieht ein Gewitter auf. Was machst du?",
   options:["Trotzdem ernten","Heu schnell schwadeln und abtransportieren","Pause machen","Das Heu liegen lassen"],correct:1},
  {q:"Im Stall blitzt eine Lampe komisch. Was als Erstes?",
   options:["Ignorieren","Strom abschalten und Elektriker rufen","Lampe rausschrauben","Drauflackieren"],correct:1},
  {q:"Der Reifen vom Anhänger wird platt. Was nicht tun?",
   options:["Anhalten","Pannenhilfe rufen","Mit halbem Druck weiterfahren - GEFAHR","Ersatzrad montieren"],correct:2}
];

// ===== Maschinen-Tagebuch: kurze Lese-Texte über Maschinen mit Frage =====
const MACHINE_DIARY = [
  {text:"Der Fendt 1050 Vario hat 517 PS und 13,5 Tonnen Eigengewicht. Damit zieht er auch grosse Pflüge mühelos. Sein Vario-Getriebe wechselt stufenlos die Geschwindigkeit - der Fahrer muss nie schalten.",
   q:"Wie viele PS hat der Fendt 1050?",options:["517","1050","350","250"],correct:0},
  {text:"Der Claas Lexion 8900 ist ein Mähdrescher. Sein Korntank fasst 18.000 Liter. Wenn er voll ist, fährt ein LKW oder Wagen heran und der Lexion entlädt im Fahren - er muss nicht stehenbleiben.",
   q:"Was passiert wenn der Korntank voll ist?",options:["Lexion hält an","Wagen fährt ran und übernimmt","Korn wird auf den Acker geschüttet","Lexion explodiert"],correct:1},
  {text:"Der Krone Big X 1180 ist ein Häcksler mit 1156 PS. Er häckselt Mais oder Gras klein und wirft es durch das lange Rohr direkt in einen LKW oder Anhänger der nebenher fährt.",
   q:"Was macht der Krone Big X?",options:["Pflügt","Säht","Häckselt Mais & Gras","Mäht Wiese"],correct:2},
  {text:"Der MB-trac 1500 von Mercedes wurde von 1980 bis 1991 gebaut. Er hat vier gleich grosse Räder und die Kabine in der Mitte. Vorne UND hinten kann man Geräte anbauen - ungewöhnlich für einen Schlepper.",
   q:"Was ist beim MB-trac besonders?",options:["Vier gleich grosse Räder, Kabine mittig","Er fliegt","Er fährt rückwärts schneller","Er hat ein Solardach"],correct:0},
  {text:"Der John Deere 8R 410 hat statt Reifen Gummi-Raupen. Damit drückt er den Boden weniger fest - die Wurzeln der Pflanzen können besser wachsen und der Acker wird nicht so verdichtet.",
   q:"Warum hat der 8R Raupen?",options:["Damit er schneller ist","Damit er den Boden weniger festdrückt","Damit er auf Eis fährt","Damit er rückwärts kann"],correct:1}
];

// ===== Logik (Liam + Raik) - was passt nicht? =====
const ODD_ONE_OUT = [
  {q:"Was passt NICHT?",options:["Apfel 🍎","Birne 🍐","Banane 🍌","Hammer 🔨"],correct:3},
  {q:"Was passt NICHT?",options:["Hund 🐶","Katze 🐱","Auto 🚗","Pferd 🐴"],correct:2},
  {q:"Was passt NICHT?",options:["Stuhl","Tisch","Sofa","Trecker"],correct:3},
  {q:"Was passt NICHT?",options:["rot","blau","grün","schnell"],correct:3},
  {q:"Was passt NICHT?",options:["Mario","Sonic","Yoshi","Pizza"],correct:3},
  {q:"Was passt NICHT?",options:["Sommer","Winter","Herbst","Fahrrad"],correct:3},
  {q:"Was passt NICHT?",options:["Hammer","Säge","Bohrer","Banane"],correct:3},
  {q:"Was passt NICHT?",options:["Fendt","John Deere","Claas","Bowser"],correct:3}
];

// ============================================================
// MEMORY-Spiel-Karten (Konzentration)
// ============================================================
const MEMORY_DECK_LIAM = ['🚜','🐮','🌾','🍞','🥚','🥕','🐔','🌽'];
const MEMORY_DECK_RAIK = ['🍄','🟢','💨','🦊','🦖','🔥','⚡','🪨'];

// ============================================================
// UHR-Aufgaben (Zeit lesen)
// ============================================================
const CLOCK_LIAM = [
  {h:9, m:30}, {h:14, m:15}, {h:7, m:45}, {h:12, m:0},
  {h:18, m:30}, {h:10, m:15}, {h:6, m:0}, {h:21, m:45},
  {h:11, m:30}, {h:15, m:0}, {h:16, m:15}, {h:8, m:45}
];
const CLOCK_RAIK = [
  {h:3, m:0}, {h:6, m:0}, {h:9, m:0}, {h:12, m:0},
  {h:8, m:30}, {h:10, m:30}, {h:7, m:30}, {h:5, m:0}
];

// ============================================================
// GELD-Aufgaben (Münzen zählen)
// ============================================================
const COINS = [
  {val:1, label:'1ct', img:'🟫'}, {val:2, label:'2ct', img:'🟫'},
  {val:5, label:'5ct', img:'🟫'}, {val:10, label:'10ct', img:'🟡'},
  {val:20, label:'20ct', img:'🟡'}, {val:50, label:'50ct', img:'🟡'},
  {val:100, label:'1€', img:'⚪'}, {val:200, label:'2€', img:'⚪'}
];

// ===== LIAM (9, 3. Klasse, Bauernhof / Maschinen) =====
const LIAM_STORIES = [
  {
    text:"Auf Hof Müller läuft heute der neue Fendt 1050 Vario zum ersten Mal. Mit seinen 517 PS zieht er den 8-Schar-Pflug mühelos durch den schweren Lehmboden. Vater sagt: 'So einen starken Schlepper hatten wir noch nie!' Liam sitzt mit auf dem Bock und darf sogar einmal kurz lenken.",
    q:"Wie viele PS hat der Fendt 1050 Vario im Text?",
    options:["317 PS","517 PS","1050 PS","850 PS"],
    correct:1
  },
  {
    text:"Der Mähdrescher Claas Lexion 8900 fährt langsam durchs Weizenfeld. Sein Schneidwerk ist 12 Meter breit. Der Korntank fasst 18.000 Liter. Wenn er voll ist, fährt der Überladewagen heran und nimmt das Korn auf, während der Lexion ohne Pause weiterdrischt.",
    q:"Was passiert, wenn der Korntank voll ist?",
    options:["Der Lexion hält an","Der Überladewagen kommt und übernimmt","Das Korn fällt aufs Feld","Der Fahrer ruft an"],
    correct:1
  },
  {
    text:"Im Frühjahr beginnt die Gülleausbringung. Der Schlauch wird vom Tankwagen am Feldrand quer über den Acker gezogen. Der Schlepper mit Schleppschlauch-Verteiler fährt hin und her. So wird die Gülle direkt am Boden verteilt, kein Tropfen geht in die Luft.",
    q:"Warum nutzt man Schleppschläuche statt Breitverteiler?",
    options:["Damit es schneller geht","Damit nichts in die Luft geht und nichts verloren ist","Weil es lustiger aussieht","Weil sie billiger sind"],
    correct:1
  },
  {
    text:"Der Krone Big X 1180 ist ein Häcksler. Er fährt durch das Maisfeld und schneidet die Pflanzen ab. Innen drin häckselt er den Mais ganz klein. Ein Lkw fährt nebenher, der gehäckselte Mais fliegt durch das Auswurfrohr direkt auf den Anhänger. Aus dem Mais wird später Silage, das Futter für die Kühe.",
    q:"Was wird aus dem gehäckselten Mais gemacht?",
    options:["Brot","Silage als Kuhfutter","Popcorn","Diesel"],
    correct:1
  },
  {
    text:"Der MB-trac 1500 ist ein besonderer Schlepper. Er hat vier gleich große Räder und eine richtige Kabine in der Mitte. Vorne und hinten kann man Geräte anbauen. Heute zieht er den Düngerstreuer und streut 200 Kilo Dünger pro Hektar auf die Wintergerste.",
    q:"Was ist beim MB-trac besonders?",
    options:["Er fliegt","Vier gleich große Räder, Kabine in der Mitte","Er fährt rückwärts schneller","Er hat sechs Räder"],
    correct:1
  },
  {
    text:"Im Stall stehen 80 Milchkühe. Jede Kuh gibt ungefähr 30 Liter Milch am Tag. Der Melkroboter erkennt jede Kuh am Halsband und melkt sie, wann sie will. Die Milch fließt direkt in den großen Tank, wo sie auf 4 Grad gekühlt wird, bis das Milchauto kommt.",
    q:"Wie viel Liter Milch geben 80 Kühe ungefähr am Tag zusammen?",
    options:["240 Liter","800 Liter","2400 Liter","8000 Liter"],
    correct:2
  },
  {
    text:"Der John Deere 8R 410 hat einen Raupenantrieb statt normaler Reifen. Damit drückt er den Boden weniger fest. Heute zieht er die große Kreiselegge mit 6 Metern Arbeitsbreite. So wird der Acker für die Aussaat vorbereitet.",
    q:"Warum hat der 8R Raupen statt Reifen?",
    options:["Damit er schneller fährt","Damit er den Boden weniger festdrückt","Damit er auf Schienen fahren kann","Weil Reifen teuer sind"],
    correct:1
  },
  {
    text:"Die Heuernte braucht gutes Wetter. Zuerst mäht der Schlepper das Gras. Zwei Tage muss es trocknen. Dann kommt der Wender und dreht es um. Am dritten Tag schiebt der Schwader das Heu zu langen Reihen zusammen. Zuletzt presst die Ballenpresse das Heu zu großen runden Ballen.",
    q:"Was kommt nach dem Mähen als Erstes?",
    options:["Pressen","Schwader","Wender","Lkw"],
    correct:2
  }
];

const LIAM_MATH = [
  // Sortiert: leicht → schwer (sanfter Einstieg)
  // ===== LEICHT =====
  {q:"5 + 7 = ?",a:12},
  {q:"8 + 6 = ?",a:14},
  {q:"15 - 7 = ?",a:8},
  {q:"20 - 8 = ?",a:12},
  {q:"3 × 4 = ?",a:12},
  {q:"5 × 5 = ?",a:25},
  {q:"2 × 8 = ?",a:16},
  {q:"3 Kühe geben je 10 Liter Milch. Wie viel?",a:30},
  {q:"Auf einem Feld stehen 4 Reihen mit je 5 Strohballen. Wie viele?",a:20},
  // ===== MITTEL =====
  {q:"7 × 8 = ?",a:56},
  {q:"6 × 9 = ?",a:54},
  {q:"15 × 6 = ?",a:90},
  {q:"25 × 4 = ?",a:100},
  {q:"63 : 9 = ?",a:7},
  {q:"81 : 9 = ?",a:9},
  {q:"144 : 12 = ?",a:12},
  {q:"6 Kühe geben je 30 Liter Milch. Wie viel zusammen?",a:180},
  {q:"Auf dem Hof stehen 8 Reihen mit je 12 Strohballen. Wie viele Ballen sind es?",a:96},
  {q:"144 Eier in 12er-Schachteln. Wie viele Schachteln?",a:12},
  {q:"Eine Sau hat 12 Ferkel. Wie viele bei 9 Sauen?",a:108},
  // ===== SCHWER =====
  {q:"Der Tank fasst 800 L Diesel, 350 sind weg. Wie viel ist noch drin?",a:450},
  {q:"Ein Mähdrescher schafft 4 Hektar pro Stunde. Wie viel in 7 Stunden?",a:28},
  {q:"Fendt 724 hat 240 PS, 1050 hat 517 PS. Wie viel mehr?",a:277},
  {q:"240 Säcke Saatgut, je 25 kg. Wie viele kg gesamt?",a:6000},
  {q:"Tankwagen lädt 18 000 L Gülle, 6 000 sind ausgebracht. Rest?",a:12000},
  {q:"Schneidwerk ist 12 m breit. m² auf 50 m Länge?",a:600}
];

// ===== RAIK (7, 1. Klasse, Sonic/Mario, ADHS-tauglich kurz) =====
const RAIK_READING = [
  // Stufe 1: Silben
  {type:'syllable',text:"Wie heißt das?",options:["Ma-ri-o","Ma-li-o","Ma-ni-o","Ma-bi-o"],correct:0,img:"🍄"},
  {type:'syllable',text:"Wie heißt das?",options:["So-bik","So-nik","So-nig","Zo-nik"],correct:1,img:"💨"},
  {type:'syllable',text:"Wie heißt das?",options:["Yo-shi","Jo-si","Lo-shi","Yo-chi"],correct:0,img:"🦖"},
  {type:'syllable',text:"Wie heißt das?",options:["Lui-gi","Lu-gi","Loi-gi","Lui-ki"],correct:0,img:"🟢"},
  // Stufe 2: kurze Wörter
  {type:'word',text:"Was sammelt Mario?",options:["Münzen","Steine","Bücher","Stifte"],correct:0,img:"🪙"},
  {type:'word',text:"Wer ist der schnelle blaue Igel?",options:["Mario","Sonic","Luigi","Yoshi"],correct:1,img:"💨"},
  {type:'word',text:"Wer ist der grüne Dino?",options:["Sonic","Bowser","Yoshi","Tails"],correct:2,img:"🦖"},
  {type:'word',text:"Wer ist Marios Bruder?",options:["Sonic","Luigi","Bowser","Tails"],correct:1,img:"🟢"},
  // Stufe 3: kurze Sätze
  {type:'sentence',text:'"Mario springt auf den Pilz." Was tut Mario?',options:["er rennt","er springt","er schläft","er fällt"],correct:1},
  {type:'sentence',text:'"Sonic rennt durch den Loop." Wo rennt Sonic durch?',options:["den Tunnel","den Loop","das Wasser","die Wüste"],correct:1},
  {type:'sentence',text:'"Yoshi frisst eine Kirsche." Was frisst Yoshi?',options:["einen Apfel","eine Kirsche","eine Banane","eine Birne"],correct:1},
  {type:'sentence',text:'"Bowser fängt Prinzessin Peach." Wen fängt Bowser?',options:["Mario","Luigi","Peach","Yoshi"],correct:2},
  {type:'sentence',text:'"Tails fliegt mit zwei Schwänzen." Wie fliegt Tails?',options:["mit Flügeln","mit zwei Schwänzen","mit Raketen","mit Ballons"],correct:1},
  {type:'sentence',text:'"Knuckles ist sehr stark." Wie ist Knuckles?',options:["sehr schnell","sehr stark","sehr klein","sehr müde"],correct:1}
];

const RAIK_MATH = [
  // Klasse 1: Plus/Minus bis 20, sehr kurz
  {q:"Mario hat 3 Münzen 🪙 und sammelt 4 mehr. Wie viele?",a:7},
  {q:"Sonic sammelt 5 Ringe und verliert 2. Wie viele?",a:3},
  {q:"Yoshi frisst 6 Kirschen, dann 3 mehr. Wie viele?",a:9},
  {q:"Luigi hat 8 Pilze, gibt Mario 3 ab. Wie viele?",a:5},
  {q:"Bowser hat 10 Bomben, wirft 4. Wie viele bleiben?",a:6},
  {q:"Tails sammelt 7 Ringe, dann 5 mehr.",a:12},
  {q:"Peach hat 4 Kronen, bekommt 4 mehr.",a:8},
  {q:"6 + 7 = ?",a:13},
  {q:"15 - 8 = ?",a:7},
  {q:"9 + 6 = ?",a:15},
  {q:"12 - 5 = ?",a:7},
  {q:"3 + 9 = ?",a:12},
  {q:"18 - 9 = ?",a:9},
  {q:"4 + 8 = ?",a:12},
  {q:"Sonic läuft 10 Meter, dann nochmal 8 Meter.",a:18},
  {q:"Mario hat 14 Münzen, verliert 6.",a:8},
  {q:"5 + 5 + 5 = ?",a:15},
  {q:"20 - 7 = ?",a:13},
  {q:"2 + 9 = ?",a:11},
  {q:"11 - 4 = ?",a:7}
];

// ===== LIAM SACHKUNDE (Klasse 3, Hof- & Naturwelt) =====
const LIAM_SACH = [
  {q:"Welches Getreide hat Grannen (lange Borsten an der Ähre)?",options:["Weizen","Gerste","Hafer","Roggen"],correct:1},
  {q:"Wie viele Mägen hat eine Kuh?",options:["1","2","4","6"],correct:2},
  {q:"Was passiert mit Mais im Silo nach dem Häckseln?",options:["Er verbrennt","Er gärt zu Silage","Er trocknet","Er wird gemahlen"],correct:1},
  {q:"Welches Tier liefert Wolle?",options:["Schwein","Schaf","Pferd","Huhn"],correct:1},
  {q:"In welcher Jahreszeit wird Mais geerntet?",options:["Frühling","Sommer","Spätsommer/Herbst","Winter"],correct:2},
  {q:"Was ist Gülle?",options:["Trinkwasser für Kühe","Flüssiger Dünger aus Mist und Urin","Kraftstoff","Tierfutter"],correct:1},
  {q:"Welcher Baum trägt Eicheln?",options:["Buche","Tanne","Eiche","Birke"],correct:2},
  {q:"Wie nennt man ein junges Rind?",options:["Lamm","Kalb","Fohlen","Ferkel"],correct:1},
  {q:"Was misst der Bauer mit dem Hektar?",options:["Gewicht","Fläche","Zeit","Geschwindigkeit"],correct:1},
  {q:"1 Hektar = wie viel Quadratmeter?",options:["100","1.000","10.000","100.000"],correct:2},
  {q:"Welcher Vogel ist im Mais- und Getreidefeld zu Hause?",options:["Pinguin","Feldlerche","Adler","Spatz"],correct:1},
  {q:"Was wird aus Roggen vor allem gemacht?",options:["Bier","Brot","Schokolade","Käse"],correct:1},
  {q:"Welcher Motor läuft mit Diesel?",options:["Fahrrad","Traktor","Roller","Drachen"],correct:1},
  {q:"Wofür ist die Kreiselegge da?",options:["Pflügen","Boden feinkrümeln","Säen","Mähen"],correct:1},
  {q:"Was ist ein Frontlader?",options:["Eine Schaufel vorn am Schlepper","Ein LKW","Eine Mühle","Eine Saug-Maschine"],correct:0},
  {q:"Welcher Pflug-Typ ist heute am häufigsten?",options:["Holz-Pflug","Drehpflug","Hakenpflug","Hand-Pflug"],correct:1}
];

// ===== LIAM MUSIK (Klasse 3) =====
const LIAM_MUSIK = [
  {q:"Wie viele Linien hat ein Notensystem?",options:["3","4","5","6"],correct:2},
  {q:"Welche Note ist am längsten?",options:["Viertel","Halbe","Ganze","Achtel"],correct:2},
  {q:"Wie viele Schläge hat eine ganze Note?",options:["1","2","3","4"],correct:3},
  {q:"Welches Instrument gehört zu den Streichinstrumenten?",options:["Trompete","Geige","Klavier","Trommel"],correct:1},
  {q:"Welches Instrument ist KEIN Blasinstrument?",options:["Flöte","Saxophon","Cello","Trompete"],correct:2},
  {q:"Wie viele Töne hat eine Tonleiter (C-Dur)?",options:["5","6","7","8"],correct:2},
  {q:'Welcher Komponist hat "Eine kleine Nachtmusik" geschrieben?',options:["Bach","Mozart","Beethoven","Haydn"],correct:1},
  {q:"Welcher Notenwert ist am kürzesten?",options:["Ganze","Halbe","Viertel","Achtel"],correct:3},
  {q:'Was ist ein "Forte"?',options:["Leise","Laut","Schnell","Langsam"],correct:1},
  {q:'Was ist "Piano" in der Musik?',options:["Laut","Leise","Schnell","Hoch"],correct:1},
  {q:"Welches Instrument hat 88 Tasten?",options:["Geige","Klavier","Akkordeon","Gitarre"],correct:1},
  {q:"Wie heißt der Mann, der ein Orchester leitet?",options:["Sänger","Dirigent","Komponist","Pianist"],correct:1},
  {q:"Was ist eine Pause in der Musik?",options:["Ein Geräusch","Ein Stille-Zeichen","Ein Lied","Ein Tanz"],correct:1},
  {q:"Wie viele Saiten hat eine normale Gitarre?",options:["4","5","6","8"],correct:2}
];

// ===== RAIK SACHKUNDE (Klasse 1, Tiere/Natur/Alltag) =====
const RAIK_SACH = [
  {q:"Wie viele Beine hat eine Spinne?",options:["6","8","10","4"],correct:1,img:"🕷️"},
  {q:'Welches Tier macht "Muh"?',options:["Schaf","Kuh","Pferd","Hund"],correct:1,img:"🐮"},
  {q:"Welches Tier legt Eier?",options:["Hund","Katze","Huhn","Kuh"],correct:2,img:"🐔"},
  {q:"Wo wohnt ein Fisch?",options:["Im Baum","Im Wasser","Im Sand","In der Luft"],correct:1,img:"🐟"},
  {q:"Welche Jahreszeit ist warm und sonnig?",options:["Winter","Frühling","Sommer","Herbst"],correct:2,img:"☀️"},
  {q:"Wann fallen die Blätter von den Bäumen?",options:["Frühling","Sommer","Herbst","Winter"],correct:2,img:"🍂"},
  {q:"Wie viele Tage hat eine Woche?",options:["5","6","7","8"],correct:2},
  {q:"Welche Farbe hat eine reife Banane?",options:["Rot","Grün","Gelb","Blau"],correct:2,img:"🍌"},
  {q:"Was brauchen Pflanzen zum Wachsen?",options:["Strom","Wasser und Sonne","Schokolade","Geld"],correct:1,img:"🌱"},
  {q:"Welches Tier hat einen Rüssel?",options:["Giraffe","Elefant","Löwe","Affe"],correct:1,img:"🐘"},
  {q:"Wie viele Finger hat eine Hand?",options:["3","4","5","6"],correct:2,img:"✋"},
  {q:"Was ist KEIN Werkzeug?",options:["Hammer","Säge","Apfel","Schraubenzieher"],correct:2},
  {q:"Welches Tier kann fliegen?",options:["Fisch","Vogel","Kuh","Schwein"],correct:1,img:"🦅"},
  {q:"Welche Farbe wird aus Blau und Gelb?",options:["Rot","Grün","Lila","Orange"],correct:1},
  {q:"Wie heißt das Junge vom Hund?",options:["Fohlen","Welpe","Kalb","Küken"],correct:1,img:"🐶"}
];

// ===== RAIK MUSIK (Klasse 1) =====
const RAIK_MUSIK = [
  {q:"Welches Instrument bläst man?",options:["Geige","Trompete","Trommel","Klavier"],correct:1,img:"🎺"},
  {q:"Welches Instrument schlägt man?",options:["Flöte","Geige","Trommel","Trompete"],correct:2,img:"🥁"},
  {q:"Welches Instrument hat Saiten?",options:["Trommel","Gitarre","Trompete","Triangel"],correct:1,img:"🎸"},
  {q:"Welches Instrument hat schwarze und weiße Tasten?",options:["Klavier","Trommel","Geige","Flöte"],correct:0,img:"🎹"},
  {q:"Wie macht ein Hahn?",options:["Wuff","Miau","Kikeriki","Muh"],correct:2,img:"🐓"},
  {q:"Wie macht eine Katze?",options:["Wuff","Miau","Muh","Iah"],correct:1,img:"🐱"},
  {q:"Was ist laut?",options:["Flüstern","Schreien","Schlafen","Träumen"],correct:1},
  {q:"Was ist leise?",options:["Schreien","Singen","Flüstern","Klatschen"],correct:2},
  {q:'Welches Lied kennst du? "Alle meine ___"',options:["Hunde","Entchen","Kühe","Autos"],correct:1,img:"🦆"},
  {q:"Was ist hoch?",options:["Pieps von der Maus","Brüllen vom Löwen","Brummen vom Bären","Bass-Trommel"],correct:0,img:"🐭"},
  {q:"Was ist tief?",options:["Vogelgezwitscher","Pfiff","Bär brummt","Glöckchen"],correct:2,img:"🐻"},
  {q:'Wie viele Töne singst du beim "La-La-La" hintereinander?',options:["1","2","3","viele"],correct:3}
];

