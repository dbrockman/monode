import { readUnsignedVarint, writeUnsignedVarint, unsignedVarintByteLength } from "@dbrockman/varint";

/**
 * Pack multiple buffers into one buffer. Each buffer is prefixed with a variable length integer denoting the length of the buffer.
 * @param buffers Buffers to pack together.
 */
export function packBuffers(buffers: Iterable<Buffer>): Buffer {
  const bufferArray: Buffer[] = Array.isArray(buffers) ? buffers : [...buffers];
  const packed = Buffer.alloc(packedBufferLength(bufferArray));
  let offset = 0;
  for (const buf of bufferArray) {
    offset += writeUnsignedVarint(buf.length, packed, offset);
    offset += buf.copy(packed, offset);
  }
  return packed;
}

/**
 *
 * @param buffer A packed buffer.
 */
export function unpackBuffers(buffer: Buffer): Buffer[] {
  const unpacked: Buffer[] = [];
  let offset = 0;
  while (offset < buffer.length) {
    const { length, value } = readUnsignedVarint(buffer, offset);
    const start = offset + length;
    const end = start + value;
    offset = end;
    unpacked.push(buffer.slice(start, end));
  }
  return unpacked;
}

/**
 * Returns the byte length of the buffer that would be created by `packBuffers`.
 * This is the sum of the length of all the buffers plus the bytes needed to encode the length of each buffer as a variable length integer.
 * @param buffers A collection of buffers. This can be any type that fulfils the interface `Iterable<Buffer>`.
 */
export function packedBufferLength(buffers: Iterable<Buffer>): number {
  let sum = 0;
  for (const buf of buffers) {
    sum += unsignedVarintByteLength(buf.length) + buf.length;
  }
  return sum;
}

/**
 * Unpack the first buffer from a packed buffer.
 * Returns an object with `head` and `rest` where `head` is the first buffer (unpacked) and `rest` is the rest of the buffers (still packed).
 * @param buffer A packed buffer
 */
export function unpackFirstBuffer(buffer: Buffer): { head: Buffer; rest: Buffer } {
  const { length, value } = readUnsignedVarint(buffer, 0);
  const start = length;
  const end = start + value;
  return { head: buffer.slice(start, end), rest: buffer.slice(end) };
}

export function unpackNthBuffer(index: number, buffer: Buffer): Buffer | undefined {
  let offset = 0;
  let i = 0;
  while (offset < buffer.length) {
    const { length, value } = readUnsignedVarint(buffer, offset);
    const start = offset + length;
    const end = start + value;
    offset = end;
    if (i === index) {
      return buffer.slice(start, end);
    }
    i += 1;
  }
  return;
}
