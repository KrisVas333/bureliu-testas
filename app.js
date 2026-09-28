/* Būrelių testas v4 — front-end
   Vanilla JS, jokio build'o, jokių bibliotekų. Duomenų branduolys — data.js
   (window.TESTAS), jis NEKEIČIAMAS.
   Kris Vasiliauskas · krisvas.lt */
(function () {
'use strict';

var T = window.TESTAS;
if (!T) { return; }

/* ============================ konfigūracija ============================ */
var CFG = {
  MAP:  'https://krisvas333.github.io/bureliu-zemelapis/',
  EXO:  'https://krisvas.lt/go/bureliai',
  SELF: 'https://krisvas333.github.io/bureliu-testas/',
  AUTO_MS:  350,      /* pauzė po paspaudimo, kad matytųsi pasirinkimas */
  SLIDE_MS: 250,      /* slinkimas kairėn */
  INTER_S:  10,       /* intersticialo atgalinė atskaita, sek. */
  ANA_MS:   2200      /* „analizuojame“ ekranas */
};

/* žemėlapio temų slug'ai (bureliu-zemelapis/app.js → SLUG) */
var TOPIC_SLUG = {
  sportas:'sportas', sokis:'sokis', muzika:'muzika', menai:'menai', tech:'technologijos',
  teatras:'teatras', gamta:'gamta', kalbos:'kalbos', protas:'protas', kita:'kita'
};

/* ============================ mažieji įrankiai ============================ */
function $(id){ return document.getElementById(id); }
function noop(){}
function reduceMotion(){
  try { return window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches; }
  catch (e) { return false; }
}
function h(tag, attrs, kids){
  var n = document.createElement(tag);
  if (attrs) for (var k in attrs){
    var v = attrs[k];
    if (v === null || v === undefined) continue;
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else if (k.slice(0,2) === 'on') n[k] = v;
    else n.setAttribute(k, v);
  }
  if (kids){
    (Object.prototype.toString.call(kids) === '[object Array]' ? kids : [kids]).forEach(function (c){
      if (c === null || c === undefined || c === false) return;
      n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
  }
  return n;
}
/* 2624 → „2 624“ (nedalomas tarpas — skaičius niekada nelūžta per eilutes) */
function nf(n){ return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
/* lietuviška daugiskaita: 1 programa · 3 programos · 20 programų */
function plural(n, one, few, many){
  var d = n % 10, dd = n % 100;
  if (d === 1 && dd !== 11) return one;
  if (d >= 2 && d <= 9 && (dd < 11 || dd > 19)) return few;
  return many;
}
function lc(s){
  if (!s) return '';
  try { return s.charAt(0).toLocaleLowerCase('lt') + s.slice(1); }
  catch (e) { return s.charAt(0).toLowerCase() + s.slice(1); }
}

/* ============================ analitika ============================ */
/* PRIVATUMAS: į analitiką (GA4 + track.js/Umami + Clarity) keliauja TIK šie
   raktai. Banerio pažadas: „jokio vaiko profilio, jokių duomenų tretiesiems“.
   Leidžiama:  index (žingsnio nr./pavadinimas, ne atsakymas) · id (pauzės ekranas)
               · via (toliau|praleisti) · theme (light|dark) · source (utm_source)
               · label (kurį mygtuką paspaudė) · place (top|end) · kind (klaidos
               tipas) · status (HTTP kodas) · duplicate (0|1)
   DRAUDŽIAMA (numetama čia pat): atsakymų reikšmės/tipai/pozicijos, vaiko tipas
   ir laimėtojai, mišrumas, amžius, dažnis, prioritetas, temos, el. paštas. */
var EV_ALLOWED = { index:1, id:1, via:1, theme:1, source:1, label:1, place:1, kind:1, status:1, duplicate:1 };
function evSafe(params){
  var out = {};
  if (!params) return out;
  for (var k in params){
    if (!Object.prototype.hasOwnProperty.call(params, k) || !EV_ALLOWED[k]) continue;
    var v = params[k];
    if (typeof v === 'number' || typeof v === 'boolean') out[k] = v;
    else if (typeof v === 'string' && v.indexOf('@') < 0) out[k] = v.slice(0, 40);
  }
  return out;
}
function ev(name, params){
  var p = evSafe(params);
  try { if (window.gtag) window.gtag('event', name, p); } catch (e) {}
  /* track.js (neuron-ar) viešas API yra window.bt, ne neuronTrack.
     Įkeliamas tik po „Sutinku“, todėl be sutikimo niekas nesiunčiama. */
  try {
    var tr = window.bt || window.neuronTrack;
    if (typeof tr === 'function') tr(name, p);
  } catch (e) {}
}
/* Clarity veidrodis: tik jei Clarity jau įkeltas (po sutikimo). Be parametrų. */
function evClarity(name){
  try { if (typeof window.clarity === 'function') window.clarity('event', name); } catch (e) {}
}

/* ---- konteksto surinkimas: utm · kv · referrer · įrenginys · tema ---- */
var CTX = (function (){
  var saved = null;
  try { saved = JSON.parse(sessionStorage.getItem('bt-ctx') || 'null'); } catch (e) {}
  var q = {};
  location.search.replace(/^\?/, '').split('&').forEach(function (kv){
    var i = kv.indexOf('='); if (i < 0) return;
    try { q[decodeURIComponent(kv.slice(0,i)).toLowerCase()] = decodeURIComponent(kv.slice(i+1).replace(/\+/g,' ')); }
    catch (e) {}
  });
  var w = window.innerWidth || 0;
  var o = {
    utm_source:   q.utm_source   || (saved && saved.utm_source)   || '',
    utm_medium:   q.utm_medium   || (saved && saved.utm_medium)   || '',
    utm_campaign: q.utm_campaign || (saved && saved.utm_campaign) || '',
    utm_content:  q.utm_content  || (saved && saved.utm_content)  || '',
    kv:           q.kv           || (saved && saved.kv)           || '',
    referrer:     (saved && saved.referrer) || document.referrer || '',
    device:       w <= 480 ? 'mobile' : (w <= 1024 ? 'tablet' : 'desktop'),
    theme:        'light'
  };
  try { sessionStorage.setItem('bt-ctx', JSON.stringify(o)); } catch (e) {}
  return o;
})();

function qsBuild(pairs){
  return pairs.filter(function (p){ return p[1] !== null && p[1] !== undefined && p[1] !== ''; })
              .map(function (p){ return encodeURIComponent(p[0]) + '=' + encodeURIComponent(p[1]); })
              .join('&');
}
/* į kiekvieną išeinančią nuorodą persiunčiamas įeinantis kontekstas */
function fwd(){
  return [['ref', CTX.utm_source], ['utm_content', CTX.utm_content], ['kv', CTX.kv]];
}
function campaign(){ return (S.res ? S.res.winners.join('-') : 'testas'); }
function mapUrl(topic, medium){
  var pairs = [['tema', TOPIC_SLUG[topic] || topic]];
  if (S.age) pairs.push(['amzius', S.age]);
  pairs.push(['utm_source','testas'], ['utm_medium', medium || 'result'], ['utm_campaign', campaign()]);
  return CFG.MAP + '?' + qsBuild(pairs.concat(fwd()));
}
function exoUrl(){
  return CFG.EXO + '?' + qsBuild([['utm_source','testas'], ['utm_medium','result'],
    ['utm_campaign', campaign()]].concat(fwd()));
}
function shareUrl(){
  return CFG.SELF + '?' + qsBuild([['utm_source','testas'], ['utm_medium','share'],
    ['utm_campaign', campaign()]]);
}

/* ============================ būsena ============================ */
var S = {
  seed: 0,
  orders: null,     /* 10 × [3 indeksai] — atsakymų maišymo tvarka */
  ans: [],          /* klausimo indeksas → tipo raktas */
  pick: [],         /* klausimo indeksas → pasirinkto atsakymo šaltinio indeksas */
  age: null, freq: null, priority: null,
  step: 0,
  res: null
};
function save(){
  try {
    sessionStorage.setItem('bt-state', JSON.stringify({
      seed:S.seed, orders:S.orders, ans:S.ans, pick:S.pick,
      age:S.age, freq:S.freq, priority:S.priority, step:S.step
    }));
  } catch (e) {}
}
function restore(){
  var o = null;
  try { o = JSON.parse(sessionStorage.getItem('bt-state') || 'null'); } catch (e) {}
  if (!o || !o.seed || !o.orders || o.orders.length !== T.QUESTIONS.length) return false;
  S.seed = o.seed; S.orders = o.orders;
  S.ans = o.ans || []; S.pick = o.pick || [];
  S.age = o.age || null; S.freq = o.freq || null; S.priority = o.priority || null;
  S.step = o.step || 0;
  return true;
}

/* ---- Fisher–Yates su sėkla: kiekvieno klausimo 3 atsakymai sumaišomi
   VIENĄ kartą per sesiją. Tai sąmoningas anti-šališkumo reikalavimas —
   pirmoji pozicija renkama dažniau, todėl nė vienas tipas negali jos
   „pasisavinti“. Sėkla įrašoma į sessionStorage, tad grįžus atgal
   (ar perkrovus puslapį) tvarka lieka ta pati. ---- */
function makeSeed(){
  try {
    if (window.crypto && crypto.getRandomValues){
      var a = new Uint32Array(1); crypto.getRandomValues(a);
      return (a[0] >>> 0) || 1;
    }
  } catch (e) {}
  return ((Date.now() ^ (Math.random() * 0xFFFFFFFF)) >>> 0) || 1;
}
function mulberry32(a){
  return function (){
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function makeOrders(seed){
  var rnd = mulberry32(seed), out = [];
  for (var q = 0; q < T.QUESTIONS.length; q++){
    var a = [];
    for (var i = 0; i < T.QUESTIONS[q].a.length; i++) a.push(i);
    for (var j = a.length - 1; j > 0; j--){
      var k = Math.floor(rnd() * (j + 1));
      var tmp = a[j]; a[j] = a[k]; a[k] = tmp;
    }
    out.push(a);
  }
  return out;
}

/* ============================ žingsnių seka ============================ */
var STEPS = (function (){
  var out = [{ kind:'meta', key:'age' }];
  var after = { 2:'supply', 5:'limits', 8:'churn' };   /* po Q3, Q6, Q9 */
  for (var i = 0; i < T.QUESTIONS.length; i++){
    out.push({ kind:'q', i:i });
    if (after[i]) out.push({ kind:'inter', id:after[i] });
  }
  out.push({ kind:'meta', key:'freq' });
  out.push({ kind:'meta', key:'priority' });
  return out;
})();
var QSTEPS = (function (){
  var out = [];
  STEPS.forEach(function (s, i){ if (s.kind !== 'inter') out.push(i); });
  return out;                                          /* 13 klausimų */
})();

/* ============================ laikmačiai ============================ */
var TIMERS = [];
function timer(id){ TIMERS.push(id); return id; }
function clearTimers(){
  TIMERS.forEach(function (id){ clearTimeout(id); clearInterval(id); });
  TIMERS = [];
}

/* ============================ tema ============================ */
function currentTheme(){
  var a = document.documentElement.getAttribute('data-theme');
  if (a === 'dark' || a === 'light') return a;
  try { if (window.matchMedia && matchMedia('(prefers-color-scheme:dark)').matches) return 'dark'; }
  catch (e) {}
  return 'light';
}
function setTheme(mode){
  document.documentElement.setAttribute('data-theme', mode);
  try { localStorage.setItem('bt-theme', mode); } catch (e) {}
  var c = mode === 'dark' ? '#080808' : '#FFFFFF';
  ['tc-light','tc-dark'].forEach(function (id){ var m = $(id); if (m) m.setAttribute('content', c); });
  CTX.theme = mode;
  try { sessionStorage.setItem('bt-ctx', JSON.stringify(CTX)); } catch (e) {}
  if (netRedraw) netRedraw();
  ev('theme_toggle', { theme: mode });
}

/* ============================ neuronų fonas ============================ */
var netRedraw = null;
function initNet(){
  var c = $('net'); if (!c || !c.getContext) return;
  var ctx = c.getContext('2d');
  var nodes = [], W = 0, H = 0, raf = null, still = reduceMotion();

  function resize(){
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    W = c.clientWidth || window.innerWidth;
    H = c.clientHeight || window.innerHeight;
    c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }
  function build(){
    var n = Math.max(14, Math.min(32, Math.round((W * H) / 38000)));
    if (nodes.length === n) return;
    nodes = [];
    for (var i = 0; i < n; i++) nodes.push({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .16, vy: (Math.random() - .5) * .16
    });
  }
  function col(){
    var v = '';
    try { v = getComputedStyle(document.documentElement).getPropertyValue('--net').trim(); } catch (e) {}
    return v || 'rgba(217,4,41,.55)';
  }
  function draw(){
    if (!W || !H) return;
    var cc = col();
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = cc; ctx.fillStyle = cc; ctx.lineWidth = 1;
    for (var i = 0; i < nodes.length; i++){
      var a = nodes[i];
      for (var j = i + 1; j < nodes.length; j++){
        var b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx*dx + dy*dy);
        if (d < 140){
          ctx.globalAlpha = (1 - d / 140) * .45;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = .8;
    nodes.forEach(function (p){ ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, 6.2832); ctx.fill(); });
    ctx.globalAlpha = 1;
  }
  function tick(){
    nodes.forEach(function (p){
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });
    draw();
    raf = requestAnimationFrame(tick);
  }
  netRedraw = draw;
  resize();
  var rt = null;
  window.addEventListener('resize', function (){
    clearTimeout(rt); rt = setTimeout(function (){ resize(); draw(); }, 180);
  });
  if (still) draw(); else tick();
}

/* ============================ ekranų perjungimas ============================ */
var SCREENS = ['s-landing','s-step','s-analyzing','s-result'];
function show(id){
  SCREENS.forEach(function (x){
    var n = $(x); if (!n) return;
    var on = (x === id);
    n.hidden = !on;
    n.classList.toggle('on', on);
  });
}
function toTop(){ try { window.scrollTo(0, 0); } catch (e) {} }

/* ============================ toast ============================ */
var toastT = null;
function toast(msg){
  var el = $('toast'); if (!el) return;
  el.textContent = msg;
  el.classList.add('on');
  clearTimeout(toastT);
  toastT = setTimeout(function (){ el.classList.remove('on'); }, 2800);
}

/* ============================ eigos juosta ============================ */
function updateBar(n){
  var done = 0;
  QSTEPS.forEach(function (i){ if (i < n) done++; });
  var total = QSTEPS.length;
  var fill = $('progFill'), left = $('leftN');
  if (fill) fill.style.width = Math.round((done / total) * 100) + '%';
  if (left) left.textContent = 'Liko ' + (total - done);
  var pb = document.querySelector('#s-step .prog');
  if (pb) pb.setAttribute('aria-valuenow', done);
}

/* ============================ klausimų ekranai ============================ */
function isTeen(){ return S.age === '12-15' || S.age === '15+'; }

function optButton(label, selected, onPick){
  var b = h('button', {
    class: 'opt' + (selected ? ' sel' : ''),
    type: 'button',
    'aria-pressed': selected ? 'true' : 'false'
  }, [
    h('span', { class:'dot', 'aria-hidden':'true' }),
    h('span', { text: label })
  ]);
  b.onclick = function (){
    var box = b.parentNode;
    for (var i = 0; i < box.children.length; i++){
      box.children[i].classList.remove('sel');
      box.children[i].setAttribute('aria-pressed', 'false');
    }
    b.classList.add('sel');
    b.setAttribute('aria-pressed', 'true');
    onPick();
  };
  return b;
}

var META_EYEBROW = {
  age: 'Prieš pradedant',
  freq: 'Beveik viskas',
  priority: 'Paskutinis klausimas'
};

function metaScreen(key, n){
  var M = T.META[key];
  var box = h('div');
  box.appendChild(h('p', { class:'q-step', text: META_EYEBROW[key] || '' }));
  box.appendChild(h('h2', { class:'q-title', id:'stepTitle', text: M.q }));
  var opts = h('div', { class:'opts', role:'group', 'aria-labelledby':'stepTitle' });
  M.a.forEach(function (a){
    opts.appendChild(optButton(a.label, S[key] === a.v, function (){
      S[key] = a.v; save();
      ev('question_answered', { index: key, value: a.v });
      timer(setTimeout(function (){ go(n + 1); }, CFG.AUTO_MS));
    }));
  });
  box.appendChild(opts);
  return box;
}

function qScreen(i, n){
  var Q = T.QUESTIONS[i];
  var teen = isTeen();
  var title = (teen && Q.qTeen) ? Q.qTeen : Q.q;
  var box = h('div');
  box.appendChild(h('p', { class:'q-step', text:'Klausimas ' + (i + 1) + ' iš ' + T.QUESTIONS.length }));
  box.appendChild(h('h2', { class:'q-title', id:'stepTitle', text: title }));
  var opts = h('div', { class:'opts', role:'group', 'aria-labelledby':'stepTitle' });
  S.orders[i].forEach(function (oi){
    var a = Q.a[oi];
    var label = (teen && a.labelTeen) ? a.labelTeen : a.label;
    opts.appendChild(optButton(label, S.pick[i] === oi, function (){
      S.ans[i] = a.t; S.pick[i] = oi; save();
      ev('question_answered', { index: i + 1, type: a.t, position: S.orders[i].indexOf(oi) + 1 });
      timer(setTimeout(function (){ go(n + 1); }, CFG.AUTO_MS));
    }));
  });
  box.appendChild(opts);
  return box;
}

/* ============================ intersticialai ============================ */
var LIMITS = [
  ['①', 'kas siūloma VAIKO mokykloje'],
  ['②', 'ar tėvai gali nuvežti'],
  ['③', 'ar būrelis atitinka vaiko interesą — ir ar leidžia jį KEISTI'],
  ['④', 'nepatogu registruotis, keisti ar atšaukti'],
  ['⑤', 'kaina ne toje ribose']
];
var CHURN_TILES = [
  ['37,8', '%', 'palieka per pirmą ciklą'],
  ['26,7', '%', '#1 priežastis — nuobodulys'],
  ['1,6',  '%', 'kaina — tik tiek']
];

var INTERS = {
  supply: {
    eyebrow: 'Trumpa pauzė · faktas',
    title:   'Ką Lietuva iš tikrųjų siūlo',
    num:     nf(T.SUPPLY_TOTAL.programs),
    cap:     'programos Vilniuje',
    line:    'Sportas — kas trečia Vilniaus programa. Robotika — kas septinta.',
    src:     'NŠPR registras · 2 624 Vilniaus programos, 2026',
    body:    supplyBody
  },
  limits: {
    eyebrow: 'Trumpa pauzė · realybė',
    title:   'Kas iš tiesų riboja pasirinkimą',
    num:     '5',
    cap:     'ribos, apie kurias retai kalbame',
    line:    'Renkamės iš to, kas pasiekiama. Šis testas — apie tai, kas TINKA.',
    src:     'Kris Vasiliauskas · 13 m. · 1 600+ šeimų',
    body:    limitsBody
  },
  churn: {
    eyebrow: 'Trumpa pauzė · duomenys',
    title:   'Kodėl vaikai meta būrelį',
    num:     '378',
    cap:     'audituoti atsisakymai',
    line:    'Tinkamas TIPAS svarbiau nei artimiausias būrelis.',
    src:     'mūsų audituoti 378 atsisakymai · CASEL',
    body:    churnBody
  }
};

function supplyBody(){
  var keys = Object.keys(T.SUPPLY).sort(function (a, b){
    return T.SUPPLY[b].programs - T.SUPPLY[a].programs;
  });
  var max = T.SUPPLY[keys[0]].programs;
  var box = h('div', { class:'bars' });
  var rows = [];
  keys.forEach(function (k){
    var lab = T.TOPIC_LABEL[k];
    var fill = h('span', { class:'bf' });
    var row = h('div', { class:'bar-row' + (k === 'sportas' || k === 'tech' ? ' hi' : '') }, [
      h('span', { class:'bl', text: lab.emoji + ' ' + lab.lt }),
      h('span', { class:'bt' }, fill),
      h('span', { class:'bn', text: nf(T.SUPPLY[k].programs) })
    ]);
    rows.push([fill, Math.max(2, Math.round((T.SUPPLY[k].programs / max) * 100))]);
    box.appendChild(row);
  });
  /* plotis nustatomas po prijungimo prie DOM — priverstinis reflow paleidžia
     CSS transition. setTimeout, o ne requestAnimationFrame: fone esančiose
     kortelėse rAF apskritai nekviečiamas ir juostos liktų tuščios. */
  rows.forEach(function (r, i){
    timer(setTimeout(function (){
      void r[0].offsetWidth;
      r[0].style.width = r[1] + '%';
    }, reduceMotion() ? 0 : 30 + i * 55));
  });
  return box;
}

function limitsBody(){
  var ul = h('ul', { class:'limits' });
  var lis = [];
  LIMITS.forEach(function (l){
    var li = h('li', null, [h('span', { class:'n', 'aria-hidden':'true', text:l[0] }), h('span', { text:l[1] })]);
    lis.push(li); ul.appendChild(li);
  });
  if (reduceMotion()){
    lis.forEach(function (li){ li.classList.add('on'); });
  } else {
    lis.forEach(function (li, i){
      timer(setTimeout(function (){ li.classList.add('on'); }, 150 + i * 600));
    });
  }
  return ul;
}

function churnBody(){
  var box = h('div', { class:'tiles' });
  CHURN_TILES.forEach(function (t, i){
    var b = h('b', { text: '0' + (t[1] ? ' ' + t[1] : '') });
    box.appendChild(h('div', { class:'tile' }, [b, h('i', { text: t[2] })]));
    countUp(b, parseFloat(t[0].replace(',', '.')), t[0].indexOf(',') > -1 ? 1 : 0, t[1], 120 + i * 130);
  });
  return box;
}
function countUp(el, target, dec, suffix, delay){
  function fmt(v){
    var s = dec ? v.toFixed(dec).replace('.', ',') : String(Math.round(v));
    return s + (suffix ? ' ' + suffix : '');
  }
  if (reduceMotion()){ el.textContent = fmt(target); return; }
  timer(setTimeout(function (){
    var t0 = Date.now(), DUR = 900;
    var iv = timer(setInterval(function (){
      var p = Math.min(1, (Date.now() - t0) / DUR);
      el.textContent = fmt(target * (1 - Math.pow(1 - p, 3)));
      if (p >= 1){ clearInterval(iv); el.textContent = fmt(target); }
    }, 40));
  }, delay));
}

var RING_C = 2 * Math.PI * 19;   /* r = 19 */

function interScreen(id, n){
  var D = INTERS[id];
  var box = h('div', { class:'inter' });

  /* h() kuria HTML elementus — SVG reikia namespace'o */
  function ns(name, attrs){
    var e = document.createElementNS('http://www.w3.org/2000/svg', name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  var svg = ns('svg', { width:46, height:46, viewBox:'0 0 46 46', 'aria-hidden':'true' });
  var trk = ns('circle', { 'class':'trk', cx:23, cy:23, r:19, fill:'none', 'stroke-width':3 });
  var bar = ns('circle', { 'class':'bar', cx:23, cy:23, r:19, fill:'none', 'stroke-width':3,
                           'stroke-dasharray': RING_C.toFixed(2), 'stroke-dashoffset':'0' });
  svg.appendChild(trk); svg.appendChild(bar);
  var cnt = h('b', { text: String(CFG.INTER_S) });
  var ring = h('div', { class:'ring', role:'timer', 'aria-label':'Automatiškai tęsiama po ' + CFG.INTER_S + ' sek.' });
  ring.appendChild(svg); ring.appendChild(cnt);

  var card = h('div', { class:'inter-card' }, [
    h('div', { class:'inter-head' }, [
      h('div', null, [
        h('p', { class:'eyebrow', text: D.eyebrow }),
        h('h2', { id:'stepTitle', text: D.title })
      ]),
      ring
    ]),
    h('p', { class:'big-num', text: D.num }),
    h('p', { class:'big-cap', text: D.cap }),
    D.body(),
    h('p', { class:'inter-line', text: D.line }),
    h('p', { class:'inter-src', text: D.src })
  ]);

  var next = h('button', { class:'btn btn-primary', type:'button', text:'Toliau →' });
  next.onclick = function (){ ev('interstitial_skip', { id:id, via:'toliau' }); go(n + 1); };
  var skip = h('button', { class:'skip', type:'button', text:'Praleisti' });
  skip.onclick = function (){ ev('interstitial_skip', { id:id, via:'praleisti' }); go(n + 1); };

  card.appendChild(h('div', { class:'inter-actions' }, [next, skip]));
  box.appendChild(card);

  /* atgalinė atskaita — pagal realų laikrodį, ne pagal tiksėjimų skaičių
     (fone esančiose kortelėse naršyklė droselina setInterval iki 1 s) */
  var t0 = Date.now(), step = reduceMotion() ? 1000 : 100;
  var iv = timer(setInterval(function (){
    var left = Math.max(0, CFG.INTER_S - (Date.now() - t0) / 1000);
    cnt.textContent = String(Math.ceil(left));
    bar.setAttribute('stroke-dashoffset', (RING_C * (1 - left / CFG.INTER_S)).toFixed(2));
    if (left <= 0){
      clearInterval(iv);
      ev('interstitial_autoadvance', { id:id });
      go(n + 1);
    }
  }, step));

  ev('interstitial_view', { id:id });
  return box;
}

/* ============================ navigacija ============================ */
function render(n, slide){
  var stage = $('stage'); if (!stage) return;
  clearTimers();
  function build(){
    stage.innerHTML = '';
    var st = STEPS[n];
    if (st.kind === 'meta')      stage.appendChild(metaScreen(st.key, n));
    else if (st.kind === 'q')    stage.appendChild(qScreen(st.i, n));
    else                         stage.appendChild(interScreen(st.id, n));
    updateBar(n);
    stage.classList.remove('slide-out');
    stage.classList.add('slide-in');
    setTimeout(function (){ stage.classList.remove('slide-in'); }, CFG.SLIDE_MS + 20);
    toTop();
    /* po automatinio perėjimo fokusas nukrenta į <body> — klaviatūra ir
       ekrano skaitytuvas pameta vietą. Perkeliam jį ant naujos antraštės. */
    var head = stage.querySelector('#stepTitle');
    if (head){
      head.setAttribute('tabindex', '-1');
      try { head.focus({ preventScroll:true }); } catch (e){ try { head.focus(); } catch (e2){} }
    }
  }
  if (slide && !reduceMotion()){
    stage.classList.add('slide-out');
    setTimeout(build, CFG.SLIDE_MS);
  } else {
    build();
  }
}
function go(n){
  if (n >= STEPS.length){ finish(); return; }
  S.step = n; save();
  try { history.pushState({ bt:n }, '', '#k' + (n + 1)); } catch (e) {}
  render(n, true);
}
function startQuiz(){
  if (!S.seed || !S.orders){
    S.seed = makeSeed();
    S.orders = makeOrders(S.seed);
  }
  S.step = 0; save();
  ev('quiz_started', { source: CTX.utm_source || 'direct', device: CTX.device });
  show('s-step');
  try { history.pushState({ bt:0 }, '', '#k1'); } catch (e) {}
  render(0, false);
}

/* ============================ rezultatas ============================ */
function finish(){
  var sc = T.emptyScores();
  S.ans.forEach(function (k){ if (k && sc[k] !== undefined) sc[k]++; });
  var res = T.computeResult(sc);
  S.res = res;
  save();

  clearTimers();
  show('s-analyzing');
  try { history.pushState({ bt:'result' }, '', '#rezultatas'); } catch (e) {}
  toTop();

  ev('quiz_completed', {
    winner: res.winners.join('-'),
    mixed: res.mixed ? 1 : 0,
    many_tied: res.manyTied ? 1 : 0,
    age: S.age || '', freq: S.freq || '', priority: S.priority || ''
  });

  var lis = document.querySelectorAll('#anaList li');
  var slow = !reduceMotion();
  for (var i = 0; i < lis.length; i++) lis[i].classList.remove('on');
  for (var j = 0; j < lis.length; j++){
    (function (k){
      timer(setTimeout(function (){ lis[k].classList.add('on'); }, slow ? (150 + k * 500) : (60 + k * 40)));
    })(j);
  }
  timer(setTimeout(function (){
    renderResult(res);
    show('s-result');
    toTop();
  }, slow ? CFG.ANA_MS : 500));
}

function winnerTypes(res){
  return res.winners.map(function (k){ return T.byKey(k); }).filter(Boolean);
}

function renderResult(res){
  var root = $('result'); if (!root) return;
  root.innerHTML = '';
  var w = winnerTypes(res);
  if (!w.length) return;

  /* ---- a. tapatybės kortelė ---- */
  var id = h('div', { class:'identity' }, [
    h('div', { class:'emo', 'aria-hidden':'true', text: w.map(function (t){ return t.emoji; }).join(' ') }),
    h('h2', { id:'resName', text: w.map(function (t){ return t.name; }).join('–') }),
    h('p', { class:'claim', text: w.map(function (t){ return t.claim; }).join(' ') })
  ]);
  w.forEach(function (t){ id.appendChild(h('p', { class:'desc', text: t.desc })); });
  if (res.manyTied){
    id.appendChild(h('p', { class:'mixnote', text:
      'Net trys ar daugiau tipų surinko po lygiai — sakome tai atvirai. Jūsų vaiko profilis kol kas platus, ' +
      'ir tai visiškai normalu, ypač jaunesniame amžiuje. Rodome dvi ryškiausias kryptis, bet verta išbandyti ' +
      'plačiau ir pakartoti testą po pusmečio.' }));
  } else if (res.mixed){
    id.appendChild(h('p', { class:'mixnote', text:
      'Du tipai surinko lygiai tiek pat taškų. Tai ne testo klaida ir ne „neaiškus“ vaikas — jūsų vaikas ' +
      'tikrai turi dvi vienodai stiprias puses. Tai naudinga: ieškokite veiklos, kurioje telpa abi, arba ' +
      'derinkite dvi skirtingas.' }));
  } else if (res.closeRunnerUp && res.runnerUp){
    var ru = T.byKey(res.runnerUp);
    if (ru) id.appendChild(h('p', { class:'mixnote', text:
      'Labai arti liko ir ' + ru.emoji + ' ' + ru.name + ' — skirtumas vos vienas taškas. Vertėtų pažiūrėti ir tą kryptį.' }));
  }
  root.appendChild(id);

  /* ---- a2. naujienlaiškis (pagrindinė vieta, iškart po rezultatu) ---- */
  root.appendChild(nlCard('top'));

  /* ---- b. profilis ---- */
  var prof = h('div', { class:'prof' });
  var ordered = T.TYPES.slice().sort(function (a, b){
    return (res.scores[b.key] || 0) - (res.scores[a.key] || 0);
  });
  var fills = [];
  ordered.forEach(function (t){
    var isWin = res.winners.indexOf(t.key) > -1;
    var pct = res.percentages[t.key] || 0;
    var f = h('span', { class:'pf' });
    fills.push([f, pct]);
    prof.appendChild(h('div', { class:'prow' + (isWin ? ' win' : '') }, [
      h('span', { class:'pl' }, [
        h('span', { 'aria-hidden':'true', text: t.emoji }),
        h('span', { text: t.name })
      ]),
      h('span', { class:'pt' }, f),
      h('span', { class:'pn', text: pct + ' %' })
    ]));
  });
  root.appendChild(section('📊 Profilis', prof));
  fills.forEach(function (r, i){
    setTimeout(function (){
      void r[0].offsetWidth;
      r[0].style.width = Math.max(2, r[1]) + '%';
    }, reduceMotion() ? 0 : 40 + i * 60);
  });

  /* ---- c. pastebėjome ---- */
  var notes = [];
  notes.push(w.map(function (t){ return t.gen + ' stiprybė: ' + lc(t.strength); }).join(' '));
  notes.push('Į ką verta atkreipti dėmesį: ' + w.map(function (t){ return lc(t.watch); }).join(' '));
  var third = (S.priority && T.PRIORITY_NOTE[S.priority]) || (S.freq && T.FREQ_NOTE[S.freq]) ||
              T.FREQ_NOTE.nezinau;
  notes.push(third);
  var ul = h('ul', { class:'notes' });
  notes.forEach(function (x){ ul.appendChild(h('li', { text:x })); });
  root.appendChild(section('🔍 Pastebėjome', ul));

  /* ---- d. kas tinka jūsų vaikui ---- */
  var fams = T.familiesFor(res.winners).slice(0, 5);
  var fbox = h('div', { class:'fams' });
  fams.forEach(function (f){
    var chipCls = 'chip' + (f.weight === 3 ? ' s3' : (f.weight === 2 ? ' s2' : ''));
    var a = h('a', {
      class:'fam', href: mapUrl(f.topic, 'result'), target:'_blank', rel:'noopener'
    }, [
      h('div', { class:'fam-top' }, [
        h('span', { class:'fam-emo', 'aria-hidden':'true', text:f.emoji }),
        h('span', { class:'fam-name', text:f.label }),
        h('span', { class:chipCls, text:f.strength }),
        h('span', { class:'fam-go', 'aria-hidden':'true', text:'→' })
      ]),
      h('p', { class:'fam-hint', text:f.hint }),
      h('p', { class:'fam-supply', text:
        'Vilniuje: ' + nf(f.supply.programs) + ' ' +
        plural(f.supply.programs, 'programa', 'programos', 'programų') + ' · ' +
        nf(f.supply.providers) + ' ' +
        plural(f.supply.providers, 'teikėjas', 'teikėjai', 'teikėjų') }),
      f.supply.programs < 50
        ? h('p', { class:'fam-thin', text:'Tokių Vilniuje mažai — verta pažiūrėti ir kitą šeimą.' })
        : null
    ]);
    a.onclick = function (){ ev('family_click', { topic:f.topic, weight:f.weight, winner: res.winners.join('-') }); };
    fbox.appendChild(a);
  });
  root.appendChild(section('🎯 Kas tinka jūsų vaikui', fbox));

  /* ---- e. kaip ugdyti namuose (mišriam — abiejų tipų, be dublikatų, max 4) ---- */
  var tips = [], maxLen = 0;
  w.forEach(function (t){ if (t.tips.length > maxLen) maxLen = t.tips.length; });
  for (var r = 0; r < maxLen && tips.length < 4; r++){
    for (var c = 0; c < w.length && tips.length < 4; c++){
      var x = w[c].tips[r];
      if (x && tips.indexOf(x) < 0) tips.push(x);
    }
  }
  root.appendChild(section('🌱 Kaip ugdyti namuose', list(tips)));

  /* ---- f. ko paklausti vadovo ---- */
  var asks = [];
  w.forEach(function (t){ if (asks.indexOf(t.ask) < 0) asks.push(t.ask); });
  T.COMMON_CHECKLIST.forEach(function (q){ if (asks.indexOf(q) < 0) asks.push(q); });
  root.appendChild(section('❓ Ko paklausti vadovo', list(asks)));

  /* ---- g. mokslas sako ---- */
  var sci = h('div');
  var seen = [];
  w.forEach(function (t){
    if (seen.indexOf(t.science) > -1) return;
    seen.push(t.science);
    sci.appendChild(h('p', { class:'science', text:t.science }));
  });
  root.appendChild(section('🔬 Mokslas sako', sci));

  /* ---- h. atskleidimas ---- */
  var disc = h('div', { class:'disclose' }, [
    h('span', { text: T.DISCLOSURE }),
    h('br'),
    h('a', { href:'metodika.html', text:'Kaip veikia šis testas →' })
  ]);
  disc.querySelector('a').onclick = function (){ ev('result_cta_click', { label:'metodika' }); };
  root.appendChild(disc);

  /* ---- i. mygtukai ---- */
  var topTopic = fams.length ? fams[0].topic : 'sportas';
  var ctas = h('div', { class:'ctas' });

  var bMap = h('a', { class:'btn btn-primary', href: mapUrl(topTopic, 'result-cta'),
                      target:'_blank', rel:'noopener', text:'Rasti būrelius žemėlapyje →' });
  bMap.onclick = function (){ ev('result_cta_click', { label:'zemelapis', topic:topTopic }); };

  var bExo = h('a', { class:'btn btn-outline', href: exoUrl(), target:'_blank', rel:'noopener',
                      text:'Visi būreliai → bureliai.lt' });
  bExo.onclick = function (){ ev('result_cta_click', { label:'bureliai' }); };

  var bShare = h('button', { class:'btn btn-ghost', type:'button', text:'Pasidalinti rezultatu' });
  bShare.onclick = shareResult;

  var bAgain = h('button', { class:'btn btn-ghost', type:'button', text:'Turite daugiau vaikų? Pakartokit' });
  bAgain.onclick = function (){ ev('result_cta_click', { label:'kitas_vaikas' }); resetQuiz(true); };

  var bHome = h('button', { class:'btn btn-ghost', type:'button', text:'Į pradžią' });
  bHome.onclick = function (){ ev('result_cta_click', { label:'i_pradzia' }); resetQuiz(false); };

  [bMap, bExo, bShare, bAgain, bHome].forEach(function (b){ ctas.appendChild(b); });
  root.appendChild(ctas);

  /* ---- j. sąžiningumo eilutė ---- */
  root.appendChild(h('p', { class:'honesty', text: T.HONESTY }));

  /* ---- j2. naujienlaiškis (antra vieta tiems, kas perskaitė viską) ---- */
  root.appendChild(nlCard('end'));

  /* ---- k. atsakomybės eilutė (privaloma — wiki/meta/tool-disclaimer.md) ---- */
  var ai = h('section', { class:'res-sec ai-card' }, [
    h('p', { class:'ai-label', text:'⚗️ EKSPERIMENTINIS PROTOTIPAS' }),
    h('p', { class:'ai-p', text:'Šį testą sukūriau su dirbtiniu intelektu. Jis nuolat keičiasi, gali klysti arba pateikti netikslių duomenų — todėl naudokite jį kaip pokalbio su vaiku pradžią, ne kaip galutinę tiesą. Svarbius dalykus visada pasitikrinkite pas patį būrelio vadovą.' }),
    h('p', { class:'ai-p', text:'Įrankiai nemokami ir kuriami atvirai: noriu, kad augtų visų Lietuvos būrelių kokybė ir pasiūla — ne tik mano. Radote klaidą, netikslumą ar nesąžiningumą? Parašykite — taisau greitai.' })
  ]);
  var aiLink = h('a', { class:'ai-link', text:'Pranešti apie klaidą → krisvas.lt' });
  aiLink.href = 'https://krisvas.lt'; aiLink.target = '_blank'; aiLink.rel = 'noopener noreferrer';
  aiLink.onclick = function (){ ev('result_cta_click', { label:'pranesti_klaida' }); };
  ai.appendChild(aiLink);
  root.appendChild(ai);
}

/* ============================ naujienlaiškis ============================
   Viena būsena dviem kortelėms (viršuje ir pabaigoje). Užsiprenumeravus
   abi virsta padėka. El. paštas NIEKADA nepatenka į jokį analitikos įvykį.
   Siunčiama į krisvas.lt edge funkciją mailerlite-subscribe (CORS *). */
var NL = {
  URL:  'https://bpufgnpzsjmtqyfihkuk.supabase.co/functions/v1/mailerlite-subscribe',
  KEY:  'sb_publishable_kJxdHmhHG68-L938ap3F3w_uYkMRr9D',   /* viešas publishable anon raktas */
  TIMEOUT_MS: 15000,
  MAIL: 'kristijonas.vasiliauskas@gmail.com',
  PRIV: 'https://krisvas.lt/privatumas',
  busy: false,
  done: (function (){ try { var v = localStorage.getItem('bt-nl'); return (v === 'ok' || v === 'dup') ? v : ''; } catch (e) { return ''; } })()
};
var NL_TXT = {
  top: { t:'Viena naudinga mintis tėvams kas savaitę',
         v:'Trumpai, moksliškai pagrįstai, apie būrelius ir vaiko motyvaciją. 2 min. skaitymo.' },
  end: { t:'Patiko? Viena mintis kas savaitę', v:'' },
  proof:   'Jau skaito 179 tėvai',
  consent: 'Sutinku gauti Kris Vasiliausko naujienlaiškį. Atsisakyti galima bet kada.',
  ok:      'Ačiū! Kitą laišką gausite, kai jis išeis. Laiškai ateina maždaug kartą per savaitę.',
  dup:     'Jūs jau prenumeruojate, ačiū!',
  badMail: 'Patikrinkite el. pašto adresą.',
  noCons:  'Pažymėkite sutikimą, kad galėčiau siųsti laiškus.',
  slow:    'Per daug bandymų iš eilės. Palaukite minutę ir spauskite „Gauti“ dar kartą.',
  err:     'Nepavyko, pabandykite dar kartą arba parašykite '
};

function nlEv(name, p){ ev(name, p); evClarity(name); }

/* page_url be užklausos parametrų, išskyrus utm_* (be kv, be hash) */
function nlPageUrl(){
  var keep = [];
  location.search.replace(/^\?/, '').split('&').forEach(function (kv){
    if (/^utm_[a-z_]+=/i.test(kv)) keep.push(kv);
  });
  return location.origin + location.pathname + (keep.length ? '?' + keep.join('&') : '');
}

function nlThanks(card, focus){
  card.innerHTML = '';
  card.classList.add('nl-done');
  var p = h('p', { class:'nl-thanks', role:'status', tabindex:'-1',
                   text: NL.done === 'dup' ? NL_TXT.dup : NL_TXT.ok });
  card.appendChild(h('span', { class:'nl-ok-ic', 'aria-hidden':'true', text:'✓' }));
  card.appendChild(p);
  if (focus){ try { p.focus({ preventScroll:true }); } catch (e) {} }
}

function nlSyncAll(srcCard){
  var cards = document.querySelectorAll('.nl-card');
  for (var i = 0; i < cards.length; i++){
    var c = cards[i];
    if (NL.done){ nlThanks(c, c === srcCard); continue; }
    var b = c.querySelector('button[type="submit"]');
    if (b){
      b.disabled = NL.busy;
      b.classList.toggle('is-busy', NL.busy);
      b.setAttribute('aria-busy', NL.busy ? 'true' : 'false');
    }
  }
}

function nlMsg(card, text, withMail){
  var m = card.querySelector('.nl-msg'); if (!m) return;
  m.innerHTML = '';
  if (!text){ m.hidden = true; return; }
  m.hidden = false;
  m.appendChild(document.createTextNode(text));
  if (withMail){
    m.appendChild(h('a', { href:'mailto:' + NL.MAIL, text: NL.MAIL }));
  }
}

function nlCard(place){
  var tx = NL_TXT[place] || NL_TXT.top;
  var card = h('section', { class:'nl-card nl-' + place, 'data-place': place, 'aria-label':'Naujienlaiškis' });
  if (NL.done){ nlThanks(card, false); return card; }

  var idE = 'nlEmail-' + place, idC = 'nlCons-' + place, idH = 'nlX-' + place;
  card.appendChild(h('h3', { class:'nl-t', text: tx.t }));
  if (tx.v) card.appendChild(h('p', { class:'nl-v', text: tx.v }));
  if (place === 'top') card.appendChild(h('p', { class:'nl-proof', text: NL_TXT.proof }));

  var email = h('input', { id:idE, class:'nl-in', type:'email', name:'email', inputmode:'email',
                           autocomplete:'email', autocapitalize:'off', spellcheck:'false',
                           placeholder:'jusu@pastas.lt', required:'required', 'aria-describedby':'nlMsg-' + place });
  /* medaus puodas: vardas, kurio naršyklių automatinis pildymas neatpažįsta, be etiketės */
  var hp = h('input', { id:idH, type:'text', name:'nl_hp_x', tabindex:'-1', autocomplete:'off', value:'' });
  var cons = h('input', { id:idC, class:'nl-cb', type:'checkbox', name:'consent', required:'required' });
  var priv = h('a', { href: NL.PRIV, target:'_blank', rel:'noopener', text:'Privatumas' });

  var btn = h('button', { class:'btn btn-primary nl-btn', type:'submit' }, [
    h('span', { class:'nl-spin', 'aria-hidden':'true' }),
    h('span', { class:'nl-btn-t', text:'Gauti' })
  ]);

  var form = h('form', { class:'nl-form', novalidate:'novalidate', 'data-clarity-mask':'true' }, [
    h('label', { class:'sr-only', 'for':idE, text:'El. pašto adresas' }),
    email,
    h('div', { class:'nl-hp', 'aria-hidden':'true' }, [hp]),
    h('label', { class:'nl-consent', 'for':idC }, [
      cons,
      h('span', null, [NL_TXT.consent + ' ', priv])
    ]),
    btn,
    h('p', { id:'nlMsg-' + place, class:'nl-msg', role:'alert', hidden:'hidden' })
  ]);
  card.appendChild(form);

  form.onsubmit = function (e){
    if (e && e.preventDefault) e.preventDefault();
    if (NL.busy || NL.done) return;
    var val = String(email.value || '').trim();
    email.removeAttribute('aria-invalid'); cons.removeAttribute('aria-invalid');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)){
      email.setAttribute('aria-invalid', 'true'); nlMsg(card, NL_TXT.badMail); email.focus(); return;
    }
    if (!cons.checked){
      cons.setAttribute('aria-invalid', 'true'); nlMsg(card, NL_TXT.noCons); cons.focus(); return;
    }
    nlMsg(card, '');
    nlSubmit(card, place, val, hp.value || '');
  };

  nlWatchView(card, place);
  return card;
}

/* nl_view: kai kortelė bent per pusę pasirodo ekrane, kartą per kortelę */
function nlWatchView(card, place){
  function fire(){ if (card._seen || NL.done) return; card._seen = true; nlEv('nl_view', { place: place }); }
  if (!('IntersectionObserver' in window)){ setTimeout(fire, 0); return; }
  var io = new IntersectionObserver(function (ents){
    ents.forEach(function (en){
      if (en.isIntersecting && en.intersectionRatio >= 0.5){ fire(); io.disconnect(); }
    });
  }, { threshold: [0, 0.5, 1] });
  io.observe(card);
}

function nlSubmit(card, place, email, company){
  NL.busy = true; nlSyncAll();
  nlEv('nl_submit', { place: place });

  var finished = false, ctrl = null;
  try { ctrl = new AbortController(); } catch (e) {}
  var to = setTimeout(function (){
    if (finished) return;
    try { if (ctrl) ctrl.abort(); } catch (e) {}
    fail('timeout', 0);
  }, NL.TIMEOUT_MS);

  function end(){ finished = true; clearTimeout(to); NL.busy = false; }
  function fail(kind, status){
    if (finished) return;
    end(); nlSyncAll();
    nlEv('nl_error', { place: place, kind: kind, status: status || 0 });
    if (kind === 'rate') nlMsg(card, NL_TXT.slow);
    else nlMsg(card, NL_TXT.err, true);
  }

  var body = JSON.stringify({
    email: email, language: 'lt', source: 'bureliu-testas',
    page_url: nlPageUrl(), consent: true, company: company
  });
  fetch(NL.URL, {
    method: 'POST',
    headers: { 'Content-Type':'application/json', 'apikey': NL.KEY, 'Authorization': 'Bearer ' + NL.KEY },
    body: body,
    signal: ctrl ? ctrl.signal : undefined
  }).then(function (r){
    return r.json().catch(function (){ return null; }).then(function (d){ return { r:r, d:d }; });
  }).then(function (x){
    if (finished) return;
    if (x.r.status === 429){ fail('rate', 429); return; }
    if (!x.r.ok || !x.d || !x.d.ok){ fail('http', x.r.status); return; }
    end();
    NL.done = x.d.duplicate ? 'dup' : 'ok';
    try { localStorage.setItem('bt-nl', NL.done); } catch (e) {}
    nlEv('nl_ok', { place: place, duplicate: x.d.duplicate ? 1 : 0 });
    nlSyncAll(card);
  }).catch(function (){
    fail(finished ? 'timeout' : 'network', 0);
  });
}

function section(title, body){
  var s = h('section', { class:'res-sec' }, [h('h3', { text:title })]);
  s.appendChild(body);
  return s;
}
function list(items){
  var ul = h('ul', { class:'plain' });
  items.forEach(function (x){ ul.appendChild(h('li', { text:x })); });
  return ul;
}

/* ============================ perkrovimas ============================ */
function resetQuiz(startNow){
  clearTimers();
  S.seed = 0; S.orders = null; S.ans = []; S.pick = [];
  S.age = null; S.freq = null; S.priority = null; S.step = 0; S.res = null;
  try { sessionStorage.removeItem('bt-state'); } catch (e) {}
  if (startNow){ startQuiz(); }
  else {
    show('s-landing');
    try { history.pushState({ bt:-1 }, '', location.pathname + location.search); } catch (e) {}
    toTop();
  }
}

/* ============================ dalinimasis ============================ */
function copyText(txt){
  if (navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(txt).then(
      function (){ toast('Nuoroda nukopijuota'); },
      function (){ legacyCopy(txt); }
    );
    return;
  }
  legacyCopy(txt);
}
function legacyCopy(txt){
  try {
    var ta = document.createElement('textarea');
    ta.value = txt; ta.setAttribute('readonly', '');
    ta.style.position = 'fixed'; ta.style.top = '-1000px';
    document.body.appendChild(ta); ta.select();
    var ok = document.execCommand('copy');
    document.body.removeChild(ta);
    toast(ok ? 'Nuoroda nukopijuota' : 'Nepavyko nukopijuoti');
  } catch (e){ toast('Nepavyko nukopijuoti'); }
}

function wrapText(ctx, text, x, y, maxW, lh, maxLines){
  var words = String(text).split(' '), line = '', lines = [];
  for (var i = 0; i < words.length; i++){
    var test = line ? line + ' ' + words[i] : words[i];
    if (ctx.measureText(test).width > maxW && line){ lines.push(line); line = words[i]; }
    else line = test;
  }
  if (line) lines.push(line);
  if (maxLines) lines = lines.slice(0, maxLines);
  lines.forEach(function (l, i){ ctx.fillText(l, x, y + i * lh); });
  return y + lines.length * lh;
}

/* rezultato kortelė ant <canvas> — 1080×1350 (tinka IG/FB/WA) */
function buildCard(cb){
  try {
    var res = S.res; if (!res){ cb(null); return; }
    var w = winnerTypes(res);
    var c = document.createElement('canvas');
    c.width = 1080; c.height = 1350;
    var x = c.getContext('2d');
    if (!x){ cb(null); return; }

    var dark = currentTheme() === 'dark';
    var bg   = dark ? '#080808' : '#FFFFFF';
    var ink  = dark ? '#FAFAFA' : '#0A0A0A';
    var mut  = dark ? '#A3A3A3' : '#595959';
    var red  = dark ? '#FF0000' : '#D90429';
    var line = dark ? '#262626' : '#E3E1DC';
    var MONO = '"JetBrains Mono", ui-monospace, Menlo, monospace';
    var BODY = 'Inter, -apple-system, "Segoe UI", Roboto, sans-serif';
    var EMO  = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';

    x.fillStyle = bg; x.fillRect(0, 0, 1080, 1350);
    x.fillStyle = red; x.fillRect(0, 0, 1080, 16);

    x.textBaseline = 'alphabetic';
    x.fillStyle = mut; x.font = '700 26px ' + MONO;
    x.fillText('BŪRELIŲ TESTAS', 80, 150);

    x.font = '132px ' + EMO;
    x.fillText(w.map(function (t){ return t.emoji; }).join(' '), 80, 320);

    x.fillStyle = red; x.font = '800 82px ' + MONO;
    var yy = wrapText(x, w.map(function (t){ return t.name; }).join('–'), 80, 450, 920, 92, 2);

    x.fillStyle = ink; x.font = '700 40px ' + BODY;
    yy = wrapText(x, w.map(function (t){ return t.claim; }).join(' '), 80, yy + 46, 920, 52, 3);

    /* top-2 procentai */
    var ord = T.TYPES.slice().sort(function (a, b){
      return (res.scores[b.key] || 0) - (res.scores[a.key] || 0);
    }).slice(0, 2);
    var by = Math.max(yy + 90, 900);
    ord.forEach(function (t, i){
      var pct = res.percentages[t.key] || 0;
      var ty = by + i * 118;
      x.fillStyle = ink; x.font = '600 34px ' + BODY;
      x.fillText(t.name, 80, ty);
      x.fillStyle = ink; x.font = '800 34px ' + MONO;
      var lbl = pct + ' %';
      x.fillText(lbl, 1000 - x.measureText(lbl).width, ty);
      x.fillStyle = line; x.fillRect(80, ty + 22, 920, 18);
      x.fillStyle = i === 0 ? red : mut;
      x.fillRect(80, ty + 22, Math.max(18, Math.round(920 * pct / 100)), 18);
    });

    x.fillStyle = line; x.fillRect(80, 1216, 920, 1);
    x.fillStyle = mut; x.font = '700 28px ' + MONO;
    x.fillText('bureliutestas · krisvas.lt', 80, 1276);

    if (c.toBlob) c.toBlob(function (b){ cb(b); }, 'image/png');
    else cb(null);
  } catch (e){ cb(null); }
}

function shareResult(){
  if (!S.res) return;
  ev('share_click', { winner: S.res.winners.join('-'), mixed: S.res.mixed ? 1 : 0 });
  var url  = shareUrl();
  var w    = winnerTypes(S.res);
  var name = w.map(function (t){ return t.name; }).join('–');
  var text = 'Mano vaiko tipas — ' + name + '. Nemokamas 2 min. būrelių testas tėvams:';

  function fallback(){
    if (navigator.share){
      navigator.share({ title:'Būrelių testas', text:text, url:url })
        .catch(function (){ copyText(url); });
    } else {
      copyText(url);
    }
  }

  var fonts = (document.fonts && document.fonts.ready) ? document.fonts.ready : null;
  function run(){
    buildCard(function (blob){
      if (blob && window.File && navigator.canShare){
        try {
          var file = new File([blob], 'bureliu-testas.png', { type:'image/png' });
          if (navigator.canShare({ files:[file] })){
            navigator.share({ files:[file], title:'Būrelių testas', text:text })
              .catch(function (){ fallback(); });
            return;
          }
        } catch (e) {}
      }
      fallback();
    });
  }
  if (fonts && fonts.then) fonts.then(run, run); else run();
}

/* ============================ paleidimas ============================ */
function boot(){
  initNet();
  /* sutikimas vertinamas VISADA, ir kai sesija atkuriama į žingsnį ar rezultatą
     (anksčiau tie keliai grįždavo anksčiau ir analitika po perkrovimo neįsijungdavo) */
  wireConsent();
  CTX.theme = currentTheme();
  try { sessionStorage.setItem('bt-ctx', JSON.stringify(CTX)); } catch (e) {}

  var btnTheme = $('btnTheme');
  if (btnTheme) btnTheme.onclick = function (){ setTheme(currentTheme() === 'dark' ? 'light' : 'dark'); };

  var btnStart = $('btnStart');
  if (btnStart) btnStart.onclick = function (){ startQuiz(); };

  var lnk = $('lnkMethodTop');
  if (lnk) lnk.onclick = function (){ ev('result_cta_click', { label:'metodika_landing' }); };

  var btnBack = $('btnBack');
  if (btnBack) btnBack.onclick = function (){ history.back(); };

  /* sistemos temos pasikeitimas — kai vartotojas NEPASIRINKO temos pats */
  try {
    var mq = matchMedia('(prefers-color-scheme:dark)');
    var onmq = function (){
      var chosen = null;
      try { chosen = localStorage.getItem('bt-theme'); } catch (e) {}
      if (!chosen && netRedraw) netRedraw();
    };
    if (mq.addEventListener) mq.addEventListener('change', onmq);
    else if (mq.addListener) mq.addListener(onmq);
  } catch (e) {}

  /* naršyklės Atgal/Pirmyn — atsakymai NIEKADA neprarandami (jie S + sessionStorage) */
  window.addEventListener('popstate', function (e){
    var st = (e.state && e.state.bt !== undefined) ? e.state.bt : null;
    clearTimers();
    /* būsenos objekto gali ir nebūti (pirmoji hash navigacija, atkurta sesija) —
       tada tiesa yra adrese, o ne `null`. Be šito vartotoją numesdavo į pradžią. */
    if (st === null || st === undefined){
      var mm = /^#k(\d+)$/.exec(location.hash || '');
      if (mm) st = parseInt(mm[1], 10) - 1;
      else if (/^#rezultatas$/.test(location.hash || '')) st = 'result';
      else st = -1;
    }
    if (st === 'result'){
      var answered = 0;
      S.ans.forEach(function (k){ if (k) answered++; });
      if (!S.res && answered === T.QUESTIONS.length){
        var sc = T.emptyScores();
        S.ans.forEach(function (k){ if (k && sc[k] !== undefined) sc[k]++; });
        S.res = T.computeResult(sc);
      }
      if (S.res){ renderResult(S.res); show('s-result'); toTop(); return; }
      show('s-landing'); toTop(); return;
    }
    if (typeof st === 'number' && st >= 0 && st < STEPS.length && S.orders){
      S.step = st; save();
      show('s-step'); render(st, false); return;
    }
    show('s-landing'); toTop();
  });

  try { history.replaceState({ bt:-1 }, '', location.pathname + location.search + location.hash); } catch (e) {}

  /* atkūrimas po perkrovimo toje pačioje sesijoje */
  var had = restore();
  var m = /^#k(\d+)$/.exec(location.hash || '');
  if (had && m){
    var n = parseInt(m[1], 10) - 1;
    if (n >= 0 && n < STEPS.length){
      S.step = n;
      show('s-step');
      try { history.replaceState({ bt:n }, '', '#k' + (n + 1)); } catch (e) {}
      render(n, false);
      return;
    }
  }
  if (had && /^#rezultatas$/.test(location.hash || '')){
    var done = 0;
    S.ans.forEach(function (k){ if (k) done++; });
    if (done === T.QUESTIONS.length){
      var sc2 = T.emptyScores();
      S.ans.forEach(function (k){ if (k && sc2[k] !== undefined) sc2[k]++; });
      S.res = T.computeResult(sc2);
      renderResult(S.res);
      show('s-result');
      try { history.replaceState({ bt:'result' }, '', '#rezultatas'); } catch (e) {}
      return;
    }
  }
  show('s-landing');
}

/* sutikimas analitikai — juosta rodoma tik tada, kai žmogus dar neatsakė.
   Abu mygtukai vienodo svorio (EDPB draudžia „Sutinku" paryškinti). */
function wireConsent(){
  var box = document.getElementById('consent');
  if (!box || !window.BTConsent) return;
  var state = window.BTConsent.boot();
  if (!state) box.hidden = false;
  function answer(yes){
    if (yes) window.BTConsent.accept(); else window.BTConsent.decline();
    box.hidden = true;
  }
  var y = document.getElementById('cnsYes'), n = document.getElementById('cnsNo');
  if (y) y.onclick = function (){ answer(true); };
  if (n) n.onclick = function (){ answer(false); };
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

})();
