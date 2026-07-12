// Shared between middleware.ts (Edge runtime) and app/actions/auth.ts (Node
// runtime), so this only uses the Web Crypto API (`crypto.subtle`), which is
// available in both — not Node's `crypto` module, which Edge doesn't have.

export const SESSION_COOKIE = "businessos_session";

export async function computeSessionToken(password: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode("businessos-auth"));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
