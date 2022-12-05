import type { SharedSecret } from './types.d.ts';

const { subtle } = crypto;

const te = new TextEncoder();
const td = new TextDecoder();

// Generate an initialization vector (IV) for the PBKDF2 key derivation
// and the AES-256-CBC encryption/decryption.
// The IV is a random value that is used to seed the PBKDF2 algorithm
// and to ensure that the resulting key is unique and unpredictable.
const iv = crypto.getRandomValues(new Uint8Array(16));

async function getKeyFromSecret (sharedSecret: SharedSecret, iv: Uint8Array): Promise<CryptoKey> {
  // First use the shared secret to create a PBKDF2 CryptoKey, using
  // the shared secret as a password.
  const importedKey = await subtle.importKey(
    'raw',
    te.encode(String(sharedSecret)),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey'],
  );

  // Then, turn the PBKDF2 CryptoKey into a 256-bit key that we can use to encrypt
  // and decrypt data using AES-256-CBC.
  const derivedKey = await subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: iv,
      iterations: 100000,
      hash: 'SHA-256',
    },
    importedKey,
    {
      name: 'AES-CBC',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt'],
  );

  return derivedKey;
}

export async function encryptData (data: string, sharedSecret: SharedSecret): Promise<ArrayBuffer> {
  // console.log('Using shared secret number to encrypt data:', sharedSecret);

  // Generate an initialization vector (IV) for the PBKDF2 key derivation.
  // The IV is a random value that is used to seed the PBKDF2 algorithm
  // and to ensure that the resulting key is unique and unpredictable.
  const derivedKey = await getKeyFromSecret(sharedSecret, iv);

  // Encrypt the data using AES encryption with our 256-bit key.
  const encryptedData = await subtle.encrypt(
    {
      name: 'AES-CBC',
      iv,
    },
    derivedKey,
    te.encode(data),
  );

  return encryptedData;
}

export async function decryptData (encryptedData: ArrayBuffer, sharedSecret: SharedSecret): Promise<string> {
  // console.log('Using shared secret number to decrypt data:', sharedSecret);

  const derivedKey = await getKeyFromSecret(sharedSecret, iv);

  const decryptedData = await subtle.decrypt({ name: 'AES-CBC', iv }, derivedKey, encryptedData);

  return td.decode(decryptedData);
}

// export function arrayBufferToHexString (hash: ArrayBuffer): string {
//   const hashArray = Array.from(new Uint8Array(hash));
//   const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
//   return hashHex;
// }