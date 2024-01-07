import { vi, describe, expect, it } from "vitest";
import { SetCommand, SetOptions } from "./set";
import { PutParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { mockClient } from "aws-sdk-client-mock";
import { Config } from "@dsmrt/axiom-config";
import { ArgumentsCamelCase, Argv } from "yargs";

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

const options: SetOptions = {
  account: "test",
  region: "test",
  profile: "test",
  baseParameterPath: "/test",
  env: "test",
  path: "test",
  value: "test",
  force: false,
  secure: true,
  overwrite: true,
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

vi.mock("inquirer", () => {
  return {
    default: {
      prompt: vi.fn(async () => {
        return {
          setParam: true,
        };
      }),
    },
  };
});

describe("cli get command", () => {
  it("test handler", () => {
    const ssmClientMock = mockClient(SSMClient);
    ssmClientMock.on(PutParameterCommand).resolves({});
    const base = new SetCommand();
    base.handler({ ...args, ...config, ...options });
    base.builder({
      positional: vi.fn(),
      option: vi.fn(),
      demandOption: vi.fn(),
      options: vi.fn(),
    } as Argv);
    expect(base.command).toBe("set <path> <value>");
  });
});
