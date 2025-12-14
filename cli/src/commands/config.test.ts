import { vi, describe, expect, it } from "vitest";
import { Config } from "./config";
import yargs from "yargs/yargs";

vi.mock("@dsmrt/axiom-config", () => {
  return {
    loadConfig: async () => {
      return {
        name: "test",
      };
    },
  };
});

describe("cli config command", () => {
  it("test handler", async () => {
    const config = new Config();
    await config.loadConfig({ env: "dev" });
    await yargs(["config"]).command(config).argv;

    expect(config.command).toBe("config");
  });
});
