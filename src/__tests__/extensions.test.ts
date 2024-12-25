import { toBeToken } from "./extensions";
import { IdentifierToken, OpenParenthesisToken } from "../Token";

describe("extensions", () => {
  describe("toBeToken", () => {
    it("fails when input is not a Token at all", () => {
      expect(toBeToken("not-a-token", IdentifierToken).pass).toBe(false);
    });

    it("fails when input is the wrong instance of a Token", () => {
      expect(toBeToken(new OpenParenthesisToken(), IdentifierToken).pass).toBe(false);
    });

    it("passes when input is the correct instance of a Token", () => {
      expect(toBeToken(new OpenParenthesisToken(), OpenParenthesisToken).pass).toBe(true);
    });

    it("fails when input is the correct instance of a Token but with wrong value", () => {
      expect(toBeToken(new IdentifierToken("define"), IdentifierToken, "cond").pass).toBe(false);
    });

    it("passes when input is the correct instance of a Token and value", () => {
      expect(toBeToken(new IdentifierToken("define"), IdentifierToken, "define").pass).toBe(true);
    });
  });
});
