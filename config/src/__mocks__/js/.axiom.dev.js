/**
 * @type {import("../../index").Config}
 */
const config = {
  name: "my-prod-app",
  env: "dev",
  aws: {
    account: "dev-account",
    profile: "dev-profile",
  },
};

module.exports = config;
