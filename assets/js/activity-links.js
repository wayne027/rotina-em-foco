/* Identificadores compartilhados entre Rotina, Hábitos e Tarefas.
   Cada atividade usa activityId (ID estável): nomes iguais NÃO são
   vinculados automaticamente. Os registros anteriores são preservados.
   Um registro diário sincronizado é espelhado em doneDates,
   routineProgress e tasks[].done para não quebrar os relatórios atuais.
*/
(() => {
  "use strict";
  const weekdays=[{day:1,name:"Seg"},{day:2,name:"Ter"},{day:3,name:"Qua"},{day:4,name:"Qui"},{day:5,name:"Sex"},{day:6,name:"Sáb"},{day:0,name:"Dom"}];
  const makeId=()=>"act_"+Date.now().toString(36)+"_"+id();
  const catalog=()=>Array.isArray(data.activityCatalog)?data.activityCatalog:(data.activityCatalog=[]);
  const completion=()=>{
    if(!data.activityCompletions||typeof data.activityCompletions!=="object"||Array.isArray(data.activityCompletions))data.activityCompletions={};
    return data.activityCompletions;
  };
  const validDays=days=>Array.isArray(days)?[...new Set(days.map(Number).filter(x=>Number.isInteger(x)&&x>=0&&x<=6))]:null;
  const routineDays=r=>validDays(r.weekdays)??[0,1,2,3,4,5,6];
  const habitDays=h=>validDays(h.weekdays);
  const weekday=date=>{
    const d=new Date(date+"T12:00:00");
    return Number.isNaN(d.valueOf())?-1:d.getDay();
  };
  const scheduled=(record,date,kind="routine")=>{
    const days=kind==="habit"?habitDays(record):routineDays(record);
    return days===null||days.includes(weekday(date));
  };
  const weekLabel=days=>{
    const selected=validDays(days);
    if(selected===null)return "Dias flexíveis";
    if(selected.length===7)return "Todos os dias";
    if(!selected.length)return "Nenhum dia escolhido";
    return weekdays.filter(w=>selected.includes(w.day)).map(w=>w.name).join(" · ");
  };
  function lookup(activityId){return catalog().find(a=>a.id===activityId)||null;}
  function ensure(){
    let changed=false;
    for(const h of data.habits||[]){
      if(!h.activityId){h.activityId=makeId();changed=true;}
      if(!lookup(h.activityId)){catalog().push({id:h.activityId,name:h.name||"Atividade",createdAt:new Date().toISOString()});changed=true;}
    }
    for(const record of [...(data.routines||[]),...(data.tasks||[])]){
      if(record.activityId&&!lookup(record.activityId)){catalog().push({id:record.activityId,name:record.name||record.title||"Atividade",createdAt:new Date().toISOString()});changed=true;}
    }
    completion();
    if(changed)save();
  }
  function create(name){
    const label=String(name||"").trim().slice(0,120);
    if(!label)return "";
    const entry={id:makeId(),name:label,createdAt:new Date().toISOString()};
    catalog().push(entry);save();
    renderCatalog();
    return entry.id;
  }
  function options(selected,{allowNew=false,noneLabel="Não vincular"}={}){
    ensure();
    let entries=['<option value="">'+esc(noneLabel)+'</option>'];
    entries.push(...catalog().slice().sort((a,b)=>a.name.localeCompare(b.name,"pt-BR")).map(a=>
      '<option value="'+esc(a.id)+'"'+(a.id===selected?" selected":"")+'>'+esc(a.name)+'</option>'));
    if(allowNew)entries.push('<option value="__new__">＋ Criar identificador com este nome</option>');
    return entries.join("");
  }
  function isComplete(activityId,date){
    if(!activityId)return false;
    const day=completion()[date];
    if(day&&Object.prototype.hasOwnProperty.call(day,activityId))return day[activityId]===true;
    const inHabit=(data.habits||[]).some(h=>h.activityId===activityId&&(h.doneDates||[]).includes(date));
    const inRoutine=(data.routines||[]).some(r=>r.activityId===activityId&&scheduled(r,date)&&data.routineProgress?.[date]?.[r.id]==="done");
    const inTask=(data.tasks||[]).some(t=>t.activityId===activityId&&t.date===date&&t.done);
    return inHabit||inRoutine||inTask;
  }
  function setComplete(activityId,date,done,{persist=true}={}){
    if(!activityId||!lookup(activityId)||!date)return false;
    const value=!!done,entries=completion();
    if(!entries[date]||typeof entries[date]!=="object")entries[date]={};
    entries[date][activityId]=value;
    for(const h of data.habits||[]){
      if(h.activityId!==activityId)continue;
      h.doneDates=Array.isArray(h.doneDates)?h.doneDates:[];
      if(value&&!h.doneDates.includes(date))h.doneDates.push(date);
      if(!value)h.doneDates=h.doneDates.filter(d=>d!==date);
      h.doneDates.sort();
    }
    for(const r of data.routines||[]){
      if(r.activityId!==activityId||!scheduled(r,date))continue;
      if(!data.routineProgress||typeof data.routineProgress!=="object")data.routineProgress={};
      if(!data.routineProgress[date])data.routineProgress[date]={};
      if(value)data.routineProgress[date][r.id]="done";
      else delete data.routineProgress[date][r.id];
    }
    for(const task of data.tasks||[]){
      if(task.activityId===activityId&&task.date===date)task.done=value;
    }
    if(persist)save();
    return true;
  }
  function linkEntry(entry,activityId,{date=today()}={}){
    ensure();
    const previous=entry.activityId||"";
    const next=activityId&&lookup(activityId)?activityId:"";
    if(previous===next)return;
    // Não modifica dados históricos ao criar ou remover um vínculo.
    const localDone=Boolean(entry.done===true||
      (Array.isArray(entry.doneDates)&&entry.doneDates.includes(date))||
      data.routineProgress?.[date]?.[entry.id]==="done");
    entry.activityId=next;
    if(next&&(localDone||isComplete(next,date)))setComplete(next,date,true,{persist:false});
    save();
    renderCatalog();
  }
  function renderCatalog(){
    ensure();
    const list=document.querySelector("#activityCatalogList");
    if(!list)return;
    list.innerHTML=catalog().length?catalog().slice().sort((a,b)=>a.name.localeCompare(b.name,"pt-BR")).map(a=>{
      const h=(data.habits||[]).filter(x=>x.activityId===a.id).length;
      const r=(data.routines||[]).filter(x=>x.activityId===a.id).length;
      const t=(data.tasks||[]).filter(x=>x.activityId===a.id).length;
      const places=[h?"Hábitos ("+h+")":"",r?"Rotina ("+r+")":"",t?"Tarefas ("+t+")":""].filter(Boolean).join(" · ")||"Ainda não vinculado";
      return '<div class="al-catalog-row"><strong>'+esc(a.name)+'</strong><code>'+esc(a.id)+'</code><span>'+esc(places)+'</span></div>';
    }).join(""):'<p class="subtle">Crie um hábito ou registre uma atividade para começar a vincular.</p>';
  }
  // Lista de identificadores para telas que precisam de uma opção seletiva.
  window.ActivityLinks={ensure,create,lookup,options,isComplete,setComplete,linkEntry,scheduled,routineDays,habitDays,weekdays,weekLabel,renderCatalog};
  ensure();
  document.querySelector("#activityCatalogForm")?.addEventListener("submit",e=>{
    e.preventDefault();
    const field=document.querySelector("#activityCatalogName");
    const name=field?.value.trim();
    if(!name)return;
    create(name);field.value="";
    toast("Identificador criado. Agora você pode vinculá-lo às abas.");
  });
  renderCatalog();
  // Atualiza os seletores das outras abas depois de registrar os IDs existentes.
  if(typeof render==="function")render();
})();
