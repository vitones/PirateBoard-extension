// Roda so nas paginas do perfil que o proprio jogador abriu. Le o texto visivel
// e o valor exato das moedas (atributo title),
// guarda so numeros localmente e nao faz nenhuma requisicao de rede.
// O site do jogo troca de aba sem recarregar a pagina; por isso o endereco e
// observado e a leitura recomeca a cada mudanca.
(function () {
  if (typeof PBParse === 'undefined') return;

  var timer = null;
  var current = null;

  function kindOf(path) {
    if (/\/profile\/captaincy/.test(path)) return 'captaincy';
    if (/\/profile\/reputation/.test(path)) return 'reputation';
    if (/\/profile\/overview/.test(path)) return 'overview';
    if (/\/profile\/seasons/.test(path)) return 'seasons';
    return null;
  }

  function save(kind, header, value) {
    if (!chrome.runtime || !chrome.runtime.id) return;
    chrome.storage.local.get('parts', function (res) {
      var parts = res.parts || {};
      // Outra conta: descarta o que foi lido antes. Valores exatos (title) valem como vieram:
      // Moedas Antigas e ouro tambem diminuem. Sem eles, o texto visivel e animado e pode vir
      // parcial, entao vale o maior dos valores lidos.
      if (parts.header && parts.header.gamertag !== header.gamertag) parts = {};
      if (parts.header && !header.exact) {
        header.level = Math.max(header.level, parts.header.level);
        header.gold = Math.max(header.gold, parts.header.gold);
      }
      parts.header = header;
      if (kind === 'captaincy') parts.captaincy = value;
      if (kind === 'reputation') parts.reputation = value;
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
      if (kind === 'seasons') value = PBParse.parseRenown(textOf('.profiles-seasons-track__renown-meter__level-text'));
      else if (kind === 'captaincy') value = PBParse.parseCaptaincy(text);
      else if (kind === 'reputation') {
        var rep = PBParse.parseReputation(text);
        value = rep.length ? rep : null;
      } else value = true;
    }
    if (value !== null) save(kind, header, value);
    else if (tries < 20) timer = setTimeout(function () { read(kind, tries + 1); }, 750); // a pagina carrega os dados depois de abrir
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
    } catch (e) {
      clearInterval(interval);
      clearTimeout(timer);
    }
  }, 500);
  check();
})();
