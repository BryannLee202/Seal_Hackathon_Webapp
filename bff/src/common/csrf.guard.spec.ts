import { ExecutionContext, ForbiddenException } from "@nestjs/common";
import { CsrfGuard } from "./csrf.guard";

function contextFor(method: string, cookies: Record<string, string>, headers: Record<string, string> = {}) {
  const req = {
    method,
    cookies,
    header: (name: string) => headers[name.toLowerCase()],
  };
  return {
    switchToHttp: () => ({
      getRequest: () => req,
    }),
  } as unknown as ExecutionContext;
}

describe("CsrfGuard", () => {
  const guard = new CsrfGuard();

  it("allows safe methods (GET/HEAD/OPTIONS) through unconditionally", () => {
    expect(guard.canActivate(contextFor("GET", {}))).toBe(true);
    expect(guard.canActivate(contextFor("HEAD", {}))).toBe(true);
    expect(guard.canActivate(contextFor("OPTIONS", {}))).toBe(true);
  });

  it("allows a state-changing request with no session cookie (anonymous: login/register/vote)", () => {
    expect(guard.canActivate(contextFor("POST", {}))).toBe(true);
  });

  it("allows a state-changing request when the CSRF cookie and header match", () => {
    const ctx = contextFor(
      "POST",
      { shms_at: "session-token", "XSRF-TOKEN": "csrf-abc" },
      { "x-xsrf-token": "csrf-abc" },
    );
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it("rejects a state-changing request with a session cookie but missing CSRF header", () => {
    const ctx = contextFor("POST", { shms_at: "session-token", "XSRF-TOKEN": "csrf-abc" });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it("rejects a state-changing request when the CSRF header doesn't match the cookie", () => {
    const ctx = contextFor(
      "POST",
      { shms_at: "session-token", "XSRF-TOKEN": "csrf-abc" },
      { "x-xsrf-token": "wrong-token" },
    );
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it("checks the refresh-token cookie too, not just the access-token cookie", () => {
    const ctx = contextFor("POST", { shms_rt: "refresh-session" });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});
