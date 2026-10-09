/* Atividades conectadas — Rotina em Foco, revisão 2.
 * Uma atividade tem identidade por ID, NUNCA por nome. Habitos e rotinas
 * podem compartilhar o mesmo activityId para representar a MESMA execução.
 * Os dados históricos ficam intactos. A ligação só afeta o dia atual e futuro.
 * Compatível com activityCatalog, activityCompletions e as chaves existentes.
 */
(() => {
  "use strict";
  const weekdays=[{day:1,name:"Seg"},{day:2,name:"Ter"},{day:3,name:"Qua"},{day:4,name:"Qui"},{day:5,name:"Sex"},{day:6,name:"Sáb"},{day:0,name:"Dom"}];
  const newId=()=> "act_"+Date.now().toString(36)+"_"+id();
  const catalog=()=>Array.isArray(data.activityCatalog)?data.activityCatalog:(data.activityCatalog=[]);
  const completions=()=>{
    if(!data.activityCompletions||typeof data.activityCompletions!=="object"||Array.isArray(data.activityCompletions))data.activityCompletions={};
    return data.activityCompletions;
  };
  const validDays=days=>Array.isArray(days)?[...new Set(days.map(Number).filter(x=>Number.isInteger(x)&&x>=0&&x<7))]:null;
  const routineDays=record=>validDays(record.weekdays)??[0,1,2,3,4,5,6];
  const habitDays=record=>validDays(record.weekdays);
  const dayOf=date=>{const d=new Date(String(date)+"T12:00:00");return Number.isNaN(d.getTime())?-1:d.getDay();};
  const scheduled=(record,date,kind="routine")=>{
    const days=kind==="habit"?habitDays(record):routineDays(record);
    return days===null||days.includes(dayOf(date));
  };
  const weekLabel=days=>{
    const chosen=validDays(days);
    if(chosen===null)return "Dias flexíveis";
    if(chosen.length===7)return "Todos os dias";
    if(!chosen.length)return "Nenhum dia selecionado";
    return weekdays.filter(x=>chosen.includes(x.day)).map(x=>x.name).join(" · ");
  };
  const lookup=activityId=>catalog().find(x=>x.id===activityId)||null;
  function ensure(){
    let changed=false;
    const seen=new Set();
    const pushUnique=(activityId,name)=>{
      if(!activityId||seen.has(activityId))return;
      seen.add(activityId);
      if(!lookup(activityId)){
        catalog().push({id:activityId,name:String(name||"Atividade").trim(),createdAt:new Date().toISOString()});
        changed=true;
      }
    };
    for(const h of data.habits||[]){
      if(!h.activityId){h.activityId=newId();changed=true;}
      pushUnique(h.activityId,h.name);
    }
    for(const e of [...(data.routines||[]),...(data.tasks||[])])pushUnique(e.activityId,e.name||e.title);
    completions();
    if(changed)save();
  }
  function create(name){
    const clean=String(name||"").trim().slice(0,120);
    if(!clean)return "";
    const act={id:newId(),name:clean,createdAt:new Date().toISOString()};
    catalog().push(act);save();return act.id;
  }
  function label(activityId){
    const item=lookup(activityId);
    if(!item)return "";
    const hs=(data.habits||[]).filter(h=>h.activityId===activityId);
    if(hs.length===1){
      const h=hs[0],dupes=(data.habits||[]).filter(x=>String(x.name||"").trim().toLowerCase()===String(h.name||"").trim().toLowerCase());
      const suffix=dupes.length>1?" · cadastro "+(dupes.indexOf(h)+1)+" de "+dupes.length:"";
      return h.name+" · Hábito"+(h.category?" ("+h.category+")":"")+suffix;
    }
    if(hs.length>1)return hs[0].name+" · "+hs.length+" hábitos vinculados";
    return item.name+" · Atividade";
  }
  function options(selected,{allowNew=false,noneLabel="Sem vínculo",onlyHabits=false}={}){
    ensure();
    const ids=[...new Set((data.habits||[]).map(h=>h.activityId).filter(Boolean))];
    const others=catalog().filter(a=>!ids.includes(a.id));
    const renderEntry=entry=>'<option value="'+esc(entry.id)+'"'+(entry.id===selected?' selected':'')+'>'+esc(label(entry.id))+'</option>';
    let html='<option value="">'+esc(noneLabel)+'</option>';
    const items=catalog().filter(a=>ids.includes(a.id)).sort((a,b)=>label(a.id).localeCompare(label(b.id),"pt-BR"));
    if(items.length)html+='<optgroup label="Hábitos existentes">'+items.map(renderEntry).join("")+'</optgroup>';
    if(!onlyHabits||selected&&!ids.includes(selected)){
      const extra=others.filter(a=>!onlyHabits||a.id===selected).sort((a,b)=>a.name.localeCompare(b.name,"pt-BR"));
      if(extra.length)html+='<optgroup label="Outras atividades">'+extra.map(renderEntry).join("")+'</optgroup>';
    }
    if(allowNew)html+='<option value="__new__">Criar atividade independente (sem sincronizar)</option>';
    return html;
  }
  function isComplete(activityId,date){
    if(!activityId)return false;
    const entry=completions()[date];
    if(entry&&Object.prototype.hasOwnProperty.call(entry,activityId))return entry[activityId]===true;
    return (data.habits||[]).some(h=>h.activityId===activityId&&(h.doneDates||[]).includes(date))||
      (data.routines||[]).some(r=>r.activityId===activityId&&scheduled(r,date)&&data.routineProgress?.[date]?.[r.id]==="done")||
      (data.tasks||[]).some(t=>t.activityId===activityId&&t.date===date&&t.done);
  }
  function setComplete(activityId,date,value,{persist=true}={}){
    if(!activityId||!lookup(activityId)||!/^\d{4}-\d{2}-\d{2}$/.test(date))return false;
    const done=!!value;
    const daily=completions();
    if(!daily[date]||typeof daily[date]!=="object")daily[date]={};
    daily[date][activityId]=done;
    for(const h of data.habits||[]){
      if(h.activityId!==activityId)continue;
      h.doneDates=Array.isArray(h.doneDates)?h.doneDates:[];
      if(done&&!h.doneDates.includes(date))h.doneDates.push(date);
      if(!done)h.doneDates=h.doneDates.filter(d=>d!==date);
      h.doneDates.sort();
    }
    for(const r of data.routines||[]){
      if(r.activityId!==activityId||!scheduled(r,date))continue;
      if(!data.routineProgress||typeof data.routineProgress!=="object")data.routineProgress={};
      if(!data.routineProgress[date]||typeof data.routineProgress[date]!=="object")data.routineProgress[date]={};
      if(done)data.routineProgress[date][r.id]="done";
      else delete data.routineProgress[date][r.id];
    }
    for(const t of data.tasks||[]){
      if(t.activityId===activityId&&t.date===date)t.done=done;
    }
    if(persist)save();
    return true;
  }
  function linkEntry(entry,activityId,{date=today()}={}){
    ensure();
    const to=activityId&&lookup(activityId)?activityId:"";
    const from=entry.activityId||"";
    if(to===from)return false;
    const wasDone=entry.done===true||
      (Array.isArray(entry.doneDates)&&entry.doneDates.includes(date))||
      data.routineProgress?.[date]?.[entry.id]==="done";
    const linkedDone=!!to&&isComplete(to,date);
    const belongedToAnotherHabit=!!from&&(data.habits||[]).some(h=>h.activityId===from&&h!==entry);
    entry.activityId=to;
    // Ligação nova: preserva a conclusão do dia e a propaga uma vez.
    // Troca de vínculo: não transfere uma conclusão do hábito antigo para outro.
    if(to&&(linkedDone||(wasDone&&!belongedToAnotherHabit)))setComplete(to,date,true,{persist:false});
    else if(to&&belongedToAnotherHabit&&data.routineProgress?.[date]?.[entry.id]==="done")
      delete data.routineProgress[date][entry.id];
    save();
    renderCatalog();
    return true;
  }
  function connections(activityId){
    const hs=(data.habits||[]).filter(h=>h.activityId===activityId);
    const rs=(data.routines||[]).filter(r=>r.activityId===activityId);
    const ts=(data.tasks||[]).filter(t=>t.activityId===activityId);
    return {habits:hs,routines:rs,tasks:ts};
  }
  function renderCatalog(){
    const host=document.querySelector("#activityCatalogList");if(!host)return;
    ensure();
    const routines=data.routines||[],habits=data.habits||[];
    const linked=routines.filter(r=>r.activityId&&habits.some(h=>h.activityId===r.activityId)).length;
    const counter=document.querySelector("#activityLinkCount");
    if(counter)counter.textContent=linked+" de "+routines.length+" passos vinculados";
    if(!routines.length){
      host.innerHTML='<div class="blank">Ainda não há passos de rotina. Crie um passo em Hoje → Organizar minha rotina para conectá-lo a um hábito.</div>';
      return;
    }
    host.innerHTML=routines.slice().sort((a,b)=>String(a.time||"").localeCompare(String(b.time||""))).map(r=>{
      const c=r.activityId?connections(r.activityId):null;
      const names=c?.habits.map(h=>h.name).join(", ")||"";
      const synchronized=!!names;
      const extra=r.activityId&&!synchronized?'Esta atividade usa uma identificação própria.':'';
      return '<div class="al-connect-card">'+
        '<div class="al-connect-head"><div><strong>'+esc(r.name||"Passo sem nome")+'</strong>'+
        '<small>'+esc(r.time||"Sem horário")+' · '+esc(weekLabel(r.weekdays))+'</small></div>'+
        '<span class="al-connect-state'+(synchronized?' is-linked':'')+'">'+(synchronized?'✓ Conectado':'Não conectado')+'</span></div>'+
        '<label for="al-connect-'+esc(r.id)+'">Sincronizar com qual hábito?</label>'+
        '<select id="al-connect-'+esc(r.id)+'" data-connect-routine="'+esc(r.id)+'">'+options(r.activityId,{onlyHabits:true,noneLabel:"Não sincronizar com nenhum hábito"})+'</select>'+
        '<p class="subtle">'+(synchronized?'Ao concluir na rotina, o hábito <strong>'+esc(names)+'</strong> também será marcado, e vice-versa.':extra||'Escolha um hábito para marcar apenas uma vez, sem alterar o nome da rotina.')+'</p></div>';
    }).join("");
  }
  function updateAll(){
    if(typeof render==="function")render();
    else {
      renderCatalog();
      if(typeof window.renderRoutineHome==="function")window.renderRoutineHome();
    }
  }
  // API para os módulos anteriores
  window.ActivityLinks={weekdays,weekLabel,routineDays,habitDays,scheduled,create,lookup,label,ensure,
    options,isComplete,setComplete,linkEntry,connections,renderCatalog,updateAll};
  ensure();
  document.querySelector("#activityCatalogList")?.addEventListener("change",event=>{
    const selector=event.target.closest("[data-connect-routine]");
    if(!selector)return;
    const r=(data.routines||[]).find(x=>x.id===selector.dataset.connectRoutine);
    if(!r)return;
    linkEntry(r,selector.value);
    updateAll();
    const message=selector.value?"Ligação salva! Ao concluir na rotina, o hábito também será marcado.":"Ligação desfeita. O passo e o hábito agora são independentes.";
    const feedback=document.querySelector("#activityLinkFeedback");
    if(feedback)feedback.textContent=message;
    if(typeof toast==="function")toast(message);
  });
  renderCatalog();
  if(typeof render==="function")render();
})();
