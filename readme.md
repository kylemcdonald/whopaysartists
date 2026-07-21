# [Who Pays Artists?](https://www.whopaysartists.com/)

Who Pays Artists is an archived collection of anonymous reports about how artists were paid for their work. The site no longer accepts submissions.

## Architecture

The site is built as static HTML and deployed to Cloudflare Pages. The build creates:

- The home page and downloadable JSON/CSV datasets.
- One extensionless-compatible HTML page for every report ID.
- A custom `404.html` page and Cloudflare Pages response headers.

There is no application server, database, or runtime environment.

## Local development

Node.js 22 or newer is required.

```sh
npm ci
npm test
npm run dev
```

Wrangler serves the site on its printed port. Open it using the local-network hostname, for example `http://vibecheck.local:8788/`.

The generated `dist/` directory is intentionally ignored by Git.

## Deployment

Cloudflare Pages builds the `master` branch with:

- Build command: `npm run build`
- Build output directory: `dist`
- Project name: `whopaysartists`

Pushing to `master` triggers a production deployment. A maintainer with Cloudflare credentials can also deploy the current checkout directly:

```sh
npm run deploy
```

To add or remove reports, edit `data.json`, run `npm test`, and deploy the change.
