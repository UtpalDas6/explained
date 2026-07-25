// FNV-1a: small inputs that differ by one character (e.g. "node-a" vs "node-b")
// still diffuse to unrelated outputs, unlike a naive polynomial rolling hash.
export function hashString(str) {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}
