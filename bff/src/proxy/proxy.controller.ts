import { All, Controller, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { Method } from "axios";
import { ACCESS_TOKEN_COOKIE } from "../common/cookies";
import { ProxyService } from "./proxy.service";

/**
 * Generic pass-through proxy for every /api/** route not handled by a more specific
 * BFF controller (auth, dashboard aggregation). Reads the access token from the
 * httpOnly cookie set at login and forwards it as a Bearer token to Spring Boot -
 * the browser never sees the JWT directly.
 */
@Controller("api")
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @All("*")
  async proxy(@Req() req: Request, @Res() res: Response) {
    const accessToken = req.cookies?.[ACCESS_TOKEN_COOKIE];
    const backendPath = req.originalUrl;
    const result = await this.proxyService.forward(req.method as Method, backendPath, accessToken, req.body);
    res.status(result.status).json(result.data);
  }
}
