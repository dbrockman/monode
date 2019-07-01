import { main } from "../main";

test("@dbrockman/temp-test-pkg", () => {
  expect(main()).toBe("hello world");
});
