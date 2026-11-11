// Leitura do texto VISIVEL das paginas do perfil (docs/formato-do-perfil.md).
// Funcoes puras: recebem o texto da pagina e devolvem so numeros e chaves.
// Nunca le cookie, storage da pagina, rede nem nomes ou descricoes de itens do bau.
(function (root) {
  var COMPANY_NAMES = {
    gold_hoarders: ['Acumuladores de Ouro', 'Gold Hoarders'],
    merchant_alliance: ['Aliança Mercante', 'Merchant Alliance'],
    order_of_souls: ['Ordem das Almas', 'Order of Souls'],
    athenas_fortune: ['Fortuna de Atena', "Athena's Fortune"],
    reapers_bones: ['Ossos do Ceifador', "Reaper's Bones"],
    hunters_call: ['Chamado da Caça', "Hunter's Call"],
    guardians_of_fortune: ['Guardiões da Fortuna', 'Guardians of Fortune'],
    servants_of_the_flame: ['Serviçais da Chama', 'Servants of the Flame'],
  };

  function lines(text) {
    return String(text)
      .split(/\r?\n/)
      .map(function (l) { return l.trim(); })
      .filter(Boolean);
  }

  // "22.356.537" ou "22,356,537" -> 22356537; qualquer outra coisa -> null
  function toInt(s) {
    if (typeof s !== 'string' || !/^\d[\d.,]*$/.test(s)) return null;
    var n = Number(s.replace(/[.,]/g, ''));
    return Number.isSafeInteger(n) ? n : null;
  }

  // Valor exato das moedas: o atributo title do elemento (ex.: "22.356.537"). O numero visivel e animado.
  function parseCoinTitle(s) {
    var m = /^\s*(\d[\d.,]*\d|\d)/.exec(String(s || ''));
    return m ? toInt(m[1]) : null;
  }

  // Renome: inteiro de 0 a 1000 ou null.
  function parseRenown(s) {
    var m = /^\s*(\d{1,4})\s*$/.exec(String(s || ''));
    var n = m ? Number(m[1]) : null;
    return n !== null && n <= 1000 ? n : null;
  }

  // Titulo exibido no perfil: texto simples de ate 40 caracteres, ou null.
  function cleanTitle(s) {
    var t = String(s || '').replace(/\s+/g, ' ').trim();
    return /^[A-Za-z\u00C0-\u024F0-9][A-Za-z\u00C0-\u024F0-9 '\u2019:.,!-]{0,39}$/.test(t) ? t : null;
  }

  // Baú: o jogador clica nas categorias e paginas; a extensao so le o que esta na tela.
  // Cada pagina tem 20 itens (a ultima, menos). Basta ver a primeira e a ultima pagina de
  // cada categoria (filtro "Tudo"): total = (ultima - 1) * itens da primeira + itens da ultima.
  // Nao guarda nomes nem descricoes de itens, so numeros.
  var CHEST_CATEGORIES = [
    ['arsenal', /^Arsenal$/i],
    ['clothing', /^(Roupas|Clothing)$/i],
    ['equipment', /^(Equipamento|Equipment)$/i],
    ['pets', /^(Mascotes|Pets)$/i],
    ['ship_customization', /^(Personaliza[çc][ãa]o de Navio|Ship Customi[sz]ation)$/i],
    ['ship_decoration', /^(Decora[çc][ãa]o de Navio|Ship Decorations?)$/i],
    ['ship_trinkets', /^(Bugigangas de Navio|Ship Trinkets)$/i],
    ['ornamental', /^Ornamental$/i],
  ];

  function chestCategory(label) {
    var t = String(label || '').trim();
    for (var i = 0; i < CHEST_CATEGORIES.length; i++) if (CHEST_CATEGORIES[i][1].test(t)) return CHEST_CATEGORIES[i][0];
    return null;
  }

  function isAllFilter(label) { return /^(Tudo|Todos|All)$/i.test(String(label || '').trim()); }

  // reading: { category, sub, page, isLast, count }. Devolve o novo estado, ou null se nada mudou.
  function addChestPage(chest, reading) {
    var key = chestCategory(reading.category);
    if (!key || !isAllFilter(reading.sub)) return null;
    var n = reading.count, page = reading.page;
    if (!Number.isInteger(n) || n < 0 || n > 20 || !Number.isInteger(page) || page < 1 || page > 300) return null;
    var cur = (chest && chest[key]) || {};
    var next = { page1: cur.page1 === undefined ? null : cur.page1, last: cur.last === undefined ? null : cur.last, lastCount: cur.lastCount === undefined ? null : cur.lastCount };
    if (page === 1) next.page1 = n;
    if (reading.isLast) { next.last = page; next.lastCount = n; }
    else if (next.last !== null && page >= next.last) { next.last = null; next.lastCount = null; } // o bau cresceu: refaz a ultima pagina
    if (next.page1 === cur.page1 && next.last === cur.last && next.lastCount === cur.lastCount && chest && chest[key]) return null;
    var out = {};
    for (var k in chest || {}) out[k] = chest[k];
    out[key] = next;
    return out;
  }

  function chestTotal(c) {
    if (!c || c.last === null || c.lastCount === null) return null;
    if (c.last === 1) return c.lastCount;
    if (c.page1 === null) return null;
    var total = (c.last - 1) * c.page1 + c.lastCount;
    return total <= 5000 ? total : null;
  }

  // { categoria: quantidade } so das categorias completas.
  function chestCounts(chest) {
    var out = {};
    for (var i = 0; i < CHEST_CATEGORIES.length; i++) {
      var k = CHEST_CATEGORIES[i][0];
      var t = chest ? chestTotal(chest[k]) : null;
      if (t !== null) out[k] = t;
    }
    return out;
  }

  // Cabecalho comum a todas as paginas: gamertag, titulo, nivel, "x/y", ouro.
  function parseHeader(text) {
    var l = lines(text);
    for (var i = 3; i < l.length - 1; i++) {
      if (/^\d[\d.,]*\/\d[\d.,]*$/.test(l[i])) {
        var level = toInt(l[i - 1]);
        var gold = toInt(l[i + 1]);
        var gamertag = l[i - 3];
        if (level !== null && gold !== null && /^[A-Za-z0-9 #_]{1,15}$/.test(gamertag))
          return { gamertag: gamertag, level: level, gold: gold, goldIndex: i + 1 };
      }
    }
    return null;
  }

  // Capitania: os dois primeiros numeros soltos depois do cabecalho.
  function parseCaptaincy(text) {
    var h = parseHeader(text);
    if (!h) return null;
    var l = lines(text);
    var nums = [];
    for (var i = h.goldIndex + 1; i < l.length && nums.length < 2; i++) {
      var n = toInt(l[i]);
      if (n !== null) nums.push(n);
    }
    return nums.length === 2 ? { pirateGoals: nums[0], shipGoals: nums[1] } : null;
  }

  // Rotulos dos contadores "x/y" de cada companhia (portugues e ingles; outros idiomas sao ignorados).
  var COUNT_LABELS = [
    ['promotions', /^(Promo[çc][õo]es|Promotions)$/i],
    ['titles', /^(T[íi]tulos|Titles)$/i],
    ['commendations', /^(Condecora[çc][õo]es|Commendations)$/i],
    ['items', /^(Itens|Items)$/i],
    ['figureheads', /^(Figuras de Proa.*|Figureheads?.*)$/i],
  ];

  function countKey(line) {
    for (var i = 0; i < COUNT_LABELS.length; i++) if (COUNT_LABELS[i][1].test(line)) return COUNT_LABELS[i][0];
    return null;
  }

  // "34/42" -> [34, 42]
  function toPair(s) {
    var m = /^(\d[\d.,]*)\/(\d[\d.,]*)$/.exec(s);
    if (!m) return null;
    var a = toInt(m[1]), b = toInt(m[2]);
    return a !== null && b !== null && a <= b && b <= 5000 ? [a, b] : null;
  }

  // Contadores logo depois do nome da companhia: [titulo da companhia], depois pares rotulo + "x/y".
  // Para na primeira linha que nao e rotulo nem valor (ex.: nome de outra tripulacao).
  function readCounts(l, from) {
    var counts = {};
    var i = from;
    if (i < l.length && countKey(l[i]) === null && toPair(l[i]) === null) i++; // titulo da companhia
    while (i + 1 < l.length) {
      var key = countKey(l[i]);
      var pair = key ? toPair(l[i + 1]) : null;
      if (!key || !pair) break;
      if (!(key in counts)) counts[key] = pair;
      i += 2;
    }
    return counts;
  }

  // Reputacao: o nivel e o numero na linha imediatamente antes do nome da companhia.
  function parseReputation(text) {
    var l = lines(text);
    var found = {};
    for (var i = 1; i < l.length; i++) {
      for (var key in COMPANY_NAMES) {
        if (COMPANY_NAMES[key].indexOf(l[i]) !== -1) {
          var lv = toInt(l[i - 1]);
          if (lv !== null && lv <= 100 && !(key in found)) found[key] = { level: lv, counts: readCounts(l, i + 1) };
        }
      }
    }
    var out = [];
    for (var k in found) {
      var entry = { company: k, level: found[k].level };
      if (Object.keys(found[k].counts).length) entry.counts = found[k].counts;
      out.push(entry);
    }
    return out;
  }

  // Metas de Pirata por categoria (pagina /profile/captaincy/milestones): nome da categoria, depois o numero.
  var MILESTONES = [
    ['garimpeiro', 'Garimpeiro'], ['viajante', 'Viajante'], ['emissario', 'Emissário'], ['cacador', 'Caçador'], ['temido', 'Temido'],
    ['rebelde', 'Rebelde'], ['desaventurado', 'Desaventurado'], ['guardiao', 'Guardião'], ['servo', 'Servo'], ['capitao', 'Capitão'],
  ];
  function parseMilestones(text) {
    var l = lines(text);
    var out = {};
    var n = 0;
    MILESTONES.forEach(function (m) {
      for (var i = 0; i < l.length - 1; i++) {
        if (l[i] === m[1]) {
          var v = toInt(l[i + 1]);
          if (v !== null && v <= 20000) { out[m[0]] = v; n++; break; }
        }
      }
    });
    return n === MILESTONES.length ? out : null;
  }

  // Facoes (Guardioes da Fortuna e Servicais da Chama): rotulo e, na linha seguinte, o numero.
  var FACTION_LABELS = [
    ['shipsSunk', /^Total de Navios da Facção Rival Afundados$/i, 1000000],
    ['streak', /^Maior Sequência de Facção$/i, 10000],
    ['hourglass', /^Maior valor de Ampulheta Única recebido$/i, 50000000],
  ];
  function parseFaction(text) {
    var l = lines(text);
    var out = {};
    var n = 0;
    FACTION_LABELS.forEach(function (f) {
      for (var i = 0; i < l.length - 1; i++) {
        if (f[1].test(l[i])) {
          var v = toInt(l[i + 1]);
          if (v !== null && v <= f[2]) { out[f[0]] = v; n++; }
          break;
        }
      }
    });
    return n === FACTION_LABELS.length ? out : null;
  }

  // Tripulacao de Criadores: nome da condecoracao, depois "atual/meta" (so o atual interessa).
  var CREATOR = [['streamHours', 'Contista'], ['watchHours', 'Buscador de Contos'], ['viewers', 'Contador de Histórias Piratas']];
  function parseCreator(text) {
    var l = lines(text);
    var out = {};
    var n = 0;
    CREATOR.forEach(function (c) {
      for (var i = 0; i < l.length - 1; i++) {
        if (l[i] === c[1]) {
          var m = /^(\d[\d.,]*)\/\d[\d.,]*$/.exec(l[i + 1]);
          var v = m ? toInt(m[1]) : null;
          if (v !== null && v <= 100000) { out[c[0]] = v; n++; }
          break;
        }
      }
    });
    return n === CREATOR.length ? out : null;
  }

  // Condecoracoes de uma companhia: depois do filtro "Tudo", cada item tem "atual/meta".
  // Guarda so quantas estao completas, quantas existem e o progresso somado (cada item vale ate 1).
  // Nome curto do jogo (condecoracao ou item): so letras, numeros e pontuacao comum.
  var NAME_RE = /^[\p{L}\p{N} .,'’‘“”:;!?&()\-–—+/]+$/u;
  function cleanName(s) {
    s = String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
    return s.length >= 1 && s.length <= 60 && NAME_RE.test(s) ? s : null;
  }
  // Junta nomes novos a uma lista, sem repetir, ate o limite.
  function mergeNames(list, names, max) {
    var out = (list || []).slice();
    for (var i = 0; i < names.length; i++) {
      var n = cleanName(names[i]);
      if (n && out.indexOf(n) === -1 && out.length < max) out.push(n);
    }
    return out;
  }

  // Identificador opaco e estavel do nome (FNV-1a, 8 hex): permite comparar condecoracoes sem enviar o texto.
  function nameId(s) {
    var h = 0x811c9dc5;
    s = String(s).replace(/\s+/g, ' ').trim().toLowerCase();
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return ('00000000' + h.toString(16)).slice(-8);
  }
  var ROMAN = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10 };

  function parseCommendations(text) {
    var l = lines(text);
    var start = -1;
    for (var i = 0; i < l.length - 1; i++) {
      if (l[i] === 'Tudo' && /^Completo/.test(l[i + 1])) { start = i + 2; break; }
    }
    if (start < 0) return null;
    var done = 0, total = 0, progress = 0, names = [], detail = [];
    for (var j = start; j < l.length && l[j] !== 'VOLTAR'; j++) {
      var m = /^(\d{1,7})\/(\d{1,7})$/.exec(l[j]);
      if (!m) continue;
      var a = Number(m[1]), b = Number(m[2]);
      if (b < 1) continue;
      total++;
      // Contador e grau (o "Classe III - ..." da descricao, 0 se nao houver) de cada condecoracao, com id opaco do nome.
      if (j > 0 && detail.length < 60) {
        var desc = '';
        for (var d = j + 1; d < Math.min(j + 4, l.length); d++) { if (l[d] && !/^\d{1,7}\/\d{1,7}$/.test(l[d])) { desc = l[d]; break; } }
        var gm = /^Classe ([IVX]+)\b/.exec(desc);
        detail.push({ h: nameId(l[j - 1]), v: a, t: b, g: gm && ROMAN[gm[1]] ? ROMAN[gm[1]] : 0 });
      }
      if (a >= b) { done++; var nm = j > 0 ? cleanName(l[j - 1]) : null; if (nm && names.length < 200 && names.indexOf(nm) === -1) names.push(nm); }
      progress += Math.min(a, b) / b;
    }
    return total > 0 && total <= 500 ? { done: done, total: total, progress: Math.round(progress * 10) / 10, names: names, detail: detail } : null;
  }

  // opts (opt-in do jogador): { commendationNames: bool, chestNames: bool, achievements: bool }
  function buildSnapshot(parts, opts) {
    opts = opts || {};
    if (!parts || !parts.header || !parts.captaincy || !parts.reputation || !parts.reputation.length) return null;
    var snap = {
      version: 1,
      ancientCoins: parts.header.level, // Moedas Anciãs
      gold: parts.header.gold,
      pirateGoals: parts.captaincy.pirateGoals,
      shipGoals: parts.captaincy.shipGoals,
      reputation: parts.reputation,
    };
    if (parts.header.title) snap.title = parts.header.title;
    if (parts.seasons && typeof parts.seasons.renown === 'number') snap.renown = parts.seasons.renown;
    var chest = chestCounts(parts.chest);
    if (Object.keys(chest).length) snap.chest = chest;
    var extras = {};
    if (parts.milestones) extras.milestones = parts.milestones;
    if (parts.factions && Object.keys(parts.factions).length) extras.factions = parts.factions;
    if (parts.creator) extras.creator = parts.creator;
    if (parts.commendations && Object.keys(parts.commendations).length) {
      extras.commendations = {};
      var cnames = {};
      Object.keys(parts.commendations).forEach(function (k) {
        var c = parts.commendations[k];
        extras.commendations[k] = { done: c.done, total: c.total, progress: c.progress };
        if (c.detail && c.detail.length) (extras.commendationDetail = extras.commendationDetail || {})[k] = c.detail;
        if (opts.commendationNames && c.names && c.names.length) cnames[k] = c.names;
      });
      if (Object.keys(cnames).length) extras.commendationNames = cnames;
    }
    if (opts.chestNames && parts.chestNames && Object.keys(parts.chestNames).length) {
      extras.chestItems = parts.chestNames;
      if (parts.chestTitles && parts.chestTitles.length) extras.chestTitles = parts.chestTitles;
      if (parts.chestComplete === true) extras.chestComplete = true; // lista inteira lida pela API: habilita o "Nao tem"
    }
    if (opts.achievements && parts.achievements && parts.achievements.total > 0) {
      extras.achievements = parts.achievements.ids;
      extras.achievementsTotal = parts.achievements.total;
    }
    if (Object.keys(extras).length) snap.extras = extras;
    return snap;
  }

  var api = {
    parseHeader: parseHeader,
    parseCoinTitle: parseCoinTitle,
    parseMilestones: parseMilestones,
    parseFaction: parseFaction,
    parseCreator: parseCreator,
    parseCommendations: parseCommendations,
    parseRenown: parseRenown,
    cleanTitle: cleanTitle,
    chestCategory: chestCategory,
    addChestPage: addChestPage,
    chestCounts: chestCounts,
    cleanName: cleanName,
    nameId: nameId,
    mergeNames: mergeNames,
    chestTotal: chestTotal,
    CHEST_KEYS: CHEST_CATEGORIES.map(function (c) { return c[0]; }),
    parseCaptaincy: parseCaptaincy,
    parseReputation: parseReputation,
    buildSnapshot: buildSnapshot,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PBParse = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
