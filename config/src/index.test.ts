import * as url from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";
import { configPath, loadConfig } from "./index";

// Contains trailing forward slash
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const MOCK_AXIOM_JSON_CONFIG_DIR = `${__dirname}__mocks__/json/`;
const MOCK_AXIOM_JSON_CONFIG_DEV = `${__dirname}__mocks__/json/.axiom.dev.json`;

const MOCK_AXIOM_JS_CONFIG_DIR = `${__dirname}__mocks__/js/`;
const MOCK_AXIOM_JS_CONFIG_DEV = `${__dirname}__mocks__/js/.axiom.dev.js`;

describe("load configs", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("override basic config", async () => {
		const jsonConfig = await loadConfig({ cwd: MOCK_AXIOM_JSON_CONFIG_DIR });

		expect(jsonConfig.env).toBe("prod");

		const jsConfig = await loadConfig({ cwd: MOCK_AXIOM_JS_CONFIG_DIR });

		expect(jsConfig.env).toBe("prod");
	});

	it("override basic config dev", async () => {
		const jsonConfig = await loadConfig({
			env: "dev",
			cwd: MOCK_AXIOM_JSON_CONFIG_DIR,
		});

		expect(jsonConfig.env).toBe("dev");
		expect(jsonConfig.aws.region).toBe("us-north-1");

		const jsConfig = await loadConfig({ cwd: MOCK_AXIOM_JS_CONFIG_DIR });

		expect(jsConfig.env).toBe("prod");
	});

	it("load prod env basic config", async () => {
		const jsonConfig = await loadConfig({ cwd: MOCK_AXIOM_JSON_CONFIG_DIR });

		expect(jsonConfig.env).toBe("prod");

		const jsConfig = await loadConfig({ cwd: MOCK_AXIOM_JS_CONFIG_DIR });

		expect(jsConfig.env).toBe("prod");
	});

	it("test isProd", async () => {
		const isProdConfig = await loadConfig({
			cwd: MOCK_AXIOM_JS_CONFIG_DIR,
		});
		expect(isProdConfig.isProd()).toBeTruthy();
	});

	it("test not isProd", async () => {
		const jsonConfig = await loadConfig({
			env: "dev",
			cwd: MOCK_AXIOM_JSON_CONFIG_DIR,
		});
		expect(jsonConfig.isProd()).toBeFalsy();
	});

	it("test inheritence", async () => {
		const jsonPath = configPath({
			env: "dev",
			cwd: MOCK_AXIOM_JSON_CONFIG_DIR,
		});

		expect(jsonPath).toBe(MOCK_AXIOM_JSON_CONFIG_DEV);

		const config = await loadConfig({
			env: "dev",
			cwd: MOCK_AXIOM_JS_CONFIG_DIR,
		});

		expect(config.env).toBe("dev");
		expect(config.aws.region).toBe("us-east-1");
	});

	it("test path", () => {
		const jsonPath = configPath({
			env: "dev",
			cwd: MOCK_AXIOM_JSON_CONFIG_DIR,
		});

		expect(jsonPath).toBe(MOCK_AXIOM_JSON_CONFIG_DEV);

		const jsPath = configPath({ env: "dev", cwd: MOCK_AXIOM_JS_CONFIG_DIR });

		expect(jsPath).toBe(MOCK_AXIOM_JS_CONFIG_DEV);
	});

	it("test asParameterPath", async () => {
		const jsonConfig = await loadConfig({
			env: "dev",
			cwd: MOCK_AXIOM_JSON_CONFIG_DIR,
		});
		expect(jsonConfig.asParameterPath("my-secret")).toBe("/dev-path/my-secret");
		const jsConfig = await loadConfig({ cwd: MOCK_AXIOM_JS_CONFIG_DIR });
		expect(jsConfig.asParameterPath("my-secret")).toBe("/prod-path/my-secret");
	});

	it("test asParameterPath strips trailing slashes", async () => {
		const config = await loadConfig({
			cwd: MOCK_AXIOM_JSON_CONFIG_DIR,
			overrides: {
				aws: {
					baseParameterPath: "/prod-path///",
				},
			},
		});
		expect(config.asParameterPath("my-secret")).toBe("/prod-path/my-secret");
	});

	it("test loadConfig with overrides", async () => {
		const config = await loadConfig({
			cwd: MOCK_AXIOM_JSON_CONFIG_DIR,
			overrides: {
				name: "overridden-name",
				aws: {
					account: "override-account",
				},
			},
		});
		expect(config.name).toBe("overridden-name");
		expect(config.aws.account).toBe("override-account");
		// Original values should still be there
		expect(config.env).toBe("prod");
	});

	it("test configPath throws when config not found", () => {
		expect(() => configPath({ cwd: "/non/existent/path" })).toThrow(
			"Axiom config files not found",
		);
	});

	it("test importConfigFromPath throws for unsupported file type", async () => {
		await expect(async () => {
			const { importConfigFromPath } = await import("./index");
			await importConfigFromPath("/some/path/config.txt");
		}).rejects.toThrow("Unsupported file type or path not found");
	});
});

describe("loadConfigByEnv", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("should load config by environment name when env is undefined", async () => {
		const { loadConfigByEnv } = await import("./index");
		const config = await loadConfigByEnv(undefined, {
			cwd: MOCK_AXIOM_JSON_CONFIG_DIR,
		});

		expect(config.env).toBe("prod");
		expect(config.aws.region).toBe("us-east-1");
		expect(config.name).toBe("my-prod-app");
	});

	it("should load config by environment name", async () => {
		const { loadConfigByEnv } = await import("./index");
		const config = await loadConfigByEnv("dev", {
			cwd: MOCK_AXIOM_JSON_CONFIG_DIR,
		});

		expect(config.env).toBe("dev");
		expect(config.aws.region).toBe("us-north-1");
		expect(config.name).toBe("my-prod-app");
	});

	it("should return ConfigContainer instance with methods", async () => {
		const { loadConfigByEnv } = await import("./index");
		const config = await loadConfigByEnv("dev", {
			cwd: MOCK_AXIOM_JSON_CONFIG_DIR, // JSON dev config has /dev-path
		});

		expect(config.env).toBe("dev");
		expect(config.isProd()).toBeFalsy();
		expect(typeof config.asParameterPath).toBe("function");
		expect(config.asParameterPath("test")).toBe("/dev-path/test");
	});

	it("should work with custom type extensions", async () => {
		interface CustomConfig {
			customProp: string;
		}

		const { loadConfigByEnv } = await import("./index");
		const config = await loadConfigByEnv<CustomConfig>("dev", {
			cwd: MOCK_AXIOM_JSON_CONFIG_DIR,
			overrides: {
				customProp: "custom-value",
			},
		});

		expect(config.env).toBe("dev");
		expect(config.customProp).toBe("custom-value");
	});

	it("should support cwd option", async () => {
		const { loadConfigByEnv } = await import("./index");
		const config = await loadConfigByEnv("dev", {
			cwd: MOCK_AXIOM_JS_CONFIG_DIR,
		});

		expect(config.env).toBe("dev");
		expect(config.aws.region).toBe("us-east-1"); // from dev config
	});

	it("should support overrides option", async () => {
		const { loadConfigByEnv } = await import("./index");
		const config = await loadConfigByEnv("dev", {
			cwd: MOCK_AXIOM_JSON_CONFIG_DIR,
			overrides: {
				name: "overridden-by-loadConfigByEnv",
			},
		});

		expect(config.name).toBe("overridden-by-loadConfigByEnv");
		expect(config.env).toBe("dev");
	});
});

// describe("load TypeScript configs", () => {
// 	afterEach(() => {
// 		vi.clearAllMocks();
// 	});
//
// 	it("load basic TypeScript config", () => {
// 		const tsConfig = loadConfig({ cwd: MOCK_AXIOM_TS_CONFIG_DIR });
//
// 		expect(tsConfig.env).toBe("prod");
// 		expect(tsConfig.name).toBe("my-prod-app");
// 		expect(tsConfig.aws.account).toBe("prod-account");
// 		expect(tsConfig.aws.profile).toBe("prod-profile");
// 		expect(tsConfig.aws.region).toBe("us-east-1");
// 		expect(tsConfig.aws.baseParameterPath).toBe("/prod-path");
// 	});
//
// 	it("load TypeScript dev config", () => {
// 		const tsConfig = loadConfig({
// 			env: "dev",
// 			cwd: MOCK_AXIOM_TS_CONFIG_DIR,
// 		});
//
// 		expect(tsConfig.env).toBe("dev");
// 		expect(tsConfig.name).toBe("my-prod-app");
// 		expect(tsConfig.aws.account).toBe("dev-account");
// 		expect(tsConfig.aws.profile).toBe("dev-profile");
// 		expect(tsConfig.aws.region).toBe("us-east-1");
// 		expect(tsConfig.aws.baseParameterPath).toBe("/dev-path");
// 	});
//
// 	it("test TypeScript config path", () => {
// 		const tsPath = configPath({ env: "dev", cwd: MOCK_AXIOM_TS_CONFIG_DIR });
//
// 		expect(tsPath).toBe(MOCK_AXIOM_TS_CONFIG_DEV);
// 	});
//
// 	it("test TypeScript config isProd", () => {
// 		const isProdConfig = loadConfig({
// 			cwd: MOCK_AXIOM_TS_CONFIG_DIR,
// 		});
// 		expect(isProdConfig.isProd()).toBeTruthy();
// 	});
//
// 	it("test TypeScript config not isProd", () => {
// 		const tsConfig = loadConfig({
// 			env: "dev",
// 			cwd: MOCK_AXIOM_TS_CONFIG_DIR,
// 		});
// 		expect(tsConfig.isProd()).toBeFalsy();
// 	});
//
// 	it("test TypeScript config asParameterPath", () => {
// 		const tsConfig = loadConfig({
// 			env: "dev",
// 			cwd: MOCK_AXIOM_TS_CONFIG_DIR,
// 		});
// 		expect(tsConfig.asParameterPath("my-secret")).toBe("/dev-path/my-secret");
//
// 		const tsProdConfig = loadConfig({ cwd: MOCK_AXIOM_TS_CONFIG_DIR });
// 		expect(tsProdConfig.asParameterPath("my-secret")).toBe(
// 			"/prod-path/my-secret",
// 		);
// 	});
//
// 	it("test TypeScript config inheritance", () => {
// 		const config = loadConfig({ env: "dev", cwd: MOCK_AXIOM_TS_CONFIG_DIR });
//
// 		expect(config.env).toBe("dev");
// 		expect(config.aws.region).toBe("us-east-1");
// 		expect(config.name).toBe("my-prod-app");
// 	});
// });
