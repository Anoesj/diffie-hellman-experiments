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

    console.log(`Creating communication line between ${actor1.name} and ${actor2.name}. Interceptors:`, interceptors.map(i => i.name));

    this.communicationParameters = {
      // base: 109,
      // modulus: 431,
      base: getRandomPrime(),
      modulus: getRandomPrime(),
    };

    console.log(`Actors agreed upon the following communication parameters:`, this.communicationParameters);

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
      throw new Error('Cannot send message to self');
    }

    console.log(`[${sendingActor.name} -> ${receivingActor.name}] Transferring encrypted message`);

    for (const interceptor of this.interceptors) {
      await interceptor.interceptData(encryptedData, this, sendingActor, receivingActor);
    }

    await receivingActor.receiveData(encryptedData, sendingActor);
  }

}