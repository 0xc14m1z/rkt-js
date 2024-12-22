import { IReader } from "./IReader";
import {
  ClosedParenthesisToken,
  Token,
  OpenParenthesisToken,
  SingleQuoteToken,
  PlusToken,
  MinusToken,
  AsteriskToken,
  SlashToken,
  LowerThanToken,
  GreaterThanToken,
  EqualToken,
  NewLineToken,
  EndOfFileToken,
  StringLiteralToken,
  IllegalToken,
  NumberLiteralToken,
  IdentifierToken,
} from "./Token";

export class Scanner {
  readonly #reader: IReader;
  #character: string | null = null;

  constructor(reader: IReader) {
    this.#reader = reader;
  }

  scan(): Token[] {
    this.#character = null;
    const tokens: Token[] = [];

    while ((this.#character = this.#reader.read())) {
      let token: Token;

      this.#consumeWhiteSpaces();

      switch (this.#character) {
        case "(":
          token = new OpenParenthesisToken();
          break;
        case ")":
          token = new ClosedParenthesisToken();
          break;
        case "'":
          token = new SingleQuoteToken();
          break;
        case "+":
          token = new PlusToken();
          break;
        case "-":
          if (this.#isDigit(this.#reader.peek())) {
            const number = this.#consumeNumberLiteral();
            token = new NumberLiteralToken(number);
          } else {
            token = new MinusToken();
          }
          break;
        case "*":
          token = new AsteriskToken();
          break;
        case "/":
          token = new SlashToken();
          break;
        case "=":
          token = new EqualToken();
          break;
        case "<":
          token = new LowerThanToken();
          break;
        case ">":
          token = new GreaterThanToken();
          break;
        case "\n":
          token = new NewLineToken();
          break;
        case '"':
          const string = this.#consumeStringLiteral();
          token = new StringLiteralToken(string);

          if (this.#character !== '"') {
            token = new IllegalToken('"');
          }

          break;
        default:
          if (this.#isDigit(this.#character)) {
            const number = this.#consumeNumberLiteral();
            token = new NumberLiteralToken(number);
          } else if (this.#canStartIdentifier(this.#character)) {
            const identifier = this.#consumeIdentifier();
            token = new IdentifierToken(identifier);
          } else {
            const lastToken = tokens.at(-1);

            if (lastToken instanceof IllegalToken) {
              lastToken.append(this.#character);
              continue;
            }

            token = new IllegalToken(this.#character);
          }
      }

      tokens.push(token);
    }

    tokens.push(new EndOfFileToken());

    return tokens;
  }

  #consumeStringLiteral(): string {
    let string = "";
    while ((this.#character = this.#reader.read())) {
      if (this.#character === '"') break;
      else string += this.#character;
    }
    return string;
  }

  #consumeWhiteSpaces(): void {
    do {
      if (this.#character !== " " && this.#character !== "\t" && this.#character !== "\r") return;
    } while ((this.#character = this.#reader.read()));
  }

  #isDigit(character: string | null): boolean {
    if (character === null) return false;
    const digit = character.charCodeAt(0);
    const zero = "0".charCodeAt(0);
    const nine = "9".charCodeAt(0);
    return digit >= zero && digit <= nine;
  }

  #consumeNumberLiteral(): string {
    let isFloatingPoint = false;
    let number = this.#character!;

    while ((this.#character = this.#reader.read())) {
      if (this.#isDigit(this.#character)) {
        number += this.#character;
      } else if (this.#character === ".") {
        if (!isFloatingPoint) {
          number += this.#character;
          isFloatingPoint = true;
        } else {
          this.#reader.rollback();
          break;
        }
      } else {
        break;
      }
    }

    return number;
  }

  #canStartIdentifier(character: string | null): boolean {
    if (character === null) return false;

    const initial = character.charCodeAt(0);

    const a = "a".charCodeAt(0);
    const z = "z".charCodeAt(0);
    const A = "A".charCodeAt(0);
    const Z = "Z".charCodeAt(0);

    return character === "_" || (initial >= a && initial <= z) || (initial >= A && initial <= Z);
  }

  #canBeIdentifier(character: string | null): boolean {
    return this.#canStartIdentifier(character) || this.#isDigit(character);
  }

  #consumeIdentifier(): string {
    let identifier = this.#character!;

    while ((this.#character = this.#reader.read())) {
      if (this.#canBeIdentifier(identifier)) {
        identifier += this.#character;
      } else {
        this.#reader.rollback();
        break;
      }
    }

    return identifier;
  }
}
