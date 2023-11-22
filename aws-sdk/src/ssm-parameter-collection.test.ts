import { ParameterCollection } from "./ssm-parameter-collection";
import { Parameter } from "@aws-sdk/client-ssm";
import { basePath, result1 } from "./__mocks__/get-parameters-by-path-result";
import { vi, describe, it, expect } from "vitest";

vi.mock("./ssm-parameters", () => {
  return {
    getParametersByPath: vi.fn((): Promise<Parameter[]> => {
      return Promise.resolve(result1.Parameters as Parameter[]);
    }),
  };
});

describe("Parameter Collection", () => {
  it("Should create collection successfully", async () => {
    const path = "/foo/bar/baz";
    const collection = new ParameterCollection(path);

    expect(collection.path).toBe(path);
  });

  it("Should throw error if path is not valid", async () => {
    const path = "";

    let error = undefined;
    try {
      await new ParameterCollection(path).getParam("one");
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(Error);
  });

  it("findParam should return a proper value", async () => {
    const collection = new ParameterCollection(basePath);
    const one = await collection.findParam("one");
    const foo = await collection.findParam("foo");

    expect(one?.Value).toBe("one");
    expect(foo?.Value).toBe(undefined);
  });

  it("getParam should return a proper value", async () => {
    const collection = new ParameterCollection(basePath);

    expect((await collection.getParam("one"))?.Value).toBe("one");
  });

  it("getParam should throw an error if param does not exist", async () => {
    const collection = new ParameterCollection(basePath);

    let error = undefined;
    try {
      await collection.getParam("foo");
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(Error);
  });

  it("Should return boolean if param exists", async () => {
    const collection = new ParameterCollection(basePath);

    expect(await collection.hasParam("one")).toBe(true);
    expect(await collection.hasParam("foo")).toBe(false);
  });

  it("Should handle nested param paths", async () => {
    const path = "/app";
    const collection = new ParameterCollection(path);

    expect((await collection.findParam("env/one"))?.Value).toBe("one");
  });
});
