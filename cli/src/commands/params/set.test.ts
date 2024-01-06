import { describe, expect, it } from "vitest";
import { SetCommand } from "./set";

describe("cli get command", () => {
  it("test handler", () => {
    const base = new SetCommand();
    expect(base.command).toBe("set <path> <value>");
  });
});
