# Publicar o Rotina em Foco (guia rápido)

Sua conta GitHub conectada é **`wayne027`**. O endereço recomendado será:

`https://wayne027.github.io/rotina-em-foco/`

**Ele é apenas o endereço planejado até você criar o repositório e ativar o GitHub Pages.**

1. Entre em <https://github.com/new>, usando a conta `wayne027`.
2. Crie um repositório **Public** chamado exatamente `rotina-em-foco`, preferencialmente sem inicializar com README (este pacote já tem um).
3. Extraia o ZIP e faça upload de **todo o conteúdo da pasta** para a raiz do repositório. O arquivo `index.html` deve aparecer na raiz. Faça commit na branch `main`.
4. Em **Settings → Pages → Build and deployment**, selecione **Deploy from a branch**, `main`, `/(root)` e pressione **Save**.
5. No mesmo painel, confirme a URL pela opção **Visit site** quando a publicação estiver concluída.

## Como editar sem depender do ChatGPT

Abra <https://github.com/wayne027/rotina-em-foco> depois de criar o repositório.
Para editar online, escolha um arquivo → ícone de lápis **Edit this file** → **Commit changes**.
A alteração será publicada no **mesmo endereço**, após o processamento automático do Pages.

Para trabalhar no seu computador, baixe/clone o repositório, abra em **VS Code**, edite e faça `git push` (veja os comandos no `README.md`).

## Atenção: backup e controle

- Seu site antigo `chatgpt.site` e o novo `github.io` usam armazenamentos locais diferentes. Importe seu backup JSON na publicação nova.
- Os registros não são enviados para a conta GitHub; ficam no navegador que você usa.
- Ao compartilhar a URL, outras pessoas acessam o mesmo programa, mas **não os seus dados**.
- Um domínio registrado **em seu nome** permite mudar de hospedagem mantendo o endereço público; o endereço `github.io` pertence ao GitHub.
- O projeto usa HTML/CSS/JavaScript sem dependências de execução, portanto pode ser levado a outros serviços e a servidores próprios.