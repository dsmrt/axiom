import { CommandModule, Argv, ArgumentsCamelCase, } from 'yargs'
import { Config, loadConfig } from 'axiom-config'
import inquirer from 'inquirer'
import { SSMClient, DeleteParameterCommand, } from '@aws-sdk/client-ssm'
import { buildPath } from './utils'
import { CachedCredentialProvider } from '../../aws/credentials-provider'

const log = console.log
type Path = string

interface Options {
  path?: Path
}

type config = Config & Options

export class DeleteCommand<U extends config> implements CommandModule<{}, U> {
  public command = 'delete <path>'
  public describe = 'Delete SSM parameters'

  protected client: SSMClient | undefined
  builder = (args: Argv): Argv<U> => {
    const config = loadConfig()
    args.positional('path', {
      type: 'string',
      describe: `Path to parameter. Supports absolute and relative paths.` +
        // @ts-ignore
        `\nExample: "/root/myParam" or "service/secret" (which translates to, "${buildPath(config as Option & Config, "service/secret")})`,
      default: config.aws?.baseParameterPath,
      demandOption: true
    })
      .demandOption('path', 'Path is required')
    return args as unknown as Argv<U>
  }

  public handler = async (args: ArgumentsCamelCase<U>) => {

    const config = loadConfig({ env: args.env })
    const path = buildPath(args, args.path)
    const client = new SSMClient({
        region: config.aws?.region,
        credentials: await CachedCredentialProvider(config.aws)
    })

    if (path === args.awsSsmParameterPath) {
      throw new Error(`Deleting the path (path: ${path}) that matches the base path (awsSsmParameterPath: ${args.awsSsmParameterPath}) is prohibited.`)
    }

    const res = await inquirer.prompt({
      type: "confirm",
      name: "delete",
      message: `Are you sure you want to delete '${path}'?`
    })

    if (!res.delete) {
      log(
        'Doing nothing.'
      )
      return
    }

    await client.send(
      new DeleteParameterCommand({
        Name: path,
      })
    )

    log("👍")
  }
}

