# Personal portfolio

Extract the ZIP, then open `index.html` in a browser. Keep the other files and the `assets` folder alongside it.

Edit `content.js` to personalize the site.

- Update `name` and `intro` for the homepage greeting. Edit the full About introduction in `index.html`.
- Update `qualifications`, `certificates`, and `achievements`. A certificate URL can point to a verification page or PDF. Add `image`, `imageAlt`, `imageWidth`, and `imageHeight` for a visible certificate preview, and place the image in `assets`.
- Put your project previews in `assets` and update each project’s `image`, `imageAlt`, `summary`, `description`, and `url`. Add `repository` to show a GitHub link. Set `category` to `web-design`, `ai-tool`, or `web-app` for the work filters.
- Featured projects have a `caseStudy` entry. After editing one, run `node build-case-studies.cjs .` from the extracted folder to regenerate the two pages under `work/`.
- Set the public email and LinkedIn URL in `contact` and the GitHub and Instagram URLs in `contact.profiles`. Update `contact.shareUrl` with the published portfolio URL if the site moves. The existing WhatsApp link opens a share with that URL.

The color palette is at the top of `style.css`. All images and scripts are included. The optional web fonts fall back to system fonts when offline.
