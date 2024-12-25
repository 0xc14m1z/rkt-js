import { IdentifierToken, isTokenInstance, MacroToken, Token } from "./Token";
import { TokenReader } from "./TokenReader";
import { LangNode, Program } from "./SyntaxTree";
import { MissingLangStatementError, ParseError } from "./errors";

export class Parser {
  #reader: TokenReader;
  #token: Token | null = null;

  constructor(tokens: Token[]) {
    this.#reader = new TokenReader(tokens);
  }

  parse(): Program {
    const program = new Program();

    program.statements.push(this.#parseLangStatement());

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
      throw new ParseError(IdentifierToken.name, language?.constructor.name ?? "nothing");

    return new LangNode(language);
  }
}
