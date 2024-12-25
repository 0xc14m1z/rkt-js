import { parse } from "./utils";
import { Program } from "../SyntaxTree";

describe("Parser", () => {
  it("returns a Program", () => {
    const program = parse(`
      #lang racket
      
      (define (double x) (* x 2)
      (displayln (double 21))
    `);

    expect(program).toBeInstanceOf(Program);
  });
});
