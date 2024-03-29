import { Config } from "../..";

const config: Config = {
  name: "my-prod-app",
  env: "dev",
  aws: {
    account: "dev-account",
    profile: "dev-profile",
    region: "us-east-1",
    baseParameterPath: "/dev-path",
  },
};

export default config;
