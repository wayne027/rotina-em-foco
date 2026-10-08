# Rotina em Foco — projeto sob seu controle

Site de organização pessoal que roda diretamente no navegador. **Não usa framework,
instalador de pacotes nem servidor para armazenar seus registros.**

Este projeto foi separado do HTML original sem trocar as chaves de armazenamento.
As melhorias de contraste da versão corrigida estão incluídas.

## 1. Onde editar cada coisa

| Objetivo | Arquivo |
|---|---|
| Alterar texto, adicionar campos ou abas | `index.html` |
| Alterar layout, tamanho, fontes e estilos | `assets/css/styles.css` |
| Alterar cores, contraste e temas predefinidos | `assets/js/theme.js` |
| Alterar dados padrão, salvamento e formato das datas | `assets/js/state.js` |
| Alterar anexos, comentários e cartões de tarefas | `assets/js/annotations.js` |
| Alterar perguntas, avaliações e gráficos do check-in | `assets/js/checkin.js` |
| Alterar metas, registros e gráficos de hábitos | `assets/js/habits.js` |
| Alterar tarefas, painel inicial e navegação | `assets/js/tasks.js` |
| Alterar agenda semanal, áreas e temporizador | `assets/js/planner.js` |
| Alterar ações de botões, modais, importação e exportação | `assets/js/events.js` |

**Importante:** preserve os atributos `id` do HTML ao editar elementos.
O JavaScript procura esses IDs para adicionar as funcionalidades.
Leia `assets/js/ORDER.md` antes de rearranjar scripts.

## 2. Testar alterações no próprio computador

- Abra a pasta no **VS Code** (ou qualquer editor de texto).
- Se você tem Python instalado, abra um terminal na pasta e execute:

  ```bash
  python -m http.server 8000
  ```

- Abra <http://localhost:8000> no navegador.
- Salve as alterações e atualize a página (Ctrl+F5, se necessário).

Você pode testar só abrindo `index.html` no navegador, mas o modo `file://`
pode ter particularidades de armazenamento dependendo do navegador. O servidor
local é mais parecido com o ambiente da publicação. O endereço `localhost`
**não é um endereço público**.

## 3. Publicar em um endereço estável (GitHub Pages)

Um bom endereço inicial é `https://SEU_USUARIO.github.io/rotina-em-foco/`.
O endereço só passa a existir quando você publica o projeto.

1. Entre na sua própria conta GitHub e crie um repositório **público** chamado
   `rotina-em-foco` em <https://github.com/new> (ou escolha outro nome).
2. Envie **o conteúdo da pasta**, mantendo `index.html` na raiz e preservando
   as pastas `assets`. Você pode fazer isso pelo menu **Add file → Upload files**,
   ou pelo Git (instruções a seguir).
3. Em **Settings → Pages → Build and deployment**, escolha **Deploy from a branch**,
   ramo **main**, pasta **/(root)**, e salve.
4. No painel Pages aparecerá **Visit site** assim que a publicação estiver pronta.
5. Nas edições seguintes, altere arquivos no repositório e faça um novo commit;
   a publicação é atualizada sem mudar o endereço. O projeto **não depende da
   conversa do ChatGPT**.

> Endereço controlado e estável não é o mesmo que domínio próprio.
> O endereço `github.io` depende da plataforma GitHub. Para ter um nome
> verdadeiramente portável (por exemplo `rotina.seudominio.com.br`), registre
> um domínio em seu nome e configure-o nas opções Pages. O domínio tem custo
> de registro/renovação e a hospedagem pode ser trocada mantendo o nome.

### Atualizar usando Git (opcional)

Se você já usa Git no computador, dentro da pasta deste projeto:

```bash
git init
git branch -M main
git add .
git commit -m "Versão inicial do Rotina em Foco"
git remote add origin https://github.com/SEU_USUARIO/rotina-em-foco.git
git push -u origin main
```

Nas próximas mudanças, basta:

```bash
git add .
git commit -m "Atualiza tarefas e estilos"
git push
```

Configure nome e email do Git se o comando de commit solicitar. Se o repositório
já tiver um README ou outro commit inicial, clone esse repositório antes de copiar
os arquivos, para evitar conflitos de histórico.

## 4. Privacidade, dados e backups

- **Dados e temas** são salvos em `localStorage`, nas chaves
  `rotina-em-foco-v1` e `rotina-em-foco-settings-v1`.
- **Arquivos anexados** usam `IndexedDB`, banco `rotina-em-foco-arquivos`.
- **Não há sincronização entre dispositivos** nem login no site.
- O site publicado é público; **o código publicado é público** no GitHub Pages
  com um repositório público. Porém as suas tarefas pessoais **não são incluídas
  automaticamente no repositório**: ficam no navegador de cada visitante.
- Dados locais pertencem ao **endereço (origem)** e perfil do navegador. Mudar
  de `chatgpt.site` para `github.io` cria uma origem diferente: seus registros
  **não são transferidos automaticamente**.
- Na versão antiga, vá em **Revisão → Baixar meus dados** para exportar um arquivo
  JSON, depois abra a publicação nova e use **Importar dados**. A exportação
  inclui anexos recuperáveis da base de dados do navegador, dentro do JSON.
- Os temas podem precisar ser reaplicados porque o JSON exportado contém
  registros de rotina, não as preferências de cor.
- Faça cópias periódicas do JSON e guarde seu projeto (ou clones Git) no computador.
- **Não** inclua backups JSON pessoais ou segredos no repositório público.

## 5. Avisos antes de editar

- Não altere as chaves de armazenamento sem planejar uma migração.
- Não apague nomes de funções sem corrigir as chamadas correspondentes.
- Evite cores fixas diretamente em componentes; prefira as variáveis CSS do tema.
- Teste Tarefas, Hábitos, Check-in e **exportar/importar** após atualizações.
- Ao abrir em `localhost:8000`, os dados locais não serão os mesmos da URL pública.

## 6. Testes incluídos

O pacote inclui `scripts/verificar.py`. Execute na pasta do projeto:

```bash
python scripts/verificar.py
```

O teste verifica a presença dos arquivos essenciais e referências entre HTML,
CSS e scripts. Para alterações maiores, também teste as funcionalidades no navegador.

---

**Propriedade do código:** você pode baixar, editar, clonar e hospedar este projeto
em qualquer serviço compatível com HTML/CSS/JavaScript. A hospedagem e a
manutenção do endereço público continuam dependentes da infraestrutura escolhida.