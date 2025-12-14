import {
	ParameterType,
	PutParameterCommand,
	SSMClient,
} from "@aws-sdk/client-ssm";
import { type AwsConfigs, loadConfig } from "@dsmrt/axiom-config";
import chalk from "chalk";
import inquirer from "inquirer";
import type { ArgumentsCamelCase, Argv, CommandModule } from "yargs";
import { CachedCredentialProvider } from "../../aws/credentials-provider";
import { awsOptions, commonOptions } from "../../options";
import { buildPath } from "./utils";
import { debug } from "../../debug";

export interface SetOptions extends AwsConfigs {
	env: string;
	path: string;
	value: string;
	force: boolean;
	secure: boolean;
	overwrite: boolean;
}

export class SetCommand<U extends SetOptions>
	implements CommandModule<object, U>
{
	public command = "set <path> <value>";
	public describe = "Set all parameters under the base path";

	public builder = (args: Argv): Argv<U> => {
		// Note: builder must be synchronous, so we can't await here
		// The config loading will happen in the handler
		args.positional("path", {
			type: "string",
			describe:
				`Path to parameter. Supports absolute and relative paths.` +
				`\nExample: "/root/myParam" or "service/secret"`,
		});
		args.demandOption("path", "Path is required");
		args.positional("value", {
			type: "string",
		});
		args.demandOption("value", "Value is required");
		args.option("force", {
			boolean: true,
			default: false,
			describe: "force set parameter without prompt",
			alias: "f",
		});
		args.option("secure", {
			boolean: true,
			default: true,
			describe: "Save parameter as a secure string",
		});
		args.option("overwrite", {
			boolean: true,
			default: true,
			describe: "Overwrite parameter if it already exists",
		});

		return args.options({
			...commonOptions(),
			...awsOptions(),
		}) as unknown as Argv<U>;
	};

	public handler = async (args: ArgumentsCamelCase<U>) => {
		debug(
			`Set command handler called with path: ${args.path}, secure: ${args.secure}, overwrite: ${args.overwrite}, force: ${args.force}`,
		);

		const config = await loadConfig({ env: args.env });
		debug(
			`Config loaded successfully, base parameter path: ${config.aws?.baseParameterPath}`,
		);

		const fullPath = buildPath(config, args.path);
		debug(`Full parameter path: ${fullPath}`);

		if (args.force !== true) {
			debug(`Prompting user for confirmation...`);
			const res = await inquirer.prompt({
				type: "confirm",
				name: "setParam",
				message: `Are you sure you want to set '${args.path}'?`,
			});

			if (!res.setParam) {
				debug(`User declined, aborting`);
				console.log("Doing nothing.");
				return;
			}
			debug(`User confirmed`);
		} else {
			debug(`Force flag set, skipping confirmation`);
		}

		debug(
			`Creating SSM client with region: ${config.aws.region}, profile: ${config.aws.profile}`,
		);
		const client = new SSMClient({
			region: config.aws.region,
			credentials: await CachedCredentialProvider(config.aws),
		});

		debug(
			`Sending parameter to SSM with type: ${args.secure ? "SecureString" : "String"}`,
		);
		const params = await client.send(
			new PutParameterCommand({
				Name: fullPath,
				Value: args.value,
				Type: args.secure ? ParameterType.SECURE_STRING : ParameterType.STRING,
				Overwrite: args.overwrite,
			}),
		);

		debug(`Parameter set successfully, version: ${params.Version}`);
		console.log(chalk.green("Version: "), chalk.white.bold(params.Version));
	};
}
