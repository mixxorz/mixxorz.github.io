# mixxorz.github.io

Mitchel Cabuloy's personal blog, built with [Astro](https://astro.build/).

## Local development

Requires Node.js 22.12 or newer.

```sh
npm install
npm run dev
```

Astro prints the local URL when the development server starts. To verify a production build locally:

```sh
npm run check
npm run build
npm run preview
```

## Content

Posts live in `src/content/posts/<year>/<slug>.md`. That path determines the published URL: for example, `src/content/posts/2018/example.md` is generated at `/2018/example/`.

Static files live in `public/`. Existing article images and demos remain under `public/assets/` so their historical URLs continue to work.

## Theme

The visual foundation is [Monograph](https://github.com/xocothemes/monograph), vendored from version 1.0.0 at commit `65f0493f5baf5726cb0f6ee7ff855c786e56e1eb` and adapted for this site. Monograph is MIT licensed; see `LICENSE`.

Deployment configuration will be added separately after the local site is approved.
