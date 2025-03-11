# Nuxt 3 Headless WordPress with Gravity Forms

This project demonstrates how to integrate Nuxt 3 with WordPress as a headless CMS, specifically focusing on Gravity Forms integration using WPGraphQL and WPGraphQL for Gravity Forms.

## Project Overview

This project includes several demo routes:

- `/headlesswp-gform`: Main demo showcasing Gravity Forms integration with WPGraphQL
- `/products`: Test route using a dummy REST API (for API integration testing)
- `/wpblog`: Test route demonstrating native WordPress post data fetching

## Prerequisites

- WordPress installation with:
  - WPGraphQL plugin
  - WPGraphQL for Gravity Forms plugin
  - Gravity Forms plugin
- Nuxt 3

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Environment Variables

Create a `.env` file with:

```bash
WORDPRESS_URL=
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
