(() => {
  const visual = document.querySelector(".hero-visual");
  const toggle = visual.querySelector(".motion-toggle");
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  let paused = false;
  let inView = !("IntersectionObserver" in window);

  function syncMotion() {
    const reduced = motionPreference.matches;
    const playing = !reduced && !paused && inView && !document.hidden;
    visual.dataset.cardMotion = playing ? "running" : "paused";
    toggle.hidden = reduced;
    toggle.textContent = paused ? "Play motion" : "Pause motion";
  }

  toggle.addEventListener("click", () => {
    paused = !paused;
    syncMotion();
  });
  motionPreference.addEventListener("change", syncMotion);
  document.addEventListener("visibilitychange", syncMotion);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncMotion();
    }).observe(visual);
  }
  syncMotion();
})();
