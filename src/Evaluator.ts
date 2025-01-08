import { AtomNode, ExpressionNode, LangNode, Program } from "./SyntaxTree";
import { NumberLiteralToken, StringLiteralToken } from "./Token";
import { UnexpectedTokenError } from "./errors";

export class Evaluator {
  #program: Program;

  constructor(program: Program) {
    this.#program = program;
  }

  evaluate(): unknown {
    let result: unknown;

    for (const statement of this.#program.statements) {
      if (statement instanceof LangNode) {
        // TODO: import language bindings
      } else {
        result = this.#evaluateExpression(statement);
      }
    }

    return result;
  }

  #evaluateExpression(node: ExpressionNode): unknown {
    if (node instanceof AtomNode) {
      return this.#evaluateAtom(node);
    }
  }

  #evaluateAtom(node: AtomNode) {
    if (node.literal instanceof NumberLiteralToken) {
      return node.literal.numericValue;
    } else if (node.literal instanceof StringLiteralToken) {
      return node.literal.value;
    }

    throw new UnexpectedTokenError(`number" or "string`, node.literal);
  }
}
