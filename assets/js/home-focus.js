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
  const activityLinks=()=>window.ActivityLinks;
  const showsOn=(r,day)=>!activityLinks()||activityLinks().routineDays(r).includes(day);
  const todayStatus=(r,marks)=>r.activityId&&activityLinks()?.isComplete(r.activityId,today())?"done":marks[r.id];
  let selectedWeekDay=new Date().getDay();
  const escapeText=v=>esc(String(v??""));
  const chartKey="rotina-em-foco-home-charts-v1";
  const charts=["tasks","habits","checkin"];
  let prefs={tasks:false,habits:false,checkin:false},manualSelection=null,lastRenderedDay=today();
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
    const record=allRoutines().find(r=>r.id===recordId);
    if(!record)return;
    const marks=todayMarks();
    if(value==="done"){
      if(record.activityId&&activityLinks())activityLinks().setComplete(record.activityId,today(),true);
      else{marks[recordId]="done";save();}
    }else if(value==="later"){
      marks[recordId]="later";save();
    }else{
      if(record.activityId&&activityLinks()&&todayStatus(record,marks)==="done"){
        activityLinks().setComplete(record.activityId,today(),false);
      }
      delete marks[recordId];save();
    }
    if(typeof render==="function")render();
    else renderHome();
  }
  // O menu é controlado exclusivamente por navigation.js.

  function renderSequence(list,marks){
    const isToday=selectedWeekDay===new Date().getDay();
    const where=$home("#routineSequenceList");
    where.innerHTML=list.length?list.map((r,i)=>{
      const status=isToday?todayStatus(r,marks):null;
      const label=status==="done"?"Feito":status==="later"?"Deixado para depois":"A fazer";
      const action=status==="done"?"Desfazer":status==="later"?"Retomar":"Começar daqui";
      return '<div class="rh-sequence-item"><div class="rh-sequence-text"><small>'+escapeText(r.time||"")+' · '+escapeText(isToday?label:"Programado")+'</small><strong>'+escapeText(r.name)+'</strong>'+(r.activityId&&activityLinks()?.lookup(r.activityId)?'<small class="al-linked">↔ '+escapeText(activityLinks().lookup(r.activityId).name)+'</small>':'')+'</div>'+
        '<div class="rh-sequence-buttons">'+(isToday?'<button class="secondary smallbtn" type="button" data-rh-jump="'+escapeText(r.id)+'">'+action+'</button>':'')+
        '<button class="secondary smallbtn" type="button" data-rh-edit="'+escapeText(r.id)+'" aria-label="Editar '+escapeText(r.name)+'">Editar</button>'+
        '<button class="iconbtn" type="button" data-rh-delete="'+escapeText(r.id)+'" aria-label="Excluir '+escapeText(r.name)+'">×</button></div></div>';
    }).join(""):'<p class="subtle">Você ainda não criou passos para sua rotina.</p>';
  }
  function renderWeekStrip(){
    const days=activityLinks()?.weekdays||[{day:1,name:"Seg"},{day:2,name:"Ter"},{day:3,name:"Qua"},{day:4,name:"Qui"},{day:5,name:"Sex"},{day:6,name:"Sáb"},{day:0,name:"Dom"}];
    const target=$home("#rhWeekStrip");
    target.innerHTML=days.map(w=>{
      const total=allRoutines().filter(r=>showsOn(r,w.day)).length;
      return '<button type="button" data-rh-week-day="'+w.day+'" class="'+(w.day===selectedWeekDay?"active":"")+'" aria-pressed="'+(w.day===selectedWeekDay)+'"><strong>'+w.name+'</strong><small>'+total+'</small></button>';
    }).join("");
    $home("#rhWeekSelectionNote").textContent=selectedWeekDay===new Date().getDay()?
      "Hoje: você pode retomar ou editar um passo da rotina.":
      "Prévia de "+days.find(d=>d.day===selectedWeekDay)?.name+": ajuste os horários e dias dos passos usando Editar.";
  }
  $home("#rhWeekStrip").addEventListener("click",e=>{
    const b=e.target.closest("[data-rh-week-day]");if(!b)return;
    selectedWeekDay=Number(b.dataset.rhWeekDay);
    renderHome();
  });

  function renderHome(){
    ensureRoutineIds();
    const list=sortRoutines().filter(r=>showsOn(r,new Date().getDay())),marks=todayMarks();
    if(lastRenderedDay!==today()){manualSelection=null;lastRenderedDay=today();selectedWeekDay=new Date().getDay();}
    if(lastRenderedDay===today()&&selectedWeekDay!==new Date().getDay()&&!document.querySelector("#rhEditor").open)selectedWeekDay=new Date().getDay();
    const next=list.find(x=>x.id===manualSelection&&!todayStatus(x,marks))||list.find(x=>!todayStatus(x,marks));
    const completed=list.filter(x=>todayStatus(x,marks)==="done").length;
    const later=list.filter(x=>todayStatus(x,marks)==="later").length;
    $home("#rhDate").textContent=new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long"});
    $home("#rhPosition").textContent=next?("Passo "+(list.indexOf(next)+1)+" da sequência"):"Sua rotina de hoje";
    $home("#rhCurrentTime").textContent=next?(next.time||"Sem horário fixo"):"";
    $home("#rhCurrentName").textContent=next?next.name:list.length?(later?"Sem próximos passos por agora":"Rotina finalizada por hoje"):(allRoutines().length?"Sem passos programados hoje":"Por onde você quer começar?");
    $home("#rhCurrentHint").textContent=next?(next.hint||"Comece pelo menor movimento que conseguir."):(list.length?(later?"Você pode retomar os passos deixados para depois quando quiser.":"Você concluiu os passos previstos. Volte amanhã para um novo dia."):(allRoutines().length?"A rotina tem outros dias programados. Confira em Organizar minha rotina.":"Crie um primeiro passo simples. Sua sequência aparecerá aqui."));
    $home("#rhActiveActions").hidden=!next;
    $home("#rhEmptyAction").hidden=!!allRoutines().length;
    $home("#rhAfterActions").hidden=!!next||!allRoutines().length;
    $home("#rhAfterActions").textContent=list.length?completed+" de "+list.length+" passos concluídos"+(later?" · "+later+" para depois":""):"Nenhum passo previsto para hoje.";
    $home("#rhDo").dataset.rhId=next?.id||"";
    $home("#rhLater").dataset.rhId=next?.id||"";
    $home("#routineCount").textContent=list.length+" passo"+(list.length===1?"":"s")+" hoje";
    renderWeekStrip();
    renderSequence(sortRoutines().filter(r=>showsOn(r,selectedWeekDay)),marks);
    renderHomeCharts();
  }
  window.renderRoutineHome=renderHome;
  $home("#rhDo").addEventListener("click",e=>setStep(e.currentTarget.dataset.rhId,"done"));
  $home("#rhLater").addEventListener("click",e=>setStep(e.currentTarget.dataset.rhId,"later"));
  $home("#rhOpenCreate").addEventListener("click",()=>{
    $home("#rhEditor").open=true;
    $home("#rhAddRoutine").focus();
  });
  function setRoutineDays(days){
    document.querySelectorAll("#routineWeekdays input").forEach(box=>box.checked=days.includes(Number(box.value)));
  }
  function selectedRoutineDays(){
    return [...document.querySelectorAll("#routineWeekdays input:checked")].map(b=>Number(b.value));
  }
  function setRoutineActivity(selected){
    const el=document.querySelector("#routineActivitySelect");
    if(activityLinks())el.innerHTML=activityLinks().options(selected,{noneLabel:"Sem vínculo com outras áreas"});
  }
  document.querySelector("#routineActivitySelect").addEventListener("change",e=>{
    const value=e.target.value;
    if(document.querySelector("#modal").dataset.routineEditId||!value)return;
    const related=data.habits.find(h=>h.activityId===value);
    if(related&&Array.isArray(related.weekdays)&&related.weekdays.length)setRoutineDays(related.weekdays);
  });

  $home("#rhAddRoutine").addEventListener("click",()=>{
    const modal=document.querySelector("#modal");
    modal.dataset.routineEditId="";
    document.querySelector("#routineTime").value="08:00";
    document.querySelector("#routineName").value="";
    document.querySelector("#routineType").value="Âncora";
    document.querySelector("#routineHint").value="";
    setRoutineDays(selectedWeekDay===new Date().getDay()?[0,1,2,3,4,5,6]:[selectedWeekDay]);
    setRoutineActivity("");
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
      setRoutineDays(activityLinks()?.routineDays(r)||[0,1,2,3,4,5,6]);
      setRoutineActivity(r.activityId||"");
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
    const weekdays=selectedRoutineDays();if(!weekdays.length){toast("Escolha pelo menos um dia para este passo.");return;}
    const values={time:document.querySelector("#routineTime").value||"08:00",name,type:document.querySelector("#routineType").value,hint:document.querySelector("#routineHint").value.trim(),weekdays};
    const existing=recordId?allRoutines().find(x=>x.id===recordId):null;
    const record=existing||{id:"r"+id()+Date.now().toString(36),...values};
    if(existing)Object.assign(existing,values);else allRoutines().push(record);
    if(activityLinks())activityLinks().linkEntry(record,document.querySelector("#routineActivitySelect").value||"");
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
  ensureRoutineIds();
  renderHome();
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)renderHome();});
})();
