/* Rotina em Foco — Laboratório de Ideias.
   Inspiração: USF, Unidade 4, pp. 118–121. Sem conexão externa.
   Os registros são guardados em data.ideas e entram no backup JSON.
*/
(function () {
  "use strict";
  const design = [
    {id:"empathize",title:"Compreender",question:"Quem enfrenta a dificuldade? O que essa pessoa precisa?",tip:"Observe o contexto e escute os envolvidos antes de propor soluções."},
    {id:"define",title:"Definir",question:"Qual problema específico você quer resolver?",tip:"Descreva a dificuldade, não apenas uma solução imaginada."},
    {id:"ideate",title:"Idear",question:"Quais soluções diferentes poderiam funcionar?",tip:"Liste alternativas antes de decidir qual testar."},
    {id:"prototype",title:"Prototipar",question:"Qual versão pequena da ideia você pode experimentar?",tip:"Desenhe ou monte algo simples, suficiente para aprender."},
    {id:"test",title:"Testar",question:"O que aconteceu no teste e o que pode melhorar?",tip:"Anote resultados e feedbacks. Voltar etapas faz parte do processo."}
  ];
  const scamper = [
    {id:"substitute",title:"Substituir",question:"O que pode ser trocado?",tip:"Substitua materiais, ferramentas ou etapas."},
    {id:"combine",title:"Combinar",question:"Que elementos poderiam funcionar juntos?",tip:"Misture práticas ou recursos já existentes."},
    {id:"adapt",title:"Adaptar",question:"O que funciona em outro contexto?",tip:"Transfira uma solução conhecida para sua realidade."},
    {id:"modify",title:"Modificar",question:"O que pode ser reduzido, ampliado ou transformado?",tip:"Mude frequência, tamanho, ordem ou formato."},
    {id:"otherUses",title:"Propor outros usos",question:"Para que mais essa ideia serviria?",tip:"Imagine novas aplicações ou públicos."},
    {id:"eliminate",title:"Eliminar",question:"O que pode ser retirado sem prejudicar o objetivo?",tip:"Simplifique, removendo etapas desnecessárias."},
    {id:"rearrange",title:"Reverter ou reorganizar",question:"E se você invertesse a sequência?",tip:"Experimente começar pelo fim ou pelo passo mais fácil."}
  ];
  const statuses = ["Rascunho","Explorando","Testando","Aplicada","Arquivada"];
  const areas = ["Pessoal","Casa","Aprendizado","Trabalho","Igreja e voluntariado","Saúde","Projetos","Outro"];
  const root = document.getElementById("ideas");
  if (!root) return;
  const list = root.querySelector("#ideasList");
  const panel = root.querySelector("#ideasWorkspace");
  const search = root.querySelector("#ideasSearch");
  const filter = root.querySelector("#ideasFilter");
  const createForm = root.querySelector("#ideasCreateForm");
  const count = root.querySelector("#ideasCount");
  function all() {
    if (!Array.isArray(data.ideas)) data.ideas = [];
    return data.ideas;
  }
  const escapeText = text => esc(text == null ? "" : String(text));
  const date = () => new Date().toISOString();
  let activeId = all()[0] ? all()[0].id : null;
  let method = "design", stage = 0;
  function active() { return all().find(x => x.id === activeId); }
  function ensureFields(x) {
    if (!x.design || typeof x.design !== "object") x.design = {};
    if (!x.scamper || typeof x.scamper !== "object") x.scamper = {};
    return x;
  }
  function persist(x, label) {
    x.updatedAt = date();
    const ok = save();
    if (label) label.textContent = ok ? "Salvo no navegador" : "Falha ao salvar. Exporte seus dados.";
    return ok;
  }
  function choices(values,current) {
    return values.map(x => '<option value="'+escapeText(x)+'"'+(x === current ? ' selected' : '')+'>'+escapeText(x)+'</option>').join("");
  }
  function renderList() {
    const items = all();
    const q = search.value.trim().toLocaleLowerCase("pt-BR");
    const filtered = items.filter(x => (filter.value === "all" || x.status === filter.value) &&
      (!q || [x.title,x.challenge,x.area].some(v => String(v || "").toLocaleLowerCase("pt-BR").includes(q))))
      .sort((a,b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
    count.textContent = items.length + (items.length === 1 ? " ideia" : " ideias");
    list.innerHTML = filtered.length ? filtered.map(x =>
      '<button type="button" class="idea-item'+(x.id === activeId ? ' active' : '')+'" data-idea-select="'+escapeText(x.id)+'" aria-pressed="'+(x.id === activeId)+'">'+
      '<strong>'+escapeText(x.title)+'</strong><span>'+escapeText(x.area || "Projetos")+' · '+escapeText(x.status || "Rascunho")+'</span></button>'
    ).join("") : '<div class="blank">Nenhuma ideia encontrada. Crie uma ou altere o filtro.</div>';
  }
  function renderPanel() {
    const x = active();
    if (!x) {
      panel.innerHTML = '<div class="blank">Crie uma ideia ou escolha uma da lista para explorá-la.</div>';
      return;
    }
    ensureFields(x);
    const steps = method === "design" ? design : scamper;
    const fields = method === "design" ? x.design : x.scamper;
    stage = Math.max(0, Math.min(stage,steps.length - 1));
    const current = steps[stage];
    const filled = steps.filter(s => String(fields[s.id] || "").trim()).length;
    const already = data.tasks.some(t => t.id === x.lastTaskId && t.title === String(x.nextAction || "").trim());
    const stepButtons = steps.map((s,i) =>
      '<button type="button" data-idea-step="'+i+'" class="'+(i === stage ? "active" : "")+'" aria-label="'+escapeText(s.title)+'" aria-current="'+(i === stage ? "step" : "false")+'">'+
      (i+1)+(String(fields[s.id] || "").trim() ? " ✓" : "")+'</button>'
    ).join("");
    panel.innerHTML = [
      '<div class="idea-panel-head"><div><span class="subtle">Laboratório de Ideias</span><h3>',escapeText(x.title),
      '</h3><p class="subtle">',escapeText(x.challenge || "Explorar possibilidades sem pressa."),'</p></div>',
      '<button type="button" class="secondary smallbtn" data-idea-delete>Excluir</button></div>',
      '<div class="idea-grid">',
      '<label>Estado<select data-idea-field="status">',choices(statuses,x.status),'</select></label>',
      '<label>Área<select data-idea-field="area">',choices(areas,x.area),'</select></label></div>',
      '<div class="idea-tabs">',
      '<button type="button" data-idea-method="design" class="',method === "design" ? "active" : "",'">Design Thinking</button>',
      '<button type="button" data-idea-method="scamper" class="',method === "scamper" ? "active" : "",'">SCAMPER</button></div>',
      '<div class="idea-progress-label"><strong>',method === "design" ? "Compreender e experimentar" : "Reimaginar possibilidades",
      '</strong><span>',filled,' de ',steps.length,' etapas anotadas</span></div>',
      '<div class="progress"><i style="width:',Math.round(100 * filled / steps.length),'%"></i></div>',
      '<div class="idea-step-nav">',stepButtons,'</div>',
      '<div class="idea-stage"><span class="pill">',stage+1,' / ',steps.length,'</span>',
      '<h4>',escapeText(current.title),'</h4>',
      '<p>',escapeText(current.question),'</p>',
      '<p class="subtle">',escapeText(current.tip),'</p>',
      '<label for="ideaStepNote">Suas anotações</label>',
      '<textarea id="ideaStepNote" data-idea-note rows="5" maxlength="10000" placeholder="Anote o que você descobriu. Pode voltar depois.">',
      escapeText(fields[current.id] || ""),'</textarea>',
      '<div class="idea-controls"><button type="button" class="secondary smallbtn" data-idea-prev ',stage === 0 ? "disabled" : "",'>← Anterior</button>',
      '<span class="subtle" data-idea-save>Salvo no navegador</span>',
      '<button type="button" class="primary smallbtn" data-idea-next ',stage === steps.length-1 ? "disabled" : "",'>Próxima →</button></div></div>',
      '<div class="idea-action"><h4>Transformar em ação</h4>',
      '<p class="subtle">Escolha um experimento pequeno. Você pode enviá-lo à aba Tarefas.</p>',
      '<label for="ideaAction">Próximo passo</label>',
      '<input id="ideaAction" data-idea-field="nextAction" maxlength="300" value="',escapeText(x.nextAction || ""),'">',
      '<div class="idea-task-row"><button type="button" class="secondary" data-idea-create-task ',!String(x.nextAction || "").trim() || already ? "disabled" : "",'>',
      already ? "Tarefa já criada" : "＋ Criar tarefa",'</button><span class="subtle">A tarefa terá duração inicial de 15 minutos.</span></div>',
      '<label for="ideaResult">Resultado, feedback ou aprendizado</label>',
      '<textarea id="ideaResult" data-idea-field="result" rows="3" maxlength="10000">',
      escapeText(x.result || ""),'</textarea></div>',
      '<p class="subtle idea-reference">Inspirado na Unidade 4 de Desenvolvimento Pessoal e Organizacional (USF), pp. 118–121.</p>'
    ].join("");
  }
  function renderIdeas() {
    if (!active() && all().length) activeId = all()[0].id;
    renderList();
    renderPanel();
  }
  window.renderIdeas = renderIdeas;

  createForm.addEventListener("submit", e => {
    e.preventDefault();
    const title = root.querySelector("#ideaTitle").value.trim();
    if (!title) return;
    const challenge = root.querySelector("#ideaChallenge").value.trim();
    const x = {
      id:id(), title, challenge, area:root.querySelector("#ideaArea").value,
      status:"Rascunho", design:{define:challenge}, scamper:{}, nextAction:"",
      result:"", lastTaskId:null, createdAt:date(), updatedAt:date()
    };
    all().push(x);
    activeId = x.id; method = "design"; stage = 0;
    persist(x);
    createForm.reset(); renderIdeas();
    panel.querySelector("[data-idea-note]")?.focus();
    toast("Ideia adicionada.");
  });
  search.addEventListener("input",renderList);
  filter.addEventListener("change",renderList);
  list.addEventListener("click",e => {
    const b = e.target.closest("[data-idea-select]");
    if (!b) return;
    activeId = b.dataset.ideaSelect; stage = 0; renderIdeas();
  });
  panel.addEventListener("click",e => {
    const x = active(); if (!x) return;
    const m = e.target.closest("[data-idea-method]");
    if (m) { method = m.dataset.ideaMethod; stage = 0; renderPanel(); return; }
    const s = e.target.closest("[data-idea-step]");
    if (s) { stage = Number(s.dataset.ideaStep); renderPanel(); return; }
    if (e.target.closest("[data-idea-prev]")) { stage--; renderPanel(); return; }
    if (e.target.closest("[data-idea-next]")) { stage++; renderPanel(); return; }
    if (e.target.closest("[data-idea-delete]")) {
      if (!confirm("Excluir esta ideia e suas anotações? As tarefas já criadas serão mantidas.")) return;
      data.ideas = all().filter(y => y.id !== x.id);
      activeId = data.ideas[0]?.id || null;
      if (save()) toast("Ideia excluída."); else toast("Não foi possível salvar.");
      renderIdeas(); return;
    }
    if (e.target.closest("[data-idea-create-task]")) {
      const next = String(x.nextAction || "").trim();
      if (!next || data.tasks.some(t => t.id === x.lastTaskId && t.title === next)) return;
      const before = data.tasks.length;
      addTask(next,x.area || "Projetos",today(),15,false);
      if (data.tasks.length > before) {
        x.lastTaskId = data.tasks[data.tasks.length-1].id;
        persist(x);
      }
      renderIdeas();
    }
  });
  function onField(e) {
    const x = active(); if (!x) return;
    if (e.target.matches("[data-idea-note]")) {
      ensureFields(x);
      const group = method === "design" ? x.design : x.scamper;
      const steps = method === "design" ? design : scamper;
      group[steps[stage].id] = e.target.value;
    } else if (e.target.matches("[data-idea-field]")) {
      const key = e.target.dataset.ideaField;
      if (!["status","area","nextAction","result"].includes(key)) return;
      x[key] = e.target.value;
    } else return;
    persist(x,panel.querySelector("[data-idea-save]"));
    if (e.target.matches('[data-idea-field="status"],[data-idea-field="area"]') && e.type === "change") {
      renderIdeas(); return;
    }
    if (e.target.matches('[data-idea-field="nextAction"]')) {
      const btn = panel.querySelector("[data-idea-create-task]");
      const already = data.tasks.some(t => t.id === x.lastTaskId && t.title === x.nextAction.trim());
      if (btn) { btn.disabled = !x.nextAction.trim() || already; btn.textContent = already ? "Tarefa já criada" : "＋ Criar tarefa"; }
    }
    renderList();
  }
  panel.addEventListener("input",onField);
  panel.addEventListener("change",onField);
  renderIdeas();
})();
