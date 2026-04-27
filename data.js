// ============================================================
// Lerninhalte – kuratiert auf Liams (Landwirtschaft) & Raiks (Sonic/Mario) Interessen
// ============================================================

const MACHINES = [
  {id:'fendt312',name:'Fendt 312',icon:'🚜',price:5},
  {id:'jd6r',name:'John Deere 6R',icon:'🚜',price:10},
  {id:'fendt724',name:'Fendt 724 Vario',icon:'🚜',price:20},
  {id:'claas_axion',name:'Claas Axion 870',icon:'🚜',price:30},
  {id:'mb_trac',name:'MB-trac 1500',icon:'🚜',price:40},
  {id:'fendt1050',name:'Fendt 1050 Vario',icon:'🚜',price:60},
  {id:'jd8r',name:'John Deere 8R 410',icon:'🚜',price:80},
  {id:'lexion',name:'Claas Lexion 8900',icon:'🌾',price:100},
  {id:'kronebigx',name:'Krone Big X 1180',icon:'🌽',price:130},
  {id:'jcb_fastrac',name:'JCB Fastrac 8330',icon:'🚜',price:160},
  {id:'cat_d11',name:'Caterpillar D11',icon:'🚧',price:200},
  {id:'jd_x9',name:'John Deere X9 1100',icon:'🌾',price:250}
];

const CHARS = [
  {id:'mario',name:'Mario',icon:'🍄',price:5},
  {id:'luigi',name:'Luigi',icon:'🟢',price:10},
  {id:'sonic',name:'Sonic',icon:'💨',price:20},
  {id:'tails',name:'Tails',icon:'🦊',price:30},
  {id:'yoshi',name:'Yoshi',icon:'🦖',price:40},
  {id:'knuckles',name:'Knuckles',icon:'👊',price:60},
  {id:'peach',name:'Peach',icon:'👑',price:80},
  {id:'shadow',name:'Shadow',icon:'⚡',price:100},
  {id:'bowser',name:'Bowser',icon:'🐢',price:130},
  {id:'eggman',name:'Dr. Eggman',icon:'🥚',price:160},
  {id:'rosalina',name:'Rosalina',icon:'⭐',price:200},
  {id:'superstar',name:'Superstar',icon:'🌟',price:250}
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
  // Klasse 3: Mal, Geteilt, Plus/Minus mit größeren Zahlen, Sachaufgaben
  {q:"Auf dem Hof stehen 8 Reihen mit je 12 Strohballen. Wie viele Ballen sind es?",a:96},
  {q:"Ein Mähdrescher schafft 4 Hektar pro Stunde. Wie viel in 7 Stunden?",a:28},
  {q:"6 Kühe geben je 30 Liter Milch. Wie viele Liter zusammen?",a:180},
  {q:"Der Tank fasst 800 Liter Diesel, 350 sind verbraucht. Wie viel ist noch drin?",a:450},
  {q:"144 Eier sollen in 12er-Schachteln verpackt werden. Wie viele Schachteln?",a:12},
  {q:"Der Fendt 724 hat 240 PS, der 1050 hat 517 PS. Wie viel mehr hat der 1050?",a:277},
  {q:"15 × 6 = ?",a:90},
  {q:"7 × 8 = ?",a:56},
  {q:"63 : 9 = ?",a:7},
  {q:"81 : 9 = ?",a:9},
  {q:"Auf dem Acker liegen 240 Säcke Saatgut, je 25 kg. Wie viele kg gesamt?",a:6000},
  {q:"Eine Sau hat 12 Ferkel. Wie viele Ferkel haben 9 Sauen?",a:108},
  {q:"Der Tankwagen lädt 18 000 Liter Gülle, 6 000 sind ausgebracht. Rest?",a:12000},
  {q:"Das Schneidwerk ist 12 m breit. Wie viel m² werden auf 50 m gemäht?",a:600},
  {q:"144 : 12 = ?",a:12},
  {q:"25 × 4 = ?",a:100}
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

