import { primes } from './data.ts';

export type Prime = typeof primes[number];
export type PrivateKey = Prime;
export type PublicKey = number;
export type SharedSecret = number;
export type CommunicationParameters = {
  base: Prime;
  modulus: Prime;
};
