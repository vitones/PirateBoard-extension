// Roda so nas paginas do perfil que o proprio jogador abriu. Le o texto visivel,
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
    return null;
  }

  function save(kind, header, value) {
    if (!chrome.runtime || !chrome.runtime.id) return;
    chrome.storage.local.get('parts', function (res) {
      var parts = res.parts || {};
      // Outra conta: descarta o que foi lido antes. Mesma conta: nivel e ouro so
      // crescem, entao vale o maior (o cabecalho pode vir atrasado em alguma pagina).
      if (parts.header && parts.header.gamertag !== header.gamertag) parts = {};
      if (parts.header) {
        header.level = Math.max(header.level, parts.header.level);
        header.gold = Math.max(header.gold, parts.header.gold);
      }
      parts.header = header;
      if (kind === 'captaincy') parts.captaincy = value;
      if (kind === 'reputation') parts.reputation = value;
      parts.readAt = Date.now();
      chrome.storage.local.set({ parts: parts });
    });
  }

  function read(kind, tries) {
    if (kindOf(location.pathname) !== kind) return; // o jogador ja saiu desta aba
    var text = document.body ? document.body.innerText : '';
    var header = PBParse.parseHeader(text);
    var value = null;
    if (header) {
      if (kind === 'captaincy') value = PBParse.parseCaptaincy(text);
      else if (kind === 'reputation') {
        var rep = PBParse.parseReputation(text);
        value = rep.length ? rep : null;
      } else value = true;
    }
    if (value) save(kind, header, value);
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
