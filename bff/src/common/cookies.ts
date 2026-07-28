import { randomBytes, timingSafeEqual } from "crypto";
import { Response } from "express";

export const ACCESS_TOKEN_COOKIE = "shms_at";
export const REFRESH_TOKEN_COOKIE = "shms_rt";
export const CSRF_TOKEN_COOKIE = "XSRF-TOKEN"; // matches axios's default xsrfCookieName
export const CSRF_HEADER = "x-xsrf-token"; // matches axios's default xsrfHeaderName (lowercased)

const isProd = process.env.NODE_ENV === "production";

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  const commonOptions = {
    httpOnly: true,
    secure: isProd,
    // Frontend and BFF live on different onrender.com subdomains in production, which
    // browsers treat as cross-site - SameSite=Lax cookies are dropped on those requests.
    // Locally both run on localhost (different ports only), which is still same-site, so
    // Lax is fine there and doesn't require HTTPS.
    sameSite: (isProd ? "none" : "lax") as "none" | "lax",
    path: "/",
  };
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, { ...commonOptions, maxAge: 60 * 60 * 1000 });
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, { ...commonOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_TOKEN_COOKIE, { path: "/" });
  res.clearCookie(REFRESH_TOKEN_COOKIE, { path: "/" });
}

/**
 * Issues the double-submit CSRF token cookie. Must NOT be httpOnly - the frontend's axios
 * client reads it and echoes it back as a header on state-changing requests (see CsrfGuard).
 * Needed because auth cookies use SameSite=None in prod (frontend/BFF are cross-site
 * onrender.com subdomains), which disables the browser's default CSRF protection.
 */
export function issueCsrfCookie(res: Response) {
  const token = randomBytes(32).toString("hex");
  res.cookie(CSRF_TOKEN_COOKIE, token, {
    httpOnly: false,
    secure: isProd,
    sameSite: (isProd ? "none" : "lax") as "none" | "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function csrfTokensMatch(cookieToken?: string, headerToken?: string) {
  if (!cookieToken || !headerToken) return false;
  const a = Buffer.from(cookieToken);
  const b = Buffer.from(headerToken);
  return a.length === b.length && timingSafeEqual(a, b);
}
