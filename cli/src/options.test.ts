import { describe, it, expect } from "vitest";
import { commonOptions, awsOptions } from "./options";

describe("cli command options", () => {
	it("common options", () => {
		const options = commonOptions();
		expect(options.env).toBeTruthy();
		expect(options.env?.string).toBe(true);
	});
	it("aws options", () => {
		const options = awsOptions();
		expect(options.account).toBeTruthy();
		expect(options.account?.string).toBe(true);
		expect(options.region).toBeTruthy();
		expect(options.region?.string).toBe(true);
		expect(options.profile).toBeTruthy();
		expect(options.profile?.string).toBe(true);
		expect(options.baseParameterPath).toBeTruthy();
		expect(options.baseParameterPath?.string).toBe(true);
	});
});
