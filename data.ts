import { randomPrime } from 'https://deno.land/x/random_primes/mod.ts';

export function getRandomPrime () {
  // Returns a random 12-bit prime number.
  // NOTE: There seems to be a turning point around 12-bits in how easy it is to crack encryption.
  // NOTE: JavaScript will return an "Uncaught RangeError: Maximum BigInt size exceeded" error if the number is too large. We need to use lower primes than what would actually be safe. Don't ever use JS for creating a safe Diffie-Hellman implementation (Python/C# is better).
  return randomPrime(12, 5);
}

export function* getRandomPrimes () {
  const yieldedPrimes = new Set;

  while (true) {
    let randomPrime: bigint;

    do {
      randomPrime = getRandomPrime();
    } while (yieldedPrimes.has(randomPrime));

    yieldedPrimes.add(randomPrime);

    yield randomPrime;
  }
}
