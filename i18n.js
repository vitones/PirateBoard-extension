(function () {
  // Dicionario PT -> ES. O texto original das paginas e em portugues; aqui so entra a traducao.
  var ES = {
    'Código aberto para conferir': 'Código abierto para verificar',
    'O código da extensão é público para auditoria:': 'El código de la extensión es público para auditoría:',
    '. Lá você vê as permissões e tudo o que ela lê e envia.': '. Allí ves los permisos y todo lo que lee y envía.',
    'Falha de segurança (não publique detalhes sensíveis)': 'Falla de seguridad (no publiques detalles sensibles)',
    'Quem manda nos': 'Quién manda en los', 'mares do Sul': 'mares del Sur',
    "Denunciar": "Denunciar",
    "Denunciar ou contestar | PirateBoard": "Denunciar o impugnar | PirateBoard",
    "Denunciar ou contestar": "Denunciar o impugnar",
    "Denuncie um perfil ou conteste dados do PirateBoard.": "Denuncia un perfil o impugna datos de PirateBoard.",
    "Use para avisar de números falsos, de uma gamertag cadastrada por outra pessoa ou de conteúdo ofensivo. Cada denúncia é revisada por uma pessoa; nada é removido automaticamente.": "Úsalo para avisar de números falsos, de una gamertag registrada por otra persona o de contenido ofensivo. Cada denuncia la revisa una persona; nada se elimina automáticamente.",
    "Gamertag": "Gamertag",
    "Motivo": "Motivo",
    "Números falsos ou impossíveis": "Números falsos o imposibles",
    "Esta gamertag é minha e não fui eu quem cadastrou": "Esta gamertag es mía y no fui yo quien la registró",
    "Conteúdo ofensivo": "Contenido ofensivo",
    "Outro": "Otro",
    "Detalhes (opcional, até 1000 caracteres)": "Detalles (opcional, hasta 1000 caracteres)",
    "Contato para resposta (opcional)": "Contacto para respuesta (opcional)",
    "O contato é usado só para responder a esta denúncia. Não guardamos o seu IP, apenas um código que limita denúncias repetidas por dia.": "El contacto se usa solo para responder a esta denuncia. No guardamos tu IP, solo un código que limita las denuncias repetidas por día.",
    "Enviar denúncia": "Enviar denuncia",
    "Denúncia enviada. Obrigado.": "Denuncia enviada. Gracias.",
    "Não foi possível enviar.": "No se pudo enviar.",
    "Gamertag inválida.": "Gamertag inválida.",
    "Descreva o problema em pelo menos 10 caracteres.": "Describe el problema en al menos 10 caracteres.",
    "Você atingiu o limite de denúncias de hoje.": "Alcanzaste el límite de denuncias de hoy.",
    "Denunciar este perfil": "Denunciar este perfil",
    'Ranking': 'Ranking', 'Como funciona': 'Cómo funciona', 'Privacidade': 'Privacidad', 'Termos': 'Términos',
    'Ranking de comunidade dos piratas da América do Sul. Os números são enviados pelos próprios jogadores e ficam marcados como autodeclarados.': 'Ranking comunitario de los piratas de Sudamérica. Los números los envían los propios jugadores y quedan marcados como autodeclarados.',
    'Toda a América do Sul': 'Toda Sudamérica', 'Colômbia': 'Colombia', 'Uruguai': 'Uruguay', 'Bolívia': 'Bolivia', 'Equador': 'Ecuador', 'Guiana': 'Guyana',
    'Ouro': 'Oro', 'Nível': 'Nivel', 'Metas de Navio': 'Metas de Barco',
    'Ninguém no ranking ainda. Seja o primeiro!': 'Nadie en el ranking todavía. ¡Sé el primero!',
    'PirateBoard é um projeto de comunidade, não afiliado à Rare nem à Microsoft. Sea of Thieves é marca dos seus respectivos titulares.': 'PirateBoard es un proyecto comunitario, no afiliado a Rare ni a Microsoft. Sea of Thieves es marca de sus respectivos titulares.',
    'Ranking de comunidade dos jogadores de Sea of Thieves da América do Sul.': 'Ranking comunitario de los jugadores de Sea of Thieves de Sudamérica.',
    'Como funciona | PirateBoard': 'Cómo funciona | PirateBoard', 'Como entrar': 'Cómo entrar',
    'Peça um convite': 'Pide una invitación',
    'a quem já está no ranking. Cada jogador pode gerar um convite a cada 3 dias; o código vale 14 dias e só funciona uma vez.': 'a alguien que ya esté en el ranking. Cada jugador puede generar una invitación cada 3 días; el código vale 14 días y solo funciona una vez.',
    'Instale a extensão PirateBoard': 'Instala la extensión PirateBoard',
    'no navegador (por enquanto, carregada manualmente; a loja virá depois).': 'en el navegador (por ahora, cargada manualmente; la tienda llegará después).',
    'Abra o seu perfil': 'Abre tu perfil',
    'em seaofthieves.com (Visão geral, Capitania e Reputação). A extensão lê só o texto que aparece na tela.': 'en seaofthieves.com (Resumen, Capitanía y Reputación). La extensión lee solo el texto que aparece en pantalla.',
    'Confira os números': 'Revisa los números',
    'no painel da extensão, cole o convite, escolha o país e aceite os termos. Nada é enviado sem o seu clique em Enviar.': 'en el panel de la extensión, pega la invitación, elige el país y acepta los términos. No se envía nada sin tu clic en Enviar.',
    'O que é enviado': 'Qué se envía',
    'Gamertag, país, nível, ouro, metas de Pirata e de Navio e o nível de reputação nas companhias. A extensão mostra os dados exatos antes de enviar. Ela não lê cookies, senhas nem dados da sua conta Xbox.': 'Gamertag, país, nivel, oro, metas de Pirata y de Barco y el nivel de reputación en las compañías. La extensión muestra los datos exactos antes de enviar. No lee cookies, contraseñas ni datos de tu cuenta Xbox.',
    'Regras': 'Reglas', 'Uma atualização por dia (janela de 24 horas).': 'Una actualización por día (ventana de 24 horas).',
    'Números que diminuem ou crescem de forma implausível são recusados.': 'Los números que disminuyen o crecen de forma inverosímil se rechazan.',
    'Os números são enviados pelos jogadores e marcados como autodeclarados: o site ainda não prova que a gamertag é sua.': 'Los números los envían los jugadores y se marcan como autodeclarados: el sitio aún no prueba que la gamertag sea tuya.',
    'Seu perfil só aparece no ranking e na busca se você marcar “Aparecer no ranking público”.': 'Tu perfil solo aparece en el ranking y en la búsqueda si marcas “Aparecer en el ranking público”.',
    'Sua conta e seus dados': 'Tu cuenta y tus datos',
    'Não há senha. O acesso ao seu perfil é um código guardado só no navegador onde você criou o perfil, dentro da extensão. Nela você também gera convites e pode': 'No hay contraseña. El acceso a tu perfil es un código guardado solo en el navegador donde creaste el perfil, dentro de la extensión. En ella también generas invitaciones y puedes',
    'excluir todos os seus dados': 'eliminar todos tus datos',
    'a qualquer momento. Se limpar os dados do navegador, perde o acesso a esse perfil.': 'en cualquier momento. Si borras los datos del navegador, pierdes el acceso a ese perfil.',
    'Não afiliado à Rare nem à Microsoft.': 'No afiliado a Rare ni a Microsoft.',
    'Como entrar no PirateBoard: extensão, convite, atualização diária e exclusão dos seus dados.': 'Cómo entrar en PirateBoard: extensión, invitación, actualización diaria y eliminación de tus datos.',
    'Carregando...': 'Cargando...', 'Reputação': 'Reputación',
    'Números autodeclarados pelo jogador, enviados pela extensão do PirateBoard.': 'Números autodeclarados por el jugador, enviados por la extensión de PirateBoard.',
    'Página não encontrada | PirateBoard': 'Página no encontrada | PirateBoard', 'Página não encontrada': 'Página no encontrada',
    'Esse mapa não leva a lugar nenhum.': 'Ese mapa no lleva a ningún lugar.', 'Voltar ao ranking': 'Volver al ranking',
    'Visão geral': 'Resumen', 'Capitania': 'Capitanía',
    'Abra cada página do seu perfil no site do jogo e espere carregar. Toque em uma para abrir.': 'Abre cada página de tu perfil en el sitio del juego y espera a que cargue. Toca una para abrirla.',
    'Dados exatos enviados': 'Datos exactos enviados', 'Aparecer no ranking público': 'Aparecer en el ranking público',
    'Aceito os termos e a política de privacidade': 'Acepto los términos y la política de privacidad',
    'Gerar convite': 'Generar invitación', 'Excluir meus dados': 'Eliminar mis datos', 'Limpar leitura': 'Borrar lectura',
    'Não afiliado à Rare nem à Microsoft. Nenhum cookie ou senha é lido.': 'No afiliado a Rare ni a Microsoft. No se lee ninguna cookie ni contraseña.',
    'Código de convite (XXXX-XXXX-XXXX)': 'Código de invitación (XXXX-XXXX-XXXX)', 'Código de convite': 'Código de invitación',
    'Acumuladores de Ouro': 'Acumuladores de Oro', 'Aliança Mercante': 'Alianza Mercante', 'Ordem das Almas': 'Orden de las Almas', 'Fortuna de Atena': 'Fortuna de Atenea',
    'Ossos do Ceifador': 'Huesos del Segador', 'Chamado da Caça': 'Llamada de la Caza', 'Guardiões da Fortuna': 'Guardianes de la Fortuna', 'Serviçais da Chama': 'Siervos de la Llama',
    'nível': 'nivel', 'atualizado em': 'actualizado el', 'Informe uma gamertag.': 'Indica una gamertag.',
    'Perfil não encontrado ou não público.': 'Perfil no encontrado o no público.', 'Não foi possível carregar o perfil.': 'No se pudo cargar el perfil.',
    'Nenhum perfil público encontrado.': 'Ningún perfil público encontrado.', 'Não foi possível carregar o ranking.': 'No se pudo cargar el ranking.',
    'Erro: extensão incompleta. Recarregue em opera://extensions.': 'Error: extensión incompleta. Recárgala en opera://extensions.',
    'Você já enviou hoje. Tente de novo em 24 horas.': 'Ya enviaste hoy. Inténtalo de nuevo en 24 horas.',
    'Esta gamertag já foi cadastrada em outro navegador. Sem o token, não dá para atualizar.': 'Esta gamertag ya fue registrada en otro navegador. Sin el token no se puede actualizar.',
    'Esta gamertag já está cadastrada.': 'Esta gamertag ya está registrada.',
    'Os números mudaram demais desde o último envio e foram recusados.': 'Los números cambiaron demasiado desde el último envío y fueron rechazados.',
    'Muitas tentativas. Espere um minuto.': 'Demasiados intentos. Espera un minuto.',
    'Para criar o perfil é preciso um código de convite de quem já participa.': 'Para crear el perfil necesitas un código de invitación de alguien que ya participa.',
    'Convite inválido, já usado ou expirado.': 'Invitación inválida, ya usada o expirada.',
    'Verificando (alguns segundos)...': 'Verificando (unos segundos)...', 'Enviando...': 'Enviando...',
    'Enviado! Próxima atualização em 24 horas.': '¡Enviado! Próxima actualización en 24 horas.',
    'Não enviado: ': 'No enviado: ', 'Sem conexão com o servidor.': 'Sin conexión con el servidor.',
    'Convite (vale 14 dias, uso único): ': 'Invitación (vale 14 días, un solo uso): ', 'Convite criado.': 'Invitación creada.',
    'Convite criado. O próximo fica disponível em 3 dias.': 'Invitación creada. La próxima estará disponible en 3 días.',
    'Você já gerou um convite. O próximo sai em ': 'Ya generaste una invitación. La próxima sale en ', ' dia(s).': ' día(s).',
    'Não foi possível gerar: ': 'No se pudo generar: ',
    'Excluir seu perfil e todos os seus dados do PirateBoard? Isso não pode ser desfeito.': '¿Eliminar tu perfil y todos tus datos de PirateBoard? Esto no se puede deshacer.',
    'Não foi possível excluir. Tente de novo.': 'No se pudo eliminar. Inténtalo de nuevo.', 'Seus dados foram excluídos.': 'Tus datos fueron eliminados.',
    'Reputação em ': 'Reputación en ', ' companhias': ' compañías'
  };
  var lang = '';
  try { lang = localStorage.getItem('lang') || ''; } catch (e) {}
  if (lang !== 'pt' && lang !== 'es') lang = /^es/i.test(navigator.language || '') ? 'es' : 'pt';
  window.LANG = lang;
  window.T = function (pt) { return lang === 'es' && ES[pt] ? ES[pt] : pt; };

  function norm(s) { return s.replace(/\s+/g, ' ').trim(); }
  if (lang === 'es') {
    document.documentElement.lang = 'es';
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), n, nodes = [];
    while ((n = w.nextNode())) nodes.push(n);
    nodes.forEach(function (t) {
      if (!t.parentNode || /^(SCRIPT|STYLE)$/.test(t.parentNode.nodeName)) return;
      var r = ES[norm(t.nodeValue)];
      if (r) t.nodeValue = t.nodeValue.match(/^\s*/)[0] + r + t.nodeValue.match(/\s*$/)[0];
    });
    document.querySelectorAll('[placeholder],[aria-label]').forEach(function (e) {
      ['placeholder', 'aria-label'].forEach(function (a) { var v = e.getAttribute(a); if (v && ES[v]) e.setAttribute(a, ES[v]); });
    });
    var d = document.querySelector('meta[name=description]');
    if (d && ES[d.content]) d.content = ES[d.content];
    if (ES[document.title]) document.title = ES[document.title];
  }

  // Seletor de idioma: no cabecalho (site) ou ao lado do nome (extensao).
  var host = document.querySelector('nav') || document.querySelector('header');
  if (host) {
    var b = document.createElement('a');
    b.href = '#';
    b.textContent = lang === 'es' ? 'PT' : 'ES';
    b.setAttribute('aria-label', lang === 'es' ? 'Português' : 'Español');
    b.addEventListener('click', function (e) {
      e.preventDefault();
      try { localStorage.setItem('lang', lang === 'es' ? 'pt' : 'es'); } catch (x) {}
      location.reload();
    });
    host.appendChild(b);
  }
})();
