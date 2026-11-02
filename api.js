// Leitor opcional pela API do site (docs/api-perfil-sot.md). Codigo original, fixo na extensao.
// Le so os 4 endpoints do perfil da propria pessoa, em sequencia, e devolve o mesmo formato
// de "parts" que o leitor de texto usa. Nunca le guildas, nomes de navios nem textos livres.
// mapApi e pura (testavel); readAll recebe o fetch para poder ser testada sem rede.
(function (root) {
  // No navegador, parse.js ja carregou e deixou PBParse global; em testes o PBParse e posto no global antes.
  function P() { return root.PBParse; }

  var BASE = 'https://www.seaofthieves.com/api/profilev2/';
  var ENDPOINTS = ['balance', 'reputation', 'captaincy', 'chest'];

  var COMPANIES = {
    GoldHoarders: 'gold_hoarders', MerchantAlliance: 'merchant_alliance', OrderOfSouls: 'order_of_souls',
    AthenasFortune: 'athenas_fortune', ReapersBones: 'reapers_bones', HuntersCall: 'hunters_call',
  };
  var COMMENDATIONS = {
    GoldHoarders: 'gold_hoarders', MerchantAlliance: 'merchant_alliance', OrderOfSouls: 'order_of_souls',
    AthenasFortune: 'athenas_fortune', ReapersBones: 'reapers_bones', PirateLord: 'guardians_of_fortune', Flameheart: 'servants_of_the_flame',
  };
  var MILESTONES = {
    'The Gold Seeker': 'garimpeiro', 'The Voyager': 'viajante', 'The Emissary': 'emissario', 'The Hunter': 'cacador', 'The Feared': 'temido',
    'The Rogue': 'rebelde', 'The Ill-Fated': 'desaventurado', 'The Guardian': 'guardiao', 'The Servant': 'servo', 'The Captain': 'capitao',
  };
  var CREATOR = { 'Tale Whisperer': 'streamHours', 'Seeker of Tales': 'watchHours', 'Pirate Storyteller': 'viewers' };
  var CHEST = {
    Armory: 'arsenal', Clothing: 'clothing', Equipment: 'equipment', Pets: 'pets', Ship: 'ship_customization',
    ShipDecoration: 'ship_decoration', ShipTrinket: 'ship_trinkets', Vanity: 'ornamental',
  };

  function num(v, max) { return typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= max ? v : null; }
  function pair(a, b) { a = num(a, 5000); b = num(b, 5000); return a !== null && b !== null && a <= b ? [a, b] : null; }
  function isObj(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }
  function sum(list) { var s = 0; for (var i = 0; i < list.length; i++) s += list[i]; return s; }

  function milestonesOf(captaincy) {
    var al = captaincy && captaincy.Pirate && captaincy.Pirate.Alignments;
    if (!Array.isArray(al)) return null;
    var out = {}, n = 0;
    al.forEach(function (a) {
      var k = a && MILESTONES[a.Title];
      var v = a ? num(a.MilestoneSum, 20000) : null;
      if (k && v !== null && !(k in out)) { out[k] = v; n++; }
    });
    return n === 10 ? out : null;
  }

  // Soma das metas de todos os navios (shipGoals) e de cada tipo de navio, na ordem da API.
  function shipGoalsOf(captaincy) {
    var ships = captaincy && captaincy.Ships;
    if (!Array.isArray(ships) || !ships.length) return null;
    var per = [];
    for (var i = 0; i < ships.length; i++) {
      var al = ships[i] && ships[i].Alignments;
      if (!Array.isArray(al)) return null;
      var vals = al.map(function (a) { return a ? num(a.MilestoneSum, 20000) : null; });
      if (vals.some(function (v) { return v === null; })) return null;
      per.push(sum(vals));
    }
    return per;
  }

  function reputationOf(rep) {
    var out = [];
    Object.keys(COMPANIES).forEach(function (api) {
      var c = rep[api];
      if (!isObj(c)) return;
      var lvl = num(c.Level, 100000), dist = num(c.DistinctionLevel, 100);
      if (lvl === null) return;
      // A pagina mostra o nivel dentro da distincao: Level - 100 * DistinctionLevel (ex.: 255 e distincao 2 = 55).
      var shown = lvl - 100 * (dist || 0);
      if (shown < 0 || shown > 100) return;
      var counts = {};
      var p = pair(c.PromotionsUnlocked, c.PromotionsTotal); if (p) counts.promotions = p;
      var t = pair(c.TitlesUnlocked, c.TitlesTotal); if (t) counts.titles = t;
      var e = pair(c.EmblemsUnlocked, c.EmblemsTotal); if (e) counts.commendations = e;
      var it = pair(c.ItemsUnlocked, c.ItemsTotal); if (it) counts.items = it;
      var entry = { company: COMPANIES[api], level: shown };
      if (dist > 0) entry.distinction = dist;
      if (Object.keys(counts).length) entry.counts = counts;
      out.push(entry);
    });
    return out;
  }

  // Condecoracoes de uma companhia ou faccao: concluidas (Completed), total, progresso somado e
  // detalhe {h,v,t,g} so das que tem contador. Os nomes da API vem em ingles, estaveis entre idiomas.
  function commendationsOf(group) {
    var list = group && group.Emblems && group.Emblems.Emblems;
    if (!Array.isArray(list) || !list.length) return null;
    var done = 0, progress = 0, detail = [];
    list.forEach(function (e) {
      if (!isObj(e)) return;
      var completed = e.Completed === true;
      if (completed) done++;
      var t = num(e.Threshold, 1e9), v = num(e.Value, 1e9);
      if (e.HasScalar === true && t !== null && t > 0 && v !== null) {
        progress += Math.min(1, v / t);
        if (detail.length < 60 && typeof e.DisplayName === 'string') {
          var g = num(e.Grade, 10);
          detail.push({ h: P().nameId(e.DisplayName), v: v, t: t, g: g === null ? 0 : g });
        }
      } else if (completed) progress += 1;
    });
    return { done: done, total: list.length, progress: Math.round(progress * 10) / 10, names: [], detail: detail };
  }

  function creatorOf(group) {
    var list = group && group.Emblems && group.Emblems.Emblems;
    if (!Array.isArray(list)) return null;
    var out = {}, n = 0;
    list.forEach(function (e) {
      var k = e && CREATOR[e.DisplayName];
      var v = e ? num(e.Value, 100000) : null;
      if (k && v !== null && !(k in out)) { out[k] = v; n++; }
    });
    return n === 3 ? out : null;
  }

  // O Bau chega com a lista inteira: o total de cada categoria e o tamanho da lista.
  // Monta o mesmo estado de paginacao do leitor de texto (20 itens por pagina).
  function chestOf(chest) {
    var data = chest && chest.chestData;
    if (!isObj(data)) return null;
    var out = {}, n = 0;
    Object.keys(CHEST).forEach(function (api) {
      var list = data[api];
      if (!Array.isArray(list) || list.length > 5000) return;
      var total = list.length;
      if (total === 0) { out[CHEST[api]] = { page1: 0, last: 1, lastCount: 0 }; n++; return; }
      var last = Math.ceil(total / 20);
      out[CHEST[api]] = { page1: Math.min(total, 20), last: last, lastCount: total - (last - 1) * 20 };
      n++;
    });
    return n ? out : null;
  }

  // data: { balance, reputation, captaincy, chest } (JSON das respostas). gamertag vem da pagina aberta.
  // Devolve { parts, missing } onde missing lista o que nao foi reconhecido.
  function mapApi(data, gamertag) {
    var missing = [];
    var bal = data && data.balance, parts = {};
    var coins = isObj(bal) ? num(bal.ancientCoins, 1e9) : null, gold = isObj(bal) ? num(bal.gold, 1e12) : null;
    if (!/^[A-Za-z0-9 #_]{1,15}$/.test(String(gamertag || '')) || coins === null || gold === null) {
      return { parts: null, missing: ['header'] };
    }
    parts.header = { gamertag: gamertag, level: coins, gold: gold, exact: true };
    var title = isObj(bal) ? P().cleanTitle(bal.title) : null;
    if (title) parts.header.title = title;

    var cap = data.captaincy;
    var ms = milestonesOf(cap), ships = shipGoalsOf(cap);
    if (ms && ships) {
      parts.captaincy = { pirateGoals: sum(Object.keys(ms).map(function (k) { return ms[k]; })), shipGoals: sum(ships) };
      parts.milestones = ms;
    } else missing.push('captaincy');

    var rep = isObj(data.reputation) ? data.reputation : null;
    var repList = rep ? reputationOf(rep) : [];
    if (repList.length) parts.reputation = repList; else missing.push('reputation');

    if (rep) {
      var comm = {}, any = false;
      Object.keys(COMMENDATIONS).forEach(function (api) {
        var c = commendationsOf(rep[api]);
        if (c) { comm[COMMENDATIONS[api]] = c; any = true; }
      });
      if (any) parts.commendations = comm;
      var cr = creatorOf(rep.CreatorCrew);
      if (cr) parts.creator = cr;
    }

    var chest = chestOf(data.chest);
    if (chest) parts.chest = chest; else missing.push('chest');

    parts.src = 'api';
    parts.readAt = Date.now();
    return { parts: parts, missing: missing };
  }

  // Teto de tamanho da resposta (T-API-2): recusa antes de interpretar; o endpoint vira 'formato'.
  var MAX_BYTES = 1000000;
  async function readJson(res) {
    var declared = Number(res.headers && res.headers.get && res.headers.get('content-length'));
    if (declared > MAX_BYTES) throw new Error('grande');
    if (typeof res.text !== 'function') return res.json();
    var txt = await res.text();
    if (txt.length > MAX_BYTES) throw new Error('grande');
    return JSON.parse(txt);
  }

  function delay(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  // Le os 4 endpoints em sequencia, sem paralelismo. Para na primeira recusa (401/403/429);
  // falha de rede ou formato em um endpoint so o marca em `failed` e segue com os outros.
  // Devolve { data, error, failed } com error em { 'sessao' | 'limite' | 'rede' | 'formato' } ou null.
  async function readAll(fetchFn, opts) {
    opts = opts || {};
    var pause = opts.pause === undefined ? function () { return 700 + Math.floor(Math.random() * 500); } : opts.pause;
    var data = {}, failed = [], first = null;
    var step = typeof opts.onStep === 'function' ? opts.onStep : function () {};
    // Parada antes do fim (sessao/limite): marca o endpoint atual e os que faltavam como nao lidos.
    function stopAt(from) { for (var j = from; j < ENDPOINTS.length; j++) step(ENDPOINTS[j], 'erro'); }
    for (var i = 0; i < ENDPOINTS.length; i++) {
      if (i > 0) await delay(pause());
      step(ENDPOINTS[i], 'lendo');
      var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, opts.timeout || 25000) : null;
      var res;
      try {
        res = await fetchFn(BASE + ENDPOINTS[i], {
          credentials: 'include', cache: 'no-store', signal: ctrl ? ctrl.signal : undefined,
          headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        });
      } catch (e) {
        failed.push(ENDPOINTS[i]); step(ENDPOINTS[i], 'erro'); first = first || 'rede'; continue;
      } finally { if (timer) clearTimeout(timer); }
      if (res.status === 401 || res.status === 403) { stopAt(i); return { data: data, error: 'sessao' }; }
      if (res.status === 429) { stopAt(i); return { data: data, error: 'limite' }; }
      if (!res.ok) { failed.push(ENDPOINTS[i]); step(ENDPOINTS[i], 'erro'); first = first || 'rede'; continue; }
      try { data[ENDPOINTS[i]] = await readJson(res); step(ENDPOINTS[i], 'ok'); } catch (e) { failed.push(ENDPOINTS[i]); step(ENDPOINTS[i], 'erro'); first = first || 'formato'; }
    }
    // So falha de vez se nada foi lido; senao devolve o que veio e a lista do que faltou.
    return { data: data, error: failed.length === ENDPOINTS.length ? first : null, failed: failed };
  }

  var api = { mapApi: mapApi, readAll: readAll, ENDPOINTS: ENDPOINTS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PBApi = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
