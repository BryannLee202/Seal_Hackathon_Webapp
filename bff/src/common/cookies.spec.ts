import { Response } from "express";
import {
  ACCESS_TOKEN_COOKIE,
  CSRF_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  clearAuthCookies,
  csrfTokensMatch,
  issueCsrfCookie,
  setAuthCookies,
} from "./cookies";

function mockResponse() {
  return {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as Response;
}

// `isProd` inside cookies.ts is captured once at module-load time, so switching branches
// requires a fresh module instance per NODE_ENV value rather than mutating process.env
// around a single shared import.
function loadCookiesModule(nodeEnv: string) {
  let mod!: typeof import("./cookies");
  jest.isolateModules(() => {
    process.env.NODE_ENV = nodeEnv;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    mod = require("./cookies");
  });
  return mod;
}

describe("setAuthCookies", () => {
  afterEach(() => {
    delete process.env.NODE_ENV;
  });

  it("sets access and refresh token cookies with httpOnly and correct maxAge", () => {
    const res = mockResponse();
    setAuthCookies(res, "access-token", "refresh-token");

    expect(res.cookie).toHaveBeenCalledWith(
      ACCESS_TOKEN_COOKIE,
      "access-token",
      expect.objectContaining({ httpOnly: true, maxAge: 60 * 60 * 1000 }),
    );
    expect(res.cookie).toHaveBeenCalledWith(
      REFRESH_TOKEN_COOKIE,
      "refresh-token",
      expect.objectContaining({ httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }),
    );
  });

  it("uses SameSite=Lax and non-secure cookies outside production", () => {
    const devCookies = loadCookiesModule("development");
    const res = mockResponse();
    devCookies.setAuthCookies(res, "a", "r");

    expect(res.cookie).toHaveBeenCalledWith(
      devCookies.ACCESS_TOKEN_COOKIE,
      "a",
      expect.objectContaining({ sameSite: "lax", secure: false }),
    );
  });

  it("uses SameSite=None and secure cookies in production", () => {
    const prodCookies = loadCookiesModule("production");
    const res = mockResponse();
    prodCookies.setAuthCookies(res, "a", "r");

    expect(res.cookie).toHaveBeenCalledWith(
      prodCookies.ACCESS_TOKEN_COOKIE,
      "a",
      expect.objectContaining({ sameSite: "none", secure: true }),
    );
  });
});

describe("clearAuthCookies", () => {
  it("clears both auth cookies with path /", () => {
    const res = mockResponse();
    clearAuthCookies(res);

    expect(res.clearCookie).toHaveBeenCalledWith(ACCESS_TOKEN_COOKIE, { path: "/" });
    expect(res.clearCookie).toHaveBeenCalledWith(REFRESH_TOKEN_COOKIE, { path: "/" });
  });
});

describe("issueCsrfCookie", () => {
  it("sets a non-httpOnly CSRF cookie", () => {
    const res = mockResponse();
    issueCsrfCookie(res);

    expect(res.cookie).toHaveBeenCalledWith(
      CSRF_TOKEN_COOKIE,
      expect.any(String),
      expect.objectContaining({ httpOnly: false }),
    );
  });
});

describe("csrfTokensMatch", () => {
  it("returns true when cookie and header tokens match", () => {
    expect(csrfTokensMatch("abc123", "abc123")).toBe(true);
  });

  it("returns false when tokens differ", () => {
    expect(csrfTokensMatch("abc123", "xyz789")).toBe(false);
  });

  it("returns false when either token is missing", () => {
    expect(csrfTokensMatch(undefined, "abc123")).toBe(false);
    expect(csrfTokensMatch("abc123", undefined)).toBe(false);
  });
});
