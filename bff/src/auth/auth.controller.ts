import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { Request, Response } from "express";
import {
  ACCESS_TOKEN_COOKIE,
  CSRF_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  clearAuthCookies,
  issueCsrfCookie,
  setAuthCookies,
} from "../common/cookies";
import { AuthService } from "./auth.service";

@Controller("api/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post("register")
  async register(@Body() body: unknown) {
    return this.authService.register(body);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post("login")
  async login(@Body() body: unknown, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(body);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    issueCsrfCookie(res);
    const { accessToken, refreshToken, ...publicResult } = result;
    return publicResult;
  }

  @Post("refresh")
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
    const result = await this.authService.refresh(refreshToken);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    issueCsrfCookie(res);
    const { accessToken, refreshToken: rt, ...publicResult } = result;
    return publicResult;
  }

  @Post("logout")
  async logout(@Res({ passthrough: true }) res: Response) {
    clearAuthCookies(res);
    return { success: true };
  }

  @Get("me")
  async me(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const accessToken = req.cookies?.[ACCESS_TOKEN_COOKIE];
    // Backfills the CSRF cookie for sessions that started before this cookie existed.
    if (!req.cookies?.[CSRF_TOKEN_COOKIE]) {
      issueCsrfCookie(res);
    }
    return this.authService.me(accessToken);
  }
}
