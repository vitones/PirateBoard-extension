# Extensão PirateBoard

Extensão de navegador do [PirateBoard](https://pirateboard.veetones.workers.dev), um ranking de comunidade dos jogadores de Sea of Thieves da América do Sul. Projeto de fã, **não afiliado à Rare nem à Microsoft**.

Este repositório existe para que qualquer pessoa possa conferir, linha por linha, o que a extensão faz antes de instalá-la.

## O que ela faz

1. Quando você abre as páginas **Visão geral**, **Capitania**, **Reputação** e, se quiser, **Temporadas** e **Baú** do seu perfil em `seaofthieves.com`, ela lê o **texto que aparece na tela** e o valor exato das moedas (gamertag, Moedas Antigas, ouro, metas, título, Renome, nível de reputação nas companhias e a quantidade de itens do Baú por categoria).
2. No painel (ícone da extensão) ela mostra **exatamente o que será enviado**, inclusive o JSON bruto.
3. **Só envia quando você aceita os termos e clica em Enviar.** Nada é enviado sozinho.
4. Opcional: o botão **Verificar conta Xbox** abre, em outra aba, o login da Microsoft no site do PirateBoard. A extensão não recebe nem guarda dados da conta; só abre endereços do próprio PirateBoard.

## O que ela não faz

- Não lê cookies, senhas, tokens de login nem dados da sua conta Xbox ou Microsoft.
- Não faz nenhuma requisição ao site do jogo; só lê a página que você mesmo abriu.
- Não clica, não navega e não automatiza nada.
- Não clica em nada. Do baú, lê só a **quantidade de itens por categoria**, nas páginas que **você** abrir (nunca nomes, descrições ou imagens de itens). Não lê amigos, guildas, teste de personalidade nem outras páginas.
- Não envia nada para ninguém além do servidor do PirateBoard.

## Permissões do `manifest.json`

| Permissão | Para quê |
|---|---|
| `storage` | Guardar no navegador a leitura atual e o código de edição do seu perfil. |
| `activeTab` | Só na aba que você está vendo, quando você usa a extensão, para a leitura opcional pela API do próprio site. |
| Site `seaofthieves.com/*/profile/*` | Ler o texto das páginas de perfil que você abriu. |
| Site `pirateboard.veetones.workers.dev` | Enviar os números que você confirmou. |
| `127.0.0.1:8799` | Só para desenvolvimento local; pode ser removida da sua cópia. |

A **leitura opcional pela API** só acontece se você pedir: são 4 consultas GET a `www.seaofthieves.com/api/profilev2/` (saldo, reputação, capitania e baú), com a sua própria sessão do navegador, com pausa entre elas, e ela para na primeira recusa. Nada disso é enviado sem a sua confirmação.

Não há `cookies`, `tabs` amplo, `webRequest`, `history` nem `<all_urls>`.

## Como conferir

- `content.js` roda nas páginas do perfil e só lê o texto visível.
- `parse.js` transforma esse texto em números e é o único código que interpreta a página.
- `popup.js` mostra os dados e faz o envio (`fetch` para a API do PirateBoard, sem cookies).
- Procure por `fetch(`, `cookie`, `XMLHttpRequest` e `chrome.` para ver tudo o que sai ou é guardado.

## Instalar a partir do repositório

Serve para Chrome, Edge, Opera, Opera GX, Brave e outros navegadores baseados no Chromium. Use a versão da branch `main`; ela é sempre a mesma publicada nas lojas.

1. **Baixe o código.** Em *Code > Download ZIP* (ou `git clone`) e, se baixou o ZIP, extraia em uma pasta fixa. Não apague nem mova a pasta depois: o navegador lê os arquivos direto dela.
2. **Abra a página de extensões:**
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
   - Opera e Opera GX: `opera://extensions`
   - Brave: `brave://extensions`
3. **Ative o "Modo do desenvolvedor"** (interruptor no canto da página).
4. Clique em **"Carregar sem compactação"** (Opera: "Carregar descompactada") e escolha a pasta que contém o arquivo `manifest.json`.
5. Fixe o ícone do PirateBoard na barra do navegador e abra seu perfil em `seaofthieves.com`.

**Atualizar:** baixe o repositório de novo, substitua os arquivos da pasta e clique em "Recarregar" no cartão da extensão.

**Remover:** na mesma página, clique em "Remover". Os dados guardados pela extensão saem junto.

**Aviso de "extensões do modo desenvolvedor":** é normal para quem instala assim; some ao instalar pela loja.

**Conferir antes de instalar:** compare as permissões do `manifest.json` com a tabela acima e leia `content.js`, `parse.js` e `popup.js`.

## Segurança

Para relatar uma falha, veja [SECURITY.md](SECURITY.md).

## Licença

Todos os direitos reservados. O código é público para auditoria: você pode ler, instalar e usar a extensão para uso pessoal, mas não copiar nem redistribuir. Veja [LICENSE](LICENSE).
