import { describe, expect, it } from "vitest";
import { scan } from "./utils";
import { TokenReader } from "../TokenReader";
import {
  ClosedParenthesisToken,
  EndOfFileToken,
  IdentifierToken,
  NumberLiteralToken,
  OpenParenthesisToken,
} from "../Token";

describe("TokenReader", () => {
  it("reads all tokens of the input list", () => {
    const tokens = scan(`
      (define (double x) (* x 2))
      (double 21)
    `);

    const reader = new TokenReader(tokens);

    expect(reader.read()).toBeToken(OpenParenthesisToken);
    expect(reader.read()).toBeToken(IdentifierToken, "define");
    expect(reader.read()).toBeToken(OpenParenthesisToken);
    expect(reader.read()).toBeToken(IdentifierToken, "double");
    expect(reader.read()).toBeToken(IdentifierToken, "x");
    expect(reader.read()).toBeToken(ClosedParenthesisToken);
    expect(reader.read()).toBeToken(OpenParenthesisToken);
    expect(reader.read()).toBeToken(IdentifierToken, "*");
    expect(reader.read()).toBeToken(IdentifierToken, "x");
    expect(reader.read()).toBeToken(NumberLiteralToken, "2");
    expect(reader.read()).toBeToken(ClosedParenthesisToken);
    expect(reader.read()).toBeToken(ClosedParenthesisToken);

    expect(reader.read()).toBeToken(OpenParenthesisToken);
    expect(reader.read()).toBeToken(IdentifierToken, "double");
    expect(reader.read()).toBeToken(NumberLiteralToken, "21");
    expect(reader.read()).toBeToken(ClosedParenthesisToken);

    expect(reader.read()).toBeToken(EndOfFileToken);

    expect(reader.read()).toBe(null);
  });

  it("peeks the next character without advancing", () => {
    const tokens = scan("(+ 1 2)");
    const reader = new TokenReader(tokens);

    expect(reader.peek()).toBeToken(OpenParenthesisToken);
    expect(reader.peek()).toBeToken(OpenParenthesisToken);
    expect(reader.read()).toBeToken(OpenParenthesisToken);
    expect(reader.peek()).toBeToken(IdentifierToken, "+");
  });

  it("rolls back from the current position preventing underflowing", () => {
    const tokens = scan("(+ 1 2)");
    const reader = new TokenReader(tokens);

    expect(reader.read()).toBeToken(OpenParenthesisToken);
    expect(reader.read()).toBeToken(IdentifierToken, "+");
    expect(reader.peek()).toBeToken(NumberLiteralToken, "1");
    reader.rollback();
    expect(reader.peek()).toBeToken(IdentifierToken, "+");
    expect(reader.read()).toBeToken(IdentifierToken, "+");

    reader.rollback();
    reader.rollback();
    reader.rollback();
    reader.rollback();

    expect(reader.peek()).toBeToken(OpenParenthesisToken);
  });
});
