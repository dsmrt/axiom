import { describe, expect, it } from "vitest";
import { ParamsCommand } from "./base";

describe("cli base command", () => {
  it("test handler", () => {
    const base = new ParamsCommand();
    expect(base.command).toBe("params");
  });
});
