import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import inquirer from "inquirer";
import type {
	ArgumentsCamelCase,
	Argv,
	CommandBuilder,
	CommandModule,
} from "yargs";
import { debug } from "../debug";

interface InitOptions {
	force?: boolean;
	name?: string;
	account?: string;
	region?: string;
	profile?: string;
	customTypes?: boolean;
}

export class Init<U extends InitOptions> implements CommandModule<object, U> {
	public command = "init";
	public describe = "Initialize Axiom configuration files";

	public builder: CommandBuilder<object, U> = (args: Argv): Argv<U> => {
		args
			.option("force", {
				alias: "f",
				type: "boolean",
				description: "Overwrite existing config files",
				default: false,
			})
			.option("name", {
				type: "string",
				description: "Project name",
			})
			.option("account", {
				type: "string",
				description: "AWS account ID",
			})
			.option("region", {
				type: "string",
				description: "AWS region",
			})
			.option("profile", {
				type: "string",
				description: "AWS profile name",
			})
			.option("custom-types", {
				type: "boolean",
				description: "Create custom types file for extending config",
			});
		return args as unknown as Argv<U>;
	};

	public handler = async (args: ArgumentsCamelCase<U>) => {
		debug(`Init command handler called with args: ${JSON.stringify(args)}`);

		const cwd = process.cwd();

		// Ensure the target directory exists
		if (!existsSync(cwd)) {
			mkdirSync(cwd, { recursive: true });
		}

		const configPath = join(cwd, ".axiom.ts");
		const devConfigPath = join(cwd, ".axiom.dev.ts");
		const typesPath = join(cwd, "axiom.config.d.ts");

		// Check if files already exist
		if (!args.force) {
			const existingFiles: string[] = [];
			if (existsSync(configPath)) existingFiles.push(".axiom.ts");
			if (existsSync(devConfigPath)) existingFiles.push(".axiom.dev.ts");
			if (existsSync(typesPath)) existingFiles.push("axiom.config.d.ts");

			if (existingFiles.length > 0) {
				console.error(
					`❌ Config files already exist: ${existingFiles.join(", ")}`,
				);
				console.error("   Use --force to overwrite them.");
				process.exit(1);
			}
		}

		// Gather information from user
		const answers = await inquirer.prompt([
			{
				type: "input",
				name: "name",
				message: "Project name:",
				default: args.name || "my-app",
				when: !args.name,
			},
			{
				type: "input",
				name: "account",
				message: "AWS account ID:",
				default: args.account || "123456789012",
				when: !args.account,
				validate: (input: string) => {
					if (/^\d{12}$/.test(input)) return true;
					return "AWS account ID must be 12 digits";
				},
			},
			{
				type: "input",
				name: "region",
				message: "AWS region:",
				default: args.region || "us-east-1",
				when: !args.region,
			},
			{
				type: "input",
				name: "profile",
				message: "AWS profile name:",
				default: args.profile || "default",
				when: !args.profile,
			},
			{
				type: "confirm",
				name: "createCustomTypes",
				message: "Would you like to add custom config properties?",
				default: true,
				when: args.customTypes === undefined,
			},
		]);

		// Merge CLI args with prompt answers
		const config = {
			name: args.name || answers.name,
			account: args.account || answers.account,
			region: args.region || answers.region,
			profile: args.profile || answers.profile,
			createCustomTypes:
				args.customTypes !== undefined
					? args.customTypes
					: answers.createCustomTypes,
		};

		debug(`Creating config files with config: ${JSON.stringify(config)}`);

		// Create TypeScript types file if user wants custom properties
		if (config.createCustomTypes) {
			const typesContent = this.generateTypesFile();
			writeFileSync(typesPath, typesContent);
			console.log(`✅ Created ${typesPath}`);
			debug(`Created types file: ${typesPath}`);
		}

		// Create base config file (.axiom.ts)
		const baseConfigContent = this.generateBaseConfig(
			config,
			config.createCustomTypes,
		);
		writeFileSync(configPath, baseConfigContent);
		console.log(`✅ Created ${configPath}`);
		debug(`Created base config: ${configPath}`);

		// Create dev config file (.axiom.dev.ts)
		const devConfigContent = this.generateDevConfig(config.createCustomTypes);
		writeFileSync(devConfigPath, devConfigContent);
		console.log(`✅ Created ${devConfigPath}`);
		debug(`Created dev config: ${devConfigPath}`);

		console.log("\n🎉 Axiom configuration initialized successfully!");
		console.log("\n📝 Next steps:");
		console.log("   1. Edit .axiom.ts to customize your base configuration");
		console.log(
			"   2. Edit .axiom.dev.ts to customize your development configuration",
		);
		if (config.createCustomTypes) {
			console.log(
				"   3. Edit axiom.config.d.ts to add your custom config properties",
			);
		}
		console.log(
			`   ${config.createCustomTypes ? "4" : "3"}. Run 'axiom config' to verify your configuration`,
		);
	};

	private generateTypesFile(): string {
		return `/**
 * Custom Axiom Configuration Types
 *
 * Extend this interface to add custom properties to your Axiom config.
 * These properties will be type-safe when using loadConfig() in your code.
 *
 * Example:
 *
 * export interface CustomConfig {
 *   apiUrl: string;
 *   apiKey: string;
 *   maxRetries: number;
 *   features: {
 *     authentication: boolean;
 *     analytics: boolean;
 *   };
 * }
 */

export interface CustomConfig {
	// Add your custom properties here
	// Example:
	// apiUrl: string;
	// maxRetries: number;
}
`;
	}

	private generateBaseConfig(
		config: {
			name: string;
			account: string;
			region: string;
			profile: string;
		},
		hasCustomTypes: boolean,
	): string {
		const importStatement = hasCustomTypes
			? `import type { Config } from "@dsmrt/axiom-config";
import type { CustomConfig } from "./axiom.config";

type AxiomConfig = Config & CustomConfig;

const config: AxiomConfig = {`
			: `import type { Config } from "@dsmrt/axiom-config";

const config: Config = {`;

		return `${importStatement}
	name: "${config.name}",
	env: "prod",
	aws: {
		account: "${config.account}",
		region: "${config.region}",
		profile: "${config.profile}",
	},
	baseParameterPath: "/${config.name}/prod",${
		hasCustomTypes
			? `

	// Add your custom config properties here
	// Example:
	// apiUrl: "https://api.example.com",
	// maxRetries: 3,`
			: ""
	}
};

export default config;
`;
	}

	private generateDevConfig(hasCustomTypes: boolean): string {
		const importStatement = hasCustomTypes
			? `import type { Config } from "@dsmrt/axiom-config";
import type { CustomConfig } from "./axiom.config";

type AxiomConfig = Config & CustomConfig;

const config: Partial<AxiomConfig> = {`
			: `import type { Config } from "@dsmrt/axiom-config";

const config: Partial<Config> = {`;

		return `${importStatement}
	env: "dev",
	baseParameterPath: undefined, // Will be auto-generated as /{name}/dev${
		hasCustomTypes
			? `,

	// Override custom config properties for dev environment
	// Example:
	// apiUrl: "https://api.dev.example.com",`
			: ""
	}
};

export default config;
`;
	}

}
