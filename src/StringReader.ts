import { IReader } from "./IReader";

export class StringReader implements IReader<string> {
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

  rollback(): void {
    this.#position = Math.max(0, this.#position - 1);
  }
}
