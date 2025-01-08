import { parse } from "./utils";
import { Evaluator } from "../Evaluator";

describe("Evaluator", () => {
  it("returns only the last expression value", () => {
    const program = parse(`
        #lang racket
        1
        2
        3
      `);

    const evaluator = new Evaluator(program);
    expect(evaluator.evaluate()).toBe(3);
  });

  describe("atoms", () => {
    it("evaluates numbers", () => {
      const program = parse(`
        #lang racket
        1
      `);

      const evaluator = new Evaluator(program);
      expect(evaluator.evaluate()).toBe(1);
    });

    it("evaluates strings", () => {
      const program = parse(`
        #lang racket
        "this is a string"
      `);

      const evaluator = new Evaluator(program);
      expect(evaluator.evaluate()).toBe("this is a string");
    });
  });
});
