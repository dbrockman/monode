import { createHash } from "crypto";

const cache = new Map([
  ["blake2b512", 64],
  ["blake2s256", 32],
  ["md5", 16],
  ["sha1", 20],
  ["sha224", 28],
  ["sha256", 32],
  ["sha3-224", 28],
  ["sha3-256", 32],
  ["sha3-384", 48],
  ["sha3-512", 64],
  ["sha384", 48],
  ["sha512", 64],
]);

export function hashLength(hash: string): number {
  let length = cache.get(hash);
  if (length === undefined) {
    length = createHash(hash).digest().length;
    cache.set(hash, length);
  }
  return length;
}
