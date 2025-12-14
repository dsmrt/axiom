import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Init } from "./init";

describe("Init command", () => {
	let testDir: string;
	let initCommand: Init<unknown>;

	beforeEach(() => {
		// Create a unique test directory for each test
		testDir = join(
			process.cwd(),
			"test-tmp",
			`init-test-${Date.now()}-${Math.random().toString(36).substring(7)}`,
		);
		vi.spyOn(process, "cwd").mockReturnValue(testDir);
		initCommand = new Init();
	});

	afterEach(() => {
		// Clean up test files
		if (existsSync(testDir)) {
			rmSync(testDir, { recursive: true, force: true });
		}
		vi.restoreAllMocks();
	});

	it("should have correct command and description", () => {
		expect(initCommand.command).toBe("init");
		expect(initCommand.describe).toBe("Initialize Axiom configuration files");
	});

	it("should create base config file with provided options", async () => {
		const mockInquirer = await import("inquirer");
		vi.spyOn(mockInquirer.default, "prompt").mockResolvedValue({
			createCustomTypes: false,
		});

		await initCommand.handler({
			_: [],
			$0: "",
			force: true,
			name: "test-app",
			account: "123456789012",
			region: "us-west-2",
			profile: "test-profile",
		});

		const configPath = join(testDir, ".axiom.ts");
		expect(existsSync(configPath)).toBe(true);

		const content = readFileSync(configPath, "utf-8");
		expect(content).toContain('name: "test-app"');
		expect(content).toContain('env: "prod"');
		expect(content).toContain('account: "123456789012"');
		expect(content).toContain('region: "us-west-2"');
		expect(content).toContain('profile: "test-profile"');
		expect(content).toContain('baseParameterPath: "/test-app/prod"');
	});

	it("should create dev config file", async () => {
		const mockInquirer = await import("inquirer");
		vi.spyOn(mockInquirer.default, "prompt").mockResolvedValue({
			createCustomTypes: false,
		});

		await initCommand.handler({
			_: [],
			$0: "",
			force: true,
			name: "test-app",
			account: "123456789012",
			region: "us-west-2",
			profile: "test-profile",
		});

		const devConfigPath = join(testDir, ".axiom.dev.ts");
		expect(existsSync(devConfigPath)).toBe(true);

		const content = readFileSync(devConfigPath, "utf-8");
		expect(content).toContain('env: "dev"');
		expect(content).toContain("baseParameterPath: undefined");
		expect(content).toContain("Partial<Config>");
	});

	it("should create types file when createCustomTypes is true", async () => {
		const mockInquirer = await import("inquirer");
		vi.spyOn(mockInquirer.default, "prompt").mockResolvedValue({
			createCustomTypes: true,
		});

		await initCommand.handler({
			_: [],
			$0: "",
			force: true,
			name: "test-app",
			account: "123456789012",
			region: "us-west-2",
			profile: "test-profile",
		});

		const typesPath = join(testDir, "axiom.config.d.ts");
		expect(existsSync(typesPath)).toBe(true);

		const content = readFileSync(typesPath, "utf-8");
		expect(content).toContain("export interface CustomConfig");
	});

	it("should include custom types imports when createCustomTypes is true", async () => {
		const mockInquirer = await import("inquirer");
		vi.spyOn(mockInquirer.default, "prompt").mockResolvedValue({
			createCustomTypes: true,
		});

		await initCommand.handler({
			_: [],
			$0: "",
			force: true,
			name: "test-app",
			account: "123456789012",
			region: "us-west-2",
			profile: "test-profile",
		});

		const configPath = join(testDir, ".axiom.ts");
		const content = readFileSync(configPath, "utf-8");
		expect(content).toContain("import type { CustomConfig } from");
		expect(content).toContain("type AxiomConfig = Config & CustomConfig");
		expect(content).toContain("const config: AxiomConfig");
	});

	it("should not create types file when createCustomTypes is false", async () => {
		const mockInquirer = await import("inquirer");
		vi.spyOn(mockInquirer.default, "prompt").mockResolvedValue({
			createCustomTypes: false,
		});

		await initCommand.handler({
			_: [],
			$0: "",
			force: true,
			name: "test-app",
			account: "123456789012",
			region: "us-west-2",
			profile: "test-profile",
		});

		const typesPath = join(testDir, "axiom.config.d.ts");
		expect(existsSync(typesPath)).toBe(false);
	});

	it("should exit with error if config files already exist and force is not set", async () => {
		const mockInquirer = await import("inquirer");
		vi.spyOn(mockInquirer.default, "prompt").mockResolvedValue({
			createCustomTypes: false,
		});

		// Create files first time
		await initCommand.handler({
			_: [],
			$0: "",
			force: true,
			name: "test-app",
			account: "123456789012",
			region: "us-west-2",
			profile: "test-profile",
		});

		// Mock process.exit
		const exitSpy = vi
			.spyOn(process, "exit")
			.mockImplementation(() => undefined as never);
		const consoleErrorSpy = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});

		// Try to create again without force
		await initCommand.handler({
			_: [],
			$0: "",
			force: false,
			name: "test-app",
			account: "123456789012",
			region: "us-west-2",
			profile: "test-profile",
		});

		expect(exitSpy).toHaveBeenCalledWith(1);
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			expect.stringContaining("Config files already exist"),
		);
	});

	it("should use CLI args instead of prompting when provided", async () => {
		const mockInquirer = await import("inquirer");
		const promptSpy = vi
			.spyOn(mockInquirer.default, "prompt")
			.mockResolvedValue({
				createCustomTypes: true,
			});

		await initCommand.handler({
			_: [],
			$0: "",
			force: true,
			name: "cli-app",
			account: "999888777666",
			region: "eu-west-1",
			profile: "production",
		});

		// Verify prompts were called but only for createCustomTypes
		expect(promptSpy).toHaveBeenCalled();
		const promptCalls = promptSpy.mock.calls[0][0];
		// Should only prompt for createCustomTypes, not for other fields
		expect(
			promptCalls.filter(
				(q: { when: boolean | (() => boolean) }) =>
					typeof q.when === "function" && q.when(),
			).length,
		).toBe(0);
	});

	it("should validate AWS account ID format", async () => {
		const mockInquirer = await import("inquirer");
		const promptSpy = vi
			.spyOn(mockInquirer.default, "prompt")
			.mockResolvedValue({
				account: "123456789012",
				createCustomTypes: false,
			});

		await initCommand.handler({
			_: [],
			$0: "",
			force: true,
			name: "test-app",
			// No account provided - should prompt
			region: "us-west-2",
			profile: "test-profile",
		});

		expect(promptSpy).toHaveBeenCalled();
		const accountPrompt = promptSpy.mock.calls[0][0].find(
			(q: { name: string }) => q.name === "account",
		);
		expect(accountPrompt?.validate).toBeDefined();

		// Test validator
		expect(accountPrompt.validate("123456789012")).toBe(true);
		expect(accountPrompt.validate("12345")).toBe(
			"AWS account ID must be 12 digits",
		);
		expect(accountPrompt.validate("abcd12345678")).toBe(
			"AWS account ID must be 12 digits",
		);
	});
});
