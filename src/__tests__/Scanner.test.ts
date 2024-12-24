import { describe, expect, it, test } from "vitest";
import {
  ClosedBracketToken,
  ClosedParenthesisToken,
  CommentToken,
  EndOfFileToken,
  IdentifierToken,
  IllegalToken,
  MacroToken,
  NumberLiteralToken,
  OpenBracketToken,
  OpenParenthesisToken,
  SingleQuoteToken,
  StringLiteralToken,
} from "../Token";
import { scan } from "./utils";

describe("Scanner", () => {
  it("appends the end of file token", () => {
    const tokens = scan("");
    expect(tokens).toHaveLength(1);
    expect(tokens.at(-1)).toBeToken(EndOfFileToken);
  });

  describe("simple tokens", () => {
    it("matches simple tokens", () => {
      const tokens = scan("()'[]");

      expect(tokens[0]).toBeToken(OpenParenthesisToken);
      expect(tokens[1]).toBeToken(ClosedParenthesisToken);
      expect(tokens[2]).toBeToken(SingleQuoteToken);
      expect(tokens[3]).toBeToken(OpenBracketToken);
      expect(tokens[4]).toBeToken(ClosedBracketToken);
    });

    it("skips irrelevant white spaces", () => {
      const tokens = scan("(   )\t+\rif\n'");

      expect(tokens[0]).toBeToken(OpenParenthesisToken);
      expect(tokens[1]).toBeToken(ClosedParenthesisToken);
      expect(tokens[2]).toBeToken(IdentifierToken);
      expect(tokens[3]).toBeToken(IdentifierToken);
      expect(tokens[4]).toBeToken(SingleQuoteToken);
    });
  });

  describe("literals", () => {
    describe("string literals", () => {
      it("matches an empty string", () => {
        const tokens = scan('""');
        expect(tokens[0]).toBeToken(StringLiteralToken, "");
      });

      it("matches a non empty string", () => {
        const tokens = scan('"non empty string"');
        expect(tokens[0]).toBeToken(StringLiteralToken, "non empty string");
      });
    });

    describe("number literals", () => {
      it("matches single digit numbers", () => {
        const tokens = scan("1");

        expect(tokens[0]).toBeToken(NumberLiteralToken, "1");
        const literal = tokens[0] as NumberLiteralToken;
        expect(literal.numericValue).toBe(1);
      });

      it("matches floating point numbers", () => {
        const tokens = scan("1.234");

        expect(tokens[0]).toBeToken(NumberLiteralToken, "1.234");
        const literal = tokens[0] as NumberLiteralToken;
        expect(literal.numericValue).toBe(1.234);
      });

      it("matches negative numbers", () => {
        const tokens = scan("-1234");

        expect(tokens[0]).toBeToken(NumberLiteralToken, "-1234");
        const literal = tokens[0] as NumberLiteralToken;
        expect(literal.numericValue).toBe(-1234);
      });

      it("matches floating point numbers that starts with zero", () => {
        const tokens = scan("0.1234");

        expect(tokens[0]).toBeToken(NumberLiteralToken, "0.1234");
        const literal = tokens[0] as NumberLiteralToken;
        expect(literal.numericValue).toBe(0.1234);
      });

      it("stops at non-digit characters", () => {
        const tokens = scan("123)");

        expect(tokens[0]).toBeToken(NumberLiteralToken, "123");
        expect(tokens[1]).toBeToken(ClosedParenthesisToken);
      });
    });
  });

  describe("identifiers", () => {
    test.each([
      "i",
      "identifier",
      "_identifier",
      "+",
      "+inf.0",
      "equal?",
      "char->int",
      "define",
      "+/-",
      "'atom",
    ])('matches "%s" as valid identifier', (tested: string) => {
      const tokens = scan(`( ${tested} )`);

      expect(tokens[0]).toBeToken(OpenParenthesisToken);
      expect(tokens[1]).toBeToken(IdentifierToken, tested);
      expect(tokens[2]).toBeToken(ClosedParenthesisToken);
    });
  });

  describe("macros", () => {
    test.each(["#lang", "#null", "#custom-macro"])(
      'matches "%s" as valid macro',
      (tested: string) => {
        const tokens = scan(`( ${tested} )`);

        expect(tokens[0]).toBeToken(OpenParenthesisToken);
        expect(tokens[1]).toBeToken(MacroToken, tested);
        expect(tokens[2]).toBeToken(ClosedParenthesisToken);
      },
    );
  });

  describe("comments", () => {
    it("matches a comment", () => {
      const tokens = scan("(+ 1 2) ; this is a comment");
      expect(tokens[5]).toBeToken(CommentToken, " this is a comment");
    });

    it("matches consecutive comments", () => {
      const tokens = scan("(+ 1 2) ; this is a comment\n;;and this is another one");

      expect(tokens[5]).toBeToken(CommentToken, " this is a comment");
      expect(tokens[6]).toBeToken(CommentToken, ";and this is another one");
    });
  });

  describe("illegal tokens", () => {
    it("matches unterminated strings", () => {
      const tokens = scan('"unterminated string');
      expect(tokens[0]).toBeToken(IllegalToken, '"');
    });

    it("matches unnamed macros", () => {
      const tokens = scan("# ; unnamed macro");
      expect(tokens[0]).toBeToken(IllegalToken, "#");
    });
  });
});
