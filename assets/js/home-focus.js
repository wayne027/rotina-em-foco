/* Rotina em Foco — modo de início simples e navegação por menu oculto.
   Compatível com a estrutura e as chaves de armazenamento anteriores.
   - data.routines: blocos existentes (agora com id e pista opcional)
   - data.routineProgress[AAAA-MM-DD][id]: done / later
   - gráficos de início: preferências locais separadas (não exigem conta)
*/
(() => {
  "use strict";
  const root=document.querySelector("#routineHome");
  if(!root)return;
  const allRoutines=()=>Array.isArray(data.routines)?data.routines:(data.routines=[]);
  const $home=s=>root.querySelector(s);
  const sortRoutines=()=>allRoutines().slice().sort((a,b)=>String(a.time||"").localeCompare(String(b.time||"")));
  const escapeText=v=>esc(String(v??""));
  const drawer=document.querySelector(".nav");
  const menuButton=document.querySelector("#openDrawer");
  const closeButton=document.querySelector("#closeDrawer");
  const shade=document.querySelector("#drawerShade");
  const chartKey="rotina-em-foco-home-charts-v1";
  const charts=["tasks","habits","checkin"];
  let prefs={tasks:false,habits:false,checkin:false},returnFocus=null,manualSelection=null,lastRenderedDay=today();
  try {
    const saved=JSON.parse(localStorage.getItem(chartKey)||"{}");
    for(const k of charts) prefs[k]=saved[k]===true;
  }catch{}

  function ensureRoutineIds(){
    let changed=false;
    for(const r of allRoutines()){
      if(!r.id){r.id="r"+id()+Date.now().toString(36);changed=true;}
    }
    if(changed)save();
  }
  function todayMarks(){
    if(!data.routineProgress||typeof data.routineProgress!=="object"||Array.isArray(data.routineProgress)){
      data.routineProgress={};
    }
    const date=today();
    if(!data.routineProgress[date]||typeof data.routineProgress[date]!=="object"){
      data.routineProgress[date]={};
    }
    return data.routineProgress[date];
  }
  function setStep(recordId,value){
    if(value)manualSelection=null;
    const marks=todayMarks();
    if(value) marks[recordId]=value;
    else delete marks[recordId];
    if(!save())toast("Não foi possível salvar a rotina. Exporte seus dados.");
    renderHome();
  }
  function openMenu(){
    returnFocus=document.activeElement;
    document.body.classList.add("menu-open");
    menuButton.setAttribute("aria-expanded","true");
    drawer.setAttribute("aria-hidden","false");
    closeButton.focus();
  }
  function closeMenu(){
    document.body.classList.remove("menu-open");
    menuButton.setAttribute("aria-expanded","false");
    drawer.setAttribute("aria-hidden","true");
    const dest=returnFocus&&document.contains(returnFocus)?returnFocus:menuButton;
    dest.focus();returnFocus=null;
  }
  menuButton.addEventListener("click",()=>document.body.classList.contains("menu-open")?closeMenu():openMenu());
  document.querySelector("#rhExplore")?.addEventListener("click",openMenu);
  closeButton.addEventListener("click",closeMenu);
  shade.addEventListener("click",closeMenu);
  drawer.querySelectorAll("[data-view]").forEach(btn=>btn.addEventListener("click",()=>{
    if(document.body.classList.contains("menu-open"))closeMenu();
  }));
  document.addEventListener("keydown",e=>{
    if(e.key==="Escape"&&document.body.classList.contains("menu-open"))closeMenu();
    if(e.key!=="Tab"||!document.body.classList.contains("menu-open"))return;
    const controls=[...drawer.querySelectorAll("button:not([disabled])")];
    if(!controls.length)return;
    const first=controls[0],last=controls[controls.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  });

  function renderSequence(list,marks){
    const where=$home("#routineSequenceList");
    where.innerHTML=list.length?list.map((r,i)=>{
      const status=marks[r.id];
      const label=status==="done"?"Feito":status==="later"?"Deixado para depois":"A fazer";
      const action=status==="done"?"Desfazer":status==="later"?"Retomar":"Começar daqui";
      return '<div class="rh-sequence-item"><div class="rh-sequence-text"><small>'+escapeText(r.time||"")+' · '+escapeText(label)+'</small><strong>'+escapeText(r.name)+'</strong></div>'+
        '<div class="rh-sequence-buttons"><button class="secondary smallbtn" type="button" data-rh-jump="'+escapeText(r.id)+'">'+action+'</button>'+
        '<button class="secondary smallbtn" type="button" data-rh-edit="'+escapeText(r.id)+'" aria-label="Editar '+escapeText(r.name)+'">Editar</button>'+
        '<button class="iconbtn" type="button" data-rh-delete="'+escapeText(r.id)+'" aria-label="Excluir '+escapeText(r.name)+'">×</button></div></div>';
    }).join(""):'<p class="subtle">Você ainda não criou passos para sua rotina.</p>';
  }
  function renderHome(){
    ensureRoutineIds();
    const list=sortRoutines(),marks=todayMarks();
    if(lastRenderedDay!==today()){manualSelection=null;lastRenderedDay=today();}
    const next=list.find(x=>x.id===manualSelection&&!marks[x.id])||list.find(x=>!marks[x.id]);
    const completed=list.filter(x=>marks[x.id]==="done").length;
    const later=list.filter(x=>marks[x.id]==="later").length;
    $home("#rhDate").textContent=new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long"});
    $home("#rhPosition").textContent=next?("Passo "+(list.indexOf(next)+1)+" da sequência"):"Sua rotina de hoje";
    $home("#rhCurrentTime").textContent=next?(next.time||"Sem horário fixo"):"";
    $home("#rhCurrentName").textContent=next?next.name:list.length?(later?"Sem próximos passos por agora":"Rotina finalizada por hoje"):"Por onde você quer começar?";
    $home("#rhCurrentHint").textContent=next?(next.hint||"Comece pelo menor movimento que conseguir."):(list.length?(later?"Você pode retomar os passos deixados para depois quando quiser.":"Você concluiu os passos previstos. Volte amanhã para um novo dia."):"Crie um primeiro passo simples. Sua sequência aparecerá aqui.");
    $home("#rhActiveActions").hidden=!next;
    $home("#rhEmptyAction").hidden=!!list.length;
    $home("#rhAfterActions").hidden=!!next||!list.length;
    $home("#rhAfterActions").textContent=completed+" de "+list.length+" passos concluídos"+(later?" · "+later+" para depois":"");
    $home("#rhDo").dataset.rhId=next?.id||"";
    $home("#rhLater").dataset.rhId=next?.id||"";
    $home("#routineCount").textContent=list.length+" passo"+(list.length===1?"":"s");
    renderSequence(list,marks);
    renderHomeCharts();
  }
  window.renderRoutineHome=renderHome;
  $home("#rhDo").addEventListener("click",e=>setStep(e.currentTarget.dataset.rhId,"done"));
  $home("#rhLater").addEventListener("click",e=>setStep(e.currentTarget.dataset.rhId,"later"));
  $home("#rhOpenCreate").addEventListener("click",()=>{
    $home("#rhEditor").open=true;
    $home("#rhAddRoutine").focus();
  });
  $home("#rhAddRoutine").addEventListener("click",()=>{
    const modal=document.querySelector("#modal");
    modal.dataset.routineEditId="";
    document.querySelector("#routineTime").value="08:00";
    document.querySelector("#routineName").value="";
    document.querySelector("#routineType").value="Âncora";
    document.querySelector("#routineHint").value="";
    document.querySelector("#saveRoutine").textContent="Salvar passo";
    document.querySelector("#modalTitle").textContent="Novo passo da rotina";
    modal.classList.add("show");
    document.querySelector("#routineName").focus();
  });
  const sequence=$home("#routineSequenceList");
  sequence.addEventListener("click",e=>{
    const btn=e.target.closest("[data-rh-jump],[data-rh-edit],[data-rh-delete]");
    if(!btn)return;
    const key=btn.dataset.rhJump??btn.dataset.rhEdit??btn.dataset.rhDelete;
    const r=allRoutines().find(x=>x.id===key);if(!r)return;
    if(btn.dataset.rhJump!==undefined){
      manualSelection=key;
      setStep(key,null);
      $home("#rhEditor").open=false;
      $home("#rhCurrentName").focus();
    }else if(btn.dataset.rhEdit!==undefined){
      const modal=document.querySelector("#modal");
      modal.dataset.routineEditId=key;
      document.querySelector("#routineTime").value=r.time||"08:00";
      document.querySelector("#routineName").value=r.name||"";
      document.querySelector("#routineType").value=r.type||"Âncora";
      document.querySelector("#routineHint").value=r.hint||"";
      document.querySelector("#saveRoutine").textContent="Salvar alterações";
      document.querySelector("#modalTitle").textContent="Editar passo da rotina";
      modal.classList.add("show");
      document.querySelector("#routineName").focus();
    }else if(btn.dataset.rhDelete!==undefined){
      if(!confirm('Excluir o passo "'+r.name+'"?'))return;
      data.routines=allRoutines().filter(x=>x.id!==key);
      // Histórico de dias anteriores fica preservado no backup e não aparece na rotina atual.
      save();render();toast("Passo excluído.");
    }
  });
  // Substitui o handler antigo, preservando o modal e o formato de data.routines.
  document.querySelector("#addRoutine").onclick=()=>$home("#rhAddRoutine").click();
  document.querySelector("#saveRoutine").onclick=()=>{
    const name=document.querySelector("#routineName").value.trim();
    if(!name){document.querySelector("#routineName").focus();return;}
    const modal=document.querySelector("#modal"),recordId=modal.dataset.routineEditId;
    const values={time:document.querySelector("#routineTime").value||"08:00",name,type:document.querySelector("#routineType").value,hint:document.querySelector("#routineHint").value.trim()};
    const existing=recordId?allRoutines().find(x=>x.id===recordId):null;
    if(existing)Object.assign(existing,values);
    else allRoutines().push({id:"r"+id()+Date.now().toString(36),...values});
    modal.classList.remove("show");modal.dataset.routineEditId="";
    document.querySelector("#routineName").value="";
    save();render();toast(existing?"Passo atualizado.":"Passo criado.");
  };
  document.querySelector("#closeModal").addEventListener("click",()=>{
    document.querySelector("#modal").dataset.routineEditId="";
  });

  // Todos desmarcados por padrão. Não exibir gráficos sem uma escolha explícita.
  function saveChartPrefs(){
    try{localStorage.setItem(chartKey,JSON.stringify(prefs));return true;}catch{return false;}
  }
  const toggles=[...document.querySelectorAll("[data-rh-chart-setting]")];
  toggles.forEach(input=>{
    input.checked=!!prefs[input.dataset.rhChartSetting];
    input.addEventListener("change",()=>{
      prefs[input.dataset.rhChartSetting]=input.checked;
      const status=document.querySelector("#rhChartStatus");
      if(status)status.textContent=saveChartPrefs()?"Escolhas salvas neste navegador.":"Não foi possível salvar essa preferência.";
      renderHomeCharts();
    });
  });
  function lastDays(count){
    return Array.from({length:count},(_,i)=>{
      const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-(count-1-i));
      return isoLocal(d);
    });
  }
  function miniChart(vals,max,labels,dates){
    return '<div class="rh-bars" role="img" aria-label="'+escapeText(labels)+'">'+vals.map((v,i)=>{
      const height=Math.max(3,Math.round((v/Math.max(1,max))*100));
      return '<div class="rh-bar-column"><div class="rh-bar-track"><div class="rh-bar" style="height:'+height+'%"></div></div><small>'+escapeText(new Date(dates[i]+"T12:00:00").toLocaleDateString("pt-BR",{weekday:"short"}).replace(".",""))+'</small></div>';
    }).join("")+'</div>';
  }
  function renderHomeCharts(){
    const where=$home("#rhCharts"),any=charts.some(k=>prefs[k]);
    where.hidden=!any;
    if(!any){where.innerHTML="";return;}
    let cards=[];
    if(prefs.tasks){
      const tasks=data.tasks.filter(x=>x.date===today());
      const done=tasks.filter(x=>x.done).length;
      const pct=tasks.length?Math.round(done/tasks.length*100):0;
      cards.push('<section class="rh-chart"><h3>Tarefas de hoje</h3><strong>'+done+' / '+tasks.length+'</strong><div class="progress"><i style="width:'+pct+'%"></i></div><p class="subtle">Concluídas hoje · ver em Tarefas</p></section>');
    }
    if(prefs.habits){
      const days=lastDays(7),values=days.map(day=>data.habits.filter(h=>(h.doneDates||[]).includes(day)).length);
      const max=Math.max(data.habits.length,...values,1);
      cards.push('<section class="rh-chart"><h3>Hábitos · 7 dias</h3>'+miniChart(values,max,"Hábitos realizados por dia nos últimos sete dias",days)+
        '<p class="subtle">Número de hábitos marcados por dia</p></section>');
    }
    if(prefs.checkin){
      const days=lastDays(7),values=days.map(day=>Number(data.checkins.find(x=>x.date===day)?.focus)||0);
      cards.push('<section class="rh-chart"><h3>Foco · 7 dias</h3>'+miniChart(values,5,"Foco registrado nos últimos sete dias, escala de 1 a 5",days)+
        '<p class="subtle">Check-in · escala 1–5; espaço mínimo indica ausência de registro</p></section>');
    }
    where.innerHTML=cards.join("");
  }
  // Navegação sempre fechada ao abrir o site e voltar ao início.
  drawer.setAttribute("aria-hidden","true");
  menuButton.setAttribute("aria-expanded","false");
  ensureRoutineIds();
  renderHome();
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)renderHome();});
})();
