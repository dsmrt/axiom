import { CommandModule, Argv, ArgumentsCamelCase } from "yargs";
import { loadConfig } from "@dsmrt/axiom-config";
import { ParameterCollection } from "@dsmrt/axiom-aws-sdk";
import { SSMClient, Parameter } from "@aws-sdk/client-ssm";
import { CachedCredentialProvider } from "../../aws/credentials-provider";
import { awsOptions, commonOptions } from "../../options";
import { buildPath } from "./utils";
import chalk from "chalk";

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
    const config = loadConfig();
    args.options({ ...commonOptions(), ...awsOptions() });
    args.positional("path", {
      type: "string",
      describe:
        `OPTIONAL path to parameter. Supports absolute and relative paths.` +
        `\nExample: "/root/myParam" or "service/secret" (which translates to, "${buildPath(
          config,
          "service/secret",
        )})`,
      // default: config.awsSsmParameterPath,
    });

    return args as unknown as Argv<U>;
  };

  public handler = async (args: ArgumentsCamelCase<U>) => {
    const config = loadConfig({ env: args.env });

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

    const params = await collection.get();

    params.forEach((parameter: Parameter) => {
      console.log(
        chalk.gray(
          parameter.Name?.replace(/\/([^/]+)$/, "/" + chalk.bold.green("$1")),
        ),
        chalk.bold.white(parameter.Value),
      );
    });
  };
}
