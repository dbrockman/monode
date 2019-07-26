import { packedBufferLength } from "../main";

describe("packedBufferLength", () => {
  describe("with an empty buffer", () => {
    it("needs one byte to encode the 0 needed to describe the length of the empty buffer", () => {
      const buf = Buffer.alloc(0);
      expect(packedBufferLength([buf])).toBe(1);
    });
  });

  describe("with a buffer of length 127", () => {
    it("needs one byte to encode the length of the buffer and another 127 bytes for the buffer", () => {
      const buf = Buffer.alloc(127);
      expect(packedBufferLength([buf])).toBe(1 + 127);
    });
  });

  describe("with a buffer of length 128", () => {
    it("needs two bytes to encode the length of the buffer and another 128 bytes for the buffer", () => {
      const buf = Buffer.alloc(128);
      expect(packedBufferLength([buf])).toBe(2 + 128);
    });
  });

  test("that the returned number matches the length of the packed buffer", () => {
    expect(packedBufferLength([Buffer.alloc(127)])).toBe(1 + 127);
    expect(packedBufferLength([Buffer.alloc(128)])).toBe(2 + 128);
  });
});
