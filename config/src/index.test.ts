import * as url from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";
import { configPath, loadConfig } from "./index";

// Contains trailing forward slash
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const MOCK_AXIOM_JSON_CONFIG_DIR = `${__dirname}__mocks__/json/`;
const MOCK_AXIOM_JSON_CONFIG_DEV = `${__dirname}__mocks__/json/.axiom.dev.json`;

const MOCK_AXIOM_JS_CONFIG_DIR = `${__dirname}__mocks__/js/`;
const MOCK_AXIOM_JS_CONFIG_DEV = `${__dirname}__mocks__/js/.axiom.dev.js`;

const MOCK_AXIOM_TS_CONFIG_DIR = `${__dirname}__mocks__/ts/`;
const MOCK_AXIOM_TS_CONFIG_DEV = `${__dirname}__mocks__/ts/.axiom.dev.ts`;

describe("load configs", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("override basic config", () => {
		const jsonConfig = loadConfig({ cwd: MOCK_AXIOM_JSON_CONFIG_DIR });

		expect(jsonConfig.env).toBe("prod");

		const jsConfig = loadConfig({ cwd: MOCK_AXIOM_JS_CONFIG_DIR });

		expect(jsConfig.env).toBe("prod");
	});

	it("override basic config dev", () => {
		const jsonConfig = loadConfig({
			env: "dev",
			cwd: MOCK_AXIOM_JSON_CONFIG_DIR,
		});

		expect(jsonConfig.env).toBe("dev");
		expect(jsonConfig.aws.region).toBe("us-north-1");

		const jsConfig = loadConfig({ cwd: MOCK_AXIOM_JS_CONFIG_DIR });

		expect(jsConfig.env).toBe("prod");
	});

	it("load prod env basic config", () => {
		const jsonConfig = loadConfig({ cwd: MOCK_AXIOM_JSON_CONFIG_DIR });

		expect(jsonConfig.env).toBe("prod");

		const jsConfig = loadConfig({ cwd: MOCK_AXIOM_JS_CONFIG_DIR });

		expect(jsConfig.env).toBe("prod");
	});

	it("test isProd", () => {
		const isProdConfig = loadConfig({
			cwd: MOCK_AXIOM_JS_CONFIG_DIR,
		});
		console.log("PROD", isProdConfig, loadConfig);
		expect(isProdConfig.isProd()).toBeTruthy();
	});

	it("test not isProd", () => {
		const jsonConfig = loadConfig({
			env: "dev",
			cwd: MOCK_AXIOM_JSON_CONFIG_DIR,
		});
		expect(jsonConfig.isProd()).toBeFalsy();
	});

	it("test inheritence", () => {
		const jsonPath = configPath({
			env: "dev",
			cwd: MOCK_AXIOM_JSON_CONFIG_DIR,
		});

		expect(jsonPath).toBe(MOCK_AXIOM_JSON_CONFIG_DEV);

		const config = loadConfig({ env: "dev", cwd: MOCK_AXIOM_JS_CONFIG_DIR });

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

	it("test asParameterPath", () => {
		const jsonConfig = loadConfig({
			env: "dev",
			cwd: MOCK_AXIOM_JSON_CONFIG_DIR,
		});
		expect(jsonConfig.asParameterPath("my-secret")).toBe("/dev-path/my-secret");
		const jsConfig = loadConfig({ cwd: MOCK_AXIOM_JS_CONFIG_DIR });
		expect(jsConfig.asParameterPath("my-secret")).toBe("/prod-path/my-secret");
	});
});

describe("load TypeScript configs", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("load basic TypeScript config", () => {
		const tsConfig = loadConfig({ cwd: MOCK_AXIOM_TS_CONFIG_DIR });

		expect(tsConfig.env).toBe("prod");
		expect(tsConfig.name).toBe("my-prod-app");
		expect(tsConfig.aws.account).toBe("prod-account");
		expect(tsConfig.aws.profile).toBe("prod-profile");
		expect(tsConfig.aws.region).toBe("us-east-1");
		expect(tsConfig.aws.baseParameterPath).toBe("/prod-path");
	});

	it("load TypeScript dev config", () => {
		const tsConfig = loadConfig({
			env: "dev",
			cwd: MOCK_AXIOM_TS_CONFIG_DIR,
		});

		expect(tsConfig.env).toBe("dev");
		expect(tsConfig.name).toBe("my-prod-app");
		expect(tsConfig.aws.account).toBe("dev-account");
		expect(tsConfig.aws.profile).toBe("dev-profile");
		expect(tsConfig.aws.region).toBe("us-east-1");
		expect(tsConfig.aws.baseParameterPath).toBe("/dev-path");
	});

	it("test TypeScript config path", () => {
		const tsPath = configPath({ env: "dev", cwd: MOCK_AXIOM_TS_CONFIG_DIR });

		expect(tsPath).toBe(MOCK_AXIOM_TS_CONFIG_DEV);
	});

	it("test TypeScript config isProd", () => {
		const isProdConfig = loadConfig({
			cwd: MOCK_AXIOM_TS_CONFIG_DIR,
		});
		expect(isProdConfig.isProd()).toBeTruthy();
	});

	it("test TypeScript config not isProd", () => {
		const tsConfig = loadConfig({
			env: "dev",
			cwd: MOCK_AXIOM_TS_CONFIG_DIR,
		});
		expect(tsConfig.isProd()).toBeFalsy();
	});

	it("test TypeScript config asParameterPath", () => {
		const tsConfig = loadConfig({
			env: "dev",
			cwd: MOCK_AXIOM_TS_CONFIG_DIR,
		});
		expect(tsConfig.asParameterPath("my-secret")).toBe("/dev-path/my-secret");

		const tsProdConfig = loadConfig({ cwd: MOCK_AXIOM_TS_CONFIG_DIR });
		expect(tsProdConfig.asParameterPath("my-secret")).toBe(
			"/prod-path/my-secret",
		);
	});

	it("test TypeScript config inheritance", () => {
		const config = loadConfig({ env: "dev", cwd: MOCK_AXIOM_TS_CONFIG_DIR });

		expect(config.env).toBe("dev");
		expect(config.aws.region).toBe("us-east-1");
		expect(config.name).toBe("my-prod-app");
	});
});
