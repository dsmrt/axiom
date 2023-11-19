import { CommandModule, Argv, ArgumentsCamelCase } from 'yargs'
import { loadConfig, AwsConfigs } from 'axiom-config'
import { ParameterCollection } from 'axiom-aws-sdk'
import { SSMClient } from '@aws-sdk/client-ssm'
import { CachedCredentialProvider } from '../../aws/credentials-provider.ts'
import { awsOptions, commonOptions } from '../../options.ts'


interface Options extends AwsConfigs {
    env: string;
}

export class Get<U extends Options> implements CommandModule<{}, U> {
  public command = 'config'
  public describe = 'print the config'

  public builder = (args: Argv): Argv<U> => {
    return commonOptions(awsOptions(args)) as unknown as Argv<U>
  }

  public handler = async (args: ArgumentsCamelCase<U>) => {

    const config = loadConfig({ env: args.env })

    const params = new ParameterCollection(
        args.baseParameterPath,
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

    const result = Array.from(params.map).map((param) => {
        return { name: param[0], value: param[1] }
    })

    console.table(result)
  }
}

