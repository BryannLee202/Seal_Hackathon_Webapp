import { HttpService } from "@nestjs/axios";
import { HttpException, Injectable, Logger } from "@nestjs/common";
import { AxiosError } from "axios";
import { firstValueFrom } from "rxjs";

@Injectable()
export class AuthService {
  private readonly backendUrl = process.env.BACKEND_URL ?? "http://localhost:8080";
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly http: HttpService) {}

  async register(body: unknown) {
    return this.forward("post", "/api/auth/register", body);
  }

  async login(body: unknown) {
    return this.forward("post", "/api/auth/login", body);
  }

  async refresh(refreshToken: string) {
    return this.forward("post", "/api/auth/refresh", { refreshToken });
  }

  async me(accessToken: string) {
    return this.forward("get", "/api/auth/me", undefined, accessToken);
  }

  private async forward(method: "get" | "post", path: string, data?: unknown, accessToken?: string) {
    try {
      const response = await firstValueFrom(
        this.http.request({
          method,
          url: `${this.backendUrl}${path}`,
          data,
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        }),
      );
      return response.data;
    } catch (err) {
      const axiosErr = err as AxiosError;
      if (axiosErr.response) {
        this.logger.warn(`Backend ${method.toUpperCase()} ${path} -> ${axiosErr.response.status}`);
      } else {
        this.logger.error(`Backend unreachable for ${method.toUpperCase()} ${path}: ${axiosErr.message}`);
      }
      throw new HttpException(
        axiosErr.response?.data ?? { message: "Backend unreachable" },
        axiosErr.response?.status ?? 502,
      );
    }
  }
}
