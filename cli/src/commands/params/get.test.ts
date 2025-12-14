import { vi, describe, expect, it } from "vitest";
import { GetCommand, type GetOptions } from "./get";
import type { Parameter } from "@aws-sdk/client-ssm";
import type { Config } from "@dsmrt/axiom-config";
import type { ArgumentsCamelCase } from "yargs";

const config: Config = {
  name: "test",
  env: "test",
  aws: {
    profile: "fake",
    account: "fake",
    region: "fake",
    baseParameterPath: "/fake/test/",
  },
};

const options: GetOptions = {
  env: "test",
  path: "test",
};

const args: ArgumentsCamelCase = {
  _: [""],
  $0: "",
};

vi.mock("@dsmrt/axiom-config", () => {
  return {
    loadConfig: async (): Promise<Config> => config,
  };
});

vi.mock("@dsmrt/axiom-aws-sdk", () => {
  return {
    ParameterCollection: vi.fn(() => {
      return {
        get: vi.fn(async () => {
          const one: Parameter = {
            Name: "/fake/test/one",
            Value: "hello world",
          };
          const two: Parameter = {
            Name: "/fake/test/two",
            Value: "hi us",
          };
          return new Map([
            ["one", one],
            ["two", two],
          ]);
        }),
      };
    }),
  };
});

describe("cli get command", () => {
  it("test handler", async () => {
    const base = new GetCommand();
    await base.handler({ ...args, ...config, ...options });
    expect(base.command).toBe("get [path]");
  });
});
