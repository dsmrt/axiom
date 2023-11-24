import { describe, expect, it } from "vitest";
import { DeleteCommand } from "./delete";

describe("cli delete command", () => {
  it("test handler", () => {
    const base = new DeleteCommand();
    expect(base.command).toBe("delete <path>");
  });
});
