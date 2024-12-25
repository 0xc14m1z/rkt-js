import { Token } from "../Token";
import { StringReader } from "../StringReader";
import { Scanner } from "../Scanner";
import { Program } from "../SyntaxTree";
import { Parser } from "../Parser";

export function scan(source: string): Token[] {
  const reader = new StringReader(source);
  const scanner = new Scanner(reader);
  return scanner.scan();
}

export function parse(source: string): Program {
  const tokens = scan(source);
  const parser = new Parser(tokens);
  return parser.parse();
}
