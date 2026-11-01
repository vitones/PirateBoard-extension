// Roda so nas paginas do perfil que o proprio jogador abriu. Le o texto visivel
// e o valor exato das moedas (atributo title),
// guarda so numeros localmente e nao faz nenhuma requisicao de rede.
// O site do jogo troca de aba sem recarregar a pagina; por isso o endereco e
// observado e a leitura recomeca a cada mudanca.
(function () {
  if (typeof PBParse === 'undefined') return;

  var timer = null;
  var current = null;

  var COMPANY_PATHS = {
    GoldHoarders: 'gold_hoarders', MerchantAlliance: 'merchant_alliance', OrderOfSouls: 'order_of_souls',
    AthenasFortune: 'athenas_fortune', ReapersBones: 'reapers_bones',
  };
  var FACTION_PATHS = { PirateLord: 'guardians_of_fortune', Flameheart: 'servants_of_the_flame' };
  function lastSegment(path) { var m = /\/profile\/reputation\/([A-Za-z]+)\/?$/.exec(path); return m ? m[1] : null; }
  function companyOf(path) { var s = lastSegment(path); return s && COMPANY_PATHS[s] ? COMPANY_PATHS[s] : null; }

  function kindOf(path) {
    if (/\/profile\/captaincy\/?$/.test(path)) return 'captaincy';
    if (/\/profile\/captaincy\/milestones\/?$/.test(path)) return 'milestones'; // so a lista; os detalhes de cada meta nao sao lidos
    if (/\/profile\/reputation\/?$/.test(path)) return 'reputation';
    if (/\/profile\/reputation\/(PirateLord|Flameheart)\/?$/.test(path)) return 'faction';
    if (/\/profile\/reputation\/CreatorCrew\/?$/.test(path)) return 'creator';
    if (companyOf(path)) return 'company';
    if (/\/profile\/overview/.test(path)) return 'overview';
    if (/\/profile\/seasons/.test(path)) return 'seasons';
    if (/\/profile\/your-chest/.test(path)) return 'chest';
    return null;
  }

  function save(kind, header, value) {
    if (!chrome.runtime || !chrome.runtime.id) return;
    chrome.storage.local.get('parts', function (res) {
      var parts = res.parts || {};
      // Outra conta: descarta o que foi lido antes. Valores exatos (title) valem como vieram:
      // Moedas Anciãs e ouro tambem diminuem. Sem eles, o texto visivel e animado e pode vir
      // parcial, entao vale o maior dos valores lidos.
      if (parts.header && parts.header.gamertag !== header.gamertag) parts = {};
      if (parts.header && !header.exact) {
        header.level = Math.max(header.level, parts.header.level);
        header.gold = Math.max(header.gold, parts.header.gold);
      }
      parts.header = header;
      if (kind === 'captaincy') parts.captaincy = value;
      if (kind === 'reputation') parts.reputation = value;
      if (kind === 'milestones') parts.milestones = value;
      if (kind === 'creator') parts.creator = value;
      if (kind === 'faction') (parts.factions = parts.factions || {})[FACTION_PATHS[lastSegment(location.pathname)]] = value;
      if (kind === 'company') (parts.commendations = parts.commendations || {})[companyOf(location.pathname)] = value;
      if (kind === 'seasons') parts.seasons = { renown: value };
      parts.readAt = Date.now();
      chrome.storage.local.set({ parts: parts });
    });
  }

  function attr(sel) {
    var e = document.querySelector(sel);
    if (!e) return null;
    var t = e.getAttribute('title');
    if (!t) { var c = e.querySelector('[title]'); t = c ? c.getAttribute('title') : null; }
    return t;
  }

  function textOf(sel) {
    var e = document.querySelector(sel);
    return e ? e.textContent : null;
  }

  function read(kind, tries) {
    if (kindOf(location.pathname) !== kind) return; // o jogador ja saiu desta aba
    var text = document.body ? document.body.innerText : '';
    var header = PBParse.parseHeader(text);
    var coins = PBParse.parseCoinTitle(attr('.pirate-balance__currency--ancient-coins'));
    var gold = PBParse.parseCoinTitle(attr('.pirate-balance__currency--gold'));
    var exact = coins !== null && gold !== null;
    if (header && !exact && tries < 8) header = null; // espera os valores exatos antes de aceitar o texto animado
    if (header) {
      if (exact) { header.level = coins; header.gold = gold; }
      header.exact = exact;
      var title = PBParse.cleanTitle(textOf('.pirate-balance__title'));
      if (title) header.title = title;
    }
    var value = null;
    if (header) {
      if (kind === 'chest') value = true;
      else if (kind === 'seasons') value = PBParse.parseRenown(textOf('.profiles-seasons-track__renown-meter__level-text'));
      else if (kind === 'captaincy') value = PBParse.parseCaptaincy(text);
      else if (kind === 'milestones') value = PBParse.parseMilestones(text);
      else if (kind === 'faction') value = PBParse.parseFaction(text);
      else if (kind === 'creator') value = PBParse.parseCreator(text);
      else if (kind === 'company') value = PBParse.parseCommendations(text);
      else if (kind === 'reputation') {
        var rep = PBParse.parseReputation(text);
        value = rep.length ? rep : null;
      } else value = true;
    }
    if (value !== null) save(kind, header, value);
    else if (tries < 20) timer = setTimeout(function () { read(kind, tries + 1); }, 750); // a pagina carrega os dados depois de abrir
  }

  // Baú: acompanha o que o jogador abre (categoria, pagina). Nao clica em nada.
  var lastSig = '';
  function pollChest() {
    var rows = document.querySelectorAll('.filter-buttons');
    if (rows.length < 2) return;
    function active(row) { var b = row.querySelector('.filter-button--active'); return b ? b.textContent : null; }
    var items = document.querySelectorAll('.profile-grid__item-inner').length;
    var pag = document.querySelector('.pagination');
    var page = 1, isLast = true;
    if (pag) {
      var cur = pag.querySelector('.pagination-item--active');
      page = cur ? Number(cur.textContent.trim()) : 0;
      var next = pag.querySelector('.pagination__next-button');
      isLast = !!next && next.hasAttribute('disabled');
    }
    var reading = { category: active(rows[0]), sub: active(rows[1]), page: page, isLast: isLast, count: items };
    var sig = [reading.category, reading.sub, page, isLast, items].join('|');
    if (sig === lastSig || !items) return;
    lastSig = sig;
    if (!chrome.runtime || !chrome.runtime.id) return;
    chrome.storage.local.get('parts', function (res) {
      var parts = res.parts || {};
      var next2 = PBParse.addChestPage(parts.chest, reading);
      if (!next2) return;
      parts.chest = next2;
      parts.readAt = Date.now();
      chrome.storage.local.set({ parts: parts });
    });
  }

  function check() {
    var key = location.pathname;
    if (key === current) return;
    current = key;
    clearTimeout(timer);
    var kind = kindOf(key);
    if (kind) read(kind, 0);
  }

  // Depois que a extensao e recarregada, este script antigo fica orfao na pagina:
  // chrome.runtime.id some e qualquer chamada a chrome.storage lanca erro. Para de vez.
  var interval = setInterval(function () {
    try {
      if (!chrome.runtime || !chrome.runtime.id) throw new Error('orfao');
      check();
      if (kindOf(location.pathname) === 'chest') pollChest();
    } catch (e) {
      clearInterval(interval);
      clearTimeout(timer);
    }
  }, 500);
  check();
})();
