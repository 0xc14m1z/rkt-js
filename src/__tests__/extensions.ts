import { expect } from "vitest";
import { isToken, isTokenInstance, Token } from "../Token";
import { Constructable } from "../types";

interface CustomMatchers<R = unknown> {
  toBeToken: (expected: Constructable<Token>, withValue?: string) => R;
}

declare module "vitest" {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

interface ExpectationResult {
  pass: boolean;
  message: () => string;
  actual?: unknown;
  expected?: unknown;
}

function result(
  pass: boolean,
  message: () => string,
  actual: any,
  expected: any,
): ExpectationResult {
  return { pass, message, actual, expected };
}

const pass = result.bind(null, true);
const fail = result.bind(null, false);

export function toBeToken(
  received: any,
  expectedInstance: Constructable<Token>,
  expectedValue?: string,
) {
  if (!isToken(received)) {
    return fail(() => `${received} is not a Token instance`, received, expectedInstance);
  }

  if (!isTokenInstance(received, expectedInstance)) {
    return fail(
      () => `${received.constructor.name} is not an instance of ${expectedInstance.name}`,
      received,
      expectedInstance,
    );
  }

  if (expectedValue === undefined) {
    return pass(
      () => `${received.constructor.name} is an instance of ${expectedInstance.name}`,
      received,
      expectedInstance,
    );
  }

  if (received.value === expectedValue) {
    return pass(
      () => `${received.constructor.name} has value of "${expectedValue}"`,
      received.value,
      expectedValue,
    );
  }

  return fail(
    () =>
      `${received.constructor.name} has value of "${received.value}" instead of "${expectedValue}"`,
    received.value,
    expectedValue,
  );
}

expect.extend({
  toBeToken,
});
