"use client";

// Client-side fetch wrapper for authenticated admin APIs.
//
// When the backend rejects the session token — e.g. it was invalidated because
// the user logged in again from another tab/browser — our API routes forward a
// 401/403. In that case we clear the now-stale cookie and send the user back to
// the login page instead of surfacing raw error messages inside the console.
//
// Auth flows (login, logout, change-password) intentionally do NOT use this
// wrapper: they return 401 for legitimate reasons (bad credentials, wrong
// current password) where a redirect would be wrong.

const SIGN_IN_PATH = "/auth/sign-in";

// Guard so concurrent in-flight requests failing together only trigger a single
// logout + redirect.
let sessionExpiredHandled = false;

export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const response = await fetch(input, init);

  if (response.status === 401 || response.status === 403) {
    await handleSessionExpired();
  }

  return response;
}

async function handleSessionExpired(): Promise<void> {
  if (sessionExpiredHandled) return;
  sessionExpiredHandled = true;

  try {
    // Clear the (now invalid) httpOnly session cookie so the middleware does not
    // bounce us straight back into the console after we redirect to sign-in.
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    // best-effort: redirect regardless
  }

  // Full navigation (not router.push) so the middleware re-runs with the cleared
  // cookie and the React tree is fully reset.
  window.location.assign(SIGN_IN_PATH);
}
