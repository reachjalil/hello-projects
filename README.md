# hello, projects 👋

**Clone a repo. Connect Cloudflare. Deploy a website with a database.**

> **The magic: you can start without a Cloudflare account.** Stripe Projects can create one for you, set up hosting and a database, and deliver the credentials to your app. If you choose paid services, it can also set up billing using a payment method you add through Stripe. You complete the required authorization and terms prompts; your terminal or coding agent handles the setup.

| As you follow the guide… | What Projects does for you |
| --- | --- |
| Connect Cloudflare | Creates an account if needed, or links your existing one |
| Add Workers and D1 | Provisions real hosting and a database |
| Pull your environment | Syncs credentials without manual API-key copying |
| Choose a paid service | Enables provider billing using your Stripe-supplied payment method |

**This demo uses the free plan.** Billing setup is an additional Projects capability, not a paid upgrade required by this guide. [How Projects billing works →](https://docs.stripe.com/projects#upgrade-a-service-tier)

## Before you start

Install [Node.js 24](https://nodejs.org/en/download) and [Git](https://git-scm.com/downloads). You’ll need a Stripe account with [Projects access](https://docs.stripe.com/projects).

> **Use your regular Stripe account for this walkthrough.** Projects sets up real accounts and services with providers such as Cloudflare. If you don’t already have an account there, it can create one for you. Your website and database are real cloud resources—even on a free plan—not simulated payment-test data.

**No Cloudflare account yet?** Projects can create one. If your Stripe email already has a Cloudflare account, you’ll authorize that account instead. [How this works →](https://blog.cloudflare.com/agents-stripe-projects/)

*The local app is verified. The live flow and exact credential mapping still need verification while a Projects CLI issue is resolved.*

## 1. Clone the repo

```bash
git clone https://github.com/reachjalil/hello-projects.git
cd hello-projects
```

Run the remaining commands from this folder.

## 2. Install the tools

```bash
npm install --global pnpm@10.30.2 @stripe/cli@1.50.10
pnpm install --frozen-lockfile
stripe plugin install projects
```

This installs the app, the [Stripe CLI](https://docs.stripe.com/cli/install), and its Projects plugin.

## 3. Create your Stripe Project

```bash
stripe projects init hello-projects --mode manual --yes
```

Follow the login prompts. The options keep this existing Astro app in place. Already initialized this folder? Skip to the status check below.

## 4. Connect Cloudflare

```bash
stripe projects link cloudflare
stripe projects status
```

Follow the prompts to authorize an existing account or create one. This is where Projects saves you a separate signup flow. Check that `status` shows the project and Cloudflare connection you want.

## 5. Add hosting and a database

Run these one at a time:

```bash
stripe projects add cloudflare/workers:free
stripe projects add cloudflare/workers --name site
stripe projects add cloudflare/d1 --name database --config '{"name":"hello-projects"}'
stripe projects status
```

These select the free plan, add Workers hosting, and create a D1 database. Review the plan before confirming. If a command fails, check `status` before retrying.

## 6. Connect the app

```bash
stripe projects env --pull
pnpm configure
```

Projects retrieves the credentials for you and writes them to `.env`. The demo reads them and connects its database automatically. Keep `.env` private; it’s excluded from Git.

## 7. Deploy

```bash
pnpm db:remote
pnpm deploy
```

The first command creates the online database table. The second builds and uploads the app. These scripts use Cloudflare’s deployment tooling internally.

**Copy the website URL printed by deployment.**

## 8. Set your public URL

Replace the example below with your real URL, without a trailing `/`:

```bash
stripe projects variables set site-url --env-key PUBLIC_SITE_URL --value https://YOUR-SITE.workers.dev
stripe projects env --pull
pnpm deploy
```

This updates the page’s metadata with its public address.

## 9. Try it 🎉

Open your URL. Click **Save a hello**, then **Reload & check**.

> **Your hello is still there?** Your site has written to D1 and read the record back on a new request. That’s the proof.

For an automatic test, use your real URL:

```bash
pnpm verify https://YOUR-SITE.workers.dev
```

It saves a record and checks that it survives two reloads.

## Want an agent to run the steps?

The official [Stripe Projects skill](.agents/skills/stripe-projects/SKILL.md) is included in this repo. With the Codex CLI installed, run:

```bash
codex "Read README.md and DEPLOY_WITH_AGENT.md. Deploy this demo using Stripe Projects and Cloudflare's free plan. Ask me to complete browser authorization, then verify the live database works."
```

## Stretch goal · Add PostHog 🦔

**Next deliverable:** add PostHog through Stripe Projects, capture a `hello_saved` event after a successful database write, and show a “Hellos saved” dashboard. Reloading should not count the same save twice.

```bash
stripe projects catalog posthog
```

[Follow the PostHog stretch-goal brief →](docs/stretch-goals/POSTHOG.md) — includes provisioning commands, an agent prompt, and a definition-of-done checklist. This is an optional planned extension; analytics are not enabled yet.

## A few cool commands to try 🔎

Discover what else you could build:

```bash
stripe projects catalog
stripe projects catalog cloudflare
stripe projects search database
```

See your project as your agent sees it, then read Cloudflare’s provider guidance:

```bash
stripe projects status --json
stripe projects llm-context --provider cloudflare --fetch
```

> **One CLI, more possibilities.** The catalog lets you discover other providers and services before you decide what to add to your app.

## Cheat sheet

Run these from the repo folder. Replace `YOUR-SITE` with your deployed address.

| I want to… | Command |
| --- | --- |
| Check my project and connected services | `stripe projects status` |
| List my Stripe Projects | `stripe projects list` |
| Explore Cloudflare services and plans | `stripe projects catalog cloudflare` |
| Search for a service | `stripe projects search database` |
| Open the linked Cloudflare dashboard, if supported | `stripe projects open cloudflare` |
| List environment variables with values hidden | `stripe projects env` |
| Refresh the app’s local credentials | `stripe projects env --pull` |
| Check Cloudflare charges | `stripe projects spend cloudflare` |
| View payment setup | `stripe projects billing show` |
| Add a payment method for paid services | `stripe projects billing add` |
| Deploy an app update | `pnpm deploy` |
| Test a real database write and reload | `pnpm verify https://YOUR-SITE.workers.dev` |
| Find more commands | `stripe projects --help` |

[Presenter script](docs/PRESENTER_SCRIPT.md) · [Local demo & extra details](docs/WALKTHROUGH.md) · [Troubleshooting](docs/SETUP_NOTES.md) · [Stripe Projects docs](https://docs.stripe.com/projects)

[MIT licensed](LICENSE) · Independent community demo.
