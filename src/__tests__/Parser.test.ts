import { parse } from "./utils";
import { LangNode, Program } from "../SyntaxTree";
import { MissingLangStatementError, ParseError } from "../errors";

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

        expect(test).toThrowError(ParseError);
      },
    );

    it("parses the correct language", () => {
      const program = parse(`
        #lang racket
        (displayln "using racket")
      `);

      expect(program.statements).toHaveLength(1);
      expect(program.statements[0]).toBeInstanceOf(LangNode);
      const node = program.statements[0] as LangNode;
      expect(node.language.value).toBe("racket");
    });
  });
});
