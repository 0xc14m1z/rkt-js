import { parse, scan } from "./utils";
import {
  AtomNode,
  FunctionApplicationNode,
  IdentifierNode,
  LangNode,
  Program,
} from "../SyntaxTree";
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

  describe("function application", () => {
    it("parses a named function", () => {
      const statements = parse(`
        #lang racket
        (displayln "named function")
      `);

      expect(statements).toHaveLength(2);

      expect(statements[1]).toBeInstanceOf(FunctionApplicationNode);
      const fn = statements[1] as FunctionApplicationNode;

      expect(fn.procedure).toBeInstanceOf(IdentifierNode);
      const procedure = fn.procedure as IdentifierNode;
      expect(procedure.name).toBeToken(IdentifierToken, "displayln");

      expect(fn.args).toHaveLength(1);
      expect(fn.args[0]).toBeInstanceOf(AtomNode);
      const arg = fn.args[0] as AtomNode;
      expect(arg.literal).toBeToken(StringLiteralToken, "named function");
    });

    it("parses a function with no arguments", () => {
      const statements = parse(`
        #lang racket
        (define (main) (displayln "no args"))
        (main)
      `);

      expect(statements).toHaveLength(3);

      expect(statements[2]).toBeInstanceOf(FunctionApplicationNode);
      const fn = statements[2] as FunctionApplicationNode;

      expect(fn.procedure).toBeInstanceOf(IdentifierNode);
      const procedure = fn.procedure as IdentifierNode;
      expect(procedure.name).toBeToken(IdentifierToken, "main");

      expect(fn.args).toHaveLength(0);
    });

    it("parses a lambda function application", () => {
      const statements = parse(`
        #lang racket
        ((lambda (x) (* x 2)) 21)
      `);

      expect(statements).toHaveLength(2);

      // outer function application
      expect(statements[1]).toBeInstanceOf(FunctionApplicationNode);
      const fn = statements[1] as FunctionApplicationNode;
      expect(fn.procedure).toBeInstanceOf(FunctionApplicationNode);
      expect(fn.args).toHaveLength(1);

      // lambda definition
      {
        const lambda = fn.procedure as FunctionApplicationNode;

        // lambda identifier
        expect(lambda.procedure).toBeInstanceOf(IdentifierNode);
        const procedure = lambda.procedure as IdentifierNode;
        expect(procedure.name).toBeToken(IdentifierToken, "lambda");

        // args
        {
          expect(lambda.args).toHaveLength(2);

          // parameters definition
          {
            expect(lambda.args[0]).toBeInstanceOf(FunctionApplicationNode);
            const lambdaArg = lambda.args[0] as FunctionApplicationNode;
            expect(lambdaArg.procedure).toBeInstanceOf(IdentifierNode);
            const arg = lambdaArg.procedure as IdentifierNode;
            expect(arg.name).toBeToken(IdentifierToken, "x");
          }

          // body definition
          {
            expect(lambda.args[1]).toBeInstanceOf(FunctionApplicationNode);
            const lambdaBody = lambda.args[1] as FunctionApplicationNode;

            expect(lambdaBody.procedure).toBeInstanceOf(IdentifierNode);
            const identifier = lambdaBody.procedure as IdentifierNode;
            expect(identifier.name).toBeToken(IdentifierToken, "*");

            expect(lambdaBody.args).toHaveLength(2);

            expect(lambdaBody.args[0]).toBeInstanceOf(IdentifierNode);
            const firstArg = lambdaBody.args[0] as IdentifierNode;
            expect(firstArg.name).toBeToken(IdentifierToken, "x");

            expect(lambdaBody.args[1]).toBeInstanceOf(AtomNode);
            const secondArg = lambdaBody.args[1] as AtomNode;
            expect(secondArg.literal).toBeToken(NumberLiteralToken, "2");
          }
        }
      }

      // argument provided
      expect(fn.args[0]).toBeInstanceOf(AtomNode);
      const arg = fn.args[0] as AtomNode;
      expect(arg.literal).toBeToken(NumberLiteralToken, "21");
    });
  });
});
