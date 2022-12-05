import { getRandomPrime } from './data.ts';
import type { Actor } from './Actor.ts';
import type { Interceptor } from './Interceptor.ts';
import type { CommunicationParameters, PublicKey } from './types.d.ts';

export class Communication {

  actor1: Actor;
  actor2: Actor;
  actor1PublicKey: PublicKey;
  actor2PublicKey: PublicKey;
  interceptors: Interceptor[];
  communicationParameters: CommunicationParameters;

  constructor (actor1: Actor, actor2: Actor, interceptors: Interceptor[] = []) {
    this.actor1 = actor1;
    this.actor2 = actor2;
    this.interceptors = interceptors;

    this.communicationParameters = {
      base: 7,
      modulus: 11,
      // base: 109,
      // modulus: 431,
      // base: getRandomPrime(),
      // modulus: getRandomPrime(),
    };

    this.actor1PublicKey = actor1.calculatePublicKey(this.communicationParameters);
    this.actor2PublicKey = actor2.calculatePublicKey(this.communicationParameters);

    for (const interceptor of interceptors) {
      interceptor.interceptKeyExchangeData(this);
    }

    actor1.addCollaboration(actor2, this.actor2PublicKey, this);
    actor2.addCollaboration(actor1, this.actor1PublicKey, this);
  }

  async send (encryptedData: ArrayBuffer, receivingActor: Actor, sendingActor: Actor) {
    if (
      !(this.actor1 === receivingActor && this.actor2 === sendingActor)
      && !(this.actor1 === sendingActor && this.actor2 === receivingActor)
    ) {
      throw new Error('Communication does not involve the given actors');
    }

    if (receivingActor === sendingActor) {
      throw new Error('Cannot send data to self');
    }

    for (const interceptor of this.interceptors) {
      await interceptor.interceptData(encryptedData, this, sendingActor, receivingActor);
    }

    await receivingActor.receiveData(encryptedData, sendingActor);
  }

}