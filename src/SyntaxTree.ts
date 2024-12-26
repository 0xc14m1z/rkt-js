import { AtomToken, IdentifierToken } from "./Token";

export type ExpressionNode = AtomNode | FunctionApplicationNode;
export type Statement = LangNode | ExpressionNode;

export class Program {
  statements: Statement[] = [];
}

export class LangNode {
  constructor(readonly language: IdentifierToken) {}
}

export type AtomToken = StringLiteralToken | NumberLiteralToken;

export class AtomNode {
  constructor(readonly literal: AtomToken) {}
}

export class FunctionApplicationNode {
  constructor(
    readonly name: IdentifierToken,
    readonly args: ExpressionNode[],
  ) {}
}
