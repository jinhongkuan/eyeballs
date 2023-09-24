import { SHA256, enc } from "crypto-js";
/**
 * Convert a URL to a 20-byte array compatible with Solidity's address type.
 *
 * @param url The URL to convert
 * @returns A byte array of 20 bytes
 */
export const urlToAddressBytes = (url: string) => {
  // Step 1: Hash the URL using SHA-256
  const hash = SHA256(url);

  // Step 2: Convert WordArray to hexadecimal string
  const hexHash = hash.toString(enc.Hex);

  // Step 3: Truncate to first 40 characters (20 bytes)
  const truncatedHex = hexHash.substring(0, 40);
  
  return `0x${truncatedHex}`;
};
