import { loadConfig } from "@dsmrt/axiom-config";
import type {
	ArgumentsCamelCase,
	Argv,
	CommandBuilder,
	CommandModule,
} from "yargs";
import { debug } from "../debug";

interface ConfigOptions {
	env: string;
}

export class Config<U extends ConfigOptions>
	implements CommandModule<object, U>
{
	public command = "config";
	public describe = "print the config";

	public builder?: CommandBuilder<object, U> | undefined = (
		args: Argv,
	): Argv<U> => {
		args.option("env", {
			type: "string",
		});
		return args as unknown as Argv<U>;
	};

	public handler = async (args: ArgumentsCamelCase<U>) => {
		debug(`Config command handler called with env: ${args.env}`);
		const config = await this.loadConfig(args);
		debug(`Config loaded successfully, outputting as JSON`);
		console.log(JSON.stringify(config));
	};

	public loadConfig = async (args: ConfigOptions) => {
		debug(`Loading config with env: ${args.env}`);
		return loadConfig(args);
	};
}
