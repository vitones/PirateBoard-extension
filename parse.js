// Leitura do texto VISIVEL das paginas do perfil (docs/formato-do-perfil.md).
// Funcoes puras: recebem o texto da pagina e devolvem so numeros e chaves.
// Nunca le cookie, storage da pagina, rede nem itens do bau.
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

  // Reputacao: o nivel e o numero na linha imediatamente antes do nome da companhia.
  function parseReputation(text) {
    var l = lines(text);
    var found = {};
    for (var i = 1; i < l.length; i++) {
      for (var key in COMPANY_NAMES) {
        if (COMPANY_NAMES[key].indexOf(l[i]) !== -1) {
          var lv = toInt(l[i - 1]);
          if (lv !== null && lv <= 100 && !(key in found)) found[key] = lv;
        }
      }
    }
    var out = [];
    for (var k in found) out.push({ company: k, level: found[k] });
    return out;
  }

  function buildSnapshot(parts) {
    if (!parts || !parts.header || !parts.captaincy || !parts.reputation || !parts.reputation.length) return null;
    return {
      version: 1,
      level: parts.header.level,
      gold: parts.header.gold,
      pirateGoals: parts.captaincy.pirateGoals,
      shipGoals: parts.captaincy.shipGoals,
      reputation: parts.reputation,
    };
  }

  var api = {
    parseHeader: parseHeader,
    parseCaptaincy: parseCaptaincy,
    parseReputation: parseReputation,
    buildSnapshot: buildSnapshot,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PBParse = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
