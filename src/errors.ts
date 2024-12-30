export class MissingLangStatementError extends Error {
  constructor() {
    super('The first statement must set the language with "#lang <languagename>"');
  }
}

export class UnexpectedTokenError extends Error {
  constructor(expected: any, received?: any) {
    super(`expected "${expected}", but received ${received ? `"${received}"` : "nothing"}`);
  }
}
