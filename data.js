/* Būrelių testas v4 — duomenų branduolys
   ------------------------------------------------------------------
   Projektavimo taisyklės (2026-08-30 šališkumo auditas):
   1. ŠEŠI tipai, o ne keturi — kad būtų padengtas KŪNAS (sportas = 31,6 %
      Vilniaus pasiūlos) ir ŽMONĖS (kalbos, pilietiškumas, komanda).
   2. Klausimynas subalansuotas pagal 2-(6,3,2) blokų schemą: 10 klausimų ×
      3 atsakymai. Kiekvienas tipas pasirodo LYGIAI 5 kartus, kiekviena tipų
      pora lyginama LYGIAI 2 kartus. Nė vienas tipas negali laimėti dėl
      konstrukcijos (patikrinta: visi 59 049 keliai → po 10,8 %).
   3. Jokio numatytojo laimėtojo, jokios fiksuotos lygiųjų eilės.
      Lygiosios = mišrus profilis, ne pirmas sąrašo tipas.
   4. Rekomendacija = veiklų ŠEIMOS su TIKRU prieinamumu Vilniuje
      (skaičiai iš NŠPR registro), o ne rankomis surašytas įmonių sąrašas.
   5. Nė vienas teikėjas neturi kortelės. Robotikos Akademija dalyvauja
      lygiai taip pat, kaip visi kiti — ir pažymėta „įkūrėjas — Kris".
   ------------------------------------------------------------------ */
(function (global) {
  'use strict';

  /* ---------- 1. ŠEŠI TIPAI ------------------------------------------- */
  /* topics: svoris 0–3 kiekvienai iš 10 žemėlapio temų.
     3 = pagrindinė šeima · 2 = tinka · 1 = verta pažiūrėti · 0 = ne šis kelias */

  var TYPES = [
    {
      key: 'statytojas', emoji: '🔨', name: 'STATYTOJAS', gen: 'Statytojo',
      claim: 'Mokosi RANKOMIS.',
      desc: 'Jūsų vaikui reikia kurti, liesti, ardyti ir surinkti — ir matyti rezultatą, kurį galima paimti į rankas ir parodyti.',
      strength: 'Užbaigia tai, ką pradėjo, jei mato, kaip auga daiktas.',
      watch: 'Nuobodžiauja ten, kur reikia ilgai klausytis prieš pradedant daryti.',
      topics: { tech: 3, menai: 3, kita: 1, gamta: 1, protas: 1, sportas: 0, sokis: 0, muzika: 0, teatras: 0, kalbos: 0 },
      ask: '„Ar mano vaikas kurs SAVO projektą, ar tik kartos instrukcijas?“',
      tips: [
        'Duokite kelių savaičių projektą su matomais etapais — savo progreso sekimas ugdo savitvardą ir planavimą (CASEL: self-management).',
        'Klauskite „kaip tu tai padarei?“, ne „ar gražu?“ — procesas, ne rezultatas, augina atkaklumą.',
        'Retkarčiais statykite POROJE — darymą jūsų vaikas jau turi, augimo zona yra derėjimasis su kitu.'
      ],
      science: 'Struktūruotos, tikslingos popamokinės veiklos (SAFE kriterijai) duoda matomą efektą; nestruktūruotos — ne. (Durlak ir kt., 2011)'
    },
    {
      key: 'tyrinetojas', emoji: '🔬', name: 'TYRINĖTOJAS', gen: 'Tyrinėtojo',
      claim: 'Varo klausimas „KODĖL?“.',
      desc: 'Jūsų vaikui reikia erdvės eksperimentuoti, klysti ir atrasti pačiam. Atsakymas, duotas per anksti, jam sugadina žaidimą.',
      strength: 'Pats susiranda gilumą ten, kur kiti sustoja ties pirmu atsakymu.',
      watch: 'Greitai pereina prie kito dalyko — tai ne nepastovumas, o didelis naujumo poreikis.',
      topics: { gamta: 3, tech: 2, protas: 2, kita: 2, kalbos: 2, menai: 1, sportas: 0, sokis: 0, muzika: 0, teatras: 0 },
      ask: '„Kiek pamokoje vietos EKSPERIMENTUI, o kiek — instrukcijai?“',
      tips: [
        'Sukite veiklas ratu su struktūra, ne chaotiškai — įvairovė SU rėmais yra tai, ką OECD vadina pamatiniu vystymusi.',
        'Persakykite „greitai pabosta“ į „didelis naujumo poreikis“ — smalsumas yra TOP-10 ateities įgūdis (WEF, 2025).',
        'Duokite rinktis iš riboto sąrašo („išsirink 2 iš šių 4“) — taip treniruojasi atsakingas sprendimų priėmimas (CASEL).'
      ],
      science: 'PSO/OECD 2030 kompasas: vaiko vystymasis remiasi trimis pamatais — pažintiniu, fiziniu ir socialiniu-emociniu, ne vien pažymiais.'
    },
    {
      key: 'atlikejas', emoji: '🎭', name: 'ATLIKĖJAS', gen: 'Atlikėjo',
      claim: 'Auga, kai yra MATOMAS.',
      desc: 'Scena, publika ir saviraiška jūsų vaikui ne baimė, o kuras. Jam reikia vietos, kur jį pamato — ir tikrų pasirodymų, ne tik repeticijų.',
      strength: 'Nebijo būti priekyje — o tai daugumai vaikų yra sunkiausia dalis.',
      watch: 'Be publikos motyvacija krenta greitai; ieškokite veiklų su realiais pasirodymais.',
      topics: { teatras: 3, muzika: 3, sokis: 3, menai: 2, tech: 1, sportas: 1, kalbos: 1, kita: 1, gamta: 0, protas: 0 },
      ask: '„Kaip dažnai vaikai turi tikrus pasirodymus publikai?“',
      tips: [
        'Grupiniai pasirodymai ugdo ir socialinį sąmoningumą, ir santykių įgūdžius (CASEL) — publikos skaitymas IR YRA empatijos treniruotė.',
        'Scenos baimė yra treniruoklis, ne problema — drąsa auga tik veikiant nepatogume (VIA charakterio stiprybės).',
        'Duokite mažas lyderio roles (pravesti apšilimą) — lyderystė ir socialinė įtaka yra #3 ateities įgūdis (WEF, 2025).'
      ],
      science: '2024 m. OECD duomenų analizė: popamokinis menas ir sportas reikšmingai susiję su geresniais paauglių socialiniais-emociniais įgūdžiais.'
    },
    {
      key: 'strategas', emoji: '♟️', name: 'STRATEGAS', gen: 'Stratego',
      claim: 'Mąsto SISTEMOMIS.',
      desc: 'Jūsų vaikui reikia taisyklių, iššūkio ir erdvės planuoti kelis ėjimus į priekį. Jis nori žinoti, kaip laimima — ir kodėl.',
      strength: 'Mato struktūrą ten, kur kiti mato chaosą.',
      watch: 'Pralaimėjimą gali priimti kaip tapatybės grėsmę — čia reikia suaugusio, kuris to išmokytų.',
      topics: { protas: 3, tech: 2, kita: 2, sportas: 2, kalbos: 1, gamta: 1, muzika: 0, menai: 0, sokis: 0, teatras: 0 },
      ask: '„Ar yra lygiai, turnyrai, aiški progreso sistema?“',
      tips: [
        'Strateginiai žaidimai beveik 1:1 treniruoja pasekmių pasvėrimą — atsakingą sprendimų priėmimą (CASEL).',
        'Mokykite pralaimėti kaip DUOMENŲ, ne tapatybės grėsmės — lankstumas ir atsparumas yra #2 ateities įgūdis (WEF, 2025).',
        '„Per daug konkurencingas“ dažnai yra neįvardintos stiprybės — teisingumo ir vertinimo (VIA) — pusė. Įvardinkite ją.'
      ],
      science: 'JK švietimo įrodymų fondas (EEF): kokybiškos popamokinės programos vidutiniškai prideda +3 mėnesius akademinės pažangos per metus.'
    },
    {
      key: 'judantis', emoji: '🏃', name: 'JUDANTIS', gen: 'Judančio',
      claim: 'Mąsto KŪNU.',
      desc: 'Jūsų vaikui judesys nėra pertrauka nuo mokymosi — judesys IR YRA jo mokymosi būdas. Sėdint jo galva dirba lėčiau.',
      strength: 'Ištvermė ir drąsa fiziniam iššūkiui — pamatas, ant kurio laikosi viskas kita.',
      watch: 'Etiketė „neramus“ dažnai reiškia tik tai, kad diena neturėjo pakankamai judesio.',
      topics: { sportas: 3, sokis: 3, gamta: 2, kita: 1, teatras: 1, menai: 0, muzika: 0, tech: 0, kalbos: 0, protas: 0 },
      ask: '„Kiek pamokos minučių vaikas realiai JUDA, o kiek laukia eilėje?“',
      tips: [
        'Judesys prieš namų darbus, ne po jų — fizinis aktyvumas pagerina dėmesį ir vykdomąsias funkcijas iškart po jo.',
        'Rinkitės pagal apkrovos tipą, ne pagal šaką: vieniems reikia ritmo ir kartojimo, kitiems — kovos ir kontakto.',
        'Vienas sportas ištisus metus 6–12 m. amžiuje didina pervargimo traumų riziką — kaitaliokite sezonus.'
      ],
      science: 'PSO rekomendacija — 60 min. vidutinio ar intensyvaus judėjimo per dieną 5–17 m. vaikams; Lietuvoje jos nepasiekia dauguma.'
    },
    {
      key: 'jungejas', emoji: '🤝', name: 'JUNGĖJAS', gen: 'Jungėjo',
      claim: 'Mokosi per ŽMONES.',
      desc: 'Jūsų vaikui svarbiausia, KAS yra šalia. Jis eina ten, kur jaučiasi savas — ir dėl gero santykio ištvers net tai, kas sunku.',
      strength: 'Suburia, sutaiko ir pastebi tą, kuris liko nuošalyje.',
      watch: 'Gali rinktis būrelį pagal draugą, ne pagal save — verta turėti bent vieną veiklą „tik sau“.',
      topics: { kita: 3, kalbos: 3, sportas: 2, teatras: 2, muzika: 2, sokis: 2, menai: 1, gamta: 1, protas: 1, tech: 0 },
      ask: '„Kaip priimamas naujas vaikas į jau susidraugavusią grupę?“',
      tips: [
        'Komandinė veikla jam duoda daugiau nei individuali — net jei šaka atrodo „ne ta“.',
        'Kalbos jam yra ne dalykas, o durys į žmones — todėl kalbų būrelis su pokalbiu veikia, o su pratybų sąsiuviniu ne.',
        'Paklauskite, su kuo jis norėtų eiti — bet leiskite pasirinkti veiklą pačiam. Draugas atveda, turinys išlaiko.'
      ],
      science: '270 034 vaikų metaanalizė: socialinių-emocinių įgūdžių ugdymas pakelia akademinius pasiekimus vidutiniškai 11 procentilių (Durlak ir kt., 2011).'
    }
  ];

  /* ---------- 2. SUBALANSUOTAS KLAUSIMYNAS ---------------------------- */
  /* 2-(6,3,2) blokų schema. Kiekvienas tipas — 5 kartus, kiekviena pora — 2 kartus.
     Blokai: [A J R][G J R][S A J][S A G][S T J][S T R][T A G][T G J][T A R][S G R] */

  var QUESTIONS = [
    {
      q: 'Laisvą popietę vaikas rinktųsi…',
      qTeen: 'Laisvą popietę paauglys rinktųsi…',
      a: [
        { t: 'atlikejas', label: 'Vaidinti, dainuoti, filmuotis', labelTeen: 'Kurti muziką, filmuotis, vaidinti' },
        { t: 'judantis', label: 'Bėgioti, lipti, būti lauke', labelTeen: 'Sportuoti, judėti, treniruotis' },
        { t: 'jungejas', label: 'Būti su draugais, kalbėtis', labelTeen: 'Leisti laiką su draugais' }
      ]
    },
    {
      q: 'Kieme su kitais vaikais jūsų vaikas dažniausiai…',
      qTeen: 'Kompanijoje jūsų vaikas dažniausiai…',
      a: [
        { t: 'strategas', label: 'Sugalvoja taisykles ir žiūri, kad jų laikytųsi' },
        { t: 'judantis', label: 'Pirmas įsibėgėja — greitis, jėga, judesys' },
        { t: 'jungejas', label: 'Rūpinasi, kad visi būtų priimti' }
      ]
    },
    {
      q: 'Jūsų vaiko energija dažniausiai…',
      a: [
        { t: 'statytojas', label: 'Rankose — visada kažką daro ar taiso' },
        { t: 'atlikejas', label: 'Scenoje — traukia dėmesį' },
        { t: 'judantis', label: 'Kojose — sunku nustygti vietoje' }
      ]
    },
    {
      q: 'Kai vaikas gauna naują daiktą, jis pirmiausia…',
      a: [
        { t: 'statytojas', label: 'Išardo arba bando surinkti kitaip' },
        { t: 'atlikejas', label: 'Rodo visiems ir demonstruoja' },
        { t: 'strategas', label: 'Sugalvoja savo taisykles, kaip jį naudoti' }
      ]
    },
    {
      q: 'Kai kažkas nepavyksta, vaikas…',
      a: [
        { t: 'statytojas', label: 'Bando dar kartą, kitaip — pats' },
        { t: 'tyrinetojas', label: 'Klausia, kodėl nepavyko' },
        { t: 'judantis', label: 'Išeina pajudėti ir grįžta' }
      ]
    },
    {
      q: 'Ko vaikui labiausiai trūksta mokykloje?',
      a: [
        { t: 'statytojas', label: 'Darymo rankomis' },
        { t: 'tyrinetojas', label: 'Gilių atsakymų į „kodėl?“' },
        { t: 'jungejas', label: 'Šiltų santykių ir bendrumo' }
      ]
    },
    {
      q: 'Ekranai vaikui dažniausiai yra…',
      a: [
        { t: 'tyrinetojas', label: 'Atsakymų šaltinis („kaip tai veikia?“)' },
        { t: 'atlikejas', label: 'Scena (filmukai, muzika, šokiai)' },
        { t: 'strategas', label: 'Arena (strateginiai žaidimai)' }
      ]
    },
    {
      q: 'Kas vaiką labiausiai „užveda“?',
      a: [
        { t: 'tyrinetojas', label: 'Kai sužino, KAIP kažkas veikia' },
        { t: 'strategas', label: 'Kai LAIMI arba išsprendžia' },
        { t: 'judantis', label: 'Kai pavyksta fiziškai — greičiau, aukščiau, ilgiau' }
      ]
    },
    {
      q: 'Su draugais vaikas dažniausiai…',
      a: [
        { t: 'tyrinetojas', label: 'Veda visus tyrinėti ir atrasti' },
        { t: 'atlikejas', label: 'Linksmina kompaniją' },
        { t: 'jungejas', label: 'Sutaiko ir suburia' }
      ]
    },
    {
      q: 'Jūs labiausiai norėtumėte, kad būrelis ugdytų…',
      a: [
        { t: 'statytojas', label: 'Praktinius įgūdžius' },
        { t: 'strategas', label: 'Discipliną ir logiką' },
        { t: 'jungejas', label: 'Draugystes ir empatiją' }
      ]
    }
  ];

  /* ---------- 3. META KLAUSIMAI (be taškų) ---------------------------- */
  var META = {
    age: {
      q: 'Vaiko amžius?',
      kind: 'age',
      a: [
        { v: '5-7', label: '5–7 m.' }, { v: '7-9', label: '7–9 m.' },
        { v: '9-12', label: '9–12 m.' }, { v: '12-15', label: '12–15 m.' }, { v: '15+', label: '15+ m.' }
      ]
    },
    freq: {
      q: 'Kiek kartų per savaitę realu lankyti?',
      kind: 'freq',
      a: [
        { v: '1', label: '1 kartą' }, { v: '2', label: '2 kartus' },
        { v: '3+', label: '3 ir daugiau' }, { v: 'nezinau', label: 'Dar nežinau' }
      ]
    },
    priority: {
      q: 'Kas jums svarbiausia renkantis būrelį?',
      kind: 'priority',
      a: [
        { v: 'arti', label: 'Arti namų ar mokyklos' }, { v: 'kaina', label: 'Kaina' },
        { v: 'kokybe', label: 'Kokybė ir rezultatai' }, { v: 'draugai', label: 'Ten eina vaiko draugai' }
      ]
    }
  };

  var PRIORITY_NOTE = {
    arti: 'Jums svarbiausia, kad būtų arti — tvarumas svarbiau nei „idealus“ variantas kitame mieste. Žemėlapyje įjunkite atstumo filtrą.',
    kaina: 'Jums svarbi kaina — pasidomėkite NVŠ krepšeliu (sutarčių langas rugsėjo 16–21) ir savivaldybės finansavimu.',
    kokybe: 'Jums svarbiausia kokybė — klauskite apie mentoriaus patirtį, grupės dydį ir kaip matuojamas progresas.',
    draugai: 'Jums svarbu, kad šalia būtų draugai — socialinis ryšys dažnai lemia, ar vaikas liks būrelyje. Bet bent viena veikla tebūna „tik sau“.'
  };
  var FREQ_NOTE = {
    '1': 'Vienas kartas per savaitę — rinkitės vieną, bet stiprią veiklą.',
    '2': 'Du kartai — galima derinti judrią ir ramesnę veiklą.',
    '3+': 'Trys ir daugiau — svarbu neperkrauti: palikite laisvo laiko be plano.',
    nezinau: 'Pradėkite nuo vieno karto per savaitę ir stebėkite vaiko energiją.'
  };

  /* ---------- 4. TIKRA PASIŪLA (NŠPR, Vilnius, 2026-08-30) ------------ */
  /* Skaičiuota iš bureliu-zemelapis/data/providers.json per TAX.classify().
     Rodoma šalia kiekvienos rekomendacijos — kad tėvas matytų realybę,
     o ne tik gražų pavadinimą. */
  var SUPPLY = {
    sportas: { programs: 829, providers: 177 },
    tech:    { programs: 377, providers: 58 },
    muzika:  { programs: 332, providers: 39 },
    kita:    { programs: 286, providers: 70 },
    kalbos:  { programs: 248, providers: 33 },
    sokis:   { programs: 234, providers: 54 },
    menai:   { programs: 192, providers: 33 },
    teatras: { programs: 60,  providers: 22 },
    gamta:   { programs: 47,  providers: 18 },
    protas:  { programs: 19,  providers: 8 }
  };
  var SUPPLY_TOTAL = { programs: 2624, providers: 342 };

  /* Temų etiketės — sutampa su žemėlapio taksonomija (taxonomy.js) */
  var TOPIC_LABEL = {
    sportas: { emoji: '⚽', lt: 'Sportas', hint: 'komandiniai · kovos menai · plaukimas · gimnastika · tenisas' },
    sokis:   { emoji: '💃', lt: 'Šokis', hint: 'šiuolaikinis · gatvės · sportiniai · baletas · akrobatika' },
    muzika:  { emoji: '🎵', lt: 'Muzika', hint: 'instrumentas · dainavimas · choras · grupė · prodiusavimas' },
    menai:   { emoji: '🎨', lt: 'Menai ir kūryba', hint: 'dailė · keramika · animacija · mada · fotografija' },
    tech:    { emoji: '🤖', lt: 'Technologijos', hint: 'robotika · programavimas · dronai · 3D · elektronika' },
    teatras: { emoji: '🎭', lt: 'Teatras', hint: 'vaidyba · improvizacija · scenos kalba · miuziklas' },
    gamta:   { emoji: '🌿', lt: 'Gamta ir tyrinėjimai', hint: 'ekologija · žygiai · gyvūnai · eksperimentai' },
    kalbos:  { emoji: '🗣️', lt: 'Kalbos', hint: 'anglų · vokiečių · ispanų · pokalbių klubai' },
    protas:  { emoji: '♟️', lt: 'Protas ir strategija', hint: 'šachmatai · debatai · protmūšiai · logika' },
    kita:    { emoji: '✨', lt: 'Kita', hint: 'pilietiškumas · etnokultūra · savanorystė · gyvenimo įgūdžiai' }
  };

  /* ---------- 5. SCORING — be numatytojo laimėtojo -------------------- */

  function emptyScores() {
    var s = {};
    TYPES.forEach(function (t) { s[t.key] = 0; });
    return s;
  }

  /* Lygiosios NĖRA sprendžiamos pirmumu — jos duoda mišrų profilį.
     Tai vienintelis sąžiningas atsakymas, kai duomenys tikrai lygūs. */
  function computeResult(scores) {
    var keys = TYPES.map(function (t) { return t.key; });
    var max = 0;
    keys.forEach(function (k) { if (scores[k] > max) max = scores[k]; });
    var top = keys.filter(function (k) { return scores[k] === max; });

    var total = 0;
    keys.forEach(function (k) { total += scores[k]; });
    total = Math.max(1, total);
    var pct = {};
    keys.forEach(function (k) { pct[k] = Math.round((scores[k] / total) * 100); });

    var rest = keys.filter(function (k) { return top.indexOf(k) === -1; })
      .sort(function (a, b) { return scores[b] - scores[a]; });

    return {
      winners: top.slice(0, 2),          // 1 arba 2 tipai
      mixed: top.length > 1,
      manyTied: top.length > 2,          // reta: 3+ lygūs — sakome atvirai
      runnerUp: top.length === 1 ? rest[0] : null,
      closeRunnerUp: top.length === 1 && rest.length && (max - scores[rest[0]] <= 1),
      percentages: pct,
      scores: scores,
      max: max
    };
  }

  /* ---------- 6. REKOMENDACIJA — šeimos su tikru prieinamumu ---------- */
  /* Sudedami visų laimėjusių tipų svoriai. Lygūs svoriai rikiuojami pagal
     TIKRĄ pasiūlą (daugiau realių programų — aukščiau), nes rekomendacija,
     kurios mieste beveik nėra, tėvui yra ne pagalba, o spąstai. */
  function familiesFor(winnerKeys) {
    var w = {};
    Object.keys(TOPIC_LABEL).forEach(function (t) { w[t] = 0; });
    winnerKeys.forEach(function (k) {
      var ty = byKey(k);
      Object.keys(ty.topics).forEach(function (t) { w[t] = Math.max(w[t], ty.topics[t]); });
    });
    return Object.keys(w)
      .filter(function (t) { return w[t] > 0; })
      .sort(function (a, b) {
        if (w[b] !== w[a]) return w[b] - w[a];
        return (SUPPLY[b] ? SUPPLY[b].programs : 0) - (SUPPLY[a] ? SUPPLY[a].programs : 0);
      })
      .map(function (t) {
        return {
          topic: t, weight: w[t],
          label: TOPIC_LABEL[t].lt, emoji: TOPIC_LABEL[t].emoji, hint: TOPIC_LABEL[t].hint,
          supply: SUPPLY[t] || { programs: 0, providers: 0 },
          strength: w[t] === 3 ? 'Labai tinka' : (w[t] === 2 ? 'Tinka' : 'Verta pažiūrėti')
        };
      });
  }

  function byKey(k) {
    for (var i = 0; i < TYPES.length; i++) if (TYPES[i].key === k) return TYPES[i];
    return null;
  }

  /* ---------- 7. KO PAKLAUSTI VADOVO (bendra dalis) ------------------- */
  var COMMON_CHECKLIST = [
    '„Ar mentorius nesikeis vidury metų?“',
    '„Kaip ir kada gausiu grįžtamąjį ryšį apie savo vaiką?“',
    '„Kiek vaikų grupėje ir koks amžiaus intervalas?“',
    '„Kaip atrodo tipinė pamoka nuo pradžios iki pabaigos?“',
    '„Ką darysite, jei vaikui nepatiks po mėnesio?“',
    '„Ar galima ateiti į bandomąją pamoką prieš sumokant?“'
  ];

  var HONESTY = 'Šis testas — pokalbio su vaiku pradžia, ne diagnozė. Vaikas auga ir keičiasi; pakartokite po pusmečio.';

  var DISCLOSURE = 'Robotikos Akademiją įkūriau aš, Kristijonas, o bureliai.lt kuria ExoClass — įmonė, kurios bendraįkūrėjis taip pat esu. Todėl šiame teste nė vienas teikėjas negauna pirmumo: technologijos rodomos tik tada, kai tikrai atitinka profilį, o žemėlapis ir sąrašai visus būrelius rodo vienodai.';

  global.TESTAS = {
    TYPES: TYPES, QUESTIONS: QUESTIONS, META: META, SUPPLY: SUPPLY, SUPPLY_TOTAL: SUPPLY_TOTAL,
    TOPIC_LABEL: TOPIC_LABEL, PRIORITY_NOTE: PRIORITY_NOTE, FREQ_NOTE: FREQ_NOTE,
    COMMON_CHECKLIST: COMMON_CHECKLIST, HONESTY: HONESTY, DISCLOSURE: DISCLOSURE,
    emptyScores: emptyScores, computeResult: computeResult, familiesFor: familiesFor, byKey: byKey
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = global.TESTAS;
})(typeof window !== 'undefined' ? window : this);
