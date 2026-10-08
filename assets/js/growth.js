/* Módulos: Plano de 90 dias e Aprendizagem Contínua.
   Fonte: Desenvolvimento Pessoal e Organizacional, USF, Unidade 4, pp. 113–117 e 129.
   Dados: data.roadmaps e data.learningPaths, gravados pela função save() já existente.
*/
(() => {
  "use strict";
  const root90 = document.querySelector("#roadmap90");
  const rootLearn = document.querySelector("#learning");
  if (!root90 || !rootLearn) return;
  const safe = value => esc(String(value ?? ""));
  const now = () => new Date().toISOString();
  const dayValue = iso => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || "")) return NaN;
    const [y,m,d] = iso.split("-").map(Number);
    return Date.UTC(y,m-1,d)/86400000;
  };
  const plusDays = (iso,n) => {
    const v=dayValue(iso);
    return Number.isFinite(v) ? new Date((v+n)*86400000).toISOString().slice(0,10) : "";
  };
  const daysBetween=(start,other)=>dayValue(other)-dayValue(start);
  const names=["Avaliação inicial","Implementação","Consolidação"];
  const periods=["Dias 1–30","Dias 31–60","Dias 61–90"];
  const helps=[
    "Mapeie competências e contexto (ex.: SWOT). Defina o objetivo e rascunhe seu PDI.",
    "Execute ações de aprendizagem e amplie experiências ou relacionamentos relevantes.",
    "Aplique o que aprendeu em um projeto, reveja o PDI e planeje o próximo ciclo."
  ];
  const modes=["Curso","Leitura","Projeto prático","Mentoria / troca","Microlearning","Outro"];
  const statuses=["Em andamento","Pausado","Concluído"];
  let roadmapId=null,learningId=null;
  const getRoadmaps=()=>Array.isArray(data.roadmaps)?data.roadmaps:(data.roadmaps=[]);
  const getPaths=()=>Array.isArray(data.learningPaths)?data.learningPaths:(data.learningPaths=[]);
  const plan=()=>getRoadmaps().find(x=>x.id===roadmapId);
  const path=()=>getPaths().find(x=>x.id===learningId);
  function persist(entry,label) {
    entry.updatedAt=now();
    const ok=save();
    if(label) label.textContent=ok?"Salvo neste navegador":"Falha ao salvar: faça backup.";
    return ok;
  }
  function options(values,current){
    return values.map(x=>'<option'+(x===current?" selected":"")+'>'+safe(x)+'</option>').join("");
  }
  function fillRoadmap(entry){
    if(!Array.isArray(entry.phases))entry.phases=[];
    for(let i=0;i<3;i++){
      if(!entry.phases[i]||typeof entry.phases[i]!=="object")entry.phases[i]={};
      Object.assign(entry.phases[i],{done:!!entry.phases[i].done});
    }
    return entry;
  }
  function renderRoadmapList(){
    const values=getRoadmaps();
    root90.querySelector("#roadmapCount").textContent=values.length+" plano"+(values.length===1?"":"s");
    root90.querySelector("#roadmapList").innerHTML=values.length?values.slice().sort((a,b)=>String(b.updatedAt||"").localeCompare(String(a.updatedAt||""))).map(p=>{
      const completed=(p.phases||[]).filter(x=>x.done).length;
      return '<button type="button" class="gr-entry'+(p.id===roadmapId?' active':'')+'" data-roadmap-select="'+safe(p.id)+'"><strong>'+safe(p.title)+'</strong><span>'+safe(p.startDate)+' · '+completed+'/3 fases marcadas</span></button>';
    }).join(""):'<p class="blank">Crie um plano para organizar seus próximos 90 dias.</p>';
  }
  function renderRoadmap(){
    if(!plan())roadmapId=getRoadmaps()[0]?.id||null;
    renderRoadmapList();
    const holder=root90.querySelector("#roadmapDetail");
    const p=plan();
    if(!p){holder.innerHTML='<div class="blank">Selecione um plano para editar as três fases.</div>';return;}
    fillRoadmap(p);
    const day=daysBetween(p.startDate,today())+1;
    const phaseNum=day>=1&&day<=90?Math.floor((day-1)/30):-1;
    const complete=p.phases.filter(x=>x.done).length;
    const phaseUI=p.phases.map((v,i)=>{
      const from=plusDays(p.startDate,i*30),to=plusDays(p.startDate,i*30+29);
      const repeated=data.tasks.some(t=>t.id===v.taskId&&t.title===String(v.action||"").trim());
      return '<article class="gr-phase'+(phaseNum===i?" current":"")+'"><div class="gr-phase-head"><div><span class="pill">'+periods[i]+'</span><h4>'+names[i]+'</h4><p class="subtle">'+helps[i]+'</p><p class="subtle">'+safe(from)+' até '+safe(to)+'</p></div>'+
      '<label class="gr-check"><input type="checkbox" data-roadmap-done="'+i+'" '+(v.done?'checked':'')+'> Fase revisada</label></div>'+
      '<label>Ações principais<textarea rows="3" data-roadmap-phase="'+i+'" data-roadmap-field="action" placeholder="Quais ações concretas você pretende realizar?">'+safe(v.action||"")+'</textarea></label>'+
      '<label>Entrega / evidência<textarea rows="2" data-roadmap-phase="'+i+'" data-roadmap-field="evidence" placeholder="Como saberá que avançou?">'+safe(v.evidence||"")+'</textarea></label>'+
      '<label>Revisão e ajustes<textarea rows="2" data-roadmap-phase="'+i+'" data-roadmap-field="review" placeholder="O que funcionou? O que precisa ser revisto?">'+safe(v.review||"")+'</textarea></label>'+
      '<button class="secondary smallbtn" type="button" data-roadmap-task="'+i+'" '+(!String(v.action||"").trim()||repeated?'disabled':'')+'>'+ (repeated?'Tarefa já criada':'＋ Criar tarefa com a ação')+'</button></article>';
    }).join("");
    holder.innerHTML='<div class="gr-panel-title"><div><h3>'+safe(p.title)+'</h3><p class="subtle">Um ciclo de 90 dias, com revisões ao longo do caminho.</p></div><button type="button" class="secondary smallbtn" data-roadmap-delete>Excluir</button></div>'+
      '<div class="gr-stats"><span class="pill">'+(day<1?"Ainda não começou":day>90?"Ciclo de 90 dias encerrado":"Dia "+day+" de 90")+'</span><span class="subtle">'+complete+' de 3 fases revisadas</span></div>'+
      '<div class="progress"><i style="width:'+(complete*100/3)+'%"></i></div>'+
      '<label class="gr-label">Nome do plano<input data-roadmap-top="title" maxlength="130" value="'+safe(p.title)+'"></label>'+
      '<label class="gr-label">Data de início<input type="date" data-roadmap-top="startDate" value="'+safe(p.startDate)+'"></label>'+
      '<label class="gr-label">Objetivo do ciclo<textarea rows="2" data-roadmap-top="objective" placeholder="O que você quer construir ao longo do ciclo?">'+safe(p.objective||"")+'</textarea></label>'+
      '<div class="gr-phases">'+phaseUI+'</div><p class="subtle gr-source">Adaptação do roteiro de 90 dias da USF, Unidade 4, p. 129. As fases têm a mesma duração; você pode revisar ações e prazos conforme sua realidade.</p><span class="subtle" data-growth-status></span>';
  }
  function showTask(name,category,due,record){
    const txt=String(name||"").trim();
    if(!txt)return;
    if(data.tasks.some(t=>t.id===record.taskId&&t.title===txt))return;
    const len=data.tasks.length;
    addTask(txt,category,due||today(),15,false);
    if(data.tasks.length>len){record.taskId=data.tasks[data.tasks.length-1].id;save();}
    renderRoadmap();renderLearning();
  }
  root90.querySelector("#roadmapCreate").addEventListener("submit",e=>{
    e.preventDefault();
    const title=root90.querySelector("#roadmapTitle").value.trim();
    const start=root90.querySelector("#roadmapStart").value;
    if(!title||!Number.isFinite(dayValue(start)))return;
    const p={id:id(),title,startDate:start,objective:"",phases:[{},{},{}],createdAt:now(),updatedAt:now()};
    fillRoadmap(p);getRoadmaps().push(p);roadmapId=p.id;persist(p);
    e.target.reset();root90.querySelector("#roadmapStart").value=today();
    renderRoadmap();toast("Plano de 90 dias criado.");
  });
  root90.querySelector("#roadmapList").addEventListener("click",e=>{
    const b=e.target.closest("[data-roadmap-select]");
    if(b){roadmapId=b.dataset.roadmapSelect;renderRoadmap();}
  });
  const detail90=root90.querySelector("#roadmapDetail");
  detail90.addEventListener("click",e=>{
    const p=plan();if(!p)return;
    if(e.target.closest("[data-roadmap-delete]")){
      if(!confirm("Excluir este plano? As tarefas criadas serão mantidas."))return;
      data.roadmaps=getRoadmaps().filter(x=>x.id!==p.id);
      roadmapId=data.roadmaps[0]?.id||null;save();renderRoadmap();return;
    }
    const button=e.target.closest("[data-roadmap-task]");
    if(button){
      const i=Number(button.dataset.roadmapTask),ph=p.phases[i];
      showTask(ph.action,"Projetos",plusDays(p.startDate,i*30+29),ph);
    }
  });
  function changed90(e){
    const p=plan();if(!p)return;
    const field=e.target.dataset.roadmapTop;
    if(field){
      if(!["title","startDate","objective"].includes(field))return;
      if(field==="startDate"&&!Number.isFinite(dayValue(e.target.value)))return;
      p[field]=e.target.value;
    }else if(e.target.dataset.roadmapDone!==undefined){
      const i=Number(e.target.dataset.roadmapDone);
      p.phases[i].done=e.target.checked;
    }else if(e.target.dataset.roadmapPhase!==undefined){
      const i=Number(e.target.dataset.roadmapPhase),name=e.target.dataset.roadmapField;
      if(!["action","evidence","review"].includes(name)||i<0||i>2)return;
      p.phases[i][name]=e.target.value;
    }else return;
    persist(p,detail90.querySelector("[data-growth-status]"));
    if(e.type==="change"&&(field==="startDate"||e.target.dataset.roadmapDone!==undefined))renderRoadmap();
    else{
      if(field==="title")detail90.querySelector("h3").textContent=p.title;
      renderRoadmapList();
      const i=Number(e.target.dataset.roadmapPhase);
      if(e.target.dataset.roadmapField==="action"){
        const b=detail90.querySelector('[data-roadmap-task="'+i+'"]');
        if(b){
          const ph=p.phases[i],exists=data.tasks.some(t=>t.id===ph.taskId&&t.title===String(ph.action||"").trim());
          b.disabled=!String(ph.action||"").trim()||exists;
          b.textContent=exists?"Tarefa já criada":"＋ Criar tarefa com a ação";
        }
      }
    }
  }
  detail90.addEventListener("input",changed90);
  detail90.addEventListener("change",changed90);

  // Aprendizagem: cursos, competências e experiências; sessões de 5–15 minutos
  function renderLearningList(){
    const q=rootLearn.querySelector("#learningSearch").value.trim().toLocaleLowerCase("pt-BR");
    const values=getPaths();
    rootLearn.querySelector("#learningCount").textContent=values.length+" percurso"+(values.length===1?"":"s");
    const hits=values.filter(x=>[x.title,x.competence,x.mode].some(v=>String(v||"").toLocaleLowerCase("pt-BR").includes(q)));
    rootLearn.querySelector("#learningList").innerHTML=hits.length?hits.slice().sort((a,b)=>String(b.updatedAt||"").localeCompare(String(a.updatedAt||""))).map(x=>{
      const count=(x.sessions||[]).length;
      return '<button type="button" class="gr-entry'+(learningId===x.id?" active":"")+'" data-learn-select="'+safe(x.id)+'"><strong>'+safe(x.title)+'</strong><span>'+safe(x.competence||"Competência a definir")+' · '+count+' sessões</span></button>';
    }).join(""):'<div class="blank">Ainda não há percursos correspondentes.</div>';
  }
  function renderLearning(){
    if(!path())learningId=getPaths()[0]?.id||null;
    renderLearningList();
    const holder=rootLearn.querySelector("#learningDetail"),x=path();
    if(!x){holder.innerHTML='<div class="blank">Crie ou selecione um percurso de aprendizagem.</div>';return;}
    if(!Array.isArray(x.sessions))x.sessions=[];
    const total=x.sessions.reduce((sum,s)=>sum+(Number(s.minutes)||0),0);
    const goal=Number(x.targetMinutes)||0;
    const pct=goal?Math.min(100,Math.round(total/goal*100)):0;
    const taskExists=data.tasks.some(t=>t.id===x.taskId&&t.title===String(x.nextAction||"").trim());
    const notes=x.sessions.slice().reverse().map(s=>'<article class="gr-session"><div><strong>'+safe(s.date)+' · '+safe(s.minutes)+' min</strong><span class="subtle">'+safe(s.topic)+'</span></div>'+
      '<p>'+safe(s.application||"Sem aplicação registrada")+'</p><button type="button" class="secondary smallbtn" data-session-delete="'+safe(s.id)+'" aria-label="Excluir sessão">Excluir</button></article>').join("");
    holder.innerHTML='<div class="gr-panel-title"><div><h3>'+safe(x.title)+'</h3><p class="subtle">Aprender, aplicar e registrar.</p></div><button type="button" class="secondary smallbtn" data-learning-delete>Excluir</button></div>'+
      '<div class="gr-stats"><span class="pill">'+x.sessions.length+' sessões</span><span class="pill">'+total+' min estudados</span></div>'+
      (goal?'<div class="progress"><i style="width:'+pct+'%"></i></div><p class="subtle">'+pct+'% da meta de '+goal+' minutos registrada (não mede domínio do conteúdo).</p>':'')+
      '<div class="gr-meta"><label>Nome<input data-learn-field="title" maxlength="130" value="'+safe(x.title)+'"></label>'+
      '<label>Competência<input data-learn-field="competence" maxlength="130" placeholder="Ex.: comunicação, Python" value="'+safe(x.competence||"")+'"></label>'+
      '<label>Modalidade<select data-learn-field="mode">'+options(modes,x.mode||"Curso")+'</select></label>'+
      '<label>Estado<select data-learn-field="status">'+options(statuses,x.status||"Em andamento")+'</select></label>'+
      '<label>Meta de minutos (opcional)<input type="number" data-learn-field="targetMinutes" min="0" max="100000" value="'+safe(x.targetMinutes||"")+'"></label></div>'+
      '<label class="gr-label">Objetivo / curso<textarea data-learn-field="goal" rows="2" placeholder="O que você quer conseguir fazer na prática?">'+safe(x.goal||"")+'</textarea></label>'+
      '<div class="gr-block"><h4>Nova sessão de aprendizagem</h4><p class="subtle">Uma dose breve de 5–15 minutos, ou outro bloco compatível com sua rotina.</p>'+
      '<form id="learningSessionForm"><div class="gr-meta"><label>Data<input type="date" name="date" required value="'+today()+'"></label>'+
      '<label>Tempo<select name="minutes"><option value="5">5 min</option><option value="10" selected>10 min</option><option value="15">15 min</option><option value="25">25 min</option><option value="45">45 min</option></select></label></div>'+
      '<label class="gr-label">O que aprendeu?<input name="topic" maxlength="250" required placeholder="Ex.: tabela dinâmica no Excel"></label>'+
      '<label class="gr-label">Como aplicou ou vai aplicar?<textarea name="application" rows="2" maxlength="1500" placeholder="Ex.: reproduzi uma tabela usando dados de exemplo"></textarea></label>'+
      '<button type="submit" class="primary">＋ Registrar sessão</button></form></div>'+
      '<div class="gr-block"><h4>Próxima aplicação</h4><label class="gr-label">Próximo passo<input data-learn-field="nextAction" maxlength="300" value="'+safe(x.nextAction||"")+'" placeholder="Ex.: criar uma planilha com fórmulas"></label>'+
      '<div class="gr-action"><button type="button" class="secondary" data-learning-task '+(!String(x.nextAction||"").trim()||taskExists?'disabled':'')+'>'+(taskExists?'Tarefa já criada':'＋ Criar tarefa')+'</button><span class="subtle">Envia para a aba Tarefas.</span></div></div>'+
      '<div class="gr-block"><h4>Histórico de sessões</h4>'+(notes||'<p class="subtle">Registre sua primeira sessão para acompanhar os avanços.</p>')+'</div>'+
      '<p class="subtle gr-source">Síntese aplicada dos princípios de aprendizagem de adultos (Knowles et al., 2005) e microlearning (Hug, 2018), apresentados pela USF, Unidade 4, pp. 114–116.</p><span class="subtle" data-growth-status></span>';
  }
  rootLearn.querySelector("#learningCreate").addEventListener("submit",e=>{
    e.preventDefault();
    const title=rootLearn.querySelector("#learningTitle").value.trim();
    if(!title)return;
    const x={id:id(),title,competence:"",mode:"Curso",status:"Em andamento",goal:"",targetMinutes:"",
      nextAction:"",taskId:null,sessions:[],createdAt:now(),updatedAt:now()};
    getPaths().push(x);learningId=x.id;persist(x);e.target.reset();renderLearning();toast("Percurso criado.");
  });
  rootLearn.querySelector("#learningSearch").addEventListener("input",renderLearningList);
  rootLearn.querySelector("#learningList").addEventListener("click",e=>{
    const item=e.target.closest("[data-learn-select]");
    if(item){learningId=item.dataset.learnSelect;renderLearning();}
  });
  const detailLearn=rootLearn.querySelector("#learningDetail");
  detailLearn.addEventListener("submit",e=>{
    if(e.target.id!=="learningSessionForm")return;
    e.preventDefault();
    const x=path(),f=e.target;
    const date=f.elements.date.value,topic=f.elements.topic.value.trim(),minutes=Number(f.elements.minutes.value);
    if(!x||!topic||!Number.isFinite(dayValue(date))||![5,10,15,25,45].includes(minutes))return;
    x.sessions.push({id:id(),date,minutes,topic,application:f.elements.application.value.trim()});
    persist(x);renderLearning();toast("Sessão registrada.");
  });
  detailLearn.addEventListener("click",e=>{
    const x=path();if(!x)return;
    if(e.target.closest("[data-learning-delete]")){
      if(!confirm("Excluir este percurso e seu histórico de sessões?"))return;
      data.learningPaths=getPaths().filter(y=>y.id!==x.id);
      learningId=data.learningPaths[0]?.id||null;save();renderLearning();return;
    }
    const b=e.target.closest("[data-session-delete]");
    if(b){x.sessions=x.sessions.filter(s=>s.id!==b.dataset.sessionDelete);persist(x);renderLearning();return;}
    if(e.target.closest("[data-learning-task]")){
      showTask(x.nextAction,"Aprendizado",today(),x);
    }
  });
  function fieldChanged(e){
    const x=path();if(!x)return;
    const k=e.target.dataset.learnField;
    if(!["title","competence","mode","status","goal","targetMinutes","nextAction"].includes(k))return;
    x[k]=e.target.value;
    persist(x,detailLearn.querySelector("[data-growth-status]"));
    if(k==="title")detailLearn.querySelector("h3").textContent=x.title;
    if(k==="targetMinutes"&&e.type==="change"){renderLearning();return;}
    if(k==="nextAction"){
      const b=detailLearn.querySelector("[data-learning-task]");
      const exists=data.tasks.some(t=>t.id===x.taskId&&t.title===x.nextAction.trim());
      if(b){b.disabled=!x.nextAction.trim()||exists;b.textContent=exists?"Tarefa já criada":"＋ Criar tarefa";}
    }
    renderLearningList();
  }
  detailLearn.addEventListener("input",fieldChanged);
  detailLearn.addEventListener("change",fieldChanged);
  window.renderGrowth = () => {renderRoadmap();renderLearning();};
  window.renderGrowth();
})();
