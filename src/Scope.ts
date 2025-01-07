import { Binding } from "./Binding";

export class Scope {
  #parent: Scope | null = null;
  #symbols: Map<string, Binding<any>> = new Map();

  constructor(parent: Scope | null = null) {
    this.#parent = parent;
  }

  bind(name: string, value: Binding<any>): void {
    this.#symbols.set(name, value);
  }

  lookup(name: string): Binding<any> {
    const binding = this.#symbols.get(name) ?? this.#parent?.lookup(name) ?? null;
    if (binding === null) throw new ReferenceError(`"${name}" was used being declared`);
    return binding;
  }
}
