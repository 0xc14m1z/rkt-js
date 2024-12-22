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

  it("peeks the next character without advancing", () => {
    const input = "abcd";
    const reader = new StringReader(input);

    expect(reader.peek()).toBe("a");
    expect(reader.peek()).toBe("a");
    expect(reader.read()).toBe("a");
    expect(reader.peek()).toBe("b");
  });

  it("rolls back from the current position preventing underflowing", () => {
    const input = "abcd";
    const reader = new StringReader(input);

    expect(reader.read()).toBe("a");
    expect(reader.read()).toBe("b");
    expect(reader.peek()).toBe("c");
    reader.rollback();
    expect(reader.peek()).toBe("b");
    expect(reader.read()).toBe("b");

    reader.rollback();
    reader.rollback();
    reader.rollback();
    reader.rollback();

    expect(reader.peek()).toBe("a");
  });
});
