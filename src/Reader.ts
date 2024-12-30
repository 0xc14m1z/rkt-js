import { Token } from "./Token";

export interface IReader<T> {
  read(): T | null;
  peek(): T | null;
  rollback(): void;
}

abstract class Reader<O, I extends ArrayLike<O>> implements IReader<O> {
  protected readonly input: I;
  #position: number = 0;

  constructor(input: I) {
    this.input = input;
  }

  read(): O | null {
    const token = this.peek();
    this.#position++;
    return token;
  }

  peek(): O | null {
    if (this.#position >= this.input.length) return null;
    return this.input[this.#position];
  }

  rollback(): void {
    this.#position = Math.max(0, this.#position - 1);
  }
}

export class StringReader extends Reader<string, string> {}
export class TokenReader extends Reader<Token, Token[]> {}
