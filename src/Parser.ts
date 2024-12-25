import { Token } from "./Token";
import { TokenReader } from "./TokenReader";
import { Program } from "./SyntaxTree";

export class Parser {
  #reader: TokenReader;

  constructor(tokens: Token[]) {
    this.#reader = new TokenReader(tokens);
  }

  parse(): Program {
    const program = new Program();

    return program;
  }
}
