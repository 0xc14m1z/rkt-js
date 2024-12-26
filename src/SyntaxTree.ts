import { AtomToken, IdentifierToken } from "./Token";

export type ExpressionNode = AtomNode | IdentifierNode | FunctionApplicationNode;
export type Statement = LangNode | ExpressionNode;

export class Program {
  statements: Statement[] = [];
}

export class LangNode {
  constructor(readonly language: IdentifierToken) {}
}

export class AtomNode {
  constructor(readonly literal: AtomToken) {}
}

export class IdentifierNode {
  constructor(readonly name: IdentifierToken) {}
}

export class FunctionApplicationNode {
  constructor(
    readonly name: IdentifierToken,
    readonly args: ExpressionNode[],
  ) {}
}
