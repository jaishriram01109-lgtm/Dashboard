// Pure browser TOTP — no external dependency, uses Web Crypto API
// RFC 6238 / RFC 4226 compliant

function base32Decode(str: string): Uint8Array {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const clean = str.toUpperCase().replace(/\s+/g, "").replace(/=/g, "");
  let bits = 0, value = 0;
  const output: number[] = [];
  for (const ch of clean) {
    const idx = alphabet.indexOf(ch);
    if (idx < 0) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return new Uint8Array(output);
}

export async function computeTOTP(base32Secret: string): Promise<string> {
  const keyBytes = base32Decode(base32Secret);
  if (!keyBytes.length) return "";
  // Copy bytes into a fresh ArrayBuffer (TypeScript requires ArrayBuffer, not SharedArrayBuffer)
  const key = new ArrayBuffer(keyBytes.length);
  new Uint8Array(key).set(keyBytes);
  const counter = Math.floor(Date.now() / 1000 / 30);
  const buf = new ArrayBuffer(8);
  new DataView(buf).setUint32(4, counter, false);
  const cryptoKey = await crypto.subtle.importKey(
    "raw", key, { name: "HMAC", hash: "SHA-1" }, false, ["sign"]
  );
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, buf));
  const off = sig[sig.length - 1] & 0xf;
  const code =
    ((sig[off]     & 0x7f) << 24) |
    ((sig[off + 1] & 0xff) << 16) |
    ((sig[off + 2] & 0xff) << 8)  |
     (sig[off + 3] & 0xff);
  return String(code % 1_000_000).padStart(6, "0");
}

// Seconds remaining until current TOTP period expires
export function totpSecondsLeft(): number {
  return 30 - (Math.floor(Date.now() / 1000) % 30);
}
