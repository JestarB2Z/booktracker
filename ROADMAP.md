# Roadmap

Things to come back to, roughly in the order they'd add the most value.

## Known issues

- [ ] One specific barcode fails to scan correctly (reported after the
      Cloudflare Tunnel switch enabled camera access) — needs the exact
      book/ISBN and what happened (not detected at all vs. detected wrong)
      to debug.

## Security / hardening

- [ ] No brute-force protection on `/api/auth/login` — add basic rate
      limiting or a lockout after repeated failed attempts.
- [ ] No self-service password change — family members can't update their
      own password; only an admin can reset one (via `PATCH
      /api/admin/users/[id]`, no UI for it yet either). Add both a "change
      my password" option and a password-reset control in the Admin page.
- [ ] No backup strategy for the SQLite volume (`booktracker-data`). Worth
      a scheduled copy of the `.db` file off the Proxmox VM.

## Feature ideas (explicitly deferred from the MVP)

- [ ] Reading status / wishlist (want-to-read vs. owned)
- [ ] Ratings / reviews
- [ ] Track multiple copies owned by the *same* person (right now "Add
      anyway" creates a second row, but there's no explicit quantity field)
- [ ] Self-host cover images instead of hotlinking Open Library/Google
      Books URLs, so covers don't break if those change or go down
- [ ] Sort/filter on the "My Books" library page (currently just a flat
      list, newest first)
- [ ] Installable PWA polish — add real PNG icons (currently a single SVG)
      and test "Add to Home Screen" on iOS/Android

## Operational

- [ ] No CI/CD — deploys are a manual "pull and redeploy" in Portainer
      after pushing to GitHub. Could wire up a Portainer webhook so pushes
      to `master` auto-redeploy.
- [ ] Revisit the Prisma version pin (currently 6.19.3) once Prisma 7/8's
      driver-adapter + `prisma.config.ts` migration path is better
      documented — see the commit history/session notes for why 7 was
      avoided initially.
- [ ] `npm audit` flags a high-severity issue in `deepmerge-ts`, pulled in
      only by the `prisma` CLI's config loader (build/dev tooling, not the
      running app). Low risk, but worth re-checking when bumping Prisma.
