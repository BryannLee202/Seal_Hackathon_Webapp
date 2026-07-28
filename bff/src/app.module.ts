import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AuthController } from "./auth/auth.controller";
import { AuthService } from "./auth/auth.service";
import { DashboardController } from "./proxy/dashboard.controller";
import { ProxyController } from "./proxy/proxy.controller";
import { ProxyService } from "./proxy/proxy.service";
import { VotingController } from "./voting/voting.controller";
import { HealthController } from "./health/health.controller";
import { CsrfGuard } from "./common/csrf.guard";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule.register({ timeout: 15000 }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 30 }]),
  ],
  controllers: [AuthController, DashboardController, VotingController, HealthController, ProxyController],
  providers: [
    AuthService,
    ProxyService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: CsrfGuard },
  ],
})
export class AppModule {}
