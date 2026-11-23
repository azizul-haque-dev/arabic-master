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
  const safeReturnPath = getSafeReturnPath(request);
  const returnTo = escapeHtml(safeReturnPath);
  const scriptReturnTo = JSON.stringify(safeReturnPath).replace(/</g, "\\u003c");
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
      [hidden] { display: none !important; }
      .spinner { width: 40px; height: 40px; margin: 0 auto 20px; border: 4px solid #d1fae5; border-top-color: #0e7a5d; border-radius: 50%; animation: spin 0.8s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }
      @media (prefers-reduced-motion: reduce) { .spinner { animation-duration: 1.8s; } }
    </style>
  </head>
  <body>
    <main>
      <div id="retrying" role="status" aria-live="polite">
        <span class="spinner" aria-hidden="true"></span>
        <h1>Checking your session</h1>
        <p>Please wait while we retry authentication.</p>
      </div>
      <section id="retry-failed" aria-labelledby="session-error-title" hidden>
        <h1 id="session-error-title">We couldn&apos;t verify your session</h1>
        <p>The authentication service did not complete verification. This may be temporary; your session cookies have not been removed. Please try again.</p>
        <nav>
          <a id="try-again" class="primary" href="${returnTo}">Try again</a>
          <a href="/login">Sign in</a>
        </nav>
      </section>
      <noscript>
        <style>
          #retrying { display: none !important; }
          #retry-failed[hidden] { display: block !important; }
        </style>
      </noscript>
      <script>
        (function() {
          var key = 'session_retry_count';
          var returnTo = ${scriptReturnTo};
          var retrying = document.getElementById('retrying');
          var failed = document.getElementById('retry-failed');
          var retryLink = document.getElementById('try-again');

          function showRetrying() {
            retrying.hidden = false;
            failed.hidden = true;
          }

          function showFailure() {
            retrying.hidden = true;
            failed.hidden = false;
          }

          retryLink.addEventListener('click', function(event) {
            event.preventDefault();
            showRetrying();
            window.location.assign(returnTo);
          });

          var count;
          try {
            count = parseInt(sessionStorage.getItem(key) || '0', 10);
          } catch (error) {
            console.warn('[Auth] Unable to read session retry state:', error);
            showFailure();
            return;
          }

          if (count < 3) {
            try {
              sessionStorage.setItem(key, String(count + 1));
            } catch (error) {
              console.warn('[Auth] Unable to save session retry state:', error);
              showFailure();
              return;
            }
            setTimeout(function() {
              window.location.replace(returnTo);
            }, 2500);
          } else {
            try {
              sessionStorage.removeItem(key);
            } catch (error) {
              console.warn('[Auth] Unable to clear session retry state:', error);
            }
            showFailure();
          }
        })();
      </script>
    </main>
  </body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/html; charset=utf-8",
      "Retry-After": "2",
    },
  });
}
