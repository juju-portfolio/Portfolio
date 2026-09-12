# Publish this portfolio on GitHub Pages

The exported portfolio needs no application server, API key, database or paid hosting. The guide, native project decks, tour, image enlargement and animations run in the browser. GitHub builds the files on its own runner and hosts the result after your computer is switched off.

## First deployment

1. Create a **public** GitHub repository, with `main` as the default branch. Choose any name such as `portfolio`, or use `YOUR-USERNAME.github.io` for a root profile site.
2. Put the prepared source package's **contents** at the repository root. `package.json`, `app/` and `.github/workflows/pages.yml` must be at the top level. Include the hidden `.github` folder. Do not upload the surrounding private Portfolio workspace or the ZIP file itself.
3. In the repository, open **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. Open **Actions → Deploy portfolio to GitHub Pages → Run workflow**, select `main`, and run it. Future pushes to `main` deploy automatically.
5. When the deployment succeeds, open the URL shown by the `github-pages` deployment or Settings → Pages.

No custom secret is needed; the workflow uses GitHub's built-in token with scoped Pages permissions. If the first push ran before Pages was enabled, enable it and rerun the workflow. GitHub Pages on the Free plan requires a public source repository. Only the generated `out/` folder becomes the hosted site.

## Local commands

Use Node.js 22.13 or later (the workflow selects Node 22), then install the locked dependencies:

```sh
npm ci
npm run dev
```

The regular development preview remains at localhost:3000. To verify the static site at a repository URL:

```sh
npm run build:pages -- --base=/portfolio
npm run preview:pages -- --base=/portfolio --port=4173
```

Open `http://localhost:4173/portfolio/`. This preview serves files only, with no application runtime or route fallback. Stop it with Ctrl+C. For a root site or custom domain, omit `--base` from both commands. The GitHub workflow obtains the correct path from `configure-pages` automatically, including when a custom domain is configured.

The build validates that the portfolio HTML was actually exported and that HTML/CSS asset references resolve. It refuses to publish server files, environment files, source maps or symlinks. `out/` is recreated on each Pages build and should not be committed. `npm run build` remains the existing Worker build; use `npm run build:pages` for GitHub.

## Updating the portfolio

- Name and contact information: `content/profile.ts`.
- Project cards: `content/projects.ts`.
- Native project slides: `content/decks/`.
- Portrait and avatar files: `public/media/guide/female/`.
- Avatar paths, eye alignment and cache version: `content/character.ts`. Update `assetVersion` after replacing artwork.

Keep asset paths in content as `/media/...`; the renderer adds the deployment path, including the shared wing-image CSS variable. Project links use query parameters, so refresh and shared slide links work under the repository URL.

The résumé evidence ledger stays private and is not included in the public source package. The public CI validates structure/assets/tests. The original private workspace retains `npm run check:release` for evidence review before publishing changed factual claims. Do not invent contributions, outcomes or metrics while editing decks.

## Build compatibility note

The installed Vinext version does not prepend Next's `basePath` when prerendering `/`. The Pages build therefore leaves route `basePath` empty, uses Vite's `base` and Next's `assetPrefix` for browser assets, and prefixes authored public URLs at render time. It copies the generated `_next` directory to the artifact root because GitHub itself mounts that artifact at the repository path. No dependency files or generated JavaScript are patched. Native navigation preserves `location.pathname`.

See [GitHub's custom Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) for repository settings and deployment permissions.
