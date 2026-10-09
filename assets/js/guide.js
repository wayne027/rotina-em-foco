/* Guia de hábitos e rotina — conteúdo educativo com referências externas verificáveis.
   Módulo isolado: não lê, grava nem altera dados pessoais do usuário.
*/
(() => {
"use strict";
const root=document.getElementById("routineGuide"),button=document.getElementById("openGuide");
if(!root||!button)return;
const ref=[
 ["wood","WOOD, Wendy. Habits, Goals, and Effective Behavior Change. Current Directions in Psychological Science, 2024.","https://doi.org/10.1177/09637214241246480"],
 ["woodProfile","WOOD, Wendy. Perfil acadêmico e descrição de pesquisas. USC Dornsife.","https://dornsife.usc.edu/profile/wendy-wood/"],
 ["fogg","FOGG, B. J. Fogg Behavior Model. Behavior Design Lab, Stanford University.","https://behaviordesign.stanford.edu/resources/fogg-behavior-model"],
 ["foggTalk","FOGG, B. J. Building Habits: The Key to Lasting Behavior Change. Entrevista, Stanford Graduate School of Business.","https://www.gsb.stanford.edu/insights/building-habits-key-lasting-behavior-change"],
 ["lally","LALLY, Phillippa et al. How are habits formed: Modelling habit formation in the real world. European Journal of Social Psychology, 40, 2010. DOI: 10.1002/ejsp.674.","https://doi.org/10.1002/ejsp.674"],
 ["goll","GOLLWITZER, Peter M.; SHEERAN, Paschal. Implementation Intentions and Goal Achievement: A Meta-analysis of Effects and Processes. Advances in Experimental Social Psychology, 38, 69–119, 2006.","https://doi.org/10.1016/S0065-2601(06)38002-1"],
 ["dun","DUNLOSKY, John et al. Improving Students’ Learning With Effective Learning Techniques. Psychological Science in the Public Interest, 14(1), 4–58, 2013.","https://doi.org/10.1177/1529100612453266"],
 ["sleep","CENTERS FOR DISEASE CONTROL AND PREVENTION (CDC). About Sleep. 2024.","https://www.cdc.gov/sleep/about/"],
 ["movement","WORLD HEALTH ORGANIZATION (WHO). WHO Guidelines on Physical Activity and Sedentary Behaviour. 2020.","https://www.ncbi.nlm.nih.gov/books/NBK566046/"],
 ["stress","WORLD HEALTH ORGANIZATION (WHO). Stress: Questions and Answers. 2026.","https://www.who.int/news-room/questions-and-answers/item/stress"],
 ["stressBook","WORLD HEALTH ORGANIZATION (WHO). Doing What Matters in Times of Stress: An Illustrated Guide. 2020.","https://www.who.int/westernpacific/publications/i/item/9789240003927"],
 ["nhs","GREATER MANCHESTER MENTAL HEALTH NHS FOUNDATION TRUST. Behavioural Activation. Material de apoio.","https://www.gmmh.nhs.uk/behavioural-activation"],
 ["nhshelp","NATIONAL HEALTH SERVICE (NHS). Get Help With Low Mood, Sadness or Depression.","https://www.nhs.uk/mental-health/feelings-symptoms-behaviours/feelings-and-symptoms/low-mood-sadness-depression/"],
 ["caffeine","U.S. FOOD AND DRUG ADMINISTRATION (FDA). Spilling the Beans: How Much Caffeine Is Too Much?","https://www.fda.gov/consumers/consumer-updates/spilling-beans-how-much-caffeine-too-much"],
 ["cdcstress","CENTERS FOR DISEASE CONTROL AND PREVENTION (CDC). Managing Stress.","https://www.cdc.gov/mental-health/living-with/"]
];
const source=Object.fromEntries(ref.map(r=>[r[0],r]));
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const links=ids=>ids.map(k=>source[k]?'<a class="gd-src" href="'+source[k][2]+'" target="_blank" rel="noopener noreferrer" title="'+esc(source[k][1])+'">Fonte ↗</a>':"").join("");
const tips=[
 ["Comece pelo que é observável","Troque “melhorar a vida” por “abrir o caderno e responder uma questão”. É mais fácil iniciar algo específico e pequeno.",["fogg","nhs"]],
 ["Use um sinal que já acontece","Depois de escovar os dentes, separe sua roupa. Depois do café, comece a tarefa. O mesmo contexto favorece a repetição.",["wood","fogg"]],
 ["Prepare o seu “se–então”","“Se terminar o café, então abro o material por cinco minutos.” Decidir quando e como agir ajuda a transformar intenção em ação.",["goll"]],
 ["Reduza distrações antes de começar","Deixe os materiais necessários à vista, feche abas extras e silencie notificações não urgentes. Ajustar o ambiente diminui o esforço inicial.",["wood"]],
 ["Tenha a versão de dois minutos","Se o dia estiver difícil, experimente apenas separar o material ou escrever uma frase. É um começo, não uma obrigação de continuar.",["fogg","nhshelp"]],
 ["Revise sem se punir","Se um passo não funcionar, ajuste o momento, a dificuldade e o ambiente. Não existe quantidade mágica de dias para criar um hábito.",["lally","fogg"]]
];
const examples=[
 {id:"busy",label:"Pouco tempo",lead:"Use poucas âncoras. Não precisa preencher todos os intervalos do seu dia.",items:[
 ["Ao acordar","5 min","Higiene, água e identificar o compromisso principal."],
 ["Antes de sair","2 min","Separar o necessário para reduzir decisões depois."],
 ["Pausa possível","5–10 min","Mover o corpo ou resolver uma tarefa pequena."],
 ["Ao voltar","10–15 min","Um único bloco pessoal ou uma atividade importante."],
 ["Fim do dia","5 min","Preparar o primeiro movimento de amanhã."],
 ["Descanso","Variável","Reservar tempo para lazer e sono suficiente."]],note:"Modelo ilustrativo inspirado em simplicidade comportamental e recomendações de sono.",refs:["fogg","sleep","stress"]},
 {id:"start",label:"Dificuldade de começar",lead:"A rotina deve sugerir uma primeira ação, sem exigir motivação alta ou muitas decisões.",items:[
 ["Ao levantar","1–2 min","Colocar os pés no chão, abrir a cortina e beber água."],
 ["Primeiro movimento","2 min","Abrir o caderno ou pegar o lápis. Apenas isso."],
 ["Se der para continuar","5–10 min","Experimentar um bloco breve, sem se obrigar a seguir."],
 ["Depois","5 min","Pausar, alongar e observar como está se sentindo."],
 ["Uma nova tentativa","2–5 min","Retomar por uma ação menor se desejar."],
 ["Antes de dormir","2 min","Deixar preparado o começo de amanhã."]],note:"Adaptação prática do modelo de Fogg, planos se–então e ativação comportamental.",refs:["fogg","goll","nhs"]},
 {id:"study",label:"Estudando",lead:"Organize blocos de estudo, recuperação ativa e revisão em dias diferentes.",items:[
 ["Preparação","5 min","Escolher um assunto e uma pergunta para responder."],
 ["Estudo focado","20–40 min","Ler, praticar ou resolver problemas sem alternar aplicativos."],
 ["Intervalo","5–10 min","Levantar, descansar os olhos e beber água."],
 ["Lembrar sem consultar","10 min","Responder questões e depois conferir as respostas."],
 ["Outro dia","10–20 min","Revisar o mesmo assunto com espaçamento."],
 ["Fechamento","5 min","Anotar dúvidas e preservar um horário razoável para dormir."]],note:"Os tempos são exemplos flexíveis; as evidências mais fortes são para testes de recuperação e prática distribuída.",refs:["dun","sleep"]}];
const factors=[
 ["Sono","Sono insuficiente pode prejudicar atenção, memória e disposição.","Mantenha horários relativamente regulares e um ambiente de dormir confortável. Adultos geralmente precisam de pelo menos sete horas.","Evite sacrificar sono para compensar pendências, telas perto de deitar e cafeína no fim do dia.",["sleep"]],
 ["Movimento e sedentarismo","Atividade física ajuda na saúde, no humor, na cognição e no sono.","Comece com caminhadas ou pequenos períodos de movimento e aumente gradualmente.","Evite metas extenuantes logo de início. A OMS orienta adultos a acumular 150–300 min de atividade moderada por semana e fortalecimento muscular em dois ou mais dias.",["movement"]],
 ["Estresse","Sobrecarga pode causar irritabilidade, cansaço, pior concentração e alterações no sono.","Inclua pausas, relações sociais, lazer e pequenas práticas de atenção ao ambiente.","Evite usar a rotina como punição. Se os sintomas forem persistentes ou atrapalharem sua vida, busque apoio profissional.",["stress","stressBook","cdcstress"]],
 ["Cafeína e alimentação","Muita cafeína pode trazer agitação, ansiedade e dificuldade para dormir.","Observe sua sensibilidade, mantenha refeições regulares quando possível e deixe água acessível.","Evite energéticos para substituir sono. Os 400 mg/dia citados pela FDA são uma referência geral para a maioria dos adultos, não uma meta nem um limite seguro para todos.",["caffeine","sleep","nhshelp"]],
 ["Notificações e interrupções","Sinais do ambiente podem disparar comportamentos habituais, como abrir redes sem perceber.","Use um único material por vez e reduza notificações durante o bloco escolhido.","Evite trocar de aplicativo sempre que a atividade ficar desconfortável.",["wood","cdcstress"]],
 ["Flexibilidade e descanso","Doença, imprevistos e fadiga podem mudar o que é possível realizar.","Tenha uma versão mínima do plano, tempo livre e expectativas ajustáveis.","Evite pensar que um dia sem marcar invalida todo o progresso.",["lally","stress","fogg"]]
];
const specialists=[
 {name:"B. J. Fogg",role:"Pesquisador de comportamento, Stanford",quote:"Don’t pick habits you don’t want to do.",translation:"Não escolha hábitos que você não quer praticar.",advice:"Comece com um comportamento desejado, pequeno e ligado a um lembrete. Em vez de confiar apenas na força de vontade, facilite a ação.",refs:["foggTalk","fogg"]},
 {name:"Wendy Wood",role:"Professora emérita de Psicologia, USC",quote:"When we repeat actions in the same ways",translation:"Quando repetimos ações da mesma maneira…",advice:"A repetição num contexto estável favorece associações automáticas. Deixar um objeto no lugar certo pode funcionar como lembrete do hábito.",refs:["woodProfile","wood"]},
 {name:"Peter M. Gollwitzer e Paschal Sheeran",role:"Pesquisadores de autorregulação",quote:"If situation Y is encountered, then I will initiate goal-directed behavior X!",translation:"Se a situação Y ocorrer, então iniciarei o comportamento X.",advice:"Faça um plano concreto da forma: “se acontecer X, farei Y”.",refs:["goll"]},
 {name:"John Dunlosky e colaboradores",role:"Pesquisadores de aprendizagem",quote:"",translation:"",advice:"Síntese de pesquisa, não fala literal: autoavaliação por perguntas e sessões distribuídas receberam alta avaliação de utilidade para aprender.",refs:["dun"]},
 {name:"Phillippa Lally e colaboradores",role:"Pesquisadores de formação de hábitos",quote:"",translation:"",advice:"Síntese de pesquisa, não fala literal: formar um hábito pode levar tempos muito diferentes entre pessoas e comportamentos.",refs:["lally"]}
];
let tab="start",example="busy";
const tabHtml=[["start","Começar"],["examples","3 exemplos"],["energy","Energia e estresse"],["refs","Profissionais e fontes"]].map(([id,label])=>'<button type="button" role="tab" data-guide-tab="'+id+'" aria-selected="false">'+label+'</button>').join("");
root.innerHTML='<div class="gd-header"><div><span class="gd-eyebrow">Pesquisa com fontes verificáveis</span><h2 tabindex="-1" id="gdTitle">Guia de rotinas e hábitos</h2><p>Escolha ideias úteis e adapte à sua realidade. Uma boa rotina ajuda a agir e respeita seu descanso.</p></div><button type="button" id="gdBack" class="secondary smallbtn">← Voltar à rotina</button></div>'+
 '<div class="gd-tabbar" role="tablist" aria-label="Assuntos do guia">'+tabHtml+'</div>'+
 '<section class="gd-pane" role="tabpanel" data-guide-pane="start"><h3>Como criar uma rotina possível</h3><p class="gd-lead">Comece com poucas ações claras, associe-as a momentos reais e ajuste após experimentar.</p><div class="gd-tip-list">'+tips.map((t,i)=>'<article class="gd-tip"><span class="gd-count">'+String(i+1).padStart(2,"0")+'</span><div><h4>'+esc(t[0])+'</h4><p>'+esc(t[1])+'</p><div class="gd-sources">'+links(t[2])+'</div></div></article>').join("")+'</div><div class="gd-quiet-note"><strong>Exemplo simples</strong><p>“Depois do café, abro uma questão por cinco minutos.” Essa é uma forma de transformar intenção em um primeiro movimento específico.</p>'+links(["goll","fogg"])+'</div></section>'+
 '<section class="gd-pane" role="tabpanel" data-guide-pane="examples" hidden><h3>Três modelos de rotina</h3><p class="gd-lead">Exemplos ilustrativos, não horários obrigatórios. Escolha um perfil para ver só a sequência correspondente.</p><div class="gd-scenario-buttons">'+examples.map(e=>'<button type="button" data-guide-example="'+e.id+'" aria-pressed="false">'+esc(e.label)+'</button>').join("")+'</div><div id="gdScenario"></div><p class="gd-endnote">Esses modelos não alteram seus dados nem criam tarefas automaticamente. Adapte os passos em Hoje → Organizar minha rotina.</p></section>'+
 '<section class="gd-pane" role="tabpanel" data-guide-pane="energy" hidden><h3>O que influencia disposição e rendimento?</h3><p class="gd-lead">Abra apenas o assunto de que precisa. Os fatores interagem; nenhum hábito isolado garante mais energia.</p><div class="gd-factor-list">'+factors.map(f=>'<details class="gd-factor"><summary>'+esc(f[0])+'<span aria-hidden="true">⌄</span></summary><div><p>'+esc(f[1])+'</p><h4>O que pode ajudar</h4><p>'+esc(f[2])+'</p><h4>Cuidados e excessos a evitar</h4><p>'+esc(f[3])+'</p><div class="gd-sources">'+links(f[4])+'</div></div></details>').join("")+'</div><div class="gd-caution"><strong>Atenção</strong><p>Este é um conteúdo educativo, não um diagnóstico. Se cansaço, insônia ou sofrimento emocional forem persistentes ou limitantes, procure orientação profissional.</p></div></section>'+
 '<section class="gd-pane" role="tabpanel" data-guide-pane="refs" hidden><h3>Experiência profissional e evidência científica</h3><p class="gd-lead">Falas literais no idioma original são apresentadas entre aspas, com tradução livre. As demais orientações estão identificadas como sínteses, não citações inventadas.</p><div class="gd-specialists">'+specialists.map(p=>'<article class="gd-expert"><h4>'+esc(p.name)+'</h4><p class="gd-expert-role">'+esc(p.role)+'</p>'+(p.quote?'<blockquote><q lang="en">'+esc(p.quote)+'</q><small>Tradução livre: '+esc(p.translation)+'</small></blockquote>':'')+'<p>'+esc(p.advice)+'</p><div class="gd-sources">'+links(p.refs)+'</div></article>').join("")+'</div><details class="gd-bibliography"><summary>Ver referências bibliográficas ('+ref.length+')</summary><ol>'+ref.map(r=>'<li><p>'+esc(r[1])+'</p><a target="_blank" rel="noopener noreferrer" href="'+r[2]+'">Abrir a fonte ↗</a></li>').join("")+'</ol></details><p class="gd-endnote">Os exemplos de agenda são adaptações educativas. Foram utilizadas pesquisas revisadas por pares, entrevistas de especialistas e diretrizes de instituições de saúde.</p></section>';
function switchTab(id){
 if(!["start","examples","energy","refs"].includes(id))return;
 tab=id;
 root.querySelectorAll("[data-guide-tab]").forEach(b=>{const on=b.dataset.guideTab===id;b.classList.toggle("active",on);b.setAttribute("aria-selected",String(on));b.tabIndex=on?0:-1;});
 root.querySelectorAll("[data-guide-pane]").forEach(p=>p.hidden=p.dataset.guidePane!==id);
}
function renderExample(){
 const e=examples.find(x=>x.id===example)||examples[0];
 root.querySelectorAll("[data-guide-example]").forEach(b=>{const on=b.dataset.guideExample===e.id;b.classList.toggle("active",on);b.setAttribute("aria-pressed",String(on));});
 root.querySelector("#gdScenario").innerHTML='<div class="gd-scenario-head"><h4>'+esc(e.label)+'</h4><p>'+esc(e.lead)+'</p></div><ol class="gd-timeline">'+e.items.map(row=>'<li><div class="gd-moment"><strong>'+esc(row[0])+'</strong><small>'+esc(row[1])+'</small></div><p>'+esc(row[2])+'</p></li>').join("")+'</ol><p class="gd-endnote">'+esc(e.note)+'</p><div class="gd-sources">'+links(e.refs)+'</div>';
}
root.querySelectorAll("[data-guide-tab]").forEach(b=>b.addEventListener("click",()=>switchTab(b.dataset.guideTab)));
root.querySelectorAll("[data-guide-example]").forEach(b=>b.addEventListener("click",()=>{example=b.dataset.guideExample;renderExample();}));
root.querySelector("#gdBack").addEventListener("click",()=>{window.RotinaNavigation?.show("home");button.focus();});
button.addEventListener("click",()=>{window.RotinaNavigation?.show("guide");root.querySelector("#gdTitle").focus();});
switchTab(tab);renderExample();
})();
