import { IdentifierToken, isTokenInstance, MacroToken, Token, TokenKind } from "./Token";
import { TokenReader } from "./TokenReader";
import { AtomNode, IdentifierNode, LangNode, Program, Statement } from "./SyntaxTree";
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

    while (this.#consumeToken()) {
      if (!this.#token) break;

      let statement: Statement;

      switch (this.#token.kind) {
        case TokenKind.StringLiteral:
        case TokenKind.NumberLiteral:
          statement = new AtomNode(this.#token);
          statements.push(statement);
          break;
        case TokenKind.Identifier:
          statement = new IdentifierNode(this.#token);
          statements.push(statement);
          break;
      }
    }

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
}
