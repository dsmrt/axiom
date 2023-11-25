import { vi, describe, expect, it } from "vitest";
import { DeleteCommand, DeleteOptions } from "./delete";
import { Config } from "@dsmrt/axiom-config";
import { ArgumentsCamelCase } from "yargs";
import { mockClient } from "aws-sdk-client-mock";
import { SSMClient, DeleteParameterCommand } from "@aws-sdk/client-ssm";

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

const options: DeleteOptions = {
  force: false,
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

vi.mock("inquirer", () => {
  return {
    default: {
      prompt: vi.fn(async () => {
        return {
          delete: true,
        };
      }),
    },
  };
});

describe("cli delete command", () => {
  it("test handler", () => {
    const base = new DeleteCommand();
    base.handler({ ...args, ...config, ...options });
    const ssmClientMock = mockClient(SSMClient);
    ssmClientMock.on(DeleteParameterCommand).resolves({});
    expect(base.command).toBe("delete <path>");
  });
});
