# Dolce testing suite

Automated and manual checks to run **before production deploy**.

## Quick start

```bash
npm install
npm test
```

Requires no MongoDB for unit / security / scalability suites.

## Layout

| Folder | Focus |
|--------|--------|
| `unit/` | Pure helpers (validation, WhatsApp links, admin tabs, JWT) |
| `security/` | Auth toughness, injection-ish inputs, phone/email abuse cases |
| `scalability/` | Large payloads, burst validation, concurrent helper load |
| `api/` | Optional live smoke tests against a running server |
| `ux/` | Manual pre-deploy UX & ops checklist |
| `security/pre-deploy-security.md` | Security hardening checklist for Vercel |

## Commands

```bash
npm test                 # all automated *.test.ts
npm run test:watch       # watch mode
npm run test:api         # API smoke (needs BASE_URL + running app)
```

### Live API smoke

With `npm run dev` (or a production URL):

```bash
npm run test:api
# or against production / staging:
# PowerShell:  $env:DOLCE_TEST_URL="https://your-domain.com"; npm run test:api
# bash:        DOLCE_TEST_URL=https://your-domain.com npm run test:api
```

Soft-skips if nothing is listening (so `npm test` still stays green offline).

## What “pass” means for deploy

1. `npm test` exits 0  
2. `npm run build` succeeds  
3. Security + UX checklists reviewed  
4. Optional: `DOLCE_TEST_URL=… npm run test:api` against staging/prod  

These tests do **not** replace manual QA of email/WhatsApp delivery or Uploadthing uploads.
