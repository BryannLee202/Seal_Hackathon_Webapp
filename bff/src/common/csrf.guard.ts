import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Request } from "express";
import {
  ACCESS_TOKEN_COOKIE,
  CSRF_HEADER,
  CSRF_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  csrfTokensMatch,
} from "./cookies";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Double-submit CSRF check for state-changing requests. Only applies when the caller already
 * carries an auth cookie - anonymous requests (login, register, first-time public voting) have
 * no ambient session privilege for a forged cross-site request to exploit, so they're exempt.
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    if (SAFE_METHODS.has(req.method)) return true;

    const hasSessionCookie = Boolean(req.cookies?.[ACCESS_TOKEN_COOKIE] ?? req.cookies?.[REFRESH_TOKEN_COOKIE]);
    if (!hasSessionCookie) return true;

    const ok = csrfTokensMatch(req.cookies?.[CSRF_TOKEN_COOKIE], req.header(CSRF_HEADER));
    if (!ok) {
      throw new ForbiddenException({ message: "Thiếu hoặc sai CSRF token" });
    }
    return true;
  }
}
