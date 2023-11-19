import { Argv, } from 'yargs'

export const commonOptions = (args: Argv): Argv => {
    args.option("env", {
        string: true,
        desc: "Environment name like, prod, staging, dev, etc."
    });

    return args;
}

export const awsOptions = (args: Argv): Argv => {
    args.option("account", {
        string: true,
        desc: "AWS Account number like, 1243944546"
    })
    args.option("region", {
        string: true,
        desc: "AWS region number like, us-east-1"
    })
    args.option("profile", {
        string: true,
        desc: "AWS configured profile"
    })
    args.option("baseParameterPath", {
        string: true,
        desc: "SSM parameter path base where configs like secrets and infrastucture managed items are set"
    })

    return args;
}
