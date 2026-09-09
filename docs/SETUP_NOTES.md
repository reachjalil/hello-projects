# Setup notes and troubleshooting

Start with the [full walkthrough](WALKTHROUGH.md). This page has the extra details for troubleshooting, deployment settings, and maintaining your copy.

## What has been checked?

The app passes local persistence checks, type checking, database tests, and the Cloudflare upload dry run. [GitHub CI](https://github.com/reachjalil/hello-projects/actions) runs the same code checks. Remote provisioning and deployment have not yet been verified for this repository because of a Stripe Projects CLI account-identity issue.

The Projects plugin installer worked with Stripe CLI **1.50.10** and Projects **0.38.0** on September 9, 2026. The README installs the pinned CLI globally for short `stripe projects` commands. The repo also includes that version, available through `pnpm exec stripe`. The plugin is installed separately and can change. The Cloudflare catalog exposed `workers:free`, `workers`, and `d1`, with a required D1 database `name`.

```bash
pnpm exec stripe version
pnpm exec stripe projects --version
pnpm exec stripe projects catalog cloudflare
pnpm exec stripe projects add --help
```

## Account setup

Use your regular Stripe account for this walkthrough and complete any Projects onboarding it requests. Provider accounts, hosting, and databases are real resources, including those on free plans.

Stripe test mode and Stripe sandbox accounts are distinct. The installed Projects 0.38.0 CLI explicitly rejects test mode, but its error guidance mentions sandbox accounts as an alternative. We have not verified provider provisioning from a sandbox account, so this guide does not claim a universal sandbox restriction. Follow Projects’ account eligibility checks rather than assuming a sandbox or an ordinary payment test key can run this deployment.

Cloudflare describes [creating an account through Projects or linking an existing account](https://blog.cloudflare.com/agents-stripe-projects/). The README uses `projects link cloudflare` for either path. An existing account for your Stripe email uses OAuth; otherwise Cloudflare can create one through the provider flow, with any required terms/account prompts.

Linking an account does not import an existing D1 database. This example creates a new database. Provider access, terms, verification, and quotas still apply. The guide selects Workers Free; review any displayed price before confirming.

The initialization flags keep your existing Astro app: `--mode manual` avoids a generated starter, `--yes` allows the nonempty directory. If initialization already succeeded, check `projects status` instead of initializing again. Check status after an interrupted provisioning command before retrying, to avoid duplicates.

## Billing is part of Projects too

For paid services, add a payment method through Stripe Projects. Stripe supplies a payment token to the provider, which can charge for the service without receiving your underlying card details. You still choose the plan and complete any required prompts. This demo selects Workers Free and does not require a paid upgrade. See [Stripe’s billing explanation](https://docs.stripe.com/projects#upgrade-a-service-tier).

## Deployment settings

Projects writes credentials to the active environment's configured output file, usually `.env`. Check the path printed by `projects env --pull`. The scripts read that file directly. Use `PROJECTS_ENV_FILE` if it is not `.env`. The resolver accepts the canonical keys below and resource-prefixed versions of them, plus `D1_DATABASE_ID`, `D1_DATABASE_NAME`, `WORKERS_API_TOKEN`, and `D1_API_TOKEN` suffixes. Conflicting values are rejected. Exact issued variable names are still awaiting remote verification for this starter.

Normally there is no `.env.deploy` to edit. For an unusual output shape, an agent can update the resolver after inspecting key names only, or you can use `.env.deploy` as an explicit advanced override. Environment variables take precedence over local files. Never print or commit credentials.

| Setting | Value |
| --- | --- |
| `CLOUDFLARE_ACCOUNT_ID` | The 32-character account ID for the linked/provisioned Cloudflare account |
| `CLOUDFLARE_D1_DATABASE_ID` | UUID of the **new** D1 database |
| `CLOUDFLARE_D1_DATABASE_NAME` | `hello-projects`, unless you chose another database name |
| `WORKER_NAME` | Optional override; defaults to `hello-projects-` plus the first eight characters of the database ID |
| `CLOUDFLARE_API_TOKEN` | Projects-issued token if one token authorizes both services |
| `CLOUDFLARE_WORKERS_API_TOKEN` | Workers service token, if credentials are separate |
| `CLOUDFLARE_D1_API_TOKEN` | D1 service token, if credentials are separate |
| `PUBLIC_SITE_URL` | Optional initially; set the printed HTTPS origin as a Projects variable after deployment |

A service-specific token takes precedence over the common token. Workers upload requires permissions to deploy Workers/assets and bind D1; migration requires D1 write access. If Projects does not return the necessary credentials or metadata, stop and inspect its provider guidance rather than inventing a token or claiming provisioning succeeded. The exact issued key names could not yet be verified end to end for this starter.

```bash
pnpm configure
```

This validates your account/database IDs and writes ignored `wrangler.local.json`. Tokens stay outside that file and outside the deployed Worker. The runtime uses the native `DB` binding. All-zero database IDs are for local use only and are rejected by remote scripts.

## Local development and checks

Local D1 is persisted under `.wrangler/` and is separate from production. Deploying does not copy local records.

With `pnpm dev` running, use another terminal in this folder:

```bash
pnpm verify
pnpm check
pnpm test
pnpm lint
pnpm deploy:check
```

`verify` inserts a hello, checks it across fresh requests, checks visitor separation, and rejects a cross-origin write. `deploy:check` builds and validates the upload without publishing it. Astro 7 may run the development server as a daemon; stop it with:

```bash
pnpm exec astro dev stop
```

## Included agent skill

Stripe’s official Projects skill is committed at [`.agents/skills/stripe-projects/SKILL.md`](../.agents/skills/stripe-projects/SKILL.md). `skills-lock.json` records its source and content digest. Agents that discover repository skills can load it from a clone.

To refresh it from Stripe’s published source:

```bash
npx skills add https://docs.stripe.com --skill stripe-projects --yes
```

This installs into the repository, not globally. Projects initialization also generates its detailed CLI reference skill. The [agent instructions](../DEPLOY_WITH_AGENT.md) link the workflow together.

## Troubleshooting

- **`NO_PROJECT_CONFIG`:** Login succeeded but this folder is not initialized. Complete the walkthrough’s Stripe Projects step in this directory; check `status` before linking/provisioning.
- **`PROJECTS_ACCOUNT_IDENTITY_UNCONFIRMED`:** Projects cannot verify the account behind stored credentials. Follow the CLI's connectivity guidance; do not repeatedly log in, overwrite credential storage, or force another account. This blocked the initial remote attempt for this repo even though catalog access worked.
- **`PROJECTS_SESSION_UNUSABLE`:** The Projects preflight cannot read a usable live-mode session. Follow its interactive, account-owner authentication instructions. Do not share keys. If an identity/connectivity error is also present, resolve that first.
- **Old CLI/plugin installation errors:** Use this repo's `pnpm exec stripe`, not an older global binary. Reinstall the plugin with the walkthrough’s install command.
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

MIT — see [LICENSE](../LICENSE). Issues and small, reproducible improvements are welcome. Never include `.env`, provider output containing secrets, credentials, or private account details in an issue/PR. CI checks formatting, types, database behavior, and the upload dry run without cloud credentials.

Original community example; not an official Stripe, Cloudflare, or Astro product. Provider names describe the technologies used.
