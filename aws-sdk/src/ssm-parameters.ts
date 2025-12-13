import {
  SSMClient,
  type Parameter,
  GetParametersByPathCommand,
  GetParametersCommand,
} from "@aws-sdk/client-ssm";

export const ssmClient = new SSMClient({});

// to use this, you need to give the lambda function permission to the
// ** CloudFormation Example **
// Resources:
//   LambdaPolicies:
//     Type: AWS::IAM::Policy
//     Properties:
//       PolicyName: LambdaRole
//       PolicyDocument:
//         Statement:
//         - Effect: Allow
//           Action:
//           - "ssm:GetParameters"
//           - "ssm:GetParametersByPath"
//           Resource: !Sub 'arn:aws:ssm:*:*:parameter/${PARAMETER_PATH}/*'
export const getParametersByPath = async (
  path: string,
  parameters?: Parameter[],
  nextToken?: string,
  client?: SSMClient,
): Promise<Parameter[]> => {
  client ??= ssmClient;

  let returnParams: Parameter[] = parameters || [];

  const command = new GetParametersByPathCommand({
    Path: path,
    Recursive: true,
    WithDecryption: true,
    NextToken: nextToken,
  });

  const output = await client.send(command);

  // merge parameters
  if (output.Parameters !== undefined) {
    returnParams = [...returnParams, ...output.Parameters];
  }

  if (output.NextToken !== undefined) {
    return getParametersByPath(path, returnParams, output.NextToken, client);
  }

  // return all
  return returnParams;
};

// ** CloudFormation Example **
// Resources:
//   LambdaPolicies:
//     Type: AWS::IAM::Policy
//     Properties:
//       PolicyName: LambdaRole
//       PolicyDocument:
//         Statement:
//         - Effect: Allow
//           Action:
//           - "ssm:GetParameters"
//           - "ssm:GetParametersByPath"
//           Resource:
//           - ${name1}
//           - ${name2}
//           - ${name3
export const getParameters = async (
  names: string[],
  client?: SSMClient,
): Promise<Parameter[]> => {
  client ??= ssmClient;

  const command = new GetParametersCommand({
    Names: names,
    WithDecryption: true,
  });

  const result = await client.send(command);
  if (result.Parameters === undefined) {
    return [];
  }

  return result.Parameters;
};

/**
 * Extract a single parameter from an array of params (typically from params by path)
 *
 * @param name
 * @param params
 */
export const extractParamValue = (
  path: string,
  name: string,
  params: Parameter[],
): string => {
  const fullName = `${path.replace(/\/$/, "")}/${name}`;

  const item = params.find((item) => item.Name === fullName);

  if (!item || !item.Value) {
    throw new Error(`Parameter '${fullName}' is not set.`);
  }

  return item.Value;
};
