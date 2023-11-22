import { fromNodeProviderChain } from "@aws-sdk/credential-providers";
import {
  AssumeRoleCommand,
  STSClient,
  Credentials as AssumeRoleResponseCreds,
  AssumeRoleCommandInput,
} from "@aws-sdk/client-sts";
import {
  AwsCredentialIdentity,
  AwsCredentialIdentityProvider,
} from "@aws-sdk/types";
import { AwsConfigs } from "axiom-config";
import inquirer from "inquirer";
import Cache from "../cache";

const CACHE_KEY_PREFIX = "axiom#aws-credentials";
const cache = new Cache();

const CachedCredentialViaProfileAndRegion = async (
  profile: string,
  region?: string,
): Promise<AwsCredentialIdentityProvider> => {
  const cacheKeyName = `${CACHE_KEY_PREFIX}#${profile}`;

  // check if there's a cache
  const creds = cache.get<AssumeRoleResponseCreds>(cacheKeyName);

  // return the cache if there's something there
  if (creds !== undefined) {
    return async () => {
      return {
        accessKeyId: `${creds.AccessKeyId}`,
        secretAccessKey: `${creds.SecretAccessKey}`,
        sessionToken: `${creds.SessionToken}`,
      };
    };
  }

  // else return
  return fromNodeProviderChain({
    profile,
    roleAssumer: async (
      sourceCreds: AwsCredentialIdentity,
      params: AssumeRoleCommandInput,
    ): Promise<AwsCredentialIdentity> => {
      const command = new AssumeRoleCommand(params);

      const client = new STSClient({
        region: region ?? "us-east-1",
        credentials: sourceCreds,
      });

      const result = await client.send(command);
      if (
        result?.Credentials?.AccessKeyId === undefined ||
        result?.Credentials?.SecretAccessKey === undefined ||
        result?.Credentials?.SessionToken === undefined
      ) {
        throw new Error("Unable to fetch credentials.");
      }

      // set cache
      cache.set(
        cacheKeyName,
        result.Credentials,
        result.Credentials.Expiration,
      );

      return {
        accessKeyId: result.Credentials.AccessKeyId,
        secretAccessKey: result.Credentials.SecretAccessKey,
        sessionToken: result.Credentials.SessionToken,
      };
    },
    mfaCodeProvider: async (mfaSerial: string) => {
      // return mfaSerial
      const mfaCode = await inquirer.prompt({
        name: "code",
        message: `Enter MFA code for ${mfaSerial}: `,
        type: "password",
      });
      return mfaCode.code;
    },
  });
};

const CachedCredentialProvider = (
  config: AwsConfigs,
): Promise<AwsCredentialIdentityProvider> => {
  return CachedCredentialViaProfileAndRegion(config.profile, config.region);
};

export default CachedCredentialViaProfileAndRegion;
export { CachedCredentialProvider };
