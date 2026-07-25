import { Response } from "express";

export const ACCESS_TOKEN_COOKIE = "shms_at";
export const REFRESH_TOKEN_COOKIE = "shms_rt";

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
