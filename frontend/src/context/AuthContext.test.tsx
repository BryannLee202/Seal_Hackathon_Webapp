import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";
import { api } from "../api/client";

vi.mock("../api/client", () => ({
  api: { get: vi.fn(), post: vi.fn() },
  onUnauthorized: vi.fn(() => () => {}),
}));

const mockedApi = vi.mocked(api);

function Probe() {
  const { user, loading, hasRole, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="user">{user ? user.email : "none"}</div>
      <div data-testid="isJudge">{String(hasRole("JUDGE"))}</div>
      <button onClick={() => login("a@b.com", "pw")}>login</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Probe />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("stops loading and exposes the user once /api/auth/me resolves", async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: { userId: "u1", email: "a@b.com", fullName: "A", roles: [{ roleName: "JUDGE", scopeType: "GLOBAL", scopeId: null, judgeType: null }] },
    });

    renderWithProvider();

    expect(screen.getByTestId("loading").textContent).toBe("true");
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));
    expect(screen.getByTestId("user").textContent).toBe("a@b.com");
    expect(screen.getByTestId("isJudge").textContent).toBe("true");
  });

  it("sets user to null when /api/auth/me rejects (e.g. anonymous visitor)", async () => {
    mockedApi.get.mockRejectedValueOnce(new Error("401"));

    renderWithProvider();

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));
    expect(screen.getByTestId("user").textContent).toBe("none");
  });

  it("login() posts credentials then refetches the current user", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: { userId: "u1", email: "nobody", fullName: "", roles: [] } });
    mockedApi.post.mockResolvedValueOnce({ data: {} });
    mockedApi.get.mockResolvedValueOnce({
      data: { userId: "u1", email: "a@b.com", fullName: "A", roles: [] },
    });

    renderWithProvider();
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));

    await userEvent.click(screen.getByText("login"));

    expect(mockedApi.post).toHaveBeenCalledWith("/api/auth/login", { email: "a@b.com", password: "pw" });
    await waitFor(() => expect(screen.getByTestId("user").textContent).toBe("a@b.com"));
  });

  it("logout() posts then clears the current user", async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: { userId: "u1", email: "a@b.com", fullName: "A", roles: [] },
    });
    mockedApi.post.mockResolvedValueOnce({ data: {} });

    renderWithProvider();
    await waitFor(() => expect(screen.getByTestId("user").textContent).toBe("a@b.com"));

    await userEvent.click(screen.getByText("logout"));

    expect(mockedApi.post).toHaveBeenCalledWith("/api/auth/logout");
    await waitFor(() => expect(screen.getByTestId("user").textContent).toBe("none"));
  });
});
