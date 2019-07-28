import { hashLength } from "../main";

test("@dbrockman/hash-length", () => {
  expect(hashLength("sha256")).toBe(32);
  expect(() => hashLength("invalid-name")).toThrow("Digest method not supported");
});
