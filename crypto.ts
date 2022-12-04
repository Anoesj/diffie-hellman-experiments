// import * as mod from 'https://deno.land/std/crypto/mod.ts';
import type { SharedSecret } from './types.d.ts';

const iv = crypto.getRandomValues(new Uint8Array(16));
const te = new TextEncoder();
const td = new TextDecoder();

export async function encryptData (data: string, sharedSecret: SharedSecret): Promise<string> {
  const { subtle } = crypto;

  // Turn shared secret into a 256-bit key.
  const hashBuffer = await subtle.digest('SHA-256', te.encode(String(sharedSecret)));
  // const hashHex = arrayBufferToHexString(hashBuffer);

  const key = await subtle.importKey('raw', hashBuffer, 'AES-CBC', false, ['encrypt', 'decrypt']);
  // const key = await subtle.importKey('raw', te.encode(hashHex), 'AES-CBC', false, ['encrypt', 'decrypt']);

  // Encrypt the data using AES encryption with our 256-bit key.
  const encryptedData = await subtle.encrypt({ name: 'AES-CBC', iv }, key, te.encode(data));

  return arrayBufferToHexString(encryptedData);
}

export async function decryptData (encryptedData: string, sharedSecret: SharedSecret): Promise<string> {
  const { subtle } = crypto;

  // Turn shared secret into a 256-bit key.
  const hashBuffer = await subtle.digest('SHA-256', te.encode(String(sharedSecret)));

  const key = await subtle.importKey('raw', hashBuffer, 'AES-CBC', false, ['encrypt', 'decrypt']);

  // Decrypt the data using AES encryption with our 256-bit key.
  const decryptedData = await subtle.decrypt({ name: 'AES-CBC', iv }, key, te.encode(encryptedData));

  return td.decode(decryptedData);
}

function arrayBufferToHexString (hash: ArrayBuffer): string {
  const hashArray = Array.from(new Uint8Array(hash));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}