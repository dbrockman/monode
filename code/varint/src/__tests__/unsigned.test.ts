import { readUnsignedVarint, unsignedVarintByteLength, writeUnsignedVarint } from "../main";

test("fuzz test", () => {
  for (var i = 0, len = 100; i < len; ++i) {
    const num = randint(0x7fffffff);
    const encoded = [];
    const bytes_written = writeUnsignedVarint(num, encoded, 0);
    expect(encoded.length).toBe(bytes_written);
    expect(bytes_written).toBe(unsignedVarintByteLength(num));
    expect(readUnsignedVarint(encoded, 0)).toEqual({ length: bytes_written, value: num });
  }
});

test("test single byte works as expected", () => {
  const buf = new Uint8Array(2);
  buf[0] = 172;
  buf[1] = 2;
  expect(readUnsignedVarint(buf, 0)).toEqual({ length: 2, value: 300 });
});

test("test encode works as expected", () => {
  const out = [];
  const n_bytes = writeUnsignedVarint(300, out, 0);
  expect(n_bytes).toBe(2);
  expect(out).toEqual([0xac, 0x02]);
});

test("test decode single bytes", () => {
  const num = randint(127);
  const buf = new Uint8Array(1);
  buf[0] = num;
  expect(readUnsignedVarint(buf, 0)).toEqual({ length: 1, value: num });
});

test("test decode multiple bytes with zero", () => {
  const num = randint(127);
  const buf = new Uint8Array(2);
  buf[0] = 128;
  buf[1] = num;
  expect(readUnsignedVarint(buf, 0)).toEqual({ length: 2, value: num << 7 });
});

test("encode single byte", () => {
  const expected = randint(127);
  const arr = [];
  expect(writeUnsignedVarint(expected, arr, 0)).toBe(1);
  expect(arr).toEqual([expected]);
});

test("encode multiple byte with zero first byte", () => {
  const expected = 0x0f00;
  const arr = [];
  expect(writeUnsignedVarint(expected, arr, 0)).toBe(2);
  expect(arr).toEqual([0x80, 0x1e]);
});

test("big integers", () => {
  const bigs: number[] = [];
  for (var i = 32; i <= 53; i++) {
    const n = 2 ** i;
    bigs.push(n - 1, n);
  }

  bigs.forEach((n) => {
    const arr = [];
    writeUnsignedVarint(n, arr, 0);
    const { length, value } = readUnsignedVarint(arr, 0);
    expect(length).toBe(arr.length);
    expect(value).toBe(n);
    expect(value).not.toBe(n - 1);
  });
});

test("fuzz test - big", () => {
  const MAX_INTD = 2 ** 55;
  const MAX_INT = 2 ** 31;
  for (var i = 0, len = 100; i < len; ++i) {
    const expected = randint(MAX_INTD - MAX_INT) + MAX_INT;
    const arr = [];
    writeUnsignedVarint(expected, arr, 0);
    expect(readUnsignedVarint(arr, 0)).toEqual({ length: arr.length, value: expected });
  }
});

test("unsignedVarintByteLength", () => {
  for (var i = 0; i <= 53; i++) {
    const n = 2 ** i;
    const arr = [];
    const count = writeUnsignedVarint(n, arr, 0);
    expect(count).toBe(arr.length);
    expect(unsignedVarintByteLength(n)).toBe(count);
  }
});

test("RangeError", () => {
  const arr = [];
  expect(writeUnsignedVarint(300, arr, 0)).toBe(2);
  expect(arr).toEqual([172, 2]);
  arr.pop();
  expect(() => {
    readUnsignedVarint(arr, 0);
  }).toThrowErrorMatchingInlineSnapshot(`"Could not decode varint"`);
});

function randint(range: number): number {
  return Math.floor(Math.random() * range);
}
