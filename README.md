# hello, projects

**A tiny app. A real database. One satisfying reload.**

An independent, MIT-licensed community demo of **Stripe Projects → Cloudflare Workers + D1 → Astro**. Click **Save a hello**, reload, and find the same record in your paper trail. There is no payment integration, account system, or browser-side pretend database.

> Status: local database persistence, type checking, and database tests have passed. Cloud provisioning and a public deployment are pending account authentication. The commands below use the current Stripe Projects catalog and CLI help; the complete remote sequence has not yet been exercised for this repository.

## What does what?

| Part | Responsibility |
| --- | --- |
| Stripe Projects | Link/create your provider account, provision services, retrieve credentials |
| Astro | Render the page and handle the tiny POST endpoint |
| Cloudflare Workers | Serve the deployed app |
| Cloudflare D1 | Store the hello records across requests and deployments |
| Repo scripts | Bind the provisioned database, apply SQL, build and upload the app |

Stripe Projects provisions infrastructure. It does **not** automatically compile or upload this Astro app. You use `pnpm` commands for deployment; those scripts use the pinned Cloudflare Wrangler package internally for migrations and upload. There is no separate Wrangler login or `wrangler d1 create` step in this walkthrough.

## 1. Requirements

- [Node.js](https://nodejs.org/en/download) **22.18 or newer**; Node 24 LTS recommended.
- [Git](https://git-scm.com/downloads).
- A [Stripe account](https://dashboard.stripe.com/register) with access to [Stripe Projects](https://docs.stripe.com/projects), plus browser access for authentication.
- The [Stripe CLI](https://docs.stripe.com/cli/install). This repository installs version **1.50.10** locally, so every command uses `pnpm exec stripe` rather than an older global installation.
- A Cloudflare account to host the resulting resources. You can [create one yourself](https://dash.cloudflare.com/sign-up) and link it, or use the account-creation flow offered by Projects. Cloudflare describes both [new account provisioning and existing account linking](https://blog.cloudflare.com/agents-stripe-projects/). Existing account linking is distinct from importing an existing D1 database: this guide provisions a new database.

You do not need a domain; a `workers.dev` address is enough. Provider access, terms, account verification, and current quotas still apply. The guide selects the catalog's **Workers Free** plan. Review any displayed price before confirming; do not select a paid upgrade to work around an error.

## 2. Clone and install

```bash
npm install --global pnpm@10.30.2
git clone https://github.com/reachjalil/hello-projects.git
cd hello-projects
pnpm install --frozen-lockfile
pnpm exec stripe version
pnpm exec stripe plugin install projects
pnpm exec stripe projects --version
```

The Projects plugin installer succeeded with Stripe CLI 1.50.10 and Projects 0.38.0 when this guide was prepared on September 9, 2026. The plugin is installed outside the repository and can evolve independently of the lockfile.

## 3. Try it locally first

```bash
pnpm db:local
pnpm dev
```

Open **http://127.0.0.1:4330**. The page identifies itself as a local preview. Save a hello, then click **Reload & check**. The identifier and timestamp should remain. This is local D1 emulation persisted under `.wrangler/`, separate from your eventual production database.

In a second terminal in this folder:

```bash
pnpm verify
pnpm check
pnpm test
pnpm deploy:check
```

`verify` performs a real insert, checks the same row across fresh requests, checks visitor separation, and rejects a cross-origin write. `deploy:check` builds and validates the Worker upload without publishing it. Astro 7 may run the development server as a daemon; stop it with:

```bash
pnpm exec astro dev stop
```

## 4. Authenticate and initialize Stripe Projects

```bash
pnpm exec stripe projects init hello-projects --mode manual --yes --skip-skills
```

Complete the browser authentication and account selection when prompted. `manual` preserves this app; `--yes` allows initializing a nonempty directory; `--skip-skills` avoids generating additional agent configuration. Review any authentication or provider terms prompts yourself.

```bash
pnpm exec stripe projects status
pnpm exec stripe projects catalog cloudflare
```

Do not proceed until `status` identifies the intended project and account. Authentication alone does not create the project. If initialization already succeeded, use `status` instead of initializing a second project.

**Already use Cloudflare?** Link the desired account now:

```bash
pnpm exec stripe projects link cloudflare
```

Complete the browser OAuth flow. If you want Projects to create your Cloudflare account instead, follow the provider onboarding offered when adding the first Cloudflare service. Do not create a second account accidentally.

## 5. Provision the free plan, Workers service, and D1

The live catalog checked for this guide exposes `workers:free`, `workers`, and `d1`; the D1 configuration requires a database `name`.

```bash
pnpm exec stripe projects add cloudflare/workers:free
pnpm exec stripe projects add cloudflare/workers --name site
pnpm exec stripe projects add cloudflare/d1 --name database --config '{"name":"hello-projects"}'
pnpm exec stripe projects status
pnpm exec stripe projects env --pull
```

Answer the provider prompts and confirm the free plan. If a command is interrupted, check `status` before retrying to avoid duplicate resources. Catalog names and onboarding can change: use `pnpm exec stripe projects catalog cloudflare` and `pnpm exec stripe projects add --help` to inspect the current contract.

Projects writes the active environment to its configured output file. For the default setup this is `.env`; check the path printed by `env --pull`. Keep that file private. This starter ignores `.env*` (except the blank example), `.projects/`, and generated deployment configuration.

## 6. Connect the provisioned resources to Astro

```bash
cp .env.example .env.deploy
```

Open `.env.deploy` in your editor and copy the following values from your **local** Projects environment output or the linked Cloudflare dashboard. Service aliases can prefix the generated variable names; the file below defines the explicit names our scripts consume. Do not paste credentials into a chat or a GitHub issue.

| Setting | Value |
| --- | --- |
| `CLOUDFLARE_ACCOUNT_ID` | The 32-character account ID for the linked/provisioned Cloudflare account |
| `CLOUDFLARE_D1_DATABASE_ID` | UUID of the **new** D1 database |
| `CLOUDFLARE_D1_DATABASE_NAME` | `hello-projects`, unless you chose another database name |
| `WORKER_NAME` | A unique Worker name in your account, e.g. `hello-projects`; choose a new name to avoid replacing another app |
| `CLOUDFLARE_API_TOKEN` | Projects-issued token if one token authorizes both services |
| `CLOUDFLARE_WORKERS_API_TOKEN` | Workers service token, if credentials are separate |
| `CLOUDFLARE_D1_API_TOKEN` | D1 service token, if credentials are separate |
| `PUBLIC_SITE_URL` | Leave blank initially; set the printed HTTPS origin after the first deploy |

A service-specific token takes precedence over the common token. Workers upload requires permissions to deploy Workers/assets and bind D1; migration requires D1 write access. If Projects does not return the necessary credentials or metadata, stop and inspect its provider guidance rather than inventing a token or claiming provisioning succeeded. The exact issued key names could not yet be verified end to end for this starter.

```bash
pnpm configure
```

This validates your account/database IDs and writes ignored `wrangler.local.json`. Tokens stay outside that file and outside the deployed Worker. The runtime uses the native `DB` binding. All-zero database IDs are for local use only and are rejected by remote scripts.

## 7. Migrate and deploy

```bash
pnpm db:remote
pnpm deploy
```

Read the migration confirmation and the account/resource targets before accepting. The migration creates the table, indexes, rate-limit triggers, and retention trigger. It does not copy your local hello records. Deployment prints a URL such as `https://hello-projects.YOUR-SUBDOMAIN.workers.dev`.

Set `PUBLIC_SITE_URL` in `.env.deploy` to that exact origin, **without a trailing slash**, then rebuild/deploy so page metadata uses the public address:

```bash
pnpm deploy
pnpm verify https://hello-projects.YOUR-SUBDOMAIN.workers.dev
```

Replace the example URL with the real output. If Cloudflare requires registering a Workers subdomain, complete that account setup in its dashboard, then rerun deploy. A successful build alone does not prove the database is connected: `verify` must pass against the public URL.

Open the site. You should see **Your site is live. Your database remembers.** Save a hello, note its identifier, and reload. It should still be there. Closing and reopening in the same browser also works while the cookie remains. Incognito is a different visitor.

## Ask a coding agent to do it

After cloning/installing, with the [Codex CLI](https://developers.openai.com/codex/cli/) installed, run this interactive command from the repository:

```bash
codex "Read DEPLOY_WITH_AGENT.md and README.md. Set up and deploy this hello-projects app through Stripe Projects. Use the free Cloudflare plan, preserve existing resources, and verify an actual database write across reloads. Ask me to complete browser authentication when needed."
```

For another coding agent, paste that same prompt. Optionally install Stripe's published Projects skill before starting your agent:

```bash
npx skills add https://docs.stripe.com --skill stripe-projects -g -y
```

The agent can run commands and edit local configuration, but account login, account choice, and provider authorization may still require you. No agent can legitimately skip an account identity failure.

## Troubleshooting

- **`NO_PROJECT_CONFIG`:** Login succeeded but this folder is not initialized. Complete step 4 in this directory; check `status` before linking/provisioning.
- **`PROJECTS_ACCOUNT_IDENTITY_UNCONFIRMED`:** Projects cannot verify the account behind stored credentials. Follow the CLI's connectivity guidance; do not repeatedly log in, overwrite credential storage, or force another account. This blocked the initial remote attempt for this repo even though catalog access worked.
- **`PROJECTS_SESSION_UNUSABLE`:** The Projects preflight cannot read a usable live-mode session. Follow its interactive, account-owner authentication instructions. Do not share keys. If an identity/connectivity error is also present, resolve that first.
- **Old CLI/plugin installation errors:** Use this repo's `pnpm exec stripe`, not an older global binary. Reinstall the plugin with step 2.
- **Database not ready / 503 health:** Run the appropriate local or remote migration; confirm the `DB` binding points to the migrated database.
- **Cloudflare 403:** Check account ID and that the service-issued token covers the requested operation. Do not solve it by putting a token in client code.
- **Rate-limit message:** Wait a minute. The demo allows 5 writes per visitor per minute and 60 shared writes per minute.
- **Record disappears:** Only the newest 1,000 records globally are retained; only your latest five appear. Clearing the browser cookie, using another browser, or the seven-day cookie expiry gives you a new visitor identity.
- **Local and production differ:** They are separate databases. A missing `.env.deploy` does not affect local development.

## Small on purpose

- One server-rendered Astro page; HTML form and redirect, no frontend framework.
- One insert route and one database health route.
- Random browser cookie, hashed visitor identifier in D1, record UUID, and UTC timestamp. No free-text submission or account/password collection.
- Prepared SQL, same-origin write checks, HTTP-only same-site cookie, no-store responses, and a bounded database.
- This public demo's limits are not a production abuse defense: a visitor can reset their cookie, and a shared limit can be exhausted. Add stronger controls before adapting it into a real service.

```text
src/pages/index.astro       Page + database read
src/pages/api/hello.ts      Insert + redirect
src/pages/api/health.ts     Database readiness
src/worker.ts               Astro handler + response headers
migrations/0001_hello.sql   Schema, write limits, retention
scripts/cloud.mjs          Configuration, migration, deployment
scripts/verify.mjs         HTTP persistence proof
```

## Updating and cleanup

For a code update, run `pnpm check`, `pnpm test`, and `pnpm deploy`. Apply new migrations with `pnpm db:remote` first when required. This initial demo has one repeatable migration; future schema changes should use new numbered files.

To retire your demo, inspect resource names first:

```bash
pnpm exec stripe projects status
pnpm exec stripe projects remove --help
```

Use `pnpm exec stripe projects remove RESOURCE_REFERENCE` for only the resources created for this demo, using references from status and reviewing each confirmation. Database removal is destructive. Remove the uploaded Worker in Cloudflare if it remains after service removal; do not remove a shared account/plan or someone else's app. Deleting the GitHub repo does not delete cloud resources.

## Contributing and license

MIT — see [LICENSE](LICENSE). Issues and small, reproducible improvements are welcome. Never include `.env`, provider output containing secrets, credentials, or private account details in an issue/PR. CI checks formatting, types, database behavior, and the upload dry run without cloud credentials.

Original community example; not an official Stripe, Cloudflare, or Astro product. Provider names describe the technologies used.
