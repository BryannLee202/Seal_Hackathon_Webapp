import { Test } from "@nestjs/testing";
import { Response } from "express";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

function mockResponse() {
  return {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as Response;
}

describe("AuthController", () => {
  let controller: AuthController;
  let authService: { login: jest.Mock; register: jest.Mock; refresh: jest.Mock; me: jest.Mock };

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
      register: jest.fn(),
      refresh: jest.fn(),
      me: jest.fn(),
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = moduleRef.get(AuthController);
  });

  it("login() sets auth + CSRF cookies and never returns the raw tokens", async () => {
    authService.login.mockResolvedValue({
      accessToken: "access-secret",
      refreshToken: "refresh-secret",
      email: "a@b.com",
    });
    const res = mockResponse();

    const body = await controller.login({ email: "a@b.com", password: "x" }, res);

    expect(res.cookie).toHaveBeenCalledTimes(3); // access token, refresh token, CSRF token
    expect(body).not.toHaveProperty("accessToken");
    expect(body).not.toHaveProperty("refreshToken");
    expect(JSON.stringify(body)).not.toContain("secret");
  });

  it("refresh() sets auth + CSRF cookies and never returns the raw tokens", async () => {
    authService.refresh.mockResolvedValue({
      accessToken: "new-access-secret",
      refreshToken: "new-refresh-secret",
    });
    const res = mockResponse();
    const req = { cookies: { shms_rt: "old-refresh-token" } } as unknown as Parameters<
      AuthController["refresh"]
    >[0];

    const body = await controller.refresh(req, res);

    expect(res.cookie).toHaveBeenCalledTimes(3);
    expect(body).not.toHaveProperty("accessToken");
    expect(body).not.toHaveProperty("refreshToken");
  });

  it("logout() clears both auth cookies", async () => {
    const res = mockResponse();

    const result = await controller.logout(res);

    expect(res.clearCookie).toHaveBeenCalledWith("shms_at", { path: "/" });
    expect(res.clearCookie).toHaveBeenCalledWith("shms_rt", { path: "/" });
    expect(result).toEqual({ success: true });
  });

  it("me() backfills a CSRF cookie when one isn't present yet", async () => {
    authService.me.mockResolvedValue({ id: "u1" });
    const res = mockResponse();
    const req = { cookies: {} } as unknown as Parameters<AuthController["me"]>[0];

    await controller.me(req, res);

    expect(res.cookie).toHaveBeenCalledWith("XSRF-TOKEN", expect.any(String), expect.any(Object));
  });

  it("me() does not reissue a CSRF cookie when one already exists", async () => {
    authService.me.mockResolvedValue({ id: "u1" });
    const res = mockResponse();
    const req = { cookies: { "XSRF-TOKEN": "existing-token" } } as unknown as Parameters<
      AuthController["me"]
    >[0];

    await controller.me(req, res);

    expect(res.cookie).not.toHaveBeenCalled();
  });
});
