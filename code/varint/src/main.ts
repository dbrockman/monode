const N1 = 2 ** 7;
const N2 = 2 ** 14;
const N3 = 2 ** 21;
const N4 = 2 ** 28;
const N5 = 2 ** 35;
const N6 = 2 ** 42;
const N7 = 2 ** 49;
const N8 = 2 ** 56;
const N9 = 2 ** 63;

const MSB = 0x80;
const REST = 0x7f;
const MSBALL = ~REST;
const INT = 2 ** 31;

// const U32_MAX = 0xffffffff;
// const I32_MAX = 0x7fffffff;

export function unsignedVarintByteLength(value: number): number {
  return value < N1
    ? 1
    : value < N2
    ? 2
    : value < N3
    ? 3
    : value < N4
    ? 4
    : value < N5
    ? 5
    : value < N6
    ? 6
    : value < N7
    ? 7
    : value < N8
    ? 8
    : value < N9
    ? 9
    : 10;
}

export function writeUnsignedVarint(value: number, target: Buffer | Uint8Array | number[], offset: number): number {
  let i = offset;
  while (value >= INT) {
    target[i++] = (value & 0xff) | MSB;
    value /= 128;
  }
  while (value & MSBALL) {
    target[i++] = (value & 0xff) | MSB;
    value >>>= 7;
  }
  target[i] = value | 0;
  return i - offset + 1;
}

export interface ReadRecord {
  length: number;
  value: number;
}

export function readUnsignedVarint(data: Buffer | Uint8Array | number[], offset: number): ReadRecord {
  let value = 0;
  let shift = 0;
  let i = offset;
  let b = 0;
  do {
    if (i >= data.length) {
      throw new RangeError("Could not decode varint");
    }
    b = data[i++];
    value += shift < 28 ? (b & REST) << shift : (b & REST) * 2 ** shift;
    shift += 7;
  } while (b >= MSB);
  return { length: i - offset, value };
}

export function signedVarintByteLength(value: number): number {
  return unsignedVarintByteLength(value >= 0 ? value * 2 : value * -2 - 1);
}

export function writeSignedVarint(value: number, target: Buffer | number[], offset: number): number {
  return writeUnsignedVarint(value >= 0 ? value * 2 : value * -2 - 1, target, offset);
}

export function readSignedVarint(data: Buffer | number[], offset: number): ReadRecord {
  let { length, value } = readUnsignedVarint(data, offset);
  value = value & 1 ? (value + 1) / -2 : value / 2;
  return { length, value };
}
