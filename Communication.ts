import { getRandomPrime } from './data.ts';
import type { Actor } from './Actor.ts';
import type { Interceptor } from './Interceptor.ts';
import type { CommunicationParameters } from './types.d.ts';

export class Communication {

  actor1: Actor;
  actor2: Actor;
  interceptors: Interceptor[];
  communicationParameters: CommunicationParameters;

  constructor (actor1: Actor, actor2: Actor, interceptors: Interceptor[] = []) {
    this.actor1 = actor1;
    this.actor2 = actor2;
    this.interceptors = interceptors;

    this.communicationParameters = {
      // base: 7,
      // modulus: 11,
      base: 109,
      modulus: 431,
      // base: getRandomPrime(),
      // modulus: getRandomPrime(),
    };

    const actor1PublicKey = actor1.calculatePublicKey(this.communicationParameters);
    const actor2PublicKey = actor2.calculatePublicKey(this.communicationParameters);

    for (const interceptor of interceptors) {
      interceptor.interceptData(this.communicationParameters, actor1PublicKey, actor2PublicKey);
    }

    actor1.addCollaboration(actor2, actor2PublicKey, this.communicationParameters);
    actor2.addCollaboration(actor1, actor1PublicKey, this.communicationParameters);
  }

}