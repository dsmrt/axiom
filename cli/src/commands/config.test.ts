import { vi, describe, expect, it } from "vitest";
import { Config } from "./config";

vi.mock("@dsmrt/axiom-config", () => {
  return {
    loadConfig: () => {
      return {
        name: "test",
      };
    },
  };
});

describe("cli config command", () => {
  it("test handler", () => {
    const config = new Config();
    config.loadConfig({ env: "dev" });
    expect(config.command).toBe("config");
  });
});
