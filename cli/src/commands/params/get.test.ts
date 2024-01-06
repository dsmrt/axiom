import { vi, describe, expect, it } from "vitest";
import { GetCommand, GetOptions } from "./get";
import { Parameter } from "@aws-sdk/client-ssm";
import { Config } from "@dsmrt/axiom-config";
import { ArgumentsCamelCase } from "yargs";

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
    loadConfig: (): Config => config,
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
  it("test handler", () => {
    const base = new GetCommand();
    base.handler({ ...args, ...config, ...options });
    expect(base.command).toBe("get [path]");
  });
});
