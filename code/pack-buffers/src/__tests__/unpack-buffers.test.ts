import { packBuffers, unpackBuffers } from "../main";

describe("unpackBuffers", () => {
  test("with two buffers packed together", () => {
    const packed = packBuffers([Buffer.from("beef", "hex"), Buffer.from("cafe", "hex")]);
    const unpacked = unpackBuffers(packed);
    const hex = unpacked.map((buf) => buf.toString("hex"));
    expect(hex).toEqual(["beef", "cafe"]);
  });

  test("with an empty buffer", () => {
    const empty = Buffer.alloc(0);
    const unpacked = unpackBuffers(empty);
    expect(unpacked).toEqual([]);
  });
});
