# Hello, Projects — presenter script

A 5–7 minute walkthrough, plus time for browser authorization and provisioning. Assumes Node is installed and you’re already logged in to Stripe.

## Before the presentation

Have Git and pnpm ready. If pnpm is missing, run `npm install --global pnpm@10.30.2`.

For a fresh demo checkout:

```bash
git clone https://github.com/reachjalil/hello-projects.git
cd hello-projects
pnpm install --frozen-lockfile
stripe plugin install projects
```

If you already have the repo, use that folder. Run `stripe projects status` before the presentation: if resources already exist, show them and skip their creation commands. Don’t delete resources or repeatedly provision them for a rehearsal.

**Rehearsal note:** this repo’s live provisioning and credential mapping are still awaiting verification because of a Projects CLI issue. Rehearse the remote sequence before presenting it as a working live demo. Keep `.env` and account/payment details off the shared screen.

## 1 · Introduce the idea

**Show:** the repository’s README.

**Say:**

> “I’m starting with a tiny Astro app and a Stripe login. I’m going to use Stripe Projects to set up Cloudflare hosting and a database, then prove they work by saving a hello.”

## 2 · Create the project and connect Cloudflare

**Run** the init command only if this folder is not already initialized:

```bash
stripe projects init hello-projects --mode manual --yes
stripe projects link cloudflare
stripe projects status
```

Complete any required browser authorization.

**Say:**

> “Here’s the interesting part: I don’t need to arrive with a Cloudflare account. Projects can create one, or connect an account I already have. This status view shows what is connected.”

If you already have Cloudflare, say **“Today I’m showing the existing-account path.”** Only describe account creation as something you demonstrated if the output actually confirms it.

## 3 · Add hosting and a database

**Run** each command once, skipping resources already shown in status:

```bash
stripe projects add cloudflare/workers:free
stripe projects add cloudflare/workers --name site
stripe projects add cloudflare/d1 --name database --config '{"name":"hello-projects"}'
stripe projects status
```

**Say:**

> “These commands select the free plan and provision Workers and D1. These are real cloud services. Projects can also arrange billing for paid services through a payment method added with Stripe; today we’re staying on the free plan.”

## 4 · Connect the app

**Run:**

```bash
stripe projects env --pull
pnpm configure
```

**Say:**

> “Projects fetches the credentials for me. This demo reads them and connects the database. I haven’t copied API keys between dashboards.”

Show the command result, not the contents of `.env`. If configuration stops on an unsupported key shape, resolve it before continuing; don’t narrate it as successful.

## 5 · Deploy

**Run:**

```bash
pnpm db:remote
pnpm deploy
```

**Say while it runs:**

> “Now I’m creating the database table and uploading the app. Projects handled the account, services, and credentials. These repo scripts use Cloudflare’s tooling to deploy the code.”

Open the URL printed by deployment.

## 6 · The payoff

**Do:** click **Save a hello**, point at its ID, then click **Reload & check**.

**Say:**

> “Watch this record. I’ll reload—and there it is again. The page made a new request and read the same record from D1. Our website and database are working together.”

Optional terminal proof, replacing the URL with the real one:

```bash
pnpm verify https://YOUR-SITE.workers.dev
```

**Close:**

> “That’s what this example is here to show: a Stripe login can be the starting point for setting up a provider account, provisioning services, and getting the credentials your app needs. You can run the commands yourself or have a coding agent run the same flow.”

## Optional 20-second encore

```bash
stripe projects catalog
stripe projects search database
```

**Say:**

> “Cloudflare is one example. The catalog shows other providers and services you can explore through the same CLI.”

## After the demo

Set the page’s public URL as described in [README step 8](../README.md#8-set-your-public-url). This metadata step can stay outside the live presentation.

If cloud provisioning is blocked, you can still show the local app:

```bash
pnpm db:local
pnpm dev
```

Open http://127.0.0.1:4330 and say: **“This is the local version of the database interaction; the cloud setup is not complete yet.”**
