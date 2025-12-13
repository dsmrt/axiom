import { fromNodeProviderChain } from "@aws-sdk/credential-providers";
import {
  AssumeRoleCommand,
  STSClient,
  type Credentials as AssumeRoleResponseCreds,
  type AssumeRoleCommandInput,
} from "@aws-sdk/client-sts";
import type {
  AwsCredentialIdentity,
  AwsCredentialIdentityProvider,
} from "@aws-sdk/types";
import type { AwsConfigs } from "@dsmrt/axiom-config";
import inquirer from "inquirer";
import Cache from "../cache";

const CACHE_KEY_PREFIX = "axiom#aws-credentials";
const cache = new Cache();

export const returnCredentialsFromAssumerole = (
  creds: AssumeRoleResponseCreds,
): {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
} => {
  return {
    accessKeyId: `${creds.AccessKeyId}`,
    secretAccessKey: `${creds.SecretAccessKey}`,
    sessionToken: `${creds.SessionToken}`,
  };
};

const CachedCredentialViaProfileAndRegion = async (
  profile: string,
  region?: string,
): Promise<AwsCredentialIdentityProvider> => {
  const cacheKeyName = `${CACHE_KEY_PREFIX}#${profile}`;

  // check if there's a cache
  const creds = cache.get<AssumeRoleResponseCreds>(cacheKeyName);

  // return the cache if there's something there
  if (creds !== undefined) {
    return async () => returnCredentialsFromAssumerole(creds);
  }

  // else return
  return fromNodeProviderChain({
    profile,
    roleAssumer: roleAssumerCallable({
      region: region ?? "us-east-1",
      cacheKeyName: cacheKeyName,
    }),
    mfaCodeProvider,
  });
};

export const roleAssumerCallable = (config: {
  region: string;
  cacheKeyName: string;
}) => {
  return async (
    sourceCreds: AwsCredentialIdentity,
    params: AssumeRoleCommandInput,
  ): Promise<AwsCredentialIdentity> => {
    const command = new AssumeRoleCommand(params);

    const client = new STSClient({
      region: config.region,
      credentials: sourceCreds,
    });

    const result = await client.send(command);
    const creds = result.Credentials;
    if (
      creds === undefined ||
      creds?.AccessKeyId === undefined ||
      creds?.SecretAccessKey === undefined ||
      creds?.SessionToken === undefined
    ) {
      throw new Error("Unable to fetch credentials.");
    }

    // set cache
    cache.set(config.cacheKeyName, creds, creds.Expiration);

    return returnCredentialsFromAssumerole(creds);
  };
};

export const mfaCodeProvider = async (mfaSerial: string) => {
  // return mfaSerial
  const mfaCode = await inquirer.prompt({
    name: "code",
    message: `Enter MFA code for ${mfaSerial}: `,
    type: "password",
  });
  return mfaCode.code;
};

const CachedCredentialProvider = (
  config: AwsConfigs,
): Promise<AwsCredentialIdentityProvider> => {
  return CachedCredentialViaProfileAndRegion(config.profile, config.region);
};

export default CachedCredentialViaProfileAndRegion;
export { CachedCredentialProvider };
