import { Response } from "express";

export const ACCESS_TOKEN_COOKIE = "shms_at";
export const REFRESH_TOKEN_COOKIE = "shms_rt";

const isProd = process.env.NODE_ENV === "production";

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  const commonOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
  };
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, { ...commonOptions, maxAge: 60 * 60 * 1000 });
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, { ...commonOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_TOKEN_COOKIE, { path: "/" });
  res.clearCookie(REFRESH_TOKEN_COOKIE, { path: "/" });
}
