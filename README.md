# Milkbook

Milkbook records milk deliveries, payments, monthly balances and customer history. Bills can be downloaded individually or together in English or Tamil.

## Run locally

Open `index.html` directly in a browser. The standalone app saves its ledger in that browser profile.

## Hosted version

Run `node build.mjs` from the repository root to generate the Worker at `dist/server/index.js`. Serve it behind owner-only access with a private R2 bucket bound as `BUCKET`. The hosted app reads and writes customer data through the same-origin `/api/ledger` endpoint. Configure the deployment for your own hosting project before publishing.
