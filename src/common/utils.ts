import * as bs58 from 'bs58';

export function processBuffers<T = unknown>(obj: T): any {
  if (!obj) return obj;
  
  if (Buffer.isBuffer(obj) || obj instanceof Uint8Array) {
    return bs58.default.encode(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => processBuffers(item));
  }
  
  if (typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, processBuffers(v)])
    );
  }
  
  return obj;
}

export function readU64LE(bytes: Uint8Array): bigint {
  if (bytes.length !== 8) {
    throw new Error("U64 must be exactly 8 bytes");
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return view.getBigUint64(0, true); // true = little-endian
}
