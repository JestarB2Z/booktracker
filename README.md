# Book Tracker

A family-shared book library tracker — check whether anyone in the family already
owns a book before buying a duplicate. Scan a barcode in the shop, or search
manually; the search checks every family member's collection, not just your own.

## Local development

```bash
npm install
cp .env.example .env   # then edit SESSION_SECRET / ADMIN_USERNAME / ADMIN_PASSWORD
npx prisma migrate dev
npx prisma db seed     # creates the admin account from .env
npm run dev
```

Open http://localhost:3000 and log in with the admin account you set in `.env`.
Once logged in, use **Admin → Add a family member** to create accounts for
everyone else — there's no public sign-up form by design.

## Deploying with Docker

On the host (e.g. your Proxmox VM), copy `.env.example` to `.env` and fill in
real values (a random 32+ character `SESSION_SECRET`, and an admin
username/password), then:

```bash
docker compose up --build -d
```

The app listens on port 3000. Books are persisted in a SQLite file in the
`booktracker-data` Docker volume, so they survive container restarts/rebuilds.

Expose port 3000 to the outside world via your own reverse proxy / tunnel
(e.g. a Cloudflare Tunnel or Netbird) — this app doesn't handle that layer
itself, it just serves plain HTTP.

To add or manage family accounts after the first deploy, log in as the admin
account and use the **Admin** tab.

## Notes

- Barcode scanning uses the browser's native `BarcodeDetector` API where
  available (Chrome/Android), falling back to `@zxing/browser` elsewhere
  (Safari/iOS/Firefox). It needs camera access, so test it on a real phone —
  it won't do much in a desktop browser without a camera pointed at a barcode.
- ISBN metadata lookup tries the Open Library API first, then Google Books.
