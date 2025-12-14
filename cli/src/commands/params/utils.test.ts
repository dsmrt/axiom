import { describe, it, expect } from "vitest";
import { buildPath } from "./utils";
import type { Config } from "@dsmrt/axiom-config";

describe("cli utils", () => {
	it("build path", () => {
		const config: Config = {
			name: "dev",
			env: "dev",
			aws: {
				profile: "dsmrt",
				account: "82193843",
				region: "us-east-1",
				baseParameterPath: "/test/dev/",
			},
		};
		const path1 = buildPath(config);
		expect(path1).toBe("/test/dev/");
		const path2 = buildPath(config, "/force");
		expect(path2).toBe("/force");
		const path3 = buildPath(config, "force");
		expect(path3).toBe("/test/dev/force");
	});
});
