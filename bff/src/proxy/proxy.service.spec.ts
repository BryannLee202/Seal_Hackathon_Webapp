import { HttpService } from "@nestjs/axios";
import { HttpException } from "@nestjs/common";
import { of, throwError } from "rxjs";
import { ProxyService } from "./proxy.service";

describe("ProxyService", () => {
  let http: { request: jest.Mock };
  let service: ProxyService;

  beforeEach(() => {
    http = { request: jest.fn() };
    service = new ProxyService(http as unknown as HttpService);
  });

  it("forward() returns the backend's status/data/headers on success", async () => {
    http.request.mockReturnValue(
      of({ status: 200, data: { ok: true }, headers: { "x-test": "1" } }),
    );

    const result = await service.forward("get", "/api/foo", "token-abc");

    expect(result).toEqual({ status: 200, data: { ok: true }, headers: { "x-test": "1" } });
    expect(http.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "get",
        headers: { Authorization: "Bearer token-abc" },
      }),
    );
  });

  it("forward() rethrows the backend's status/body when the backend responds with an error", async () => {
    http.request.mockReturnValue(
      throwError(() => ({
        response: { status: 404, data: { message: "not found" } },
        isAxiosError: true,
      })),
    );

    await expect(service.forward("get", "/api/missing")).rejects.toMatchObject({
      status: 404,
      response: { message: "not found" },
    });
  });

  it("forward() maps a network failure (no response) to a 502", async () => {
    http.request.mockReturnValue(throwError(() => ({ message: "ECONNREFUSED", isAxiosError: true })));

    await expect(service.forward("get", "/api/down")).rejects.toMatchObject({
      status: 502,
      response: { message: "Backend unreachable" },
    });
  });

  it("forwardWithHeaders() forwards arbitrary headers and returns status/data", async () => {
    http.request.mockReturnValue(of({ status: 201, data: { id: 1 } }));

    const result = await service.forwardWithHeaders("post", "/api/vote", { "X-Voter-Token": "v1" }, { teamId: "t1" });

    expect(result).toEqual({ status: 201, data: { id: 1 } });
    expect(http.request).toHaveBeenCalledWith(
      expect.objectContaining({ headers: { "X-Voter-Token": "v1" }, data: { teamId: "t1" } }),
    );
  });

  it("forwardWithHeaders() maps a network failure to a 502", async () => {
    http.request.mockReturnValue(throwError(() => ({ message: "timeout", isAxiosError: true })));

    await expect(service.forwardWithHeaders("post", "/api/vote", {})).rejects.toBeInstanceOf(HttpException);
  });
});
