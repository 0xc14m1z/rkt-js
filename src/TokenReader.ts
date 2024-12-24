import { Token } from "./Token";
import { IReader } from "./IReader";

export class TokenReader implements IReader<Token> {
  readonly #input: Token[];
  #position: number = 0;

  constructor(tokens: Token[]) {
    this.#input = tokens;
  }

  read() {
    const token = this.peek();
    this.#position++;
    return token;
  }

  peek() {
    if (this.#position >= this.#input.length) return null;
    return this.#input[this.#position];
  }

  rollback(): void {
    this.#position = Math.max(0, this.#position - 1);
  }
}
