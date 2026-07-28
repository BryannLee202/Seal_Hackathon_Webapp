import { HttpService } from "@nestjs/axios";
import { HttpException, Injectable, Logger } from "@nestjs/common";
import { AxiosError, Method } from "axios";
import { firstValueFrom } from "rxjs";

@Injectable()
export class ProxyService {
  private readonly backendUrl = process.env.BACKEND_URL ?? "http://localhost:8080";
  private readonly logger = new Logger(ProxyService.name);

  constructor(private readonly http: HttpService) {}

  async forward(method: Method, path: string, accessToken?: string, data?: unknown, params?: unknown) {
    try {
      const response = await firstValueFrom(
        this.http.request({
          method,
          url: `${this.backendUrl}${path}`,
          data,
          params,
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        }),
      );
      return { status: response.status, data: response.data, headers: response.headers };
    } catch (err) {
      const axiosErr = err as AxiosError;
      if (axiosErr.response) {
        this.logger.warn(`Backend ${method.toString().toUpperCase()} ${path} -> ${axiosErr.response.status}`);
        throw new HttpException(axiosErr.response.data as object, axiosErr.response.status);
      }
      this.logger.error(`Backend unreachable for ${method.toString().toUpperCase()} ${path}: ${axiosErr.message}`);
      throw new HttpException({ message: "Backend unreachable" }, 502);
    }
  }

  /** Like forward(), but with arbitrary extra headers instead of a Bearer token (e.g. anonymous-voter plumbing). */
  async forwardWithHeaders(method: Method, path: string, headers: Record<string, string>, data?: unknown) {
    try {
      const response = await firstValueFrom(
        this.http.request({
          method,
          url: `${this.backendUrl}${path}`,
          data,
          headers,
        }),
      );
      return { status: response.status, data: response.data };
    } catch (err) {
      const axiosErr = err as AxiosError;
      if (axiosErr.response) {
        this.logger.warn(`Backend ${method.toString().toUpperCase()} ${path} -> ${axiosErr.response.status}`);
        throw new HttpException(axiosErr.response.data as object, axiosErr.response.status);
      }
      this.logger.error(`Backend unreachable for ${method.toString().toUpperCase()} ${path}: ${axiosErr.message}`);
      throw new HttpException({ message: "Backend unreachable" }, 502);
    }
  }
}
