import { readSignedVarint, signedVarintByteLength, writeSignedVarint } from "../main";

function encodeDecode(v: number, bytes: number) {
  const a = [];
  const c = writeSignedVarint(v, a, 0);
  expect(a.length).toBe(bytes);
  expect(readSignedVarint(a, 0)).toEqual({ length: bytes, value: v });
  expect(c).toBe(bytes);
  expect(signedVarintByteLength(v)).toBe(bytes);
}

test("single byte", () => {
  encodeDecode(1, 1);
  encodeDecode(-1, 1);
  encodeDecode(63, 1);
  encodeDecode(-64, 1);
});
test("double byte", () => {
  encodeDecode(64, 2);
  encodeDecode(-65, 2);
  encodeDecode(127, 2);
  encodeDecode(-128, 2);
  encodeDecode(128, 2);
  encodeDecode(-129, 2);
  encodeDecode(255, 2);
  encodeDecode(-256, 2);
});
test("tripple", () => {
  encodeDecode(0x4000, 3);
  encodeDecode(-0x4001, 3);
  encodeDecode(1048574, 3);
  encodeDecode(-1048575, 3);
});

test("quad", () => {
  encodeDecode(134217726, 4);
  encodeDecode(-134217727, 4);
});

test("large int", () => {
  encodeDecode(0x80000000000, 7);
  encodeDecode(-0x80000000000, 7);
});
