import { Config } from "../..";

const config: Config = {
  name: "my-prod-app",
  env: "prod",
  aws: {
    account: "prod-account",
    profile: "prod-profile",
    region: "us-east-1",
    baseParameterPath: "/prod-path",
  },
};

export default config;
