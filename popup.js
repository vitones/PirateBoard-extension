// Endereco da API: producao na Cloudflare (ver host_permissions no manifest). Para testar localmente, troque pela porta do wrangler dev e nao publique assim.
var API = 'https://pirateboard.veetones.workers.dev';
var snapshot = null;
var sync = null; // progresso da leitura pela API (gravado pela pagina do jogo)

// Todos os paises; o padrao e o pais do idioma do navegador (ex.: pt-BR -> BR), se existir.
(function () {
  var sel = document.getElementById('country');
  var none = document.createElement('option'); none.value = ''; none.textContent = T('Escolha o país'); sel.appendChild(none);
  window.fillCountries(sel);
  var m = /-([A-Za-z]{2})$/.exec(navigator.language || '');
  if (m && window.COUNTRY_CODES.indexOf(m[1].toUpperCase()) !== -1) sel.value = m[1].toUpperCase();
})();
var gamertag = null;
var sending = false;

function $(id) { return document.getElementById(id); }

function say(msg, kind) {
  $('status').textContent = msg;
  $('status').className = kind || '';
}

window.addEventListener('error', function (e) { say('Erro: ' + e.message, 'err'); });

function fmt(n) { return Number(n).toLocaleString(LOCALE); }

var COMPANY_LABEL = {
  gold_hoarders: 'Acumuladores de Ouro', merchant_alliance: 'Aliança Mercante', order_of_souls: 'Ordem das Almas',
  athenas_fortune: 'Fortuna de Atena', reapers_bones: 'Ossos do Ceifador', hunters_call: 'Chamado da Caça',
  guardians_of_fortune: 'Guardiões da Fortuna', servants_of_the_flame: 'Serviçais da Chama',
};

function row(dl, label, value) {
  var dt = document.createElement('dt'); dt.textContent = label;
  var dd = document.createElement('dd'); dd.textContent = value;
  dl.appendChild(dt); dl.appendChild(dd);
}

var lastParts = null;
function opts() { return { commendationNames: $('opt-comm').checked, chestNames: $('opt-chest').checked }; }

function render(parts) {
  lastParts = parts;
  snapshot = PBParse.buildSnapshot(parts, opts());
  gamertag = parts.header ? parts.header.gamertag : null;
  $('who').textContent = gamertag ? gamertag + (parts.header.title ? ' · ' + parts.header.title : '') : '';
  document.querySelectorAll('#steps li').forEach(function (li) {
    li.classList.toggle('done', !!parts[li.getAttribute('data-key')]);
  });

  $('review').hidden = !snapshot;
  $('review').classList.toggle('api-mode', !!(sync && sync.state === 'fim' && !sync.error));
  $('hint').hidden = !!snapshot;
  if (snapshot) {
    var stats = $('stats');
    stats.textContent = '';
    [[T('Moedas Anciãs'), snapshot.ancientCoins], [T('Ouro'), snapshot.gold], ['Metas de Pirata', snapshot.pirateGoals], [T('Metas de Navio'), snapshot.shipGoals]]
      .concat(snapshot.renown != null ? [[T('Renome'), snapshot.renown]] : [])
      .forEach(function (s) {
        var d = document.createElement('div'); d.className = 'stat';
        var b = document.createElement('b'); b.textContent = fmt(s[1]);
        var l = document.createElement('span'); l.textContent = s[0];
        d.appendChild(b); d.appendChild(l); stats.appendChild(d);
      });
    var dl = $('companies');
    dl.textContent = '';
    var COUNT_LABEL = { promotions: 'Promoções', titles: 'Títulos', commendations: 'Condecorações', items: 'Itens', figureheads: 'Figuras de Proa' };
    snapshot.reputation.forEach(function (r) {
      var extra = Object.keys(COUNT_LABEL).filter(function (k) { return r.counts && r.counts[k]; })
        .map(function (k) { return T(COUNT_LABEL[k]) + ' ' + r.counts[k][0] + '/' + r.counts[k][1]; }).join(' · ');
      row(dl, T(COMPANY_LABEL[r.company] || r.company), T('nível') + ' ' + r.level + (extra ? ' · ' + extra : ''));
    });
    $('companies-label').textContent = T('Reputação em ') + snapshot.reputation.length + T(' companhias');
    $('preview').textContent = JSON.stringify(snapshot, null, 2);
  }
  renderChest(parts);
  syncToken();
}

var CHEST_LABEL = {
  arsenal: 'Arsenal', clothing: 'Roupas', equipment: 'Equipamento', pets: 'Mascotes',
  ship_customization: 'Personalização de Navio', ship_decoration: 'Decoração de Navio',
  ship_trinkets: 'Bugigangas de Navio', ornamental: 'Ornamental',
};

// Baú: mostra o que ja foi lido e o que falta abrir (primeira e ultima pagina de cada categoria, filtro Tudo).
function renderChest(parts) {
  var dl = $('chest-list');
  dl.textContent = '';
  var any = false, done = 0;
  PBParse.CHEST_KEYS.forEach(function (k) {
    var c = parts.chest && parts.chest[k];
    if (!c) return;
    any = true;
    var total = PBParse.chestTotal(c);
    if (total !== null) done++;
    row(dl, T(CHEST_LABEL[k]), total !== null ? total + ' ' + T('itens') : T('abra a primeira e a última página (filtro Tudo)'));
  });
  $('chest-label').textContent = T('Baú') + (any ? ': ' + done + ' ' + T('categorias completas') : ' ' + T('(opcional: abra as categorias)'));
  $('chest-label').parentElement.hidden = !parts.chest && !snapshot;
}

var hasToken = false;

function update() {
  var needInvite = !hasToken && !$('invite').value.trim();
  $('send').disabled = sending || !(snapshot && $('terms').checked && $('country').value) || needInvite;
  $('invite').hidden = !snapshot;
  $('invites').hidden = !hasToken;
}

function syncToken() {
  chrome.storage.local.get('tokens', function (res) {
    hasToken = !!(gamertag && (res.tokens || {})[gamertag]);
    update();
  });
}

function refresh() {
  if (typeof PBParse === 'undefined' || !chrome.storage) {
    say(T('Erro: extensão incompleta. Recarregue em opera://extensions.'), 'err');
    return;
  }
  chrome.storage.local.get('parts', function (res) { render(res.parts || {}); });
}

document.querySelectorAll('#steps a, .legal a').forEach(function (a) {
  a.addEventListener('click', function (e) {
    e.preventDefault();
    chrome.tabs.create({ url: a.getAttribute('data-url') });
  });
});

$('changelog').addEventListener('click', function (e) {
  e.preventDefault();
  chrome.tabs.create({ url: this.getAttribute('data-url') });
});

$('terms').addEventListener('change', update);
$('invite').addEventListener('input', update);
$('clear').addEventListener('click', function () {
  chrome.storage.local.remove(['parts', 'apiProgress'], function () { sync = null; renderSync(); refresh(); });
});

// Reflete leituras novas enquanto o popup esta aberto.
chrome.storage.onChanged.addListener(function (changes) {
  if (changes.apiProgress) { sync = changes.apiProgress.newValue || null; renderSync(); }
  if (changes.parts) refresh();
});

// Barra e lista da sincronizacao: verde = sincronizado, vermelho = erro. Estado em texto e icone, nao so em cor.
var SYNC_LABEL = { balance: 'Saldo', reputation: 'Reputação', captaincy: 'Capitania e metas', chest: 'Baú' };
var SYNC_STATE = { espera: ['wait', '\u2022', 'Aguardando'], lendo: ['run', '\u21BB', 'Sincronizando'], ok: ['ok', '\u2713', 'Sincronizado'], erro: ['err', '\u2715', 'Erro'] };
function renderSync() {
  var box = $('sync');
  if (!sync || !sync.items) { box.hidden = true; $('review').classList.remove('api-mode'); return; }
  var keys = Object.keys(SYNC_LABEL), ok = 0, bad = 0;
  var list = $('sync-list');
  list.textContent = '';
  keys.forEach(function (k) {
    var s = SYNC_STATE[sync.items[k]] || SYNC_STATE.espera;
    if (sync.items[k] === 'ok') ok++;
    if (sync.items[k] === 'erro') bad++;
    var li = document.createElement('li'); li.className = s[0];
    var ic = document.createElement('span'); ic.setAttribute('aria-hidden', 'true'); ic.textContent = s[1];
    var nm = document.createElement('span'); nm.textContent = T(SYNC_LABEL[k]);
    var st = document.createElement('span'); st.textContent = T(s[2]);
    li.appendChild(ic); li.appendChild(nm); li.appendChild(st);
    list.appendChild(li);
  });
  var pct = Math.round(((ok + bad) / keys.length) * 100);
  $('bar-fill').style.width = pct + '%';
  $('bar-fill').className = bad ? 'has-err' : '';
  box.querySelector('.bar').setAttribute('aria-valuenow', String(pct));
  $('sync-summary').textContent = ok + ' ' + T('de') + ' ' + keys.length + ' ' + T('sincronizados') + (bad ? ' · ' + bad + ' ' + T('com erro') : '');
  box.hidden = false;
  $('review').classList.toggle('api-mode', sync.state === 'fim' && !sync.error);
}
chrome.storage.local.get('apiProgress', function (res) { sync = res.apiProgress || null; renderSync(); });

var MESSAGES = {
  'aguarde para enviar': T('Aguarde alguns minutos antes de enviar de novo.'),
  'token invalido': T('Esta gamertag já foi cadastrada em outro navegador. Sem o token, não dá para atualizar.'),
  'gamertag ja cadastrada': T('Esta gamertag já foi cadastrada em outro navegador. Sem o token, não dá para atualizar.'),
  'dados implausiveis': T('Os números mudaram demais desde o último envio e foram recusados.'),
  'muitas requisicoes': T('Muitas tentativas. Espere um minuto.'),
  'convite necessario': T('Para criar o perfil é preciso um código de convite de quem já participa.'),
  'convite invalido ou expirado': T('Convite inválido, já usado ou expirado.'),
};

$('delete').addEventListener('click', function () {
  if (!confirm(T('Excluir seu perfil e todos os seus dados do PirateBoard? Isso não pode ser desfeito.'))) return;
  chrome.storage.local.get('tokens', function (res) {
    var tokens = res.tokens || {};
    fetch(API + '/api/delete', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ gamertag: gamertag, token: tokens[gamertag] }),
      credentials: 'omit',
    })
      .then(function (r) {
        if (!r.ok) { say(T('Não foi possível excluir. Tente de novo.'), 'err'); return; }
        delete tokens[gamertag];
        chrome.storage.local.set({ tokens: tokens }, function () { say(T('Seus dados foram excluídos.'), 'ok'); syncToken(); });
      })
      .catch(function () { say(T('Sem conexão com o servidor.'), 'err'); });
  });
});

$('renew').addEventListener('click', function () {
  if (!confirm(T('Renovar a chave de edição? A chave antiga deixa de valer neste e em qualquer outro navegador.'))) return;
  $('renew').disabled = true;
  chrome.storage.local.get('tokens', function (res) {
    var tokens = res.tokens || {};
    fetch(API + '/api/token/renew', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ gamertag: gamertag, token: tokens[gamertag] }),
      credentials: 'omit',
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (x) {
        if (x.ok && typeof x.j.token === 'string' && x.j.token) {
          tokens[gamertag] = x.j.token;
          chrome.storage.local.set({ tokens: tokens }, function () { say(T('Chave renovada. A antiga não vale mais.'), 'ok'); syncToken(); });
        } else if (x.j && x.j.error === 'muitas requisicoes') {
          say(MESSAGES['muitas requisicoes'], 'err');
        } else {
          say(T('Não foi possível renovar. Tente de novo.'), 'err');
        }
      })
      .catch(function () { say(T('Sem conexão com o servidor.'), 'err'); })
      .then(function () { $('renew').disabled = false; });
  });
});

function msCall(path, done) {
  chrome.storage.local.get('tokens', function (res) {
    fetch(API + path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ gamertag: gamertag, token: (res.tokens || {})[gamertag] }),
      credentials: 'omit',
    })
      .then(function (r) { return r.json().then(function (j) { return { status: r.status, ok: r.ok, j: j || {} }; }); })
      .then(done)
      .catch(function () { say(T('Sem conexão com o servidor.'), 'err'); });
  });
}

$('xbox').addEventListener('click', function () {
  $('xbox').disabled = true;
  msCall('/api/microsoft/iniciar', function (x) {
    $('xbox').disabled = false;
    if (x.status === 503) { say(T('A verificação da conta Xbox ainda não está disponível.'), 'err'); return; }
    if (x.ok && x.j.already) { say(T('Sua conta Xbox já está verificada.'), 'ok'); return; }
    // Só abre o endereço que o próprio PirateBoard devolveu para este fluxo.
    if (x.ok && typeof x.j.url === 'string' && x.j.url.indexOf(API + '/api/microsoft/ir?f=') === 0) {
      chrome.tabs.create({ url: x.j.url });
      say(T('Abrimos a página da Microsoft em outra aba. Entre com a conta Xbox e volte aqui.'), 'ok');
    } else if (x.j.error === 'muitas requisicoes') {
      say(MESSAGES['muitas requisicoes'], 'err');
    } else {
      say(T('Não foi possível concluir. Tente de novo.'), 'err');
    }
  });
});

$('xbox-off').addEventListener('click', function () {
  if (!confirm(T('Remover a verificação da conta Xbox deste perfil?'))) return;
  msCall('/api/microsoft/desvincular', function (x) {
    say(x.ok ? T('Verificação removida.') : T('Não foi possível concluir. Tente de novo.'), x.ok ? 'ok' : 'err');
  });
});

function days(ms) { return Math.max(1, Math.ceil(ms / 86400000)); }

$('mkinvite').addEventListener('click', function () {
  $('mkinvite').disabled = true;
  chrome.storage.local.get('tokens', function (res) {
    fetch(API + '/api/invite', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ gamertag: gamertag, token: (res.tokens || {})[gamertag] }),
      credentials: 'omit',
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (x) {
        var out = $('invite-out');
        if (x.ok) {
          out.textContent = T('Convite (vale 14 dias, uso único): ');
          var c = document.createElement('code'); c.textContent = x.j.code;
          out.appendChild(c);
          out.hidden = false;
          say(x.j.unlimited ? T('Convite criado.') : T('Convite criado. O próximo fica disponível em 3 dias.'), 'ok');
        } else if (x.j.retryAfterMs) {
          say(T('Você já gerou um convite. O próximo sai em ') + days(x.j.retryAfterMs) + T(' dia(s).'), 'err');
        } else {
          say(MESSAGES[x.j.error] || T('Não foi possível gerar: ') + (x.j.error || 'erro'), 'err');
        }
      })
      .catch(function () { say(T('Sem conexão com o servidor.'), 'err'); })
      .then(function () { $('mkinvite').disabled = false; });
  });
});

// Prova de trabalho: acha um contador cujo SHA-256 de "nonce.contador" comeca com
// `bits` bits zero. Anti-robo para a criacao do perfil (o Turnstile nao roda aqui).
function leadingZeroBits(bytes) {
  var bits = 0;
  for (var i = 0; i < bytes.length; i++) {
    if (bytes[i] === 0) { bits += 8; continue; }
    bits += Math.clz32(bytes[i]) - 24;
    break;
  }
  return bits;
}

async function solvePow(c) {
  var enc = new TextEncoder();
  for (var n = 0; n < 100000000; n++) {
    var h = new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(c.nonce + '.' + n)));
    if (leadingZeroBits(h) >= c.bits) return String(n);
  }
  throw new Error('sem solucao');
}

async function fetchPow() {
  var r = await fetch(API + '/api/challenge?gamertag=' + encodeURIComponent(gamertag), { credentials: 'omit' });
  if (!r.ok) throw new Error('desafio indisponivel');
  var c = await r.json();
  return { nonce: c.nonce, ts: c.ts, sig: c.sig, counter: await solvePow(c) };
}

$('country').addEventListener('change', update);

var SEND_COOLDOWN = 0; // sem limite de envio (2026-11-02, testes)
$('send').addEventListener('click', function () {
  sending = true;
  update();
  chrome.storage.local.get(['tokens', 'sentAt'], function (res) {
    var tokens = res.tokens || {};
    var sentAt = res.sentAt || {};
    var wait = (sentAt[gamertag] || 0) + SEND_COOLDOWN - Date.now();
    if (wait > 0) {
      say(T('Aguarde um pouco antes de enviar de novo. Próximo envio em ') + Math.ceil(wait / 60000) + T(' min.'), 'err');
      sending = false; update();
      return;
    }
    var needPow = !tokens[gamertag]; // so a criacao do perfil exige o desafio
    say(needPow ? T('Verificando (alguns segundos)...') : T('Enviando...'));
    (needPow ? fetchPow() : Promise.resolve(undefined))
      .then(function (pow) {
        say(T('Enviando...'));
        return fetch(API + '/api/import', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            gamertag: gamertag,
            country: $('country').value,
            snapshot: snapshot,
            consent: { terms: $('terms').checked, publicProfile: $('pub').checked },
            token: tokens[gamertag],
            invite: $('invite').value.trim() || undefined,
            pow: pow,
          }),
          credentials: 'omit',
        });
      })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (x) {
        if (x.ok) {
          if (x.j.token) { tokens[gamertag] = x.j.token; chrome.storage.local.set({ tokens: tokens }, syncToken); }
          sentAt[gamertag] = Date.now();
          chrome.storage.local.set({ sentAt: sentAt });
          say(T('Enviado! Próxima atualização em 24 horas.'), 'ok');
        } else {
          // Token guardado de um perfil que nao existe mais no servidor: descarta e pede o convite.
          if (x.j.error === 'convite necessario' && tokens[gamertag]) {
            delete tokens[gamertag];
            chrome.storage.local.set({ tokens: tokens }, syncToken);
          }
          say(MESSAGES[x.j.error] || T('Não enviado: ') + (x.j.error || 'erro'), 'err');
        }
      })
      .catch(function () { say(T('Sem conexão com o servidor.'), 'err'); })
      .then(function () { sending = false; update(); });
  });
});

// Leitura pela API: um clique; a aba ativa (pagina do perfil) faz as requisicoes.
var API_ERRORS = {
  pagina: 'Abra uma página do seu perfil no site do jogo (e entre na conta) e tente de novo.',
  gamertag: 'Não consegui identificar sua gamertag. Abra a Visão geral do perfil e tente de novo.',
  sessao: 'Entre na sua conta no site do jogo e tente de novo.',
  limite: 'O site pediu para esperar. Tente de novo em alguns minutos.',
  rede: 'Sem conexão com o site do jogo.',
  formato: 'O site do jogo mudou o formato. Use a leitura das páginas.',
};
var API_COOLDOWN = 5 * 60 * 1000;
$('api').addEventListener('click', function () {
  chrome.storage.local.get('apiAt', function (res) {
    var wait = (res.apiAt || 0) + API_COOLDOWN - Date.now();
    if (wait > 0) { say(T('Espere ainda alguns minutos antes de ler de novo.'), 'err'); return; }
    $('api').disabled = true;
    say('');
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var tab = tabs && tabs[0];
      var fail = function (k) { say(T(API_ERRORS[k]), 'err'); $('api').disabled = false; };
      if (!tab || !/^https:\/\/www\.seaofthieves\.com\/[^/]+\/profile\//.test(tab.url || '')) { fail('pagina'); return; }
      chrome.tabs.sendMessage(tab.id, { type: 'pb-read-api' }, function (r) {
        if (chrome.runtime.lastError || !r) { fail('pagina'); return; }
        if (r.error) { fail(r.error); return; }
        chrome.storage.local.set({ apiAt: Date.now() });
        if (r.missing && r.missing.length) say(T('Leitura concluída, mas faltaram partes. Abra as páginas correspondentes ou tente de novo mais tarde.'), 'err');
        else say('');
        $('api').disabled = false;
      });
    });
  });
});

refresh();

// Opt-in dos textos: lembra a escolha e refaz a previa ao marcar ou desmarcar.
(function () {
  function save() { try { chrome.storage.local.set({ optin: opts() }); } catch (e) {} }
  chrome.storage.local.get('optin', function (res) {
    var o = res.optin || {};
    $('opt-comm').checked = !!o.commendationNames;
    $('opt-chest').checked = !!o.chestNames;
    if (lastParts) render(lastParts);
  });
  ['opt-comm', 'opt-chest'].forEach(function (id) {
    $(id).addEventListener('change', function () { save(); if (lastParts) render(lastParts); });
  });
})();
