import { Actor } from './Actor.ts';
import { decryptData } from './crypto.ts';
import { primes } from './data.ts';
import type { CommunicationParameters, PrivateKey, PublicKey, SharedSecret } from './types.d.ts';
import type { Communication } from './Communication.ts';

type PossibleKeyCombination = {
  sharedSecret: SharedSecret;
  privateKeyActor1: PrivateKey;
  privateKeyActor2: PrivateKey;
};

export class Interceptor extends Actor {

  interceptedCommunications: Map<Communication, {
    possibleKeyCombinations: PossibleKeyCombination[];
    workingKeyCombination?: PossibleKeyCombination;
  }> = new Map;

  interceptKeyExchangeData (communication: Communication) {
    const {
      communicationParameters,
      actor1PublicKey,
      actor2PublicKey,
    } = communication;

    // This is what an interceptor would see if he intercepted the initial communication
    // between two actors. Since both actors calculate a shared secret on their ends,
    // an interceptor cannot just intercept the shared secret itself.
    this.log('Intercepted key exchange data:', {
      communicationParameters,
      actor1PublicKey,
      actor2PublicKey,
    });

    const { base, modulus } = communicationParameters;

    const possiblePrivateKeysActor1 = this.calculatePossiblePrivateKeys(actor1PublicKey, base, modulus);
    const possiblePrivateKeysActor2 = this.calculatePossiblePrivateKeys(actor2PublicKey, base, modulus);

    this.log('Determining possible private keys per actor:', {
      possiblePrivateKeysActor1,
      possiblePrivateKeysActor2,
    });

    const possibleKeyCombinations = this.calculatePossibleKeyCombinations(
      communicationParameters,
      actor1PublicKey,
      actor2PublicKey,
      possiblePrivateKeysActor1,
      possiblePrivateKeysActor2,
    );

    this.log('Calculated possible key combinations', possibleKeyCombinations);

    this.interceptedCommunications.set(communication, {
      possibleKeyCombinations,
    });
  }

  async interceptData (
    encryptedData: ArrayBuffer,
    communication: Communication,
    receivingActor: Actor,
    sendingActor: Actor,
  ) {
    // This is what an interceptor would see if he intercepted data sent between two actors.
    this.log('Intercepted data:', {
      receivingActor,
      sendingActor,
      encryptedData,
    });

    const interceptedCommunicationData = this.interceptedCommunications.get(communication);

    if (!interceptedCommunicationData) {
      throw new Error('No intercepted communication data found');
    }

    if (interceptedCommunicationData.workingKeyCombination) {
      const data = await decryptData(encryptedData, interceptedCommunicationData.workingKeyCombination.sharedSecret);
      this.log(`Decrypted data sent from ${sendingActor.name} to ${receivingActor.name}: “${data}”`);
      return;
    }

    for (const possibleKeyCombination of interceptedCommunicationData.possibleKeyCombinations) {
      this.log('Trying to decrypt data with possible key combination', possibleKeyCombination);

      try {
        const data = await decryptData(encryptedData, possibleKeyCombination.sharedSecret);
        this.log(`Cracket encryption! Decrypted data sent from ${sendingActor.name} to ${receivingActor.name}: “${data}”`);
        interceptedCommunicationData.workingKeyCombination = possibleKeyCombination;
        break;
      }
      catch {
        // If decryption fails, it's not the right combination.
      }
    }
  }

  calculatePossiblePrivateKeys (
    actorPublicKey: PublicKey,
    base: CommunicationParameters['base'],
    modulus: CommunicationParameters['modulus'],
  ): PrivateKey[] {
    const possiblePrivateKeysActor: PrivateKey[] = [];

    // Guess what the private key of the other actor is by calculating public keys
    // with random primes as private keys.
    for (const prime of primes) {
      if (base ** prime % modulus === actorPublicKey) {
        possiblePrivateKeysActor.push(prime);
      }
    }

    return possiblePrivateKeysActor;
  }

  calculatePossibleKeyCombinations (
    communicationParameters: CommunicationParameters,
    actor1PublicKey: PublicKey,
    actor2PublicKey: PublicKey,
    possiblePrivateKeysActor1: PrivateKey[],
    possiblePrivateKeysActor2: PrivateKey[],
  ): PossibleKeyCombination[] {
    const possibleCombinations: PossibleKeyCombination[] = [];

    for (const possiblePrivateKeyActor1 of possiblePrivateKeysActor1) {
      for (const possiblePrivateKeyActor2 of possiblePrivateKeysActor2) {
        const sharedSecret1 = actor2PublicKey ** possiblePrivateKeyActor1 % communicationParameters.modulus;
        const sharedSecret2 = actor1PublicKey ** possiblePrivateKeyActor2 % communicationParameters.modulus;

        // If calculated shared secrets match, it's possible this shared secret
        // is used to encrypt and decrypt data between actor 1 and 2. Also, we
        // can guess the private keys of both actors if shared secrets match.
        if (sharedSecret1 === sharedSecret2) {
          possibleCombinations.push({
            sharedSecret: sharedSecret1,
            privateKeyActor1: possiblePrivateKeyActor1,
            privateKeyActor2: possiblePrivateKeyActor2,
          });
        }
      }
    }

    return possibleCombinations;
  }

}