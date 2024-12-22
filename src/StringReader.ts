import { IReader } from "./IReader";

export class StringReader implements IReader {
  #position: number = 0;

  constructor(private readonly input: string) {}

  read(): string | null {
    const character = this.peek();
    this.#position++;
    return character;
  }

  peek(): string | null {
    if (this.#position >= this.input.length) return null;
    return this.input.charAt(this.#position);
  }
}
