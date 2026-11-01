# Extensão PirateBoard

Extensão de navegador do [PirateBoard](https://pirateboard.veetones.workers.dev), um ranking de comunidade dos jogadores de Sea of Thieves da América do Sul. Projeto de fã, **não afiliado à Rare nem à Microsoft**.

Este repositório existe para que qualquer pessoa possa conferir, linha por linha, o que a extensão faz antes de instalá-la.

## O que ela faz

1. Quando você abre as páginas **Visão geral**, **Capitania** e **Reputação** do seu perfil em `seaofthieves.com`, ela lê o **texto que aparece na tela** (gamertag, nível, ouro, metas, nível de reputação nas companhias).
2. No painel (ícone da extensão) ela mostra **exatamente o que será enviado**, inclusive o JSON bruto.
3. **Só envia quando você aceita os termos e clica em Enviar.** Nada é enviado sozinho.

## O que ela não faz

- Não lê cookies, senhas, tokens de login nem dados da sua conta Xbox ou Microsoft.
- Não faz nenhuma requisição ao site do jogo; só lê a página que você mesmo abriu.
- Não clica, não navega e não automatiza nada.
- Não lê o baú, as guildas nem outras páginas além das três acima.
- Não envia nada para ninguém além do servidor do PirateBoard.

## Permissões do `manifest.json`

| Permissão | Para quê |
|---|---|
| `storage` | Guardar no navegador a leitura atual e o código de edição do seu perfil. |
| Site `seaofthieves.com/*/profile/*` | Ler o texto das páginas de perfil que você abriu. |
| Site `pirateboard.veetones.workers.dev` | Enviar os números que você confirmou. |
| `127.0.0.1:8799` | Só para desenvolvimento local; pode ser removida da sua cópia. |

Não há `cookies`, `tabs` amplo, `webRequest`, `history` nem `<all_urls>`.

## Como conferir

- `content.js` roda nas páginas do perfil e só lê o texto visível.
- `parse.js` transforma esse texto em números e é o único código que interpreta a página.
- `popup.js` mostra os dados e faz o envio (`fetch` para a API do PirateBoard, sem cookies).
- Procure por `fetch(`, `cookie`, `XMLHttpRequest` e `chrome.` para ver tudo o que sai ou é guardado.

## Instalar manualmente

1. Baixe este repositório (uso pessoal).
2. Chrome, Edge ou Opera: abra `chrome://extensions` (ou `opera://extensions`), ative o modo desenvolvedor e use "Carregar sem compactação" apontando para esta pasta.

## Segurança

Para relatar uma falha, veja [SECURITY.md](SECURITY.md).

## Licença

Todos os direitos reservados. O código é público para auditoria: você pode ler, instalar e usar a extensão para uso pessoal, mas não copiar nem redistribuir. Veja [LICENSE](LICENSE).
