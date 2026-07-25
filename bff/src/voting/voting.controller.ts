import { Body, Controller, Param, Post, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { ProxyService } from "../proxy/proxy.service";

export const VOTER_TOKEN_COOKIE = "shms_voter";
const isProd = process.env.NODE_ENV === "production";

/**
 * The one /api/public/voting/** route that needs special handling. Casting a vote
 * returns a signed anonymous-voter token that must become a first-party, httpOnly
 * cookie on the BFF's own domain (mirrors setAuthCookies in auth.controller.ts).
 * The generic ProxyController can't do this: it only relays result.data, never
 * response headers, so a Set-Cookie from Spring Boot would never reach the browser.
 * All other /api/public/voting/** routes are plain GETs with no cookie involvement
 * and go through the generic ProxyController unmodified.
 */
@Controller("api/public/voting/tracks/:trackId/votes")
export class VotingController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post()
  async castVote(
    @Param("trackId") trackId: string,
    @Body() body: unknown,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const voterToken = req.cookies?.[VOTER_TOKEN_COOKIE];
    const clientIp = String(req.headers["x-forwarded-for"] ?? req.ip ?? "").split(",")[0].trim();

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (voterToken) headers["X-Voter-Token"] = voterToken;
    if (clientIp) headers["X-Client-Ip"] = clientIp;

    const result = await this.proxyService.forwardWithHeaders(
      "post",
      `/api/public/voting/tracks/${trackId}/votes`,
      headers,
      body,
    );

    const { voterToken: newToken, ...publicResult } = result.data as Record<string, unknown>;
    if (typeof newToken === "string") {
      res.cookie(VOTER_TOKEN_COOKIE, newToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: (isProd ? "none" : "lax") as "none" | "lax",
        path: "/",
        maxAge: 180 * 24 * 60 * 60 * 1000,
      });
    }
    return publicResult;
  }
}
