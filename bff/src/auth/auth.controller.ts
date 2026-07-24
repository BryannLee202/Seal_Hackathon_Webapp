import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, clearAuthCookies, setAuthCookies } from "../common/cookies";
import { AuthService } from "./auth.service";

@Controller("api/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(@Body() body: unknown) {
    return this.authService.register(body);
  }

  @Post("login")
  async login(@Body() body: unknown, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(body);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    const { accessToken, refreshToken, ...publicResult } = result;
    return publicResult;
  }

  @Post("refresh")
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
    const result = await this.authService.refresh(refreshToken);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    const { accessToken, refreshToken: rt, ...publicResult } = result;
    return publicResult;
  }

  @Post("logout")
  async logout(@Res({ passthrough: true }) res: Response) {
    clearAuthCookies(res);
    return { success: true };
  }

  @Get("me")
  async me(@Req() req: Request) {
    const accessToken = req.cookies?.[ACCESS_TOKEN_COOKIE];
    return this.authService.me(accessToken);
  }
}
