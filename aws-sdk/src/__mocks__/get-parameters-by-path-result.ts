import {
  ParameterType,
  GetParametersByPathCommandOutput,
} from "@aws-sdk/client-ssm";

export const basePath = "/app/env";
export const result1ParamValue = "2222";
export const result1: GetParametersByPathCommandOutput = {
  Parameters: [
    {
      Name: `${basePath}/one`,
      Type: ParameterType.SECURE_STRING,
      Value: "one",
      Version: 1,
      // Selector: 'version', // not sure about this
      LastModifiedDate: new Date(),
      ARN: `arn:aws:ssm:12832473923:us-east-1:parameter/${basePath}/one`,
      DataType: "text",
    },
    {
      Name: `${basePath}/two`,
      Type: ParameterType.SECURE_STRING,
      Value: result1ParamValue,
      Version: 1,
      // Selector: 'version', // not sure about this
      LastModifiedDate: new Date(),
      ARN: `arn:aws:ssm:12832473923:us-east-1:parameter/${basePath}/two`,
      DataType: "text",
    },
    {
      Name: `${basePath}/three`,
      Type: ParameterType.SECURE_STRING,
      Value: "33333333333",
      Version: 1,
      // Selector: 'version', // not sure about this
      LastModifiedDate: new Date(),
      ARN: `arn:aws:ssm:12832473923:us-east-1:parameter/${basePath}/three`,
      DataType: "text",
    },
  ],
  NextToken: "klkjsfdSDfj",
  $metadata: {},
};
export const result2: GetParametersByPathCommandOutput = {
  Parameters: [
    {
      Name: `${basePath}/one2`,
      Type: ParameterType.SECURE_STRING,
      Value: "1111111111112",
      Version: 1,
      // Selector: 'version', // not sure about this
      LastModifiedDate: new Date(),
      ARN: `arn:aws:ssm:12832473923:us-east-1:parameter/${basePath}/one2`,
      DataType: "text",
    },
    {
      Name: `${basePath}/two2`,
      Type: ParameterType.SECURE_STRING,
      Value: "2222-2",
      Version: 1,
      // Selector: 'version', // not sure about this
      LastModifiedDate: new Date(),
      ARN: `arn:aws:ssm:12832473923:us-east-1:parameter/${basePath}/two2`,
      DataType: "text",
    },
    {
      Name: `${basePath}/three2`,
      Type: ParameterType.SECURE_STRING,
      Value: "333333333332",
      Version: 1,
      // Selector: 'version', // not sure about this
      LastModifiedDate: new Date(),
      ARN: `arn:aws:ssm:12832473923:us-east-1:parameter/${basePath}/three2`,
      DataType: "text",
    },
  ],
  NextToken: "klkjsfdSDfj2",
  $metadata: {},
};
export const result3: GetParametersByPathCommandOutput = {
  Parameters: [
    {
      Name: `${basePath}/one3`,
      Type: ParameterType.SECURE_STRING,
      Value: "1111111111113",
      Version: 1,
      // Selector: 'version', // not sure about this
      LastModifiedDate: new Date(),
      ARN: `arn:aws:ssm:12832473923:us-east-1:parameter/${basePath}/one3`,
      DataType: "text",
    },
    {
      Name: `${basePath}/two3`,
      Type: ParameterType.SECURE_STRING,
      Value: "22223",
      Version: 1,
      // Selector: 'version', // not sure about this
      LastModifiedDate: new Date(),
      ARN: `arn:aws:ssm:12832473923:us-east-1:parameter/${basePath}/two3`,
      DataType: "text",
    },
    {
      Name: `${basePath}/three3`,
      Type: ParameterType.SECURE_STRING,
      Value: "33333333333-3",
      Version: 1,
      // Selector: 'version', // not sure about this
      LastModifiedDate: new Date(),
      ARN: `arn:aws:ssm:12832473923:us-east-1:parameter/${basePath}/three3`,
      DataType: "text",
    },
  ],
  $metadata: {},
};
