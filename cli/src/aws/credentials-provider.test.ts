import { vi, describe, expect, it } from "vitest";
import {
	returnCredentialsFromAssumerole,
	roleAssumerCallable,
	mfaCodeProvider,
} from "./credentials-provider";
import { mockClient } from "aws-sdk-client-mock";
import { AssumeRoleCommand, STSClient } from "@aws-sdk/client-sts";

vi.mock("../cache", () => {
	return {
		default: class {
			set = vi.fn(() => {});
			get = vi.fn(() => undefined);
		},
	};
});

vi.mock("inquirer", () => {
	return {
		default: {
			prompt: vi.fn(async () => {
				return {
					code: "1234",
				};
			}),
		},
	};
});

describe("return values", () => {
	it("test handler", async () => {
		const result = returnCredentialsFromAssumerole({
			AccessKeyId: "KEY_ID",
			SessionToken: "TOKEN",
			SecretAccessKey: "SECRET_KEY",
			Expiration: new Date(),
		});
		expect(result.accessKeyId).toBe("KEY_ID");
		expect(result.sessionToken).toBe("TOKEN");
		expect(result.secretAccessKey).toBe("SECRET_KEY");
	});
	it("test handler role assumer", async () => {
		const ssmClientMock = mockClient(STSClient);
		ssmClientMock.on(AssumeRoleCommand).resolves({
			Credentials: {
				AccessKeyId: "KEY_ID",
				SessionToken: "TOKEN",
				SecretAccessKey: "SECRET_KEY",
				Expiration: new Date(),
			},
		});

		const roleAssumer = roleAssumerCallable({
			cacheKeyName: "CACHE_NAME",
			region: "us-east-1",
		});
		const t = await roleAssumer(
			{
				accessKeyId: "KEY_ID",
				secretAccessKey: "KEY_ID",
			},
			{
				RoleArn: "ROLE_ARN",
				RoleSessionName: "ROLE_SESSION_NAME",
			},
		);

		expect(t.accessKeyId).toBe("KEY_ID");
		expect(t.sessionToken).toBe("TOKEN");
		expect(t.secretAccessKey).toBe("SECRET_KEY");
	});
	it("test mfa cli function", async () => {
		const mfa = await mfaCodeProvider("SERIAL");
		expect(mfa).toBe("1234");
	});
});
