import { StringReader, TokenReader } from "../Reader";
import { scan } from "./utils";
import {
  ClosedParenthesisToken,
  EndOfFileToken,
  IdentifierToken,
  NumberLiteralToken,
  OpenParenthesisToken,
} from "../Token";

describe("Reader", () => {
  describe("StringReader", () => {
    it("reads all characters of the input string", () => {
      const input = "abcd";
      const reader = new StringReader(input);

      expect(reader.read()).toBe("a");
      expect(reader.read()).toBe("b");
      expect(reader.read()).toBe("c");
      expect(reader.read()).toBe("d");
      expect(reader.read()).toBe(null);
    });

    it("peeks the next character without advancing", () => {
      const input = "abcd";
      const reader = new StringReader(input);

      expect(reader.peek()).toBe("a");
      expect(reader.peek()).toBe("a");
      expect(reader.read()).toBe("a");
      expect(reader.peek()).toBe("b");
    });

    it("rolls back from the current position preventing underflowing", () => {
      const input = "abcd";
      const reader = new StringReader(input);

      expect(reader.read()).toBe("a");
      expect(reader.read()).toBe("b");
      expect(reader.peek()).toBe("c");
      reader.rollback();
      expect(reader.peek()).toBe("b");
      expect(reader.read()).toBe("b");

      reader.rollback();
      reader.rollback();
      reader.rollback();
      reader.rollback();

      expect(reader.peek()).toBe("a");
    });
  });

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
});
