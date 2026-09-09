# hello, projects 👋

**Deploy a little website. Save a hello. Reload and see it’s still there.**

This is a small, open-source example of using [Stripe Projects](https://docs.stripe.com/projects) to set up Cloudflare hosting and a database for an Astro app.

Here’s what you’ll build: a page with a **Save a hello** button. Clicking it adds a record to your database. Reloading reads that record back. That’s the whole demo!

> The app works locally and its build checks pass. We’re working through a Stripe Projects CLI issue before verifying the live deployment. You can try the local demo now.

## The three pieces

- **Astro** builds your website.
- **Cloudflare Workers** runs it online, and **D1** is its database.
- **Stripe Projects** connects your account and creates those cloud services.

You’ll use Stripe Projects to create the services, then this repo’s `pnpm` commands to publish the app. The scripts handle Cloudflare’s deployment tooling for you.

## Before you start

You’ll need:

- [Node.js 24 LTS](https://nodejs.org/en/download) and [Git](https://git-scm.com/downloads) installed.
- A [Stripe account](https://dashboard.stripe.com/register) with access to [Projects](https://docs.stripe.com/projects).

**You don’t need a Cloudflare account yet.** Projects can create one for you. If you already have one, you can connect it during setup.

No custom domain needed. Cloudflare gives you a `workers.dev` address. We’ll choose the **Workers Free** plan; check the plan shown before confirming.

## 1. Get the app

Open your terminal and run:

```bash
npm install --global pnpm@10.30.2
git clone https://github.com/reachjalil/hello-projects.git
cd hello-projects
pnpm install --frozen-lockfile
```

This downloads the app and installs its tools, including the [Stripe CLI](https://docs.stripe.com/cli/install). Add the Projects plugin:

```bash
pnpm exec stripe plugin install projects
```

**Why `pnpm exec stripe`?** It uses the Stripe CLI version included with this repo, even if you have another version installed.

## 2. Give it a try on your computer

```bash
pnpm db:local
pnpm dev
```

The first command creates your local database table. The second starts the website.

Open [localhost:4330](http://127.0.0.1:4330), click **Save a hello**, then **Reload & check**. Your hello should still be there. You’ve just saved and read a database record!

Keep the page open. Use a second terminal in the `hello-projects` folder for the next steps.

## 3. Connect Stripe and Cloudflare

Create a Stripe Project for this app:

```bash
pnpm exec stripe projects init hello-projects --mode manual --yes --skip-skills
```

Follow the login and account-selection prompts in your browser. These options keep the app you just downloaded. If you already initialized it, skip that command and check it:

```bash
pnpm exec stripe projects status
```

Once your project appears, connect to Cloudflare:

```bash
pnpm exec stripe projects link cloudflare
```

Already have a Cloudflare account for your Stripe email? Follow the browser authorization to link it. Otherwise, Cloudflare can create an account through this flow. Complete any account and terms prompts—no separate signup is required. [How account creation works](https://blog.cloudflare.com/agents-stripe-projects/).

## 4. Create your hosting and database

Run these commands one at a time:

```bash
pnpm exec stripe projects add cloudflare/workers:free
pnpm exec stripe projects add cloudflare/workers --name site
pnpm exec stripe projects add cloudflare/d1 --name database --config '{"name":"hello-projects"}'
```

These select the free plan, add the Workers service, and create a D1 database called `hello-projects`. Follow any setup prompts.

Now check what was created and download the connection settings:

```bash
pnpm exec stripe projects status
pnpm exec stripe projects env --pull
```

The last command prints the file it saved, usually `.env`. You’ll use those settings next.

## 5. Connect the app automatically

```bash
pnpm configure
```

The script reads the `.env` file Projects wrote, connects the database, and picks a Worker name based on the database ID. You don’t need to copy API keys or fill in a settings table.

If you configured Projects to write a different environment file, point the script at it with `PROJECTS_ENV_FILE=.env.production pnpm configure` (and use the same prefix for migration and deployment).

**Still being verified:** the adapter supports canonical and resource-prefixed Cloudflare keys. We’ll confirm the exact output against a real provisioned project once the CLI issue is resolved. If it encounters missing or ambiguous settings, it stops with an explanation instead of selecting an account or token by guesswork.

## 6. Put it online

```bash
pnpm db:remote
pnpm deploy
```

The first command creates the table in your online database. The second builds and uploads your website. Check the migration’s target before confirming.

When deployment finishes, it prints your website’s address. To set the page’s public address, save it as a Projects variable, replacing the example URL with yours (no trailing `/`):

```bash
pnpm exec stripe projects variables set site-url --env-key PUBLIC_SITE_URL --value https://YOUR-SITE.workers.dev
pnpm exec stripe projects env --pull
```

Then run:

```bash
pnpm deploy
```

This last deploy updates the page’s metadata with its public address.

## 7. Save a hello from the internet 🎉

Open your new URL. Click **Save a hello**, then reload the page.

**Same record? Your website and database are working together.**

For an automatic check, run this with the real URL from deployment:

```bash
pnpm verify https://hello-projects.YOUR-SUBDOMAIN.workers.dev
```

It saves a hello and checks that it survives two reloads. Your online database starts empty; the hellos you saved locally stay on your computer.

## Prefer to let an agent help?

With the [Codex CLI](https://developers.openai.com/codex/cli/) installed, run this from the repo:

```bash
codex "Read README.md and DEPLOY_WITH_AGENT.md. Help me deploy this app using Stripe Projects and Cloudflare's free plan. Run the setup and verify that a saved hello survives a reload. Ask me when browser login is needed."
```

You can paste the same prompt into another coding agent. You’ll still complete account login and browser authorization yourself.

## Need a hand?

See [setup notes and troubleshooting](SETUP_NOTES.md) for CLI errors, connection settings, tests, and removing your cloud resources.

This is a small demo: it shows this browser’s latest five hellos and keeps up to 1,000 records overall. Older records can disappear, and another browser has its own paper trail.

[MIT licensed](../LICENSE). An independent community example using Stripe, Cloudflare, and Astro.
