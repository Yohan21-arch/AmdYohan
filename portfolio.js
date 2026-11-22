const profile = portfolioContent;
for (const key of ["name", "intro"]) {
  for (const element of document.querySelectorAll(`[data-${key}]`)) {
    element.textContent = profile[key];
  }
}
document.title = `${profile.name} | Portfolio`;

const artwork = {
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
  github: '<path d="M9 19c-4.3 1.3-4.3-2.1-6-2.5m12 5v-3.3c.1-1-.3-1.7-.7-2.1 2.4-.3 4.9-1.2 4.9-5.3a4.2 4.2 0 0 0-1.1-3c.1-.3.5-1.4-.1-3-1 0-2 .4-3.2 1.2a11 11 0 0 0-5.6 0C8 5.2 7 4.8 6 4.8c-.6 1.6-.2 2.7-.1 3a4.2 4.2 0 0 0-1.1 3c0 4.1 2.5 5 4.9 5.3-.4.4-.8 1.1-.7 2.1v3.3"/>',
  whatsapp: '<path d="M20.6 11.8A8.6 8.6 0 0 1 8 19.5L3 21l1.4-4.8a8.6 8.6 0 1 1 16.2-4.4Z"/><path d="M9 8.2c-.4-.5-1.5 0-1.5 1.3 0 2.6 3.7 5.8 6.1 5.8 1.2 0 2-1.1 1.5-1.5l-1.7-.9c-.4-.2-.8.6-1.2.5-1.3-.4-2.4-1.6-2.8-2.7-.1-.5.6-.7.5-1.1L9 8.2Z"/>',
  linkedin: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7.5 10v6.5m0-9v.1m4 8.9V10m0 2.5a2.5 2.5 0 0 1 5 0v4"/>',
  certificate: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M7 8h10m-10 4h4m3 4v5l2-1.5 2 1.5v-5"/><circle cx="16" cy="14" r="2"/>',
};

function icon(name) {
  const element = document.createElement("span");
  element.className = "line-icon";
  element.setAttribute("aria-hidden", "true");
  element.innerHTML = `<svg viewBox="0 0 24 24" fill="none">${artwork[name]}</svg>`;
  return element;
}

function textElement(tag, className, text) {
  const element = document.createElement(tag);
  element.className = className;
  element.textContent = text;
  return element;
}

const categoryLabels = { "web-design": "Web design", "ai-tool": "AI tool", "web-app": "Web app", game: "Game" };
const features = document.querySelector("#featured-list");
const otherWork = document.querySelector("#other-work");
const otherProjects = document.querySelector("#other-work-list");
const featuredTemplate = document.querySelector("#featured-template");
const cardTemplate = document.querySelector("#project-template");
const dialog = document.querySelector("#project-dialog");
const detailLink = document.querySelector("#detail-link");
const repositoryLink = document.querySelector("#detail-repository");

function setOptionalLink(link, url) {
  link.hidden = !url;
  if (url) link.href = url;
  else link.removeAttribute("href");
}

function portfolioTime(date) {
  const time = textElement("time", "entry-date", formatPortfolioDate(date));
  time.dateTime = date;
  return time;
}

function renderProjectData(list, project) {
  list.replaceChildren();
  const fields = [
    ["My role", project.role],
    ["Project status", project.status],
    [project.dateLabel, portfolioTime(project.date)],
    ["Tools", project.stack.join(", ")],
  ];
  for (const [label, value] of fields) {
    const row = document.createElement("div");
    const detail = document.createElement("dd");
    detail.append(value);
    row.append(textElement("dt", "", label), detail);
    list.append(row);
  }
}

function entryLink(label, url, subject) {
  const link = textElement("a", "entry-link", label);
  link.href = url;
  if (subject) link.setAttribute("aria-label", `${label}: ${subject}`);
  return link;
}

const projectCards = profile.projects.map((project) => {
  const featured = project.featured ?? Boolean(project.caseStudy);
  const template = featured ? featuredTemplate : cardTemplate;
  const card = template.content.firstElementChild.cloneNode(true);
  const image = card.querySelector("img");
  const heading = card.querySelector(".project-name");
  const category = categoryLabels[project.category];
  image.src = project.image;
  image.alt = project.imageAlt;
  card.querySelector(".project-category").textContent = category;
  heading.textContent = project.title;
  card.querySelector(".project-summary").textContent = project.summary;
  renderProjectData(card.querySelector(".project-data"), project);

  const liveLink = card.querySelector(".live-link");
  const sourceLink = card.querySelector(".source-link");
  const liveLabel = project.category === "game" ? "Play game" : "Live demo";
  liveLink.textContent = liveLabel;
  setOptionalLink(liveLink, project.url);
  setOptionalLink(sourceLink, project.repository);
  liveLink.setAttribute("aria-label", project.category === "game" ? `Play ${project.title}` : `Open the live demo for ${project.title}`);
  sourceLink.setAttribute("aria-label", `Source for ${project.title} on GitHub`);

  const caseUrl = project.caseStudy ? `work/${project.caseStudy.slug}/index.html` : "";
  const caseLink = card.querySelector(".case-link");
  const action = card.querySelector(".project-action");
  setOptionalLink(caseLink, caseUrl);
  caseLink.setAttribute("aria-label", `View case study for ${project.title}`);
  action.hidden = Boolean(caseUrl);

  if (caseUrl) {
    card.id = `project-${project.caseStudy.slug}`;
    card.tabIndex = -1;
    heading.id = `${card.id}-title`;
    card.setAttribute("aria-labelledby", heading.id);
  } else {
    action.setAttribute("aria-label", `View details for ${project.title}`);
    action.addEventListener("click", () => {
      const preview = dialog.querySelector(".dialog-image");
      preview.src = project.image;
      preview.alt = project.imageAlt;
      dialog.querySelector("#detail-category").textContent = category;
      dialog.querySelector("#detail-title").textContent = project.title;
      dialog.querySelector("#detail-description").textContent = project.description;
      renderProjectData(dialog.querySelector("#detail-data"), project);
      detailLink.textContent = liveLabel;
      setOptionalLink(detailLink, project.url);
      setOptionalLink(repositoryLink, project.repository);
      dialog.showModal();
    });
  }

  if (featured) {
    const coverLink = card.querySelector(".featured-image-link");
    const coverUrl = caseUrl || project.url;
    if (coverUrl) {
      coverLink.href = coverUrl;
      coverLink.setAttribute("aria-label", caseUrl ? `${project.title} case study` : `${project.title} live demo preview`);
    }
  }
  (featured ? features : otherProjects).append(card);
  return { category: project.category, featured, element: card };
});

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

const filters = document.querySelectorAll("[data-filter]");
const filterStatus = document.querySelector("#filter-status");
for (const button of filters) {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    for (const option of filters) option.setAttribute("aria-pressed", String(option === button));
    let visible = 0;
    for (const card of projectCards) {
      card.element.hidden = filter !== "all" && card.category !== filter;
      if (!card.element.hidden) visible += 1;
    }
    features.hidden = !projectCards.some((card) => card.featured && !card.element.hidden);
    otherWork.hidden = !projectCards.some((card) => !card.featured && !card.element.hidden);
    filterStatus.textContent = `${visible} ${visible === 1 ? "project" : "projects"} shown.`;
  });
}

function focusLinkedProject() {
  const card = projectCards.find(({ element }) => element.id && `#${element.id}` === location.hash)?.element;
  if (!card) return;
  if (card.hidden) document.querySelector('[data-filter="all"]').click();
  card.focus({ preventScroll: true });
  card.scrollIntoView({ block: "start", behavior: "instant" });
}

window.addEventListener("hashchange", focusLinkedProject);
if (location.hash.startsWith("#project-")) {
  window.addEventListener("load", focusLinkedProject, { once: true });
}

const qualificationList = document.querySelector("#qualification-list");
document.querySelector("#qualification-empty").hidden = profile.qualifications.length > 0;
for (const item of profile.qualifications) {
  const row = document.createElement("li");
  row.append(textElement("strong", "row-title", item.title), textElement("span", "row-detail", item.detail));
  qualificationList.append(row);
}

const skillsList = document.querySelector("#skill-list");
for (const skill of profile.skills) {
  const row = document.createElement("li");
  row.append(textElement("strong", "row-title", skill.label), entryLink(skill.evidence, skill.url));
  skillsList.append(row);
}

const certificateList = document.querySelector("#certificate-list");
certificateList.hidden = profile.certificates.length === 0;
document.querySelector("#certificate-empty").hidden = profile.certificates.length > 0;
for (const certificate of profile.certificates) {
  const card = document.createElement("article");
  card.className = "certificate-card";
  if (certificate.id) card.id = certificate.id;
  const label = document.createElement("div");
  label.className = "certificate-details";
  label.append(textElement("h3", "row-title", certificate.title), textElement("p", "row-detail", certificate.detail));
  if (certificate.url) {
    const action = certificate.urlLabel || "View certificate";
    const link = textElement("a", "credential-link", action);
    link.href = certificate.url;
    link.setAttribute("aria-label", `${action}: ${certificate.title}`);
    label.append(link);
  }
  if (certificate.image) {
    card.classList.add("certificate-card-with-image");
    if (certificate.badge) card.classList.add("certificate-card-badge");
    const preview = document.createElement("a");
    preview.className = "certificate-preview";
    preview.href = certificate.image;
    const image = document.createElement("img");
    image.src = certificate.image;
    image.alt = certificate.imageAlt || certificate.title;
    image.width = certificate.imageWidth;
    image.height = certificate.imageHeight;
    image.loading = "lazy";
    image.decoding = "async";
    preview.append(image, textElement("span", "certificate-preview-label", "View full-size image"));
    card.append(preview);
  } else {
    card.append(icon("certificate"));
  }
  card.append(label);
  certificateList.append(card);
}

const achievementList = document.querySelector("#achievement-list");
document.querySelector("#achievements").hidden = profile.achievements.length === 0;
for (const achievement of profile.achievements) {
  const item = document.createElement("li");
  if (achievement.date) item.append(portfolioTime(achievement.date));
  item.append(
    textElement("h4", "row-title", achievement.title),
    textElement("p", "row-detail", achievement.detail),
    entryLink(achievement.linkLabel, achievement.url, achievement.title),
  );
  achievementList.append(item);
}

const writingList = document.querySelector("#writing-list");
for (const entry of profile.writing) {
  const article = document.createElement("article");
  article.className = "writing-card";
  article.append(
    portfolioTime(entry.date),
    textElement("h3", "", entry.title),
    textElement("p", "row-detail", entry.summary),
    entryLink(entry.linkLabel, entry.url, entry.title),
  );
  writingList.append(article);
}

const { email, linkedin, profiles, shareUrl } = profile.contact;
const emailAddress = document.querySelector("#contact-email");
const emailLink = document.querySelector("#email-link");
const copyEmail = document.querySelector("#copy-email");
const copyStatus = document.querySelector("#copy-email-status");
const linkedInLink = document.querySelector("#linkedin-link");

emailAddress.textContent = email;
emailAddress.hidden = !email;
setOptionalLink(emailLink, email ? `mailto:${email}` : "");
setOptionalLink(linkedInLink, linkedin);
linkedInLink.prepend(icon("linkedin"));
copyEmail.hidden = !email;
copyEmail.addEventListener("click", async () => {
  copyStatus.textContent = "";
  try {
    await navigator.clipboard.writeText(email);
    copyStatus.textContent = "Email address copied.";
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(emailAddress);
    selection.removeAllRanges();
    selection.addRange(range);
    copyStatus.textContent = "Email address selected. Use your device’s copy command.";
  }
});

const socialList = document.querySelector("#social-list");
for (const contact of profiles) {
  if (!contact.url) continue;
  const row = document.createElement("li");
  const tile = document.createElement("a");
  tile.className = "social-tile";
  const label = textElement("span", "social-name", contact.name);
  tile.href = contact.url;
  tile.append(icon(contact.icon), label);
  row.append(tile);
  socialList.append(row);
}

const shareLink = document.querySelector("#whatsapp-share");
setOptionalLink(shareLink, shareUrl);
shareLink.prepend(icon("whatsapp"));

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".site-nav");
function setMenu(open) {
  menuButton.setAttribute("aria-expanded", String(open));
  navigation.classList.toggle("open", open);
}
menuButton.addEventListener("click", () => setMenu(menuButton.getAttribute("aria-expanded") === "false"));
navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenu(false);
});
const header = document.querySelector(".site-header");
header.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
    setMenu(false);
    menuButton.focus();
  }
});

const sectionLinks = [...navigation.querySelectorAll('a[href^="#"]')].map((link) => ({
  link,
  section: document.getElementById(link.hash.slice(1)),
}));
let activeSection;
let scrollFrame;

function updateActiveSection() {
  scrollFrame = undefined;
  const marker = header.getBoundingClientRect().bottom + 48;
  let current = sectionLinks.findLast(({ section }) => section.getBoundingClientRect().top <= marker);
  const pageBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  if (pageBottom && window.scrollY > 0) current = sectionLinks.at(-1);
  if (current === activeSection) return;
  activeSection?.link.removeAttribute("aria-current");
  current?.link.setAttribute("aria-current", "location");
  activeSection = current;
}
function scheduleActiveSection() {
  if (scrollFrame === undefined) scrollFrame = window.requestAnimationFrame(updateActiveSection);
}
window.addEventListener("scroll", scheduleActiveSection, { passive: true });
window.addEventListener("resize", scheduleActiveSection);
updateActiveSection();

if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const revealInset = 32;
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) reveal(entry.target);
    }
  }, { rootMargin: `0px 0px -${revealInset}px 0px` });

  function reveal(element) {
    element.classList.remove("scroll-reveal-pending");
    observer.unobserve(element);
  }

  const revealBoundary = document.documentElement.clientHeight - revealInset;
  const targets = document.querySelectorAll("main > .section, .featured-card, .project-card");
  for (const element of targets) {
    if (element.getBoundingClientRect().top < revealBoundary) continue;
    element.classList.add("scroll-reveal", "scroll-reveal-pending");
    element.addEventListener("focusin", () => reveal(element), { once: true });
    observer.observe(element);
  }
}
