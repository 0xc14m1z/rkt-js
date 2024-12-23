export enum TokenKind {
  OpenParenthesis,
  ClosedParenthesis,
  Identifier,
  StringLiteral,
  NumberLiteral,
  SingleQuote,
  Plus,
  Minus,
  Asterisk,
  Slash,
  Equal,
  LowerThan,
  GreaterThan,
  EndOfFile,
  Illegal,
}

export abstract class Token {
  protected _value: string;

  get value(): string {
    return this._value;
  }

  protected constructor(
    readonly kind: TokenKind,
    value: string,
  ) {
    this._value = value;
  }
}

function SimpleToken(kind: TokenKind, value: string) {
  return class extends Token {
    constructor() {
      super(kind, value);
    }
  };
}

export class OpenParenthesisToken extends SimpleToken(TokenKind.OpenParenthesis, "(") {}
export class ClosedParenthesisToken extends SimpleToken(TokenKind.ClosedParenthesis, "(") {}
export class SingleQuoteToken extends SimpleToken(TokenKind.SingleQuote, "'") {}
export class PlusToken extends SimpleToken(TokenKind.Plus, "+") {}
export class MinusToken extends SimpleToken(TokenKind.Minus, "-") {}
export class AsteriskToken extends SimpleToken(TokenKind.Asterisk, "*") {}
export class SlashToken extends SimpleToken(TokenKind.Slash, "/") {}
export class EqualToken extends SimpleToken(TokenKind.Equal, "=") {}
export class LowerThanToken extends SimpleToken(TokenKind.LowerThan, "<") {}
export class GreaterThanToken extends SimpleToken(TokenKind.GreaterThan, ">") {}

export class IllegalToken extends Token {
  constructor(value: string) {
    super(TokenKind.Illegal, value);
  }

  append(value: string): void {
    this._value += value;
  }
}

export class EndOfFileToken extends SimpleToken(TokenKind.EndOfFile, "") {}

function LiteralToken(kind: TokenKind) {
  return class extends Token {
    constructor(value: string) {
      super(kind, value);
    }
  };
}

export class StringLiteralToken extends LiteralToken(TokenKind.StringLiteral) {}
export class NumberLiteralToken extends LiteralToken(TokenKind.NumberLiteral) {
  get numericValue(): number {
    return Number(this.value);
  }
}

export class IdentifierToken extends Token {
  constructor(symbol: string) {
    super(TokenKind.Identifier, symbol);
  }
}
