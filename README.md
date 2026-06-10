# The Nest Church Next.js Rewrite

This workspace is the start of a Next.js rewrite of the Django project at `C:\Users\user\Downloads\nest\nest`, beginning with the visitor-facing website.

## Migrated first-pass routes

- `/`
- `/about`
- `/contact`
- `/live`
- `/events`
- `/gallery`
- `/blog`
- `/give`
- `/prayer`
- `/testimonies`
- `/wisteen`

## Notes

- This pass focuses on the public marketing and visitor surface.
- Member, staff, and admin workflows from Django are intentionally excluded for now.
- Contact and prayer pages have frontend forms, but production backend wiring still needs to be implemented.
- Giving still needs real payment integration.

## Run

Use `pnpm` through Corepack if `pnpm` is not globally installed:

```bash
corepack pnpm install
corepack pnpm dev
```
