<picture>
  <source media="(prefers-color-scheme: dark)" srcset="../images/axiom-dark-mode.svg">
  <source media="(prefers-color-scheme: light)" srcset="../images/axiom-light-mode.svg">
  <img alt="Axiom logo" src="../images/axiom-light-mode.svg">
</picture>

# Axiom - AWS SDK 

> An AWS focused config manager

This package focuses on AWS api calls while using the axiom cli

## Features
- Secret management with SSM Parameters (secure strings)

## Getting Started

### Install the CLI

```bash
npm install @dsmrt/axiom-aws-sdk
```

### AWS SDK Usage

#### AWS IAM Permissions

```yaml
# to use this, you need to give the lambda function permission to the
# ** CloudFormation Example **
 Resources:
   LambdaPolicies:
     Type: AWS::IAM::Policy
     Properties:
       PolicyName: LambdaRole
       PolicyDocument:
         Statement:
         - Effect: Allow
           Action:
           - "ssm:GetParameters"
           - "ssm:GetParametersByPath"
           Resource: !Sub 'arn:aws:ssm:*:*:parameter/${PARAMETER_PATH}/*'
# OR 
 Resources:
   LambdaPolicies:
     Type: AWS::IAM::Policy
     Properties:
       PolicyName: LambdaRole
       PolicyDocument:
         Statement:
         - Effect: Allow
           Action:
           - "ssm:PutParameter" # you'll need this to put the parameters as well
           - "ssm:GetParameters"
           - "ssm:GetParametersByPath"
           Resource:
           - ${name1}
           - ${name2}
           - ${name3
```

#### AWS SDK Examples

```typescript
    import { ParameterCollection } from "@dsmrt/axiom-aws-sdk";
    import { SSMClient, Parameter } from "@aws-sdk/client-ssm";

    const collection = new ParameterCollection(
      `/my-app/dev/`,
      new SSMClient({
        region: "us-east-1",
      }),
    );

    const params = await collection.get();

    params.forEach((parameter: Parameter) => {
        console.log(parameter.Name)
        console.log(parameter.Value)
    });
```

## Acknowledgements

- [Nate Iler](https://github.com/nateiler)
- [Flipbox Digital](https://www.flipboxdigital.com)
- [Go Mondo](https://www.flipboxdigital.com)
