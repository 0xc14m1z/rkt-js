import {
  ClosedParenthesisToken,
  Token,
  OpenParenthesisToken,
  SingleQuoteToken,
  EndOfFileToken,
  StringLiteralToken,
  IllegalToken,
  NumberLiteralToken,
  IdentifierToken,
  CommentToken,
  OpenBracketToken,
  ClosedBracketToken,
  MacroToken,
} from "./Token";
import { IReader } from "./Reader";

export class Scanner {
  readonly #reader: IReader<string>;
  #character: string | null = null;

  constructor(reader: IReader<string>) {
    this.#reader = reader;
  }

  scan(): Token[] {
    this.#character = null;
    const tokens: Token[] = [];

    while (this.#consumeCharacter()) {
      let token: Token;

      this.#consumeWhiteSpaces();
      // consuming whitespaces might consume the rest of the input
      if (!this.#character) break;

      switch (this.#character) {
        case "(":
          token = new OpenParenthesisToken();
          break;
        case ")":
          token = new ClosedParenthesisToken();
          break;
        case "[":
          token = new OpenBracketToken();
          break;
        case "]":
          token = new ClosedBracketToken();
          break;
        case ";":
          const comment = this.#consumeComment();
          token = new CommentToken(comment);
          break;
        case "'":
          if (this.#canBeIdentifier(this.#reader.peek())) {
            const identifier = this.#consumeIdentifier();
            token = new IdentifierToken(identifier);
          } else {
            token = new SingleQuoteToken();
          }
          break;
        case '"':
          const string = this.#consumeStringLiteral();
          token = new StringLiteralToken(string);

          // when the current character is not another double
          // quote, it means the string is unterminated
          if (this.#character !== '"') {
            token = new IllegalToken('"');
          }

          break;
        case "#":
          const identifier = this.#consumeIdentifier();
          token = new MacroToken(identifier);

          // a macro must have a name/value after the # symbol
          if (identifier === "#") {
            token = new IllegalToken("#");
          }

          break;
        default:
          if (
            this.#isDigit(this.#character) ||
            // the next line matches negative numbers
            (this.#character === "-" && this.#isDigit(this.#reader.peek()))
          ) {
            const number = this.#consumeNumberLiteral();
            token = new NumberLiteralToken(number);
          } else if (this.#canBeIdentifier(this.#character)) {
            const identifier = this.#consumeIdentifier();
            token = new IdentifierToken(identifier);
          } else {
            token = new IllegalToken(this.#character!);
          }
      }

      tokens.push(token);
    }

    tokens.push(new EndOfFileToken());

    return tokens;
  }

  #consumeCharacter(): string | null {
    return (this.#character = this.#reader.read());
  }

  #consumeComment(): string {
    let comment = "";
    while (this.#consumeCharacter()) {
      if (this.#character === "\n") break;
      else comment += this.#character;
    }
    return comment;
  }

  #consumeStringLiteral(): string {
    let string = "";
    while (this.#consumeCharacter()) {
      if (this.#character === '"') break;
      else string += this.#character;
    }
    return string;
  }

  #isWhitespace(character: string | null): boolean {
    if (character === null) return false;
    const whitespaces = [" ", "\t", "\r", "\n"];
    return whitespaces.includes(character);
  }

  #consumeWhiteSpaces(): void {
    do {
      if (!this.#isWhitespace(this.#character)) return;
    } while (this.#consumeCharacter());
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

    while (this.#consumeCharacter()) {
      if (this.#isDigit(this.#character)) {
        number += this.#character;
      } else if (this.#character === "." && !isFloatingPoint) {
        number += this.#character;
        isFloatingPoint = true;
      } else {
        this.#reader.rollback();
        break;
      }
    }

    return number;
  }

  #canBeIdentifier(character: string | null): boolean {
    if (character === null) return false;
    if (this.#isWhitespace(character)) return false;
    const forbidden = ["(", ")", "[", "]", "{", "}", '\"', ",", "'", "`", ";", "#", "|", "\\"];
    return !forbidden.includes(character);
  }

  #consumeIdentifier(): string {
    let identifier = this.#character!;

    while (this.#consumeCharacter()) {
      if (this.#canBeIdentifier(this.#character)) {
        identifier += this.#character;
      } else {
        this.#reader.rollback();
        break;
      }
    }

    return identifier;
  }
}
