/* Rotina em Foco — Desenvolvimento pessoal (PDI + SWOT)
   Inspirado na Unidade 4 do material de Desenvolvimento Pessoal e Organizacional (USF):
   - SWOT pessoal: pp. 108–109
   - PDI / SMART: pp. 116–117
   Dados guardados no objeto global data, na mesma chave local das tarefas.
   Exportação/importação existentes já incluem os campos novos.
*/
(() => {
  "use strict";
  const host = document.querySelector("#development");
  if (!host) return;
  const $dev = selector => host.querySelector(selector);
  const tabs = [...host.querySelectorAll("[data-development-tab]")];
  const sections = [...host.querySelectorAll("[data-development-panel]")];
  const goalList = $dev("#devGoalList"), goalDetails = $dev("#devGoalDetails");
  const swotList = $dev("#devSwotList"), swotDetails = $dev("#devSwotDetails");
  const areaNames = ["Pessoal","Casa","Aprendizado","Trabalho","Igreja e voluntariado","Saúde","Projetos","Outro"];
  const goalStates = ["Planejada","Em andamento","Concluída","Pausada"];
  const swotFields = [
    {key:"strengths",title:"Forças",type:"Interno · positivo",tip:"Competências, recursos e pontos fortes que você já possui.",placeholder:"Ex.: gosto de investigar problemas e aprender coisas novas"},
    {key:"weaknesses",title:"Fraquezas",type:"Interno · a desenvolver",tip:"Limitações internas e dificuldades que podem ser trabalhadas.",placeholder:"Ex.: ainda preciso praticar apresentações"},
    {key:"opportunities",title:"Oportunidades",type:"Externo · favorável",tip:"Condições do ambiente que você pode aproveitar.",placeholder:"Ex.: cursos acessíveis e projetos para participar"},
    {key:"threats",title:"Ameaças",type:"Externo · desfavorável",tip:"Fatores externos que podem dificultar seus planos.",placeholder:"Ex.: prazos curtos e poucas vagas em uma área"}
  ];
  const smartFields = [
    {key:"specific",title:"S · Específica",tip:"O que exatamente você pretende melhorar?"},
    {key:"measurable",title:"M · Mensurável",tip:"Como poderá verificar a evolução?"},
    {key:"achievable",title:"A · Alcançável",tip:"O que torna a meta possível com seus recursos?"},
    {key:"relevant",title:"R · Relevante",tip:"Por que esse objetivo importa para você?"},
    {key:"timebound",title:"T · Temporal",tip:"Até quando? Qual será o período de revisão?"}
  ];
  let activeTab = "pdi";
  let goalId = null, swotId = null;
  const escValue = x => esc(String(x ?? ""));
  const stamp = () => new Date().toISOString();
  function plans() {
    if (!Array.isArray(data.developmentPlans)) data.developmentPlans = [];
    return data.developmentPlans;
  }
  function swots() {
    if (!Array.isArray(data.swotAnalyses)) data.swotAnalyses = [];
    return data.swotAnalyses;
  }
  function selectedGoal() { return plans().find(x => x.id === goalId); }
  function selectedSwot() { return swots().find(x => x.id === swotId); }
  function updateData(record) {
    record.updatedAt = stamp();
    const ok = save();
    const status = $dev("[data-dev-save-status]");
    if (status) status.textContent = ok ? "Salvo neste navegador" : "Não foi possível salvar; baixe seu backup.";
    return ok;
  }
  function options(values, current) {
    return values.map(value => '<option value="'+escValue(value)+'"'+(value===current ? ' selected' : '')+'>'+escValue(value)+'</option>').join("");
  }
  function markTaskDone(record, action) {
    return !!(record.taskId && data.tasks.some(t => t.id === record.taskId && t.title === String(action || "").trim()));
  }
  function createTaskFrom(record, action, category, deadline) {
    const text = String(action || "").trim();
    if (!text) { toast("Defina uma ação antes de criar a tarefa."); return; }
    if (markTaskDone(record,text)) return;
    const prior = data.tasks.length;
    addTask(text,category || "Projetos",deadline || today(),15,false);
    if (data.tasks.length > prior) {
      record.taskId = data.tasks[data.tasks.length - 1].id;
      updateData(record);
      renderDevelopment();
    }
  }
  function showTab() {
    tabs.forEach(button => {
      const active = button.dataset.developmentTab === activeTab;
      button.classList.toggle("active",active);
      button.setAttribute("aria-pressed",String(active));
    });
    sections.forEach(panel => { panel.hidden = panel.dataset.developmentPanel !== activeTab; });
  }
  function renderGoalList() {
    const q = $dev("#devGoalSearch").value.trim().toLocaleLowerCase("pt-BR");
    const status = $dev("#devGoalFilter").value;
    const matches = plans().filter(x =>
      (status === "all" || x.status === status) &&
      (!q || [x.objective,x.competence,x.action].some(v=>String(v||"").toLocaleLowerCase("pt-BR").includes(q)))
    ).sort((a,b)=>String(b.updatedAt||"").localeCompare(String(a.updatedAt||"")));
    $dev("#devGoalCount").textContent = plans().length+" meta"+(plans().length===1?"":"s");
    goalList.innerHTML = matches.length ? matches.map(x => {
      const selected = x.id === goalId;
      return '<button class="dev-item'+(selected?" active":"")+'" type="button" data-goal-select="'+escValue(x.id)+'" aria-pressed="'+selected+'">'+
        '<strong>'+escValue(x.objective)+'</strong>'+
        '<span>'+escValue(x.status || "Planejada")+' · '+escValue(x.competence || "Competência não informada")+'</span>'+
        '</button>';
    }).join("") : '<div class="blank">Nenhuma meta encontrada.</div>';
  }
  function renderGoalDetails() {
    const x = selectedGoal();
    if (!x) {
      goalDetails.innerHTML = '<div class="blank">Crie ou selecione uma meta para construir seu PDI.</div>';
      return;
    }
    if (!x.smart || typeof x.smart !== "object") x.smart = {};
    const done = markTaskDone(x,x.action);
    const smartHtml = smartFields.map(field =>
      '<label for="devSmart-'+field.key+'">'+escValue(field.title)+'</label>'+
      '<p class="subtle">'+escValue(field.tip)+'</p>'+
      '<textarea id="devSmart-'+field.key+'" rows="2" maxlength="1200" data-smart="'+field.key+'">'+escValue(x.smart[field.key] || "")+'</textarea>'
    ).join("");
    goalDetails.innerHTML = [
      '<div class="dev-card-head"><div><div class="subtle">Plano de Desenvolvimento Individual</div><h3>',escValue(x.objective),'</h3>',
      '<p class="subtle">Meta, competência, ação, prazo e evidência de progresso.</p></div>',
      '<button type="button" class="secondary smallbtn" data-delete-goal>Excluir meta</button></div>',
      '<div class="dev-form-grid"><label>Objetivo<input maxlength="150" data-goal-field="objective" value="',escValue(x.objective),'"></label>',
      '<label>Estado<select data-goal-field="status">',options(goalStates,x.status),'</select></label>',
      '<label>Competência a desenvolver<input maxlength="140" data-goal-field="competence" value="',escValue(x.competence || ""),'"></label>',
      '<label>Prazo<input type="date" data-goal-field="deadline" value="',escValue(x.deadline || ""),'"></label></div>',
      '<label class="dev-label">Ação planejada<textarea data-goal-field="action" rows="3" maxlength="2000" placeholder="O que você fará, concretamente?">',escValue(x.action||""),'</textarea></label>',
      '<label class="dev-label">Evidência do desenvolvimento<textarea data-goal-field="evidence" rows="3" maxlength="3000" placeholder="Projeto concluído, certificado, feedback, exercício realizado...">',escValue(x.evidence||""),'</textarea></label>',
      '<details class="dev-smart"><summary>Guia SMART — torne a meta mais clara</summary><p class="subtle">SMART ajuda a escrever uma meta específica, mensurável, alcançável, relevante e com prazo. Use apenas os campos que fizerem sentido.</p>',
      smartHtml,'</details>',
      '<label class="dev-label">Anotações e revisão<textarea rows="3" maxlength="4000" data-goal-field="notes" placeholder="O que mudou? O que aprendi? Qual ajuste preciso fazer?">',escValue(x.notes||""),'</textarea></label>',
      '<div class="dev-actionbar"><button class="primary" type="button" data-task-from-goal ',!String(x.action||"").trim() || done ? "disabled" : "",'>',done ? "Tarefa já criada" : "＋ Criar tarefa com a ação",'</button>',
      '<span class="subtle" data-dev-save-status>Salvo neste navegador</span></div>',
      '<p class="subtle dev-reference">Modelo do PDI: objetivo, competência, ação planejada, prazo e evidência (USF, Unidade 4, p. 117). A estrutura SMART é explicada na p. 116.</p>'
    ].join("");
  }
  function renderSwotList() {
    const q = $dev("#devSwotSearch").value.trim().toLocaleLowerCase("pt-BR");
    const matches = swots().filter(x =>
      !q || [x.title,x.context].some(v => String(v||"").toLocaleLowerCase("pt-BR").includes(q))
    ).sort((a,b)=>String(b.updatedAt||"").localeCompare(String(a.updatedAt||"")));
    $dev("#devSwotCount").textContent = swots().length+" análise"+(swots().length===1?"":"s");
    swotList.innerHTML = matches.length ? matches.map(x =>
      '<button type="button" class="dev-item'+(x.id===swotId?" active":"")+'" data-swot-select="'+escValue(x.id)+'" aria-pressed="'+(x.id===swotId)+'">'+
      '<strong>'+escValue(x.title)+'</strong><span>'+escValue(x.context||"Diagnóstico pessoal")+'</span></button>'
    ).join("") : '<div class="blank">Nenhuma análise encontrada.</div>';
  }
  function renderSwotDetails() {
    const x = selectedSwot();
    if (!x) {
      swotDetails.innerHTML = '<div class="blank">Crie ou selecione uma análise SWOT para começar.</div>';
      return;
    }
    const quadrants = swotFields.map(field =>
      '<div class="dev-swot-card dev-swot-'+field.key+'"><div class="dev-swot-heading"><strong>'+escValue(field.title)+'</strong><span>'+escValue(field.type)+'</span></div>'+
      '<p class="subtle">'+escValue(field.tip)+'</p>'+
      '<textarea data-swot-field="'+field.key+'" rows="6" maxlength="6000" placeholder="'+escValue(field.placeholder)+'">'+escValue(x[field.key]||"")+'</textarea></div>'
    ).join("");
    const done = markTaskDone(x,x.nextAction);
    swotDetails.innerHTML = [
      '<div class="dev-card-head"><div><div class="subtle">Matriz SWOT pessoal</div><h3>',escValue(x.title),'</h3>',
      '<p class="subtle">Observe fatores internos e externos antes de tomar decisões.</p></div>',
      '<button type="button" class="secondary smallbtn" data-delete-swot>Excluir análise</button></div>',
      '<label class="dev-label">Título<input maxlength="150" data-swot-field="title" value="',escValue(x.title),'"></label>',
      '<label class="dev-label">Situação ou objetivo (opcional)<textarea data-swot-field="context" rows="2" maxlength="1200" placeholder="Ex.: minhas possibilidades de desenvolvimento profissional">',escValue(x.context||""),'</textarea></label>',
      '<div class="dev-swot-matrix">',quadrants,'</div>',
      '<div class="dev-swot-conclusion"><h4>Do diagnóstico à decisão</h4>',
      '<label class="dev-label">O que esta análise mostra?<textarea data-swot-field="insight" rows="3" maxlength="4000" placeholder="Quais fatores merecem atenção? Qual oportunidade pode aproveitar?">',escValue(x.insight||""),'</textarea></label>',
      '<label class="dev-label">Próxima ação concreta<input maxlength="300" data-swot-field="nextAction" placeholder="Ex.: buscar um curso para desenvolver uma competência" value="',escValue(x.nextAction||""),'"></label>',
      '<div class="dev-actionbar"><button type="button" class="primary" data-task-from-swot ',!String(x.nextAction||"").trim() || done ? "disabled" : "",'>',done?"Tarefa já criada":"＋ Criar tarefa com a ação",'</button>',
      '<span class="subtle" data-dev-save-status>Salvo neste navegador</span></div></div>',
      '<p class="subtle dev-reference">SWOT distingue forças e fraquezas internas de oportunidades e ameaças externas (USF, Unidade 4, pp. 108–109).</p>'
    ].join("");
  }
  function renderDevelopment() {
    if (!selectedGoal()) goalId = plans()[0]?.id || null;
    if (!selectedSwot()) swotId = swots()[0]?.id || null;
    showTab();
    renderGoalList(); renderGoalDetails();
    renderSwotList(); renderSwotDetails();
  }
  window.renderDevelopment = renderDevelopment;

  tabs.forEach(button => button.addEventListener("click", () => {
    activeTab = button.dataset.developmentTab;
    showTab();
  }));
  $dev("#devGoalCreate").addEventListener("submit",event => {
    event.preventDefault();
    const objective = $dev("#devNewGoal").value.trim();
    if (!objective) return;
    const x = {id:id(),objective,status:"Planejada",competence:"",action:"",deadline:"",
      evidence:"",notes:"",smart:{},taskId:null,createdAt:stamp(),updatedAt:stamp()};
    plans().push(x); goalId=x.id;
    if (updateData(x)) toast("Meta de desenvolvimento criada.");
    event.target.reset(); renderDevelopment();
    goalDetails.querySelector('[data-goal-field="competence"]')?.focus();
  });
  $dev("#devSwotCreate").addEventListener("submit",event => {
    event.preventDefault();
    const title=$dev("#devNewSwot").value.trim();
    if (!title) return;
    const x={id:id(),title,context:"",strengths:"",weaknesses:"",opportunities:"",threats:"",
      insight:"",nextAction:"",taskId:null,createdAt:stamp(),updatedAt:stamp()};
    swots().push(x); swotId=x.id;
    if (updateData(x)) toast("Análise SWOT criada.");
    event.target.reset(); renderDevelopment();
    swotDetails.querySelector('[data-swot-field="context"]')?.focus();
  });
  $dev("#devGoalSearch").addEventListener("input",renderGoalList);
  $dev("#devGoalFilter").addEventListener("change",renderGoalList);
  $dev("#devSwotSearch").addEventListener("input",renderSwotList);
  goalList.addEventListener("click",e => {
    const item=e.target.closest("[data-goal-select]");if(!item)return;
    goalId=item.dataset.goalSelect;renderGoalList();renderGoalDetails();
  });
  swotList.addEventListener("click",e => {
    const item=e.target.closest("[data-swot-select]");if(!item)return;
    swotId=item.dataset.swotSelect;renderSwotList();renderSwotDetails();
  });
  goalDetails.addEventListener("click",e => {
    const x=selectedGoal();if(!x)return;
    if(e.target.closest("[data-delete-goal]")) {
      if(!confirm("Excluir esta meta? Suas tarefas já criadas continuarão existindo."))return;
      data.developmentPlans=plans().filter(item=>item.id!==x.id);
      goalId=data.developmentPlans[0]?.id||null;save();renderDevelopment();toast("Meta excluída.");
    }else if(e.target.closest("[data-task-from-goal]")) {
      createTaskFrom(x,x.action,"Aprendizado",x.deadline);
    }
  });
  swotDetails.addEventListener("click",e => {
    const x=selectedSwot();if(!x)return;
    if(e.target.closest("[data-delete-swot]")) {
      if(!confirm("Excluir esta análise SWOT? As tarefas já criadas permanecerão."))return;
      data.swotAnalyses=swots().filter(item=>item.id!==x.id);
      swotId=data.swotAnalyses[0]?.id||null;save();renderDevelopment();toast("Análise excluída.");
    }else if(e.target.closest("[data-task-from-swot]")) {
      createTaskFrom(x,x.nextAction,"Pessoal",today());
    }
  });
  function syncTaskButton(scope,x,action) {
    const btn=scope.querySelector("[data-task-from-goal],[data-task-from-swot]");
    if (!btn) return;
    const eligible=String(action||"").trim();
    const exists=markTaskDone(x,action);
    btn.disabled=!eligible||exists;
    btn.textContent=exists?"Tarefa já criada":"＋ Criar tarefa com a ação";
  }
  function onInput(e,type) {
    const x=type==="goal"?selectedGoal():selectedSwot();
    if(!x)return;
    if(type==="goal" && e.target.matches("[data-smart]")) {
      if(!x.smart || typeof x.smart!=="object") x.smart={};
      x.smart[e.target.dataset.smart]=e.target.value;
    }else {
      const name=e.target.dataset[type==="goal"?"goalField":"swotField"];
      const valid=type==="goal" ?
        ["objective","status","competence","action","deadline","evidence","notes"] :
        ["title","context","strengths","weaknesses","opportunities","threats","insight","nextAction"];
      if(!valid.includes(name))return;
      x[name]=e.target.value;
    }
    updateData(x);
    if(type==="goal") {
      syncTaskButton(goalDetails,x,x.action);
      if(e.target.matches('[data-goal-field="objective"],[data-goal-field="status"],[data-goal-field="competence"]')) {
        renderGoalList();
        if(e.target.matches('[data-goal-field="objective"]'))goalDetails.querySelector("h3").textContent=x.objective;
      }
    }else {
      syncTaskButton(swotDetails,x,x.nextAction);
      if(e.target.matches('[data-swot-field="title"]')) {
        renderSwotList();
        swotDetails.querySelector("h3").textContent=x.title;
      }
    }
  }
  goalDetails.addEventListener("input",e=>onInput(e,"goal"));
  goalDetails.addEventListener("change",e=>onInput(e,"goal"));
  swotDetails.addEventListener("input",e=>onInput(e,"swot"));
  swotDetails.addEventListener("change",e=>onInput(e,"swot"));
  renderDevelopment();
})();
