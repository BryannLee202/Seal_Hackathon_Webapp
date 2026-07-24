import { Controller, Get, Param, Req } from "@nestjs/common";
import { Request } from "express";
import { ACCESS_TOKEN_COOKIE } from "../common/cookies";
import { ProxyService } from "./proxy.service";

/**
 * Aggregation endpoints: combine multiple Spring Boot calls into a single
 * response so the React dashboard screens don't need several round trips.
 */
@Controller("api/bff")
export class DashboardController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get("events/:eventId/overview")
  async eventOverview(@Param("eventId") eventId: string, @Req() req: Request) {
    const accessToken = req.cookies?.[ACCESS_TOKEN_COOKIE];

    const [event, tracks, rounds] = await Promise.all([
      this.proxyService.forward("get", `/api/events/${eventId}`, accessToken),
      this.proxyService.forward("get", `/api/events/${eventId}/tracks`, accessToken),
      this.proxyService.forward("get", `/api/events/${eventId}/rounds`, accessToken),
    ]);

    return {
      event: event.data,
      tracks: tracks.data,
      rounds: rounds.data,
    };
  }

  @Get("rounds/:roundId/judging-summary")
  async roundJudgingSummary(@Param("roundId") roundId: string, @Req() req: Request) {
    const accessToken = req.cookies?.[ACCESS_TOKEN_COOKIE];

    const [round, criteria, submissions, rankings] = await Promise.all([
      this.proxyService.forward("get", `/api/rounds/${roundId}`, accessToken),
      this.proxyService.forward("get", `/api/rounds/${roundId}/criteria`, accessToken),
      this.proxyService.forward("get", `/api/rounds/${roundId}/submissions`, accessToken),
      this.proxyService.forward("get", `/api/rounds/${roundId}/rankings`, accessToken),
    ]);

    return {
      round: round.data,
      criteria: criteria.data,
      submissions: submissions.data,
      rankings: rankings.data,
    };
  }
}
