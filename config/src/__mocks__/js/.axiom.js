/**
 * @type {import("../../index").Config}
 */
const config = {
    name: "my-prod-app", 
    env: "prod", 
    aws: {
        account: "prod-account",
        profile: "prod-profile",
        region: "us-east-1",
        baseParameterPath: "/prod-path"
    }
};
module.exports = config;
