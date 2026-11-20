const { existsSync, mkdirSync, readFileSync, writeFileSync } = require("node:fs");
const { resolve, join } = require("node:path");
const { runInNewContext } = require("node:vm");

const root = resolve(process.argv[2] || "dist");
const prefix = "../../";
const base = "https://indigo-personal-portfolio.notyohan.chatgpt.site";
const profile = runInNewContext(`${readFileSync(join(root, "content.js"), "utf8")}\nportfolioContent`);
const projects = profile.projects.filter((project) => project.caseStudy);
const chars = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const escape = (value) => String(value).replace(/[&<>"']/g, (match) => chars[match]);

function renderFigure(item, cover = false) {
  return `<figure class="${cover ? "case-cover" : "case-image"}">
    <img src="${prefix}${escape(item.image)}" alt="${escape(item.alt)}" width="1000" height="676" ${cover ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
    <figcaption>${escape(item.caption)}</figcaption>
  </figure>`;
}

function renderVideo(video) {
  if (!video || !existsSync(join(root, video.source))) return "";
  return `<figure class="case-video">
    <video controls playsinline preload="none" poster="${prefix}${escape(video.poster)}" width="1000" height="676" aria-label="${escape(video.caption)}">
      <source src="${prefix}${escape(video.source)}" type="video/mp4">
      <a href="${prefix}${escape(video.source)}">Download the sample walkthrough</a>
    </video>
    <figcaption>${escape(video.caption)}</figcaption>
  </figure>`;
}

for (const project of projects) {
  const { caseStudy: detail } = project;
  const next = projects.find((candidate) => candidate !== project);
  const title = escape(project.title);
  const name = escape(profile.name);
  const description = escape(detail.lead);
  const caseURL = `${base}/work/${escape(detail.slug)}/`;
  const directory = join(root, "work", detail.slug);
  const links = [
    project.url && `<a class="button button-primary" href="${escape(project.url)}">Live demo</a>`,
    project.repository && `<a class="button button-outline" href="${escape(project.repository)}">Source on GitHub</a>`,
    detail.writeup && `<a class="button button-outline" href="${escape(detail.writeup)}">Read development notes</a>`,
  ].filter(Boolean).join("\n          ");

  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, "index.html"), `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#0D0D0F">
  <title>${title} case study | ${name}</title>
  <meta name="description" content="${description}">
  <meta property="og:title" content="${title} case study | ${name}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${base}/${escape(project.image)}">
  <meta property="og:url" content="${caseURL}">
  <link rel="canonical" href="${caseURL}">
  <link rel="icon" href="${prefix}assets/mark.svg" type="image/svg+xml">
  <link rel="stylesheet" href="${prefix}style.css">
</head>
<body id="top" class="case-page">
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="shell header-inner">
      <a class="brand" href="${prefix}index.html"><img src="${prefix}assets/mark.svg" alt="" width="35" height="35">${name}</a>
      <a class="top-link case-back" href="${prefix}index.html#work">Back to work</a>
    </div>
  </header>
  <main id="main" tabindex="-1">
    <article>
      <header class="case-intro">
        <div class="shell case-intro-grid">
          <div>
            <p class="eyebrow">Case study · ${escape(project.status)}</p>
            <h1>${title}</h1>
            <p class="case-lead">${description}</p>
            <div class="featured-actions">
              ${links}
            </div>
          </div>
          <dl class="case-meta">
            <div><dt>Role</dt><dd>${escape(detail.role)}</dd></div>
            <div><dt>Year</dt><dd>${escape(detail.period)}</dd></div>
            <div><dt>Built with</dt><dd>${project.stack.map(escape).join(" · ")}</dd></div>
          </dl>
        </div>
      </header>
      <div class="shell case-body">
        ${renderFigure({ image: project.image, alt: project.imageAlt, caption: detail.coverCaption }, true)}
        <section class="case-story" aria-label="Project story">
          <div><h2>The goal</h2><p>${escape(detail.goal)}</p></div>
          <div><h2>The approach</h2><p>${escape(detail.decision)}</p></div>
          <div><h2>What shipped</h2><p>${escape(detail.result)}</p></div>
        </section>
        <section class="case-evidence" aria-labelledby="case-workflow">
          <h2 id="case-workflow">The interface in use</h2>
          <div class="case-media">${detail.media.map((item) => renderFigure(item)).join("\n")}</div>
          ${renderVideo(detail.video)}
        </section>
        ${next ? `<section class="case-next" aria-labelledby="case-next-heading"><div><p class="eyebrow">Next case study</p><h2 id="case-next-heading">${escape(next.title)}</h2></div><a class="button button-outline" href="../${escape(next.caseStudy.slug)}/index.html">View case study</a></section>` : ""}
      </div>
    </article>
  </main>
  <footer class="site-footer">
    <div class="shell footer-inner"><a class="brand" href="${prefix}index.html"><img src="${prefix}assets/mark.svg" alt="" width="29" height="29">${name}</a><a class="top-link" href="#top">Back to top</a></div>
  </footer>
</body>
</html>
`);
  console.log(`Built ${detail.slug}`);
}
