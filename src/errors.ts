export class ParseError extends Error {
  constructor(expected: any, received: any) {
    super(`expected "${expected}", but received "${received}"`);
  }
}

function SimpleError(message: string) {
  return class extends Error {
    constructor() {
      super(message);
    }
  };
}

export class MissingLangStatementError extends SimpleError(
  'The first statement must set the language with "#lang <languagename>"',
) {}
