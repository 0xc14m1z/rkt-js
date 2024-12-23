import { describe, expect, it, test } from "vitest";
import { StringReader } from "../StringReader";
import { Scanner } from "../Scanner";
import {
  AsteriskToken,
  ClosedParenthesisToken,
  EndOfFileToken,
  EqualToken,
  GreaterThanToken,
  IdentifierToken,
  IllegalToken,
  LowerThanToken,
  MinusToken,
  NumberLiteralToken,
  OpenParenthesisToken,
  PlusToken,
  SingleQuoteToken,
  SlashToken,
  StringLiteralToken,
  Token,
} from "../Token";

describe("Scanner", () => {
  function getTokens(input: string): Token[] {
    const reader = new StringReader(input);
    const scanner = new Scanner(reader);
    return scanner.scan();
  }

  it("appends the end of file token", () => {
    const tokens = getTokens("");
    expect(tokens).toHaveLength(1);
    expect(tokens.at(-1)).toBeInstanceOf(EndOfFileToken);
  });

  describe("simple tokens", () => {
    it("matches simple tokens", () => {
      const tokens = getTokens("()+-*/=<>\n'");

      expect(tokens[0]).toBeInstanceOf(OpenParenthesisToken);
      expect(tokens[1]).toBeInstanceOf(ClosedParenthesisToken);
      expect(tokens[2]).toBeInstanceOf(PlusToken);
      expect(tokens[3]).toBeInstanceOf(MinusToken);
      expect(tokens[4]).toBeInstanceOf(AsteriskToken);
      expect(tokens[5]).toBeInstanceOf(SlashToken);
      expect(tokens[6]).toBeInstanceOf(EqualToken);
      expect(tokens[7]).toBeInstanceOf(LowerThanToken);
      expect(tokens[8]).toBeInstanceOf(GreaterThanToken);
      expect(tokens[9]).toBeInstanceOf(SingleQuoteToken);
    });

    it("skips irrelevant white spaces", () => {
      const tokens = getTokens("(   )\t+\r-\n'");

      expect(tokens[0]).toBeInstanceOf(OpenParenthesisToken);
      expect(tokens[1]).toBeInstanceOf(ClosedParenthesisToken);
      expect(tokens[2]).toBeInstanceOf(PlusToken);
      expect(tokens[3]).toBeInstanceOf(MinusToken);
      expect(tokens[4]).toBeInstanceOf(SingleQuoteToken);
    });
  });

  describe("literals", () => {
    describe("string literals", () => {
      it("matches an empty string", () => {
        const tokens = getTokens('""');

        const literal = tokens[0];
        expect(literal).toBeInstanceOf(StringLiteralToken);
        expect(literal.value).toBe("");
      });

      it("matches a non empty string", () => {
        const tokens = getTokens('"non empty string"');

        const literal = tokens[0];
        expect(literal).toBeInstanceOf(StringLiteralToken);
        expect(literal.value).toBe("non empty string");
      });
    });

    describe("number literals", () => {
      it("matches single digit numbers", () => {
        const tokens = getTokens("1");

        expect(tokens[0]).toBeInstanceOf(NumberLiteralToken);
        const literal = tokens[0] as NumberLiteralToken;
        expect(literal.value).toBe("1");
        expect(literal.numericValue).toBe(1);
      });

      it("matches floating point numbers", () => {
        const tokens = getTokens("1.234");

        expect(tokens[0]).toBeInstanceOf(NumberLiteralToken);
        const literal = tokens[0] as NumberLiteralToken;
        expect(literal.value).toBe("1.234");
        expect(literal.numericValue).toBe(1.234);
      });

      it("matches negative numbers", () => {
        const tokens = getTokens("-1234");

        expect(tokens[0]).toBeInstanceOf(NumberLiteralToken);
        const literal = tokens[0] as NumberLiteralToken;
        expect(literal.value).toBe("-1234");
        expect(literal.numericValue).toBe(-1234);
      });

      it("matches floating point numbers that starts with zero", () => {
        const tokens = getTokens("0.1234");

        expect(tokens[0]).toBeInstanceOf(NumberLiteralToken);
        const literal = tokens[0] as NumberLiteralToken;
        expect(literal.value).toBe("0.1234");
        expect(literal.numericValue).toBe(0.1234);
      });
    });
  });

  describe("identifiers", () => {
    test.each([
      "i",
      "identifier",
      "_identifier",
      "id3nt1f1er",
      "__id_nt_f__r__",
      "i0123",
      "_0123",
      "define",
    ])('matches "%s" as valid identifier', (tested: string) => {
      const tokens = getTokens(`( ${tested} )`);

      expect(tokens[0]).toBeInstanceOf(OpenParenthesisToken);

      expect(tokens[1]).toBeInstanceOf(IdentifierToken);
      const identifier = tokens[1] as IdentifierToken;
      expect(identifier.value).toBe(tested);

      expect(tokens[2]).toBeInstanceOf(ClosedParenthesisToken);
    });
  });

  describe("illegal tokens", () => {
    it("matches unterminated strings", () => {
      const tokens = getTokens('"unterminated string');

      expect(tokens[0]).toBeInstanceOf(IllegalToken);
      expect(tokens[0].value).toBe('"');
    });

    it("merges illegal characters", () => {
      const tokens = getTokens('"valid" ???!!!');

      expect(tokens[0]).toBeInstanceOf(StringLiteralToken);

      expect(tokens[1]).toBeInstanceOf(IllegalToken);
      expect(tokens[1].value).toBe("???!!!");
    });

    it("catch multiple dots in numbers", () => {
      const tokens = getTokens("1.234.567");

      expect(tokens[0]).toBeInstanceOf(NumberLiteralToken);
      const literal = tokens[0] as NumberLiteralToken;
      expect(literal.value).toBe("1.234");
      expect(literal.numericValue).toBe(1.234);

      expect(tokens[1]).toBeInstanceOf(IllegalToken);
      expect(tokens[1].value).toBe(".");
    });
  });
});
