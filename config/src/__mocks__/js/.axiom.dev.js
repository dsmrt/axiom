/**
 * @type {import("../../index").Config}
 */
const config = {
  name: "my-prod-app",
  env: "dev",
  aws: {
    account: "dev-account",
    profile: "dev-profile",
    region: "us-north-1",
    baseParameterPath: "/dev-path",
  },
};

module.exports = config;
