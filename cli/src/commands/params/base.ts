import { CommandModule, Argv } from "yargs";
import { DeleteCommand, GetCommand, SetCommand } from ".";

interface Options {}

export class ParamsCommand<U extends Options>
  implements CommandModule<object, U>
{
  public command = "params";
  public describe = "Manage SSM parameters";

  builder = (args: Argv): Argv<U> => {
    args
      .demandCommand()
      .command(new GetCommand())
      .command(new SetCommand())
      .command(new DeleteCommand());
    return args as unknown as Argv<U>;
  };
  public handler = async () => {
    // Is this needed?
    console.log("👍");
  };
}
