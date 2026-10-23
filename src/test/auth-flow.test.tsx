import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Route } from "@/routes/auth";

const mocks = vi.hoisted(() => ({ oauth: vi.fn(), session: vi.fn(), signup: vi.fn(), navigate: vi.fn(), mode: "login" }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: { getSession: mocks.session, signInWithOAuth: mocks.oauth, signUp: mocks.signup } } }));
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: object) => ({ options, useSearch: () => ({ mode: mocks.mode }) }),
  useNavigate: () => mocks.navigate,
  Link: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));
describe("public auth return flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mode = "login";
    mocks.session.mockResolvedValue({ data: { session: null } });
    mocks.oauth.mockResolvedValue({ error: null });
  });
  it("Google returns to the same-origin public auth page, not a protected page", async () => {
    const Auth = Route.options.component;
    if (!Auth || typeof Auth !== "function") throw new Error("Auth component missing");
    render(<Auth />);
    fireEvent.click(screen.getByRole("button", { name: /Google/ }));
    await waitFor(() => expect(mocks.oauth).toHaveBeenCalledWith({ provider: "google", options: { redirectTo: `${window.location.origin}/auth?mode=login` } }));
  });
  it("a confirmed session returns to the fixed student home destination", async () => {
    mocks.session.mockResolvedValue({ data: { session: { user: { id: "student" } } } });
    const Auth = Route.options.component;
    if (!Auth || typeof Auth !== "function") throw new Error("Auth component missing");
    render(<Auth />);
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith({ to: "/home", replace: true }));
  });
});