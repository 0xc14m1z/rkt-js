import { parse } from "./utils";
import { AtomNode, IdentifierNode, LangNode, Program } from "../SyntaxTree";
import { MissingLangStatementError, UnexpectedTokenError } from "../errors";
import { IdentifierToken, NumberLiteralToken, StringLiteralToken } from "../Token";

describe("Parser", () => {
  it("returns a Program", () => {
    const program = parse(`
      #lang racket
      
      (define (double x) (* x 2))
      (displayln (double 21))
    `);

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
      const program = parse(`
        #lang racket
        (displayln "using racket")
      `);

      expect(program.statements[0]).toBeInstanceOf(LangNode);
      const node = program.statements[0] as LangNode;
      expect(node.language.value).toBe("racket");
    });
  });

  describe("atom nodes", () => {
    it("parses literals", () => {
      const program = parse(`
        #lang racket
        123
        "string"
      `);

      expect(program.statements[1]).toBeInstanceOf(AtomNode);
      expect((program.statements[1] as AtomNode).literal).toBeToken(NumberLiteralToken, "123");

      expect(program.statements[2]).toBeInstanceOf(AtomNode);
      expect((program.statements[2] as AtomNode).literal).toBeToken(StringLiteralToken, "string");
    });
  });

  describe("identifier nodes", () => {
    it("parses identifiers", () => {
      const program = parse(`
        #lang racket
        identifier
      `);

      expect(program.statements[1]).toBeInstanceOf(IdentifierNode);
      expect((program.statements[1] as IdentifierNode).name).toBeToken(
        IdentifierToken,
        "identifier",
      );
    });
  });
});
