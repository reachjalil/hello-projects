# hello, projects 👋

**From a Stripe login to a website with a database.**

A tiny Astro demo of [Stripe Projects](https://docs.stripe.com/projects): save a hello, reload the page, and see your database remember it.

> **Stripe Projects lets you set up cloud services from your terminal or coding agent.** Connect an existing provider account—or create one—provision services, and sync credentials into your app. You handle login and authorization; Projects handles the account and service setup.

## What does Projects make possible?

| You want to… | Stripe Projects lets you… |
| --- | --- |
| Start without a Cloudflare account | Create one through the provider connection flow |
| Use your existing account | Link it with browser authorization |
| Add hosting and a database | Provision Cloudflare Workers and D1 from the CLI |
| Connect your app | Sync credentials to `.env`, without copying API keys |
| Let an agent help | Use the same commands through your coding agent |

[Cloudflare explains how account creation and linking work →](https://blog.cloudflare.com/agents-stripe-projects/)

## Try the flow

You’ll need [Node.js 24](https://nodejs.org/en/download), Git, pnpm, and a Stripe account with Projects access. A Cloudflare account can be created during setup.

### 1 · Get the demo

```bash
npm install --global pnpm@10.30.2
git clone https://github.com/reachjalil/hello-projects.git
cd hello-projects
pnpm install
pnpm exec stripe plugin install projects
```

The repo includes the [Stripe CLI](https://docs.stripe.com/cli/install). `pnpm exec stripe` runs that version.

### 2 · Connect to Cloudflare

```bash
pnpm exec stripe projects init hello-projects --mode manual --yes --skip-skills
pnpm exec stripe projects link cloudflare
```

Follow the login prompts. Link your existing Cloudflare account, or complete the flow to create one.

### 3 · Add hosting and a database

```bash
pnpm exec stripe projects add cloudflare/workers:free
pnpm exec stripe projects add cloudflare/workers --name site
pnpm exec stripe projects add cloudflare/d1 --name database --config '{"name":"hello-projects"}'
pnpm exec stripe projects env --pull
```

Projects provisions the services and downloads their connection settings. This demo selects the Workers Free plan.

### 4 · Deploy and say hello

```bash
pnpm configure
pnpm db:remote
pnpm deploy
```

These repo scripts read the settings, create the database table, and upload the Astro app using Cloudflare’s deployment tooling. Open the printed URL, **save a hello**, then **reload**.

> **The proof:** your hello survives a reload because it lives in D1. Projects sets up the cloud services; the app uses them.

**Prefer an agent?** With the Codex CLI installed, run:

```bash
codex "Read DEPLOY_WITH_AGENT.md. Deploy this demo with Stripe Projects and Cloudflare's free plan, then verify that a saved hello survives a reload."
```

[Full walkthrough](docs/WALKTHROUGH.md) · [Troubleshooting](docs/SETUP_NOTES.md) · [Stripe Projects docs](https://docs.stripe.com/projects)

*Local checks pass. Live deployment and the exact provider credential mapping are awaiting verification while a Projects CLI issue is resolved.*

[MIT licensed](LICENSE) · Independent community demo.
