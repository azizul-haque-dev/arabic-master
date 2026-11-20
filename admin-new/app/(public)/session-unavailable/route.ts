import { NextRequest, NextResponse } from "next/server";

function getSafeReturnPath(request: NextRequest): string {
  const candidate = request.nextUrl.searchParams.get("returnTo");
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return "/";
  }

  try {
    const target = new URL(candidate, request.nextUrl);
    if (target.origin !== request.nextUrl.origin) return "/";
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return "/";
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

export function GET(request: NextRequest) {
  const returnTo = escapeHtml(getSafeReturnPath(request));
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex">
    <title>Session temporarily unavailable — Arabic Master</title>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px; background: #f8fafc; color: #0f172a; font: 16px/1.5 system-ui, sans-serif; }
      main { width: min(100%, 34rem); padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; background: #fff; text-align: center; box-shadow: 0 12px 35px rgb(15 23 42 / 8%); }
      h1 { margin: 0 0 12px; font-size: clamp(1.5rem, 5vw, 2rem); line-height: 1.2; }
      p { margin: 0 0 24px; color: #475569; }
      nav { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }
      a { display: inline-flex; min-height: 44px; align-items: center; justify-content: center; padding: 0 18px; border-radius: 8px; color: #0e7a5d; font-weight: 600; }
      a.primary { background: #0e7a5d; color: #fff; text-decoration: none; }
    </style>
  </head>
  <body>
    <main>
      <h1>We couldn&apos;t verify your session</h1>
      <p>The authentication service did not complete verification. This may be temporary; your session cookies have not been removed. Please try again.</p>
      <nav>
        <a class="primary" href="${returnTo}">Try again</a>
        <a href="/login">Sign in</a>
      </nav>
    </main>
  </body>
</html>`;

  return new NextResponse(html, {
    status: 503,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/html; charset=utf-8",
      "Retry-After": "2",
    },
  });
}
