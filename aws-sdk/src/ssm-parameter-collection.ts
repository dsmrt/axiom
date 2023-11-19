import { getParametersByPath } from "./ssm-parameters"
import { Parameter, SSMClient } from "@aws-sdk/client-ssm";

type Params = {
  [key: string]: Parameter;
};

export class ParameterCollection<TParams extends Params> {
  readonly map: Map<keyof TParams, Parameter> = new Map();

  constructor(readonly path: string, private readonly client?: SSMClient) {}

  public async hasParam(param: keyof TParams): Promise<boolean> {
    if (this.map.size < 1) {
      await this.loadParameters();
    }

    return this.map.has(param);
  }

  public async findParam(param: keyof TParams): Promise<Parameter | undefined> {
    if (this.map.size < 1) {
      await this.loadParameters();
    }

    return this.map.get(param);
  }

  public async getParam(param: keyof TParams): Promise<Parameter> {
    if (!(await this.hasParam(param))) {
      throw new Error(`Parameter '${param.toString()}' does not exist'`);
    }

    return this.map.get(param) as Parameter;
  }

  public async get(): Promise<Map<keyof TParams, Parameter>> {
      if (this.map.size < 1) {
          await this.loadParameters();
      }

      return this.map

  }

  private async loadParameters() {
    if (!this.path) {
      throw new Error(`Parameter path is not set or is undefined`);
    }

    const params = await getParametersByPath(
      this.path,
      undefined,
      undefined,
      this.client
    );

    params.forEach((param: Parameter) => {
      const fullName = param.Name as string;

      const name = fullName.replace(`${this.path}/`, "") as keyof TParams;

      this.map.set(name, param);
    });
  }
}
