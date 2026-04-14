import { describe, it, expect } from "vitest";

describe("test setup", () => {
  it("runs a basic assertion", () => {
    expect(1 + 1).toBe(2);
  });

  it("has access to jsdom", () => {
    const div = document.createElement("div");
    div.textContent = "Bayaan";
    expect(div.textContent).toBe("Bayaan");
  });
});
