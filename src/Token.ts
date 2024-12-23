export enum TokenKind {
  OpenParenthesis,
  ClosedParenthesis,
  OpenBracket,
  ClosedBracket,
  Identifier,
  StringLiteral,
  NumberLiteral,
  SingleQuote,
  Comment,
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

function SyntaxToken(kind: TokenKind, value: string) {
  return class extends Token {
    constructor() {
      super(kind, value);
    }
  };
}

export class OpenParenthesisToken extends SyntaxToken(TokenKind.OpenParenthesis, "(") {}
export class ClosedParenthesisToken extends SyntaxToken(TokenKind.ClosedParenthesis, ")") {}
export class OpenBracketToken extends SyntaxToken(TokenKind.OpenBracket, "[") {}
export class ClosedBracketToken extends SyntaxToken(TokenKind.ClosedBracket, "]") {}
export class SingleQuoteToken extends SyntaxToken(TokenKind.SingleQuote, "'") {}

export class IllegalToken extends Token {
  constructor(value: string) {
    super(TokenKind.Illegal, value);
  }

  append(value: string): void {
    this._value += value;
  }
}

export class EndOfFileToken extends SyntaxToken(TokenKind.EndOfFile, "") {}

function UserToken(kind: TokenKind) {
  return class extends Token {
    constructor(value: string) {
      super(kind, value);
    }
  };
}

export class StringLiteralToken extends UserToken(TokenKind.StringLiteral) {}
export class NumberLiteralToken extends UserToken(TokenKind.NumberLiteral) {
  get numericValue(): number {
    return Number(this.value);
  }
}

export class IdentifierToken extends UserToken(TokenKind.Identifier) {}
export class CommentToken extends UserToken(TokenKind.Comment) {}
