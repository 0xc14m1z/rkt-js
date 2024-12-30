import {
  assertToken,
  ClosedParenthesisToken,
  IdentifierToken,
  isTokenInstance,
  MacroToken,
  Token,
  TokenKind,
} from "./Token";
import { TokenReader } from "./Reader";
import {
  AtomNode,
  ExpressionNode,
  FunctionApplicationNode,
  IdentifierNode,
  LangNode,
  Program,
  Statement,
} from "./SyntaxTree";
import { MissingLangStatementError, UnexpectedTokenError } from "./errors";

export class Parser {
  #reader: TokenReader;
  #token: Token | null = null;

  constructor(tokens: Token[]) {
    this.#reader = new TokenReader(tokens);
  }

  parse(): Program {
    const statements: Statement[] = [];

    statements.push(this.#parseLangStatement());

    let statement: Statement | null = null;
    while ((statement = this.#parseExpression())) statements.push(statement);

    const program = new Program();
    program.statements = statements;
    return program;
  }

  #consumeToken(): Token | null {
    return (this.#token = this.#reader.read());
  }

  #parseLangStatement(): LangNode {
    const macro = this.#consumeToken();

    if (!isTokenInstance(macro, MacroToken) || macro.value !== "#lang")
      throw new MissingLangStatementError();

    const language = this.#consumeToken();
    if (!isTokenInstance(language, IdentifierToken))
      throw new UnexpectedTokenError(IdentifierToken.name, language?.constructor.name);

    return new LangNode(language);
  }

  #parseExpression(): ExpressionNode | null {
    while (this.#consumeToken()) {
      assertToken(this.#token);

      switch (this.#token.kind) {
        case TokenKind.StringLiteral:
        case TokenKind.NumberLiteral:
          return new AtomNode(this.#token);
        case TokenKind.Identifier:
          return new IdentifierNode(this.#token);
        case TokenKind.OpenParenthesis:
          return this.#parseFunctionApplication();
        case TokenKind.ClosedParenthesis:
          return null;
      }
    }

    return null;
  }

  #parseFunctionApplication(): FunctionApplicationNode {
    const procedure = this.#parseExpression();
    if (!procedure) throw new UnexpectedTokenError(AtomNode.name);

    const args: ExpressionNode[] = [];

    while (this.#consumeToken()) {
      if (isTokenInstance(this.#token, ClosedParenthesisToken)) break;

      this.#reader.rollback();
      const arg = this.#parseExpression();

      if (!arg) break;
      args.push(arg);
    }

    return new FunctionApplicationNode(procedure, args);
  }
}
