import { CommandModule, Argv, ArgumentsCamelCase } from 'yargs'
import { DeleteCommand, GetCommand, SetCommand } from '.'


interface Options {}

export class ParamsCommand<U extends Options> implements CommandModule<{}, U> {
  public command = 'params'
  public describe = 'Manage SSM parameters'

  builder = (args: Argv): Argv<U> => {
    args.demandCommand()
      .command(
        new GetCommand
      )
      .command(
        new SetCommand
      )
      .command(
        new DeleteCommand
      )
    return args as unknown as Argv<U>
  }
  public handler = async (args: ArgumentsCamelCase<U>) => {
    // Is this needed?
    console.log("👍")
  }
}
