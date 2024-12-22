import { describe, expect, it } from "vitest";
import { StringReader } from "../StringReader";

describe("StringReader", () => {
  it("reads all characters of the input string", () => {
    const input = "abcd";
    const reader = new StringReader(input);

    expect(reader.read()).toBe("a");
    expect(reader.read()).toBe("b");
    expect(reader.read()).toBe("c");
    expect(reader.read()).toBe("d");
    expect(reader.read()).toBe(null);
  });
});
