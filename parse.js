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

  function buildSnapshot(parts) {
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
    return snap;
  }

  var api = {
    parseHeader: parseHeader,
    parseCoinTitle: parseCoinTitle,
    parseRenown: parseRenown,
    cleanTitle: cleanTitle,
    chestCategory: chestCategory,
    addChestPage: addChestPage,
    chestCounts: chestCounts,
    chestTotal: chestTotal,
    CHEST_KEYS: CHEST_CATEGORIES.map(function (c) { return c[0]; }),
    parseCaptaincy: parseCaptaincy,
    parseReputation: parseReputation,
    buildSnapshot: buildSnapshot,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PBParse = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
