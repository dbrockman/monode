import { createHmac, timingSafeEqual } from "crypto";
import { packBuffers, unpackBuffers, unpackFirstBuffer } from "./main";

/**
 * Pack multiple buffers into one, just like `packBuffers` but will also prepend a message digest to the result.
 * @param buffers Buffers to pack together.
 * @param hashFunc A hash function used to create the message digest. Could for example call `crypto.createHmac()`. Takes the packed buffer as input and should return the digest as a buffer.
 */
export function packBuffersWithMessageDigest(buffers: Iterable<Buffer>, hashFunc: (payload: Buffer) => Buffer): Buffer {
  const data = packBuffers(buffers);
  const dgst = packBuffers([hashFunc(data)]);
  return Buffer.concat([dgst, data], dgst.length + data.length);
}

export function verifyBuffersWithMessageDigest(buffer: Buffer, hashFunc: (payload: Buffer) => Buffer): Buffer {
  const { head, rest } = unpackFirstBuffer(buffer);
  const dgst = hashFunc(rest);
  if (head.length === dgst.length && timingSafeEqual(head, dgst)) {
    return rest;
  }
  throw new Error("Message digest mismatch");
}

export function unpackBuffersWithMessageDigest(buffer: Buffer, hashFunc: (payload: Buffer) => Buffer): Buffer[] {
  return unpackBuffers(verifyBuffersWithMessageDigest(buffer, hashFunc));
}

/**
 * Pack multiple buffers into one, just like `packBuffers` but will also prepend a HMAC message digest to the result.
 * @param buffers Buffers to pack together.
 * @param alg Algorithm passed to `crypto.createHmac`
 * @param key Key passed to `crypto.createHmac`
 */
export function packBuffersWithHmac(
  buffers: Iterable<Buffer>,
  alg: string,
  key: string | Buffer | NodeJS.TypedArray | DataView,
): Buffer {
  return packBuffersWithMessageDigest(buffers, (data) => hmac(alg, key, data));
}

export function verifyBuffersWithHmac(
  buffer: Buffer,
  alg: string,
  key: string | Buffer | NodeJS.TypedArray | DataView,
): Buffer {
  return verifyBuffersWithMessageDigest(buffer, (data) => hmac(alg, key, data));
}

export function unpackBuffersWithHmac(
  buffer: Buffer,
  alg: string,
  key: string | Buffer | NodeJS.TypedArray | DataView,
): Buffer[] {
  return unpackBuffers(verifyBuffersWithHmac(buffer, alg, key));
}

function hmac(alg: string, key: string | Buffer | NodeJS.TypedArray | DataView, data: Buffer): Buffer {
  return createHmac(alg, key)
    .update(data)
    .digest();
}
