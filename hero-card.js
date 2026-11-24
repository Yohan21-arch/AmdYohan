(() => {
  const hero = document.querySelector(".hero");
  const visual = hero.querySelector(".hero-visual");
  const toggle = visual.querySelector(".motion-toggle");
  const scene = visual.querySelector(".developer-scene");
  const buttons = hero.querySelectorAll(".hero-actions .button");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const pointer = matchMedia("(hover: hover) and (pointer: fine)");
  const root = document.documentElement;
  let paused = false;
  try { paused = sessionStorage.getItem("portfolio-motion-paused") === "true"; } catch {}
  let inView = true;
  let interactive = false;

  function finishIntro() {
    root.classList.remove("hero-intro");
  }

  function resetPull(button) {
    button.style.removeProperty("--pull-x");
    button.style.removeProperty("--pull-y");
  }

  function leave(event) {
    resetPull(event.currentTarget);
  }

  function pull(event) {
    const button = event.currentTarget;
    if (event.pointerType !== "mouse" || button.matches(":focus-visible")) return;
    const rect = button.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * .12;
    const y = (event.clientY - rect.top - rect.height / 2) * .12;
    const scale = Math.min(1, 5 / (Math.hypot(x, y) || 1));
    button.style.setProperty("--pull-x", x * scale + "px");
    button.style.setProperty("--pull-y", y * scale + "px");
  }

  function syncMotion() {
    const playing = !reduced.matches && !paused && inView && !document.hidden;
    visual.dataset.cardMotion = playing ? "running" : "paused";
    toggle.hidden = reduced.matches;
    toggle.textContent = paused ? "Play motion" : "Pause motion";
    if (!playing) finishIntro();
    if (interactive === (playing && pointer.matches)) return;
    interactive = playing && pointer.matches;
    for (const button of buttons) {
      const method = interactive ? "addEventListener" : "removeEventListener";
      button[method]("pointermove", pull);
      button[method]("pointerleave", leave);
      button[method]("focus", leave);
      resetPull(button);
    }
  }

  visual.toggleAttribute("data-orbit", !navigator.connection?.saveData &&
    (navigator.hardwareConcurrency || 8) > 4 && (navigator.deviceMemory || 8) > 2);
  toggle.addEventListener("click", () => {
    paused = !paused;
    try { sessionStorage.setItem("portfolio-motion-paused", String(paused)); } catch {}
    window.dispatchEvent(new CustomEvent("portfolio-motion", { detail: { paused } }));
    syncMotion();
  });
  reduced.addEventListener("change", syncMotion);
  pointer.addEventListener("change", syncMotion);
  document.addEventListener("visibilitychange", syncMotion);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncMotion();
    }).observe(hero);
  }
  syncMotion();
  function startIntro() {
    if (paused || reduced.matches || location.hash || document.hidden || scrollY !== 0) return;
    scene.addEventListener("animationend", event => {
      if (event.target === scene && event.animationName === "hero-arrive") finishIntro();
    });
    root.classList.add("hero-intro");
  }
  const welcome = document.querySelector(".welcome-screen[open]");
  if (welcome) welcome.addEventListener("welcome-finished", startIntro, { once: true });
  else startIntro();
})();
