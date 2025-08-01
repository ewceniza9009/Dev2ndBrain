import type { EncryptedData } from '../types';

const ALGORITHM = 'AES-GCM';
const a2b = (str: string) => Uint8Array.from(atob(str), c => c.charCodeAt(0));
const b2a = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf)));

const secretKey = new TextEncoder().encode('a-very-secret-32-byte-long-key!');

async function getCryptoKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.importKey('raw', secretKey, { name: ALGORITHM }, false, ['encrypt', 'decrypt']);
}

export async function encryptToken(token: string): Promise<EncryptedData> {
  const key = await getCryptoKey();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encodedToken = new TextEncoder().encode(token);

  const encryptedBuffer = await window.crypto.subtle.encrypt({ name: ALGORITHM, iv }, key, encodedToken);

  return {
    iv: b2a(iv),
    encryptedToken: b2a(encryptedBuffer),
  };
}

export async function decryptToken(encryptedData: EncryptedData): Promise<string> {
  const key = await getCryptoKey();
  const iv = a2b(encryptedData.iv);
  const encryptedToken = a2b(encryptedData.encryptedToken);

  const decryptedBuffer = await window.crypto.subtle.decrypt({ name: ALGORITHM, iv }, key, encryptedToken);

  return new TextDecoder().decode(decryptedBuffer);
}