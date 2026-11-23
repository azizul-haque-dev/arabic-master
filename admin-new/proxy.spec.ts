import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { NextRequest } from "next/server";
import { GET as sessionUnavailable } from "./app/(public)/session-unavailable/route";
import { proxy } from "./proxy";

const originalFetch = globalThis.fetch;
const expiredAccessToken = "e30.eyJleHAiOjEwMDB9.sig";
const validAccessToken = `e30.${Buffer.from(
  JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }),
).toString("base64url")}.sig`;

function request(pathname: string): NextRequest {
  return new NextRequest(`https://arabic-master.test${pathname}`, {
    headers: {
      cookie: `session_token=${expiredAccessToken}; refresh_token=refresh`,
    },
  });
}

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("proxy session refresh", () => {
  it("does not block a public landing page on token refresh", async () => {
    let refreshCalls = 0;
    globalThis.fetch = async () => {
      refreshCalls += 1;
      return new Response(null, { status: 500 });
    };

    const response = await proxy(request("/"));

    assert.equal(response.status, 200);
    assert.equal(refreshCalls, 0);
  });

  it("shows a retryable response when protected-page refresh is unavailable", async () => {
    globalThis.fetch = async () => new Response(null, { status: 503 });

    const response = await proxy(request("/admin/arabic-entities"));

    assert.equal(response.status, 307);
    assert.match(
      response.headers.get("location") ?? "",
      /\/session-unavailable/,
    );
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(response.headers.get("set-cookie"), null);
  });

  it("returns JSON 503 for protected API requests when refresh is unavailable", async () => {
    globalThis.fetch = async () => new Response(null, { status: 503 });

    const response = await proxy(request("/api/content"));

    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), {
      success: false,
      error: "Unable to verify your session right now. Please try again.",
    });
  });

  it("clears cookies and redirects only when refresh is explicitly rejected", async () => {
    globalThis.fetch = async () => new Response(null, { status: 401 });

    const response = await proxy(request("/admin/arabic-entities"));

    assert.equal(response.status, 307);
    assert.match(response.headers.get("location") ?? "", /\/login/);
    assert.match(response.headers.get("set-cookie") ?? "", /session_token=/);
    assert.match(
      response.headers.get("set-cookie") ?? "",
      /Expires=Thu, 01 Jan 1970 00:00:00 GMT/,
    );
  });

  it("keeps the existing login redirect when refresh succeeds on an auth entry route", async () => {
    const refreshedToken = `e30.${Buffer.from(
      JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }),
    ).toString("base64url")}.sig`;
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          data: { accessToken: refreshedToken, refreshToken: "rotated" },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );

    const loginRequest = new NextRequest("https://arabic-master.test/login", {
      headers: {
        cookie: `session_token=${expiredAccessToken}; refresh_token=refresh; user=${JSON.stringify({ role: "ADMIN" })}`,
      },
    });
    const response = await proxy(loginRequest);

    assert.equal(response.status, 307);
    assert.match(
      response.headers.get("location") ?? "",
      /\/admin\/arabic-entities/,
    );
    assert.match(response.headers.get("set-cookie") ?? "", /session_token=/);
  });

  it("clears and redirects a revoked session on the next protected page request", async () => {
    globalThis.fetch = async () => new Response(null, { status: 401 });
    const protectedRequest = new NextRequest(
      "https://arabic-master.test/profile",
      {
        headers: { cookie: `session_token=${validAccessToken}; refresh_token=refresh` },
      },
    );

    const response = await proxy(protectedRequest);

    assert.equal(response.status, 307);
    assert.match(response.headers.get("location") ?? "", /\/login/);
    assert.match(response.headers.get("set-cookie") ?? "", /session_token=/);
    assert.match(response.headers.get("set-cookie") ?? "", /refresh_token=/);
    assert.match(response.headers.get("set-cookie") ?? "", /user=/);
  });

  it("sends regular users to their profile after login", async () => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ data: { user: { role: "USER" } } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    const loginRequest = new NextRequest("https://arabic-master.test/login", {
      headers: {
        cookie: `session_token=${validAccessToken}; user=${JSON.stringify({ role: "USER" })}`,
      },
    });

    const response = await proxy(loginRequest);

    assert.equal(response.status, 307);
    assert.match(response.headers.get("location") ?? "", /\/profile/);
  });

  it("rejects external retry destinations on the temporary error route", async () => {
    const response = sessionUnavailable(
      new NextRequest(
        "https://arabic-master.test/session-unavailable?returnTo=%2F%2Fevil.example",
      ),
    );
    const html = await response.text();

    assert.equal(response.status, 200);
    assert.match(html, /href="\/">Try again/);
    assert.doesNotMatch(html, /href="\/\/evil\.example"/);
  });

  it("shows loading during retries and retains recovery actions after they fail", async () => {
    const response = sessionUnavailable(
      new NextRequest(
        "https://arabic-master.test/session-unavailable?returnTo=%2Fadmin%2Fwords",
      ),
    );
    const html = await response.text();

    assert.match(html, /id="retrying" role="status" aria-live="polite"/);
    assert.match(html, /id="retry-failed" aria-labelledby="session-error-title" hidden/);
    assert.match(html, /Checking your session/);
    assert.match(html, /We couldn&apos;t verify your session/);
    assert.match(html, /count < 3/);
    assert.match(html, /id="try-again" class="primary" href="\/admin\/words">Try again/);
    assert.match(html, /href="\/login">Sign in/);
  });
});
