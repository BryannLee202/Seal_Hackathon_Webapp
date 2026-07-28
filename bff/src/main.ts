import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Needed so req.ip reflects the real visitor IP (from X-Forwarded-For) instead of
  // Render's internal proxy address - required for the voting anti-abuse IP rate cap.
  app.getHttpAdapter().getInstance().set("trust proxy", true);

  app.use(cookieParser());

  // BFF is a pure JSON API (no HTML served), so a CSP is meaningless here - disable it
  // rather than ship a default that breaks nothing today but gives false confidence.
  app.use(helmet({ contentSecurityPolicy: false }));

  // Request bodies are typed `unknown` and forwarded verbatim to Spring Boot, which does its
  // own @Valid validation - not enabling whitelist/forbidNonWhitelisted here since that would
  // require the BFF to duplicate every backend DTO just to avoid stripping fields.
  app.useGlobalPipes(new ValidationPipe({ transform: true, forbidUnknownValues: true }));

  const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? "http://localhost:3000").split(",");
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`SEAL Hackathon BFF listening on http://localhost:${port}`);
}

bootstrap();
