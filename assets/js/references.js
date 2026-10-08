/* Fontes e orientações: sínteses didáticas, não citações textuais.
 * Fonte-base: Borcsik e Campos, Desenvolvimento Pessoal e Organizacional,
 * Universidade São Francisco, 2025, Unidade 4.
 */
(()=>{
 const host=document.querySelector("#reviewResources");
 if(!host)return;
 const citations=[
  {id:"roadmap",title:"Plano de 90 dias",pages:"p. 129",summary:"O material apresenta uma sequência de avaliação inicial, implementação e consolidação. Use revisões para adaptar o plano ao que realmente aconteceu.",authors:"Borcsik e Campos (USF, 2025), com modelo de roteiro de 90 dias apresentado pela autora."},
  {id:"micro",title:"Microlearning",pages:"pp. 114–115",summary:"Para experimentar o aprendizado em blocos menores, escolha um tópico delimitado, estude por 5 a 15 minutos e registre uma aplicação prática.",authors:"Hug (2018), citado no material da USF. Síntese didática, não uma recomendação individual do autor."},
  {id:"adult",title:"Aprendizagem de adultos",pages:"pp. 113–114",summary:"Relacione conteúdos novos às suas experiências, dê preferência a atividades relevantes e experimente aplicar o que acabou de estudar.",authors:"Knowles, Holton III e Swanson (2005), conforme apresentados no material da USF."},
  {id:"pdi",title:"Plano de desenvolvimento (PDI)",pages:"pp. 116–117",summary:"Descreva um objetivo, uma competência, uma ação e uma evidência verificável; revise periodicamente o que ainda faz sentido.",authors:"Modelo de registro de PDI elaborado pela autora do material, com menção ao modelo SMART."},
  {id:"swot",title:"Análise SWOT",pages:"pp. 108–109",summary:"Diferencie fatores internos (forças e fraquezas) de externos (oportunidades e ameaças) antes de escolher uma ação.",authors:"Síntese do material da USF, que associa a matriz a Chergui (2016)."},
  {id:"design",title:"Design Thinking e SCAMPER",pages:"pp. 118–121",summary:"Investigue um problema, gere alternativas, experimente em pequena escala e registre o que aprendeu. Use SCAMPER para reorganizar ou transformar soluções.",authors:"Brown (2010), Ries (2012) e Eberle (2011), referidos no material da USF."}
 ];
 const bibliography=[
  "BORCSIK, Luiz Alberto; CAMPOS, Priscilla Perla Tartarotti Von Zuben. Desenvolvimento pessoal e organizacional. Universidade São Francisco, 2025. Unidade 4, pp. 105–130.",
  "KNOWLES, M. S.; HOLTON III, E. F.; SWANSON, R. A. The Adult Learner: The Definitive Classic in Adult Education and Human Resource Development. 6. ed. Burlington: Elsevier, 2005.",
  "HUG, T. Microlearning: a strategy for ongoing learning. Journal of Educational Multimedia and Hypermedia, v. 27, n. 1, p. 1–12, 2018.",
  "CHERGUI, K. Escolha estratégica em organizações baseadas no conhecimento: o caso das indústrias eletrônicas na Argélia. Journal of Business and Management Sciences, v. 4, n. 6, p. 142–148, 2016.",
  "BROWN, T. Design Thinking: uma metodologia poderosa para decretar o fim das velhas ideias. Rio de Janeiro: Elsevier, 2010.",
  "RIES, E. A Startup Enxuta. São Paulo: Leya, 2012.",
  "EBERLE, B. SCAMPER: Técnicas de criatividade para a geração de ideias. Barueri: Manole, 2011."
 ];
 const e=s=>esc(s);
 const details=citations.map(c=>'<article class="ref-tip"><div><strong>'+e(c.title)+'</strong><span class="pill">USF, '+e(c.pages)+'</span></div><p>'+e(c.summary)+'</p><p class="subtle"><strong>Base:</strong> '+e(c.authors)+'</p></article>').join("");
 const entries=bibliography.map(b=>'<li>'+e(b)+'</li>').join("");
 host.innerHTML='<div class="cardhead"><div><h3>Biblioteca de orientação</h3>'+
  '<p class="subtle">Dicas práticas com suas fontes para conferir e aprofundar.</p></div></div>'+
  '<p class="subtle">As sugestões abaixo são interpretações práticas do material acadêmico; não são falas literais nem aconselhamento profissional individual.</p>'+
  '<div class="ref-grid">'+details+'</div>'+
  '<details class="ref-bib"><summary>Ver referências bibliográficas</summary><ol>'+entries+'</ol>'+
  '<p class="subtle">Referências reproduzidas ou adaptadas da bibliografia da Unidade 4. Consulte o texto integral das obras antes de atribuir-lhes conclusões mais específicas.</p></details>';
})();
