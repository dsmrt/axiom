import { Options } from "yargs";

export const commonOptions = (): { [key: string]: Options } => {
  return {
    env: {
      string: true,
      desc: "Environment name like, prod, staging, dev, etc.",
    },
  };
};

export const awsOptions = (): { [key: string]: Options } => {
  return {
    account: {
      string: true,
      desc: "AWS Account number like, 1243944546",
    },
    region: {
      string: true,
      desc: "AWS region like, us-east-1",
    },
    profile: {
      string: true,
      desc: "AWS configured profile",
    },
    baseParameterPath: {
      string: true,
      desc: "SSM parameter path base where configs like secrets and infrastucture managed items are set",
    },
  };
};
