import { CommandModule, Argv, ArgumentsCamelCase } from 'yargs'
import { Get, } from './get.ts'


interface Options {}

export class ParamsCommand<U extends Options> implements CommandModule<{}, U> {
  public command = 'params'
  public describe = 'Manage SSM parameters'

  builder = (args: Argv): Argv<U> => {
    args.demandCommand()
      .command(
        new Get
      )
    return args as unknown as Argv<U>
  }
  public handler = async (args: ArgumentsCamelCase<U>) => {
    // Is this needed?
    console.log("👍")
  }
}
