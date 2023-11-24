import { describe, expect, it } from "vitest";
import { GetCommand } from "./get";

describe("cli get command", () => {
  it("test handler", () => {
    const base = new GetCommand();
    expect(base.command).toBe("get [path]");
  });
});
