# Deploy this repository with a coding agent

Read README.md and docs/SETUP_NOTES.md first. Work in this repository and use its pinned CLI tools.

1. Inspect git status and existing local Projects configuration without printing secrets. Preserve other projects and account credentials.
2. Install with `pnpm install --frozen-lockfile`. Run check, test, local migration and local HTTP verification.
3. Inspect `pnpm exec stripe projects status`. If uninitialized, use the README's manual initialization command. Let the owner complete browser authentication. Do not bypass identity guards or repeatedly overwrite a session on a connectivity error.
4. Inspect the live Cloudflare catalog. Link the owner's selected existing Cloudflare account, or follow provider account creation if requested. Review terms and paid changes with the owner.
5. Provision only this demo's free Workers plan/service and new D1 database. Inspect status before retrying any partially completed command. Never use a name that replaces an unrelated Worker.
6. Pull the active environment. Map actual issued credentials and identifiers into ignored `.env.deploy`, without printing secrets or guessing provider output keys. Configure the DB binding.
7. Run remote migrations and deploy. Set the returned public HTTPS origin, redeploy, and run `pnpm verify PUBLIC_URL` to prove an insert persists across reloads.
8. Report the real URL, resource names, checks, and any remaining blocker. Never describe a dry run or local preview as a live deployment. Keep secrets, local account configuration, and generated files out of Git.

The user runs account-owner login/authorization steps; the agent handles implementation, commands, and verification within the requested scope. No additional agents or task messages are necessary.
