/* Escolha de interface local — independente das cores e dos dados do usuário.
   "Clássica" preserva a navegação original; "Dinâmica" oferece painel
   de atalhos e barra de navegação lateral em telas largas.
*/
(() => {
  "use strict";
  const key="rotina-em-foco-ui-v1";
  const options=["classic","dynamic"];
  const buttons=[...document.querySelectorAll("[data-ui-layout]")];
  let mode="classic";
  try {
    const previous=localStorage.getItem(key);
    if(options.includes(previous))mode=previous;
  } catch {}
  function apply() {
    document.body.dataset.ui=mode;
    buttons.forEach(b=>{
      const active=b.dataset.uiLayout===mode;
      b.classList.toggle("active",active);
      b.setAttribute("aria-pressed",String(active));
    });
    const label=document.querySelector("#uiCurrent");
    if(label)label.textContent=mode==="classic"?"Clássica":"Dinâmica";
    if(typeof window.renderUiDashboard==="function")window.renderUiDashboard();
  }
  buttons.forEach(b=>b.addEventListener("click",()=>{
    mode=b.dataset.uiLayout;
    let saved=true;
    try{localStorage.setItem(key,mode);}catch{saved=false;}
    apply();
    const status=document.querySelector("#uiSaveStatus");
    if(status)status.textContent=saved?
      "Interface escolhida. A preferência fica neste navegador.":
      "Não foi possível guardar esta preferência no navegador.";
  }));
  window.renderUiDashboard=()=>{
    const board=document.querySelector("#uiQuickboard");
    if(!board)return;
    const tasks=Array.isArray(data.tasks)?data.tasks.filter(t=>!t.done).length:0;
    const ideas=Array.isArray(data.ideas)?data.ideas.length:0;
    const roadmaps=Array.isArray(data.roadmaps)?data.roadmaps.length:0;
    const learning=Array.isArray(data.learningPaths)?data.learningPaths.length:0;
    const plans=Array.isArray(data.developmentPlans)?data.developmentPlans.length:0;
    const itemCounts={tasks,ideas,roadmap90:roadmaps,learning,development:plans};
    board.querySelectorAll("[data-ui-count]").forEach(el=>{
      const count=itemCounts[el.dataset.uiCount] ?? 0;
      el.textContent=String(count);
    });
    const hint=board.querySelector("#uiTodayHint");
    if(hint)hint.textContent=tasks?tasks+" tarefas em aberto. Escolha um próximo passo.":"Sem tarefas abertas. Você pode planejar com calma.";
  };
  document.querySelectorAll("[data-ui-go]").forEach(b=>b.addEventListener("click",()=>{
    const id=b.dataset.uiGo;
    const nav=document.querySelector('.nav [data-view="'+id+'"]');
    if(nav)nav.click();
  }));
  apply();
})();
