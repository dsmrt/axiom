import {
  getParametersByPath,
  getParameters,
  ssmClient as client,
  extractParamValue,
} from "./ssm-parameters";

import {
  basePath as byPathBasePath,
  result1 as byPathResult1,
  result2 as byPathResult2,
  result3 as byPathResult3,
  result1ParamValue as byPathResult1ParamValue,
} from "./__mocks__/get-parameters-by-path-result";

import { vi, test, expect } from "vitest";

import {
  paramName,
  result1 as getParametersResult,
} from "./__mocks__/get-parameters-result";

vi.mock("@aws-sdk/client-ssm");

test("Get Parameters By Path", async () => {
  /* eslint-disable */
  // @ts-ignore
  client.send
    .mockResolvedValueOnce(byPathResult1)
    .mockResolvedValueOnce(byPathResult2)
    .mockResolvedValueOnce(byPathResult3);

  const parameters = await getParametersByPath(byPathBasePath);

  expect(parameters.length).toBeGreaterThan(0);
});

test("Get Parameters", async () => {
  /* eslint-disable */
  // @ts-ignore
  client.send.mockResolvedValue(getParametersResult);

  const parameters = await getParameters([`${paramName}`]);

  expect(parameters.length).toBeGreaterThan(0);
});

test("Extract param value", async () => {
  const value = extractParamValue(
    byPathBasePath,
    "two",
    byPathResult1.Parameters || [],
  );

  expect(value).toBe(byPathResult1ParamValue);
  expect(value).not.toBe(`${byPathResult1ParamValue}-111`);
});
