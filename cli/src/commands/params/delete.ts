import { CommandModule, Argv, ArgumentsCamelCase } from "yargs";
import { Config, loadConfig } from "@dsmrt/axiom-config";
import inquirer from "inquirer";
import { SSMClient, DeleteParameterCommand } from "@aws-sdk/client-ssm";
import { buildPath } from "./utils";
import { CachedCredentialProvider } from "../../aws/credentials-provider";

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
    const config = loadConfig();
    args
      .positional("path", {
        type: "string",
        describe:
          `Path to parameter. Supports absolute and relative paths.` +
          `\nExample: "/root/myParam" or "service/secret" (which translates to, "${buildPath(
            config,
            "service/secret",
          )})`,
        default: config.aws?.baseParameterPath,
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
    const config = loadConfig({ env: args.env });
    const path = buildPath(args, args.path);
    const client = new SSMClient({
      region: config.aws?.region,
      credentials: await CachedCredentialProvider(config.aws),
    });

    if (path === args.aws.baseParameterPath) {
      throw new Error(
        `Deleting the path (path: ${path}) that matches the base path (awsSsmParameterPath: ${args.awsSsmParameterPath}) is prohibited.`,
      );
    }

    if (args.force !== true) {
      const res = await inquirer.prompt({
        type: "confirm",
        name: "delete",
        message: `Are you sure you want to delete '${path}'?`,
      });

      if (!res.delete) {
        log("Doing nothing.");
        return;
      }
    }

    await client.send(
      new DeleteParameterCommand({
        Name: path,
      }),
    );

    log("👍");
  };
}
