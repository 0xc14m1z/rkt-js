import { parse, scan } from "./utils";
import { AtomNode, IdentifierNode, LangNode, Program } from "../SyntaxTree";
import { MissingLangStatementError, UnexpectedTokenError } from "../errors";
import { IdentifierToken, NumberLiteralToken, StringLiteralToken } from "../Token";
import { Parser } from "../Parser";

describe("Parser", () => {
  it("returns a Program", () => {
    const source = `
      #lang racket
      
      (define (double x) (* x 2))
      (displayln (double 21))
    `;
    const tokens = scan(source);
    const parser = new Parser(tokens);
    const program = parser.parse();

    expect(program).toBeInstanceOf(Program);
  });

  describe("#lang directive", () => {
    it("throws when the lang directive isn't the first statement", () => {
      const source = `
        (define (double x) (* x 2))
        (double 21)
      `;

      const test = () => parse(source);
      expect(test).toThrowError(MissingLangStatementError);
    });

    test.each(["#macro", "123", '"string"'])(
      'throws when the language is "%s"',
      (language: string) => {
        const source = `
        #lang ${language}
        (define (double x) (* x 2))
        (double 21)
      `;

        const test = () => parse(source);
        expect(test).toThrowError(UnexpectedTokenError);
      },
    );

    it("parses the correct language", () => {
      const statements = parse(`
        #lang racket
        (displayln "using racket")
      `);

      expect(statements[0]).toBeInstanceOf(LangNode);
      const node = statements[0] as LangNode;
      expect(node.language.value).toBe("racket");
    });
  });

  describe("atom nodes", () => {
    it("parses literals", () => {
      const statements = parse(`
        #lang racket
        123
        "string"
      `);

      expect(statements[1]).toBeInstanceOf(AtomNode);
      expect((statements[1] as AtomNode).literal).toBeToken(NumberLiteralToken, "123");
      expect(statements[2]).toBeInstanceOf(AtomNode);
      expect((statements[2] as AtomNode).literal).toBeToken(StringLiteralToken, "string");
    });
  });

  describe("identifier nodes", () => {
    it("parses identifiers", () => {
      const statements = parse(`
        #lang racket
        identifier
      `);

      expect(statements[1]).toBeInstanceOf(IdentifierNode);
      expect((statements[1] as IdentifierNode).name).toBeToken(IdentifierToken, "identifier");
    });
  });
});
