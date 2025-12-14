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
		loadConfig: async (): Promise<Config> => config,
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
	it("test handler", async () => {
		const base = new DeleteCommand();
		const ssmClientMock = mockClient(SSMClient);
		ssmClientMock.on(DeleteParameterCommand).resolves({});
		await base.handler({ ...args, ...config, ...options });
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

	it("test handler with force=false and user declines", async () => {
		const inquirer = await import("inquirer");
		vi.spyOn(inquirer.default, "prompt").mockResolvedValueOnce({
			delete: false,
		});

		const base = new DeleteCommand();
		const ssmClientMock = mockClient(SSMClient);
		ssmClientMock.on(DeleteParameterCommand).resolves({});

		await base.handler({ ...args, ...config, ...options });
		expect(ssmClientMock.calls().length).toBe(0); // Should not call SSM
	});

	it("test builder", () => {
		const base = new DeleteCommand();
		const mockYargs = {
			positional: vi.fn().mockReturnThis(),
			demandOption: vi.fn().mockReturnThis(),
			option: vi.fn().mockReturnThis(),
			// biome-ignore lint/suspicious/noExplicitAny: it's a test
		} as any;
		const result = base.builder(mockYargs);
		expect(mockYargs.positional).toHaveBeenCalled();
		expect(mockYargs.demandOption).toHaveBeenCalled();
		expect(mockYargs.option).toHaveBeenCalled();
		expect(result).toBeDefined();
	});
});
