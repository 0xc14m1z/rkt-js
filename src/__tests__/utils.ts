import { Token } from "../Token";
import { StringReader } from "../StringReader";
import { Scanner } from "../Scanner";

export function scan(input: string): Token[] {
  const reader = new StringReader(input);
  const scanner = new Scanner(reader);
  return scanner.scan();
}
