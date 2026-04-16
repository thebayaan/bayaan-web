import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmptyState } from "@/components/ui/empty-state";

describe("EmptyState", () => {
  it("renders the title and subtitle", () => {
    render(
      <EmptyState
        icon={<span data-testid="icon" />}
        title="Nothing here yet"
        subtitle="Try adding something."
      />,
    );
    expect(screen.getByText("Nothing here yet")).toBeInTheDocument();
    expect(screen.getByText("Try adding something.")).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("omits subtitle when not provided", () => {
    render(<EmptyState icon={<span />} title="Empty" />);
    expect(screen.queryByText(/subtitle/i)).not.toBeInTheDocument();
  });

  it("renders a link CTA when href is provided", () => {
    render(
      <EmptyState
        icon={<span />}
        title="Empty"
        cta={{ label: "Browse reciters", href: "/reciter" }}
      />,
    );
    const link = screen.getByRole("link", { name: "Browse reciters" });
    expect(link).toHaveAttribute("href", "/reciter");
  });

  it("renders a button CTA when onClick is provided", async () => {
    const onClick = vi.fn();
    render(<EmptyState icon={<span />} title="Empty" cta={{ label: "Retry", onClick }} />);
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
