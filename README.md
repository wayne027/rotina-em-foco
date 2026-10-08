# Rotina em Foco

Site de rotinas, tarefas, hábitos e check-in, sem frameworks e com armazenamento no navegador.

## Onde editar

- `index.html`: telas, campos, menus e conteúdo.
- `assets/css/styles.css`: aparência e layout.
- `assets/js/app.js`: funcionalidades, salvamento e personalização de cores.
- `PUBLICAR.md`: publicação do GitHub Pages.

**Importante:** não renomeie sem migração as chaves `rotina-em-foco-v1` e `rotina-em-foco-settings-v1`: elas identificam os dados salvos em cada navegador.

## Editar pelo GitHub

Abra o arquivo desejado no repositório, clique no lápis (Edit), faça as alterações e selecione **Commit changes**. Se o Pages estiver configurado para publicar a branch `main` na raiz, as mudanças entrarão no mesmo endereço após o build.

## Editar no computador

Use VS Code. Na raiz do projeto, rode `python -m http.server 8000` e abra `http://localhost:8000`. Depois faça commit e push.

## Publicar

Em **Settings → Pages → Build and deployment**, escolha **Deploy from a branch**, `main`, `/(root)`, salve e aguarde o botão **Visit site**. O endereço esperado é `https://wayne027.github.io/rotina-em-foco/`.

## Privacidade e cópias

Seus dados de tarefas e hábitos ficam no navegador, não no repositório GitHub. Os anexos usam IndexedDB. Mudanças de domínio/origem (inclusive entre `chatgpt.site` e `github.io`) não transferem dados automaticamente; importe seu backup JSON no novo endereço. O backup JSON pode não incluir os binários de anexos salvos no IndexedDB.

Os arquivos são portáveis: você pode migrar a hospedagem, mas o endereço `github.io` continua dependente da plataforma. Para independência do endereço, registre um domínio em seu nome.
