# Stretch goal: see your hellos in PostHog

**Deliverable:** extend the deployed demo so a successful database save appears as a `hello_saved` event in PostHog, then show its count in a simple dashboard.

Status: **planned extension**, not implemented or enabled in the app. Complete the main Cloudflare + D1 walkthrough first.

> You’ve proved the database remembers. Now prove you can see people using the app—with another provider added through Stripe Projects.

## 1. Provision through Projects

Check the current catalog, then connect PostHog. This example chooses the US region; change `US` to `EU` before linking if that is your preferred region.

```bash
stripe projects catalog posthog
stripe projects link posthog --config '{"region":"US"}'
stripe projects add posthog/free
stripe projects add posthog/analytics --name analytics
stripe projects status
stripe projects env --pull
```

Follow provider authorization prompts and review the selected plan. Check status before retrying an interrupted add command. The catalog checked on September 9, 2026 exposes the `free` plan, `analytics` service, and required provider region (`US` or `EU`). Linking an account and importing an existing analytics resource are different operations; the current catalog does not advertise existing-resource import.

## 2. Build the tiny integration

Use the official [PostHog documentation](https://posthog.com/docs) and the actual credentials returned by Projects.

| Item | Expected behavior |
| --- | --- |
| Optional configuration | The app still works when PostHog is not configured |
| `hello_saved` event | Sent only after D1 confirms a successful insert |
| Duplicate protection | Reloading the page does not send another save event; use the saved record ID as the deduplication reference |
| Minimal event data | Include an anonymous demo identifier and record ID; no email, raw cookie, or provider credentials |
| Failure handling | An analytics outage does not prevent saving or displaying a hello |
| Dashboard | One “Hellos saved” event-count insight |

Prefer capturing the event from the successful server-side insert path (`src/pages/api/hello.ts`) so a page reload cannot generate it again. Use a Workers-compatible capture method and handle delivery through the request lifecycle. Fetch the SDK/API contract from current official docs before implementation.

Read Projects output directly and extend the deployment settings for the actual key names and regional ingest host. Use Cloudflare secret bindings for any server-only credentials. Do not commit `.env`, print secrets, or bundle personal/admin API keys into the browser. Keep session replay and automatic interaction capture outside this small deliverable. Update the demo’s data-use text to explain the optional event collection.

## 3. Prove it works

- [ ] Provision PostHog through Stripe Projects on the free plan.
- [ ] Deploy the optional integration using the returned configuration.
- [ ] Save one hello and confirm the row exists in D1.
- [ ] Find its `hello_saved` event in PostHog.
- [ ] Reload twice and confirm that the same save has not been counted again.
- [ ] Show the “Hellos saved” insight in a dashboard.
- [ ] Verify that missing configuration or an analytics failure does not break the demo.
- [ ] Add focused tests for successful saves, failed database writes, and analytics failures.

**Handoff evidence:** deployed URL, commit, dashboard link or screenshot without secrets, and a brief record of the save/reload check.

## Give it to an agent

```bash
codex "Implement docs/stretch-goals/POSTHOG.md. Use the bundled Stripe Projects skill, provision PostHog on the free plan, add optional hello_saved analytics, and verify one database save produces one event across reloads. Keep the core demo working without PostHog. Ask me to complete provider authorization when needed."
```

## What to say in the presentation

> “We added hosting and a database through Projects. The stretch goal is to add analytics the same way: provision PostHog, send an event after a successful save, and see it in a dashboard.”

Only show this as completed once the checklist above passes.
