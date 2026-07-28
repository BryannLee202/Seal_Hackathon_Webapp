import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { VotingPage } from "./VotingPage";
import { api } from "../../api/client";

vi.mock("../../api/client", () => ({
  api: { get: vi.fn(), post: vi.fn() },
}));

// Isolate the vote-locking bug from framer-motion internals (IntersectionObserver, springs)
// that jsdom doesn't implement - this test targets castVote()'s localStorage logic, not animation.
vi.mock("../../components/TiltCard", () => ({
  TiltCard: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));
vi.mock("../../components/CountUp", () => ({
  CountUp: ({ target }: { target: number }) => <span>{target}</span>,
}));

const mockedApi = vi.mocked(api);

const EVENT = { id: "e1", name: "Event 1" };
const TRACK = { id: "t1", name: "Track 1" };
const TALLY = { teamId: "team-1", teamName: "Team One", voteCount: 3 };

function votedKey(trackId: string) {
  return `seal_voted_${trackId}`;
}

function setupApiMocks() {
  mockedApi.get.mockImplementation((url: string) => {
    if (url === "/api/public/voting/events") return Promise.resolve({ data: [EVENT] });
    if (url === `/api/public/voting/events/${EVENT.id}/tracks`) return Promise.resolve({ data: [TRACK] });
    if (url === `/api/public/voting/tracks/${TRACK.id}/tallies`) return Promise.resolve({ data: [TALLY] });
    return Promise.reject(new Error(`unexpected GET ${url}`));
  });
}

describe("VotingPage castVote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    setupApiMocks();
  });

  it("records the vote in localStorage on success", async () => {
    mockedApi.post.mockResolvedValueOnce({ data: { teamId: TALLY.teamId, teamVoteCount: 4 } });

    render(
      <MemoryRouter>
        <VotingPage />
      </MemoryRouter>,
    );

    const voteButton = await screen.findByText("Bình chọn");
    await userEvent.click(voteButton);

    await waitFor(() => expect(localStorage.getItem(votedKey(TRACK.id))).toBe(TALLY.teamId));
    expect(await screen.findByText("Bạn đã bình chọn đội này")).toBeInTheDocument();
  });

  it("does NOT lock the visitor out when the vote request fails (regression test)", async () => {
    mockedApi.post.mockRejectedValueOnce(new Error("Network error"));

    render(
      <MemoryRouter>
        <VotingPage />
      </MemoryRouter>,
    );

    const voteButton = await screen.findByText("Bình chọn");
    await userEvent.click(voteButton);

    await waitFor(() => expect(mockedApi.post).toHaveBeenCalledTimes(1));

    expect(localStorage.getItem(votedKey(TRACK.id))).toBeNull();
    expect(screen.getByText("Bình chọn")).toBeEnabled();
  });
});
