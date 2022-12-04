import { Actor } from './Actor.ts';
import type { CommunicationParameters, PublicKey } from './types.d.ts';

export class Interceptor extends Actor {

  interceptData (
    communicationParameters: CommunicationParameters,
    actor1PublicKey: PublicKey,
    actor2PublicKey: PublicKey,
  ) {
    // This is what an interceptor would see if he intercepted the initial communication
    // between two actors. Since both actors calculate a shared secret on their ends,
    // an interceptor cannot just intercept the shared secret itself.
    this.log('Intercepted data:', {
      communicationParameters,
      actor1PublicKey,
      actor2PublicKey,
    });

    const { base, modulus } = communicationParameters;

    const possiblePrivateKeysActor1 = this.calculatePossiblePrivateKeys(actor2PublicKey, base, modulus);
    const possiblePrivateKeysActor2 = this.calculatePossiblePrivateKeys(actor1PublicKey, base, modulus);

    // console.log({ possiblePrivateKeysActor1, possiblePrivateKeysActor2 });

    const possibleCombinations = this.calculatePossibleKeyCombinations(
      communicationParameters,
      actor1PublicKey,
      actor2PublicKey,
      possiblePrivateKeysActor1,
      possiblePrivateKeysActor2,
    );

    this.log('Calculated possible key combinations', possibleCombinations);
  }

  calculatePossiblePrivateKeys (
    otherActorPublicKey: number,
    base: number,
    modulus: number,
  ): number[] {
    const possiblePrivateKeysActor: number[] = [];

    for (let i = 2; i < 500; i++) {
      if (base ** i % modulus === otherActorPublicKey) {
        possiblePrivateKeysActor.push(i);
      }
    }

    return possiblePrivateKeysActor;
  }

  calculatePossibleKeyCombinations (
    communicationParameters: CommunicationParameters,
    actor1PublicKey: PublicKey,
    actor2PublicKey: PublicKey,
    possiblePrivateKeysActor1: number[],
    possiblePrivateKeysActor2: number[],
  ) {
    const possibleCombinations = [];

    for (const possiblePrivateKeyBob of possiblePrivateKeysActor1) {
      for (const possiblePrivateKeyAlice of possiblePrivateKeysActor2) {
        const sharedSecret1 = actor2PublicKey ** possiblePrivateKeyAlice % communicationParameters.modulus;
        const sharedSecret2 = actor1PublicKey ** possiblePrivateKeyBob % communicationParameters.modulus;

        if (sharedSecret1 === sharedSecret2) {
          // possibleSharedSecrets.push(sharedSecret1);
          possibleCombinations.push({
            sharedSecret: sharedSecret1,
            privateKeyBob: possiblePrivateKeyBob,
            privateKeyAlice: possiblePrivateKeyAlice,
          });
        }
      }
    }

    return possibleCombinations;
  }

}