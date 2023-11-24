import { CommandModule, Argv, ArgumentsCamelCase } from "yargs";
import { loadConfig } from "@dsmrt/axiom-config";

interface ConfigOptions {
  env: string;
}

export class Config<U extends ConfigOptions>
  implements CommandModule<object, U>
{
  public command = "config";
  public describe = "print the config";

  public handler = async (args: ArgumentsCamelCase<U>) => {
    console.log(await this.loadConfig(args));
  };

  public loadConfig = async (args: ConfigOptions) => {
    return loadConfig(args);
  };
}
