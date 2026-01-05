# brAInwav Documentation Site

This is the VitePress documentation site for brAInwav Agentic Governance.

## Development

### Prerequisites
- Node.js 22+
- pnpm 9+

### Install Dependencies

```bash
cd docs
pnpm install
```

### Start Dev Server

```bash
pnpm docs:dev
```

Visit `http://localhost:5173`

### Build for Production

```bash
pnpm docs:build
```

Output is in `docs/.vitepress/dist/`

### Preview Production Build

```bash
pnpm docs:preview
```

## Project Structure

```
docs/
├── .vitepress/          # VitePress configuration
│   └── config.mjs       # Site config, navigation, sidebar
├── guide/              # Main documentation
│   ├── introduction.md
│   ├── installation.md
│   ├── arctdd.md
│   └── ...
├── blog/               # Blog posts
│   └── why-brainwav-2026-01-04.md
├── public/             # Static assets
│   └── brand-mark.webp
├── assets/             # Images and graphics
│   └── tier-comparison.svg
├── index.md            # Homepage
├── QUICKSTART-5min.md  # Quickstart guide
└── TIERED-OFFERING-STRUCTURE.md  # Tier comparison
```

## Adding Documentation

### New Page

1. Create markdown file in `docs/guide/`
2. Add to sidebar in `docs/.vitepress/config.mjs`:

```javascript
{
  text: 'New Section',
  items: [
    { text: 'My New Page', link: '/guide/my-new-page' }
  ]
}
```

### New Blog Post

1. Create markdown file in `docs/blog/`
2. Follow naming convention: `blog/YYYY-MM-DD-slug.md`
3. Add to navigation in `docs/.vitepress/config.mjs`

## Styling

The site uses VitePress default theme with brAInwav brand colors:

- **Primary**: `#d97757` (orange accent)
- **Dark**: `#141413` (text and backgrounds)
- **Light**: `#faf9f5` (light backgrounds)
- **Gray**: `#b0aea5` (secondary elements)

Custom components can be added to `docs/.vitepress/components/`

## Deployment

### GitHub Pages

Add this to your repository's `.github/workflows/docs.yml`:

```yaml
name: Deploy Docs

on:
  push:
    branches: [main]
    paths: [docs/**]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: cd docs && pnpm install
      - run: cd docs && pnpm docs:build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs/.vitepress/dist
```

### Custom Domain

1. Add `CNAME` file in `docs/public/CNAME`
2. Configure DNS with your provider
3. Enable custom domain in GitHub repo settings

## Link Checking

To check for broken links:

```bash
pnpm add -D markdown-link-check
markdown-link-check **/*.md
```

## Resources

- [VitePress Documentation](https://vitepress.dev/)
- [Vue 3 Documentation](https://vuejs.org/)
- [Markdown Guide](https://www.markdownguide.org/)
