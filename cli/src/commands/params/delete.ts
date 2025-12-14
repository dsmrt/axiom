import { DeleteParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { type Config, loadConfig } from "@dsmrt/axiom-config";
import inquirer from "inquirer";
import type { ArgumentsCamelCase, Argv, CommandModule } from "yargs";
import { CachedCredentialProvider } from "../../aws/credentials-provider";
import { buildPath } from "./utils";
import { debug } from "../../debug";

const log = console.log;
type Path = string;

export interface DeleteOptions {
	path?: Path;
	force: boolean;
}

type config = Config & DeleteOptions;

export class DeleteCommand<U extends config>
	implements CommandModule<object, U>
{
	public command = "delete <path>";
	public describe = "Delete SSM parameters";

	protected client: SSMClient | undefined;
	builder = (args: Argv): Argv<U> => {
		// Note: builder must be synchronous, so we can't await here
		// The config loading will happen in the handler
		args
			.positional("path", {
				type: "string",
				describe:
					`Path to parameter. Supports absolute and relative paths.` +
					`\nExample: "/root/myParam" or "service/secret"`,
				demandOption: true,
			})
			.demandOption("path", "Path is required");
		args.option("force", {
			boolean: true,
			default: false,
			describe: "force delete parameter without prompt",
			alias: "f",
		});
		return args as unknown as Argv<U>;
	};

	public handler = async (args: ArgumentsCamelCase<U>) => {
		debug(`Delete command handler called with path: ${args.path}, force: ${args.force}`);

		const config = await loadConfig({ env: args.env });
		debug(`Config loaded successfully, base parameter path: ${config.aws?.baseParameterPath}`);

		const path = buildPath(args, args.path);
		debug(`Full parameter path: ${path}`);

		debug(`Creating SSM client with region: ${config.aws?.region}, profile: ${config.aws?.profile}`);
		const client = new SSMClient({
			region: config.aws?.region,
			credentials: await CachedCredentialProvider(config.aws),
		});

		if (path === args.aws.baseParameterPath) {
			debug(`Delete blocked: path matches base parameter path`);
			throw new Error(
				`Deleting the path (path: ${path}) that matches the base path (awsSsmParameterPath: ${args.awsSsmParameterPath}) is prohibited.`,
			);
		}

		if (args.force !== true) {
			debug(`Prompting user for confirmation...`);
			const res = await inquirer.prompt({
				type: "confirm",
				name: "delete",
				message: `Are you sure you want to delete '${path}'?`,
			});

			if (!res.delete) {
				debug(`User declined, aborting`);
				log("Doing nothing.");
				return;
			}
			debug(`User confirmed`);
		} else {
			debug(`Force flag set, skipping confirmation`);
		}

		debug(`Sending delete command to SSM for: ${path}`);
		await client.send(
			new DeleteParameterCommand({
				Name: path,
			}),
		);

		debug(`Parameter deleted successfully`);
		log("👍");
	};
}
