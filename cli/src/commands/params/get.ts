import { CommandModule, Argv, ArgumentsCamelCase } from 'yargs'
import { loadConfig, AwsConfigs } from 'axiom-config'
import { ParameterCollection } from 'axiom-aws-sdk'
import { SSMClient, Parameter } from '@aws-sdk/client-ssm'
import { CachedCredentialProvider } from '../../aws/credentials-provider'
import { awsOptions, commonOptions } from '../../options'
import { buildPath } from './utils'
import chalk from 'chalk'


interface Options extends AwsConfigs {
    env: string;
    path: string;
}

export class GetCommand<U extends Options> implements CommandModule<{}, U> {
  public command = 'get [path]'
  public describe = 'Get all parameters under the base path'

  public builder = (args: Argv): Argv<U> => {
    const config = loadConfig()
    args = commonOptions(awsOptions(args))
    args.positional('path', {
      type: 'string',
      describe: `OPTIONAL path to parameter. Supports absolute and relative paths.` +
        // @ts-ignore
        `\nExample: "/root/myParam" or "service/secret" (which translates to, "${buildPath(config as Option & Config, "service/secret")})`,
      // default: config.awsSsmParameterPath,
    })

    return args as unknown as Argv<U>
  }

  public handler = async (args: ArgumentsCamelCase<U>) => {

    const config = loadConfig({ env: args.env })

    const collection = new ParameterCollection(
        config.aws?.baseParameterPath,
        new SSMClient({
            region: config.aws.region,
            credentials: await CachedCredentialProvider({
                profile: config.aws.profile,
                region: config.aws.region,
                baseParameterPath: config.aws.baseParameterPath,
                account: config.aws.account,
            })
        })
    )

    const params = await collection.get()

    params.forEach((parameter: Parameter, key: string | number) => {
      console.log(
        chalk.gray(
          parameter.Name?.replace(/\/([^/]+)$/, '/' + chalk.bold.green('$1'))
        ),
        chalk.bold.white(
          parameter.Value
        )
      )
    });

  }
}

