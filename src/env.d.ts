/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />
interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  PUBLIC_SITE_URL: string;
}
declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    ASSETS: Fetcher;
    PUBLIC_SITE_URL: string;
  }
}
