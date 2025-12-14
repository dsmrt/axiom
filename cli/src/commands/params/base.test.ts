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

	it("test builder", () => {
		const base = new ParamsCommand();
		const mockYargs = {
			demandCommand: vi.fn().mockReturnThis(),
			command: vi.fn().mockReturnThis(),
			// biome-ignore lint/suspicious/noExplicitAny: it's a test
		} as any;
		const result = base.builder(mockYargs);
		expect(mockYargs.demandCommand).toHaveBeenCalled();
		expect(mockYargs.command).toHaveBeenCalledTimes(3);
		expect(result).toBeDefined();
	});
});
