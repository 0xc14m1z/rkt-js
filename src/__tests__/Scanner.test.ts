import { describe, expect, it, test } from "vitest";
import { StringReader } from "../StringReader";
import { Scanner } from "../Scanner";
import {
  ClosedBracketToken,
  ClosedParenthesisToken,
  CommentToken,
  EndOfFileToken,
  IdentifierToken,
  IllegalToken,
  NumberLiteralToken,
  OpenBracketToken,
  OpenParenthesisToken,
  SingleQuoteToken,
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
      const tokens = getTokens("()'[]");

      expect(tokens[0]).toBeInstanceOf(OpenParenthesisToken);
      expect(tokens[1]).toBeInstanceOf(ClosedParenthesisToken);
      expect(tokens[2]).toBeInstanceOf(SingleQuoteToken);
      expect(tokens[3]).toBeInstanceOf(OpenBracketToken);
      expect(tokens[4]).toBeInstanceOf(ClosedBracketToken);
    });

    it("skips irrelevant white spaces", () => {
      const tokens = getTokens("(   )\t+\rif\n'");

      expect(tokens[0]).toBeInstanceOf(OpenParenthesisToken);
      expect(tokens[1]).toBeInstanceOf(ClosedParenthesisToken);
      expect(tokens[2]).toBeInstanceOf(IdentifierToken);
      expect(tokens[3]).toBeInstanceOf(IdentifierToken);
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

      it("stops at non-digit characters", () => {
        const tokens = getTokens("123)");

        expect(tokens[0]).toBeInstanceOf(NumberLiteralToken);
        expect(tokens[1]).toBeInstanceOf(ClosedParenthesisToken);
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
      const tokens = getTokens(`( ${tested} )`);

      expect(tokens[0]).toBeInstanceOf(OpenParenthesisToken);

      expect(tokens[1]).toBeInstanceOf(IdentifierToken);
      const identifier = tokens[1] as IdentifierToken;
      expect(identifier.value).toBe(tested);

      expect(tokens[2]).toBeInstanceOf(ClosedParenthesisToken);
    });
  });

  describe("comments", () => {
    it("matches a comment", () => {
      const tokens = getTokens("(+ 1 2) ; this is a comment");

      expect(tokens[5]).toBeInstanceOf(CommentToken);
      const comment = tokens[5] as CommentToken;
      expect(comment.value).toBe(" this is a comment");
    });

    it("matches consecutive comments", () => {
      const tokens = getTokens("(+ 1 2) ; this is a comment\n;;and this is another one");

      expect(tokens[5]).toBeInstanceOf(CommentToken);
      expect(tokens[6]).toBeInstanceOf(CommentToken);

      const firstComment = tokens[5] as CommentToken;
      expect(firstComment.value).toBe(" this is a comment");

      const secondComment = tokens[6] as CommentToken;
      expect(secondComment.value).toBe(";and this is another one");
    });
  });

  describe("illegal tokens", () => {
    it("matches unterminated strings", () => {
      const tokens = getTokens('"unterminated string');

      expect(tokens[0]).toBeInstanceOf(IllegalToken);
      expect(tokens[0].value).toBe('"');
    });
  });
});
