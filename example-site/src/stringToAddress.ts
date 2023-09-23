
import crypto from 'crypto';

/**
 * Convert a URL to a 20-byte array compatible with Solidity's address type.
 * 
 * @param url The URL to convert
 * @returns A byte array of 20 bytes
 */
export const urlToAddressBytes = (url: string): Buffer => {
  // Step 1: Hash the URL using SHA-256
  const hash = crypto.createHash('sha256').update(url).digest();

  // Step 2: Take the first 20 bytes to fit into a Solidity address type
  const addressBytes = hash.slice(0, 20);

  return addressBytes;
}

