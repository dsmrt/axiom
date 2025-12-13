import { vi, describe, expect, it } from "vitest";
import { DeleteCommand, type DeleteOptions } from "./delete";
import type { Config } from "@dsmrt/axiom-config";
import type { ArgumentsCamelCase } from "yargs";
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
    const ssmClientMock = mockClient(SSMClient);
    ssmClientMock.on(DeleteParameterCommand).resolves({});
    base.handler({ ...args, ...config, ...options });
    expect(base.command).toBe("delete <path>");
  });

  it("test handler error", async () => {
    const base = new DeleteCommand();
    const ssmClientMock = mockClient(SSMClient);
    await expect(
      base.handler({
        ...args,
        ...config,
        ...{
          force: true,
          path: "/fake/test/",
        },
      }),
    ).rejects.toThrowError();
    ssmClientMock.on(DeleteParameterCommand).resolves({});
    expect(base.command).toBe("delete <path>");
  });
});
