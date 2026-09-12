# Juwairiyyah Saiyed · Portfolio

**Curious about people. Serious about better products.**

I’m a Computer Science Engineering graduate seeking **Product Manager / Product Owner internships**. My experience spans frontend development, data analytics, AI applications, and project coordination. This portfolio brings that work together through interactive project presentations and an animated guide.

## Explore the portfolio

- **Meet my guide:** an illustrated companion with expressive gestures, winged transitions, and an optional guided tour.
- **Explore my projects:** each card opens a presentation inside the portfolio, with project context, contributions, visuals, and proposed next steps.
- **Share a slide:** project and slide selections are reflected in the URL for direct access.
- **Browse at your pace:** keyboard navigation, motion controls, and a hide-guide option keep the experience in your hands.

## Featured work

| Project | Focus |
| --- | --- |
| **GenSolar** | Responsive frontend components for a solar management platform, developed during my IdeasPlus internship. |
| **JBot AI Assistant** | A conversational AI chatbot built with the Gemini API. |
| **Agriculture Analytics Dashboard** | A Tableau dashboard supporting data-driven farming decisions. |
| **Video Games Analytics Dashboard** | An interactive Power BI dashboard exploring releases, platforms, developers, and user popularity. |
| **AI Mood Detection** | Real-time emotion detection using DeepFace and OpenCV. |

The presentations distinguish completed work from proposed next steps. Project technologies listed above describe the projects themselves; this portfolio displays their case studies without running those services.

## Run locally

Use **Node.js 22.13 or later** and npm.

```bash
npm ci
npm run dev
```

Open the local address printed in the terminal, normally `http://localhost:3000`.

## Deploy to GitHub Pages

The portfolio exports to static HTML, CSS, JavaScript, and local artwork. No application server or API key is needed to host it.

1. Keep this repository’s files at the top level, including `.github/workflows/pages.yml` and `package.json`.
2. Open **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. Open **Actions → Deploy portfolio to GitHub Pages → Run workflow** on `main`.
4. After deployment succeeds, find the website URL in **Settings → Pages**.

Future pushes to `main` trigger deployment automatically. The workflow detects the deployment path for both repository sites and root sites.

See [the deployment guide](GITHUB_PAGES.md) for full setup details.

To preview a repository-path build locally:

```bash
npm run build:pages -- --base=/portfolio
npm run preview:pages -- --base=/portfolio --port=4173
```

Open `http://localhost:4173/portfolio/`. Replace `portfolio` with your repository name; omit `--base` from both commands for a root site.

## Customize the content

| Edit | File or folder |
| --- | --- |
| Introduction, experience, education, and contact details | `content/profile.ts` |
| Project cards | `content/projects.ts` |
| Project presentations and guide cues | `content/decks/` |
| Portrait, character paths, and alignment | `content/character.ts` |
| Character artwork | `public/media/guide/female/` |
| Project images | `public/media/projects/` |
| Page layout | `components/portfolio/PortfolioExperience.tsx` |
| Presentation viewer | `components/portfolio/ProjectDeckDialog.tsx` |
| Shared character motion | `hooks/use-portrait-motion.ts` |

The portrait and guide are illustrations. To use a personal portrait, replace the image and update its path and alignment in `content/character.ts`. Increment `assetVersion` when replacing artwork so browsers fetch the updated files.

## Technology

React 19, TypeScript, Vinext, Vite, Tailwind CSS, GSAP, and GitHub Actions. The project presentations are rendered locally in the browser.

## Checks

```bash
npm test
npm run typecheck
npm run lint:app
npm run check:content
npm run build:pages
```

Use `build:pages` for GitHub Pages. The separate `build` command retains the original Worker deployment target.

## Get in touch

I’m interested in Product Manager and Product Owner internship opportunities where I can bring my technical foundation, curiosity, and coordination experience.

[Email me](mailto:juwairiyyahsaiyed1803@gmail.com) · [Connect on LinkedIn](https://www.linkedin.com/in/juwairiyyah-saiyed-2219a2252)
