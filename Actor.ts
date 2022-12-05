import type { Communication } from './Communication.ts';
import { encryptData, decryptData } from './crypto.ts';
import type { CommunicationParameters, PrivateKey, PublicKey, SharedSecret } from './types.d.ts';

export class Actor {

  name: string;

  #privateKey: PrivateKey;

  #collaborations: {
    actor: Actor;
    publicKey: PublicKey;
    communication: Communication;
    sharedSecret: SharedSecret;
  }[] = [];

  constructor (name: string, privateKey: PrivateKey) {
    this.name = name;
    this.#privateKey = privateKey;
  }

  log (msg: string, ...args: unknown[]) {
    console.log(`[${this.name}] ${msg}`, ...args);
  }

  calculatePublicKey (communicationParameters: CommunicationParameters): PublicKey {
    return communicationParameters.base ** this.#privateKey % communicationParameters.modulus;
  }

  addCollaboration (actor: Actor, actorPublicKey: PublicKey, communication: Communication) {
    const collaboration = {
      actor,
      publicKey: actorPublicKey,
      communication,
      sharedSecret: this.calculateSharedSecret(actorPublicKey, communication.communicationParameters),
    };

    this.log(`Added collaboration:`, collaboration);

    this.#collaborations.push(collaboration);
  }

  calculateSharedSecret (actorPublicKey: PublicKey, communicationParameters: CommunicationParameters): SharedSecret {
    return actorPublicKey ** this.#privateKey % communicationParameters.modulus;
  }

  async sendData (data: string, actor: Actor) {
    this.log(`Sending to ${actor.name}: “${data}”`);
    const collaboration = this.#collaborations.find(collaboration => collaboration.actor === actor)!;
    const { sharedSecret } = collaboration;
    const encryptedData = await encryptData(data, sharedSecret);
    await collaboration.communication.send(encryptedData, actor, this);
  }

  async receiveData (encryptedData: ArrayBuffer, actor: Actor) {
    this.log(`Received encrypted data from ${actor.name}`);
    const collaboration = this.#collaborations.find(collaboration => collaboration.actor === actor)!;
    const { sharedSecret } = collaboration;
    const data = await decryptData(encryptedData, sharedSecret);
    this.log(`Decrypted data from ${actor.name}: “${data}”`);
    return data;
  }

}