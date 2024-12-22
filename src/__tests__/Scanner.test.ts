import { describe, expect, it } from "vitest";
import { StringReader } from "../StringReader";
import { Scanner } from "../Scanner";
import {
  AsteriskToken,
  ClosedParenthesisToken,
  EndOfFileToken,
  EqualToken,
  GreaterThanToken,
  IllegalToken,
  LowerThanToken,
  MinusToken,
  NewLineToken,
  NumberLiteralToken,
  OpenParenthesisToken,
  PlusToken,
  SingleQuoteToken,
  SlashToken,
  StringLiteralToken,
} from "../Token";

describe("Scanner", () => {
  it("appends the end of file token", () => {
    const input = "";
    const reader = new StringReader(input);
    const scanner = new Scanner(reader);
    const tokens = scanner.scan();

    expect(tokens).toHaveLength(1);
    expect(tokens.at(-1)).toBeInstanceOf(EndOfFileToken);
  });

  describe("simple tokens", () => {
    it("matches simple tokens", () => {
      const input = "()+-*/=<>\n'";
      const reader = new StringReader(input);
      const scanner = new Scanner(reader);
      const tokens = scanner.scan();

      expect(tokens[0]).toBeInstanceOf(OpenParenthesisToken);
      expect(tokens[1]).toBeInstanceOf(ClosedParenthesisToken);
      expect(tokens[2]).toBeInstanceOf(PlusToken);
      expect(tokens[3]).toBeInstanceOf(MinusToken);
      expect(tokens[4]).toBeInstanceOf(AsteriskToken);
      expect(tokens[5]).toBeInstanceOf(SlashToken);
      expect(tokens[6]).toBeInstanceOf(EqualToken);
      expect(tokens[7]).toBeInstanceOf(LowerThanToken);
      expect(tokens[8]).toBeInstanceOf(GreaterThanToken);
      expect(tokens[9]).toBeInstanceOf(NewLineToken);
      expect(tokens[10]).toBeInstanceOf(SingleQuoteToken);
    });

    it("skips irrelevant white spaces", () => {
      const input = "(   )\t+\r-\n'";
      const reader = new StringReader(input);
      const scanner = new Scanner(reader);
      const tokens = scanner.scan();

      expect(tokens[0]).toBeInstanceOf(OpenParenthesisToken);
      expect(tokens[1]).toBeInstanceOf(ClosedParenthesisToken);
      expect(tokens[2]).toBeInstanceOf(PlusToken);
      expect(tokens[3]).toBeInstanceOf(MinusToken);
      expect(tokens[4]).toBeInstanceOf(NewLineToken);
      expect(tokens[5]).toBeInstanceOf(SingleQuoteToken);
    });
  });

  describe("literals", () => {
    describe("string literals", () => {
      it("matches an empty string", () => {
        const input = '""';
        const reader = new StringReader(input);
        const scanner = new Scanner(reader);
        const tokens = scanner.scan();

        const literal = tokens[0];
        expect(literal).toBeInstanceOf(StringLiteralToken);
        expect(literal.value).toBe("");
      });

      it("matches a non empty string", () => {
        const input = '"non empty string"';
        const reader = new StringReader(input);
        const scanner = new Scanner(reader);
        const tokens = scanner.scan();

        const literal = tokens[0];
        expect(literal).toBeInstanceOf(StringLiteralToken);
        expect(literal.value).toBe("non empty string");
      });
    });

    describe("number literals", () => {
      it("matches single digit numbers", () => {
        const input = "1";
        const reader = new StringReader(input);
        const scanner = new Scanner(reader);
        const tokens = scanner.scan();

        expect(tokens[0]).toBeInstanceOf(NumberLiteralToken);
        const literal = tokens[0] as NumberLiteralToken;
        expect(literal.value).toBe("1");
        expect(literal.numericValue).toBe(1);
      });

      it("matches floating point numbers", () => {
        const input = "1.234";
        const reader = new StringReader(input);
        const scanner = new Scanner(reader);
        const tokens = scanner.scan();

        expect(tokens[0]).toBeInstanceOf(NumberLiteralToken);
        const literal = tokens[0] as NumberLiteralToken;
        expect(literal.value).toBe("1.234");
        expect(literal.numericValue).toBe(1.234);
      });

      it("matches negative numbers", () => {
        const input = "-1234";
        const reader = new StringReader(input);
        const scanner = new Scanner(reader);
        const tokens = scanner.scan();

        expect(tokens[0]).toBeInstanceOf(NumberLiteralToken);
        const literal = tokens[0] as NumberLiteralToken;
        expect(literal.value).toBe("-1234");
        expect(literal.numericValue).toBe(-1234);
      });

      it("matches floating point numbers", () => {
        const input = "1.234";
        const reader = new StringReader(input);
        const scanner = new Scanner(reader);
        const tokens = scanner.scan();

        expect(tokens[0]).toBeInstanceOf(NumberLiteralToken);
        const literal = tokens[0] as NumberLiteralToken;
        expect(literal.value).toBe("1.234");
        expect(literal.numericValue).toBe(1.234);
      });

      it("matches floating point numbers that starts with zero", () => {
        const input = "0.1234";
        const reader = new StringReader(input);
        const scanner = new Scanner(reader);
        const tokens = scanner.scan();

        expect(tokens[0]).toBeInstanceOf(NumberLiteralToken);
        const literal = tokens[0] as NumberLiteralToken;
        expect(literal.value).toBe("0.1234");
        expect(literal.numericValue).toBe(0.1234);
      });
    });
  });

  describe("illegal tokens", () => {
    it("matches unterminated strings", () => {
      const input = '"unterminated string';
      const reader = new StringReader(input);
      const scanner = new Scanner(reader);
      const tokens = scanner.scan();

      expect(tokens[0]).toBeInstanceOf(IllegalToken);
      expect(tokens[0].value).toBe('"');
    });

    it("merges illegal characters", () => {
      const input = '"valid"invalid';
      const reader = new StringReader(input);
      const scanner = new Scanner(reader);
      const tokens = scanner.scan();

      expect(tokens[0]).toBeInstanceOf(StringLiteralToken);

      expect(tokens[1]).toBeInstanceOf(IllegalToken);
      expect(tokens[1].value).toBe("invalid");
    });

    it("catch multiple dots in numbers", () => {
      const input = "1.234.567";
      const reader = new StringReader(input);
      const scanner = new Scanner(reader);
      const tokens = scanner.scan();

      expect(tokens[0]).toBeInstanceOf(NumberLiteralToken);
      const literal = tokens[0] as NumberLiteralToken;
      expect(literal.value).toBe("1.234");
      expect(literal.numericValue).toBe(1.234);

      expect(tokens[1]).toBeInstanceOf(IllegalToken);
      expect(tokens[1].value).toBe(".");
    });
  });
});
