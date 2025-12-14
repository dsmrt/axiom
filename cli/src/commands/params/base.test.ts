import { vi, describe, expect, it } from "vitest";
import { ParamsCommand } from "./base";
import type { Config } from "@dsmrt/axiom-config";

vi.mock("@dsmrt/axiom-config", () => {
  return {
    loadConfig: async (): Promise<Config> => {
      return {
        name: "test",
        env: "test",
        aws: {
          profile: "fake",
          account: "fake",
          region: "fake",
          baseParameterPath: "/fake/test/",
        },
      };
    },
  };
});

describe("cli base command", () => {
  it("test handler", async () => {
    const base = new ParamsCommand();
    await base.handler();
    expect(base.command).toBe("params");
  });
});
