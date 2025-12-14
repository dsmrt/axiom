import { type Parameter, SSMClient } from "@aws-sdk/client-ssm";
import { ParameterCollection } from "@dsmrt/axiom-aws-sdk";
import { loadConfig } from "@dsmrt/axiom-config";
import chalk from "chalk";
import type { ArgumentsCamelCase, Argv, CommandModule } from "yargs";
import { CachedCredentialProvider } from "../../aws/credentials-provider";
import { awsOptions, commonOptions } from "../../options";
import { debug } from "../../debug";

export interface GetOptions {
	env: string;
	path: string;
}

export class GetCommand<U extends GetOptions>
	implements CommandModule<object, U>
{
	public command = "get [path]";
	public describe = "Get all parameters under the base path";

	public builder = (args: Argv): Argv<U> => {
		// Note: builder must be synchronous, so we can't await here
		// The config loading will happen in the handler
		args.options({ ...commonOptions(), ...awsOptions() });
		args.positional("path", {
			type: "string",
			describe:
				`OPTIONAL path to parameter. Supports absolute and relative paths.\n` +
				`Example:\n\t"/root/myParam" or "service/secret"`,
		});

		return args as unknown as Argv<U>;
	};

	public handler = async (args: ArgumentsCamelCase<U>) => {
		debug(`Get command handler called with env: ${args.env}, path: ${args.path}`);

		const config = await loadConfig({ env: args.env });
		debug(`Config loaded successfully, base parameter path: ${config.aws?.baseParameterPath}`);

		debug(`Creating SSM client with region: ${config.aws.region}, profile: ${config.aws.profile}`);
		const collection = new ParameterCollection(
			config.aws?.baseParameterPath,
			new SSMClient({
				region: config.aws.region,
				credentials: await CachedCredentialProvider({
					profile: config.aws.profile,
					region: config.aws.region,
					baseParameterPath: config.aws.baseParameterPath,
					account: config.aws.account,
				}),
			}),
		);

		debug(`Fetching parameters from SSM...`);
		const params = await collection.get();
		debug(`Retrieved ${params.size} parameters`);

		params.forEach((parameter: Parameter) => {
			console.log(
				chalk.gray(
					parameter.Name?.replace(/\/([^/]+)$/, `/${chalk.bold.green("$1")}`),
				),
				chalk.bold.white(parameter.Value),
			);
		});
	};
}
