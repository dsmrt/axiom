import { CommandModule, Argv, ArgumentsCamelCase } from "yargs";
import { loadConfig, AwsConfigs } from "@dsmrt/axiom-config";
import inquirer from "inquirer";
import {
  SSMClient,
  PutParameterCommand,
  ParameterType,
} from "@aws-sdk/client-ssm";
import { CachedCredentialProvider } from "../../aws/credentials-provider";
import { awsOptions, commonOptions } from "../../options";
import chalk from "chalk";
import { buildPath } from "./utils";

interface Options extends AwsConfigs {
  env: string;
  path: string;
  value: string;
  force: boolean;
  secure: boolean;
  overwrite: boolean;
}

export class SetCommand<U extends Options> implements CommandModule<object, U> {
  public command = "set <path> <value>";
  public describe = "Set all parameters under the base path";

  public builder = (args: Argv): Argv<U> => {
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
      })
      .demandOption("path", "Path is required");
    args
      .positional("value", {
        type: "string",
        demandOption: "value is required",
      })
      .demandOption("value", "Value is required");
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

    return commonOptions(awsOptions(args)) as unknown as Argv<U>;
  };

  public handler = async (args: ArgumentsCamelCase<U>) => {
    const config = loadConfig({ env: args.env });

    if (args.force !== true) {
      const res = await inquirer.prompt({
        type: "confirm",
        name: "setParam",
        message: `Are you sure you want to set '${args.path}'?`,
      });

      if (!res.setParam) {
        console.log("Doing nothing.");
        return;
      }
    }

    const client = new SSMClient({
      region: config.aws.region,
      credentials: await CachedCredentialProvider(config.aws),
    });

    const params = await client.send(
      new PutParameterCommand({
        Name: buildPath(config, args.path),
        Value: args.value,
        Type: args.secure ? ParameterType.SECURE_STRING : ParameterType.STRING,
        Overwrite: args.overwrite,
      }),
    );

    console.log(chalk.green("Version: "), chalk.white.bold(params.Version));
  };
}
