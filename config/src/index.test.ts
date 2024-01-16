import { configPath, loadConfig } from "./index";
import { afterEach, vi, describe, expect, it } from "vitest";
import * as url from "url";

// Contains trailing forward slash
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const MOCK_AXIOM_JSON_CONFIG_DIR = __dirname + "__mocks__/json/";
const MOCK_AXIOM_JSON_CONFIG_DEV = __dirname + "__mocks__/json/.axiom.dev.json";

const MOCK_AXIOM_JS_CONFIG_DIR = __dirname + "__mocks__/js/";
const MOCK_AXIOM_JS_CONFIG_DEV = __dirname + "__mocks__/js/.axiom.dev.js";

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

  it("test path", () => {
    const jsonPath = configPath({
      env: "dev",
      cwd: MOCK_AXIOM_JSON_CONFIG_DIR,
    });

    expect(jsonPath).toBe(MOCK_AXIOM_JSON_CONFIG_DEV);

    const jsPath = configPath({ env: "dev", cwd: MOCK_AXIOM_JS_CONFIG_DIR });

    expect(jsPath).toBe(MOCK_AXIOM_JS_CONFIG_DEV);
  });

  it("test isProd", () => {
    const jsonConfig = loadConfig({
      env: "dev",
      cwd: MOCK_AXIOM_JSON_CONFIG_DIR,
    });
    expect(jsonConfig.isProd()).toBeFalsy();
    const jsConfig = loadConfig({ cwd: MOCK_AXIOM_JS_CONFIG_DIR });
    expect(jsConfig.isProd()).toBeTruthy();
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
