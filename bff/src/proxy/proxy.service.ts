import { HttpService } from "@nestjs/axios";
import { HttpException, Injectable } from "@nestjs/common";
import { AxiosError, Method } from "axios";
import { firstValueFrom } from "rxjs";

@Injectable()
export class ProxyService {
  private readonly backendUrl = process.env.BACKEND_URL ?? "http://localhost:8080";

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
        throw new HttpException(axiosErr.response.data as object, axiosErr.response.status);
      }
      throw new HttpException({ message: "Backend unreachable" }, 502);
    }
  }
}
