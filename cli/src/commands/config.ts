import { CommandModule, Argv, ArgumentsCamelCase } from 'yargs'
import { loadConfig } from 'axiom-config'

interface ConfigOptions {
    env: string;
}

export class Config<U extends ConfigOptions> implements CommandModule<object, U> {
  public command = 'config'
  public describe = 'print the config'

  public builder = (args: Argv): Argv<U> => {
    return args as unknown as Argv<U>
  }

  public handler = async (args: ArgumentsCamelCase<U>) => {

    const config = loadConfig({ env: args.env })

    console.log(config)
  }
}
