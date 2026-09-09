// Accept canonical keys and resource-prefixed variants without copying secrets.
// Unknown or conflicting output must be resolved explicitly, never guessed.
export function resolveSettings(input) {
  const settings = { ...input };
  const fields = {
    CLOUDFLARE_ACCOUNT_ID: ["CLOUDFLARE_ACCOUNT_ID"],
    CLOUDFLARE_D1_DATABASE_ID: ["CLOUDFLARE_D1_DATABASE_ID", "D1_DATABASE_ID"],
    CLOUDFLARE_D1_DATABASE_NAME: [
      "CLOUDFLARE_D1_DATABASE_NAME",
      "D1_DATABASE_NAME",
    ],
    CLOUDFLARE_API_TOKEN: ["CLOUDFLARE_API_TOKEN"],
    CLOUDFLARE_WORKERS_API_TOKEN: [
      "CLOUDFLARE_WORKERS_API_TOKEN",
      "WORKERS_API_TOKEN",
    ],
    CLOUDFLARE_D1_API_TOKEN: ["CLOUDFLARE_D1_API_TOKEN", "D1_API_TOKEN"],
  };
  for (const [target, suffixes] of Object.entries(fields)) {
    if (settings[target]) continue;
    const matches = Object.entries(input).filter(
      ([key, value]) =>
        value &&
        suffixes.some((suffix) => key === suffix || key.endsWith(`_${suffix}`)),
    );
    const values = [...new Set(matches.map(([, value]) => value))];
    if (values.length > 1)
      throw new Error(
        `Multiple values match ${target}. Select one Projects environment/resource; no credentials were printed or chosen.`,
      );
    if (values.length === 1) settings[target] = values[0];
  }
  // Tie the default name to this database instead of overwriting a generic Worker.
  if (!settings.WORKER_NAME && settings.CLOUDFLARE_D1_DATABASE_ID) {
    settings.WORKER_NAME = `hello-projects-${settings.CLOUDFLARE_D1_DATABASE_ID.slice(0, 8)}`;
  }
  return settings;
}
