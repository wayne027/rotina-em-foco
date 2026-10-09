/* Navegação independente — Rotina em Foco.
 * Carregada ANTES dos módulos de tarefas, hábitos, rotina e configurações.
 * Não depende dos dados locais nem de nenhum outro script para trocar de aba.
 * A única forma de abrir as demais áreas é o menu lateral (sempre acessível).
 */
(() => {
  "use strict";
  const nav = document.getElementById("mainNav");
  const openButton = document.getElementById("openDrawer");
  const closeButton = document.getElementById("closeDrawer");
  const overlay = document.getElementById("drawerShade");
  if (!nav || !openButton || !closeButton || !overlay) return;

  const buttons = [...nav.querySelectorAll("button[data-view]")];
  const panels = [...document.querySelectorAll("main > section.view")];
  const ids = new Set(panels.map(panel => panel.id));
  let opener = null;

  function open() {
    opener = document.activeElement;
    document.body.classList.add("menu-open");
    openButton.setAttribute("aria-expanded", "true");
    nav.setAttribute("aria-hidden", "false");
    closeButton.focus();
  }

  function close(restoreFocus = true) {
    const wasOpen = document.body.classList.contains("menu-open");
    document.body.classList.remove("menu-open");
    openButton.setAttribute("aria-expanded", "false");
    nav.setAttribute("aria-hidden", "true");
    if (restoreFocus && wasOpen) {
      const target = opener && document.contains(opener) ? opener : openButton;
      target.focus();
    }
    opener = null;
  }

  function show(viewId) {
    if (!ids.has(viewId)) return false;
    buttons.forEach(button => {
      const current = button.dataset.view === viewId;
      button.classList.toggle("active", current);
      if (current) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    panels.forEach(panel => {
      const current = panel.id === viewId;
      panel.classList.toggle("active", current);
      panel.hidden = !current;
    });
    close(false);
    const activePanel = document.getElementById(viewId);
    if (activePanel) activePanel.focus({preventScroll: true});
    window.scrollTo({top: 0, behavior: "instant"});
    return true;
  }

  openButton.addEventListener("click", () => {
    if (document.body.classList.contains("menu-open")) close();
    else open();
  });
  closeButton.addEventListener("click", () => close());
  overlay.addEventListener("click", () => close());

  // A escuta no elemento nav (delegação) permanece ativa mesmo que o
  // conteúdo das abas seja renderizado novamente por outros módulos.
  nav.addEventListener("click", event => {
    const button = event.target.closest("button[data-view]");
    if (!button || !nav.contains(button)) return;
    show(button.dataset.view);
  });

  document.addEventListener("keydown", event => {
    if (!document.body.classList.contains("menu-open")) return;
    if (event.key === "Escape") { event.preventDefault(); close(); return; }
    if (event.key !== "Tab") return;
    const controls = [closeButton, ...buttons.filter(button => !button.disabled)];
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  });

  window.RotinaNavigation = Object.freeze({show, open, close});
  // Estado inicial explícito, sem depender da inicialização do app.
  show("home");
})();
