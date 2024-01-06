import { ParameterType, GetParametersCommandOutput } from "@aws-sdk/client-ssm";

export const paramName = "/app/env";
export const result1: GetParametersCommandOutput = {
  Parameters: [
    {
      Name: `${paramName}/one`,
      Type: ParameterType.SECURE_STRING,
      Value: "one",
      Version: 1,
      // Selector: 'version', // not sure about this
      LastModifiedDate: new Date(),
      ARN: `arn:aws:ssm:12832473923:us-east-1:parameter/${paramName}/one`,
      DataType: "text",
    },
  ],
  $metadata: {},
};
