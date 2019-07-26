import { packBuffers, unpackFirstBuffer } from "../main";

const fromStr = (str: string) => Buffer.from(str, "utf8");

describe("unpackFirstBuffer", () => {
  test("when the packed buffer contains multiple buffers", () => {
    const a = fromStr("hello");
    const b = fromStr("world");
    const c = packBuffers([a, b]);
    const first = unpackFirstBuffer(c);
    expect(first.head.toString("utf8")).toBe("hello");
    expect(first.rest.toString("hex")).toBe(packBuffers([b]).toString("hex"));
    const second = unpackFirstBuffer(first.rest);
    expect(second.head.toString("utf8")).toBe("world");
    expect(second.rest.length).toBe(0);
  });

  test("when the packed buffer contains one buffer", () => {
    const { head, rest } = unpackFirstBuffer(packBuffers([fromStr("hello")]));
    expect(head.toString("utf8")).toBe("hello");
    expect(rest.length).toBe(0);
  });

  test("when the packed buffer contains one empty buffer", () => {
    const { head, rest } = unpackFirstBuffer(packBuffers([Buffer.alloc(0)]));
    expect(head.length).toBe(0);
    expect(rest.length).toBe(0);
  });
});
