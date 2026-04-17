import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAuthGate } from "@/hooks/use-auth-gate";

const useAuthMock = vi.hoisted(() => vi.fn());
const usePathnameMock = vi.hoisted(() => vi.fn());

vi.mock("@clerk/nextjs", () => ({
  useAuth: useAuthMock,
}));

vi.mock("next/navigation", () => ({
  usePathname: usePathnameMock,
}));

describe("useAuthGate", () => {
  let assignSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    assignSpy = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, assign: assignSpy },
    });
    usePathnameMock.mockReturnValue("/surah/2");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("runs the wrapped action when signed in", () => {
    useAuthMock.mockReturnValue({ isSignedIn: true, isLoaded: true });
    const action = vi.fn().mockReturnValue("result");
    const { result } = renderHook(() => useAuthGate());
    const gated = result.current(action);

    const out = gated("arg1", 42);

    expect(action).toHaveBeenCalledWith("arg1", 42);
    expect(out).toBe("result");
    expect(assignSpy).not.toHaveBeenCalled();
  });

  it("redirects to sign-in with redirect_url when not signed in", () => {
    useAuthMock.mockReturnValue({ isSignedIn: false, isLoaded: true });
    const action = vi.fn();
    const { result } = renderHook(() => useAuthGate());

    result.current(action)();

    expect(action).not.toHaveBeenCalled();
    expect(assignSpy).toHaveBeenCalledWith("/sign-in?redirect_url=%2Fsurah%2F2");
  });

  it("swallows the click before Clerk hydrates", () => {
    useAuthMock.mockReturnValue({ isSignedIn: false, isLoaded: false });
    const action = vi.fn();
    const { result } = renderHook(() => useAuthGate());

    result.current(action)();

    expect(action).not.toHaveBeenCalled();
    expect(assignSpy).not.toHaveBeenCalled();
  });

  it("falls back to / when pathname is null", () => {
    useAuthMock.mockReturnValue({ isSignedIn: false, isLoaded: true });
    usePathnameMock.mockReturnValue(null);
    const action = vi.fn();
    const { result } = renderHook(() => useAuthGate());

    result.current(action)();

    expect(assignSpy).toHaveBeenCalledWith("/sign-in?redirect_url=%2F");
  });
});
