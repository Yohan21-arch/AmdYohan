(() => {
  const root = document.documentElement;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const mouse = matchMedia("(hover: hover) and (pointer: fine)");
  const cards = [...document.querySelectorAll(".featured-card, .project-card")];
  const targets = [...cards, ...document.querySelectorAll(".case-story > div, .case-evidence > h2, .case-workflow, .case-image, .case-video, .case-next")];
  // Stagger only siblings that actually enter together. A single row on a
  // narrow screen starts immediately, regardless of its position in the list.
  const sectionMotion = new Map();
  function register(selector, stagger = 80, delay = 0, distance = 24) {
    for (const element of document.querySelectorAll(selector)) {
      sectionMotion.set(element, { selector, stagger, delay, distance });
      targets.push(element);
    }
  }
  register("#about-title, #services-title, #certificates-title, #writing-title, #contact-title");
  register(".about-copy .section-description", 120);
  register(".about-portrait, .portfolio-quote", 0);
  register(".qualification-panel .panel-heading, .qualifications li, #qualification-empty");
  register("#skills-title, .skill-list li", 65);
  register(".services-list li", 95, 0, 30);
  register(".certificate-card, #certificate-empty");
  register("#achievements-title, .achievement-grid li", 75);
  register(".writing-card");
  register("#contact .section-description, .contact-email", 60, 90);
  register(".contact-actions > :not([hidden])", 75, 120);
  register("#contact .social-tile", 65);
  const seen = new Set();
  const animations = new Map();
  const ease = getComputedStyle(root).getPropertyValue("--motion-ease").trim();
  let paused = false;
  try { paused = sessionStorage.getItem("portfolio-motion-paused") === "true"; } catch {}
  let observer, pointerEvents, tilted, frame, point, transition;
  const enabled = () => !paused && !reduced.matches;

  function animate(element, from, to, duration, delay = 0) {
    if (!element?.animate || !enabled()) return;
    const animation = element.animate([from, to], { duration, delay, easing: ease, fill: "backwards" });
    animations.set(animation, element);
    animation.finished.catch(() => {}).finally(() => animations.delete(animation));
  }

  function rise(element, distance, duration, delay) {
    animate(element, { opacity: 0, translate: "0 " + distance + "px" }, { opacity: 1, translate: "0 0" }, duration, delay);
  }

  function reveal(element, delay) {
    seen.add(element);
    observer.unobserve(element);
    if (element.matches(":focus-within, :target")) return;
    const story = sectionMotion.get(element);
    if (story) {
      if (element.matches(".about-portrait")) {
        const image = element.querySelector("img");
        animate(element, { clipPath: "inset(0 0 100% 0)", translate: "0 24px" },
          { clipPath: "inset(0)", translate: "0 0" }, 920);
        animate(image, { opacity: 0, transform: "scale(1.05)" },
          { opacity: 1, transform: "scale(1)" }, 860, 60);
      } else if (element.matches(".portfolio-quote")) {
        const quoteDelay = element.closest(".about-copy") ? 240 : 0;
        // The outer mask draws in the existing border without changing its style.
        animate(element, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0)" }, 540, quoteDelay);
        animate(element.querySelector("blockquote"), { clipPath: "inset(0 0 100% 0)", translate: "0 18px" },
          { clipPath: "inset(0)", translate: "0 0" }, 760, quoteDelay + 40);
        rise(element.querySelector("figcaption"), 16, 650, quoteDelay + 165);
      } else if (element.matches("h2")) {
        animate(element, { clipPath: "inset(0 0 100% 0)", translate: "0 16px" },
          { clipPath: "inset(0)", translate: "0 0" }, 780);
      } else {
        rise(element, story.distance, 680, delay);
      }
      return;
    }
    rise(element, 30, 670, delay);
    const image = element.querySelector("img");
    animate(image, { clipPath: "inset(0 0 18% 0)" }, { clipPath: "inset(0)" }, 670, delay);
    rise(element.querySelector(".project-name"), 9, 520, delay + 65);
    rise(element.querySelector(".project-summary"), 7, 500, delay + 115);
  }

  function clearTilt() {
    cancelAnimationFrame(frame);
    frame = 0;
    if (tilted) {
      tilted.removeAttribute("data-tilting");
      tilted.style.removeProperty("--pitch");
      tilted.style.removeProperty("--yaw");
      tilted = null;
    }
  }

  function move(event) {
    if (event.pointerType !== "mouse") return clearTilt();
    const card = event.currentTarget;
    if (tilted !== card) clearTilt();
    tilted = card;
    point = [event.clientX, event.clientY];
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const bounds = card.getBoundingClientRect();
      const angle = value => Math.max(-3, Math.min(3, value * 6)) + "deg";
      card.style.setProperty("--pitch", angle(.5 - (point[1] - bounds.top) / bounds.height));
      card.style.setProperty("--yaw", angle((point[0] - bounds.left) / bounds.width - .5));
      card.setAttribute("data-tilting", "");
    });
  }

  function sync() {
    const active = enabled();
    root.classList.toggle("motion-paused", !active);
    root.classList.toggle("project-motion", active);
    pointerEvents?.abort();
    clearTilt();
    observer?.disconnect();
    if (!active) {
      for (const animation of animations.keys()) animation.cancel();
      transition?.skipTransition();
      targets.forEach(target => seen.add(target));
      return;
    }
    if (observer) for (const target of targets) if (!seen.has(target)) observer.observe(target);
    if (mouse.matches) {
      pointerEvents = new AbortController();
      const options = { signal: pointerEvents.signal, passive: true };
      for (const card of cards) {
        card.addEventListener("pointermove", move, options);
        card.addEventListener("pointerleave", clearTilt, options);
        card.addEventListener("pointercancel", clearTilt, options);
      }
    }
  }

  if ("IntersectionObserver" in window) {
    observer = new IntersectionObserver(entries => {
      let batch = 0;
      const groups = new Map();
      for (const { target, isIntersecting } of entries) {
        if (!isIntersecting || !enabled() || !target.getClientRects().length || seen.has(target)) continue;
        const story = sectionMotion.get(target);
        if (story) {
          const index = groups.get(story.selector) || 0;
          groups.set(story.selector, index + 1);
          reveal(target, story.delay + index * story.stagger);
        } else {
          reveal(target, Math.min(batch++, 2) * 90);
        }
      }
    });
  }
  window.addEventListener("portfolio-motion", event => { paused = event.detail.paused; sync(); });
  reduced.addEventListener("change", sync);
  mouse.addEventListener("change", sync);
  document.addEventListener("focusin", event => {
    const focusedCard = event.target.closest(".featured-card, .project-card");
    for (const [animation, element] of animations) {
      if (element.contains(event.target) || focusedCard?.contains(element)) animation.cancel();
    }
  });
  document.querySelector(".filters")?.addEventListener("click", () => {
    clearTilt();
    for (const [animation, element] of animations) if (element.closest("[hidden]")) animation.cancel();
  });
  sync();

  // Use the browser's document snapshots and native history. Only name the
  // selected cover during a home/case pairing, including a back traversal.
  function pair(event, otherURL) {
    const vt = event.viewTransition;
    if (!vt) return;
    // Skipping an optional visual transition rejects ready while navigation succeeds.
    vt.ready.catch(() => {});
    if (!enabled() || !otherURL) return vt.skipTransition();
    const other = new URL(otherURL);
    const route = url => url.pathname.match(/\/work\/([^/]+)(?:\/(?:index\.html)?)?$/)?.[1];
    const current = route(location), next = route(other);
    const editorial = [location.pathname, other.pathname].some(path => path.startsWith("/writing/"));
    if (other.origin !== location.origin || (!current && !next && !editorial)) return vt.skipTransition();
    transition = vt;
    const image = current && !next ? document.querySelector(".case-cover img") :
      !current && next ? document.getElementById("project-" + next)?.querySelector("img") : null;
    if (image && !editorial) {
      for (const [animation, element] of animations) if (element === image || element.contains(image)) animation.cancel();
      image.style.viewTransitionName = "project-cover";
    }
    vt.finished.catch(() => {}).then(() => {
      if (transition !== vt) return;
      image?.style.removeProperty("view-transition-name");
      transition = null;
    });
  }
  window.addEventListener("pageswap", event => pair(event, event.activation?.entry?.url));
  window.addEventListener("pagereveal", event => pair(event, window.navigation?.activation?.from?.url));
  window.addEventListener("pagehide", clearTilt);

  if (document.body.classList.contains("case-page") && !location.hash && enabled()) {
    animate(document.querySelector(".case-intro h1"), { clipPath: "inset(0 0 100% 0)", translate: "0 12px" }, { clipPath: "inset(0)", translate: "0 0" }, 610);
    rise(document.querySelector(".case-lead"), 10, 540, 70);
    document.querySelectorAll(".case-meta > div").forEach((row, index) => rise(row, 8, 470, 85 + index * 45));
    rise(document.querySelector(".case-cover img"), 10, 590, 60);
  }
})();
