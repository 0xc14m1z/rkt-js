import { Scope } from "../Scope";
import { BindingType, NumberBinding, StringBinding } from "../Binding";

describe("Scope", () => {
  it("lookup for an unbound symbols throws an error", () => {
    const scope = new Scope();
    const test = () => scope.lookup("foo");
    expect(test).toThrowError(ReferenceError);
  });

  describe("immediates", () => {
    it("bind a number variable", () => {
      const scope = new Scope();
      scope.bind("variable", new NumberBinding(42));

      expect(scope.lookup("variable")).not.toThrowError(ReferenceError);
      const binding = scope.lookup("variable");

      expect(binding.type).toBe(BindingType.Number);
      expect(binding.value).toBe(42);
    });

    it("bind a string variable", () => {
      const scope = new Scope();
      scope.bind("variable", new StringBinding("this is a string"));

      expect(scope.lookup("variable")).not.toThrowError(ReferenceError);
      const binding = scope.lookup("variable");

      expect(binding.type).toBe(BindingType.String);
      expect(binding.value).toBe("this is a string");
    });
  });

  it("lookup for a binding traversing the scopes", () => {
    const globalScope = new Scope();
    const innerScope = new Scope(globalScope);

    globalScope.bind("n", new NumberBinding(42));
    innerScope.bind("s", new StringBinding("this is a string"));

    const testInnerScope_n = () => innerScope.lookup("n");
    const testInnerScope_s = () => innerScope.lookup("s");
    expect(testInnerScope_n).not.toThrowError(ReferenceError);
    expect(testInnerScope_s).not.toThrowError(ReferenceError);

    const testGlobalScope_n = () => globalScope.lookup("n");
    const testGlobalScope_s = () => globalScope.lookup("s");
    expect(testGlobalScope_n).not.toThrowError(ReferenceError);
    expect(testGlobalScope_s).toThrowError(ReferenceError);

    const n = innerScope.lookup("n");
    expect(n.type).toBe(BindingType.Number);
    expect(n.value).toBe(42);
  });

  it("inner bindings shadow outer ones", () => {
    const globalScope = new Scope();
    const innerScope = new Scope(globalScope);

    globalScope.bind("n", new NumberBinding(42));
    innerScope.bind("n", new StringBinding("this is a string"));

    const global_n = globalScope.lookup("n");
    expect(global_n.type).toBe(BindingType.Number);
    expect(global_n.value).toBe(42);

    const inner_n = innerScope.lookup("n");
    expect(inner_n.type).toBe(BindingType.String);
    expect(inner_n.value).toBe("this is a string");
  });
});
